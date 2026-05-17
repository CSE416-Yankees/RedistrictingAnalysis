import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import StateMap from '../components/StateMap';
import AnalysisPanel from '../components/AnalysisPanel';
import PillDropdown from '../components/PillDropdown';
import { states } from '../data/mockData';
import { guiMockPayloads } from '../data/guiMockPayloads';
import {
  fetchGuiPayloadBundle,
  USE_API_GUI_PAYLOADS,
} from '../api/guiDataClient';
import {
  ALL_GUI_SLUGS,
  ANALYSIS_OPTIONS,
  resolveGuiUiConfig,
  routeSlugForAnalysisView,
} from '../gui/guiRouteConfig';
import './StateAnalysisPage.css';

const ENSEMBLE_OPTIONS = [
  { value: 'raceBlind', label: 'Race-Blind' },
  { value: 'vra', label: 'VRA Constrained' },
];

const PLAN_OPTIONS = [
  { value: 'current', label: 'Current Plan' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'delta', label: 'Delta' },
  { value: 'interesting', label: 'Interesting' },
];

const MAP_METRIC_OPTIONS = [
  { value: 'demographic', label: 'Demographic' },
  { value: 'partisan', label: 'Partisan' },
];

const DEMOGRAPHIC_GROUP_OPTIONS = [
  { value: 'overall', label: 'All Minority' },
  { value: 'black', label: 'Black' },
  { value: 'hispanic', label: 'Hispanic' },
  { value: 'asian', label: 'Asian' },
];

const ANALYSIS_GROUP_OPTIONS = DEMOGRAPHIC_GROUP_OPTIONS.filter((option) => option.value !== 'overall');

// Only minority groups above the demographic threshold for VRA analysis
// are available to pick. Mississippi: Black is ~38%; Hispanic and Asian
// are each well under threshold so they are excluded.
const FEASIBLE_GROUPS_BY_STATE = {
  MS: ['black'],
};

function feasibleGroupValues(stateAbbr) {
  return FEASIBLE_GROUPS_BY_STATE[stateAbbr] || null;
}

function feasibleDemographicGroupOptions(stateAbbr) {
  const allowed = feasibleGroupValues(stateAbbr);
  if (!allowed) return DEMOGRAPHIC_GROUP_OPTIONS;
  const allowedSet = new Set(allowed);
  return DEMOGRAPHIC_GROUP_OPTIONS.filter((option) => allowedSet.has(option.value));
}

function feasibleAnalysisGroupOptions(stateAbbr) {
  const allowed = feasibleGroupValues(stateAbbr);
  if (!allowed) return ANALYSIS_GROUP_OPTIONS;
  const allowedSet = new Set(allowed);
  return ANALYSIS_GROUP_OPTIONS.filter((option) => allowedSet.has(option.value));
}

function coerceDemographicGroup(stateAbbr, group) {
  const allowed = feasibleGroupValues(stateAbbr);
  if (!allowed) return group;
  return allowed.includes(group) ? group : allowed[0];
}

const ANALYSIS_TAB_VIEWS = new Set([
  'gingles',
  'eiCandidates',
  'boxWhisker',
  'ensembleSplits',
  'vraImpact',
  'minorityEffectivenessBox',
  'minorityEffectivenessHistogram',
  'minorityRangeBars',
]);

const DEPRECATED_ROUTE_REDIRECTS = {
  'gui-10': 'gui-9',
};

const ANALYSIS_TAB_OPTIONS = ANALYSIS_OPTIONS.filter((option) => ANALYSIS_TAB_VIEWS.has(option.value));

const VIEW_TITLES = {
  currentPlanMap: 'Current District Plan',
  stateSummary: 'State Data Summary',
  demographicHeatMap: 'Demographic Heat Map',
  districtDetails: 'Congressional Representation',
  planComparisonMap: 'Compare District Plans',
  interestingPlanMap: 'Interesting District Plan',
  gingles: 'Gingles Analysis',
  eiCandidates: 'Ecological Inference Results',
  ensembleSplits: 'Ensemble Vote Splits',
  boxWhisker: 'District Distribution',
  vraImpact: 'VRA Impact Thresholds',
  minorityEffectivenessBox: 'Minority Effectiveness Range',
  minorityEffectivenessHistogram: 'Minority Effectiveness Histogram',
  minorityRangeBars: 'Minority District Range Bars',
};

const VIEW_DESCRIPTIONS = {
  currentPlanMap: 'Current enacted congressional districts centered on the selected state.',
  stateSummary: 'Population, vote share, representation, demographics, and ensemble availability.',
  demographicHeatMap: 'Precinct demographic concentration by selected minority group.',
  districtDetails: 'Representative, party, vote margin, and effectiveness scores by district.',
  planComparisonMap: 'Enacted and selected district plans shown side by side.',
  interestingPlanMap: 'SeaWulf-selected plans with the metrics that make each plan notable.',
  gingles: 'Precinct-level vote share compared with selected minority population share.',
  ginglesTable: 'Precinct population and vote inputs used in the Gingles analysis.',
  eiCandidates: 'Candidate support curves by selected racial or language groups.',
  ensembleSplits: 'Race-Blind and VRA-constrained partisan split frequencies.',
  boxWhisker: 'District-level demographic distributions across ensemble plans.',
  vraImpact: 'Race-Blind and VRA ensemble outcomes compared against legal thresholds.',
  minorityEffectivenessBox: 'Effective-district counts compared across Race-Blind and VRA ensembles.',
  minorityEffectivenessHistogram: 'Distribution overlap for minority-effective districts across ensembles.',
  minorityRangeBars: 'Range of minority-effective and majority-minority districts per feasible group, Race-Blind vs VRA.',
};

function matchGuiSlug(slug) {
  if (slug == null || slug === '') return undefined;
  const normalized = String(slug).trim().toLowerCase();
  return ALL_GUI_SLUGS.find((s) => s.toLowerCase() === normalized);
}

function defaultComparisonPlanForMode(planMode) {
  if (planMode === 'comparison' || planMode === 'delta') return 'comparison';
  return 'interestingMax';
}

function pageTitleForView(stateName, analysisView, mapPlanMode) {
  if (analysisView === 'stateSummary' && mapPlanMode === 'current') {
    return `${stateName} District Plans`;
  }
  return VIEW_TITLES[analysisView] || `${stateName} Analysis`;
}

export default function StateAnalysisPage() {
  const navigate = useNavigate();
  const { stateAbbr, guiSlug } = useParams();
  const guiSlugCanonical = matchGuiSlug(guiSlug);
  const stateKey = stateAbbr && String(stateAbbr).trim()
    ? String(stateAbbr).trim().toUpperCase()
    : undefined;
  const stateData = stateKey ? states[stateKey] : undefined;
  const fallbackGuiPayloads = stateKey ? guiMockPayloads[stateKey] : null;

  const [guiPayloads, setGuiPayloads] = useState(fallbackGuiPayloads);
  const [isGuiDataLoading, setIsGuiDataLoading] = useState(false);
  const [guiDataError, setGuiDataError] = useState(null);

  const [ensembleType, setEnsembleType] = useState('raceBlind');
  const [analysisView, setAnalysisView] = useState(() => resolveGuiUiConfig(matchGuiSlug(guiSlug)).analysisView);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [mapPlanMode, setMapPlanMode] = useState(() => resolveGuiUiConfig(matchGuiSlug(guiSlug)).mapPlanMode);
  const [selectedInterestingPlan, setSelectedInterestingPlan] = useState('interestingMax');

  const [mapMetric, setMapMetric] = useState(() => resolveGuiUiConfig(matchGuiSlug(guiSlug)).mapMetric);
  const [mapDemographicGroup, setMapDemographicGroup] = useState(() => resolveGuiUiConfig(matchGuiSlug(guiSlug)).mapDemographicGroup);
  const [showDistrictOutlines, setShowDistrictOutlines] = useState(true);

  // Sync page state with the current route.
  useEffect(() => {
    const cfg = resolveGuiUiConfig(guiSlugCanonical);
    setAnalysisView(cfg.analysisView);
    setMapPlanMode(cfg.mapPlanMode);
    setSelectedInterestingPlan(defaultComparisonPlanForMode(cfg.mapPlanMode));
    setMapMetric(cfg.mapMetric);
    setMapDemographicGroup((currentGroup) => {
      const targetGroup = ANALYSIS_TAB_VIEWS.has(cfg.analysisView)
        ? (ANALYSIS_GROUP_OPTIONS.some((option) => option.value === currentGroup) ? currentGroup : 'black')
        : cfg.mapDemographicGroup;
      return coerceDemographicGroup(stateKey, targetGroup);
    });
    setSelectedDistrictId(null);
  }, [stateKey, guiSlugCanonical]);

  // Fetch payloads for the selected state.
  useEffect(() => {
    let isCancelled = false;
    const fallback = stateKey ? guiMockPayloads[stateKey] : undefined;

    if (!fallback) {
      setGuiPayloads(null);
      setIsGuiDataLoading(false);
      setGuiDataError(null);
      return undefined;
    }

    if (!USE_API_GUI_PAYLOADS) {
      setGuiPayloads(fallback);
      setIsGuiDataLoading(false);
      setGuiDataError(null);
      return undefined;
    }

    const loadGuiPayloads = async () => {
      setGuiPayloads(fallback);
      setIsGuiDataLoading(true);
      setGuiDataError(null);

      try {
        const nextPayloads = await fetchGuiPayloadBundle(stateKey, fallback);
        if (!isCancelled) {
          setGuiPayloads(nextPayloads);
        }
      } catch {
        if (!isCancelled) {
          setGuiPayloads(fallback);
          setGuiDataError('Using local sample GUI payloads because the API is unavailable.');
        }
      } finally {
        if (!isCancelled) {
          setIsGuiDataLoading(false);
        }
      }
    };

    if (stateKey) {
      loadGuiPayloads();
    }

    return () => {
      // Prevent stale requests from updating the page after state changes.
      isCancelled = true;
    };
  }, [stateKey]);

  const handleAnalysisMenuChange = useCallback((nextValue) => {
    if (!stateKey) return;
    const slug = routeSlugForAnalysisView(nextValue);
    setAnalysisView(nextValue);
    navigate(`/state/${stateKey}/gui/${slug}`);
  }, [navigate, stateKey]);

  const handleCompareWithEnacted = useCallback(() => {
    const nextMode = mapPlanMode === 'comparison' ? 'current' : 'comparison';
    setMapPlanMode(nextMode);
    if (nextMode === 'comparison') {
      setSelectedInterestingPlan('comparison');
      setAnalysisView('planComparisonMap');
      navigate(`/state/${stateKey}/gui/gui-8`);
    } else {
      setAnalysisView('stateSummary');
      navigate(`/state/${stateKey}`);
    }
  }, [mapPlanMode, navigate, stateKey]);

  const handlePlanModeChange = useCallback((nextMode) => {
    setMapPlanMode(nextMode);
    if (nextMode === 'comparison' || nextMode === 'delta') {
      setSelectedInterestingPlan('comparison');
      setAnalysisView(nextMode === 'comparison' ? 'planComparisonMap' : 'stateSummary');
      if (nextMode === 'comparison') {
        navigate(`/state/${stateKey}/gui/gui-8`);
      }
    } else if (nextMode === 'interesting') {
      setSelectedInterestingPlan('interestingMax');
      setAnalysisView('interestingPlanMap');
      navigate(`/state/${stateKey}/gui/gui-19`);
    } else {
      setAnalysisView('stateSummary');
      navigate(`/state/${stateKey}`);
    }
  }, [navigate, stateKey]);

  const handleDistrictDetail = useCallback(() => {
    setAnalysisView((currentView) => (currentView === 'districtDetails' ? 'stateSummary' : 'districtDetails'));
  }, []);

  const handleAnalysisGroupLabelChange = useCallback((nextGroupLabel) => {
    const nextGroupValue = groupValueFromLabel(nextGroupLabel);
    if (nextGroupValue) {
      setMapDemographicGroup(nextGroupValue);
    }
  }, []);

  if (!stateData) {
    return <Navigate to="/" replace />;
  }

  if (stateAbbr !== stateKey) {
    const suffix = guiSlugCanonical ? `/gui/${guiSlugCanonical}` : '';
    return <Navigate to={`/state/${stateKey}${suffix}`} replace />;
  }

  if (guiSlug && !guiSlugCanonical) {
    return <Navigate to={`/state/${stateKey}`} replace />;
  }

  if (guiSlugCanonical && DEPRECATED_ROUTE_REDIRECTS[guiSlugCanonical]) {
    return <Navigate to={`/state/${stateKey}/gui/${DEPRECATED_ROUTE_REDIRECTS[guiSlugCanonical]}`} replace />;
  }

  if (guiSlug && guiSlugCanonical !== guiSlug) {
    return <Navigate to={`/state/${stateKey}/gui/${guiSlugCanonical}`} replace />;
  }

  const currentPlanDistricts = districtsFromPlanPayload(guiPayloads?.currentPlan, stateData.currentPlanDistricts);
  const comparisonPlanOptions = interestingPlanOptions(guiPayloads?.planComparison);
  const interestingPlanChoices = comparisonPlanOptions.filter((option) => option.value !== 'comparison');
  const activeComparisonPlanOptions = mapPlanMode === 'interesting' && interestingPlanChoices.length > 0
    ? interestingPlanChoices
    : comparisonPlanOptions;
  const fallbackComparisonPlan = comparisonPlanOptions.find((option) => option.value === 'comparison')
    || comparisonPlanOptions[0];
  const fallbackInterestingPlan = activeComparisonPlanOptions.find((option) => option.value === 'interestingMax')
    || activeComparisonPlanOptions[0];
  const selectedComparisonOption = activeComparisonPlanOptions.find((option) => option.value === selectedInterestingPlan)
    || (mapPlanMode === 'interesting' ? fallbackInterestingPlan : fallbackComparisonPlan);
  const selectedComparisonPlan = selectedComparisonOption?.value || 'comparison';
  const isSplitPlanComparison = (mapPlanMode === 'comparison' || mapPlanMode === 'interesting')
    && comparisonPlanOptions.length > 0;
  const comparisonSummary = planComparisonSummary(
    guiPayloads?.planComparison,
    selectedComparisonPlan,
    selectedComparisonOption,
  );

  const mapCenter = leafletCenterFromGuiState(guiPayloads?.currentPlan?.state, stateData.center);
  const mapZoom = guiPayloads?.currentPlan?.state?.zoom ?? stateData.zoom;
  const activeHeatMapPayload = heatMapPayloadForGroup(guiPayloads?.heatMaps, mapDemographicGroup);
  const activeWorkbenchTab = ANALYSIS_TAB_VIEWS.has(analysisView) ? 'analysis' : 'plans';
  const planSideAnalysisView = analysisView === 'districtDetails' ? 'districtDetails' : 'stateSummary';
  const shouldUsePrecinctLayer = analysisView === 'demographicHeatMap';
  const showPlanMetricControls = shouldUsePrecinctLayer;
  const showAnalysisEnsembleControl = analysisView === 'boxWhisker' || analysisView === 'ensembleSplits';
  const analysisGroupLabel = groupLabelFromValue(mapDemographicGroup);
  const isFullWidthPlanComparison = mapPlanMode === 'comparison' && isSplitPlanComparison;
  const pageTitle = pageTitleForView(stateData.name, analysisView, mapPlanMode);
  const pageDescription = VIEW_DESCRIPTIONS[analysisView] || VIEW_DESCRIPTIONS.stateSummary;
  const workspaceLabel = activeWorkbenchTab === 'plans' ? 'Plan Explorer' : 'Analysis';
  const demographicGroupOptions = feasibleDemographicGroupOptions(stateKey);
  const analysisGroupOptions = feasibleAnalysisGroupOptions(stateKey);

  return (
    <div className="state-analysis">
      <div className="state-analysis__main">
        <div className="state-analysis__map">
          <div className="state-analysis__state-title">
            <div className="state-analysis__title-copy">
              <span className="state-analysis__eyebrow">{workspaceLabel}</span>
              <h2>{pageTitle}</h2>
              <p>{pageDescription}</p>
            </div>
            <div className="state-analysis__title-meta" aria-label="Selected state">
              <span>{stateData.name}</span>
              <span>{stateData.numDistricts} districts</span>
            </div>
          </div>

          {activeWorkbenchTab === 'plans' ? (
            <div className={`state-analysis__plan-shell ${isFullWidthPlanComparison ? 'state-analysis__plan-shell--compare' : ''}`}>
              <section className="state-analysis__map-panel" aria-label={`${stateData.name} district map`}>
                <div className={`state-analysis__map-container ${isSplitPlanComparison ? 'state-analysis__map-container--split' : ''}`}>
                  {isSplitPlanComparison ? (
                    <div className="state-analysis__compare-grid">
                      <div className="state-analysis__compare-pane">
                        <div className="state-analysis__compare-title">
                          <span>Enacted Plan</span>
                          <strong>Current Districts</strong>
                        </div>
                        <div className="state-analysis__compare-map">
                          <StateMap
                            key={`${stateKey}-current`}
                            stateAbbr={stateKey}
                            center={mapCenter}
                            zoom={mapZoom}
                            districtData={currentPlanDistricts}
                            currentPlanPayload={guiPayloads?.currentPlan}
                            planComparisonPayload={guiPayloads?.planComparison}
                            selectedComparisonPlan={selectedComparisonPlan}
                            heatMapPayload={activeHeatMapPayload}
                            stateDemographics={{
                              blackPercent: stateData.blackPercent,
                              hispanicPercent: stateData.hispanicPercent,
                              asianPercent: stateData.asianPercent,
                            }}
                            planMode="current"
                            highlightedDistrict={selectedDistrictId}
                            onDistrictSelect={setSelectedDistrictId}
                            mapMetric="district"
                            onMapMetricChange={setMapMetric}
                            mapDemographicGroup={mapDemographicGroup}
                            onMapDemographicGroupChange={setMapDemographicGroup}
                            showDistrictOutlines={showDistrictOutlines}
                            showOverlayControls={false}
                            usePrecinctLayer={false}
                          />
                        </div>
                      </div>

                      <div className="state-analysis__compare-pane">
                        <div className="state-analysis__compare-title">
                          <span>{mapPlanMode === 'interesting' ? 'Interesting Plan' : 'Comparison Plan'}</span>
                          <strong>{selectedComparisonOption?.label || titleCasePlanKey(selectedComparisonPlan)}</strong>
                        </div>
                        <div className="state-analysis__compare-map">
                          <StateMap
                            key={`${stateKey}-${selectedComparisonPlan}`}
                            stateAbbr={stateKey}
                            center={mapCenter}
                            zoom={mapZoom}
                            districtData={currentPlanDistricts}
                            currentPlanPayload={guiPayloads?.currentPlan}
                            planComparisonPayload={guiPayloads?.planComparison}
                            selectedComparisonPlan={selectedComparisonPlan}
                            heatMapPayload={activeHeatMapPayload}
                            stateDemographics={{
                              blackPercent: stateData.blackPercent,
                              hispanicPercent: stateData.hispanicPercent,
                              asianPercent: stateData.asianPercent,
                            }}
                            planMode={mapPlanMode}
                            highlightedDistrict={selectedDistrictId}
                            onDistrictSelect={setSelectedDistrictId}
                            mapMetric="district"
                            onMapMetricChange={setMapMetric}
                            mapDemographicGroup={mapDemographicGroup}
                            onMapDemographicGroupChange={setMapDemographicGroup}
                            showDistrictOutlines={showDistrictOutlines}
                            showOverlayControls={false}
                            usePrecinctLayer={false}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <StateMap
                      key={stateKey}
                      stateAbbr={stateKey}
                      center={mapCenter}
                      zoom={mapZoom}
                      districtData={currentPlanDistricts}
                      currentPlanPayload={guiPayloads?.currentPlan}
                      planComparisonPayload={guiPayloads?.planComparison}
                      selectedComparisonPlan={selectedComparisonPlan}
                      heatMapPayload={activeHeatMapPayload}
                      stateDemographics={{
                        blackPercent: stateData.blackPercent,
                        hispanicPercent: stateData.hispanicPercent,
                        asianPercent: stateData.asianPercent,
                      }}
                      planMode={mapPlanMode}
                      highlightedDistrict={selectedDistrictId}
                      onDistrictSelect={setSelectedDistrictId}
                      mapMetric={shouldUsePrecinctLayer ? mapMetric : 'partisan'}
                      onMapMetricChange={setMapMetric}
                      mapDemographicGroup={mapDemographicGroup}
                      onMapDemographicGroupChange={setMapDemographicGroup}
                      showDistrictOutlines={showDistrictOutlines}
                      showOverlayControls={false}
                      usePrecinctLayer={shouldUsePrecinctLayer}
                    />
                  )}
                </div>

                <div className="state-analysis__plan-controls">
                  {isSplitPlanComparison && (
                    <div className="state-analysis__compare-summary" aria-label="Selected comparison plan summary">
                      <div className="state-analysis__compare-summary-main">
                        <span className="state-analysis__compare-summary-kicker">
                          {mapPlanMode === 'interesting' ? 'Interesting Plan' : 'Compared Plan'}
                        </span>
                        <strong>{selectedComparisonOption?.label || titleCasePlanKey(selectedComparisonPlan)}</strong>
                        {comparisonSummary.reason && <span>{comparisonSummary.reason}</span>}
                      </div>
                      <div className="state-analysis__compare-summary-stat">
                        <span>Changed Precincts</span>
                        <strong>{comparisonSummary.changedLabel}</strong>
                      </div>
                      {comparisonSummary.metricRows.map(([label, value]) => (
                        <div className="state-analysis__compare-summary-stat" key={label}>
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <PillDropdown
                    className="state-analysis__control-field"
                    label="Plan"
                    value={mapPlanMode}
                    options={PLAN_OPTIONS}
                    onChange={handlePlanModeChange}
                  />

                  {(mapPlanMode === 'comparison' || mapPlanMode === 'delta' || mapPlanMode === 'interesting')
                    && activeComparisonPlanOptions.length > 0 && (
                    <PillDropdown
                      className="state-analysis__control-field state-analysis__control-field--wide"
                      label={mapPlanMode === 'interesting' ? 'Interesting' : 'Compare'}
                      value={selectedComparisonPlan}
                      options={activeComparisonPlanOptions}
                      onChange={setSelectedInterestingPlan}
                    />
                  )}

                  {mapPlanMode !== 'interesting' && (
                    <button
                      type="button"
                      className={`state-analysis__action ${mapPlanMode === 'comparison' ? 'state-analysis__action--active' : ''}`}
                      onClick={handleCompareWithEnacted}
                      title={mapPlanMode === 'comparison' ? 'Return to the single current-plan map' : 'Show enacted and selected plans side by side'}
                    >
                      {mapPlanMode === 'comparison' ? 'Exit Comparison' : 'Compare with Enacted'}
                    </button>
                  )}

                  {!isFullWidthPlanComparison && (
                    <button
                      type="button"
                      className={`state-analysis__action ${analysisView === 'districtDetails' ? 'state-analysis__action--active' : ''}`}
                      onClick={handleDistrictDetail}
                      aria-pressed={analysisView === 'districtDetails'}
                      title={analysisView === 'districtDetails'
                        ? 'Return to the state summary panel'
                        : 'Show per-district representation details'}
                    >
                      {analysisView === 'districtDetails' ? 'Hide District Detail' : 'District Detail'}
                    </button>
                  )}

                  {showPlanMetricControls && (
                    <>
                      <PillDropdown
                        className="state-analysis__control-field"
                        label="Color By"
                        value={mapMetric}
                        options={MAP_METRIC_OPTIONS}
                        onChange={setMapMetric}
                      />

                      {mapMetric === 'demographic' && demographicGroupOptions.length > 1 && (
                        <PillDropdown
                          className="state-analysis__control-field"
                          label="Group"
                          value={mapDemographicGroup}
                          options={demographicGroupOptions}
                          onChange={setMapDemographicGroup}
                        />
                      )}
                      {mapMetric === 'demographic' && demographicGroupOptions.length === 1 && (
                        <span
                          className="state-analysis__static-pill"
                          title="Only this group meets the demographic threshold for this state."
                        >
                          <span className="state-analysis__static-pill-label">Group</span>
                          <span className="state-analysis__static-pill-value">{demographicGroupOptions[0].label}</span>
                        </span>
                      )}
                    </>
                  )}

                  <label
                    className="state-analysis__check-pill"
                    title="Toggle district boundary outlines on the map"
                  >
                    <input
                      type="checkbox"
                      checked={showDistrictOutlines}
                      onChange={(event) => setShowDistrictOutlines(event.target.checked)}
                    />
                    <span>District Boundaries</span>
                  </label>
                </div>
              </section>

              {!isFullWidthPlanComparison && (
                <aside className="state-analysis__overview-panel" aria-label="State overview">
                  {analysisView === 'interestingPlanMap' ? (
                    <InterestingPlanPanel
                      plans={interestingPlanChoices.length > 0 ? interestingPlanChoices : comparisonPlanOptions}
                      selectedPlanKey={selectedComparisonPlan}
                      selectedPlan={selectedComparisonOption}
                      summary={comparisonSummary}
                      onSelectPlan={setSelectedInterestingPlan}
                    />
                  ) : (
                    <AnalysisPanel
                      ensembleType={ensembleType}
                      analysisView={planSideAnalysisView}
                      stateData={stateData}
                      guiPayloads={guiPayloads}
                      isSummaryLoading={isGuiDataLoading}
                      summaryError={guiDataError}
                      highlightedDistrict={selectedDistrictId}
                      onHighlightDistrict={setSelectedDistrictId}
                    />
                  )}
                </aside>
              )}
            </div>
          ) : (
            <div className="state-analysis__analysis-shell">
              <div className="state-analysis__analysis-toolbar">
                <PillDropdown
                  className="state-analysis__analysis-menu"
                  label="Analysis View"
                  value={analysisView}
                  options={ANALYSIS_TAB_OPTIONS}
                  onChange={handleAnalysisMenuChange}
                />
                {analysisGroupOptions.length > 1 && (
                  <PillDropdown
                    className="state-analysis__control-field"
                    label="Minority"
                    value={mapDemographicGroup}
                    options={analysisGroupOptions}
                    onChange={setMapDemographicGroup}
                  />
                )}
                {analysisGroupOptions.length === 1 && (
                  <span className="state-analysis__static-pill" title="Only this group meets the demographic threshold for this state.">
                    <span className="state-analysis__static-pill-label">Minority</span>
                    <span className="state-analysis__static-pill-value">{analysisGroupOptions[0].label}</span>
                  </span>
                )}
                {showAnalysisEnsembleControl && (
                  <PillDropdown
                    className="state-analysis__control-field"
                    label="Ensemble"
                    value={ensembleType}
                    options={ENSEMBLE_OPTIONS}
                    onChange={setEnsembleType}
                  />
                )}
              </div>

              <div className="state-analysis__analysis-split">
                <section className="state-analysis__analysis-map-panel" aria-label={`${stateData.name} demographic heat map`}>
                  <div className="state-analysis__analysis-map-container">
                    <StateMap
                      stateAbbr={stateKey}
                      center={mapCenter}
                      zoom={mapZoom}
                      districtData={currentPlanDistricts}
                      currentPlanPayload={guiPayloads?.currentPlan}
                      planComparisonPayload={guiPayloads?.planComparison}
                      selectedComparisonPlan={selectedComparisonPlan}
                      heatMapPayload={activeHeatMapPayload}
                      stateDemographics={{
                        blackPercent: stateData.blackPercent,
                        hispanicPercent: stateData.hispanicPercent,
                        asianPercent: stateData.asianPercent,
                      }}
                      planMode="current"
                      highlightedDistrict={selectedDistrictId}
                      onDistrictSelect={setSelectedDistrictId}
                      mapMetric="demographic"
                      onMapMetricChange={setMapMetric}
                      mapDemographicGroup={mapDemographicGroup}
                      onMapDemographicGroupChange={setMapDemographicGroup}
                      showDistrictOutlines={showDistrictOutlines}
                      showOverlayControls={false}
                      usePrecinctLayer
                    />
                  </div>
                </section>

                <div className="state-analysis__analysis-board">
                  <AnalysisPanel
                    ensembleType={ensembleType}
                    analysisView={analysisView}
                    stateData={stateData}
                    guiPayloads={guiPayloads}
                    isSummaryLoading={isGuiDataLoading}
                    summaryError={guiDataError}
                    highlightedDistrict={selectedDistrictId}
                    onHighlightDistrict={setSelectedDistrictId}
                    selectedGroup={analysisGroupLabel}
                    onSelectedGroupChange={handleAnalysisGroupLabelChange}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function InterestingPlanPanel({
  plans,
  selectedPlanKey,
  selectedPlan,
  summary,
  onSelectPlan,
}) {
  const visiblePlans = plans || [];

  return (
    <div className="interesting-plan-panel">
        <div className="interesting-plan-panel__card">
          <div className="interesting-plan-panel__heading">
          <span>SeaWulf Plans</span>
          <h3>Interesting District Plan</h3>
          <p>SeaWulf plan variants selected for notable minority-effectiveness or opportunity-district behavior.</p>
        </div>

        <div className="interesting-plan-panel__selected">
          <span>Selected Plan</span>
          <strong>{selectedPlan?.label || titleCasePlanKey(selectedPlanKey)}</strong>
          {summary.reason && <p>{summary.reason}</p>}
        </div>

        <div className="interesting-plan-panel__metrics" aria-label="Selected interesting plan metrics">
          <div>
            <span>Changed Precincts</span>
            <strong>{summary.changedLabel}</strong>
          </div>
          {summary.metricRows.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="interesting-plan-panel__catalog">
          <div className="interesting-plan-panel__catalog-title">
            <span>Available Interesting Plans</span>
            <strong>{visiblePlans.length}</strong>
          </div>
          <div className="interesting-plan-panel__list">
            {visiblePlans.map((plan) => (
              <button
                key={plan.value}
                type="button"
                className={`interesting-plan-panel__option ${plan.value === selectedPlanKey ? 'interesting-plan-panel__option--active' : ''}`}
                onClick={() => onSelectPlan(plan.value)}
              >
                <span>{plan.label}</span>
                {plan.description && <small>{plan.description}</small>}
              </button>
            ))}
            {visiblePlans.length === 0 && (
              <div className="interesting-plan-panel__empty">
                No interesting plans are available for this state yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function districtsFromPlanPayload(payload, fallbackDistricts) {
  const plan = payload?.currentPlan || payload?.plan || payload;

  if (plan?.precinctToDistrict && typeof plan.precinctToDistrict === 'object'
    && !Array.isArray(plan?.districts) && !plan?.districtSummaries) {
    return fallbackDistricts;
  }

  if (Array.isArray(plan?.districts) && plan.districts.length > 0) {
    return plan.districts.map((district) => ({
      id: district.districtNumber ?? district.id,
      dem: normalizePctToFraction(district.demVotePct ?? district.demPct ?? district.dem),
      rep: normalizePctToFraction(district.repVotePct ?? district.repPct ?? district.rep),
      minorityPct: Number(district.minorityPct ?? district.minorityPercent ?? 0),
      precinctIds: district.precinctIds || [],
    }));
  }

  if (plan?.districtSummaries && Object.keys(plan.districtSummaries).length > 0) {
    return Object.entries(plan.districtSummaries)
      .map(([districtNumber, district]) => ({
        id: Number(districtNumber),
        dem: normalizePctToFraction(district.demVotePct ?? district.demPct),
        rep: normalizePctToFraction(district.repVotePct ?? district.repPct),
        minorityPct: Number(district.minorityPct ?? district.minorityPercent ?? 0),
      }))
      .sort((left, right) => left.id - right.id);
  }

  return fallbackDistricts;
}

function normalizePctToFraction(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return numeric > 1 ? numeric / 100 : numeric;
}

function leafletCenterFromGuiState(guiState, fallbackCenter) {
  const center = guiState?.center;
  if (!Array.isArray(center) || center.length < 2) return fallbackCenter;

  const first = Number(center[0]);
  const second = Number(center[1]);
  if (!Number.isFinite(first) || !Number.isFinite(second)) return fallbackCenter;

  if (Math.abs(first) > 50 && Math.abs(second) <= 50) {
    return [second, first];
  }
  return [first, second];
}

function heatMapPayloadForGroup(heatMaps, groupValue) {
  const labelByValue = {
    black: 'Black',
    hispanic: 'Hispanic',
    asian: 'Asian',
  };
  return heatMaps?.[labelByValue[groupValue]] || null;
}

function groupLabelFromValue(groupValue) {
  return ANALYSIS_GROUP_OPTIONS.find((option) => option.value === groupValue)?.label || 'Black';
}

function groupValueFromLabel(groupLabel) {
  const normalized = String(groupLabel || '').trim().toLowerCase();
  return ANALYSIS_GROUP_OPTIONS.find((option) => option.label.toLowerCase() === normalized)?.value;
}

function interestingPlanOptions(planComparisonPayload) {
  const plans = planComparisonPayload?.plans || {};
  const metadata = planComparisonPayload?.planMetadata || {};
  return Object.keys(plans)
    .filter((key) => key !== 'enacted')
    .map((key) => {
      const plan = plans[key] || {};
      const planMetadata = metadata[key] || {};
      const metrics = plan.interestingMetrics || plan.metrics || planMetadata.interestingMetrics || planMetadata.metrics || {};
      const description = plan.interestingReason
        || plan.reason
        || planMetadata.interestingReason
        || planMetadata.characteristics
        || planMetadata.description;
      return {
        value: key,
        label: planMetadata.label || plan.label || titleCasePlanKey(key),
        description,
        metrics,
      };
    });
}

function planComparisonSummary(planComparisonPayload, selectedPlanKey, selectedOption) {
  const plans = planComparisonPayload?.plans || {};
  const enactedAssignments = plans.enacted?.precinctToDistrict || {};
  const selectedAssignments = plans[selectedPlanKey]?.precinctToDistrict || {};
  const sharedPrecinctIds = Object.keys(enactedAssignments).filter((precinctId) => selectedAssignments[precinctId] != null);
  const changedCount = sharedPrecinctIds.filter((precinctId) => (
    Number(enactedAssignments[precinctId]) !== Number(selectedAssignments[precinctId])
  )).length;
  const totalCompared = sharedPrecinctIds.length || Object.keys(selectedAssignments).length;
  const changedLabel = totalCompared > 0 ? `${changedCount} of ${totalCompared}` : 'N/A';
  const metricRows = Object.entries(selectedOption?.metrics || {})
    .slice(0, 3)
    .map(([key, value]) => [formatPlanMetricLabel(key), formatPlanMetricValue(value)]);

  return {
    changedLabel,
    reason: selectedOption?.description,
    metricRows,
  };
}

function formatPlanMetricLabel(key) {
  return titleCasePlanKey(key)
    .replace(/\bRep Dem\b/i, 'Rep/Dem')
    .replace(/\bCvap\b/g, 'CVAP');
}

function formatPlanMetricValue(value) {
  if (value == null || value === '') return 'N/A';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  return String(value);
}

function titleCasePlanKey(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
