import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const ANALYSIS_ROUTE_SLUGS = new Set([
  'gui-9',
  'gui-10',
  'gui-11',
  'gui-12',
  'gui-16',
  'gui-17',
  'gui-20',
  'gui-21',
  'gui-22',
]);

export default function Header() {
  const location = useLocation();
  const stateMatch = location.pathname.match(/\/state\/([^/]+)/);
  const guiMatch = location.pathname.match(/\/gui\/([^/]+)/);
  const stateKey = stateMatch ? stateMatch[1].toUpperCase() : null;
  const stateLabel = stateKey || 'Overview';
  const guiSlug = guiMatch ? guiMatch[1].toLowerCase() : null;
  const isAnalysisView = guiSlug ? ANALYSIS_ROUTE_SLUGS.has(guiSlug) : false;

  return (
    <header className="header">
      <div className="header__left">
        <Link to="/" className="header__brand">
          <svg className="header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="header__brand-copy">
            <span className="header__title">District Story Lab</span>
            <span className="header__subtitle">Redistricting analysis with people in mind</span>
          </span>
        </Link>
      </div>
      <nav className="header__nav">
        <Link
          to="/"
          className={`header__link ${location.pathname === '/' ? 'header__link--active' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/state/MS"
          className={`header__link ${location.pathname.includes('/state/MS') ? 'header__link--active' : ''}`}
        >
          Mississippi
        </Link>
        <Link
          to="/state/MD"
          className={`header__link ${location.pathname.includes('/state/MD') ? 'header__link--active' : ''}`}
        >
          Maryland
        </Link>
        {stateKey && (
          <>
            <span className="header__divider" aria-hidden="true" />
            <Link
              to={`/state/${stateKey}`}
              className={`header__link ${!isAnalysisView ? 'header__link--active' : ''}`}
            >
              Plan Explorer
            </Link>
            <Link
              to={`/state/${stateKey}/gui/gui-9`}
              className={`header__link ${isAnalysisView ? 'header__link--active' : ''}`}
            >
              Analysis
            </Link>
          </>
        )}
      </nav>
      <div className="header__right">
        <span className="header__badge">Viewing: {stateLabel}</span>
        {stateKey && (
          <Link to="/" className="header__reset">Reset</Link>
        )}
      </div>
    </header>
  );
}
