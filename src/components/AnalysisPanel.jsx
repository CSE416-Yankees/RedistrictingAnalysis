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
} from 'recharts';
import { ensembleData } from '../data/mockData';
import './AnalysisPanel.css';

export default function AnalysisPanel({ stateAbbr, ensembleType, analysisView }) {
  const data = ensembleData[stateAbbr];
  if (!data) return <div className="analysis-panel">No data available</div>;

  const current = data[ensembleType];

  return (
    <div className="analysis-panel">
      {analysisView === 'boxPlot' && (
        <BoxPlotChart data={current.boxPlot} ensembleType={ensembleType} />
      )}
      {analysisView === 'seatShare' && (
        <SeatShareChart data={current.seatShare} />
      )}
      {analysisView === 'opportunity' && (
        <OpportunityChart data={current.opportunityDistricts} />
      )}
      {analysisView === 'comparison' && (
        <ComparisonChart stateAbbr={stateAbbr} data={data} />
      )}
    </div>
  );
}

/* ── Box Plot (approximated with bar ranges) ── */
function BoxPlotChart({ data, ensembleType }) {
  const label = ensembleType === 'vra' ? 'VRA Constrained' : 'Race-Blind';

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        Minority Population % by District
        <span className="chart-subtitle">{label} Ensemble (5,000 plans)</span>
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="district" tick={{ fontSize: 12 }} />
          <YAxis
            label={{ value: 'Minority %', angle: -90, position: 'insideLeft', fontSize: 12 }}
            tick={{ fontSize: 11 }}
            domain={[0, 70]}
          />
          <Tooltip
            formatter={(value, name) => [`${value}%`, name]}
            contentStyle={{ fontSize: 12, borderRadius: 6 }}
          />
          <Bar dataKey="min" stackId="box" fill="transparent" />
          <Bar dataKey="q1" stackId="box" fill="#bbdefb" radius={[0, 0, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#bbdefb" />
            ))}
          </Bar>
          <Bar dataKey="median" stackId="box" fill="#64b5f6" radius={[0, 0, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#42a5f5" />
            ))}
          </Bar>
          <Bar dataKey="q3" stackId="box" fill="#90caf9" radius={[0, 0, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#90caf9" />
            ))}
          </Bar>
          <Bar dataKey="max" stackId="box" fill="#e3f2fd" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#e3f2fd" />
            ))}
          </Bar>
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            payload={[
              { value: 'Min', type: 'rect', color: '#bbdefb' },
              { value: 'Q1', type: 'rect', color: '#64b5f6' },
              { value: 'Median', type: 'rect', color: '#42a5f5' },
              { value: 'Q3', type: 'rect', color: '#90caf9' },
              { value: 'Max', type: 'rect', color: '#e3f2fd' },
            ]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Seat Share Distribution ── */
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

/* ── Opportunity Districts ── */
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

/* ── Comparison View ── */
function ComparisonChart({ stateAbbr, data }) {
  // Merge opportunity data for comparison
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
      {/* Summary Stats */}
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
