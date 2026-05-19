import axios from 'axios';
import { GUI_SLUG_TO_CONFIG } from '../gui/guiRouteConfig';

/** Empty string = browser-relative `/api/...` (Vite dev proxy -> backend). Set `VITE_API_BASE_URL` for prod. */
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const GUI_GROUPS = ['Black', 'Hispanic', 'Asian'];
const DEFAULT_ENSEMBLE = 'RB';
const LEGACY_BOX_ENSEMBLES = ['RB', 'VRA'];
const API_TIMEOUT_MS = 30000;

// REST endpoints used by the GUI payload loader.
export const GUI_PAYLOAD_ENDPOINTS = {
  currentPlan: (stateAbbr) => `/api/${stateAbbr}/district-plan`,
  stateSummary: (stateAbbr) => `/api/${stateAbbr}/summary`,
  heatMap: (stateAbbr) => `/api/${stateAbbr}/map/heat-map`,
  districtDetails: (stateAbbr) => `/api/${stateAbbr}/representation`,
  planComparison: (stateAbbr) => `/api/${stateAbbr}/plan-comparison`,
  ginglesResults: (stateAbbr) => `/api/${stateAbbr}/gingles/analysis`,
  ginglesTable: (stateAbbr) => `/api/${stateAbbr}/gingles/precinct-table`,
  eiCandidates: (stateAbbr) => `/api/${stateAbbr}/ei/candidate-results`,
  ensembleSplits: (stateAbbr) => `/api/${stateAbbr}/ensemble/splits`,
  boxWhisker: (stateAbbr) => `/api/${stateAbbr}/box-whisker`,
  vraImpactThresholds: (stateAbbr) => `/api/${stateAbbr}/vra/impact`,
  minorityEffectiveness: (stateAbbr) => `/api/${stateAbbr}/minority-effectiveness`,
  minorityEffectivenessBox: (stateAbbr) => `/api/${stateAbbr}/minority-effectiveness`,
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
  if (payloadKey === 'minorityRangeBars') return ['ensembleSplits', 'minorityEffectivenessBox'];
  return [payloadKey];
}

export async function fetchGuiPayloadBundle(stateAbbr) {
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

  const heatMaps = {};
  await Promise.all(GUI_GROUPS.map(async (group) => {
    const payload = await getJson(GUI_PAYLOAD_ENDPOINTS.heatMap(stateAbbr), { group });
    if (payload) heatMaps[group] = payload;
  }));

  const normalizedStateSummary = normalizeStateSummaryPayload(stateSummary);
  const splitMinorityEffectiveness = splitMinorityEffectivenessPayload(
    normalizeMinorityEffectivenessPayload(minorityEffectiveness),
    minorityEffectivenessBox,
    minorityEffectivenessHistogram,
  );

  const normalizedGinglesTable = normalizeGinglesTablePayload(ginglesTable);
  const normalizedGinglesResults = enrichGinglesResultsWithPrecinctIds(
    normalizeGinglesResultsPayload(ginglesResults),
    normalizedGinglesTable,
  );
  const normalizedEnsembleSplits = normalizeEnsembleSplitsPayload(ensembleSplits);

  return {
    currentPlan,
    stateSummary: normalizedStateSummary,
    heatMaps,
    districtDetails: normalizeDistrictDetailsPayload(districtDetails, normalizedStateSummary),
    planComparison,
    ensembleSplits: normalizedEnsembleSplits,
    ginglesResults: normalizedGinglesResults,
    ginglesTable: normalizedGinglesTable,
    eiCandidates: normalizeEiCandidatePayload(eiCandidates),
    boxWhisker: normalizeBoxWhiskerPayload(boxWhisker),
    vraImpactThresholds,
    minorityEffectivenessBox: splitMinorityEffectiveness.box,
    minorityEffectivenessHistogram: splitMinorityEffectiveness.histogram,
    minorityEffectiveness: splitMinorityEffectiveness.combined,
    minorityRangeBars: buildMinorityRangeBarsPayload(
      normalizedEnsembleSplits,
      splitMinorityEffectiveness.box,
    ),
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
        .then((payload) => ({ payload, ensembleType, group }))
    ))),
  );

  const ensembles = {};
  responses.forEach(({ payload, ensembleType, group }) => {
    const normalized = normalizeLegacyBoxWhiskerResponse(payload, { ensembleType, group });
    if (!normalized) return;
    ensembles[normalized.ensembleType] ||= { groups: {} };
    ensembles[normalized.ensembleType].groups[normalized.group] = { orderedBins: normalized.orderedBins };
  });

  return Object.keys(ensembles).length > 0 ? { ensembles } : null;
}

function normalizeStateSummaryPayload(payload) {
  if (!payload) return null;
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
    || [];
  const ensembleSummaries = payload.ensembleSummaries
    || normalizeEnsembleSummaryMap(payload.ensembles, payload)
    || {};

  return {
    ...payload,
    statewideVote: {
      demPct: normalizeFraction(demPct),
      repPct: normalizeFraction(repPct),
    },
    demographicSummaries,
    representationSummary: {
      demSeats: representativeSummary.demSeats
        ?? representativeSummary.democrats
        ?? payload.demSeats,
      repSeats: representativeSummary.repSeats
        ?? representativeSummary.republicans
        ?? payload.repSeats,
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

function normalizeDistrictDetailsPayload(payload, stateSummary) {
  if (payload?.districtRows) return payload;

  const representatives = payload?.congressionalRepresentation
    || stateSummary?.congressionalRepresentation
    || stateSummary?.representatives
    || [];
  if (!Array.isArray(representatives) || representatives.length === 0) return null;

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

function normalizeEnsembleSplitsPayload(payload) {
  if (!payload) return null;
  if (Array.isArray(payload.splits)) return payload;

  const seatOutcomes = payload.seatOutcomes || payload.seat_outcomes;
  if (!seatOutcomes || typeof seatOutcomes !== 'object') return null;

  const rb = seatOutcomes.RB || seatOutcomes.raceBlind || seatOutcomes.RaceBlind || {};
  const vra = seatOutcomes.VRA || seatOutcomes.vra || {};
  const allRepWins = new Set([...Object.keys(rb), ...Object.keys(vra)].map(Number).filter(Number.isFinite));
  const districtCount = Number(payload.districtCount ?? payload.districts ?? Math.max(...allRepWins));
  if (!allRepWins.size || !Number.isFinite(districtCount)) return null;

  const splits = [...allRepWins]
    .sort((left, right) => left - right)
    .map((repWins) => ({
      repWins,
      demWins: Math.max(0, districtCount - repWins),
      rbFrequency: Number(rb[repWins] ?? rb[String(repWins)] ?? 0),
      vraFrequency: Number(vra[repWins] ?? vra[String(repWins)] ?? 0),
    }))
    .filter((row) => row.rbFrequency > 0 || row.vraFrequency > 0);

  return splits.length > 0 ? { districtCount, splits } : null;
}

function normalizeGinglesResultsPayload(payload) {
  if (!payload) return null;
  if (payload.groups) return normalizeGroupedGinglesPayload(payload);
  if (!Array.isArray(payload.dataPoints)) return null;

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

  return Object.keys(groups).length > 0 ? { groups } : null;
}

function enrichGinglesResultsWithPrecinctIds(ginglesResults, ginglesTable) {
  if (!ginglesResults?.groups || !ginglesTable?.rows?.length) return ginglesResults;
  const matchPrecinct = buildGinglesPrecinctMatcher(ginglesTable.rows);

  const groups = Object.fromEntries(Object.entries(ginglesResults.groups).map(([groupKey, groupData]) => {
    const points = (groupData?.points || []).map((point) => {
      const precinctId = point.precinctId || matchPrecinct(point);
      return precinctId ? { ...point, precinctId: String(precinctId) } : point;
    });
    return [groupKey, { ...groupData, points }];
  }));

  return { ...ginglesResults, groups };
}

function buildGinglesPrecinctMatcher(rows) {
  const metrics = rows.map((row) => {
    const totalVotes = Number(row.democraticVotes) + Number(row.republicanVotes);
    const totalPop = Number(row.totalPopulation);
    return {
      precinctId: String(row.precinctId),
      minorityShare: totalPop > 0 ? Number(row.minorityPopulation) / totalPop : null,
      demShare: totalVotes > 0 ? Number(row.democraticVotes) / totalVotes : null,
    };
  }).filter((row) => row.precinctId);

  return (point) => {
    const x = normalizeFraction(point.x ?? point.minorityPct ?? point.minorityPercentage);
    const demShare = normalizeFraction(point.demVotePct ?? point.y);
    if (!Number.isFinite(x) || !Number.isFinite(demShare)) return null;

    const tolerance = 0.02;
    let bestId = null;
    let bestDistance = Infinity;

    metrics.forEach((row) => {
      if (row.demShare == null) return;
      const minorityDelta = row.minorityShare == null ? 0 : Math.abs(row.minorityShare - x);
      const demDelta = Math.abs(row.demShare - demShare);
      if (minorityDelta <= tolerance && demDelta <= tolerance) {
        const distance = minorityDelta + demDelta;
        if (distance < bestDistance) {
          bestDistance = distance;
          bestId = row.precinctId;
        }
      }
    });

    if (bestId) return bestId;

    metrics.forEach((row) => {
      if (row.demShare == null || row.minorityShare == null) return;
      const distance = Math.hypot(row.minorityShare - x, row.demShare - demShare);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestId = row.precinctId;
      }
    });

    return bestDistance <= 0.05 ? bestId : null;
  };
}

function normalizeGroupedGinglesPayload(payload) {
  const groups = Object.fromEntries(Object.entries(payload.groups || {}).map(([groupKey, groupData]) => {
    const points = (groupData?.points || []).map((point) => {
      const x = normalizePercent(point.x ?? point.minorityPct ?? point.minorityPercentage);
      const demVotePct = normalizePercent(point.demVotePct ?? point.democraticVotePct ?? point.democraticVoteShare ?? point.y);
      const repVotePct = normalizePercent(point.repVotePct ?? point.republicanVotePct ?? point.republicanVoteShare
        ?? (Number.isFinite(demVotePct) ? 100 - demVotePct : null));
      return {
        ...point,
        precinctId: point.precinctId,
        district: point.district,
        x,
        demVotePct,
        repVotePct,
      };
    }).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.demVotePct) && Number.isFinite(point.repVotePct));

    return [
      groupKey,
      {
        ...groupData,
        points,
        regression: {
          dem: groupData?.regression?.dem || [],
          rep: groupData?.regression?.rep || [],
        },
      },
    ];
  }));

  return Object.keys(groups).length > 0 ? { ...payload, groups } : null;
}

function normalizeGinglesTablePayload(payload) {
  if (!payload) return null;
  const rows = payload.rows;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const first = rows[0];
  if ('totalPopulation' in first || 'democraticVotes' in first || 'republicanVotes' in first) return payload;
  return null;
}

function normalizeEiCandidatePayload(payload) {
  if (!payload) return null;
  if (payload.candidateResults) return payload;
  if (!payload.graphPoints || typeof payload.graphPoints !== 'object') return null;

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

  return Object.keys(candidateResults).length > 0 ? { candidateResults } : null;
}

function normalizeBoxWhiskerPayload(payload) {
  if (!payload) return null;
  if (payload.ensembles) {
    const ensembles = Object.fromEntries(Object.entries(payload.ensembles).map(([ensembleType, ensemble]) => {
      const groups = Object.fromEntries(Object.entries(ensemble?.groups || {}).map(([group, groupData]) => {
        const normalized = normalizeLegacyBoxWhiskerResponse(
          { orderedBins: groupData?.orderedBins, ensembleType, group },
          { ensembleType, group },
        );
        return [group, { orderedBins: normalized?.orderedBins || [] }];
      }));

      return [String(ensembleType).toUpperCase(), { groups }];
    }));

    return {
      ...payload,
      ensembles,
    };
  }

  const normalized = normalizeLegacyBoxWhiskerResponse(payload);
  if (!normalized) return null;
  return {
    ensembles: {
      [normalized.ensembleType]: {
        groups: {
          [normalized.group]: { orderedBins: normalized.orderedBins },
        },
      },
    },
  };
}

function normalizeLegacyBoxWhiskerResponse(payload, context = {}) {
  const sourceRows = Array.isArray(payload?.districts)
    ? payload.districts
    : payload?.orderedBins;
  if (!Array.isArray(sourceRows)) return null;
  const ensembleType = String(payload.ensembleType || context.ensembleType || DEFAULT_ENSEMBLE).toUpperCase();
  const group = payload.group || context.group || GUI_GROUPS[0];
  const orderedBins = sourceRows
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

function normalizeMinorityEffectivenessPayload(payload) {
  if (!payload) return null;
  return {
    districtCount: payload.districtCount,
    groups: payload.groups || {},
    groupHistograms: payload.groupHistograms || {},
  };
}

function splitMinorityEffectivenessPayload(combined, box, histogram) {
  const nextBox = box || (
    combined?.groups
      ? { districtCount: combined.districtCount, groups: combined.groups }
      : null
  );

  const nextHistogram = histogram || (
    combined?.groupHistograms
      ? { districtCount: combined.districtCount, groupHistograms: combined.groupHistograms }
      : null
  );

  return {
    box: nextBox,
    histogram: nextHistogram,
    combined: nextBox || nextHistogram
      ? {
        districtCount: nextBox?.districtCount ?? nextHistogram?.districtCount,
        groups: nextBox?.groups || {},
        groupHistograms: nextHistogram?.groupHistograms || {},
      }
      : null,
  };
}

function buildMinorityRangeBarsPayload(ensembleSplits, effectivenessBox) {
  const groupDistributions = ensembleSplits?.groupDistributions;
  if (!groupDistributions || typeof groupDistributions !== 'object') return null;

  const groups = Object.fromEntries(Object.entries(groupDistributions)
    .map(([groupKey, groupDistribution]) => {
      const enacted = enactedDistrictCount(effectivenessBox, groupKey);
      const minorityEffective = rangeStatsForDistribution(
        groupDistribution?.minorityEffectiveDistricts,
        enacted,
      );
      const majorityMinority = rangeStatsForDistribution(
        groupDistribution?.majorityMinorityDistricts,
        enacted,
      );
      if (!minorityEffective && !majorityMinority) return null;
      return [
        groupKey,
        {
          ...(minorityEffective ? { minorityEffective } : {}),
          ...(majorityMinority ? { majorityMinority } : {}),
        },
      ];
    })
    .filter(Boolean));

  const districtCount = Number(ensembleSplits?.districtCount ?? effectivenessBox?.districtCount);
  const inferredDistrictCount = Number.isFinite(districtCount)
    ? districtCount
    : inferDistrictCountFromRangeGroups(groups);

  return Object.keys(groups).length > 0
    ? {
      ...(Number.isFinite(inferredDistrictCount) ? { districtCount: inferredDistrictCount } : {}),
      groups,
    }
    : null;
}

function rangeStatsForDistribution(bins, enacted) {
  if (!Array.isArray(bins) || bins.length === 0) return null;
  const rb = weightedRangeStats(bins, 'rbFrequency');
  const vra = weightedRangeStats(bins, 'vraFrequency');
  if (!rb && !vra) return null;

  const stats = {};
  if (rb) stats.RB = appendEnactedDistrictCount(rb, enacted);
  if (vra) stats.VRA = appendEnactedDistrictCount(vra, enacted);
  return stats;
}

function weightedRangeStats(bins, frequencyKey) {
  const weightedBins = bins
    .map((bin) => ({
      districtCount: Number(bin.districtCount ?? bin.effectiveDistricts),
      frequency: Number(bin[frequencyKey] ?? 0),
    }))
    .filter((bin) => Number.isFinite(bin.districtCount) && bin.frequency > 0)
    .sort((left, right) => left.districtCount - right.districtCount);

  const total = weightedBins.reduce((sum, bin) => sum + bin.frequency, 0);
  if (total <= 0) return null;

  return {
    min: weightedBins[0].districtCount,
    q1: weightedQuantile(weightedBins, total, 0.25),
    median: weightedQuantile(weightedBins, total, 0.5),
    q3: weightedQuantile(weightedBins, total, 0.75),
    max: weightedBins[weightedBins.length - 1].districtCount,
  };
}

function weightedQuantile(weightedBins, total, percentile) {
  const threshold = total * percentile;
  let cumulative = 0;
  for (const bin of weightedBins) {
    cumulative += bin.frequency;
    if (cumulative >= threshold) return bin.districtCount;
  }
  return weightedBins[weightedBins.length - 1]?.districtCount;
}

function enactedDistrictCount(effectivenessBox, groupKey) {
  const group = Object.entries(effectivenessBox?.groups || {})
    .find(([candidate]) => candidate.toLowerCase() === String(groupKey).toLowerCase())?.[1];
  const enacted = Number(group?.RB?.enacted ?? group?.VRA?.enacted);
  return Number.isFinite(enacted) ? enacted : null;
}

function appendEnactedDistrictCount(stats, enacted) {
  return enacted == null ? stats : { ...stats, enacted };
}

function inferDistrictCountFromRangeGroups(groups) {
  const maxes = Object.values(groups).flatMap((group) => [
    group?.minorityEffective?.RB?.max,
    group?.minorityEffective?.VRA?.max,
    group?.majorityMinority?.RB?.max,
    group?.majorityMinority?.VRA?.max,
  ].map(Number).filter(Number.isFinite));

  return maxes.length > 0 ? Math.max(...maxes) : null;
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
    const response = await axios.get(url, { params, timeout: API_TIMEOUT_MS });
    return response.data;
  } catch {
    return null;
  }
}
