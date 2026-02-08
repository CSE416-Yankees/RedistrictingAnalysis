import { useNavigate } from 'react-router-dom';
import USMap from '../components/USMap';
import { stateMarkers } from '../data/mockData';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home__map">
        <USMap />
      </div>
      <div className="home__panel">
        <div className="home__intro">
          <h1 className="home__heading">Redistricting Analysis Tool</h1>
          <p className="home__desc">
            Analyze the impact of potential revisions to the Voting Rights Act
            on congressional redistricting. Compare race-blind and VRA-constrained
            ensembles to evaluate fairness and detect gerrymandering.
          </p>
        </div>
        <div className="home__states">
          <h2 className="home__states-heading">Select a State</h2>
          <div className="home__state-cards">
            {stateMarkers.map((s) => (
              <button
                key={s.abbr}
                className="state-card"
                onClick={() => navigate(`/state/${s.abbr}`)}
              >
                <span className="state-card__abbr">{s.abbr}</span>
                <span className="state-card__name">{s.name}</span>
                <span className="state-card__arrow">→</span>
              </button>
            ))}
          </div>
        </div>
        <div className="home__features">
          <div className="feature">
            <div className="feature__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <strong>Interactive Maps</strong>
              <p>View district boundaries with demographic overlays</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div>
              <strong>Ensemble Analysis</strong>
              <p>Compare 5,000 simulated redistricting plans</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <strong>Fairness Measures</strong>
              <p>Evaluate seat share, opportunity districts, and racial polarization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
