import axios from 'axios';
import { GUI_SLUG_TO_CONFIG } from '../gui/guiRouteConfig';

/** Toggle remote data via VITE_GUI_DATA_SOURCE=api or VITE_GUI_DATA_SOURCE=old. Default stays on bundled mocks. */
export const GUI_DATA_SOURCE = import.meta.env.VITE_GUI_DATA_SOURCE || 'mock';

export const REMOTE_GUI_DATA_SOURCES = new Set(['api', 'old']);

export const USE_API_GUI_PAYLOADS = REMOTE_GUI_DATA_SOURCES.has(GUI_DATA_SOURCE)
  || import.meta.env.VITE_USE_API_PAYLOADS === 'true';

/** Empty string = browser-relative `/api/...` (Vite dev proxy -> backend). Set `VITE_API_BASE_URL` for prod. */
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const GUI_GROUPS = ['Black', 'Hispanic', 'Asian'];
const DEFAULT_ENSEMBLE = 'RB';
const LEGACY_BOX_ENSEMBLES = ['RB', 'VRA'];

export const GUI_PAYLOAD_ENDPOINTS = {
  currentPlan: (stateAbbr) => `/api/${stateAbbr}/district-plan`,
  stateSummary: (stateAbbr) => `/api/${stateAbbr}/summary`,
  heatMap: (stateAbbr) => `/api/${stateAbbr}/map/heat-map`,
  districtDetails: (stateAbbr) => `/api/${stateAbbr}/district-details`,
  planComparison: (stateAbbr) => `/api/${stateAbbr}/district-plan/compare`,
  ginglesResults: (stateAbbr) => `/api/${stateAbbr}/gingles/summary`,
  ginglesTable: (stateAbbr) => `/api/${stateAbbr}/gingles/table`,
  eiCandidates: (stateAbbr) => `/api/${stateAbbr}/ei/candidate-results`,
  ensembleSplits: (stateAbbr) => `/api/${stateAbbr}/ensemble/splits`,
  boxWhisker: (stateAbbr) => `/api/${stateAbbr}/box-whisker`,
  vraImpactThresholds: (stateAbbr) => `/api/${stateAbbr}/vra-impact-thresholds`,
  minorityEffectiveness: (stateAbbr) => `/api/${stateAbbr}/minority-effectiveness`,
  minorityEffectivenessBox: (stateAbbr) => `/api/${stateAbbr}/minority-effectiveness/box`,
  minorityEffectivenessHistogram: (stateAbbr) => `/api/${stateAbbr}/minority-effectiveness/histogram`,
};

export const GUI_PAYLOAD_ENDPOINT_KEYS_BY_ROUTE = Object.fromEntries(
  Object.entries(GUI_SLUG_TO_CONFIG).map(([slug, config]) => [
    slug,
    [...new Set((config.payloadKeys || []).flatMap(expandPayloadKeyToEndpointKeys))],
  ]),
);

function expandPayloadKeyToEndpointKeys(payloadKey) {
  if (payloadKey === 'heatMaps') return ['heatMap'];
  if (payloadKey === 'minorityEffectivenessBox') return ['minorityEffectivenessBox', 'minorityEffectiveness'];
  if (payloadKey === 'minorityEffectivenessHistogram') return ['minorityEffectivenessHistogram', 'minorityEffectiveness'];
  return [payloadKey];
}

export async function fetchGuiPayloadBundle(stateAbbr, fallback) {
  const [
    currentPlan,
    stateSummary,
    districtDetails,
    planComparison,
    ginglesResults,
    ginglesTable,
    eiCandidates,
    ensembleSplits,
    boxWhisker,
    vraImpactThresholds,
    minorityEffectiveness,
    minorityEffectivenessBox,
    minorityEffectivenessHistogram,
  ] = await Promise.all([
    getJson(GUI_PAYLOAD_ENDPOINTS.currentPlan(stateAbbr)),
    getJson(GUI_PAYLOAD_ENDPOINTS.stateSummary(stateAbbr)),
    getJson(GUI_PAYLOAD_ENDPOINTS.districtDetails(stateAbbr)),
    getJson(GUI_PAYLOAD_ENDPOINTS.planComparison(stateAbbr)),
    fetchGinglesResults(stateAbbr),
    getJson(GUI_PAYLOAD_ENDPOINTS.ginglesTable(stateAbbr)),
    fetchEiCandidateResults(stateAbbr),
    getJson(GUI_PAYLOAD_ENDPOINTS.ensembleSplits(stateAbbr)),
    fetchBoxWhisker(stateAbbr),
    getJson(GUI_PAYLOAD_ENDPOINTS.vraImpactThresholds(stateAbbr)),
    getJson(GUI_PAYLOAD_ENDPOINTS.minorityEffectiveness(stateAbbr)),
    getJson(GUI_PAYLOAD_ENDPOINTS.minorityEffectivenessBox(stateAbbr)),
    getJson(GUI_PAYLOAD_ENDPOINTS.minorityEffectivenessHistogram(stateAbbr)),
  ]);

  const heatMaps = { ...(fallback?.heatMaps || {}) };
  await Promise.all(GUI_GROUPS.map(async (group) => {
    const payload = await getJson(GUI_PAYLOAD_ENDPOINTS.heatMap(stateAbbr), { group });
    if (payload) heatMaps[group] = payload;
  }));

  const normalizedStateSummary = normalizeStateSummaryPayload(stateSummary, fallback?.stateSummary);
  const normalizedDistrictDetails = normalizeDistrictDetailsPayload(
    districtDetails,
    normalizedStateSummary,
    fallback?.districtDetails,
  );
  const normalizedBoxWhisker = normalizeBoxWhiskerPayload(boxWhisker, fallback?.boxWhisker);
  const normalizedMinorityEffectiveness = normalizeMinorityEffectivenessPayload(
    minorityEffectiveness,
    fallback?.minorityEffectiveness,
  );
  const splitMinorityEffectiveness = splitMinorityEffectivenessPayload(
    normalizedMinorityEffectiveness,
    minorityEffectivenessBox,
    minorityEffectivenessHistogram,
    fallback,
  );

  return {
    ...fallback,
    currentPlan: currentPlan || fallback.currentPlan,
    stateSummary: normalizedStateSummary,
    heatMaps,
    districtDetails: normalizedDistrictDetails,
    planComparison: planComparison || fallback.planComparison,
    ensembleSplits: normalizeEnsembleSplitsPayload(ensembleSplits, fallback.ensembleSplits),
    ginglesResults: normalizeGinglesResultsPayload(ginglesResults, fallback.ginglesResults),
    ginglesTable: normalizeGinglesTablePayload(ginglesTable, fallback.ginglesTable),
    eiCandidates: normalizeEiCandidatePayload(eiCandidates, fallback.eiCandidates),
    boxWhisker: normalizedBoxWhisker,
    vraImpactThresholds: vraImpactThresholds || fallback.vraImpactThresholds,
    minorityEffectivenessBox: splitMinorityEffectiveness.box,
    minorityEffectivenessHistogram: splitMinorityEffectiveness.histogram,
    minorityEffectiveness: splitMinorityEffectiveness.combined,
  };
}

async function fetchGinglesResults(stateAbbr) {
  const direct = await getJson(GUI_PAYLOAD_ENDPOINTS.ginglesResults(stateAbbr));
  return direct || getJson(GUI_PAYLOAD_ENDPOINTS.ginglesResults(stateAbbr), { ensembleType: DEFAULT_ENSEMBLE });
}

async function fetchEiCandidateResults(stateAbbr) {
  const direct = await getJson(GUI_PAYLOAD_ENDPOINTS.eiCandidates(stateAbbr));
  return direct || getJson(GUI_PAYLOAD_ENDPOINTS.eiCandidates(stateAbbr), { ensembleType: DEFAULT_ENSEMBLE });
}

async function fetchBoxWhisker(stateAbbr) {
  const direct = await getJson(GUI_PAYLOAD_ENDPOINTS.boxWhisker(stateAbbr));
  if (direct) return direct;
  return fetchLegacyBoxWhiskerBundle(stateAbbr);
}

async function fetchLegacyBoxWhiskerBundle(stateAbbr) {
  const responses = await Promise.all(
    LEGACY_BOX_ENSEMBLES.flatMap((ensembleType) => GUI_GROUPS.map(async (group) => (
      getJson(GUI_PAYLOAD_ENDPOINTS.boxWhisker(stateAbbr), { ensembleType, group })
    ))),
  );

  const ensembles = {};
  responses.forEach((payload) => {
    const normalized = normalizeLegacyBoxWhiskerResponse(payload);
    if (!normalized) return;
    ensembles[normalized.ensembleType] ||= { groups: {} };
    ensembles[normalized.ensembleType].groups[normalized.group] = { orderedBins: normalized.orderedBins };
  });

  return Object.keys(ensembles).length > 0 ? { ensembles } : null;
}

function normalizeStateSummaryPayload(payload, fallback) {
  if (!payload) return fallback;
  if (payload.demographicSummaries && payload.representationSummary && payload.ensembleSummaries) {
    return payload;
  }

  const demPct = payload.statewideVote?.demPct
    ?? payload.statewideVote?.democraticPct
    ?? payload.demPct
    ?? payload.democraticPct;
  const repPct = payload.statewideVote?.repPct
    ?? payload.statewideVote?.republicanPct
    ?? payload.repPct
    ?? payload.republicanPct;
  const representativeSummary = payload.representationSummary || payload.representativeSummary || {};
  const demographicSummaries = payload.demographicSummaries
    || payload.demographics
    || fallback?.demographicSummaries
    || [];
  const ensembleSummaries = payload.ensembleSummaries
    || normalizeEnsembleSummaryMap(payload.ensembles, payload)
    || fallback?.ensembleSummaries
    || {};

  return {
    ...fallback,
    ...payload,
    statewideVote: {
      demPct: normalizeFraction(demPct ?? fallback?.statewideVote?.demPct),
      repPct: normalizeFraction(repPct ?? fallback?.statewideVote?.repPct),
    },
    demographicSummaries,
    representationSummary: {
      demSeats: representativeSummary.demSeats
        ?? representativeSummary.democrats
        ?? payload.demSeats
        ?? fallback?.representationSummary?.demSeats,
      repSeats: representativeSummary.repSeats
        ?? representativeSummary.republicans
        ?? payload.repSeats
        ?? fallback?.representationSummary?.repSeats,
    },
    ensembleSummaries,
  };
}

function normalizeEnsembleSummaryMap(ensembles, payload) {
  if (!ensembles || typeof ensembles !== 'object') return null;
  return Object.fromEntries(Object.entries(ensembles).map(([key, row]) => [
    key,
    {
      planCount: row.planCount ?? row.districtPlans ?? payload?.districtPlans,
      populationEqualityThresholdPct: row.populationEqualityThresholdPct
        ?? row.popEqThresholdPercent
        ?? payload?.popEqThresholdPercent,
      roughProportionality: row.roughProportionality || {},
    },
  ]));
}

function normalizeDistrictDetailsPayload(payload, stateSummary, fallback) {
  if (payload?.districtRows) return payload;

  const representatives = payload?.congressionalRepresentation
    || stateSummary?.congressionalRepresentation
    || stateSummary?.representatives
    || [];
  if (!Array.isArray(representatives) || representatives.length === 0) return fallback;

  return {
    districtRows: representatives.map((row) => {
      const demVotePct = normalizePercent(row.demVotePct ?? row.democraticVotePct);
      const repVotePct = normalizePercent(row.repVotePct ?? row.republicanVotePct);
      const voteMarginPct = row.voteMarginPct
        ?? (Number.isFinite(demVotePct) && Number.isFinite(repVotePct) ? Math.abs(demVotePct - repVotePct) : null);
      const effectivenessScore = row.effectivenessScore
        ?? (Number.isFinite(demVotePct) ? Math.min(1, Math.max(0, demVotePct / 100)) : null);

      return {
        districtNumber: row.districtNumber ?? parseDistrictNumber(row.district),
        representative: row.representative ?? row.name ?? 'N/A',
        party: normalizePartyLabel(row.party),
        representativeGroup: row.representativeGroup ?? row.representativeRaceEthnicity ?? row.group ?? 'N/A',
        voteMarginPct,
        effectivenessScore,
        calibratedEffectivenessScore: row.calibratedEffectivenessScore
          ?? (effectivenessScore != null && Number.isFinite(Number(effectivenessScore))
            ? Number((Number(effectivenessScore) * 0.92).toFixed(2))
            : null),
      };
    }),
  };
}

function normalizeEnsembleSplitsPayload(payload, fallback) {
  if (!payload) return fallback;
  if (Array.isArray(payload.splits)) return payload;

  const seatOutcomes = payload.seatOutcomes || payload.seat_outcomes;
  if (!seatOutcomes || typeof seatOutcomes !== 'object') return fallback;

  const rb = seatOutcomes.RB || seatOutcomes.raceBlind || seatOutcomes.RaceBlind || {};
  const vra = seatOutcomes.VRA || seatOutcomes.vra || {};
  const allRepWins = new Set([...Object.keys(rb), ...Object.keys(vra)].map(Number).filter(Number.isFinite));
  const districtCount = Number(payload.districtCount ?? payload.districts ?? fallback?.districtCount ?? Math.max(...allRepWins));
  if (!allRepWins.size || !Number.isFinite(districtCount)) return fallback;

  const splits = [...allRepWins]
    .sort((left, right) => left - right)
    .map((repWins) => ({
      repWins,
      demWins: Math.max(0, districtCount - repWins),
      rbFrequency: Number(rb[repWins] ?? rb[String(repWins)] ?? 0),
      vraFrequency: Number(vra[repWins] ?? vra[String(repWins)] ?? 0),
    }))
    .filter((row) => row.rbFrequency > 0 || row.vraFrequency > 0);

  return splits.length > 0 ? { districtCount, splits } : fallback;
}

function normalizeGinglesResultsPayload(payload, fallback) {
  if (!payload) return fallback;
  if (payload.groups) return payload;
  if (!Array.isArray(payload.dataPoints)) return fallback;

  const groups = {};
  payload.dataPoints.forEach((point) => {
    const group = point.group || 'Unknown';
    groups[group] ||= { points: [], regression: { dem: [], rep: [] } };
    groups[group].points.push({
      precinctId: String(point.precinctId ?? point.precinct ?? ''),
      district: point.district != null ? `D${point.district}` : undefined,
      x: normalizePercent(point.x ?? point.minorityPercentage),
      demVotePct: normalizePercent(point.demVotePct ?? point.democraticVotePercentage),
      repVotePct: normalizePercent(point.repVotePct ?? point.republicanVotePercentage),
    });
  });

  Object.values(groups).forEach((group) => {
    group.regression = buildRegressionFromPoints(group.points);
  });

  return Object.keys(groups).length > 0 ? { groups } : fallback;
}

function normalizeGinglesTablePayload(payload, fallback) {
  if (!payload) return fallback;
  const rows = payload.rows;
  if (!Array.isArray(rows) || rows.length === 0) return fallback;
  const first = rows[0];
  if ('totalPopulation' in first || 'democraticVotes' in first || 'republicanVotes' in first) return payload;
  return fallback;
}

function normalizeEiCandidatePayload(payload, fallback) {
  if (!payload) return fallback;
  if (payload.candidateResults) return payload;
  if (!payload.graphPoints || typeof payload.graphPoints !== 'object') return fallback;

  const candidateResults = Object.fromEntries(Object.entries(payload.graphPoints).map(([candidateKey, rows]) => {
    const curves = {
      Asian: [],
      Black: [],
      Hispanic: [],
    };

    (Array.isArray(rows) ? rows : []).forEach((point) => {
      const x = normalizeFraction(point.supportPct ?? point.supportPercent ?? point.x);
      if (!Number.isFinite(x)) return;
      curves.Asian.push({ x, y: Number(point.asianDensity ?? point.Asian ?? 0) });
      curves.Black.push({ x, y: Number(point.blackDensity ?? point.Black ?? 0) });
      curves.Hispanic.push({ x, y: Number(point.hispanicDensity ?? point.Hispanic ?? 0) });
    });

    return [
      candidateKey,
      {
        label: candidateLabel(candidateKey),
        curves: Object.fromEntries(Object.entries(curves).filter(([, curve]) => curve.length > 0)),
        overlapPct: estimateCurveOverlaps(curves),
      },
    ];
  }));

  return Object.keys(candidateResults).length > 0 ? { candidateResults } : fallback;
}

function normalizeBoxWhiskerPayload(payload, fallback) {
  if (!payload) return fallback;
  if (payload.ensembles) return payload;

  const normalized = normalizeLegacyBoxWhiskerResponse(payload);
  if (!normalized) return fallback;
  return {
    ...fallback,
    ensembles: {
      ...fallback?.ensembles,
      [normalized.ensembleType]: {
        groups: {
          ...fallback?.ensembles?.[normalized.ensembleType]?.groups,
          [normalized.group]: { orderedBins: normalized.orderedBins },
        },
      },
    },
  };
}

function normalizeLegacyBoxWhiskerResponse(payload) {
  if (!payload?.districts || !Array.isArray(payload.districts)) return null;
  const ensembleType = String(payload.ensembleType || DEFAULT_ENSEMBLE).toUpperCase();
  const group = payload.group || GUI_GROUPS[0];
  const orderedBins = payload.districts
    .map((row, index) => ({
      order: Number(row.order ?? row.districtNumber ?? index + 1),
      min: normalizePercent(row.min ?? row.minPercent),
      q1: normalizePercent(row.q1 ?? row.q1Percent),
      median: normalizePercent(row.median ?? row.medianPercent),
      q3: normalizePercent(row.q3 ?? row.q3Percent),
      max: normalizePercent(row.max ?? row.maxPercent),
      enactedDot: normalizePercent(row.enactedDot ?? row.enactedPercent),
      proposedDot: normalizePercent(row.proposedDot ?? row.proposedPercent),
    }))
    .filter((row) => Number.isFinite(row.min) && Number.isFinite(row.max));

  return orderedBins.length > 0 ? { ensembleType, group, orderedBins } : null;
}

function normalizeMinorityEffectivenessPayload(payload, fallback) {
  if (!payload) return fallback;
  return {
    districtCount: payload.districtCount ?? fallback?.districtCount,
    groups: payload.groups || fallback?.groups || {},
    groupHistograms: payload.groupHistograms || fallback?.groupHistograms || {},
  };
}

function splitMinorityEffectivenessPayload(combined, box, histogram, fallback) {
  const fallbackCombined = fallback?.minorityEffectiveness || {};
  const nextBox = box || (
    combined?.groups
      ? { districtCount: combined.districtCount ?? fallbackCombined.districtCount, groups: combined.groups }
      : null
  ) || fallback?.minorityEffectivenessBox || {
    districtCount: fallbackCombined.districtCount,
    groups: fallbackCombined.groups,
  };

  const nextHistogram = histogram || (
    combined?.groupHistograms
      ? { districtCount: combined.districtCount ?? fallbackCombined.districtCount, groupHistograms: combined.groupHistograms }
      : null
  ) || fallback?.minorityEffectivenessHistogram || {
    districtCount: fallbackCombined.districtCount,
    groupHistograms: fallbackCombined.groupHistograms,
  };

  return {
    box: nextBox,
    histogram: nextHistogram,
    combined: {
      districtCount: nextBox?.districtCount ?? nextHistogram?.districtCount,
      groups: nextBox?.groups || {},
      groupHistograms: nextHistogram?.groupHistograms || {},
    },
  };
}

function buildRegressionFromPoints(points) {
  const sorted = [...points]
    .filter((point) => Number.isFinite(point.x))
    .sort((left, right) => left.x - right.x);
  const bucketSize = Math.max(1, Math.ceil(sorted.length / 8));

  const dem = [];
  const rep = [];
  for (let index = 0; index < sorted.length; index += bucketSize) {
    const bucket = sorted.slice(index, index + bucketSize);
    const x = average(bucket.map((point) => point.x));
    dem.push({ x, y: average(bucket.map((point) => point.demVotePct)) });
    rep.push({ x, y: average(bucket.map((point) => point.repVotePct)) });
  }
  return { dem, rep };
}

function estimateCurveOverlaps(curves) {
  return Object.fromEntries(Object.entries(curves)
    .filter(([, curve]) => curve.length > 0)
    .map(([leftGroup, leftCurve]) => [
      leftGroup,
      Object.fromEntries(Object.entries(curves)
        .filter(([rightGroup, rightCurve]) => rightGroup !== leftGroup && rightCurve.length > 0)
        .map(([rightGroup, rightCurve]) => [rightGroup, overlap(leftCurve, rightCurve)])),
    ]));
}

function overlap(leftCurve, rightCurve) {
  const length = Math.min(leftCurve.length, rightCurve.length);
  if (!length) return 0;
  let numerator = 0;
  let denominator = 0;
  for (let index = 0; index < length; index += 1) {
    const left = Number(leftCurve[index]?.y);
    const right = Number(rightCurve[index]?.y);
    if (!Number.isFinite(left) || !Number.isFinite(right)) continue;
    numerator += Math.min(left, right);
    denominator += Math.max(left, right);
  }
  return denominator > 0 ? Number((numerator / denominator).toFixed(2)) : 0;
}

function average(values) {
  const finite = values
    .filter((value) => value != null && value !== '')
    .map(Number)
    .filter(Number.isFinite);
  if (!finite.length) return 0;
  return Number((finite.reduce((sum, value) => sum + value, 0) / finite.length).toFixed(2));
}

function normalizeFraction(value) {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.abs(numeric) > 1 ? numeric / 100 : numeric;
}

function normalizePercent(value) {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
}

function normalizePartyLabel(party) {
  const raw = String(party || '').trim().toLowerCase();
  if (raw === 'dem' || raw === 'd' || raw.includes('democrat')) return 'Democrat';
  if (raw === 'rep' || raw === 'r' || raw.includes('republican')) return 'Republican';
  return party || 'N/A';
}

function parseDistrictNumber(value) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

function candidateLabel(candidateKey) {
  const upper = String(candidateKey || '').toUpperCase();
  if (upper === 'DEM') return 'Democratic Candidate';
  if (upper === 'REP') return 'Republican Candidate';
  if (upper === 'IND') return 'Independent Candidate';
  return candidateKey;
}

async function getJson(path, params) {
  try {
    const url = `${API_BASE_URL}${path}`;
    const response = await axios.get(url, { params, timeout: 2500 });
    return response.data;
  } catch {
    return null;
  }
}
