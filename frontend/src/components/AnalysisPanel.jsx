import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ScatterChart,
  Scatter,
  ErrorBar,
} from 'recharts';
import { ensembleData } from '../data/mockData';
import './AnalysisPanel.css';

const EMPTY_LIST = [];

export default function AnalysisPanel({
  stateAbbr,
  ensembleType,
  analysisView,
  serverSummary,
  isSummaryLoading,
  summaryError,
  highlightedDistrict,
  onHighlightDistrict,
}) {
  const data = ensembleData[stateAbbr];
  if (!data) return <div className="analysis-panel"><div className="analysis-panel__empty">No analysis data is available for this state yet.</div></div>;

  const current = data[ensembleType];

  return (
    <div className="analysis-panel">
      {analysisView === 'stateSummary' && (
        <StateSummaryCard
          serverSummary={serverSummary}
          isSummaryLoading={isSummaryLoading}
          summaryError={summaryError}
        />
      )}
      {analysisView === 'boxWhisker' && (
        <BoxWhiskerChart data={current.boxWhisker} ensembleType={ensembleType} />
      )}
      {analysisView === 'ensembleSplits' && (
        <EnsembleSplitsChart
          data={current.ensembleSplits}
          ensembleCatalog={data}
          selectedEnsembleType={ensembleType}
        />
      )}
      {analysisView === 'voteSeatCurve' && (
        <VoteSeatCurveChart data={current.voteSeatCurve} ensembleType={ensembleType} />
      )}
      {analysisView === 'congressional' && (
        <CongressionalTable rows={stateData.congressionalRepresentation} />
      )}
      {analysisView === 'gingles' && (
        <GinglesSummary summary={current.gingles.summary} scatterData={current.gingles.scatter} />
      )}
      {analysisView === 'ginglesTable' && (
        <GinglesTable
          rows={current.gingles.rows}
          highlightedDistrict={highlightedDistrict}
          onHighlightDistrict={onHighlightDistrict}
        />
      )}
      {analysisView === 'eiCandidates' && (
        <EICandidateResults data={current.ei.candidateSupport} density={current.ei.candidateDensity} />
      )}
      {analysisView === 'eiPrecinctBar' && (
        <EIPrecinctBarChart data={current.ei.precinctBar} />
      )}
      {analysisView === 'eiKde' && (
        <EIKdeChart data={current.ei.kde} />
      )}
      {analysisView === 'seatShare' && (
        <SeatShareChart data={current.seatShare} />
      )}
      {analysisView === 'opportunity' && (
        <OpportunityChart data={current.opportunityDistricts} />
      )}
      {analysisView === 'comparison' && (
        <ComparisonChart data={data} />
      )}
    </div>
  );
}

function StateSummaryCard({ serverSummary, isSummaryLoading, summaryError }) {
  // 1. Loading state: show a clear loading message instead of mock values.
  if (isSummaryLoading) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">
          State Data Summary
          <span className="chart-subtitle">
            Population, demographics, party-control context, and statewide Dem-vs-Rep estimate
          </span>
        </h3>
        <p className="analysis-note">Loading server-backed state summary&hellip;</p>
      </div>
    );
  }

  // 2. Error or missing data: show an error/unavailable state.
  if (!serverSummary) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">
          State Data Summary
          <span className="chart-subtitle">
            Population, demographics, party-control context, and statewide Dem-vs-Rep estimate
          </span>
        </h3>
        <p className="analysis-note">
          {summaryError || 'State summary is currently unavailable from the server.'}
        </p>
      </div>
    );
  }

  // 3. Success: drive the entire card from serverSummary only.

  // Population
  const populationValue = Number.isFinite(serverSummary.population)
    ? serverSummary.population.toLocaleString()
    : 'N/A';

  // Congressional districts
  const congressionalDistricts = Number.isFinite(serverSummary.congressionalDistricts)
    ? serverSummary.congressionalDistricts
    : 'N/A';

  // Avg Minority %
  const avgMinority = Number.isFinite(serverSummary.avgMinorityPct)
    ? serverSummary.avgMinorityPct
    : null;

  // Avg Dem Vote %
  const avgDem = Number.isFinite(serverSummary.avgDemVotePct)
    ? serverSummary.avgDemVotePct
    : null;

  // Opportunity Districts
  const opportunityDistricts = Number.isFinite(serverSummary.opportunityDistricts)
    ? serverSummary.opportunityDistricts
    : 'N/A';

  // Preclearance
  const preclearance = typeof serverSummary.preclearance === 'boolean'
    ? serverSummary.preclearance
    : null;

  // Congressional representation by party
  const serverDemSeats = serverSummary.representativeSummary?.democrats;
  const serverRepSeats = serverSummary.representativeSummary?.republicans;
  const representativesByParty = {
    Dem: Number.isFinite(serverDemSeats) ? serverDemSeats : 'N/A',
    Rep: Number.isFinite(serverRepSeats) ? serverRepSeats : 'N/A',
  };

  // Statewide vote (fractions on backend, percentages in UI)
  let statewideVote = { dem: 0, rep: 0 };
  if (serverSummary.statewideVote) {
    const demPct = serverSummary.statewideVote.democraticPct * 100;
    const repPct = serverSummary.statewideVote.republicanPct * 100;
    if (Number.isFinite(demPct) && Number.isFinite(repPct)) {
      const total = demPct + repPct;
      const normDem = total > 0 ? (demPct / total) * 100 : demPct;
      const normRep = total > 0 ? (repPct / total) * 100 : repPct;
      statewideVote = {
        dem: Number(normDem.toFixed(1)),
        rep: Number(normRep.toFixed(1)),
      };
    }
  }

  // Party control text
  const redistrictingControl = serverSummary.redistrictingControl || 'N/A';

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        State Data Summary
        <span className="chart-subtitle">
          Population, demographics, party-control context, and statewide Dem-vs-Rep estimate
        </span>
      </h3>
      <div className="analysis-kpi-grid">
        <Kpi label="Population" value={populationValue} />
        <Kpi label="Congressional Districts" value={congressionalDistricts} />
        <Kpi label="Avg Minority %" value={avgMinority != null ? `${avgMinority.toFixed(1)}%` : 'N/A'} />
        <Kpi label="Avg Dem Vote %" value={avgDem != null ? `${avgDem.toFixed(1)}%` : 'N/A'} />
        <Kpi label="Opportunity Districts" value={opportunityDistricts} />
        <Kpi label="Preclearance" value={preclearance != null ? (preclearance ? 'Yes' : 'No') : 'N/A'} />
      </div>
      <div className="analysis-summary-grid">
        <div className="analysis-summary-card">
          <span className="analysis-summary-card__label">Congressional Representatives by Party</span>
          <span className="analysis-summary-card__value">
            Dem: {representativesByParty.Dem} • Rep: {representativesByParty.Rep}
          </span>
        </div>
        <div className="analysis-summary-card">
          <span className="analysis-summary-card__label">Party Control of Redistricting Process</span>
          <span className="analysis-summary-card__value">{redistrictingControl}</span>
        </div>
      </div>
      <div className="analysis-voter-dist">
        <span className="analysis-voter-dist__label">
          State Voter Distribution (Dem vs Rep, estimated statewide vote)
        </span>
        <div className="analysis-voter-dist__bar">
          <div
            className="analysis-voter-dist__segment analysis-voter-dist__segment--dem"
            style={{ width: `${statewideVote.dem}%` }}
          />
          <div
            className="analysis-voter-dist__segment analysis-voter-dist__segment--rep"
            style={{ width: `${statewideVote.rep}%` }}
          />
        </div>
        <div className="analysis-voter-dist__values">
          <span>Dem {statewideVote.dem.toFixed(1)}%</span>
          <span>Rep {statewideVote.rep.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

function BoxWhiskerChart({ data, ensembleType }) {
  const label = ensembleType === 'vra' ? 'VRA Constrained' : 'Race-Blind';
  const groups = data?.groups || EMPTY_LIST;
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.key || 'minorityPct');
  const activeGroup = useMemo(
    () => groups.find((group) => group.key === selectedGroup) || groups[0],
    [groups, selectedGroup],
  );
  const groupRows = useMemo(
    () => data?.byGroup?.[activeGroup?.key] || EMPTY_LIST,
    [data, activeGroup],
  );
  const boxColor = activeGroup?.color || '#4f7f9a';

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        District Distribution (Box & Whisker)
        <span className="chart-subtitle">
          {label} ensemble, ordered by enacted-plan percentage for selected group
        </span>
      </h3>
      {groups.length > 0 && (
        <div className="gingles-controls">
          <label htmlFor="box-whisker-group-select">Group</label>
          <select
            id="box-whisker-group-select"
            value={activeGroup?.key || ''}
            onChange={(event) => setSelectedGroup(event.target.value)}
          >
            {groups.map((group) => (
              <option key={group.key} value={group.key}>{group.label}</option>
            ))}
          </select>
        </div>
      )}
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={groupRows} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="district" tick={{ fontSize: 12 }} />
          <YAxis
            label={{ value: `${activeGroup?.label || 'Minority'} in District (%)`, angle: -90, position: 'insideLeft', fontSize: 12 }}
            tick={{ fontSize: 11 }}
            domain={[0, 100]}
          />
          <Tooltip content={(props) => <BoxWhiskerTooltip {...props} groupLabel={activeGroup?.label || 'Minority %'} />} />
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
          <Scatter
            dataKey="median"
            name="Median + Whiskers (Min/Max)"
            fill={boxColor}
            shape="diamond"
            isAnimationActive={false}
          >
            <ErrorBar dataKey="whisker" direction="y" width={8} stroke={boxColor} strokeWidth={1.5} />
          </Scatter>
          <Scatter
            dataKey="enacted"
            name="Enacted Plan Dot"
            fill="#111827"
            shape="circle"
            isAnimationActive={false}
          />
          <Scatter
            dataKey="proposed"
            name="Proposed Plan Dot"
            fill="#d97706"
            shape="triangle"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="analysis-note">
        Enacted and proposed dots use current and comparison district plans. Data is mock until ensemble outputs are connected.
      </p>
    </div>
  );
}

function VoteSeatCurveChart({ data, ensembleType }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Vote Share vs Seat Share Curve
        <span className="chart-subtitle">
          {ensembleType === 'vra' ? 'VRA Constrained' : 'Race-Blind'} responsiveness curve
        </span>
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="voteShare"
            tick={{ fontSize: 11 }}
            label={{ value: 'Vote Share %', position: 'insideBottom', offset: -5, fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            label={{ value: 'Seat Share %', angle: -90, position: 'insideLeft', fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="seatShare" name="Observed Seat Share" stroke="#1e88e5" strokeWidth={2.5} dot={{ r: 2 }} />
          <Line type="monotone" dataKey="proportional" name="Proportional Baseline" stroke="#6b7280" strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function EnsembleSplitsChart({ data, ensembleCatalog, selectedEnsembleType }) {
  const availableRows = [
    { key: 'raceBlind', label: 'Race-Blind', details: ensembleCatalog?.raceBlind || {} },
    { key: 'vra', label: 'VRA Constrained', details: ensembleCatalog?.vra || {} },
  ];
  const selectedRow = availableRows.find((row) => row.key === selectedEnsembleType) || availableRows[0];

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Ensemble Splits
        <span className="chart-subtitle">Distribution of simulated seat outcomes</span>
      </h3>
      <div className="analysis-summary-grid">
        <div className="analysis-summary-card">
          <span className="analysis-summary-card__label">Selected Ensemble</span>
          <span className="analysis-summary-card__value">{selectedRow?.label || 'N/A'}</span>
        </div>
        <div className="analysis-summary-card">
          <span className="analysis-summary-card__label">Population Equality Threshold</span>
          <span className="analysis-summary-card__value">
            {selectedRow?.details?.populationEqualityThresholdPct != null
              ? `${selectedRow.details.populationEqualityThresholdPct}%`
              : 'TBD'}
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
            {availableRows.map((row) => (
              <tr key={row.key} className={row.key === selectedEnsembleType ? 'analysis-table__row--active' : ''}>
                <td>{row.label}</td>
                <td>{row.details.totalPlans ?? 'TBD'}</td>
                <td>{row.details.populationEqualityThresholdPct != null ? `${row.details.populationEqualityThresholdPct}%` : 'TBD'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="analysis-note">
        MCMC threshold and plan counts are mock placeholders until final ensemble metadata is connected.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data || EMPTY_LIST} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="seatsWonByRep" tick={{ fontSize: 11 }} />
          <YAxis
            label={{ value: 'Plans', angle: -90, position: 'insideLeft', fontSize: 12 }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Bar dataKey="plans" name="Plans" radius={[4, 4, 0, 0]}>
            {(data || EMPTY_LIST).map((row, i) => (
              <Cell key={i} fill={row.seatsWonByRep > row.seatsWonByDem ? '#e53935' : '#1e88e5'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CongressionalTable({ rows }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Congressional Representation
        <span className="chart-subtitle">Enacted-plan district representatives, party, group, and vote margin</span>
      </h3>
      <div className="analysis-table-wrap">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>District #</th>
              <th>Representative</th>
              <th>Party</th>
              <th>Rep Racial/Ethnic Group</th>
              <th>Vote Margin %</th>
              <th>Dem Vote %</th>
              <th>Rep Vote %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.district}>
                <td>{row.districtNumber}</td>
                <td>{row.representative}</td>
                <td>{row.party}</td>
                <td>{row.representativeRaceEthnicity}</td>
                <td>{row.voteMarginPct.toFixed(1)}%</td>
                <td>{row.demVotePct.toFixed(1)}%</td>
                <td>{row.repVotePct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="analysis-note">Representative names/groups are mock placeholders until final enacted-plan records are connected.</p>
    </div>
  );
}

function GinglesSummary({ summary, scatterData }) {
  const groups = scatterData?.groups || EMPTY_LIST;
  const points = scatterData?.points || EMPTY_LIST;
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.key || 'blackPct');
  const activeGroup = useMemo(
    () => groups.find((group) => group.key === selectedGroup) || groups[0],
    [groups, selectedGroup],
  );
  const groupKey = activeGroup?.key || 'blackPct';
  const groupLabel = activeGroup?.label || 'Minority';
  const demPoints = useMemo(
    () => points
      .map((point) => ({
        x: Number(point[groupKey]),
        y: Number(point.demVoteShare),
        precinctId: point.precinctId,
        district: point.district,
        party: 'Democratic',
        otherPartyLabel: 'Republican',
        otherPartyShare: Number(point.repVoteShare),
      }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y)),
    [points, groupKey],
  );
  const repPoints = useMemo(
    () => points
      .map((point) => ({
        x: Number(point[groupKey]),
        y: Number(point.repVoteShare),
        precinctId: point.precinctId,
        district: point.district,
        party: 'Republican',
        otherPartyLabel: 'Democratic',
        otherPartyShare: Number(point.demVoteShare),
      }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y)),
    [points, groupKey],
  );
  const demTrend = useMemo(
    () => buildQuadraticTrend(points, groupKey, 'demVoteShare'),
    [points, groupKey],
  );
  const repTrend = useMemo(
    () => buildQuadraticTrend(points, groupKey, 'repVoteShare'),
    [points, groupKey],
  );
  const statusText = summary.likelyVraViolation ? 'Potential VRA issue flagged' : 'No immediate VRA issue flagged';
  const statusClass = summary.likelyVraViolation ? 'analysis-kpi__value--warn' : 'analysis-kpi__value--ok';

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Gingles Analysis Results
        <span className="chart-subtitle">
          2024 precinct-level vote share by selected racial/ethnic group
        </span>
      </h3>
      {groups.length > 0 && (
        <div className="gingles-controls">
          <label htmlFor="gingles-group-select">Race/Ethnic Group</label>
          <select
            id="gingles-group-select"
            value={groupKey}
            onChange={(event) => setSelectedGroup(event.target.value)}
          >
            {groups.map((group) => (
              <option key={group.key} value={group.key}>{group.label}</option>
            ))}
          </select>
        </div>
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
              label={{
                value: `${groupLabel} Share in Precinct (%)`,
                position: 'insideBottom',
                offset: -6,
                fontSize: 12,
              }}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
              label={{
                value: 'Party Vote Share (%)',
                angle: -90,
                position: 'insideLeft',
                fontSize: 12,
              }}
            />
            <Tooltip
              content={(props) => <GinglesScatterTooltip {...props} groupLabel={groupLabel} />}
              cursor={{ strokeDasharray: '4 4', stroke: '#cab79f' }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Scatter name="Democratic Vote" data={demPoints} fill="#1e88e5" fillOpacity={0.34} />
            <Scatter name="Republican Vote" data={repPoints} fill="#e53935" fillOpacity={0.34} />
            <Scatter
              name="Democratic Trend (Quadratic)"
              data={demTrend}
              fill="transparent"
              line={{ stroke: '#1565c0', strokeWidth: 2.2 }}
              lineType="joint"
              legendType="line"
              shape={<HiddenScatterPoint />}
              isAnimationActive={false}
            />
            <Scatter
              name="Republican Trend (Quadratic)"
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
        <p className="analysis-note">Precinct-level Gingles chart data is not available for this state.</p>
      )}
      <p className="analysis-note">
        Points and trend lines are placeholders until final precinct-level 2024 election records are connected.
      </p>
      <div className="analysis-kpi-grid">
        <Kpi label="Precondition 1 (MM Districts)" value={summary.precondition1MajorityMinorityDistricts} />
        <Kpi label="Precondition 2 (Cohesion)" value={summary.precondition2PoliticalCohesion.toFixed(2)} />
        <Kpi label="Precondition 3 (Bloc Voting)" value={summary.precondition3BlocVoting.toFixed(2)} />
        <Kpi label="Compactness" value={summary.compactnessScore.toFixed(2)} />
      </div>
      <div className={`analysis-kpi__value ${statusClass}`}>{statusText}</div>
    </div>
  );
}

function GinglesTable({ rows, highlightedDistrict, onHighlightDistrict }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Gingles 2/3 Data Table
        <span className="chart-subtitle">Click a row to highlight district on map</span>
      </h3>
      <div className="analysis-table-wrap">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>District</th>
              <th>Minority %</th>
              <th>Cohesion</th>
              <th>Bloc Voting</th>
              <th>Crossover</th>
              <th>Threshold</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const districtId = districtLabelToId(row.district);
              return (
                <tr
                  key={row.district}
                  className={districtId === highlightedDistrict ? 'analysis-table__row--active' : ''}
                  onClick={() => districtId != null && onHighlightDistrict(districtId)}
                >
                  <td>{row.district}</td>
                  <td>{row.minorityPct}%</td>
                  <td>{row.cohesion.toFixed(2)}</td>
                  <td>{row.blocVoting.toFixed(2)}</td>
                  <td>{row.crossoverSupport.toFixed(2)}</td>
                  <td>{row.thresholdMet ? 'Yes' : 'No'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EICandidateResults({ data, density }) {
  const candidateOptions = density?.candidates || EMPTY_LIST;
  const groupOptions = density?.groups || EMPTY_LIST;
  const [selectedCandidate, setSelectedCandidate] = useState(candidateOptions[0]?.key || '');
  const [selectedGroups, setSelectedGroups] = useState(
    groupOptions.slice(0, Math.min(3, groupOptions.length)).map((group) => group.key),
  );

  const activeCandidate = useMemo(
    () => candidateOptions.find((candidate) => candidate.key === selectedCandidate) || candidateOptions[0],
    [candidateOptions, selectedCandidate],
  );
  const activeCandidateKey = activeCandidate?.key || '';
  const activeSeries = useMemo(
    () => density?.series?.[activeCandidateKey] || EMPTY_LIST,
    [density, activeCandidateKey],
  );
  const visibleGroupKeys = useMemo(() => {
    const allowedKeys = new Set(groupOptions.map((group) => group.key));
    const filtered = selectedGroups.filter((key) => allowedKeys.has(key));
    if (filtered.length > 0) return filtered;
    return groupOptions[0] ? [groupOptions[0].key] : EMPTY_LIST;
  }, [groupOptions, selectedGroups]);
  const visibleGroups = useMemo(
    () => groupOptions.filter((group) => visibleGroupKeys.includes(group.key)),
    [groupOptions, visibleGroupKeys],
  );

  const toggleGroup = (key) => {
    setSelectedGroups((current) => {
      if (current.includes(key)) {
        if (current.length === 1) return current;
        return current.filter((entry) => entry !== key);
      }
      return [...current, key];
    });
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        EI Candidate Results
        <span className="chart-subtitle">
          Candidate-specific probability curves by racial/ethnic group
        </span>
      </h3>
      <div className="ei-controls">
        <div className="ei-controls__item">
          <label htmlFor="ei-candidate-select">Candidate</label>
          <select
            id="ei-candidate-select"
            value={activeCandidateKey}
            onChange={(event) => setSelectedCandidate(event.target.value)}
          >
            {candidateOptions.map((candidate) => (
              <option key={candidate.key} value={candidate.key}>
                {candidate.label}
              </option>
            ))}
          </select>
        </div>
        <div className="ei-controls__item">
          <span className="ei-controls__label">Groups to Compare</span>
          <div className="ei-group-toggle">
            {groupOptions.map((group) => {
              const selected = visibleGroupKeys.includes(group.key);
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
            <YAxis
              tick={{ fontSize: 11 }}
              label={{ value: 'Probability', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
              labelFormatter={(value) => `Support: ${value}%`}
              formatter={(value, name) => [Number(value).toFixed(2), `${name} density`]}
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
        <p className="analysis-note">EI candidate distribution data is not available for this state.</p>
      )}
      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--compact">
          <thead>
            <tr>
              <th>District</th>
              {candidateOptions.map((candidate) => (
                <th key={candidate.key}>{candidate.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const valuesByKey = row.values.reduce((acc, candidate) => {
                acc[toCandidateKey(candidate.candidate)] = candidate.supportPct;
                return acc;
              }, {});
              return (
                <tr key={row.district}>
                  <td>{row.district}</td>
                  {candidateOptions.map((candidate) => (
                    <td key={candidate.key}>
                      {Number(valuesByKey[candidate.key] || 0).toFixed(1)}%
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="analysis-note">
        Density curves are mock placeholders until full EI posterior distributions are connected.
      </p>
    </div>
  );
}

function EIPrecinctBarChart({ data }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        EI Precinct Results (Bar Chart)
        <span className="chart-subtitle">Turnout estimates by precinct cohort</span>
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="precinct" tick={{ fontSize: 11 }} />
          <YAxis
            label={{ value: 'Turnout %', angle: -90, position: 'insideLeft', fontSize: 12 }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="minorityTurnoutPct" name="Minority turnout %" fill="#7b1fa2" radius={[4, 4, 0, 0]} />
          <Bar dataKey="whiteTurnoutPct" name="White turnout %" fill="#78909c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EIKdeChart({ data }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        EI KDE Results
        <span className="chart-subtitle">Kernel density estimate score by district</span>
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="district" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Line type="monotone" dataKey="score" name="KDE score" stroke="#00897b" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SeatShareChart({ data }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Republican/Democrat Seat Share
        <span className="chart-subtitle">Distribution across ensemble plans</span>
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="split" tick={{ fontSize: 11 }} />
          <YAxis
            label={{ value: 'Plans', angle: -90, position: 'insideLeft', fontSize: 12 }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Bar dataKey="frequency" name="Plans" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => {
              const mid = Math.floor(data.length / 2);
              const color = i < mid ? '#1e88e5' : i > mid ? '#e53935' : '#9e9e9e';
              return <Cell key={i} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function OpportunityChart({ data }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Number of Opportunity Districts
        <span className="chart-subtitle">Districts with &ge;37% minority voting-age population</span>
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="opportunityDistricts"
            label={{ value: 'Opportunity Districts', position: 'insideBottom', offset: -5, fontSize: 12 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Plans', angle: -90, position: 'insideLeft', fontSize: 12 }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Bar dataKey="plans" name="Plans" fill="#ff9800" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ComparisonChart({ data }) {
  const raceBlind = data.raceBlind.opportunityDistricts;
  const vra = data.vra.opportunityDistricts;
  const maxLen = Math.max(raceBlind.length, vra.length);
  const merged = [];
  for (let i = 0; i < maxLen; i++) {
    merged.push({
      opportunityDistricts: i,
      raceBlind: raceBlind[i]?.plans || 0,
      vra: vra[i]?.plans || 0,
    });
  }

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Ensemble Comparison: Race-Blind vs VRA
        <span className="chart-subtitle">Opportunity district distribution overlay</span>
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={merged} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="opportunityDistricts"
            label={{ value: 'Opportunity Districts', position: 'insideBottom', offset: -5, fontSize: 12 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Plans', angle: -90, position: 'insideLeft', fontSize: 12 }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="raceBlind" name="Race-Blind" fill="#64b5f6" opacity={0.7} radius={[4, 4, 0, 0]} />
          <Bar dataKey="vra" name="VRA Constrained" fill="#7b1fa2" opacity={0.7} radius={[4, 4, 0, 0]} />
          <Line dataKey="raceBlind" name="Race-Blind Trend" stroke="#1565c0" strokeWidth={2} dot={false} />
          <Line dataKey="vra" name="VRA Trend" stroke="#4a148c" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="comparison-stats">
        <div className="comparison-stat">
          <span className="comparison-stat__label">Race-Blind Avg Opportunity Districts</span>
          <span className="comparison-stat__value" style={{ color: '#1565c0' }}>
            {data.raceBlind.avgOpportunityDistricts}
          </span>
        </div>
        <div className="comparison-stat">
          <span className="comparison-stat__label">VRA Avg Opportunity Districts</span>
          <span className="comparison-stat__value" style={{ color: '#7b1fa2' }}>
            {data.vra.avgOpportunityDistricts}
          </span>
        </div>
        <div className="comparison-stat">
          <span className="comparison-stat__label">Total Plans (each)</span>
          <span className="comparison-stat__value">5,000</span>
        </div>
      </div>
    </div>
  );
}

function BoxWhiskerTooltip({ active, payload, groupLabel }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="analysis-tooltip">
      <div className="analysis-tooltip__title">{row.district}</div>
      <div>{groupLabel} range: {row.min.toFixed(1)}% to {row.max.toFixed(1)}%</div>
      <div>Q1/Q3: {row.q1.toFixed(1)}% / {row.q3.toFixed(1)}%</div>
      <div>Median: {row.median.toFixed(1)}%</div>
      <div>Enacted: {row.enacted.toFixed(1)}%</div>
      {row.proposed != null && <div>Proposed: {row.proposed.toFixed(1)}%</div>}
    </div>
  );
}

function GinglesScatterTooltip({
  active,
  payload,
  groupLabel,
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="analysis-tooltip">
      <div className="analysis-tooltip__title">{row.precinctId} ({row.district})</div>
      <div>{groupLabel}: {row.x.toFixed(1)}%</div>
      <div>{row.party} vote: {row.y.toFixed(1)}%</div>
      <div>{row.otherPartyLabel} vote: {row.otherPartyShare.toFixed(1)}%</div>
    </div>
  );
}

function HiddenScatterPoint() {
  return null;
}

function clampPct(value) {
  return Math.max(0, Math.min(100, value));
}

function buildQuadraticTrend(points, xKey, yKey) {
  const coeffs = fitQuadraticCoefficients(points, xKey, yKey);
  if (!coeffs) return [];
  const trend = [];
  for (let x = 0; x <= 100; x += 2) {
    const y = clampPct(coeffs.a * x * x + coeffs.b * x + coeffs.c);
    trend.push({ x, y: Number(y.toFixed(2)) });
  }
  return trend;
}

function fitQuadraticCoefficients(points, xKey, yKey) {
  const rows = points
    .map((point) => ({
      x: Number(point[xKey]),
      y: Number(point[yKey]),
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  if (rows.length < 3) return null;

  let sumX = 0;
  let sumX2 = 0;
  let sumX3 = 0;
  let sumX4 = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2Y = 0;

  rows.forEach((point) => {
    const x = point.x;
    const x2 = x * x;
    sumX += x;
    sumX2 += x2;
    sumX3 += x2 * x;
    sumX4 += x2 * x2;
    sumY += point.y;
    sumXY += x * point.y;
    sumX2Y += x2 * point.y;
  });

  const matrix = [
    [rows.length, sumX, sumX2],
    [sumX, sumX2, sumX3],
    [sumX2, sumX3, sumX4],
  ];
  const rhs = [sumY, sumXY, sumX2Y];
  const solution = solve3x3(matrix, rhs);
  if (!solution) return null;

  return {
    c: solution[0],
    b: solution[1],
    a: solution[2],
  };
}

function solve3x3(matrix, rhs) {
  const augmented = matrix.map((row, index) => [...row, rhs[index]]);
  const size = 3;

  for (let pivot = 0; pivot < size; pivot += 1) {
    let maxRow = pivot;
    for (let row = pivot + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][pivot]) > Math.abs(augmented[maxRow][pivot])) {
        maxRow = row;
      }
    }

    if (Math.abs(augmented[maxRow][pivot]) < 1e-10) {
      return null;
    }

    if (maxRow !== pivot) {
      [augmented[pivot], augmented[maxRow]] = [augmented[maxRow], augmented[pivot]];
    }

    const pivotVal = augmented[pivot][pivot];
    for (let col = pivot; col <= size; col += 1) {
      augmented[pivot][col] /= pivotVal;
    }

    for (let row = 0; row < size; row += 1) {
      if (row === pivot) continue;
      const factor = augmented[row][pivot];
      for (let col = pivot; col <= size; col += 1) {
        augmented[row][col] -= factor * augmented[pivot][col];
      }
    }
  }

  return [augmented[0][3], augmented[1][3], augmented[2][3]];
}

function Kpi({ label, value }) {
  return (
    <div className="analysis-kpi">
      <span className="analysis-kpi__label">{label}</span>
      <span className="analysis-kpi__value">{value}</span>
    </div>
  );
}

function districtLabelToId(label) {
  const match = String(label).match(/\d+/);
  return match ? Number(match[0]) : null;
}

function toCandidateKey(candidate) {
  return candidate.replace(/[^A-Za-z]/g, '').toLowerCase();
}
