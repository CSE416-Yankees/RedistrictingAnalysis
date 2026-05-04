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
    title: 'Select state to display',
    payloadKeys: ['currentPlan', 'stateSummary'],
    analysisView: 'stateSummary',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-2': {
    routeSlug: 'gui-2',
    title: 'Display current district plan',
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
    title: 'Demographic heat map by precinct',
    payloadKeys: ['heatMaps'],
    analysisView: 'demographicHeatMap',
    isAnalysisOpen: false,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'black',
  },
  'gui-6': {
    routeSlug: 'gui-6',
    title: 'Congressional representation table',
    payloadKeys: ['districtDetails'],
    analysisView: 'districtDetails',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-7': {
    routeSlug: 'gui-7',
    title: 'Highlight district',
    payloadKeys: ['districtDetails', 'currentPlan'],
    analysisView: 'districtDetails',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-8': {
    routeSlug: 'gui-8',
    title: 'Compare two district plans on the map',
    payloadKeys: ['planComparison'],
    analysisView: 'planComparisonMap',
    isAnalysisOpen: false,
    mapPlanMode: 'comparison',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-9': {
    routeSlug: 'gui-9',
    title: 'Gingles analysis results',
    payloadKeys: ['ginglesResults'],
    analysisView: 'gingles',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-10': {
    routeSlug: 'gui-10',
    title: 'Gingles 2/3 analysis table',
    payloadKeys: ['ginglesTable'],
    analysisView: 'ginglesTable',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-11': {
    routeSlug: 'gui-11',
    title: 'Highlight Gingles table row',
    payloadKeys: ['ginglesResults', 'ginglesTable'],
    analysisView: 'gingles',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-12': {
    routeSlug: 'gui-12',
    title: 'Ecological inference candidate results',
    payloadKeys: ['eiCandidates'],
    analysisView: 'eiCandidates',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-16': {
    routeSlug: 'gui-16',
    title: 'Ensemble splits bar chart',
    payloadKeys: ['ensembleSplits'],
    analysisView: 'ensembleSplits',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-17': {
    routeSlug: 'gui-17',
    title: 'Box and whisker data',
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
    title: 'VRA impact threshold table',
    payloadKeys: ['vraImpactThresholds'],
    analysisView: 'vraImpact',
    isAnalysisOpen: true,
    mapPlanMode: 'current',
    mapMetric: 'demographic',
    mapDemographicGroup: 'overall',
  },
  'gui-21': {
    routeSlug: 'gui-21',
    title: 'Minority effectiveness box and whisker',
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
  { value: 'currentPlanMap', label: 'GUI-2 - Current plan map', routeSlug: 'gui-2' },
  { value: 'stateSummary', label: 'GUI-3 - State data summary', routeSlug: 'gui-3' },
  { value: 'demographicHeatMap', label: 'GUI-4 - Demographic heat map', routeSlug: 'gui-4' },
  { value: 'planComparisonMap', label: 'GUI-8 - Compare plans (map)', routeSlug: 'gui-8' },
  { value: 'districtDetails', label: 'GUI-6 - Congressional representation', routeSlug: 'gui-6' },
  { value: 'boxWhisker', label: 'GUI-17 - Box & whisker', routeSlug: 'gui-17' },
  { value: 'ensembleSplits', label: 'GUI-16 - Ensemble splits', routeSlug: 'gui-16' },
  { value: 'vraImpact', label: 'GUI-20 - VRA impact thresholds', routeSlug: 'gui-20' },
  { value: 'minorityEffectivenessBox', label: 'GUI-21 - Minority effectiveness (box)', routeSlug: 'gui-21' },
  { value: 'minorityEffectivenessHistogram', label: 'GUI-22 - Minority effectiveness (histogram)', routeSlug: 'gui-22' },
  { value: 'gingles', label: 'GUI-9 - Gingles scatter', routeSlug: 'gui-9' },
  { value: 'ginglesTable', label: 'GUI-10 - Gingles 2/3 table', routeSlug: 'gui-10' },
  { value: 'eiCandidates', label: 'GUI-12 - EI candidate results', routeSlug: 'gui-12' },
  { value: 'interestingPlanMap', label: 'GUI-19 - Interesting plan (map)', routeSlug: 'gui-19' },
];

export const MAP_GUI_LINKS = [
  { slug: 'gui-2', label: 'GUI-2 - Current plan map' },
  { slug: 'gui-4', label: 'GUI-4 - Demographic heat map' },
  { slug: 'gui-8', label: 'GUI-8 - Compare plans' },
  { slug: 'gui-19', label: 'GUI-19 - Interesting plan' },
];

export function routeSlugForAnalysisView(analysisView) {
  const hit = ANALYSIS_OPTIONS.find((option) => option.value === analysisView);
  return hit?.routeSlug ?? 'gui-3';
}
