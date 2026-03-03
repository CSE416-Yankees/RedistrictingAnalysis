import { useMemo, useState } from 'react';
import './Sidebar.css';

const TAB_OPTIONS = [
  { key: 'summary', label: 'Summary' },
  { key: 'layers', label: 'Map Layers' },
  { key: 'plan', label: 'Plan & Districts' },
];

const METRIC_OPTIONS = [
  { value: 'demographic', label: 'Demographic Heat Map' },
  { value: 'partisan', label: 'Democrat ↔ Republican' },
  { value: 'eiCandidateA', label: 'EI: Candidate A Support' },
  { value: 'eiTurnoutGap', label: 'EI: Turnout Gap' },
];

export default function Sidebar({
  stateData,
  activeTab,
  onActiveTabChange,
  mapMetric,
  onMapMetricChange,
  mapDemographicGroup,
  onMapDemographicGroupChange,
  mapGeographyLevel,
  onMapGeographyLevelChange,
  showDistrictOutlines,
  onShowDistrictOutlinesChange,
  highlightedDistrict,
  onHighlightDistrict,
  mapPlanMode,
  onMapPlanModeChange,
  onReset,
  planDistricts = [],
  planLabel,
}) {
  const [minMinorityFilter, setMinMinorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('district');
  const [sortDir, setSortDir] = useState('asc');

  const threshold = Number(minMinorityFilter);
  const hasThreshold = minMinorityFilter.trim() !== '' && Number.isFinite(threshold);

  const districtRows = useMemo(() => {
    const filtered = hasThreshold
      ? planDistricts.filter((district) => district.minorityPct >= threshold)
      : planDistricts;

    return [...filtered].sort((leftDistrict, rightDistrict) => {
      const left = readSortValue(leftDistrict, sortBy);
      const right = readSortValue(rightDistrict, sortBy);
      if (left === right) return 0;
      const direction = sortDir === 'asc' ? 1 : -1;
      return left > right ? direction : -direction;
    });
  }, [planDistricts, hasThreshold, threshold, sortBy, sortDir]);

  if (!stateData) return null;

  const summaryCards = [
    { label: 'Population', value: stateData.population.toLocaleString() },
    { label: 'Districts', value: stateData.numDistricts },
    { label: 'Preclearance', value: stateData.preclearance ? 'Yes' : 'No' },
    { label: 'Viewing', value: stateData.abbr },
    { label: 'Plan', value: toPlanLabel(mapPlanMode) },
    { label: 'Focused District', value: highlightedDistrict ?? 'None' },
  ];

  const demographicTotal =
    stateData.whitePercent + stateData.blackPercent + stateData.hispanicPercent + stateData.asianPercent;

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(key);
    setSortDir('asc');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__tabs" role="tablist" aria-label="Sidebar views">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`sidebar__tab ${activeTab === tab.key ? 'sidebar__tab--active' : ''}`}
            onClick={() => onActiveTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <>
          <section className="sidebar__section">
            <h3 className="sidebar__heading">Quick Actions</h3>
            <div className="sidebar__actions-row">
              <button type="button" className="sidebar__reset" onClick={onReset}>
                Reset
              </button>
              <button
                type="button"
                className="sidebar__clear"
                onClick={() => onHighlightDistrict(null)}
                disabled={highlightedDistrict == null}
              >
                Clear Highlight
              </button>
            </div>
          </section>

          <section className="sidebar__section">
            <h3 className="sidebar__heading">Snapshot</h3>
            <div className="sidebar__summary-grid">
              {summaryCards.map((item) => (
                <div key={item.label} className="sidebar__summary-item">
                  <span className="sidebar__summary-label">{item.label}</span>
                  <span className="sidebar__summary-value">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="sidebar__section">
            <h3 className="sidebar__heading">Demographics</h3>
            <div className="sidebar__stacked">
              <div className="sidebar__stacked-track" role="img" aria-label="State demographics stacked bar">
                <span style={{ width: `${(stateData.whitePercent / demographicTotal) * 100}%`, background: '#78909c' }} />
                <span style={{ width: `${(stateData.blackPercent / demographicTotal) * 100}%`, background: '#7b1fa2' }} />
                <span style={{ width: `${(stateData.hispanicPercent / demographicTotal) * 100}%`, background: '#ff9800' }} />
                <span style={{ width: `${(stateData.asianPercent / demographicTotal) * 100}%`, background: '#00897b' }} />
              </div>
              <div className="sidebar__stacked-legend">
                <LegendRow label="White" value={stateData.whitePercent} color="#78909c" />
                <LegendRow label="Black" value={stateData.blackPercent} color="#7b1fa2" />
                <LegendRow label="Hispanic" value={stateData.hispanicPercent} color="#ff9800" />
                <LegendRow label="Asian" value={stateData.asianPercent} color="#00897b" />
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'layers' && (
        <section className="sidebar__section">
          <h3 className="sidebar__heading">Map Layers</h3>
          <div className="sidebar__form-grid">
            <label className="sidebar__field">
              <span>Color by</span>
              <select value={mapMetric} onChange={(event) => onMapMetricChange(event.target.value)}>
                {METRIC_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            {mapMetric === 'demographic' && (
              <label className="sidebar__field">
                <span>Minority group</span>
                <select value={mapDemographicGroup} onChange={(event) => onMapDemographicGroupChange(event.target.value)}>
                  <option value="overall">All Minority</option>
                  <option value="black">Black</option>
                  <option value="hispanic">Hispanic</option>
                  <option value="asian">Asian</option>
                </select>
              </label>
            )}

            <label className="sidebar__field">
              <span>Geography</span>
              <select value={mapGeographyLevel} onChange={(event) => onMapGeographyLevelChange(event.target.value)}>
                <option value="precinct">Precinct</option>
                <option value="censusBlock">Census Block</option>
              </select>
            </label>

            <label className="sidebar__check-row">
              <input
                type="checkbox"
                checked={showDistrictOutlines}
                onChange={(event) => onShowDistrictOutlinesChange(event.target.checked)}
              />
              <span>Show district boundaries</span>
            </label>
          </div>
          <p className="sidebar__hint">Tip: click an active chip above the map to jump to this tab.</p>
        </section>
      )}

      {activeTab === 'plan' && (
        <>
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
            <h3 className="sidebar__heading">{planLabel}</h3>
            <div className="sidebar__filter-row">
              <label htmlFor="district-min-filter">Min Minority %</label>
              <input
                id="district-min-filter"
                type="number"
                min="0"
                max="100"
                value={minMinorityFilter}
                onChange={(event) => setMinMinorityFilter(event.target.value)}
                placeholder="Any"
              />
            </div>
            <div className="sidebar__table-wrap">
              <table className="sidebar__table">
                <thead>
                  <tr>
                    <th><SortButton label="Dist" onClick={() => handleSort('district')} active={sortBy === 'district'} dir={sortDir} /></th>
                    <th><SortButton label="Dem" onClick={() => handleSort('dem')} active={sortBy === 'dem'} dir={sortDir} /></th>
                    <th><SortButton label="Rep" onClick={() => handleSort('rep')} active={sortBy === 'rep'} dir={sortDir} /></th>
                    <th><SortButton label="Min%" onClick={() => handleSort('minorityPct')} active={sortBy === 'minorityPct'} dir={sortDir} /></th>
                    <th><SortButton label="Pop Dev" onClick={() => handleSort('populationDeviation')} active={sortBy === 'populationDeviation'} dir={sortDir} /></th>
                  </tr>
                </thead>
                <tbody>
                  {districtRows.map((district) => (
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
                      <td>{formatDeviation(district)}</td>
                    </tr>
                  ))}
                  {districtRows.length === 0 && (
                    <tr>
                      <td className="sidebar__table-empty" colSpan={5}>No districts match this filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </aside>
  );
}

function LegendRow({ label, value, color }) {
  return (
    <div className="sidebar__legend-row">
      <span className="sidebar__legend-name">
        <span className="sidebar__legend-dot" style={{ background: color }} />
        {label}
      </span>
      <span>{value.toFixed(1)}%</span>
    </div>
  );
}

function SortButton({ label, onClick, active, dir }) {
  return (
    <button type="button" className={`sidebar__sort ${active ? 'sidebar__sort--active' : ''}`} onClick={onClick}>
      {label}
      {active && <span>{dir === 'asc' ? ' ↑' : ' ↓'}</span>}
    </button>
  );
}

function readSortValue(district, key) {
  if (key === 'dem') return district.dem;
  if (key === 'rep') return district.rep;
  if (key === 'minorityPct') return district.minorityPct;
  if (key === 'populationDeviation') return getPopulationDeviation(district);
  return district.id;
}

function toPlanLabel(planMode) {
  if (planMode === 'comparison') return 'Comparison';
  if (planMode === 'delta') return 'Delta';
  if (planMode === 'interesting') return 'Interesting';
  return 'Current';
}

function getPopulationDeviation(district) {
  if (Number.isFinite(district.populationDeviation)) return district.populationDeviation;
  if (Number.isFinite(district.populationDeviationPct)) return district.populationDeviationPct;
  const synthetic = ((district.id * 37) % 11) - 5 + (district.dem - district.rep) * 2.2;
  return Number(synthetic.toFixed(1));
}

function formatDeviation(district) {
  const deviation = getPopulationDeviation(district);
  const sign = deviation > 0 ? '+' : '';
  return `${sign}${deviation.toFixed(1)}%`;
}
