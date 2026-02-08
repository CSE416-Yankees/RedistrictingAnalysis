import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header__left">
        <Link to="/" className="header__brand">
          <svg className="header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="header__title">Redistricting Analysis</span>
        </Link>
      </div>
      <nav className="header__nav">
        <Link
          to="/"
          className={`header__link ${location.pathname === '/' ? 'header__link--active' : ''}`}
        >
          Map
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
      </nav>
      <div className="header__right">
        <span className="header__badge">CSE 416</span>
      </div>
    </header>
  );
}
