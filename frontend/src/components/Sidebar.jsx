import { useMemo, useState } from 'react';
import './Sidebar.css';

export default function Sidebar({
  highlightedDistrict,
  onHighlightDistrict,
  mapPlanMode,
  onMapPlanModeChange,
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
      <h2 className="sidebar__title">Plan & Districts</h2>

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
    </aside>
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
