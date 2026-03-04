import { useCallback, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import StateMap from '../components/StateMap';
import AnalysisPanel from '../components/AnalysisPanel';
import PillDropdown from '../components/PillDropdown';
import { states } from '../data/mockData';
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
  { value: 'eiKde', label: 'EI KDE' },
  { value: 'seatShare', label: 'Seat Share Distribution' },
  { value: 'opportunity', label: 'Opportunity Districts' },
  { value: 'comparison', label: 'Ensemble Comparison' },
];

const ENSEMBLE_OPTIONS = [
  { value: 'raceBlind', label: 'Race-Blind' },
  { value: 'vra', label: 'VRA Constrained' },
];

const PLAN_OPTIONS = [
  { value: 'current', label: 'Current' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'delta', label: 'Delta' },
  { value: 'interesting', label: 'Interesting' },
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

const GEOGRAPHY_OPTIONS = [
  { value: 'precinct', label: 'Precinct' },
  { value: 'censusBlock', label: 'Census Block' },
];

export default function StateAnalysisPage() {
  const { stateAbbr } = useParams();
  const stateData = states[stateAbbr];

  const [ensembleType, setEnsembleType] = useState('raceBlind');
  const [analysisView, setAnalysisView] = useState('stateSummary');
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [mapPlanMode, setMapPlanMode] = useState('current');
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

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

  return (
    <div className="state-analysis">
      <div className="state-analysis__main">
        <div className="state-analysis__map">
          <div className="state-analysis__map-header">
            <div className="state-analysis__title-group">
              <h2 className="state-analysis__title">{stateData.name}</h2>
              <span className="state-analysis__subtitle">Redistricting Analysis Workspace</span>
            </div>

            <div className="state-analysis__header-actions">
              <PillDropdown
                className="state-analysis__analysis-menu"
                label="Analysis View"
                value={analysisView}
                options={ANALYSIS_OPTIONS}
                align="right"
                onChange={(nextValue) => {
                  setAnalysisView(nextValue);
                  setIsAnalysisOpen(true);
                }}
              />

              <PillDropdown
                className="state-analysis__control-field"
                label="Plan"
                value={mapPlanMode}
                options={PLAN_OPTIONS}
                onChange={setMapPlanMode}
              />

              <PillDropdown
                className="state-analysis__control-field"
                label="Color"
                value={mapMetric}
                options={MAP_METRIC_OPTIONS}
                onChange={setMapMetric}
              />

              <PillDropdown
                className="state-analysis__control-field"
                label="Ensemble"
                value={ensembleType}
                options={ENSEMBLE_OPTIONS}
                onChange={setEnsembleType}
              />

              {mapMetric === 'demographic' && (
                <PillDropdown
                  className="state-analysis__control-field"
                  label="Group"
                  value={mapDemographicGroup}
                  options={DEMOGRAPHIC_GROUP_OPTIONS}
                  onChange={setMapDemographicGroup}
                />
              )}

              <PillDropdown
                className="state-analysis__control-field"
                label="Geography"
                value={mapGeographyLevel}
                options={GEOGRAPHY_OPTIONS}
                onChange={setMapGeographyLevel}
              />

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
