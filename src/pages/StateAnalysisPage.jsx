import { useCallback, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import StateMap from '../components/StateMap';
import Sidebar from '../components/Sidebar';
import AnalysisPanel from '../components/AnalysisPanel';
import { states } from '../data/mockData';
import './StateAnalysisPage.css';

export default function StateAnalysisPage() {
  const navigate = useNavigate();
  const { stateAbbr } = useParams();
  const stateData = states[stateAbbr];

  const [ensembleType, setEnsembleType] = useState('raceBlind');
  const [analysisView, setAnalysisView] = useState('stateSummary');
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [mapPlanMode, setMapPlanMode] = useState('current');

  const handleReset = useCallback(() => {
    setEnsembleType('raceBlind');
    setAnalysisView('stateSummary');
    setSelectedDistrictId(null);
    setMapPlanMode('current');
  }, []);

  if (!stateData) {
    return <Navigate to="/" replace />;
  }

  let activeDistricts = stateData.currentPlanDistricts;
  if (mapPlanMode === 'comparison') {
    activeDistricts = stateData.comparisonPlanDistricts || stateData.currentPlanDistricts;
  }
  if (mapPlanMode === 'interesting') {
    activeDistricts = stateData.interestingPlanDistricts || stateData.currentPlanDistricts;
  }

  const mapPlanLabel = mapPlanMode === 'comparison'
    ? 'Comparison Plan'
    : mapPlanMode === 'delta'
      ? 'Delta View'
      : mapPlanMode === 'interesting'
        ? 'Interesting Plan'
        : 'Current Plan';

  return (
    <div className="state-analysis">
      <div className="state-analysis__main">
        <div className="state-analysis__map">
          <div className="state-analysis__map-header">
            <div className="state-analysis__title-group">
              <h2 className="state-analysis__title">{stateData.name}</h2>
              <span className="state-analysis__subtitle">Redistricting Analysis Workspace</span>
            </div>
            <div className="state-analysis__chips">
              <span className="state-analysis__chip">{stateData.numDistricts} Congressional Districts</span>
              <span className="state-analysis__chip">{mapPlanLabel}</span>
              {selectedDistrictId != null && (
                <span className="state-analysis__chip state-analysis__chip--selected">
                  District {selectedDistrictId} highlighted
                </span>
              )}
              {stateData.preclearance && (
                <span className="state-analysis__chip state-analysis__chip--warn">
                  Preclearance State
                </span>
              )}
            </div>
          </div>
          <div className="state-analysis__map-container">
            <StateMap
              key={stateAbbr}
              stateAbbr={stateAbbr}
              center={stateData.center}
              zoom={stateData.zoom}
              districtData={activeDistricts}
              comparisonDistrictData={stateData.comparisonPlanDistricts}
              planMode={mapPlanMode}
              highlightedDistrict={selectedDistrictId}
              onDistrictSelect={setSelectedDistrictId}
              analysisView={analysisView}
            />
          </div>
        </div>
        <div className="state-analysis__charts">
          <AnalysisPanel
            stateAbbr={stateAbbr}
            ensembleType={ensembleType}
            analysisView={analysisView}
            stateData={stateData}
            highlightedDistrict={selectedDistrictId}
            onHighlightDistrict={setSelectedDistrictId}
          />
        </div>
      </div>
      <Sidebar
        stateAbbr={stateAbbr}
        states={states}
        onStateChange={(nextState) => navigate(`/state/${nextState}`)}
        stateData={stateData}
        ensembleType={ensembleType}
        onEnsembleChange={setEnsembleType}
        analysisView={analysisView}
        onAnalysisViewChange={setAnalysisView}
        highlightedDistrict={selectedDistrictId}
        onHighlightDistrict={setSelectedDistrictId}
        mapPlanMode={mapPlanMode}
        onMapPlanModeChange={setMapPlanMode}
        onReset={handleReset}
        planDistricts={activeDistricts}
        planLabel={
          mapPlanMode === 'comparison'
            ? 'Comparison Plan Districts'
            : mapPlanMode === 'interesting'
              ? 'Interesting Plan Districts'
              : 'Current Plan Districts'
        }
      />
    </div>
  );
}
