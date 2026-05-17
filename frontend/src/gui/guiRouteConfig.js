/**
 * Deep-link routes for each GUI screen. HashRouter paths look like:
 *   #/state/MD/gui/gui-9
 * Overview (map + summary concurrent): #/state/MD
 */

export const OVERVIEW_CONFIG = {
  routeSlug: null,
  title: 'Overview',
  payloadKeys: ['currentPlan', 'stateSummary'],
  analysisView: 'stateSummary',
  isAnalysisOpen: true,
  mapPlanMode: 'current',
  mapMetric: 'demographic',
  mapDemographicGroup: 'overall',
};

export const GUI_SLUG_TO_CONFIG = {
  'gui-1': {
    routeSlug: 'gui-1',
    title: 'State selection',
    payloadKeys: ['currentPlan', 'stateSummary'],
    analysisView: 'stateSummary',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-2': {
    routeSlug: 'gui-2',
    title: 'Current district plan',
    payloadKeys: ['currentPlan'],
    analysisView: 'currentPlanMap',
    isAnalysisOpen: false,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-3': {
    routeSlug: 'gui-3',
    title: 'State data summary',
    payloadKeys: ['stateSummary'],
    analysisView: 'stateSummary',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-4': {
    routeSlug: 'gui-4',
    title: 'Demographic heat map',
    payloadKeys: ['heatMaps'],
    analysisView: 'demographicHeatMap',
    isAnalysisOpen: false,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'black',
  },
  'gui-6': {
    routeSlug: 'gui-6',
    title: 'Congressional representation',
    payloadKeys: ['districtDetails'],
    analysisView: 'districtDetails',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-7': {
    routeSlug: 'gui-7',
    title: 'District highlight',
    payloadKeys: ['districtDetails', 'currentPlan'],
    analysisView: 'districtDetails',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-8': {
    routeSlug: 'gui-8',
    title: 'Compare district plans',
    payloadKeys: ['planComparison'],
    analysisView: 'planComparisonMap',
    isAnalysisOpen: false,
    mapPlanMode: 'comparison',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-9': {
    routeSlug: 'gui-9',
    title: 'Gingles analysis',
    payloadKeys: ['ginglesResults'],
    analysisView: 'gingles',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-10': {
    routeSlug: 'gui-10',
    title: 'Gingles precinct table',
    payloadKeys: ['ginglesTable'],
    analysisView: 'ginglesTable',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-11': {
    routeSlug: 'gui-11',
    title: 'Gingles precinct highlight',
    payloadKeys: ['ginglesResults', 'ginglesTable'],
    analysisView: 'gingles',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-12': {
    routeSlug: 'gui-12',
    title: 'Ecological inference results',
    payloadKeys: ['eiCandidates'],
    analysisView: 'eiCandidates',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-16': {
    routeSlug: 'gui-16',
    title: 'Ensemble vote splits',
    payloadKeys: ['ensembleSplits'],
    analysisView: 'ensembleSplits',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-17': {
    routeSlug: 'gui-17',
    title: 'District distribution',
    payloadKeys: ['boxWhisker'],
    analysisView: 'boxWhisker',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-19': {
    routeSlug: 'gui-19',
    title: 'Interesting district plan',
    payloadKeys: ['planComparison'],
    analysisView: 'interestingPlanMap',
    isAnalysisOpen: false,
    mapPlanMode: 'interesting',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-20': {
    routeSlug: 'gui-20',
    title: 'VRA impact thresholds',
    payloadKeys: ['vraImpactThresholds'],
    analysisView: 'vraImpact',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-21': {
    routeSlug: 'gui-21',
    title: 'Minority effectiveness range',
    payloadKeys: ['minorityEffectivenessBox'],
    analysisView: 'minorityEffectivenessBox',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-22': {
    routeSlug: 'gui-22',
    title: 'Minority effectiveness histogram',
    payloadKeys: ['minorityEffectivenessHistogram'],
    analysisView: 'minorityEffectivenessHistogram',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-24': {
    routeSlug: 'gui-24',
    title: 'Reset page',
    payloadKeys: ['currentPlan', 'stateSummary'],
    analysisView: 'stateSummary',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
};

export const ALL_GUI_SLUGS = Object.keys(GUI_SLUG_TO_CONFIG);
export const ALL_GUI_ROUTE_CONFIGS = ALL_GUI_SLUGS.map((slug) => GUI_SLUG_TO_CONFIG[slug]);
export const REQUIRED_GUI_SLUGS = [
  'gui-1',
  'gui-2',
  'gui-3',
  'gui-4',
  'gui-6',
  'gui-9',
  'gui-12',
  'gui-16',
  'gui-17',
  'gui-20',
  'gui-21',
  'gui-22',
];

export const PREFERRED_GUI_SLUGS = [
  'gui-7',
  'gui-8',
  'gui-10',
  'gui-11',
  'gui-19',
  'gui-24',
];

export function resolveGuiUiConfig(guiSlug) {
  if (!guiSlug) return OVERVIEW_CONFIG;
  return GUI_SLUG_TO_CONFIG[guiSlug] || OVERVIEW_CONFIG;
}

/** Dropdown options: value matches AnalysisPanel routing */
export const ANALYSIS_OPTIONS = [
  { value: 'currentPlanMap', label: 'Current Plan Map', routeSlug: 'gui-2' },
  { value: 'stateSummary', label: 'State Data Summary', routeSlug: 'gui-3' },
  { value: 'demographicHeatMap', label: 'Demographic Heat Map', routeSlug: 'gui-4' },
  { value: 'planComparisonMap', label: 'Compare Plans', routeSlug: 'gui-8' },
  { value: 'districtDetails', label: 'Congressional Representation', routeSlug: 'gui-6' },
  { value: 'boxWhisker', label: 'District Distribution', routeSlug: 'gui-17' },
  { value: 'ensembleSplits', label: 'Ensemble Vote Splits', routeSlug: 'gui-16' },
  { value: 'vraImpact', label: 'VRA Impact Thresholds', routeSlug: 'gui-20' },
  { value: 'minorityEffectivenessBox', label: 'Minority Effectiveness Range', routeSlug: 'gui-21' },
  { value: 'minorityEffectivenessHistogram', label: 'Minority Effectiveness Histogram', routeSlug: 'gui-22' },
  { value: 'gingles', label: 'Gingles Analysis', routeSlug: 'gui-9' },
  { value: 'eiCandidates', label: 'Ecological Inference Results', routeSlug: 'gui-12' },
  { value: 'interestingPlanMap', label: 'Interesting Plan', routeSlug: 'gui-19' },
];

export const MAP_GUI_LINKS = [
  { slug: 'gui-2', label: 'Current plan map' },
  { slug: 'gui-4', label: 'Demographic heat map' },
  { slug: 'gui-8', label: 'Compare plans' },
  { slug: 'gui-19', label: 'Interesting plan' },
];

export function routeSlugForAnalysisView(analysisView) {
  const hit = ANALYSIS_OPTIONS.find((option) => option.value === analysisView);
  return hit?.routeSlug ?? 'gui-3';
}
