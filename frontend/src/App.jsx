import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import StateAnalysisPage from './pages/StateAnalysisPage';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/state/:stateAbbr" element={<StateAnalysisPage />} />
        </Routes>
      </main>
    </div>
  );
}
