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

const CURRENT_PLAN_KEY = 'current';
const NO_SECOND_PLAN_KEY = '';

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

function coerceDemographicGroup(stateAbbr, group) {
  const allowed = feasibleGroupValues(stateAbbr);
  if (!allowed) return group;
  return allowed.includes(group) ? group : allowed[0];
}

function coerceGroupAllowed(stateAbbr, group) {
  const allowed = feasibleGroupValues(stateAbbr);
  if (!allowed) return true;
  return allowed.includes(group);
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
  'gui-24': 'gui-23',
};

const ANALYSIS_TAB_OPTIONS = ANALYSIS_OPTIONS.filter((option) => ANALYSIS_TAB_VIEWS.has(option.value));

const VIEW_TITLES = {
  currentPlanMap: 'Current District Plan',
  stateSummary: 'State & District Overview',
  demographicHeatMap: 'Demographic Heat Map',
  districtDetails: 'Congressional Representation',
  planComparisonMap: 'Compare District Plans',
  interestingPlanMap: 'Interesting District Plan',
  gingles: 'Gingles Analysis',
  eiCandidates: 'EI Candidate Results',
  ensembleSplits: 'Ensemble Vote Splits',
  boxWhisker: 'District Box & Whisker',
  vraImpact: 'VRA Impact Thresholds',
  minorityEffectivenessBox: 'Minority Effectiveness Box & Whisker',
  minorityEffectivenessHistogram: 'Minority Effectiveness Histogram',
  minorityRangeBars: 'Minority District Range Bars',
};

const VIEW_DESCRIPTIONS = {
  currentPlanMap: 'Current enacted congressional districts centered on the selected state.',
  stateSummary: 'Population, vote share, demographics, congressional representation, and ensemble availability.',
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

function defaultPlanPairForMode(planMode) {
  if (planMode === 'comparison' || planMode === 'delta') {
    return { plan1: CURRENT_PLAN_KEY, plan2: 'comparison' };
  }
  if (planMode === 'interesting') {
    return { plan1: 'interestingMax', plan2: NO_SECOND_PLAN_KEY };
  }
  return { plan1: CURRENT_PLAN_KEY, plan2: NO_SECOND_PLAN_KEY };
}

function mapModeForPlan(planKey) {
  if (planKey === CURRENT_PLAN_KEY) return 'current';
  return String(planKey || '').startsWith('interesting') ? 'interesting' : 'comparison';
}

function pageTitleForView(stateName, analysisView, isComparingPlans) {
  if (isComparingPlans) return 'Compare District Plans';
  if (analysisView === 'stateSummary' || analysisView === 'districtDetails') {
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
  const [selectedPlan1, setSelectedPlan1] = useState(() => (
    defaultPlanPairForMode(resolveGuiUiConfig(matchGuiSlug(guiSlug)).mapPlanMode).plan1
  ));
  const [selectedPlan2, setSelectedPlan2] = useState(() => (
    defaultPlanPairForMode(resolveGuiUiConfig(matchGuiSlug(guiSlug)).mapPlanMode).plan2
  ));

  const [mapMetric, setMapMetric] = useState(() => resolveGuiUiConfig(matchGuiSlug(guiSlug)).mapMetric);
  const [mapDemographicGroup, setMapDemographicGroup] = useState(() => resolveGuiUiConfig(matchGuiSlug(guiSlug)).mapDemographicGroup);
  const [showDistrictOutlines, setShowDistrictOutlines] = useState(true);
  // The overview demographic table exposes one heatmap-toggle button
  // per race; when set, the *left-pane* district map swaps to a precinct-level
  // heatmap for that group. Toggling the same button clears it and reverts
  // to the current-plan district view.
  const [summaryHeatmapGroup, setSummaryHeatmapGroup] = useState(null);

  // Sync page state with the current route.
  useEffect(() => {
    const cfg = resolveGuiUiConfig(guiSlugCanonical);
    const defaultPlans = defaultPlanPairForMode(cfg.mapPlanMode);
    setAnalysisView(cfg.analysisView);
    setSelectedPlan1(defaultPlans.plan1);
    setSelectedPlan2(defaultPlans.plan2);
    setMapMetric(cfg.mapMetric);
    setMapDemographicGroup((currentGroup) => {
      const targetGroup = ANALYSIS_TAB_VIEWS.has(cfg.analysisView)
        ? (ANALYSIS_GROUP_OPTIONS.some((option) => option.value === currentGroup) ? currentGroup : 'black')
        : cfg.mapDemographicGroup;
      return coerceDemographicGroup(stateKey, targetGroup);
    });
    setSelectedDistrictId(null);
    setSummaryHeatmapGroup(null);
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

  const handlePlan1Change = useCallback((nextPlan) => {
    const normalizedPlan = nextPlan || CURRENT_PLAN_KEY;
    setSelectedPlan1(normalizedPlan);
    if (selectedPlan2 === normalizedPlan) {
      setSelectedPlan2(NO_SECOND_PLAN_KEY);
      setAnalysisView('stateSummary');
      navigate(`/state/${stateKey}`);
    }
  }, [navigate, selectedPlan2, stateKey]);

  const handlePlan2Change = useCallback((nextPlan) => {
    const normalizedPlan = nextPlan || NO_SECOND_PLAN_KEY;
    setSelectedPlan2(normalizedPlan);
    if (normalizedPlan) {
      setAnalysisView('planComparisonMap');
      navigate(`/state/${stateKey}/gui/gui-8`);
    } else {
      setAnalysisView('stateSummary');
      navigate(`/state/${stateKey}`);
    }
  }, [navigate, stateKey]);

  const handleToggleSummaryHeatmap = useCallback((groupValue) => {
    if (!groupValue) return;
    if (!coerceGroupAllowed(stateKey, groupValue)) return;
    setSummaryHeatmapGroup((current) => (current === groupValue ? null : groupValue));
  }, [stateKey]);

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
  const allPlanOptions = [
    {
      value: CURRENT_PLAN_KEY,
      label: 'Current Plan',
    },
    ...comparisonPlanOptions,
  ];
  const fallbackComparisonPlan = comparisonPlanOptions.find((option) => option.value === 'comparison')
    || comparisonPlanOptions[0];
  const plan1Options = allPlanOptions;
  const plan2Options = [
    {
      value: NO_SECOND_PLAN_KEY,
      label: 'None',
    },
    ...allPlanOptions.filter((option) => option.value !== selectedPlan1),
  ];
  const selectedPlan1Option = allPlanOptions.find((option) => option.value === selectedPlan1)
    || allPlanOptions[0];
  const selectedPlan2Option = allPlanOptions.find((option) => option.value === selectedPlan2)
    || null;
  const isSplitPlanComparison = !!selectedPlan2 && selectedPlan2 !== selectedPlan1;
  const focusedComparisonPlanKey = selectedPlan2 && selectedPlan2 !== CURRENT_PLAN_KEY
    ? selectedPlan2
    : selectedPlan1 !== CURRENT_PLAN_KEY
      ? selectedPlan1
      : fallbackComparisonPlan?.value;
  const selectedComparisonOption = comparisonPlanOptions.find((option) => option.value === focusedComparisonPlanKey)
    || fallbackComparisonPlan;
  const selectedComparisonPlan = selectedComparisonOption?.value || focusedComparisonPlanKey || 'comparison';
  const comparisonSummary = planComparisonSummary(
    guiPayloads?.planComparison,
    isSplitPlanComparison ? selectedPlan1 : CURRENT_PLAN_KEY,
    isSplitPlanComparison ? selectedPlan2 : selectedComparisonPlan,
    isSplitPlanComparison ? selectedPlan2Option : selectedComparisonOption,
  );

  const mapCenter = leafletCenterFromGuiState(guiPayloads?.currentPlan?.state, stateData.center);
  const mapZoom = guiPayloads?.currentPlan?.state?.zoom ?? stateData.zoom;
  const activeWorkbenchTab = ANALYSIS_TAB_VIEWS.has(analysisView) ? 'analysis' : 'plans';
  const plan1MapMode = mapModeForPlan(selectedPlan1);
  const plan2MapMode = mapModeForPlan(selectedPlan2);
  const singleMapPlanMode = plan1MapMode;
  const plan1MapComparisonPlan = selectedPlan1 === CURRENT_PLAN_KEY ? selectedComparisonPlan : selectedPlan1;
  const plan2MapComparisonPlan = selectedPlan2 === CURRENT_PLAN_KEY ? selectedComparisonPlan : selectedPlan2;
  // When the user toggles a heatmap from inside the overview, swap the
  // left-pane map into precinct-level demographic mode for that race. This
  // overrides the route-derived mapMetric/mapDemographicGroup only for
  // render purposes so the underlying controls aren't disturbed.
  const summaryHeatmapActive = !isSplitPlanComparison && !!summaryHeatmapGroup;
  const effectiveMapMetric = summaryHeatmapActive ? 'demographic' : mapMetric;
  const effectiveMapDemographicGroup = summaryHeatmapActive
    ? summaryHeatmapGroup
    : mapDemographicGroup;
  const shouldUsePrecinctLayer = analysisView === 'demographicHeatMap' || summaryHeatmapActive;
  const activeHeatMapPayload = heatMapPayloadForGroup(guiPayloads?.heatMaps, effectiveMapDemographicGroup);
  const showPlanMetricControls = shouldUsePrecinctLayer && !summaryHeatmapActive;
  const isFullWidthPlanComparison = isSplitPlanComparison;
  const pageTitle = pageTitleForView(stateData.name, analysisView, isSplitPlanComparison);
  const pageDescription = isSplitPlanComparison
    ? VIEW_DESCRIPTIONS.planComparisonMap
    : VIEW_DESCRIPTIONS[analysisView] || VIEW_DESCRIPTIONS.stateSummary;
  const workspaceLabel = activeWorkbenchTab === 'plans' ? 'Plan Explorer' : 'Analysis';
  const demographicGroupOptions = feasibleDemographicGroupOptions(stateKey);
  const feasibleGroups = feasibleGroupValues(stateKey);

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
                          <span>Plan 1</span>
                          <strong>{selectedPlan1Option?.label || titleCasePlanKey(selectedPlan1)}</strong>
                        </div>
                        <div className="state-analysis__compare-map">
                          <StateMap
                            key={`${stateKey}-plan-1-${selectedPlan1}`}
                            stateAbbr={stateKey}
                            center={mapCenter}
                            zoom={mapZoom}
                            districtData={currentPlanDistricts}
                            currentPlanPayload={guiPayloads?.currentPlan}
                            planComparisonPayload={guiPayloads?.planComparison}
                            selectedComparisonPlan={plan1MapComparisonPlan}
                            heatMapPayload={activeHeatMapPayload}
                            stateDemographics={{
                              blackPercent: stateData.blackPercent,
                              hispanicPercent: stateData.hispanicPercent,
                              asianPercent: stateData.asianPercent,
                            }}
                            planMode={plan1MapMode}
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
                          <span>Plan 2</span>
                          <strong>{selectedPlan2Option?.label || titleCasePlanKey(selectedPlan2)}</strong>
                        </div>
                        <div className="state-analysis__compare-map">
                          <StateMap
                            key={`${stateKey}-plan-2-${selectedPlan2}`}
                            stateAbbr={stateKey}
                            center={mapCenter}
                            zoom={mapZoom}
                            districtData={currentPlanDistricts}
                            currentPlanPayload={guiPayloads?.currentPlan}
                            planComparisonPayload={guiPayloads?.planComparison}
                            selectedComparisonPlan={plan2MapComparisonPlan}
                            heatMapPayload={activeHeatMapPayload}
                            stateDemographics={{
                              blackPercent: stateData.blackPercent,
                              hispanicPercent: stateData.hispanicPercent,
                              asianPercent: stateData.asianPercent,
                            }}
                            planMode={plan2MapMode}
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
                      key={`${stateKey}-${selectedPlan1}-${summaryHeatmapActive ? `heat-${summaryHeatmapGroup}` : 'plan'}`}
                      stateAbbr={stateKey}
                      center={mapCenter}
                      zoom={mapZoom}
                      districtData={currentPlanDistricts}
                      currentPlanPayload={guiPayloads?.currentPlan}
                      planComparisonPayload={guiPayloads?.planComparison}
                      selectedComparisonPlan={plan1MapComparisonPlan}
                      heatMapPayload={activeHeatMapPayload}
                      stateDemographics={{
                        blackPercent: stateData.blackPercent,
                        hispanicPercent: stateData.hispanicPercent,
                        asianPercent: stateData.asianPercent,
                      }}
                      planMode={singleMapPlanMode}
                      highlightedDistrict={selectedDistrictId}
                      onDistrictSelect={setSelectedDistrictId}
                      mapMetric={shouldUsePrecinctLayer ? effectiveMapMetric : 'partisan'}
                      onMapMetricChange={setMapMetric}
                      mapDemographicGroup={effectiveMapDemographicGroup}
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
                        <span className="state-analysis__compare-summary-kicker">Comparing Plans</span>
                        <strong>
                          {selectedPlan1Option?.label || titleCasePlanKey(selectedPlan1)}
                          {' vs '}
                          {selectedPlan2Option?.label || titleCasePlanKey(selectedPlan2)}
                        </strong>
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

                  <div className="state-analysis__plan-selectors" aria-label="Plan comparison selectors">
                    <PillDropdown
                      className="state-analysis__control-field state-analysis__control-field--wide"
                      label="Plan 1"
                      value={selectedPlan1}
                      options={plan1Options}
                      onChange={handlePlan1Change}
                    />

                    <PillDropdown
                      className="state-analysis__control-field state-analysis__control-field--wide"
                      label="Plan 2"
                      value={selectedPlan2}
                      options={plan2Options}
                      onChange={handlePlan2Change}
                    />
                  </div>

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
                  <AnalysisPanel
                    ensembleType={ensembleType}
                    analysisView="stateSummary"
                    stateData={stateData}
                    guiPayloads={guiPayloads}
                    isSummaryLoading={isGuiDataLoading}
                    summaryError={guiDataError}
                    highlightedDistrict={selectedDistrictId}
                    onHighlightDistrict={setSelectedDistrictId}
                    feasibleGroups={feasibleGroups}
                    inlineHeatmapGroup={summaryHeatmapGroup}
                    onToggleInlineHeatmap={handleToggleSummaryHeatmap}
                    showDistrictDetailsWithSummary
                  />
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
              </div>

              <div className="state-analysis__analysis-split state-analysis__analysis-split--solo">
                <div className="state-analysis__analysis-board">
                  <AnalysisPanel
                    ensembleType={ensembleType}
                    onEnsembleTypeChange={setEnsembleType}
                    analysisView={analysisView}
                    stateData={stateData}
                    guiPayloads={guiPayloads}
                    isSummaryLoading={isGuiDataLoading}
                    summaryError={guiDataError}
                    highlightedDistrict={selectedDistrictId}
                    onHighlightDistrict={setSelectedDistrictId}
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

function planAssignmentsForKey(plans, planKey) {
  const normalizedKey = planKey === CURRENT_PLAN_KEY ? 'enacted' : planKey;
  return plans[normalizedKey]?.precinctToDistrict || {};
}

function planComparisonSummary(planComparisonPayload, basePlanKey, selectedPlanKey, selectedOption) {
  const plans = planComparisonPayload?.plans || {};
  const baseAssignments = planAssignmentsForKey(plans, basePlanKey);
  const selectedAssignments = planAssignmentsForKey(plans, selectedPlanKey);
  const sharedPrecinctIds = Object.keys(baseAssignments).filter((precinctId) => selectedAssignments[precinctId] != null);
  const changedCount = sharedPrecinctIds.filter((precinctId) => (
    Number(baseAssignments[precinctId]) !== Number(selectedAssignments[precinctId])
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
