import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import StateMap from '../components/StateMap';
import Sidebar from '../components/Sidebar';
import AnalysisPanel from '../components/AnalysisPanel';
import { states } from '../data/mockData';
import './StateAnalysisPage.css';

export default function StateAnalysisPage() {
  const { stateAbbr } = useParams();
  const stateData = states[stateAbbr];

  const [ensembleType, setEnsembleType] = useState('raceBlind');
  const [analysisView, setAnalysisView] = useState('boxPlot');

  if (!stateData) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="state-analysis">
      <div className="state-analysis__main">
        <div className="state-analysis__map">
          <div className="state-analysis__map-header">
            <h2 className="state-analysis__title">{stateData.name}</h2>
            <span className="state-analysis__chip">
              {stateData.numDistricts} Congressional Districts
            </span>
            {stateData.preclearance && (
              <span className="state-analysis__chip state-analysis__chip--warn">
                Preclearance State
              </span>
            )}
          </div>
          <div className="state-analysis__map-container">
            <StateMap
              key={stateAbbr}
              stateAbbr={stateAbbr}
              center={stateData.center}
              zoom={stateData.zoom}
              districtData={stateData.currentPlanDistricts}
            />
          </div>
        </div>
        <div className="state-analysis__charts">
          <AnalysisPanel
            stateAbbr={stateAbbr}
            ensembleType={ensembleType}
            analysisView={analysisView}
          />
        </div>
      </div>
      <Sidebar
        stateData={stateData}
        ensembleType={ensembleType}
        onEnsembleChange={setEnsembleType}
        analysisView={analysisView}
        onAnalysisViewChange={setAnalysisView}
      />
    </div>
  );
}
