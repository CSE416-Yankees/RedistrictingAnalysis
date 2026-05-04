import { useMemo, useState } from 'react';
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
  analysisView,
  stateData,
  guiPayloads,
  isSummaryLoading,
  summaryError,
  highlightedDistrict,
  onHighlightDistrict,
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
        <BoxWhiskerChart payload={guiPayloads.boxWhisker} ensembleType={ensembleType} />
      )}
      {analysisView === 'ensembleSplits' && (
        <EnsembleSplitsChart
          payload={guiPayloads.ensembleSplits}
          summaryPayload={guiPayloads.stateSummary}
          selectedEnsembleType={ensembleType}
        />
      )}
      {analysisView === 'vraImpact' && (
        <VraImpactThresholdTable payload={guiPayloads.vraImpactThresholds} />
      )}
      {analysisView === 'minorityEffectivenessBox' && (
        <MinorityEffectivenessBoxChart payload={guiPayloads.minorityEffectivenessBox} />
      )}
      {analysisView === 'minorityEffectivenessHistogram' && (
        <MinorityEffectivenessHistogram payload={guiPayloads.minorityEffectivenessHistogram} />
      )}
      {analysisView === 'gingles' && (
        <GinglesSummary
          payload={guiPayloads.ginglesResults}
          tablePayload={guiPayloads.ginglesTable}
          highlightedPrecinct={highlightedGinglesPrecinct}
          onSelectPrecinct={setHighlightedGinglesPrecinct}
        />
      )}
      {analysisView === 'ginglesTable' && (
        <GinglesTable payload={guiPayloads.ginglesTable} highlightedPrecinct={highlightedGinglesPrecinct} />
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

function StateSummaryCard({ payload, stateData, isLoading, error }) {
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
              <th>Population %</th>
              <th>CVAP %</th>
            </tr>
          </thead>
          <tbody>
            {summary.demographicRows.map((row) => (
              <tr key={row.group}>
                <td>{row.group}</td>
                <td>{formatPct(row.populationPct, 1)}</td>
                <td>{formatPct(row.cvapPct, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--compact">
          <thead>
            <tr>
              <th>Ensemble</th>
              <th>District Plans</th>
              <th>Pop. Equality Threshold</th>
              <th>Black Rough Prop.</th>
              <th>Hispanic Rough Prop.</th>
              <th>Asian Rough Prop.</th>
            </tr>
          </thead>
          <tbody>
            {summary.ensembleRows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{formatNumber(row.planCount)}</td>
                <td>{formatPct(row.populationEqualityThresholdPct, 1, { alreadyPercent: true })}</td>
                <td>{formatRatio(row.roughProportionality.Black)}</td>
                <td>{formatRatio(row.roughProportionality.Hispanic)}</td>
                <td>{formatRatio(row.roughProportionality.Asian)}</td>
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
              <th>District #</th>
              <th>Representative</th>
              <th>Party</th>
              <th>Rep. Group</th>
              <th>Vote Margin %</th>
              <th>Effectiveness</th>
              <th>Calibrated</th>
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
                <td>{row.districtNumber}</td>
                <td>{row.representative}</td>
                <td>{row.party}</td>
                <td>{row.representativeGroup}</td>
                <td>{formatPct(row.voteMarginPct, 1, { alreadyPercent: true })}</td>
                <td>{formatRatio(row.effectivenessScore)}</td>
                <td>{formatRatio(row.calibratedEffectivenessScore)}</td>
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

function BoxWhiskerChart({ payload, ensembleType }) {
  const ensembleKey = ensembleType === 'vra' ? 'VRA' : 'RB';
  const groups = Object.keys(payload?.ensembles?.[ensembleKey]?.groups || {});
  const [selectedGroup, setSelectedGroup] = useState(groups[0] || 'Black');
  const activeGroup = groups.includes(selectedGroup) ? selectedGroup : groups[0];
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
      {groups.length > 0 && (
        <SelectControl
          id="box-whisker-group-select"
          label="Group"
          value={activeGroup || ''}
          options={groups.map((group) => ({ value: group, label: group }))}
          onChange={setSelectedGroup}
        />
      )}
      {rows.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
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

function EnsembleSplitsChart({ payload, summaryPayload, selectedEnsembleType }) {
  const rows = (payload?.splits || EMPTY_LIST).map((row) => ({
    ...row,
    splitLabel: `${row.repWins}R/${row.demWins}D`,
  }));
  const selectedKey = selectedEnsembleType === 'vra' ? 'VRA' : 'RB';
  const selectedSummary = summaryPayload?.ensembleSummaries?.[selectedKey];

  return (
    <ChartCard title="Ensemble Splits" subtitle="Race-Blind and VRA constrained simulated election split frequencies">
      <div className="analysis-summary-grid">
        <div className="analysis-summary-card">
          <span className="analysis-summary-card__label">Comparison</span>
          <span className="analysis-summary-card__value">Race-Blind vs VRA Constrained</span>
        </div>
        <div className="analysis-summary-card">
          <span className="analysis-summary-card__label">Selected Ensemble Metadata</span>
          <span className="analysis-summary-card__value">
            {ENSEMBLE_LABELS[selectedKey]} / {formatPct(selectedSummary?.populationEqualityThresholdPct, 1, { alreadyPercent: true })}
          </span>
        </div>
      </div>
      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--compact">
          <thead>
            <tr>
              <th>Ensemble</th>
              <th>District Plans</th>
              <th>Population Equality Threshold</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summaryPayload?.ensembleSummaries || {}).map(([key, row]) => (
              <tr key={key} className={key === selectedKey ? 'analysis-table__row--active' : ''}>
                <td>{ENSEMBLE_LABELS[key] || key}</td>
                <td>{formatNumber(row.planCount)}</td>
                <td>{formatPct(row.populationEqualityThresholdPct, 1, { alreadyPercent: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 0 ? (
        <ResponsiveContainer width="100%" height={320}>
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

function VraImpactThresholdTable({ payload }) {
  const rows = useMemo(() => payload?.rows || EMPTY_LIST, [payload?.rows]);
  const [selectedGroup, setSelectedGroup] = useState(rows[0]?.group || 'Black');

  const effectiveGroup =
    rows.length === 0
      ? selectedGroup
      : rows.some((row) => row.group === selectedGroup)
        ? selectedGroup
        : rows[0].group;

  const activeRow = rows.find((row) => row.group === effectiveGroup) || rows[0];
  const metricRows = activeRow
    ? [
      ['Enacted effective-district threshold', activeRow.enactedThreshold],
      ['Rough proportionality threshold', activeRow.roughProportionality],
      ['Joint threshold', activeRow.jointThreshold],
    ]
    : EMPTY_LIST;

  return (
    <ChartCard title="VRA Impact Thresholds" subtitle="Legal threshold percentages compared side-by-side by ensemble">
      {rows.length > 0 && (
        <SelectControl
          id="vra-impact-group-select"
          label="Feasible Race"
          value={effectiveGroup || ''}
          options={rows.map((row) => ({ value: row.group, label: row.group }))}
          onChange={setSelectedGroup}
        />
      )}
      <div className="analysis-table-wrap">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Metric</th>
              <th>Race-Blind</th>
              <th>VRA Constrained</th>
            </tr>
          </thead>
          <tbody>
            {metricRows.map(([metric, values]) => (
              <tr key={metric}>
                <td>{activeRow?.group}</td>
                <td>{metric}</td>
                <td>{formatPct(values?.rbPct, 1)}</td>
                <td>{formatPct(values?.vraPct, 1)}</td>
              </tr>
            ))}
            {metricRows.length === 0 && <EmptyTableRow colSpan={4} label="No VRA impact threshold rows are available." />}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

function MinorityEffectivenessBoxChart({ payload }) {
  const rows = normalizeMinorityEffectivenessBoxes(payload);

  return (
    <ChartCard title="Minority Effectiveness Box & Whisker" subtitle="Effective districts by feasible group across RB and VRA ensembles">
      {rows.length > 0 ? (
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={rows} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
            <YAxis
              domain={[0, payload?.districtCount || 'auto']}
              tick={{ fontSize: 11 }}
              label={{ value: 'Effective Districts', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip content={(props) => <MinorityEffectivenessTooltip {...props} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="iqrBase" stackId="box" fill="transparent" legendType="none" />
            <Bar dataKey="iqrHeight" stackId="box" name="IQR (Q1-Q3)" radius={[4, 4, 0, 0]}>
              {rows.map((row) => (
                <Cell key={row.label} fill={row.ensemble === 'RB' ? '#64b5f6' : '#7b1fa2'} fillOpacity={0.34} />
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
    </ChartCard>
  );
}

function MinorityEffectivenessHistogram({ payload }) {
  const groupNames = useMemo(() => Object.keys(payload?.groupHistograms || {}), [payload?.groupHistograms]);
  const [selectedGroup, setSelectedGroup] = useState(groupNames[0] || 'Black');

  const activeGroup =
    groupNames.length === 0
      ? selectedGroup
      : groupNames.includes(selectedGroup)
        ? selectedGroup
        : groupNames[0];
  const bins = payload?.groupHistograms?.[activeGroup]?.bins || EMPTY_LIST;

  return (
    <ChartCard title="Minority Effectiveness Histogram" subtitle="Distribution overlap of minority-effective district counts">
      {groupNames.length > 0 && (
        <SelectControl
          id="minority-histogram-group-select"
          label="Group"
          value={activeGroup || ''}
          options={groupNames.map((group) => ({ value: group, label: group }))}
          onChange={setSelectedGroup}
        />
      )}
      {bins.length > 0 ? (
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={bins} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="effectiveDistricts"
              tick={{ fontSize: 11 }}
              label={{ value: 'Minority-Effective Districts', position: 'insideBottom', offset: -5, fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Plans', angle: -90, position: 'insideLeft', fontSize: 12 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="rbFrequency" name="Race-Blind" fill="#64b5f6" fillOpacity={0.64} radius={[4, 4, 0, 0]} />
            <Bar dataKey="vraFrequency" name="VRA Constrained" fill="#7b1fa2" fillOpacity={0.54} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="analysis-note">Minority effectiveness histogram data is not available.</p>
      )}
    </ChartCard>
  );
}

function GinglesSummary({
  payload,
  tablePayload,
  highlightedPrecinct,
  onSelectPrecinct,
}) {
  const groups = Object.keys(payload?.groups || {});
  const [selectedGroup, setSelectedGroup] = useState(groups[0] || 'Black');
  const activeGroup = groups.includes(selectedGroup) ? selectedGroup : groups[0];
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

  return (
    <ChartCard title="Gingles Analysis Results" subtitle="2024 precinct-level vote share by selected racial/ethnic group">
      {groups.length > 0 && (
        <SelectControl
          id="gingles-group-select"
          label="Race/Ethnic Group"
          value={activeGroup || ''}
          options={groups.map((group) => ({ value: group, label: group }))}
          onChange={setSelectedGroup}
        />
      )}
      {points.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
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
        maxRows={28}
        title="Gingles 2/3 Precinct Inputs"
        subtitle={highlightedPrecinct ? `Selected precinct: ${highlightedPrecinct}` : 'Click a scatter point to highlight its precinct row'}
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
  const rows = maxRows
    ? prioritizeHighlightedRow(sourceRows, highlightedPrecinct).slice(0, maxRows)
    : sourceRows;

  return (
    <ChartCard title={title} subtitle={subtitle} nested={nested}>
      <div className={`analysis-table-wrap ${maxRows ? 'analysis-table-wrap--scroll' : ''}`}>
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Precinct ID</th>
              <th>Precinct Name</th>
              <th>Total Pop.</th>
              <th>Minority Pop.</th>
              <th>Rep Votes</th>
              <th>Dem Votes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${String(row.precinctId)}:${index}`}
                className={String(row.precinctId) === String(highlightedPrecinct) ? 'analysis-table__row--active' : ''}
              >
                <td>{row.precinctId}</td>
                <td>{row.precinctName}</td>
                <td>{formatNumber(row.totalPopulation)}</td>
                <td>{formatNumber(row.minorityPopulation)}</td>
                <td>{formatNumber(row.republicanVotes)}</td>
                <td>{formatNumber(row.democraticVotes)}</td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyTableRow colSpan={6} label="Gingles table rows are not available." />}
          </tbody>
        </table>
      </div>
      {maxRows && sourceRows.length > rows.length && (
        <p className="analysis-note">Showing {rows.length} of {sourceRows.length} precinct rows.</p>
      )}
    </ChartCard>
  );
}

function EICandidateResults({ payload }) {
  const normalized = useMemo(() => normalizeEiCandidateData(payload), [payload]);
  const candidateOptions = normalized.candidates;
  const groupOptions = normalized.groups;
  const [selectedCandidate, setSelectedCandidate] = useState(candidateOptions[0]?.key || '');
  const [selectedGroups, setSelectedGroups] = useState(() => groupOptions.slice(0, 3).map((group) => group.key));

  const activeCandidateKey =
    candidateOptions.length > 0 && candidateOptions.some((c) => c.key === selectedCandidate)
      ? selectedCandidate
      : (candidateOptions[0]?.key || '');
  const activeSeries = normalized.series[activeCandidateKey] || EMPTY_LIST;
  const visibleGroupKeys = selectedGroups.filter((key) => groupOptions.some((group) => group.key === key));
  const fallbackGroupKeys = groupOptions[0] ? [groupOptions[0].key] : EMPTY_LIST;
  const selectedGroupKeys = visibleGroupKeys.length > 0 ? visibleGroupKeys : fallbackGroupKeys;
  const visibleGroups = groupOptions.filter((group) => selectedGroupKeys.includes(group.key));

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
                <th>Curve Overlap</th>
              </tr>
            </thead>
            <tbody>
              {normalized.overlapRows.map((row) => (
                <tr key={`${row.candidate}-${row.groupPair}`}>
                  <td>{row.candidate}</td>
                  <td>{row.groupPair}</td>
                  <td>{formatPct(row.overlapPct, 1)}</td>
                </tr>
              ))}
              {normalized.overlapRows.length === 0 && <EmptyTableRow colSpan={3} label="EI overlap rows are not available." />}
            </tbody>
          </table>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="EI Candidate Results" subtitle="Candidate-specific probability curves by racial/ethnic group">
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

      {activeSeries.length > 0 ? (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={activeSeries} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="supportPct"
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
              label={{ value: 'Group Vote for Candidate (%)', position: 'insideBottom', offset: -5, fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Probability', angle: -90, position: 'insideLeft', fontSize: 12 }} />
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
                fillOpacity={0.14}
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <p className="analysis-note">EI candidate distribution data is not available.</p>
      )}

      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--compact">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Group Pair</th>
              <th>Curve Overlap</th>
            </tr>
          </thead>
          <tbody>
            {normalized.overlapRows.map((row) => (
              <tr key={`${row.candidate}-${row.groupPair}`}>
                <td>{row.candidate}</td>
                <td>{row.groupPair}</td>
                <td>{formatPct(row.overlapPct, 1)}</td>
              </tr>
            ))}
            {normalized.overlapRows.length === 0 && <EmptyTableRow colSpan={3} label="EI overlap rows are not available." />}
          </tbody>
        </table>
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
          candidate: candidate.label || candidateKey,
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

function prioritizeHighlightedRow(rows, highlightedPrecinct) {
  if (!highlightedPrecinct) return rows;
  const selected = rows.find((row) => String(row.precinctId) === String(highlightedPrecinct));
  if (!selected) return rows;
  return [selected, ...rows.filter((row) => String(row.precinctId) !== String(highlightedPrecinct))];
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
