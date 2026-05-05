import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import StateMap from '../components/StateMap';
import AnalysisPanel from '../components/AnalysisPanel';
import PillDropdown from '../components/PillDropdown';
import GuiQuickNav from '../components/GuiQuickNav';
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

const ANALYSIS_TAB_VIEWS = new Set([
  'gingles',
  'ginglesTable',
  'eiCandidates',
  'boxWhisker',
  'ensembleSplits',
  'vraImpact',
  'minorityEffectivenessBox',
  'minorityEffectivenessHistogram',
]);

const ANALYSIS_TAB_OPTIONS = ANALYSIS_OPTIONS.filter((option) => ANALYSIS_TAB_VIEWS.has(option.value));

function matchGuiSlug(slug) {
  if (slug == null || slug === '') return undefined;
  const normalized = String(slug).trim().toLowerCase();
  return ALL_GUI_SLUGS.find((s) => s.toLowerCase() === normalized);
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
    setMapMetric(cfg.mapMetric);
    setMapDemographicGroup((currentGroup) => {
      if (ANALYSIS_TAB_VIEWS.has(cfg.analysisView)) {
        return ANALYSIS_GROUP_OPTIONS.some((option) => option.value === currentGroup)
          ? currentGroup
          : 'black';
      }
      return cfg.mapDemographicGroup;
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

  useEffect(() => {
    setSelectedInterestingPlan('interestingMax');
  }, [stateKey]);

  const handleAnalysisMenuChange = useCallback((nextValue) => {
    if (!stateKey) return;
    const slug = routeSlugForAnalysisView(nextValue);
    setAnalysisView(nextValue);
    navigate(`/state/${stateKey}/gui/${slug}`);
  }, [navigate, stateKey]);

  const handleCompareWithEnacted = useCallback(() => {
    setMapPlanMode((currentMode) => (currentMode === 'comparison' ? 'current' : 'comparison'));
  }, []);

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

  if (guiSlug && guiSlugCanonical !== guiSlug) {
    return <Navigate to={`/state/${stateKey}/gui/${guiSlugCanonical}`} replace />;
  }

  const currentPlanDistricts = districtsFromPlanPayload(guiPayloads?.currentPlan, stateData.currentPlanDistricts);
  const comparisonPlanOptions = interestingPlanOptions(guiPayloads?.planComparison);
  const selectedComparisonPlan = comparisonPlanOptions.find((option) => option.value === selectedInterestingPlan)
    ? selectedInterestingPlan
    : comparisonPlanOptions[0]?.value || 'interestingMax';

  const mapCenter = leafletCenterFromGuiState(guiPayloads?.currentPlan?.state, stateData.center);
  const mapZoom = guiPayloads?.currentPlan?.state?.zoom ?? stateData.zoom;
  const activeHeatMapPayload = heatMapPayloadForGroup(guiPayloads?.heatMaps, mapDemographicGroup);
  const activeWorkbenchTab = ANALYSIS_TAB_VIEWS.has(analysisView) ? 'analysis' : 'plans';
  const planSideAnalysisView = analysisView === 'districtDetails' ? 'districtDetails' : 'stateSummary';
  const shouldUsePrecinctLayer = analysisView === 'demographicHeatMap';
  const showPlanMetricControls = shouldUsePrecinctLayer;
  const analysisGroupLabel = groupLabelFromValue(mapDemographicGroup);

  return (
    <div className="state-analysis">
      <div className="state-analysis__main">
        <div className="state-analysis__map">
          <div className="state-analysis__state-title">
            <h2>{activeWorkbenchTab === 'plans' ? 'Congressional Districts' : 'Analysis'}</h2>
            <span>{stateData.name}</span>
          </div>

          {activeWorkbenchTab === 'plans' ? (
            <div className="state-analysis__plan-shell">
              <section className="state-analysis__map-panel" aria-label={`${stateData.name} district map`}>
                <div className="state-analysis__map-container">
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
                </div>

                <div className="state-analysis__plan-controls">
                  <PillDropdown
                    className="state-analysis__control-field"
                    label="Plan"
                    value={mapPlanMode}
                    options={PLAN_OPTIONS}
                    onChange={setMapPlanMode}
                  />

                  {(mapPlanMode === 'comparison' || mapPlanMode === 'delta' || mapPlanMode === 'interesting')
                    && comparisonPlanOptions.length > 0 && (
                    <PillDropdown
                      className="state-analysis__control-field state-analysis__control-field--wide"
                      label={mapPlanMode === 'interesting' ? 'Interesting' : 'Compare'}
                      value={selectedComparisonPlan}
                      options={comparisonPlanOptions}
                      onChange={setSelectedInterestingPlan}
                    />
                  )}

                  <button
                    type="button"
                    className={`state-analysis__action ${mapPlanMode === 'comparison' ? 'state-analysis__action--active' : ''}`}
                    onClick={handleCompareWithEnacted}
                    title="Show enacted vs selected plan on the map (GUI-8)"
                  >
                    Compare with enacted
                  </button>

                  <button
                    type="button"
                    className={`state-analysis__action ${analysisView === 'districtDetails' ? 'state-analysis__action--active' : ''}`}
                    onClick={handleDistrictDetail}
                  >
                    District Detail
                  </button>

                  {showPlanMetricControls && (
                    <>
                      <PillDropdown
                        className="state-analysis__control-field"
                        label="Color"
                        value={mapMetric}
                        options={MAP_METRIC_OPTIONS}
                        onChange={setMapMetric}
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
                    </>
                  )}

                  <label className="state-analysis__check-pill">
                    <input
                      type="checkbox"
                      checked={showDistrictOutlines}
                      onChange={(event) => setShowDistrictOutlines(event.target.checked)}
                    />
                    <span>Boundaries</span>
                  </label>
                </div>
              </section>

              <aside className="state-analysis__overview-panel" aria-label="State overview">
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
              </aside>
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
                <PillDropdown
                  className="state-analysis__control-field"
                  label="Minority"
                  value={mapDemographicGroup}
                  options={ANALYSIS_GROUP_OPTIONS}
                  onChange={setMapDemographicGroup}
                />
                <PillDropdown
                  className="state-analysis__control-field"
                  label="Ensemble"
                  value={ensembleType}
                  options={ENSEMBLE_OPTIONS}
                  onChange={setEnsembleType}
                />
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

          <GuiQuickNav stateAbbr={stateKey} />
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
    .map((key) => ({
      value: key,
      label: metadata[key]?.label || titleCasePlanKey(key),
      description: metadata[key]?.characteristics,
    }));
}

function titleCasePlanKey(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
