import './Sidebar.css';

export default function Sidebar({
  stateData,
  ensembleType,
  onEnsembleChange,
  analysisView,
  onAnalysisViewChange,
}) {
  if (!stateData) return null;

  return (
    <aside className="sidebar">
      {/* State Info */}
      <section className="sidebar__section">
        <h3 className="sidebar__heading">State Info</h3>
        <div className="sidebar__info-grid">
          <div className="sidebar__info-item">
            <span className="sidebar__info-label">Population</span>
            <span className="sidebar__info-value">
              {stateData.population.toLocaleString()}
            </span>
          </div>
          <div className="sidebar__info-item">
            <span className="sidebar__info-label">Districts</span>
            <span className="sidebar__info-value">{stateData.numDistricts}</span>
          </div>
          <div className="sidebar__info-item">
            <span className="sidebar__info-label">Preclearance</span>
            <span className="sidebar__info-value">
              {stateData.preclearance ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </section>

      {/* Demographics */}
      <section className="sidebar__section">
        <h3 className="sidebar__heading">Demographics</h3>
        <div className="sidebar__bars">
          <DemoBar label="White" pct={stateData.whitePercent} color="#78909c" />
          <DemoBar label="Black" pct={stateData.blackPercent} color="#7b1fa2" />
          <DemoBar label="Hispanic" pct={stateData.hispanicPercent} color="#ff9800" />
          <DemoBar label="Asian" pct={stateData.asianPercent} color="#00897b" />
        </div>
      </section>

      {/* Ensemble Selection */}
      <section className="sidebar__section">
        <h3 className="sidebar__heading">Ensemble Type</h3>
        <div className="sidebar__toggle-group">
          <button
            className={`sidebar__toggle ${ensembleType === 'raceBlind' ? 'sidebar__toggle--active' : ''}`}
            onClick={() => onEnsembleChange('raceBlind')}
          >
            Race-Blind
          </button>
          <button
            className={`sidebar__toggle ${ensembleType === 'vra' ? 'sidebar__toggle--active' : ''}`}
            onClick={() => onEnsembleChange('vra')}
          >
            VRA Constrained
          </button>
        </div>
      </section>

      {/* Analysis View */}
      <section className="sidebar__section">
        <h3 className="sidebar__heading">Analysis View</h3>
        <div className="sidebar__radio-group">
          {[
            { value: 'boxPlot', label: 'Minority % Box Plot' },
            { value: 'seatShare', label: 'Seat Share Distribution' },
            { value: 'opportunity', label: 'Opportunity Districts' },
            { value: 'comparison', label: 'Ensemble Comparison' },
          ].map((opt) => (
            <label key={opt.value} className="sidebar__radio">
              <input
                type="radio"
                name="analysisView"
                value={opt.value}
                checked={analysisView === opt.value}
                onChange={() => onAnalysisViewChange(opt.value)}
              />
              <span className="sidebar__radio-custom" />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Current Plan */}
      <section className="sidebar__section">
        <h3 className="sidebar__heading">Current Plan Districts</h3>
        <div className="sidebar__table-wrap">
          <table className="sidebar__table">
            <thead>
              <tr>
                <th>Dist</th>
                <th>Dem</th>
                <th>Rep</th>
                <th>Min%</th>
              </tr>
            </thead>
            <tbody>
              {stateData.currentPlanDistricts.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td style={{ color: 'var(--color-dem)' }}>{(d.dem * 100).toFixed(0)}%</td>
                  <td style={{ color: 'var(--color-rep)' }}>{(d.rep * 100).toFixed(0)}%</td>
                  <td style={{ color: 'var(--color-minority)' }}>{d.minorityPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </aside>
  );
}

function DemoBar({ label, pct, color }) {
  return (
    <div className="demo-bar">
      <div className="demo-bar__header">
        <span>{label}</span>
        <span className="demo-bar__pct">{pct}%</span>
      </div>
      <div className="demo-bar__track">
        <div
          className="demo-bar__fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
