import { useCallback, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import StateMap from '../components/StateMap';
import AnalysisPanel from '../components/AnalysisPanel';
import { states, ensembleData } from '../data/mockData';
import './StateAnalysisPage.css';

const ANALYSIS_OPTIONS = [
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

const ENSEMBLE_OPTIONS = [
  { value: 'raceBlind', label: 'Race-Blind' },
  { value: 'vra', label: 'VRA Constrained' },
];

const MAP_METRIC_OPTIONS = [
  { value: 'demographic', label: 'Demographic' },
  { value: 'partisan', label: 'Partisan' },
  { value: 'eiCandidateA', label: 'EI Candidate A' },
  { value: 'eiTurnoutGap', label: 'EI Turnout Gap' },
];

const DEMOGRAPHIC_GROUP_OPTIONS = [
  { value: 'overall', label: 'All Minority' },
  { value: 'black', label: 'Black' },
  { value: 'hispanic', label: 'Hispanic' },
  { value: 'asian', label: 'Asian' },
];

export default function StateAnalysisPage() {
  const { stateAbbr } = useParams();
  const stateData = states[stateAbbr];

  const [ensembleType, setEnsembleType] = useState('raceBlind');
  const [analysisView, setAnalysisView] = useState('stateSummary');
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [mapPlanMode, setMapPlanMode] = useState('current');
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isEnsembleInfoOpen, setIsEnsembleInfoOpen] = useState(false);

  const [mapMetric, setMapMetric] = useState('demographic');
  const [mapDemographicGroup, setMapDemographicGroup] = useState('overall');
  const [mapGeographyLevel, setMapGeographyLevel] = useState('precinct');
  const [showDistrictOutlines, setShowDistrictOutlines] = useState(true);

  const handleReset = useCallback(() => {
    setEnsembleType('raceBlind');
    setAnalysisView('stateSummary');
    setSelectedDistrictId(null);
    setMapPlanMode('current');
    setIsAnalysisOpen(false);
    setIsEnsembleInfoOpen(false);
    setMapMetric('demographic');
    setMapDemographicGroup('overall');
    setMapGeographyLevel('precinct');
    setShowDistrictOutlines(true);
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

  const stateEnsembleData = ensembleData[stateAbbr] || {};
  const selectedEnsembleDetails = stateEnsembleData[ensembleType] || {};
  const ensembleRows = ENSEMBLE_OPTIONS.map((option) => ({
    ...option,
    details: stateEnsembleData[option.value] || {},
  }));

  return (
    <div className="state-analysis">
      <div className="state-analysis__main">
        <div className="state-analysis__map">
          <div className="state-analysis__map-header">
            <div className="state-analysis__title-group">
              <h2 className="state-analysis__title">{stateData.name}</h2>
              <span className="state-analysis__subtitle">Redistricting Analysis Workspace</span>
            </div>

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
                {ANALYSIS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="state-analysis__header-actions">
              <label className="state-analysis__control-field" htmlFor="plan-picker-select">
                <span>Plan</span>
                <select
                  id="plan-picker-select"
                  value={mapPlanMode}
                  onChange={(event) => setMapPlanMode(event.target.value)}
                >
                  <option value="current">Current</option>
                  <option value="comparison">Comparison</option>
                  <option value="delta">Delta</option>
                  <option value="interesting">Interesting</option>
                </select>
              </label>

              <label className="state-analysis__control-field" htmlFor="map-metric-select">
                <span>Color</span>
                <select
                  id="map-metric-select"
                  value={mapMetric}
                  onChange={(event) => setMapMetric(event.target.value)}
                >
                  {MAP_METRIC_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              {mapMetric === 'demographic' && (
                <label className="state-analysis__control-field" htmlFor="map-group-select">
                  <span>Group</span>
                  <select
                    id="map-group-select"
                    value={mapDemographicGroup}
                    onChange={(event) => setMapDemographicGroup(event.target.value)}
                  >
                    {DEMOGRAPHIC_GROUP_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="state-analysis__control-field" htmlFor="map-geography-select">
                <span>Geography</span>
                <select
                  id="map-geography-select"
                  value={mapGeographyLevel}
                  onChange={(event) => setMapGeographyLevel(event.target.value)}
                >
                  <option value="precinct">Precinct</option>
                  <option value="censusBlock">Census Block</option>
                </select>
              </label>

              <label className="state-analysis__check-pill">
                <input
                  type="checkbox"
                  checked={showDistrictOutlines}
                  onChange={(event) => setShowDistrictOutlines(event.target.checked)}
                />
                <span>Boundaries</span>
              </label>

              <button
                type="button"
                className="state-analysis__panel-toggle"
                onClick={handleReset}
              >
                Reset
              </button>

              <button
                type="button"
                className="state-analysis__panel-toggle"
                onClick={() => setIsAnalysisOpen((prev) => !prev)}
                aria-expanded={isAnalysisOpen}
              >
                {isAnalysisOpen ? 'Hide Analysis' : 'Show Analysis'}
                <span className="state-analysis__panel-toggle-icon">{isAnalysisOpen ? '▾' : '▸'}</span>
              </button>
            </div>
          </div>

          <section className={`state-analysis__ensemble-summary ${isEnsembleInfoOpen ? '' : 'state-analysis__ensemble-summary--collapsed'}`}>
            <div className="state-analysis__ensemble-header">
              <h3 className="state-analysis__ensemble-title">Available Ensembles (Selected State)</h3>
              <div className="state-analysis__ensemble-inline">
                <label className="state-analysis__control-field state-analysis__control-field--inline" htmlFor="ensemble-select">
                  <span>Ensemble</span>
                  <select
                    id="ensemble-select"
                    value={ensembleType}
                    onChange={(event) => setEnsembleType(event.target.value)}
                    aria-label="Select ensemble type"
                  >
                    {ENSEMBLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="state-analysis__ensemble-toggle"
                  onClick={() => setIsEnsembleInfoOpen((prev) => !prev)}
                  aria-expanded={isEnsembleInfoOpen}
                >
                  {isEnsembleInfoOpen ? 'Collapse' : 'Expand'}
                  <span>{isEnsembleInfoOpen ? '▾' : '▸'}</span>
                </button>
              </div>
            </div>
            {isEnsembleInfoOpen && (
              <div className="state-analysis__ensemble-meta">
                <div className="state-analysis__ensemble-focus">
                  <span className="state-analysis__ensemble-focus-label">Selected</span>
                  <span className="state-analysis__ensemble-focus-value">
                    {ENSEMBLE_OPTIONS.find((option) => option.value === ensembleType)?.label}
                  </span>
                  <span className="state-analysis__ensemble-focus-detail">
                    {selectedEnsembleDetails.totalPlans ?? 'TBD'} plans · threshold&nbsp;
                    {selectedEnsembleDetails.populationEqualityThresholdPct != null
                      ? `${selectedEnsembleDetails.populationEqualityThresholdPct}%`
                      : 'TBD'}
                  </span>
                </div>
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
                      {ensembleRows.map((row) => (
                        <tr key={row.value} className={row.value === ensembleType ? 'state-analysis__ensemble-row--active' : ''}>
                          <td>{row.label}</td>
                          <td>{row.details.totalPlans ?? 'TBD'}</td>
                          <td>
                            {row.details.populationEqualityThresholdPct != null
                              ? `${row.details.populationEqualityThresholdPct}%`
                              : 'TBD'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="state-analysis__ensemble-note">
                  MCMC threshold and plan counts are mock placeholders until final ensemble metadata is connected.
                </p>
              </div>
            )}
          </section>

          <div className={`state-analysis__workspace ${isAnalysisOpen ? 'state-analysis__workspace--split' : ''}`}>
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
                mapMetric={mapMetric}
                onMapMetricChange={setMapMetric}
                mapDemographicGroup={mapDemographicGroup}
                onMapDemographicGroupChange={setMapDemographicGroup}
                mapGeographyLevel={mapGeographyLevel}
                onMapGeographyLevelChange={setMapGeographyLevel}
                showDistrictOutlines={showDistrictOutlines}
                showOverlayControls={false}
              />
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
        </div>
      </div>
    </div>
  );
}
