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
  'gui-26',
]);

const YANKEES_LOGO_URL = `${import.meta.env.BASE_URL}yankees-primary-logo.svg`;

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
          <span className="header__logo-frame" aria-hidden="true">
            <img className="header__logo" src={YANKEES_LOGO_URL} alt="" />
          </span>
          <span className="header__brand-copy">
            <span className="header__title">Yankees Redistricting Analysis</span>
            <span className="header__subtitle">Voting rights and district plan diagnostics</span>
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
          className={`header__link ${stateKey === 'MS' ? 'header__link--active' : ''}`}
        >
          Mississippi
        </Link>
        <Link
          to="/state/MD"
          className={`header__link ${stateKey === 'MD' ? 'header__link--active' : ''}`}
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
