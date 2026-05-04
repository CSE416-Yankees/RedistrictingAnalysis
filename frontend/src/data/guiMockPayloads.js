import { states } from './mockData';

const PLAN_COUNT = 5000;
const ENSEMBLES = ['RB', 'VRA'];
const HEAT_COLORS = [
  '#f7fbff',
  '#deebf7',
  '#c6dbef',
  '#9ecae1',
  '#6baed6',
  '#4292c6',
  '#2171b5',
  '#08519c',
  '#08306b',
  '#041f47',
];

const DEMOGRAPHIC_GROUPS = [
  { key: 'Black', statePercentKey: 'blackPercent', color: '#6f2da8', weight: 0.55 },
  { key: 'Hispanic', statePercentKey: 'hispanicPercent', color: '#ef8c1a', weight: 0.28 },
  { key: 'Asian', statePercentKey: 'asianPercent', color: '#0f8c75', weight: 0.17 },
];

const STATE_FIPS = {
  MD: '24',
  MS: '28',
};

function toSpecCenter(center) {
  return [center[1], center[0]];
}

function pct(value) {
  return Number((Number(value) * 100).toFixed(1));
}

function fractionPct(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return numeric > 1 ? numeric / 100 : numeric;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function precinctId(stateAbbr, districtNumber, index) {
  const fips = STATE_FIPS[stateAbbr] || '00';
  return `${fips}${String(districtNumber).padStart(3, '0')}${String(index).padStart(4, '0')}`;
}

function currentPlanPayload(stateAbbr, state) {
  return {
    state: {
      abbr: state.abbr,
      name: state.name,
      center: toSpecCenter(state.center),
      zoom: Math.max(5, state.zoom - 1),
    },
    currentPlan: {
      districts: state.currentPlanDistricts.map((district) => ({
        districtNumber: district.id,
        precinctIds: Array.from({ length: 8 }, (_, index) => precinctId(stateAbbr, district.id, index + 1)),
        demVotePct: pct(district.dem),
        repVotePct: pct(district.rep),
        minorityPct: Number(district.minorityPct.toFixed(1)),
      })),
    },
  };
}

function buildPrecinctAssignments(stateAbbr, districts, shift = 0) {
  const assignments = {};
  districts.forEach((district) => {
    for (let index = 1; index <= 8; index += 1) {
      const nextDistrict = ((district.id + shift + index - 2) % districts.length) + 1;
      assignments[precinctId(stateAbbr, district.id, index)] = shift ? nextDistrict : district.id;
    }
  });
  return assignments;
}

function planComparisonPayload(stateAbbr, state) {
  return {
    plans: {
      enacted: { precinctToDistrict: buildPrecinctAssignments(stateAbbr, state.currentPlanDistricts) },
      comparison: { precinctToDistrict: buildPrecinctAssignments(stateAbbr, state.currentPlanDistricts, 1) },
      interestingMax: { precinctToDistrict: buildPrecinctAssignments(stateAbbr, state.currentPlanDistricts, 2) },
    },
    planMetadata: {
      comparison: {
        label: 'Comparison Plan',
        characteristics: 'Moderate precinct reassignment against enacted plan',
      },
      interestingMax: {
        label: 'Max Minority Opportunity Plan',
        characteristics: 'Largest simulated increase in minority-effective districts',
      },
    },
  };
}

function heatMapPayload(stateAbbr, state, group) {
  const precinctBins = {};
  state.currentPlanDistricts.forEach((district) => {
    for (let index = 1; index <= 8; index += 1) {
      const pctValue = clamp(groupShare(district, group) + ((index % 5) - 2) * 2.2, 0, 100);
      const bin = Math.min(HEAT_COLORS.length - 1, Math.floor(pctValue / 10));
      precinctBins[precinctId(stateAbbr, district.id, index)] = bin;
    }
  });

  return {
    group: group.key,
    bins: HEAT_COLORS.map((color, index) => ({
      bin: index,
      minPct: index * 10,
      maxPct: index === HEAT_COLORS.length - 1 ? 100 : index * 10 + 9,
      color,
    })),
    precinctBins,
  };
}

function stateSummaryPayload(state) {
  const demSeats = state.congressionalRepresentation.filter((row) => row.party === 'Democrat').length;
  const repSeats = state.congressionalRepresentation.filter((row) => row.party === 'Republican').length;

  return {
    abbr: state.abbr,
    name: state.name,
    population: state.population,
    statewideVote: {
      demPct: fractionPct(state.statewideVoterDistribution.dem),
      repPct: fractionPct(state.statewideVoterDistribution.rep),
    },
    demographicSummaries: DEMOGRAPHIC_GROUPS.map((group) => ({
      group: group.key,
      populationPct: fractionPct(state[group.statePercentKey]),
      cvapPct: fractionPct(state[group.statePercentKey] * 0.92),
    })),
    redistrictingControl: state.redistrictingControl,
    representationSummary: { demSeats, repSeats },
    ensembleSummaries: {
      RB: {
        planCount: PLAN_COUNT,
        populationEqualityThresholdPct: 1.0,
        roughProportionality: {
          Black: Number((state.blackPercent / 42).toFixed(2)),
          Hispanic: Number((state.hispanicPercent / 30).toFixed(2)),
          Asian: Number((state.asianPercent / 24).toFixed(2)),
        },
      },
      VRA: {
        planCount: PLAN_COUNT,
        populationEqualityThresholdPct: 1.0,
        roughProportionality: {
          Black: Number((state.blackPercent / 34).toFixed(2)),
          Hispanic: Number((state.hispanicPercent / 24).toFixed(2)),
          Asian: Number((state.asianPercent / 18).toFixed(2)),
        },
      },
    },
  };
}

function districtRowsPayload(state) {
  return {
    districtRows: state.congressionalRepresentation.map((row) => {
      const district = state.currentPlanDistricts.find((entry) => entry.id === row.districtNumber);
      const effectivenessScore = clamp((district?.minorityPct || 0) / 100 * 0.7 + (district?.dem || 0) * 0.3, 0, 1);
      return {
        districtNumber: row.districtNumber,
        representative: row.representative,
        party: row.party,
        representativeGroup: row.representativeRaceEthnicity,
        voteMarginPct: row.voteMarginPct,
        effectivenessScore: Number(effectivenessScore.toFixed(2)),
        calibratedEffectivenessScore: Number((effectivenessScore * 0.92).toFixed(2)),
      };
    }),
  };
}

function groupShare(district, group) {
  const weightTotal = DEMOGRAPHIC_GROUPS.reduce((sum, entry) => sum + entry.weight, 0);
  const base = district.minorityPct * (group.weight / weightTotal);
  const districtShift = ((district.id % 4) - 1.5) * 1.8;
  return clamp(base + districtShift, 0, 100);
}

function boxWhiskerPayload(state) {
  const ensembles = {};
  ENSEMBLES.forEach((ensemble) => {
    const groups = {};
    DEMOGRAPHIC_GROUPS.forEach((group) => {
      const orderedBins = state.currentPlanDistricts
        .map((district) => {
          const enacted = groupShare(district, group);
          const shift = ensemble === 'VRA' ? 2.4 : -1.2;
          const spread = group.key === 'Black' ? 9 : group.key === 'Hispanic' ? 7 : 5.5;
          const median = clamp(enacted + shift + ((district.id % 3) - 1) * 1.1, 0, 100);
          const q1 = clamp(median - spread * 0.48, 0, 100);
          const q3 = clamp(median + spread * 0.48, 0, 100);
          return {
            order: district.id,
            min: Number(clamp(q1 - spread * 0.62, 0, 100).toFixed(1)),
            q1: Number(q1.toFixed(1)),
            median: Number(median.toFixed(1)),
            q3: Number(q3.toFixed(1)),
            max: Number(clamp(q3 + spread * 0.62, 0, 100).toFixed(1)),
            enactedDot: Number(enacted.toFixed(1)),
            proposedDot: Number(clamp(enacted + 2 + (district.id % 2), 0, 100).toFixed(1)),
          };
        })
        .sort((left, right) => left.enactedDot - right.enactedDot)
        .map((row, index) => ({ ...row, order: index + 1 }));
      groups[group.key] = { orderedBins };
    });
    ensembles[ensemble] = { groups };
  });
  return { ensembles };
}

function ginglesPoints(state) {
  return state.currentPlanDistricts.flatMap((district) => (
    Array.from({ length: 24 }, (_, index) => {
      const variation = ((index % 9) - 4) * 1.7;
      const blackPct = clamp(groupShare(district, DEMOGRAPHIC_GROUPS[0]) + variation, 1, 95);
      const hispanicPct = clamp(groupShare(district, DEMOGRAPHIC_GROUPS[1]) - variation * 0.35, 1, 95);
      const asianPct = clamp(groupShare(district, DEMOGRAPHIC_GROUPS[2]) + variation * 0.2, 1, 95);
      const demVotePct = clamp(34 + blackPct * 0.46 + hispanicPct * 0.24 + asianPct * 0.2 + (district.dem - 0.5) * 25, 3, 97);
      return {
        precinctId: `D${district.id}-P${String(index + 1).padStart(2, '0')}`,
        district: `D${district.id}`,
        Black: Number(blackPct.toFixed(1)),
        Hispanic: Number(hispanicPct.toFixed(1)),
        Asian: Number(asianPct.toFixed(1)),
        demVotePct: Number(demVotePct.toFixed(1)),
        repVotePct: Number((100 - demVotePct).toFixed(1)),
      };
    })
  ));
}

function buildRegression(points, groupKey, voteKey) {
  const sorted = [...points].sort((left, right) => left[groupKey] - right[groupKey]);
  const bucketSize = Math.max(1, Math.floor(sorted.length / 8));
  const regression = [];
  for (let index = 0; index < sorted.length; index += bucketSize) {
    const bucket = sorted.slice(index, index + bucketSize);
    const x = bucket.reduce((sum, point) => sum + point[groupKey], 0) / bucket.length;
    const y = bucket.reduce((sum, point) => sum + point[voteKey], 0) / bucket.length;
    regression.push({ x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) });
  }
  return regression;
}

function ginglesResultsPayload(state) {
  const points = ginglesPoints(state);
  return {
    groups: Object.fromEntries(DEMOGRAPHIC_GROUPS.map((group) => [
      group.key,
      {
        points: points.map((point) => ({
          precinctId: point.precinctId,
          district: point.district,
          x: point[group.key],
          demVotePct: point.demVotePct,
          repVotePct: point.repVotePct,
        })),
        regression: {
          dem: buildRegression(points, group.key, 'demVotePct'),
          rep: buildRegression(points, group.key, 'repVotePct'),
        },
      },
    ])),
  };
}

function ginglesTablePayload(state) {
  return {
    rows: ginglesPoints(state).slice(0, 240).map((point, index) => {
      const totalPopulation = 3200 + ((index * 137) % 2800);
      const minorityPct = Math.min(92, point.Black + point.Hispanic + point.Asian);
      return {
        precinctId: point.precinctId,
        precinctName: `Precinct ${point.precinctId}`,
        totalPopulation,
        minorityPopulation: Math.round(totalPopulation * minorityPct / 100),
        republicanVotes: Math.round(totalPopulation * 0.62 * point.repVotePct / 100),
        democraticVotes: Math.round(totalPopulation * 0.62 * point.demVotePct / 100),
      };
    }),
  };
}

function normalCurve(mean, sigma, amplitude) {
  return Array.from({ length: 51 }, (_, index) => {
    const x = index / 50;
    const exponent = -((x - mean) ** 2) / (2 * (sigma ** 2));
    return { x: Number(x.toFixed(2)), y: Number((amplitude * Math.exp(exponent)).toFixed(3)) };
  });
}

function overlap(curveA, curveB) {
  const numerator = curveA.reduce((sum, point, index) => sum + Math.min(point.y, curveB[index]?.y || 0), 0);
  const denominator = curveA.reduce((sum, point, index) => sum + Math.max(point.y, curveB[index]?.y || 0), 0);
  return denominator > 0 ? Number((numerator / denominator).toFixed(2)) : 0;
}

function eiCandidatePayload(state) {
  const demShare = fractionPct(state.statewideVoterDistribution.dem);
  const candidateProfiles = {
    Candidate1: {
      label: 'Democratic Candidate',
      means: { Black: 0.78 + demShare * 0.08, Hispanic: 0.6 + demShare * 0.06, Asian: 0.56 + demShare * 0.05 },
    },
    Candidate2: {
      label: 'Republican Candidate',
      means: { Black: 0.22, Hispanic: 0.34, Asian: 0.4 },
    },
  };
  const candidateResults = {};
  Object.entries(candidateProfiles).forEach(([candidateKey, profile]) => {
    const curves = Object.fromEntries(DEMOGRAPHIC_GROUPS.map((group) => [
      group.key,
      normalCurve(clamp(profile.means[group.key], 0.05, 0.95), 0.1, 4.2),
    ]));
    candidateResults[candidateKey] = {
      label: profile.label,
      curves,
      overlapPct: {
        Black: {
          Hispanic: overlap(curves.Black, curves.Hispanic),
          Asian: overlap(curves.Black, curves.Asian),
        },
        Hispanic: {
          Black: overlap(curves.Hispanic, curves.Black),
          Asian: overlap(curves.Hispanic, curves.Asian),
        },
        Asian: {
          Black: overlap(curves.Asian, curves.Black),
          Hispanic: overlap(curves.Asian, curves.Hispanic),
        },
      },
    };
  });
  return { candidateResults };
}

function ensembleSplitsPayload(state) {
  const splits = [];
  for (let repWins = 0; repWins <= state.numDistricts; repWins += 1) {
    const demWins = state.numDistricts - repWins;
    const rbCenter = Math.max(0, Math.round(state.numDistricts * 0.35));
    const vraCenter = Math.max(0, Math.round(state.numDistricts * 0.28));
    const rbFrequency = Math.round(900 * Math.exp(-((repWins - rbCenter) ** 2) / 2.8));
    const vraFrequency = Math.round(900 * Math.exp(-((repWins - vraCenter) ** 2) / 2.4));
    if (rbFrequency > 0 || vraFrequency > 0) {
      splits.push({ repWins, demWins, rbFrequency, vraFrequency });
    }
  }
  return { districtCount: state.numDistricts, splits };
}

function vraImpactPayload(state) {
  return {
    rows: DEMOGRAPHIC_GROUPS.map((group, index) => {
      const share = fractionPct(state[group.statePercentKey]);
      const rbBase = clamp(share * (0.55 - index * 0.08), 0, 0.95);
      const vraBase = clamp(share * (1.35 - index * 0.07), 0, 0.98);
      return {
        group: group.key,
        enactedThreshold: { rbPct: Number(rbBase.toFixed(2)), vraPct: Number(vraBase.toFixed(2)) },
        roughProportionality: { rbPct: Number((rbBase * 0.72).toFixed(2)), vraPct: Number((vraBase * 0.84).toFixed(2)) },
        jointThreshold: { rbPct: Number((rbBase * 0.52).toFixed(2)), vraPct: Number((vraBase * 0.76).toFixed(2)) },
      };
    }),
  };
}

function minorityEffectivenessPayload(state) {
  const groups = {};
  const groupHistograms = {};
  DEMOGRAPHIC_GROUPS.forEach((group, index) => {
    const rbMedian = clamp(Math.round(state.numDistricts * fractionPct(state[group.statePercentKey]) * (1.1 - index * 0.08)), 0, state.numDistricts);
    const vraMedian = clamp(rbMedian + 1, 0, state.numDistricts);
    const enacted = clamp(Math.round(state.currentPlanDistricts.filter((district) => groupShare(district, group) >= 22).length), 0, state.numDistricts);
    groups[group.key] = {
      RB: boxStats(rbMedian, enacted, state.numDistricts),
      VRA: boxStats(vraMedian, enacted, state.numDistricts),
    };
    groupHistograms[group.key] = {
      bins: Array.from({ length: state.numDistricts + 1 }, (_, effectiveDistricts) => ({
        effectiveDistricts,
        rbFrequency: Math.round(900 * Math.exp(-((effectiveDistricts - rbMedian) ** 2) / 2.8)),
        vraFrequency: Math.round(900 * Math.exp(-((effectiveDistricts - vraMedian) ** 2) / 2.8)),
      })).filter((row) => row.rbFrequency > 0 || row.vraFrequency > 0),
    };
  });
  return { districtCount: state.numDistricts, groups, groupHistograms };
}

function boxStats(median, enacted, districtCount) {
  return {
    min: clamp(median - 2, 0, districtCount),
    q1: clamp(median - 1, 0, districtCount),
    median,
    q3: clamp(median + 1, 0, districtCount),
    max: clamp(median + 2, 0, districtCount),
    enacted,
  };
}

function buildStateGuiPayloads(stateAbbr, state) {
  const minorityEffectiveness = minorityEffectivenessPayload(state);

  return {
    currentPlan: currentPlanPayload(stateAbbr, state),
    stateSummary: stateSummaryPayload(state),
    heatMaps: Object.fromEntries(DEMOGRAPHIC_GROUPS.map((group) => [group.key, heatMapPayload(stateAbbr, state, group)])),
    districtDetails: districtRowsPayload(state),
    planComparison: planComparisonPayload(stateAbbr, state),
    ginglesResults: ginglesResultsPayload(state),
    ginglesTable: ginglesTablePayload(state),
    eiCandidates: eiCandidatePayload(state),
    ensembleSplits: ensembleSplitsPayload(state),
    boxWhisker: boxWhiskerPayload(state),
    vraImpactThresholds: vraImpactPayload(state),
    minorityEffectivenessBox: {
      districtCount: minorityEffectiveness.districtCount,
      groups: minorityEffectiveness.groups,
    },
    minorityEffectivenessHistogram: {
      districtCount: minorityEffectiveness.districtCount,
      groupHistograms: minorityEffectiveness.groupHistograms,
    },
    minorityEffectiveness,
  };
}

export const guiMockPayloads = Object.fromEntries(
  Object.entries(states).map(([stateAbbr, state]) => [stateAbbr, buildStateGuiPayloads(stateAbbr, state)]),
);

export { DEMOGRAPHIC_GROUPS };
