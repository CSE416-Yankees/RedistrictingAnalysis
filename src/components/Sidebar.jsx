import './Sidebar.css';

export default function Sidebar({
  stateAbbr,
  states,
  onStateChange,
  stateData,
  ensembleType,
  onEnsembleChange,
  analysisView,
  onAnalysisViewChange,
  highlightedDistrict,
  onHighlightDistrict,
  mapPlanMode,
  onMapPlanModeChange,
  onReset,
  planDistricts = [],
  planLabel,
}) {
  if (!stateData) return null;

  const analysisOptions = [
    { value: 'stateSummary', label: 'State Data Summary' },
    { value: 'boxWhisker', label: 'Box & Whisker Data' },
    { value: 'ensembleSplits', label: 'Ensemble Splits (Bar)' },
    { value: 'voteSeatCurve', label: 'Vote Share vs Seat Share' },
    { value: 'congressional', label: 'Congressional Representation' },
    { value: 'gingles', label: 'Gingles Summary' },
    { value: 'ginglesTable', label: 'Gingles 2/3 Table' },
    { value: 'eiCandidates', label: 'EI Candidate Results' },
    { value: 'eiPrecinctBar', label: 'EI Precinct Bar' },
    { value: 'eiChoropleth', label: 'EI Choropleth' },
    { value: 'eiKde', label: 'EI KDE' },
    { value: 'seatShare', label: 'Seat Share Distribution' },
    { value: 'opportunity', label: 'Opportunity Districts' },
    { value: 'comparison', label: 'Ensemble Comparison' },
  ];

  return (
    <aside className="sidebar">
      <section className="sidebar__section">
        <h3 className="sidebar__heading">Controls</h3>
        <div className="sidebar__stack">
          <label className="sidebar__select-label" htmlFor="state-select">State</label>
          <select
            id="state-select"
            className="sidebar__select"
            value={stateAbbr}
            onChange={(event) => onStateChange(event.target.value)}
          >
            {Object.values(states).map((state) => (
              <option key={state.abbr} value={state.abbr}>
                {state.name}
              </option>
            ))}
          </select>
          <button type="button" className="sidebar__reset" onClick={onReset}>
            Reset Page
          </button>
          <button
            type="button"
            className="sidebar__clear"
            onClick={() => onHighlightDistrict(null)}
            disabled={highlightedDistrict == null}
          >
            Clear District Highlight
          </button>
          {highlightedDistrict != null && (
            <div className="sidebar__focus-chip">Focused District: {highlightedDistrict}</div>
          )}
        </div>
      </section>

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

      <section className="sidebar__section">
        <h3 className="sidebar__heading">Demographics</h3>
        <div className="sidebar__bars">
          <DemoBar label="White" pct={stateData.whitePercent} color="#78909c" />
          <DemoBar label="Black" pct={stateData.blackPercent} color="#7b1fa2" />
          <DemoBar label="Hispanic" pct={stateData.hispanicPercent} color="#ff9800" />
          <DemoBar label="Asian" pct={stateData.asianPercent} color="#00897b" />
        </div>
      </section>

      <section className="sidebar__section">
        <h3 className="sidebar__heading">Map Plan</h3>
        <div className="sidebar__toggle-group sidebar__toggle-group--plans">
          <button
            type="button"
            className={`sidebar__toggle ${mapPlanMode === 'current' ? 'sidebar__toggle--active' : ''}`}
            onClick={() => onMapPlanModeChange('current')}
          >
            Current
          </button>
          <button
            type="button"
            className={`sidebar__toggle ${mapPlanMode === 'comparison' ? 'sidebar__toggle--active' : ''}`}
            onClick={() => onMapPlanModeChange('comparison')}
          >
            Comparison
          </button>
          <button
            type="button"
            className={`sidebar__toggle ${mapPlanMode === 'delta' ? 'sidebar__toggle--active' : ''}`}
            onClick={() => onMapPlanModeChange('delta')}
          >
            Delta
          </button>
          <button
            type="button"
            className={`sidebar__toggle ${mapPlanMode === 'interesting' ? 'sidebar__toggle--active' : ''}`}
            onClick={() => onMapPlanModeChange('interesting')}
          >
            Interesting
          </button>
        </div>
      </section>

      <section className="sidebar__section">
        <h3 className="sidebar__heading">Ensemble Type</h3>
        <div className="sidebar__toggle-group sidebar__toggle-group--ensemble">
          <button
            type="button"
            className={`sidebar__toggle ${ensembleType === 'raceBlind' ? 'sidebar__toggle--active' : ''}`}
            onClick={() => onEnsembleChange('raceBlind')}
          >
            Race-Blind
          </button>
          <button
            type="button"
            className={`sidebar__toggle ${ensembleType === 'vra' ? 'sidebar__toggle--active' : ''}`}
            onClick={() => onEnsembleChange('vra')}
          >
            VRA Constrained
          </button>
        </div>
      </section>

      <section className="sidebar__section">
        <h3 className="sidebar__heading">Analysis View</h3>
        <div className="sidebar__radio-group">
          {analysisOptions.map((opt) => (
            <label key={opt.value} className="sidebar__radio">
              <input
                type="radio"
                name="analysisView"
                value={opt.value}
                checked={analysisView === opt.value}
                onChange={() => onAnalysisViewChange(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="sidebar__section">
        <h3 className="sidebar__heading">{planLabel}</h3>
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
              {planDistricts.map((district) => (
                <tr
                  key={district.id}
                  className={highlightedDistrict === district.id ? 'sidebar__table-row--active' : ''}
                  onClick={() => onHighlightDistrict(district.id)}
                  title={`Highlight District ${district.id}`}
                >
                  <td>{district.id}</td>
                  <td style={{ color: 'var(--color-dem)' }}>{(district.dem * 100).toFixed(0)}%</td>
                  <td style={{ color: 'var(--color-rep)' }}>{(district.rep * 100).toFixed(0)}%</td>
                  <td style={{ color: 'var(--color-minority)' }}>{district.minorityPct}%</td>
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
