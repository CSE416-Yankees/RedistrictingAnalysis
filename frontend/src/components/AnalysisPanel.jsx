import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  ErrorBar,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './AnalysisPanel.css';

const EMPTY_LIST = [];
// Chart sizes are tuned so each analysis tab fills the now full-width
// workspace with very little blank space below the chart canvas.
const ANALYSIS_CHART_HEIGHT = 520;
// Gingles shares vertical space with a paginated table, so its chart is
// shorter than the other analysis tabs.
const GINGLES_CHART_HEIGHT = 260;
const EI_CHART_HEIGHT = 380;
const MINORITY_EFFECTIVENESS_CHART_HEIGHT = 440;
const MINORITY_HISTOGRAM_CHART_HEIGHT = 440;
const RANGE_BAR_CHART_HEIGHT = 360;
const GINGLES_PRECINCT_PAGE_SIZE = 8;
const GINGLES_TABLE_PAGE_SIZE = 8;
const PAGE_WINDOW_SIZE = 5;

function eiPayloadRevision(payload) {
  const results = payload?.candidateResults;
  if (!results || typeof results !== 'object') return 'empty';
  return Object.keys(results).sort().join('|');
}

const ENSEMBLE_LABELS = {
  raceBlind: 'Race-Blind',
  vra: 'VRA Constrained',
  RB: 'Race-Blind',
  VRA: 'VRA Constrained',
};

export default function AnalysisPanel({
  ensembleType,
  onEnsembleTypeChange,
  analysisView,
  stateData,
  guiPayloads,
  isSummaryLoading,
  summaryError,
  highlightedDistrict,
  onHighlightDistrict,
  feasibleGroups,
  inlineHeatmapGroup,
  onToggleInlineHeatmap,
}) {
  const [highlightedGinglesPrecinct, setHighlightedGinglesPrecinct] = useState(null);

  if (!guiPayloads) {
    return (
      <div className="analysis-panel">
        <div className="analysis-panel__empty">No GUI payload data is available for this state yet.</div>
      </div>
    );
  }

  const MAP_ONLY_VIEWS = new Set(['currentPlanMap', 'demographicHeatMap', 'planComparisonMap', 'interestingPlanMap']);
  if (MAP_ONLY_VIEWS.has(analysisView)) {
    return (
      <div className="analysis-panel">
        <div className="analysis-panel__empty">
          This route is map-focused. Adjust plan, color, and group controls above the map, or choose another analysis view.
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-panel">
      {analysisView === 'stateSummary' && (
        <StateSummaryCard
          payload={guiPayloads.stateSummary}
          stateData={stateData}
          isLoading={isSummaryLoading}
          error={summaryError}
          feasibleGroups={feasibleGroups}
          inlineHeatmapGroup={inlineHeatmapGroup}
          onToggleInlineHeatmap={onToggleInlineHeatmap}
        />
      )}
      {analysisView === 'districtDetails' && (
        <DistrictRepresentationTable
          payload={guiPayloads.districtDetails}
          highlightedDistrict={highlightedDistrict}
          onHighlightDistrict={onHighlightDistrict}
        />
      )}
      {analysisView === 'boxWhisker' && (
        <BoxWhiskerChart
          payload={guiPayloads.boxWhisker}
          ensembleType={ensembleType}
          onEnsembleTypeChange={onEnsembleTypeChange}
        />
      )}
      {analysisView === 'ensembleSplits' && (
        <EnsembleSplitsChart
          payload={guiPayloads.ensembleSplits}
          summaryPayload={guiPayloads.stateSummary}
          selectedEnsembleType={ensembleType}
          onEnsembleTypeChange={onEnsembleTypeChange}
        />
      )}
      {analysisView === 'vraImpact' && (
        <VraImpactThresholdTable
          payload={guiPayloads.vraImpactThresholds}
        />
      )}
      {analysisView === 'minorityEffectivenessBox' && (
        <MinorityEffectivenessBoxChart
          payload={guiPayloads.minorityEffectivenessBox}
        />
      )}
      {analysisView === 'minorityEffectivenessHistogram' && (
        <MinorityEffectivenessHistogram
          payload={guiPayloads.minorityEffectivenessHistogram}
        />
      )}
      {analysisView === 'minorityRangeBars' && (
        <MinorityRangeBarCharts
          payload={guiPayloads.minorityRangeBars}
        />
      )}
      {analysisView === 'gingles' && (
        <GinglesSummary
          payload={guiPayloads.ginglesResults}
          tablePayload={guiPayloads.ginglesTable}
          highlightedPrecinct={highlightedGinglesPrecinct}
          onSelectPrecinct={setHighlightedGinglesPrecinct}
        />
      )}
      {analysisView === 'eiCandidates' && (
        <EICandidateResults
          key={`${stateData.abbr}-${eiPayloadRevision(guiPayloads.eiCandidates)}`}
          payload={guiPayloads.eiCandidates}
        />
      )}
    </div>
  );
}

const HEATMAP_TOGGLE_ROW_GROUPS = ['Black', 'Hispanic', 'Asian'];
const HEATMAP_GROUP_VALUE = {
  Black: 'black',
  Hispanic: 'hispanic',
  Asian: 'asian',
};

function StateSummaryCard({
  payload,
  stateData,
  isLoading,
  error,
  feasibleGroups,
  inlineHeatmapGroup,
  onToggleInlineHeatmap,
}) {
  if (isLoading) {
    return (
      <ChartCard title="State Data Summary" subtitle="Population, demographics, party control, statewide vote, and representation">
        <p className="analysis-note">Loading state summary...</p>
      </ChartCard>
    );
  }

  if (!payload) {
    return (
      <ChartCard title="State Data Summary" subtitle="Population, demographics, party control, statewide vote, and representation">
        <p className="analysis-note">{error || 'State summary is currently unavailable.'}</p>
      </ChartCard>
    );
  }

  const summary = normalizeStateSummary(payload, stateData);
  // `feasibleGroups` is null/undefined when every group meets the threshold.
  const allowedHeatmapGroups = feasibleGroups ? new Set(feasibleGroups) : null;
  const canToggleHeatmap = typeof onToggleInlineHeatmap === 'function';

  return (
    <ChartCard title="State Data Summary" subtitle="Population, demographics, party control, statewide vote, and ensemble availability">
      <div className="analysis-kpi-grid">
        <Kpi label="Population" value={formatNumber(summary.population)} />
        <Kpi label="Congressional Districts" value={summary.congressionalDistricts} />
        <Kpi label="Democratic Vote" value={formatPct(summary.demVotePct, 1)} />
        <Kpi label="Republican Vote" value={formatPct(summary.repVotePct, 1)} />
        <Kpi label="Democratic Seats" value={summary.demSeats} />
        <Kpi label="Republican Seats" value={summary.repSeats} />
      </div>

      <div className="analysis-summary-grid">
        <div className="analysis-summary-card">
          <span className="analysis-summary-card__label">Congressional Representatives by Party</span>
          <span className="analysis-summary-card__value">Dem: {summary.demSeats} - Rep: {summary.repSeats}</span>
        </div>
        <div className="analysis-summary-card">
          <span className="analysis-summary-card__label">Party Control of Redistricting Process</span>
          <span className="analysis-summary-card__value">{summary.redistrictingControl}</span>
        </div>
      </div>

      <div className="analysis-voter-dist">
        <span className="analysis-voter-dist__label">State Voter Distribution (2024 Presidential estimate)</span>
        <div className="analysis-voter-dist__bar">
          <div className="analysis-voter-dist__segment analysis-voter-dist__segment--dem" style={{ width: `${summary.demVotePct}%` }} />
          <div className="analysis-voter-dist__segment analysis-voter-dist__segment--rep" style={{ width: `${summary.repVotePct}%` }} />
        </div>
        <div className="analysis-voter-dist__values">
          <span>Dem {summary.demVotePct.toFixed(1)}%</span>
          <span>Rep {summary.repVotePct.toFixed(1)}%</span>
        </div>
      </div>

      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--compact">
          <thead>
            <tr>
              <th>Group</th>
              <th className="num">Population %</th>
              <th className="num">CVAP %</th>
              {canToggleHeatmap && <th aria-label="Heat map toggle">Heat Map</th>}
            </tr>
          </thead>
          <tbody>
            {summary.demographicRows.map((row) => {
              const heatmapValue = HEATMAP_GROUP_VALUE[row.group];
              const isToggleable = HEATMAP_TOGGLE_ROW_GROUPS.includes(row.group);
              const isAllowed = !!heatmapValue && (!allowedHeatmapGroups || allowedHeatmapGroups.has(heatmapValue));
              const isActive = !!heatmapValue && inlineHeatmapGroup === heatmapValue;
              return (
                <tr key={row.group}>
                  <td>{row.group}</td>
                  <td className="num">{formatPct(row.populationPct, 1)}</td>
                  <td className="num">{formatPct(row.cvapPct, 1)}</td>
                  {canToggleHeatmap && (
                    <td>
                      {isToggleable ? (
                        <button
                          type="button"
                          className={`heatmap-toggle ${isActive ? 'heatmap-toggle--active' : ''}`}
                          onClick={() => onToggleInlineHeatmap(heatmapValue)}
                          disabled={!isAllowed}
                          aria-pressed={isActive}
                          title={!isAllowed
                            ? `${row.group} population is below the demographic threshold for this state.`
                            : isActive
                              ? `Hide ${row.group} heat map`
                              : `Show ${row.group} heat map`}
                        >
                          {isActive ? 'Hide Heat Map' : 'Show Heat Map'}
                        </button>
                      ) : (
                        <span className="heatmap-toggle__placeholder" aria-hidden="true">-</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--compact">
          <thead>
            <tr>
              <th>Ensemble</th>
              <th className="num">Plans</th>
              <th className="num">Pop. Eq.</th>
              <th className="num">Black RP</th>
              <th className="num">Hispanic RP</th>
              <th className="num">Asian RP</th>
            </tr>
          </thead>
          <tbody>
            {summary.ensembleRows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td className="num">{formatNumber(row.planCount)}</td>
                <td className="num">{formatPct(row.populationEqualityThresholdPct, 1, { alreadyPercent: true })}</td>
                <td className="num">{formatRatio(row.roughProportionality.Black)}</td>
                <td className="num">{formatRatio(row.roughProportionality.Hispanic)}</td>
                <td className="num">{formatRatio(row.roughProportionality.Asian)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

function DistrictRepresentationTable({ payload, highlightedDistrict, onHighlightDistrict }) {
  const rows = payload?.districtRows || EMPTY_LIST;

  return (
    <ChartCard title="Congressional Representation" subtitle="Enacted-plan district details and effectiveness scores">
      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--clickable">
          <thead>
            <tr>
              <th className="num">District #</th>
              <th>Representative</th>
              <th>Party</th>
              <th>Rep. Group</th>
              <th className="num">Vote Margin %</th>
              <th className="num">Effectiveness</th>
              <th className="num">Calibrated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const districtNum = Number(row.districtNumber);
              return (
              <tr
                key={row.districtNumber}
                className={Number(highlightedDistrict) === districtNum ? 'analysis-table__row--active' : ''}
                onClick={() => onHighlightDistrict(Number.isFinite(districtNum) ? districtNum : row.districtNumber)}
              >
                <td className="num">{row.districtNumber}</td>
                <td>{row.representative}</td>
                <td>{row.party}</td>
                <td>{row.representativeGroup}</td>
                <td className="num">{formatPct(row.voteMarginPct, 1, { alreadyPercent: true })}</td>
                <td className="num">{formatRatio(row.effectivenessScore)}</td>
                <td className="num">{formatRatio(row.calibratedEffectivenessScore)}</td>
              </tr>
              );
            })}
            {rows.length === 0 && <EmptyTableRow colSpan={7} label="District representation rows are not available." />}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

function BoxWhiskerChart({
  payload,
  ensembleType,
  onEnsembleTypeChange,
}) {
  const ensembleKey = ensembleType === 'vra' ? 'VRA' : 'RB';
  const groups = Object.keys(payload?.ensembles?.[ensembleKey]?.groups || {});
  const [localSelectedGroup, setLocalSelectedGroup] = useState(groups[0] || 'Black');
  const activeGroup = groups.includes(localSelectedGroup) ? localSelectedGroup : groups[0];
  const rows = useMemo(
    () => normalizeDistrictBoxRows(payload?.ensembles?.[ensembleKey]?.groups?.[activeGroup]?.orderedBins),
    [payload, ensembleKey, activeGroup],
  );
  const boxColor = groupColor(activeGroup);

  return (
    <ChartCard
      title="District Distribution (Box & Whisker)"
      subtitle={`${ENSEMBLE_LABELS[ensembleKey]} ensemble, ordered by enacted-plan percentage for selected group`}
    >
      <div className="analysis-inline-controls">
        {groups.length > 0 && (
          <SelectControl
            id="box-whisker-group-select"
            label="Group"
            value={activeGroup || ''}
            options={groups.map((group) => ({ value: group, label: group }))}
            onChange={setLocalSelectedGroup}
          />
        )}
        <EnsembleToggle
          ensembleType={ensembleType}
          onEnsembleTypeChange={onEnsembleTypeChange}
        />
      </div>
      {rows.length > 0 ? (
        <ResponsiveContainer width="100%" height={ANALYSIS_CHART_HEIGHT}>
          <ComposedChart data={rows} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="district" tick={{ fontSize: 12 }} />
            <YAxis
              label={{ value: `${activeGroup || 'Group'} in District (%)`, angle: -90, position: 'insideLeft', fontSize: 12 }}
              tick={{ fontSize: 11 }}
              domain={[0, 100]}
            />
            <Tooltip content={(props) => <BoxWhiskerTooltip {...props} groupLabel={`${activeGroup || 'Group'} %`} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="iqrBase" stackId="iqr" fill="transparent" legendType="none" />
            <Bar
              dataKey="iqrHeight"
              stackId="iqr"
              name="IQR (Q1-Q3)"
              fill={boxColor}
              fillOpacity={0.28}
              stroke={boxColor}
              strokeWidth={1.4}
              radius={[4, 4, 0, 0]}
            />
            <Scatter dataKey="median" name="Median + Whiskers" fill={boxColor} shape="diamond" isAnimationActive={false}>
              <ErrorBar dataKey="whisker" direction="y" width={8} stroke={boxColor} strokeWidth={1.5} />
            </Scatter>
            <Scatter dataKey="enacted" name="Enacted Plan Dot" fill="#1f6f78" shape="circle" isAnimationActive={false} />
            <Scatter dataKey="proposed" name="Proposed Plan Dot" fill="#d97706" shape="triangle" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <p className="analysis-note">Box and whisker data is not available.</p>
      )}
    </ChartCard>
  );
}

function EnsembleSplitsChart({ payload, summaryPayload, selectedEnsembleType, onEnsembleTypeChange }) {
  const rows = (payload?.splits || EMPTY_LIST).map((row) => ({
    ...row,
    splitLabel: `${row.repWins}R/${row.demWins}D`,
  }));
  const selectedKey = selectedEnsembleType === 'vra' ? 'VRA' : 'RB';
  const ensembleSummaries = summaryPayload?.ensembleSummaries || {};
  const handleSelectEnsemble = (nextEnsembleType) => {
    onEnsembleTypeChange?.(nextEnsembleType);
  };

  return (
    <ChartCard title="Ensemble Splits" subtitle="Race-Blind and VRA constrained simulated election split frequencies">
      <div className="ensemble-card-toggle" role="group" aria-label="Ensemble metadata - click to switch">
        {[
          { typeValue: 'raceBlind', summaryKey: 'RB' },
          { typeValue: 'vra', summaryKey: 'VRA' },
        ].map(({ typeValue, summaryKey }) => {
          const summary = ensembleSummaries[summaryKey];
          const isActive = selectedKey === summaryKey;
          return (
            <button
              key={summaryKey}
              type="button"
              className={`ensemble-card-toggle__card ${isActive ? 'ensemble-card-toggle__card--active' : ''}`}
              onClick={() => handleSelectEnsemble(typeValue)}
              aria-pressed={isActive}
              title={isActive ? 'Currently selected ensemble' : `Switch to ${ENSEMBLE_LABELS[summaryKey]} ensemble`}
            >
              <span className="ensemble-card-toggle__label">
                {isActive ? 'Selected Ensemble Metadata' : 'Switch To'}
              </span>
              <span className="ensemble-card-toggle__value">
                {ENSEMBLE_LABELS[summaryKey]} / {formatPct(summary?.populationEqualityThresholdPct, 1, { alreadyPercent: true })}
              </span>
              {summary?.planCount != null && (
                <span className="ensemble-card-toggle__meta">
                  {formatNumber(summary.planCount)} plans
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--compact">
          <thead>
            <tr>
              <th>Ensemble</th>
              <th className="num">District Plans</th>
              <th className="num">Population Equality Threshold</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summaryPayload?.ensembleSummaries || {}).map(([key, row]) => (
              <tr key={key} className={key === selectedKey ? 'analysis-table__row--active' : ''}>
                <td>{ENSEMBLE_LABELS[key] || key}</td>
                <td className="num">{formatNumber(row.planCount)}</td>
                <td className="num">{formatPct(row.populationEqualityThresholdPct, 1, { alreadyPercent: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 0 ? (
        <ResponsiveContainer width="100%" height={ANALYSIS_CHART_HEIGHT}>
          <BarChart data={rows} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="splitLabel" tick={{ fontSize: 11 }} />
            <YAxis label={{ value: 'Plans in Ensemble', angle: -90, position: 'insideLeft', fontSize: 12 }} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="rbFrequency" name="Race-Blind" fill="#64b5f6" fillOpacity={0.82} radius={[4, 4, 0, 0]} />
            <Bar dataKey="vraFrequency" name="VRA Constrained" fill="#7b1fa2" fillOpacity={0.74} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="analysis-note">Ensemble split data is not available.</p>
      )}
    </ChartCard>
  );
}

function VraImpactThresholdTable({
  payload,
  selectedGroup,
  onSelectedGroupChange,
}) {
  const rows = useMemo(() => payload?.rows || EMPTY_LIST, [payload?.rows]);
  const [localSelectedGroup, setLocalSelectedGroup] = useState(rows[0]?.group || 'Black');
  const requestedGroup = selectedGroup || localSelectedGroup;

  const effectiveGroup =
    rows.length === 0
      ? requestedGroup
      : rows.some((row) => row.group === requestedGroup)
        ? requestedGroup
        : rows[0].group;

  const activeRow = rows.find((row) => row.group === effectiveGroup) || rows[0];
  const metricRows = activeRow
    ? [
      ['Enacted effective-district threshold', activeRow.enactedThreshold],
      ['Rough proportionality threshold', activeRow.roughProportionality],
      ['Joint threshold', activeRow.jointThreshold],
    ]
    : EMPTY_LIST;
  const handleGroupChange = (nextGroup) => {
    setLocalSelectedGroup(nextGroup);
    onSelectedGroupChange?.(nextGroup);
  };

  return (
    <ChartCard title="VRA Impact Thresholds" subtitle="Legal threshold percentages compared side-by-side by ensemble">
      {rows.length > 0 && !selectedGroup && (
        <SelectControl
          id="vra-impact-group-select"
          label="Feasible Race"
          value={effectiveGroup || ''}
          options={rows.map((row) => ({ value: row.group, label: row.group }))}
          onChange={handleGroupChange}
        />
      )}
      <div className="analysis-table-wrap">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Metric</th>
              <th className="num">Race-Blind</th>
              <th className="num">VRA Constrained</th>
            </tr>
          </thead>
          <tbody>
            {metricRows.map(([metric, values]) => (
              <tr key={metric}>
                <td>{activeRow?.group}</td>
                <td>{metric}</td>
                <td className="num">{formatPct(values?.rbPct, 1)}</td>
                <td className="num">{formatPct(values?.vraPct, 1)}</td>
              </tr>
            ))}
            {metricRows.length === 0 && <EmptyTableRow colSpan={4} label="No VRA impact threshold rows are available." />}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

function MinorityEffectivenessBoxChart({ payload, selectedGroup }) {
  const rows = normalizeMinorityEffectivenessBoxes(payload);
  const summaryRows = minorityEffectivenessSummaryRows(rows);
  const districtCount = Number(payload?.districtCount);
  const yAxisMax = Number.isFinite(districtCount) ? districtCount : 'auto';
  const highlightedGroup = summaryRows.some((row) => row.group === selectedGroup) ? selectedGroup : null;
  const strongestLift = summaryRows.reduce((best, row) => (
    best == null || row.vraLift > best.vraLift ? row : best
  ), null);
  const enactedLeader = summaryRows.reduce((best, row) => (
    best == null || row.enacted > best.enacted ? row : best
  ), null);

  return (
    <ChartCard
      title="Minority Effectiveness Box & Whisker"
      subtitle="Race-Blind and VRA-constrained distributions of minority-effective district counts"
    >
      {summaryRows.length > 0 && (
        <div className="minority-effectiveness-summary" aria-label="Minority effectiveness summary">
          <div className="minority-effectiveness-summary__card">
            <span>Feasible groups</span>
            <strong>{summaryRows.length}</strong>
          </div>
          <div className="minority-effectiveness-summary__card">
            <span>Largest VRA lift</span>
            <strong>{strongestLift ? `${strongestLift.group} ${formatSignedNumber(strongestLift.vraLift)}` : 'N/A'}</strong>
          </div>
          <div className="minority-effectiveness-summary__card">
            <span>Enacted high</span>
            <strong>{enactedLeader ? `${enactedLeader.group}: ${enactedLeader.enacted}` : 'N/A'}</strong>
          </div>
          <div className="minority-effectiveness-summary__card">
            <span>District range</span>
            <strong>0-{Number.isFinite(districtCount) ? districtCount : 'N'}</strong>
          </div>
        </div>
      )}

      {rows.length > 0 ? (
        <ResponsiveContainer width="100%" height={MINORITY_EFFECTIVENESS_CHART_HEIGHT}>
          <ComposedChart data={rows} margin={{ top: 10, right: 20, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="axisLabel" tick={<MinorityEffectivenessTick />} interval={0} height={44} />
            <YAxis
              allowDecimals={false}
              domain={[0, yAxisMax]}
              tick={{ fontSize: 11 }}
              label={{ value: 'Effective Districts', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip content={(props) => <MinorityEffectivenessTooltip {...props} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="iqrBase" stackId="box" fill="transparent" legendType="none" />
            <Bar dataKey="iqrHeight" stackId="box" name="IQR (Q1-Q3)" radius={[4, 4, 0, 0]}>
              {rows.map((row) => (
                <Cell
                  key={row.axisLabel}
                  fill={row.ensemble === 'RB' ? '#64b5f6' : '#7b1fa2'}
                  fillOpacity={!highlightedGroup || row.group === highlightedGroup ? 0.44 : 0.2}
                  stroke={row.group === highlightedGroup ? '#1f6f78' : 'transparent'}
                  strokeWidth={row.group === highlightedGroup ? 1.4 : 0}
                />
              ))}
            </Bar>
            <Scatter dataKey="median" name="Median + Whiskers" fill="#1f2937" shape="diamond" isAnimationActive={false}>
              <ErrorBar dataKey="whisker" direction="y" width={8} stroke="#1f2937" strokeWidth={1.5} />
            </Scatter>
            <Scatter dataKey="enacted" name="Enacted Plan" fill="#d97706" shape="circle" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <p className="analysis-note">Minority effectiveness box data is not available.</p>
      )}

      {summaryRows.length > 0 && (
        <div className="analysis-table-wrap minority-effectiveness-table">
          <table className="analysis-table analysis-table--compact">
            <thead>
              <tr>
                <th>Group</th>
                <th className="num">RB Median</th>
                <th className="num">VRA Median</th>
                <th className="num">VRA Lift</th>
                <th className="num">Enacted</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row) => (
                <tr key={row.group} className={row.group === highlightedGroup ? 'analysis-table__row--active' : ''}>
                  <td>{row.group}</td>
                  <td className="num">{formatNumber(row.rbMedian)}</td>
                  <td className="num">{formatNumber(row.vraMedian)}</td>
                  <td className="num">{formatSignedNumber(row.vraLift)}</td>
                  <td className="num">{formatNumber(row.enacted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
}

function MinorityEffectivenessHistogram({
  payload,
  selectedGroup,
  onSelectedGroupChange,
}) {
  const groupNames = useMemo(() => Object.keys(payload?.groupHistograms || {}), [payload?.groupHistograms]);
  const [localSelectedGroup, setLocalSelectedGroup] = useState(groupNames[0] || 'Black');
  const requestedGroup = selectedGroup || localSelectedGroup;

  const activeGroup =
    groupNames.length === 0
      ? requestedGroup
      : groupNames.includes(requestedGroup)
        ? requestedGroup
        : groupNames[0];
  const bins = payload?.groupHistograms?.[activeGroup]?.bins || EMPTY_LIST;
  const summary = minorityHistogramSummary(bins);
  const handleGroupChange = (nextGroup) => {
    setLocalSelectedGroup(nextGroup);
    onSelectedGroupChange?.(nextGroup);
  };

  return (
    <ChartCard
      title="Minority Effectiveness Histogram"
      subtitle={`${activeGroup || 'Selected group'} distribution overlap across Race-Blind and VRA ensembles`}
    >
      {groupNames.length > 0 && !selectedGroup && (
        <SelectControl
          id="minority-histogram-group-select"
          label="Group"
          value={activeGroup || ''}
          options={groupNames.map((group) => ({ value: group, label: group }))}
          onChange={handleGroupChange}
        />
      )}
      {bins.length > 0 && (
        <div className="minority-histogram-summary" aria-label="Minority effectiveness histogram summary">
          <div className="minority-histogram-summary__card">
            <span>Selected group</span>
            <strong>{activeGroup}</strong>
          </div>
          <div className="minority-histogram-summary__card">
            <span>RB peak</span>
            <strong>{summary.rbPeakLabel}</strong>
          </div>
          <div className="minority-histogram-summary__card">
            <span>VRA peak</span>
            <strong>{summary.vraPeakLabel}</strong>
          </div>
          <div className="minority-histogram-summary__card">
            <span>Curve overlap</span>
            <strong>{formatPct(summary.overlapPct, 1)}</strong>
          </div>
        </div>
      )}

      {bins.length > 0 ? (
        <ResponsiveContainer width="100%" height={MINORITY_HISTOGRAM_CHART_HEIGHT}>
          <BarChart
            data={bins}
            margin={{ top: 10, right: 20, bottom: 8, left: 8 }}
            barCategoryGap="28%"
            barGap={-24}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="effectiveDistricts"
              tick={{ fontSize: 11 }}
              label={{ value: 'Minority-Effective Districts', position: 'insideBottom', offset: -5, fontSize: 12 }}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} label={{ value: 'Plans', angle: -90, position: 'insideLeft', fontSize: 12 }} />
            <Tooltip content={(props) => <MinorityHistogramTooltip {...props} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="rbFrequency" name="Race-Blind" fill="#64b5f6" fillOpacity={0.58} stroke="#2d7fbd" strokeWidth={1.2} radius={[4, 4, 0, 0]} />
            <Bar dataKey="vraFrequency" name="VRA Constrained" fill="#7b1fa2" fillOpacity={0.5} stroke="#7b1fa2" strokeWidth={1.2} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="analysis-note">Minority effectiveness histogram data is not available.</p>
      )}

      {bins.length > 0 && (
        <div className="analysis-table-wrap minority-histogram-table">
          <table className="analysis-table analysis-table--compact">
            <thead>
              <tr>
                <th className="num">Effective Districts</th>
                <th className="num">Race-Blind</th>
                <th className="num">VRA Constrained</th>
                <th className="num">Overlap</th>
              </tr>
            </thead>
            <tbody>
              {bins.map((row) => (
                <tr key={row.effectiveDistricts}>
                  <td className="num">{row.effectiveDistricts}</td>
                  <td className="num">{formatNumber(row.rbFrequency)}</td>
                  <td className="num">{formatNumber(row.vraFrequency)}</td>
                  <td className="num">{formatNumber(Math.min(Number(row.rbFrequency) || 0, Number(row.vraFrequency) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
}

function MinorityRangeBarCharts({ payload, selectedGroup }) {
  const districtCount = Number(payload?.districtCount);
  const yAxisMax = Number.isFinite(districtCount) ? districtCount : 'auto';
  const groupEntries = useMemo(
    () => Object.entries(payload?.groups || {}),
    [payload?.groups],
  );
  const highlightedGroupKey = useMemo(() => {
    if (!selectedGroup) return null;
    const target = String(selectedGroup).toLowerCase();
    const match = groupEntries.find(([key]) => key.toLowerCase() === target);
    return match ? match[0] : null;
  }, [groupEntries, selectedGroup]);

  if (groupEntries.length === 0) {
    return (
      <ChartCard
        title="Minority-Effective and Majority-Minority Ranges"
        subtitle="Range of district counts across Race-Blind and VRA ensembles per feasible group"
      >
        <p className="analysis-note">No feasible minority groups meet the threshold for this state.</p>
      </ChartCard>
    );
  }

  const buildRows = (metricKey) => groupEntries.map(([groupKey, groupData]) => {
    const rb = groupData?.[metricKey]?.RB || {};
    const vra = groupData?.[metricKey]?.VRA || {};
    return {
      group: groupKey,
      rbMin: Number(rb.min) || 0,
      rbMedian: Number(rb.median) || 0,
      rbMax: Number(rb.max) || 0,
      rbHeight: Math.max(0, (Number(rb.max) || 0) - (Number(rb.min) || 0)),
      vraMin: Number(vra.min) || 0,
      vraMedian: Number(vra.median) || 0,
      vraMax: Number(vra.max) || 0,
      vraHeight: Math.max(0, (Number(vra.max) || 0) - (Number(vra.min) || 0)),
      enacted: Number(rb.enacted ?? vra.enacted) || 0,
    };
  });

  const effectiveRows = buildRows('minorityEffective');
  const majorityRows = buildRows('majorityMinority');

  const summaryRows = groupEntries.map(([groupKey, groupData]) => {
    const eff = groupData?.minorityEffective || {};
    const maj = groupData?.majorityMinority || {};
    return {
      group: groupKey,
      effRbMin: Number(eff.RB?.min) || 0,
      effRbMax: Number(eff.RB?.max) || 0,
      effVraMin: Number(eff.VRA?.min) || 0,
      effVraMax: Number(eff.VRA?.max) || 0,
      effEnacted: Number(eff.RB?.enacted ?? eff.VRA?.enacted) || 0,
      majRbMin: Number(maj.RB?.min) || 0,
      majRbMax: Number(maj.RB?.max) || 0,
      majVraMin: Number(maj.VRA?.min) || 0,
      majVraMax: Number(maj.VRA?.max) || 0,
      majEnacted: Number(maj.RB?.enacted ?? maj.VRA?.enacted) || 0,
    };
  });

  return (
    <ChartCard
      title="Minority-Effective and Majority-Minority Ranges"
      subtitle={`Range of district counts across Race-Blind and VRA ensembles per feasible group (0-${Number.isFinite(districtCount) ? districtCount : 'N'} districts)`}
    >
      <div className="range-bar-grid">
        <div className="range-bar-grid__chart">
          <h4 className="range-bar-grid__heading">Minority-Effective Districts</h4>
          <ResponsiveContainer width="100%" height={RANGE_BAR_CHART_HEIGHT}>
            <BarChart data={effectiveRows} margin={{ top: 10, right: 18, bottom: 6, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="group" tick={{ fontSize: 11 }} />
              <YAxis
                allowDecimals={false}
                domain={[0, yAxisMax]}
                tick={{ fontSize: 11 }}
                label={{ value: 'Effective Districts', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip content={(props) => <RangeBarTooltip {...props} label="Minority-Effective" />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="rbMin" stackId="rb" fill="transparent" legendType="none" isAnimationActive={false} />
              <Bar
                dataKey="rbHeight"
                stackId="rb"
                name="Race-Blind range"
                fill="#64b5f6"
                fillOpacity={0.55}
                stroke="#2d7fbd"
                strokeWidth={1.3}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              >
                {effectiveRows.map((row) => (
                  <Cell
                    key={`rb-eff-${row.group}`}
                    fillOpacity={!highlightedGroupKey || row.group === highlightedGroupKey ? 0.55 : 0.22}
                    stroke={row.group === highlightedGroupKey ? '#1f6f78' : '#2d7fbd'}
                    strokeWidth={row.group === highlightedGroupKey ? 1.8 : 1.3}
                  />
                ))}
              </Bar>
              <Bar dataKey="vraMin" stackId="vra" fill="transparent" legendType="none" isAnimationActive={false} />
              <Bar
                dataKey="vraHeight"
                stackId="vra"
                name="VRA Constrained range"
                fill="#7b1fa2"
                fillOpacity={0.5}
                stroke="#5a168f"
                strokeWidth={1.3}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              >
                {effectiveRows.map((row) => (
                  <Cell
                    key={`vra-eff-${row.group}`}
                    fillOpacity={!highlightedGroupKey || row.group === highlightedGroupKey ? 0.5 : 0.2}
                    stroke={row.group === highlightedGroupKey ? '#1f6f78' : '#5a168f'}
                    strokeWidth={row.group === highlightedGroupKey ? 1.8 : 1.3}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="range-bar-grid__chart">
          <h4 className="range-bar-grid__heading">Majority-Minority Districts</h4>
          <ResponsiveContainer width="100%" height={RANGE_BAR_CHART_HEIGHT}>
            <BarChart data={majorityRows} margin={{ top: 10, right: 18, bottom: 6, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="group" tick={{ fontSize: 11 }} />
              <YAxis
                allowDecimals={false}
                domain={[0, yAxisMax]}
                tick={{ fontSize: 11 }}
                label={{ value: 'Districts', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip content={(props) => <RangeBarTooltip {...props} label="Majority-Minority" />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="rbMin" stackId="rb" fill="transparent" legendType="none" isAnimationActive={false} />
              <Bar
                dataKey="rbHeight"
                stackId="rb"
                name="Race-Blind range"
                fill="#64b5f6"
                fillOpacity={0.55}
                stroke="#2d7fbd"
                strokeWidth={1.3}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              >
                {majorityRows.map((row) => (
                  <Cell
                    key={`rb-maj-${row.group}`}
                    fillOpacity={!highlightedGroupKey || row.group === highlightedGroupKey ? 0.55 : 0.22}
                    stroke={row.group === highlightedGroupKey ? '#1f6f78' : '#2d7fbd'}
                    strokeWidth={row.group === highlightedGroupKey ? 1.8 : 1.3}
                  />
                ))}
              </Bar>
              <Bar dataKey="vraMin" stackId="vra" fill="transparent" legendType="none" isAnimationActive={false} />
              <Bar
                dataKey="vraHeight"
                stackId="vra"
                name="VRA Constrained range"
                fill="#7b1fa2"
                fillOpacity={0.5}
                stroke="#5a168f"
                strokeWidth={1.3}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              >
                {majorityRows.map((row) => (
                  <Cell
                    key={`vra-maj-${row.group}`}
                    fillOpacity={!highlightedGroupKey || row.group === highlightedGroupKey ? 0.5 : 0.2}
                    stroke={row.group === highlightedGroupKey ? '#1f6f78' : '#5a168f'}
                    strokeWidth={row.group === highlightedGroupKey ? 1.8 : 1.3}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--compact">
          <thead>
            <tr>
              <th>Group</th>
              <th className="num">Effective RB Range</th>
              <th className="num">Effective VRA Range</th>
              <th className="num">Effective Enacted</th>
              <th className="num">Majority RB Range</th>
              <th className="num">Majority VRA Range</th>
              <th className="num">Majority Enacted</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((row) => (
              <tr key={row.group} className={row.group === highlightedGroupKey ? 'analysis-table__row--active' : ''}>
                <td>{row.group}</td>
                <td className="num">{row.effRbMin}-{row.effRbMax}</td>
                <td className="num">{row.effVraMin}-{row.effVraMax}</td>
                <td className="num">{row.effEnacted}</td>
                <td className="num">{row.majRbMin}-{row.majRbMax}</td>
                <td className="num">{row.majVraMin}-{row.majVraMax}</td>
                <td className="num">{row.majEnacted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

function RangeBarTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="analysis-tooltip">
      <div className="analysis-tooltip__title">{row.group} - {label}</div>
      <div>Race-Blind range: {row.rbMin} to {row.rbMax} (median {row.rbMedian})</div>
      <div>VRA range: {row.vraMin} to {row.vraMax} (median {row.vraMedian})</div>
      <div>Enacted: {row.enacted}</div>
    </div>
  );
}

function GinglesSummary({
  payload,
  tablePayload,
  highlightedPrecinct,
  onSelectPrecinct,
  selectedGroup,
  onSelectedGroupChange,
}) {
  const groups = Object.keys(payload?.groups || {});
  const [localSelectedGroup, setLocalSelectedGroup] = useState(groups[0] || 'Black');
  const requestedGroup = selectedGroup || localSelectedGroup;
  const activeGroup = groups.includes(requestedGroup) ? requestedGroup : groups[0];
  const groupData = payload?.groups?.[activeGroup];
  const points = groupData?.points || EMPTY_LIST;
  const demPoints = points.map((point) => ({
    x: valueToPercent(point.x),
    y: valueToPercent(point.demVotePct),
    precinctId: point.precinctId,
    district: point.district,
    party: 'Democratic',
    otherPartyLabel: 'Republican',
    otherPartyShare: valueToPercent(point.repVotePct),
  }));
  const repPoints = points.map((point) => ({
    x: valueToPercent(point.x),
    y: valueToPercent(point.repVotePct),
    precinctId: point.precinctId,
    district: point.district,
    party: 'Republican',
    otherPartyLabel: 'Democratic',
    otherPartyShare: valueToPercent(point.demVotePct),
  }));
  const demTrend = normalizeRegressionLine(groupData?.regression?.dem);
  const repTrend = normalizeRegressionLine(groupData?.regression?.rep);
  const handleGroupChange = (nextGroup) => {
    setLocalSelectedGroup(nextGroup);
    onSelectedGroupChange?.(nextGroup);
  };

  return (
    <ChartCard title="Gingles Analysis Results" subtitle="2024 precinct-level vote share by selected racial/ethnic group">
      {groups.length > 0 && !selectedGroup && (
        <SelectControl
          id="gingles-group-select"
          label="Race/Ethnic Group"
          value={activeGroup || ''}
          options={groups.map((group) => ({ value: group, label: group }))}
          onChange={handleGroupChange}
        />
      )}
      {points.length > 0 ? (
        <ResponsiveContainer width="100%" height={GINGLES_CHART_HEIGHT}>
          <ScatterChart margin={{ top: 14, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ece6de" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
              label={{ value: `${activeGroup || 'Group'} Share in Precinct (%)`, position: 'insideBottom', offset: -6, fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
              label={{ value: 'Party Vote Share (%)', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip content={(props) => <GinglesScatterTooltip {...props} groupLabel={activeGroup || 'Group'} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Scatter
              name="Democratic Vote"
              data={demPoints}
              fill="#1e88e5"
              fillOpacity={0.34}
              onClick={(point) => onSelectPrecinct?.(point?.payload?.precinctId)}
            />
            <Scatter
              name="Republican Vote"
              data={repPoints}
              fill="#e53935"
              fillOpacity={0.34}
              onClick={(point) => onSelectPrecinct?.(point?.payload?.precinctId)}
            />
            <Scatter
              name="Democratic Trend"
              data={demTrend}
              fill="transparent"
              line={{ stroke: '#1565c0', strokeWidth: 2.2 }}
              lineType="joint"
              legendType="line"
              shape={<HiddenScatterPoint />}
              isAnimationActive={false}
            />
            <Scatter
              name="Republican Trend"
              data={repTrend}
              fill="transparent"
              line={{ stroke: '#b71c1c', strokeWidth: 2.2 }}
              lineType="joint"
              legendType="line"
              shape={<HiddenScatterPoint />}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      ) : (
        <p className="analysis-note">Precinct-level Gingles chart data is not available.</p>
      )}
      <GinglesTable
        payload={tablePayload}
        highlightedPrecinct={highlightedPrecinct}
        maxRows={GINGLES_PRECINCT_PAGE_SIZE}
        title="Precinct Inputs"
        subtitle={highlightedPrecinct
          ? `Selected precinct: ${highlightedPrecinct}`
          : 'Population and 2024 vote inputs for the Gingles 2/3 scatter above. Click a scatter point to highlight its row.'}
        nested
      />
    </ChartCard>
  );
}

function GinglesTable({
  payload,
  highlightedPrecinct,
  maxRows,
  title = 'Gingles 2/3 Data Table',
  subtitle = 'Precinct-level population and 2024 vote inputs',
  nested = false,
}) {
  const sourceRows = payload?.rows || EMPTY_LIST;
  const pageSize = Math.max(1, Number(maxRows ?? GINGLES_TABLE_PAGE_SIZE));
  const pageCount = Math.max(1, Math.ceil(sourceRows.length / pageSize));
  const [pageIndex, setPageIndex] = useState(0);
  // The row's natural index in the source list — preserved so selecting a
  // precinct jumps the pager to its page instead of yanking the row to the
  // top of the current page.
  const highlightedIndex = useMemo(() => {
    if (highlightedPrecinct == null) return -1;
    return sourceRows.findIndex(
      (row) => String(row.precinctId) === String(highlightedPrecinct),
    );
  }, [sourceRows, highlightedPrecinct]);
  const highlightedRowRef = useRef(null);

  // Reset to first page if the source list changes (e.g. group switch).
  useEffect(() => {
    setPageIndex(0);
  }, [sourceRows.length]);

  // When a precinct is highlighted (from the scatter or elsewhere), jump
  // the pager to the page that actually contains that row.
  useEffect(() => {
    if (highlightedIndex < 0) return;
    const targetPage = Math.floor(highlightedIndex / pageSize);
    setPageIndex((current) => (current === targetPage ? current : targetPage));
  }, [highlightedIndex, pageSize]);

  const safePageIndex = Math.min(Math.max(pageIndex, 0), pageCount - 1);
  const pageStart = safePageIndex * pageSize;
  const rows = sourceRows.slice(pageStart, pageStart + pageSize);
  const visibleStart = sourceRows.length > 0 ? pageStart + 1 : 0;
  const visibleEnd = Math.min(pageStart + rows.length, sourceRows.length);

  // Scroll the highlighted row into view once it's actually on-screen.
  useEffect(() => {
    if (highlightedIndex < 0) return;
    const targetPage = Math.floor(highlightedIndex / pageSize);
    if (targetPage !== safePageIndex) return;
    if (highlightedRowRef.current?.scrollIntoView) {
      highlightedRowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedIndex, safePageIndex, pageSize]);

  return (
    <ChartCard title={title} subtitle={subtitle} nested={nested}>
      <div className={`analysis-table-wrap ${maxRows ? 'analysis-table-wrap--scroll' : ''}`}>
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Precinct ID</th>
              <th>Precinct Name</th>
              <th className="num">Total Pop.</th>
              <th className="num">Minority Pop.</th>
              <th className="num">Rep Votes</th>
              <th className="num">Dem Votes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isActive = String(row.precinctId) === String(highlightedPrecinct);
              return (
                <tr
                  key={`${String(row.precinctId)}:${index}`}
                  ref={isActive ? highlightedRowRef : null}
                  className={isActive ? 'analysis-table__row--active' : ''}
                >
                  <td>{row.precinctId}</td>
                  <td>{row.precinctName}</td>
                  <td className="num">{formatNumber(row.totalPopulation)}</td>
                  <td className="num">{formatNumber(row.minorityPopulation)}</td>
                  <td className="num">{formatNumber(row.republicanVotes)}</td>
                  <td className="num">{formatNumber(row.democraticVotes)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <EmptyTableRow colSpan={6} label="Gingles table rows are not available." />}
          </tbody>
        </table>
      </div>
      {sourceRows.length > pageSize && (
        <NumberedPagination
          pageIndex={safePageIndex}
          pageCount={pageCount}
          onPageChange={setPageIndex}
          rangeLabel={`${visibleStart}-${visibleEnd} of ${sourceRows.length}`}
          ariaLabel="Precinct table pagination"
        />
      )}
    </ChartCard>
  );
}

function buildPageWindow(currentIndex, totalPages, windowSize = PAGE_WINDOW_SIZE) {
  if (totalPages <= 0) return [];
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }
  const half = Math.floor(windowSize / 2);
  let start = Math.max(0, currentIndex - half);
  let end = start + windowSize - 1;
  if (end > totalPages - 1) {
    end = totalPages - 1;
    start = end - windowSize + 1;
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function NumberedPagination({
  pageIndex,
  pageCount,
  onPageChange,
  rangeLabel,
  ariaLabel = 'Pagination',
}) {
  if (pageCount <= 1) return null;
  const goTo = (next) => {
    const clamped = Math.max(0, Math.min(pageCount - 1, next));
    if (clamped !== pageIndex) onPageChange(clamped);
  };
  const window = buildPageWindow(pageIndex, pageCount);
  const showLeadingAnchor = window[0] > 0;
  const showLeadingGap = window[0] > 1;
  const showTrailingAnchor = window[window.length - 1] < pageCount - 1;
  const showTrailingGap = window[window.length - 1] < pageCount - 2;

  return (
    <nav className="analysis-pagination" aria-label={ariaLabel}>
      <button
        type="button"
        className="analysis-pagination__nav"
        onClick={() => goTo(pageIndex - 1)}
        disabled={pageIndex === 0}
        aria-label="Previous page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 6 9 12l6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <ol className="analysis-pagination__pages">
        {showLeadingAnchor && (
          <li>
            <button
              type="button"
              className={`analysis-pagination__page ${pageIndex === 0 ? 'analysis-pagination__page--active' : ''}`}
              onClick={() => goTo(0)}
              aria-label="Page 1"
              aria-current={pageIndex === 0 ? 'page' : undefined}
            >
              1
            </button>
          </li>
        )}
        {showLeadingGap && (
          <li aria-hidden="true" className="analysis-pagination__gap">…</li>
        )}
        {window.map((index) => (
          <li key={index}>
            <button
              type="button"
              className={`analysis-pagination__page ${index === pageIndex ? 'analysis-pagination__page--active' : ''}`}
              onClick={() => goTo(index)}
              aria-label={`Page ${index + 1}`}
              aria-current={index === pageIndex ? 'page' : undefined}
            >
              {index + 1}
            </button>
          </li>
        ))}
        {showTrailingGap && (
          <li aria-hidden="true" className="analysis-pagination__gap">…</li>
        )}
        {showTrailingAnchor && (
          <li>
            <button
              type="button"
              className={`analysis-pagination__page ${pageIndex === pageCount - 1 ? 'analysis-pagination__page--active' : ''}`}
              onClick={() => goTo(pageCount - 1)}
              aria-label={`Page ${pageCount}`}
              aria-current={pageIndex === pageCount - 1 ? 'page' : undefined}
            >
              {pageCount}
            </button>
          </li>
        )}
      </ol>

      <button
        type="button"
        className="analysis-pagination__nav"
        onClick={() => goTo(pageIndex + 1)}
        disabled={pageIndex >= pageCount - 1}
        aria-label="Next page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {rangeLabel && <span className="analysis-pagination__status">{rangeLabel}</span>}
    </nav>
  );
}

function EICandidateResults({ payload, selectedGroup }) {
  const normalized = useMemo(() => normalizeEiCandidateData(payload), [payload]);
  const candidateOptions = normalized.candidates;
  const groupOptions = normalized.groups;
  const [selectedCandidate, setSelectedCandidate] = useState(candidateOptions[0]?.key || '');
  const [selectedGroups, setSelectedGroups] = useState(() => groupOptions.slice(0, 3).map((group) => group.key));
  const routeSelectedGroup = groupOptions.some((group) => group.key === selectedGroup) ? selectedGroup : null;

  const activeCandidateKey =
    candidateOptions.length > 0 && candidateOptions.some((c) => c.key === selectedCandidate)
      ? selectedCandidate
      : (candidateOptions[0]?.key || '');
  const activeCandidateLabel = candidateOptions.find((candidate) => candidate.key === activeCandidateKey)?.label || 'Candidate';
  const activeSeries = normalized.series[activeCandidateKey] || EMPTY_LIST;
  const visibleGroupKeys = selectedGroups.filter((key) => groupOptions.some((group) => group.key === key));
  const routeSeededGroupKeys = routeSelectedGroup && !visibleGroupKeys.includes(routeSelectedGroup)
    ? [routeSelectedGroup, ...visibleGroupKeys].slice(0, Math.min(3, groupOptions.length))
    : visibleGroupKeys;
  const fallbackGroupKeys = groupOptions[0] ? [groupOptions[0].key] : EMPTY_LIST;
  const selectedGroupKeys = routeSeededGroupKeys.length > 0 ? routeSeededGroupKeys : fallbackGroupKeys;
  const visibleGroups = groupOptions.filter((group) => selectedGroupKeys.includes(group.key));
  const visibleOverlapRows = normalized.overlapRows
    .filter((row) => row.candidateKey === activeCandidateKey)
    .filter((row) => {
      const selected = new Set(selectedGroupKeys);
      if (selected.size <= 1) return selected.has(row.leftGroup) || selected.has(row.rightGroup);
      return selected.has(row.leftGroup) && selected.has(row.rightGroup);
    });
  const visibleGroupLabel = visibleGroups.map((group) => group.label).join(', ') || 'No groups selected';

  const toggleGroup = (key) => {
    setSelectedGroups((current) => {
      if (current.includes(key)) {
        return current.length === 1 ? current : current.filter((entry) => entry !== key);
      }
      return [...current, key];
    });
  };

  if (candidateOptions.length === 0) {
    return (
      <ChartCard title="EI Candidate Results" subtitle="Candidate-specific probability curves by racial/ethnic group">
        <p className="analysis-note">EI candidate results are not available for this state.</p>
        <div className="analysis-table-wrap">
          <table className="analysis-table analysis-table--compact">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Group Pair</th>
                <th className="num">Curve Overlap</th>
              </tr>
            </thead>
            <tbody>
              {visibleOverlapRows.map((row) => (
                <tr key={`${row.candidate}-${row.groupPair}`}>
                  <td>{row.candidate}</td>
                  <td>{row.groupPair}</td>
                  <td className="num">{formatPct(row.overlapPct, 1)}</td>
                </tr>
              ))}
              {visibleOverlapRows.length === 0 && <EmptyTableRow colSpan={3} label="EI overlap rows are not available." />}
            </tbody>
          </table>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="EI Candidate Results" subtitle="Candidate-specific probability curves by racial/ethnic group">
      <div className="ei-diagnostic">
        <div className="ei-controls">
          <div className="ei-controls__item">
            <label htmlFor="ei-candidate-select">Candidate</label>
            <select id="ei-candidate-select" value={activeCandidateKey} onChange={(event) => setSelectedCandidate(event.target.value)}>
              {candidateOptions.map((candidate) => (
                <option key={candidate.key} value={candidate.key}>{candidate.label}</option>
              ))}
            </select>
          </div>
          <div className="ei-controls__item">
            <span className="ei-controls__label">Groups to Compare</span>
            <div className="ei-group-toggle">
              {groupOptions.map((group) => {
                const selected = selectedGroupKeys.includes(group.key);
                return (
                  <button
                    key={group.key}
                    type="button"
                    className={`ei-group-toggle__chip ${selected ? 'ei-group-toggle__chip--active' : ''}`}
                    onClick={() => toggleGroup(group.key)}
                    style={selected ? { borderColor: group.color, color: group.color } : undefined}
                  >
                    {group.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="ei-diagnostic__summary" aria-label="Selected EI configuration">
          <div className="ei-diagnostic__summary-card">
            <span>Candidate</span>
            <strong>{activeCandidateLabel}</strong>
          </div>
          <div className="ei-diagnostic__summary-card ei-diagnostic__summary-card--wide">
            <span>Visible groups</span>
            <strong>{visibleGroupLabel}</strong>
          </div>
          <div className="ei-diagnostic__summary-card">
            <span>Overlap pairs</span>
            <strong>{visibleOverlapRows.length}</strong>
          </div>
        </div>

        {activeSeries.length > 0 ? (
          <div className="ei-chart-shell">
            <ResponsiveContainer width="100%" height={EI_CHART_HEIGHT}>
              <AreaChart data={activeSeries} margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece6de" />
                <XAxis
                  dataKey="supportPct"
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                  label={{ value: 'Group Vote for Candidate (%)', position: 'insideBottom', offset: -4, fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 10 }} label={{ value: 'Probability', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6 }}
                  labelFormatter={(value) => `Support: ${value}%`}
                  formatter={(value, name) => {
                    const v = Number(value);
                    const text = Number.isFinite(v) ? v.toFixed(2) : 'N/A';
                    return [text, `${name} density`];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {visibleGroups.map((group) => (
                  <Area
                    key={group.key}
                    type="monotone"
                    dataKey={group.key}
                    name={group.label}
                    stroke={group.color}
                    fill={group.color}
                    fillOpacity={0.16}
                    strokeWidth={2.2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="analysis-note">EI candidate distribution data is not available.</p>
        )}

        <div className="ei-overlap-panel">
          <div className="ei-overlap-panel__header">
            <span>Curve Overlap</span>
            <strong>{activeCandidateLabel}</strong>
          </div>
          <div className="analysis-table-wrap">
            <table className="analysis-table analysis-table--compact">
              <thead>
                <tr>
                  <th>Group Pair</th>
                  <th className="num">Overlap</th>
                </tr>
              </thead>
              <tbody>
                {visibleOverlapRows.map((row) => (
                  <tr key={`${row.candidate}-${row.groupPair}`}>
                    <td>{row.groupPair}</td>
                    <td className="num">{formatPct(row.overlapPct, 1)}</td>
                  </tr>
                ))}
                {visibleOverlapRows.length === 0 && (
                  <EmptyTableRow
                    colSpan={2}
                    label={visibleGroups.length < 2
                      ? 'Select a second group to compare curve overlap.'
                      : 'EI overlap rows are not available.'}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

function normalizeStateSummary(payload, stateData) {
  const demVotePct = valueToPercent(payload.statewideVote?.demPct);
  const repVotePct = valueToPercent(payload.statewideVote?.repPct ?? (demVotePct == null ? null : 100 - demVotePct));
  const demSeatsRaw = payload.representationSummary?.demSeats;
  let repSeatsRaw = payload.representationSummary?.repSeats;
  const districtCount = stateData?.numDistricts;
  if (repSeatsRaw == null && Number.isFinite(Number(demSeatsRaw)) && Number.isFinite(Number(districtCount))) {
    const dc = Number(districtCount);
    const ds = Number(demSeatsRaw);
    repSeatsRaw = Math.max(0, Math.min(dc, dc - ds));
  }
  return {
    population: payload.population,
    congressionalDistricts: stateData?.numDistricts ?? 'N/A',
    demVotePct: demVotePct ?? 0,
    repVotePct: repVotePct ?? 0,
    demographicRows: payload.demographicSummaries || EMPTY_LIST,
    redistrictingControl: payload.redistrictingControl || 'N/A',
    demSeats: demSeatsRaw ?? 'N/A',
    repSeats: repSeatsRaw ?? 'N/A',
    ensembleRows: Object.entries(payload.ensembleSummaries || {}).map(([name, row]) => ({
      name,
      planCount: row.planCount,
      populationEqualityThresholdPct: row.populationEqualityThresholdPct,
      roughProportionality: row.roughProportionality || {},
    })),
  };
}

function normalizeDistrictBoxRows(rows = EMPTY_LIST) {
  return rows
    .map((row) => {
      const min = Number(row.min);
      const q1 = Number(row.q1);
      const median = Number(row.median);
      const q3 = Number(row.q3);
      const max = Number(row.max);
      return {
        district: `D${row.order ?? '?'}`,
        min,
        q1,
        median,
        q3,
        max,
        enacted: Number(row.enactedDot),
        proposed: row.proposedDot,
        iqrBase: q1,
        iqrHeight: q3 - q1,
        whisker: [median - min, max - median],
      };
    })
    .filter((row) => Number.isFinite(row.iqrHeight) && Number.isFinite(row.median)
      && Number.isFinite(row.min) && Number.isFinite(row.max));
}

function normalizeMinorityEffectivenessBoxes(payload) {
  return Object.entries(payload?.groups || {}).flatMap(([group, ensembles]) => (
    ['RB', 'VRA'].map((ensemble) => {
      const stats = ensembles?.[ensemble];
      if (!stats) return null;
      const min = Number(stats.min);
      const q1 = Number(stats.q1);
      const median = Number(stats.median);
      const q3 = Number(stats.q3);
      const max = Number(stats.max);
      return {
        label: `${group} ${ensemble}`,
        axisLabel: `${group}|${ensemble}`,
        group,
        ensemble,
        min,
        q1,
        median,
        q3,
        max,
        enacted: Number(stats.enacted),
        iqrBase: q1,
        iqrHeight: q3 - q1,
        whisker: [median - min, max - median],
      };
    }).filter(Boolean)
  ));
}

function minorityEffectivenessSummaryRows(rows) {
  const groups = [...new Set(rows.map((row) => row.group))];
  return groups.map((group) => {
    const rb = rows.find((row) => row.group === group && row.ensemble === 'RB');
    const vra = rows.find((row) => row.group === group && row.ensemble === 'VRA');
    const rbMedian = rb?.median;
    const vraMedian = vra?.median;
    const enacted = rb?.enacted ?? vra?.enacted;
    return {
      group,
      rbMedian,
      vraMedian,
      vraLift: Number.isFinite(vraMedian - rbMedian) ? vraMedian - rbMedian : 0,
      enacted: Number.isFinite(enacted) ? enacted : 0,
    };
  });
}

function minorityHistogramSummary(bins) {
  const rbTotal = bins.reduce((sum, row) => sum + (Number(row.rbFrequency) || 0), 0);
  const vraTotal = bins.reduce((sum, row) => sum + (Number(row.vraFrequency) || 0), 0);
  const overlapTotal = bins.reduce((sum, row) => (
    sum + Math.min(Number(row.rbFrequency) || 0, Number(row.vraFrequency) || 0)
  ), 0);
  const normalizer = Math.max(rbTotal, vraTotal, 1);
  const rbPeak = peakHistogramBin(bins, 'rbFrequency');
  const vraPeak = peakHistogramBin(bins, 'vraFrequency');

  return {
    rbPeakLabel: histogramPeakLabel(rbPeak),
    vraPeakLabel: histogramPeakLabel(vraPeak),
    overlapPct: overlapTotal / normalizer,
  };
}

function peakHistogramBin(bins, key) {
  return bins.reduce((best, row) => {
    const frequency = Number(row[key]) || 0;
    if (!best || frequency > best.frequency) {
      return { effectiveDistricts: row.effectiveDistricts, frequency };
    }
    return best;
  }, null);
}

function histogramPeakLabel(peak) {
  if (!peak) return 'N/A';
  return `${peak.effectiveDistricts} districts`;
}

function normalizeEiCandidateData(payload) {
  const candidateEntries = Object.entries(payload?.candidateResults || {});
  const groupNames = [...new Set(candidateEntries.flatMap(([, candidate]) => Object.keys(candidate.curves || {})))];
  const groups = groupNames.map((group) => ({ key: group, label: group, color: groupColor(group) }));
  const candidates = candidateEntries.map(([key, candidate]) => ({ key, label: candidate.label || key }));
  const series = Object.fromEntries(candidateEntries.map(([candidateKey, candidate]) => {
    const rowMap = new Map();
    Object.entries(candidate.curves || {}).forEach(([group, curve]) => {
      curve.forEach((point) => {
        const supportPct = valueToPercent(point.x);
        const row = rowMap.get(supportPct) || { supportPct };
        row[group] = Number(point.y);
        rowMap.set(supportPct, row);
      });
    });
    return [candidateKey, [...rowMap.values()].sort((left, right) => left.supportPct - right.supportPct)];
  }));
  const overlapRows = candidateEntries.flatMap(([candidateKey, candidate]) => {
    const seen = new Set();
    return Object.entries(candidate.overlapPct || {}).flatMap(([leftGroup, values]) => (
      Object.entries(values || {}).map(([rightGroup, overlapPct]) => {
        const pairKey = [leftGroup, rightGroup].sort().join('-');
        if (seen.has(pairKey)) return null;
        seen.add(pairKey);
        return {
          candidateKey,
          candidate: candidate.label || candidateKey,
          leftGroup,
          rightGroup,
          groupPair: `${leftGroup} / ${rightGroup}`,
          overlapPct,
        };
      }).filter(Boolean)
    ));
  });
  return { candidates, groups, series, overlapRows };
}

function normalizeRegressionLine(points) {
  if (!Array.isArray(points)) return EMPTY_LIST;
  return points
    .map((point) => ({ x: valueToPercent(point.x), y: valueToPercent(point.y) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

function ChartCard({ title, subtitle, children, nested = false }) {
  return (
    <div className={`chart-card ${nested ? 'chart-card--nested' : ''}`}>
      <h3 className="chart-title">
        {title}
        <span className="chart-subtitle">{subtitle}</span>
      </h3>
      {children}
    </div>
  );
}

function SelectControl({ id, label, value, options, onChange }) {
  const safeOptions = options?.length ? options : [];
  const safeValue = safeOptions.some((option) => option.value === value)
    ? value
    : (safeOptions[0]?.value ?? '');

  return (
    <div className="gingles-controls">
      <label htmlFor={id}>{label}</label>
      {safeOptions.length === 0 ? (
        <span className="analysis-note">No options available.</span>
      ) : (
        <select id={id} value={safeValue} onChange={(event) => onChange(event.target.value)}>
          {safeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}

/** Inline pill-toggle that swaps between the Race-Blind and VRA Constrained
 * ensembles. Replaces the global Ensemble dropdown that used to live in the
 * analysis toolbar. */
function EnsembleToggle({ ensembleType, onEnsembleTypeChange }) {
  const options = [
    { value: 'raceBlind', label: 'Race-Blind' },
    { value: 'vra', label: 'VRA Constrained' },
  ];
  return (
    <div className="ensemble-toggle" role="group" aria-label="Ensemble">
      <span className="ensemble-toggle__label">Ensemble</span>
      <div className="ensemble-toggle__group">
        {options.map((option) => {
          const isActive = ensembleType === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`ensemble-toggle__option ${isActive ? 'ensemble-toggle__option--active' : ''}`}
              onClick={() => onEnsembleTypeChange?.(option.value)}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function fmtPct1(n) {
  if (n == null || n === '') return 'N/A';
  const v = Number(n);
  return Number.isFinite(v) ? `${v.toFixed(1)}%` : 'N/A';
}

function BoxWhiskerTooltip({ active, payload, groupLabel }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="analysis-tooltip">
      <div className="analysis-tooltip__title">{row.district}</div>
      <div>{groupLabel} range: {fmtPct1(row.min)} to {fmtPct1(row.max)}</div>
      <div>Q1/Q3: {fmtPct1(row.q1)} / {fmtPct1(row.q3)}</div>
      <div>Median: {fmtPct1(row.median)}</div>
      <div>Enacted: {fmtPct1(row.enacted)}</div>
      {row.proposed != null && Number.isFinite(Number(row.proposed)) && (
        <div>Proposed: {Number(row.proposed).toFixed(1)}%</div>
      )}
    </div>
  );
}

function MinorityEffectivenessTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="analysis-tooltip">
      <div className="analysis-tooltip__title">{row.group} - {row.ensemble}</div>
      <div>Range: {row.min} to {row.max}</div>
      <div>Q1/Q3: {row.q1} / {row.q3}</div>
      <div>Median: {row.median}</div>
      <div>Enacted: {row.enacted}</div>
    </div>
  );
}

function MinorityHistogramTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const rb = Number(row.rbFrequency) || 0;
  const vra = Number(row.vraFrequency) || 0;

  return (
    <div className="analysis-tooltip">
      <div className="analysis-tooltip__title">{label} effective districts</div>
      <div>Race-Blind plans: {formatNumber(rb)}</div>
      <div>VRA plans: {formatNumber(vra)}</div>
      <div>Shared overlap: {formatNumber(Math.min(rb, vra))}</div>
    </div>
  );
}

function MinorityEffectivenessTick({ x, y, payload }) {
  const [group, ensemble] = String(payload?.value || '').split('|');
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#665643">
        <tspan x="0" dy="0" fontSize="10" fontWeight="800">{group}</tspan>
        <tspan x="0" dy="13" fontSize="9" fontWeight="700">{ensemble}</tspan>
      </text>
    </g>
  );
}

function GinglesScatterTooltip({ active, payload, groupLabel }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="analysis-tooltip">
      <div className="analysis-tooltip__title">{row.precinctId} ({row.district})</div>
      <div>{groupLabel}: {fmtPct1(row.x)}</div>
      <div>{row.party} vote: {fmtPct1(row.y)}</div>
      <div>{row.otherPartyLabel} vote: {fmtPct1(row.otherPartyShare)}</div>
    </div>
  );
}

function HiddenScatterPoint() {
  return null;
}

function EmptyTableRow({ colSpan, label }) {
  return (
    <tr>
      <td colSpan={colSpan}>{label}</td>
    </tr>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="analysis-kpi">
      <span className="analysis-kpi__label">{label}</span>
      <span className="analysis-kpi__value">{value}</span>
    </div>
  );
}

function valueToPercent(value, options = {}) {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (options.alreadyPercent) return numeric;
  return Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
}

function formatNumber(value) {
  if (value == null || value === '') return 'N/A';
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString() : 'N/A';
}

function formatPct(value, digits = 1, options = {}) {
  const percent = valueToPercent(value, options);
  return Number.isFinite(percent) ? `${percent.toFixed(digits)}%` : 'N/A';
}

function formatSignedNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 'N/A';
  return numeric > 0 ? `+${numeric}` : String(numeric);
}

function formatRatio(value, digits = 2) {
  if (value == null || value === '') return 'N/A';
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(digits) : 'N/A';
}

function groupColor(group) {
  const key = String(group).toLowerCase();
  if (key.includes('black')) return '#6f2da8';
  if (key.includes('hispanic')) return '#ef8c1a';
  if (key.includes('asian')) return '#0f8c75';
  if (key.includes('rb')) return '#64b5f6';
  if (key.includes('vra')) return '#7b1fa2';
  return '#4f7f9a';
}
