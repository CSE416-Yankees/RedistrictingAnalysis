import {
  BarChart,
  Bar,
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
} from 'recharts';
import { ensembleData } from '../data/mockData';
import './AnalysisPanel.css';

export default function AnalysisPanel({
  stateAbbr,
  ensembleType,
  analysisView,
  stateData,
  highlightedDistrict,
  onHighlightDistrict,
}) {
  const data = ensembleData[stateAbbr];
  if (!data) return <div className="analysis-panel">No data available</div>;

  const current = data[ensembleType];

  return (
    <div className="analysis-panel">
      {analysisView === 'stateSummary' && (
        <StateSummaryCard stateData={stateData} />
      )}
      {analysisView === 'boxWhisker' && (
        <BoxWhiskerChart data={current.boxWhisker} ensembleType={ensembleType} />
      )}
      {analysisView === 'ensembleSplits' && (
        <EnsembleSplitsChart data={current.ensembleSplits} />
      )}
      {analysisView === 'voteSeatCurve' && (
        <VoteSeatCurveChart data={current.voteSeatCurve} ensembleType={ensembleType} />
      )}
      {analysisView === 'congressional' && (
        <CongressionalTable rows={stateData.congressionalRepresentation} />
      )}
      {analysisView === 'gingles' && (
        <GinglesSummary summary={current.gingles.summary} />
      )}
      {analysisView === 'ginglesTable' && (
        <GinglesTable
          rows={current.gingles.rows}
          highlightedDistrict={highlightedDistrict}
          onHighlightDistrict={onHighlightDistrict}
        />
      )}
      {analysisView === 'eiCandidates' && (
        <EICandidateResults data={current.ei.candidateSupport} chartData={current.ei.candidateSupportChart} />
      )}
      {analysisView === 'eiPrecinctBar' && (
        <EIPrecinctBarChart data={current.ei.precinctBar} />
      )}
      {analysisView === 'eiChoropleth' && (
        <EIChoroplethPlaceholder />
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

function StateSummaryCard({ stateData }) {
  const avgMinority = stateData.currentPlanDistricts.reduce((acc, district) => acc + district.minorityPct, 0)
    / Math.max(1, stateData.currentPlanDistricts.length);
  const avgDem = stateData.currentPlanDistricts.reduce((acc, district) => acc + district.dem * 100, 0)
    / Math.max(1, stateData.currentPlanDistricts.length);
  const opportunityDistricts = stateData.currentPlanDistricts.filter((district) => district.minorityPct >= 37).length;

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        State Data Summary
        <span className="chart-subtitle">Population, demographics, and district-level baseline</span>
      </h3>
      <div className="analysis-kpi-grid">
        <Kpi label="Population" value={stateData.population.toLocaleString()} />
        <Kpi label="Congressional Districts" value={stateData.numDistricts} />
        <Kpi label="Avg Minority %" value={`${avgMinority.toFixed(1)}%`} />
        <Kpi label="Avg Dem Vote %" value={`${avgDem.toFixed(1)}%`} />
        <Kpi label="Opportunity Districts" value={opportunityDistricts} />
        <Kpi label="Preclearance" value={stateData.preclearance ? 'Yes' : 'No'} />
      </div>
    </div>
  );
}

function BoxWhiskerChart({ data, ensembleType }) {
  const label = ensembleType === 'vra' ? 'VRA Constrained' : 'Race-Blind';
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Minority Population by District (Box & Whisker)
        <span className="chart-subtitle">{label} ensemble</span>
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="district" tick={{ fontSize: 12 }} />
          <YAxis
            label={{ value: 'Minority %', angle: -90, position: 'insideLeft', fontSize: 12 }}
            tick={{ fontSize: 11 }}
            domain={[0, 100]}
          />
          <Tooltip formatter={(value, name) => [`${value}%`, name]} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Bar dataKey="min" stackId="range" fill="transparent" />
          <Bar dataKey="q1" name="Q1" stackId="range" fill="#bbdefb" />
          <Bar dataKey="median" name="Median" stackId="range" fill="#42a5f5" />
          <Bar dataKey="q3" name="Q3" stackId="range" fill="#90caf9" />
          <Bar dataKey="max" name="Max" stackId="range" fill="#e3f2fd" radius={[4, 4, 0, 0]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </ComposedChart>
      </ResponsiveContainer>
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

function EnsembleSplitsChart({ data }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Ensemble Splits
        <span className="chart-subtitle">Distribution of simulated seat outcomes</span>
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="seatsWonByRep" tick={{ fontSize: 11 }} />
          <YAxis
            label={{ value: 'Plans', angle: -90, position: 'insideLeft', fontSize: 12 }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Bar dataKey="plans" name="Plans" radius={[4, 4, 0, 0]}>
            {data.map((row, i) => (
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
        <span className="chart-subtitle">Current district-level incumbency and vote share</span>
      </h3>
      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--clickable">
          <thead>
            <tr>
              <th>District</th>
              <th>Party</th>
              <th>Incumbent</th>
              <th>Dem %</th>
              <th>Rep %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.district}>
                <td>{row.district}</td>
                <td>{row.party}</td>
                <td>{row.incumbent}</td>
                <td>{row.demVotePct.toFixed(1)}%</td>
                <td>{row.repVotePct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GinglesSummary({ summary }) {
  const statusText = summary.likelyVraViolation ? 'Potential VRA issue flagged' : 'No immediate VRA issue flagged';
  const statusClass = summary.likelyVraViolation ? 'analysis-kpi__value--warn' : 'analysis-kpi__value--ok';
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Gingles Analysis Summary
        <span className="chart-subtitle">Three preconditions and compactness indicators</span>
      </h3>
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

function EICandidateResults({ data, chartData }) {
  const series = data[0]?.values?.map((item) => ({
    label: item.candidate,
    key: toCandidateKey(item.candidate),
  })) || [];
  const colors = ['#1e88e5', '#e53935', '#fbc02d', '#43a047'];

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        EI Candidate Results
        <span className="chart-subtitle">Estimated candidate support by district</span>
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="district" tick={{ fontSize: 11 }} />
          <YAxis
            label={{ value: 'Support %', angle: -90, position: 'insideLeft', fontSize: 12 }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((candidate, i) => (
            <Bar
              key={candidate.key}
              dataKey={candidate.key}
              name={candidate.label}
              fill={colors[i % colors.length]}
              stackId="ei"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table--compact">
          <thead>
            <tr>
              <th>District</th>
              {series.map((candidate) => (
                <th key={candidate.key}>{candidate.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.district}>
                <td>{row.district}</td>
                {row.values.map((candidate) => (
                  <td key={candidate.candidate}>{candidate.supportPct.toFixed(1)}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function EIChoroplethPlaceholder() {
  return (
    <div className="chart-card">
      <h3 className="chart-title">
        EI Choropleth
        <span className="chart-subtitle">Map now supports EI candidate support and turnout-gap choropleths</span>
      </h3>
      <p className="analysis-note">
        In the map "Color by" menu, choose `EI: Candidate A Support` or `EI: Turnout Gap`.
      </p>
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
