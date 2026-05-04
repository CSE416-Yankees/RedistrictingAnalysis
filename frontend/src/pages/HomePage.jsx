import { useNavigate } from 'react-router-dom';
import USMap from '../components/USMap';
import { stateMarkers, states } from '../data/mockData';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home__map">
        <USMap />
      </div>
      <div className="home__panel">
        <div className="home__intro home__fade-in">
          <h1 className="home__heading">See the people behind the district lines</h1>
          <p className="home__desc">
            Explore each state like a conversation, not just a chart. Compare
            plans, inspect representation, and follow how demographic patterns
            shape political outcomes.
          </p>
          <div className="home__state-select">
            <label htmlFor="home-state-select">State</label>
            <select
              id="home-state-select"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) navigate(`/state/${event.target.value}`);
              }}
            >
              <option value="" disabled>Choose a state</option>
              {stateMarkers.map((state) => (
                <option key={state.abbr} value={state.abbr}>{state.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="home__states home__fade-in" style={{ animationDelay: '90ms' }}>
          <h2 className="home__states-heading">Choose A State To Begin</h2>
          <div className="home__state-cards">
            {stateMarkers.map((s) => (
              <button
                key={s.abbr}
                className="state-card"
                onClick={() => navigate(`/state/${s.abbr}`)}
              >
                <span className="state-card__abbr" aria-hidden="true">{s.abbr}</span>
                <span className="state-card__copy">
                  <span className="state-card__name">{s.name}</span>
                  <span className="state-card__meta">
                    {states[s.abbr].numDistricts} districts
                    {states[s.abbr].preclearance ? ' - preclearance context' : ' - standard review'}
                  </span>
                </span>
                <span className="state-card__arrow">View</span>
              </button>
            ))}
          </div>
        </div>
        <div className="home__features home__fade-in" style={{ animationDelay: '180ms' }}>
          <h2 className="home__states-heading">What You Can Explore</h2>
          <div className="feature">
            <div className="feature__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <strong>Interactive Geography</strong>
              <p>Inspect the current district plan, precinct heat maps, and plan differences.</p>
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
              <strong>Scenario Comparison</strong>
              <p>Contrast current, comparison, delta, and interesting district plans.</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <strong>Voting Rights Diagnostics</strong>
              <p>Review Gingles, EI, ensemble splits, and seat-vote responsiveness in one place.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
