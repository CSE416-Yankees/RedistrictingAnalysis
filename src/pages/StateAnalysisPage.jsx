import { useCallback, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import StateMap from '../components/StateMap';
import Sidebar from '../components/Sidebar';
import AnalysisPanel from '../components/AnalysisPanel';
import { states, ensembleData } from '../data/mockData';
import './StateAnalysisPage.css';

export default function StateAnalysisPage() {
  const { stateAbbr } = useParams();
  const stateData = states[stateAbbr];
  const analysisOptions = [
    { value: 'stateSummary', label: 'State Data Summary' },
    { value: 'boxWhisker', label: 'Box & Whisker Data' },
    { value: 'ensembleSplits', label: 'Ensemble Splits (Bar)' },
    { value: 'voteSeatCurve', label: 'Vote Share vs Seat Share' },
    { value: 'congressional', label: 'Congressional Representation' },
    { value: 'gingles', label: 'Gingles Summary' },
    { value: 'ginglesTable', label: 'Gingles 2/3 Table' },
    { value: 'eiCandidates', label: 'EI Candidate Results' },
    { value: 'eiPrecinctBar', label: 'EI Precinct Bar' },
    { value: 'eiChoropleth', label: 'EI Choropleth' },
    { value: 'eiKde', label: 'EI KDE' },
    { value: 'seatShare', label: 'Seat Share Distribution' },
    { value: 'opportunity', label: 'Opportunity Districts' },
    { value: 'comparison', label: 'Ensemble Comparison' },
  ];

  const [ensembleType, setEnsembleType] = useState('raceBlind');
  const [analysisView, setAnalysisView] = useState('stateSummary');
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [mapPlanMode, setMapPlanMode] = useState('current');
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleReset = useCallback(() => {
    setEnsembleType('raceBlind');
    setAnalysisView('stateSummary');
    setSelectedDistrictId(null);
    setMapPlanMode('current');
    setIsAnalysisOpen(false);
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

  const stateEnsembleData = ensembleData[stateAbbr] || {};
  const ensembleSummaryRows = [
    { label: 'Race-Blind', key: 'raceBlind' },
    { label: 'VRA Constrained', key: 'vra' },
  ].map((row) => {
    const details = stateEnsembleData[row.key] || {};
    return {
      label: row.label,
      plans: details.totalPlans ?? 'TBD',
      threshold: details.populationEqualityThresholdPct != null
        ? `${details.populationEqualityThresholdPct}%`
        : 'TBD',
    };
  });

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
            <div className="state-analysis__header-actions">
              <div className="state-analysis__analysis-menu">
                <label htmlFor="analysis-view-select">Analysis View</label>
                <select
                  id="analysis-view-select"
                  value={analysisView}
                  onFocus={() => setIsAnalysisOpen(true)}
                  onChange={(event) => {
                    setAnalysisView(event.target.value);
                    setIsAnalysisOpen(true);
                  }}
                >
                  {analysisOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="state-analysis__panel-toggle"
                onClick={() => setIsAnalysisOpen((prev) => !prev)}
                aria-expanded={isAnalysisOpen}
              >
                {isAnalysisOpen ? 'Hide Analysis' : 'Show Analysis'}
                <span className="state-analysis__panel-toggle-icon">{isAnalysisOpen ? '▾' : '▸'}</span>
              </button>
              <button
                type="button"
                className="state-analysis__panel-toggle"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? 'Hide Controls' : 'Show Controls'}
                <span className="state-analysis__panel-toggle-icon">{isSidebarOpen ? '▾' : '▸'}</span>
              </button>
            </div>
          </div>
          <div className="state-analysis__ensemble-summary">
            <h3 className="state-analysis__ensemble-title">Available Ensembles (Selected State)</h3>
            <div className="state-analysis__ensemble-table-wrap">
              <table className="state-analysis__ensemble-table">
                <thead>
                  <tr>
                    <th>Ensemble</th>
                    <th>District Plans</th>
                    <th>Population Equality Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {ensembleSummaryRows.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.plans}</td>
                      <td>{row.threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="state-analysis__ensemble-note">
              MCMC threshold values are mock placeholders until final ensemble metadata is provided.
            </p>
          </div>
          <div className="state-analysis__map-container">
            <StateMap
              key={stateAbbr}
              stateAbbr={stateAbbr}
              center={stateData.center}
              zoom={stateData.zoom}
              districtData={activeDistricts}
              comparisonDistrictData={stateData.comparisonPlanDistricts}
              stateDemographics={{
                blackPercent: stateData.blackPercent,
                hispanicPercent: stateData.hispanicPercent,
                asianPercent: stateData.asianPercent,
              }}
              planMode={mapPlanMode}
              highlightedDistrict={selectedDistrictId}
              onDistrictSelect={setSelectedDistrictId}
              analysisView={analysisView}
            />
          </div>
        </div>
        {isAnalysisOpen && (
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
        )}
      </div>
      {isSidebarOpen && (
        <Sidebar
          stateData={stateData}
          ensembleType={ensembleType}
          onEnsembleChange={setEnsembleType}
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
      )}
    </div>
  );
}
