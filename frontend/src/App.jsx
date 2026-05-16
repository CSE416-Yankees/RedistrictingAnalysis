import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import StateAnalysisPage from './pages/StateAnalysisPage';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <a href="#main-content" className="app__skip-link">Skip to main content</a>
      <Header />
      <main id="main-content" className="app__main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/state/:stateAbbr" element={<StateAnalysisPage />} />
          <Route path="/state/:stateAbbr/gui/:guiSlug" element={<StateAnalysisPage />} />
        </Routes>
      </main>
    </div>
  );
}
