function buildAlternativePlan(districts, shift = 3) {
  return districts.map((district, i) => {
    const nextShift = ((i % 3) - 1) * shift;
    const minorityPct = Math.max(8, Math.min(88, district.minorityPct + nextShift));
    const dem = Math.max(0.2, Math.min(0.8, district.dem + nextShift / 120));
    const rep = Math.max(0, 1 - dem);
    return {
      id: district.id,
      dem: Number(dem.toFixed(2)),
      rep: Number(rep.toFixed(2)),
      minorityPct: Number(minorityPct.toFixed(1)),
    };
  });
}

function buildRepresentationRows(stateAbbr, districts) {
  return districts.map((district) => {
    const party = district.dem >= district.rep ? 'Dem' : 'Rep';
    const incumbency = district.dem >= district.rep ? 'Incumbent (D)' : 'Incumbent (R)';
    return {
      district: `${stateAbbr}-${district.id}`,
      party,
      incumbent: incumbency,
      demVotePct: Number((district.dem * 100).toFixed(1)),
      repVotePct: Number((district.rep * 100).toFixed(1)),
    };
  });
}

function buildGinglesSummary(districts) {
  const viableDistricts = districts.filter((d) => d.minorityPct >= 37).length;
  const totalDistricts = districts.length;
  const compactnessScore = Number((0.52 + viableDistricts / (totalDistricts * 10)).toFixed(2));
  return {
    precondition1MajorityMinorityDistricts: viableDistricts,
    precondition2PoliticalCohesion: Number((0.66 + viableDistricts / (totalDistricts * 20)).toFixed(2)),
    precondition3BlocVoting: Number((0.61 + (totalDistricts - viableDistricts) / (totalDistricts * 25)).toFixed(2)),
    compactnessScore,
    likelyVraViolation: viableDistricts < Math.max(1, Math.round(totalDistricts / 4)),
  };
}

function buildGinglesRows(districts, ensembleType) {
  return districts.map((district) => {
    const cohesion = Number((0.58 + district.dem * 0.25).toFixed(2));
    const bloc = Number((0.56 + district.rep * 0.28).toFixed(2));
    const crossover = Number((0.09 + (district.minorityPct / 100) * 0.1).toFixed(2));
    return {
      district: `D${district.id}`,
      minorityPct: Number(district.minorityPct.toFixed(1)),
      cohesion,
      blocVoting: bloc,
      crossoverSupport: crossover,
      thresholdMet: district.minorityPct >= 37 && cohesion >= 0.62 && bloc >= 0.62,
      ensembleType,
    };
  });
}

function buildEiResults(districts) {
  const candidates = ['Candidate A (Dem)', 'Candidate B (Rep)', 'Candidate C (Ind)'];
  return districts.map((district) => {
    const baseA = 0.3 + district.dem * 0.55;
    const baseB = 0.3 + district.rep * 0.55;
    const baseC = Math.max(0.05, 1 - baseA - baseB);
    const total = baseA + baseB + baseC;
    return {
      district: `D${district.id}`,
      values: candidates.map((candidate, i) => {
        const raw = i === 0 ? baseA : i === 1 ? baseB : baseC;
        return { candidate, supportPct: Number(((raw / total) * 100).toFixed(1)) };
      }),
    };
  });
}

function generateBoxWhiskerData(numDistricts, ensembleType) {
  const points = [];
  for (let district = 1; district <= numDistricts; district++) {
    const seed = ensembleType === 'vra' ? district * 1.35 : district * 1.1;
    const min = 8 + seed * 1.7;
    const q1 = min + 6 + (district % 2) * 1.8;
    const median = q1 + 6 + (seed % 3);
    const q3 = median + 6 + ((district + 1) % 2) * 2.2;
    const max = q3 + 7 + (seed % 2);
    points.push({
      district: `D${district}`,
      min: Number(min.toFixed(1)),
      q1: Number(q1.toFixed(1)),
      median: Number(median.toFixed(1)),
      q3: Number(q3.toFixed(1)),
      max: Number(Math.min(95, max).toFixed(1)),
    });
  }
  return points;
}

function generateSeatShareData(numDistricts) {
  const labels = [];
  for (let seats = 0; seats <= numDistricts; seats++) {
    labels.push(`${seats}R-${numDistricts - seats}D`);
  }
  return labels.map((split, i) => {
    const center = Math.floor(labels.length / 2);
    const dist = Math.abs(i - center);
    const frequency = Math.max(2, Math.round(48 * Math.exp(-0.55 * dist * dist) + Math.random() * 10));
    return { split, frequency };
  });
}

function generateOpportunityData(numDistricts, ensembleType) {
  const data = [];
  const maxOpp = ensembleType === 'vra' ? Math.min(numDistricts, 4) : Math.min(numDistricts, 3);
  for (let i = 0; i <= maxOpp; i++) {
    let frequency;
    if (ensembleType === 'vra') {
      frequency = i === 2 ? 3200 : i === 1 ? 1200 : i === 3 ? 500 : 100;
    } else {
      frequency = i === 1 ? 3500 : i === 0 ? 800 : i === 2 ? 600 : 100;
    }
    frequency += Math.round(Math.random() * 200 - 100);
    data.push({ opportunityDistricts: i, plans: Math.max(0, frequency) });
  }
  return data;
}

function generateEnsembleSplits(numDistricts, ensembleType) {
  const max = Math.min(numDistricts, 8);
  return Array.from({ length: max + 1 }, (_, seats) => {
    const center = ensembleType === 'vra' ? Math.max(1, Math.floor(numDistricts * 0.45)) : Math.floor(numDistricts * 0.55);
    const spread = Math.max(1.25, numDistricts / 5);
    const z = Math.abs(seats - center) / spread;
    return {
      seatsWonByRep: seats,
      seatsWonByDem: numDistricts - seats,
      plans: Math.max(4, Math.round(470 * Math.exp(-(z ** 2)) + Math.random() * 30)),
    };
  });
}

function generateVoteSeatCurve(numDistricts, ensembleType) {
  const points = [];
  for (let vote = 35; vote <= 65; vote += 2.5) {
    const voteShare = vote / 100;
    const tilt = ensembleType === 'vra' ? 0.96 : 1.04;
    const centered = (voteShare - 0.5) * tilt * 11;
    const seatShare = 1 / (1 + Math.exp(-centered));
    points.push({
      voteShare: Number((voteShare * 100).toFixed(1)),
      seatShare: Number((seatShare * 100).toFixed(1)),
      proportional: Number((voteShare * 100).toFixed(1)),
      seatsExpected: Number((seatShare * numDistricts).toFixed(2)),
    });
  }
  return points;
}

function flattenCandidateSupport(rows) {
  return rows.map((entry) => {
    const values = entry.values.reduce((acc, item) => {
      const key = item.candidate.replace(/[^A-Za-z]/g, '').toLowerCase();
      acc[key] = item.supportPct;
      return acc;
    }, {});
    return {
      district: entry.district,
      ...values,
    };
  });
}

function buildAnalysisData(numDistricts, ensembleType, districtRows) {
  const boxWhisker = generateBoxWhiskerData(numDistricts, ensembleType);
  const candidateEi = buildEiResults(districtRows);
  const opportunityDistricts = generateOpportunityData(numDistricts, ensembleType);
  const weightedOpportunity = opportunityDistricts.reduce(
    (acc, row) => acc + row.opportunityDistricts * row.plans,
    0,
  );
  const totalOpportunityPlans = opportunityDistricts.reduce((acc, row) => acc + row.plans, 0);
  return {
    boxWhisker,
    seatShare: generateSeatShareData(numDistricts),
    voteSeatCurve: generateVoteSeatCurve(numDistricts, ensembleType),
    opportunityDistricts,
    ensembleSplits: generateEnsembleSplits(numDistricts, ensembleType),
    gingles: {
      summary: buildGinglesSummary(districtRows),
      rows: buildGinglesRows(districtRows, ensembleType),
    },
    ei: {
      candidateSupport: candidateEi,
      candidateSupportChart: flattenCandidateSupport(candidateEi),
      precinctBar: districtRows.map((district) => ({
        precinct: `P-${district.id.toString().padStart(2, '0')}`,
        minorityTurnoutPct: Number((31 + district.minorityPct * 0.45).toFixed(1)),
        whiteTurnoutPct: Number((42 + (100 - district.minorityPct) * 0.28).toFixed(1)),
      })),
      kde: districtRows.map((district) => ({
        district: `D${district.id}`,
        score: Number((0.42 + district.dem * 0.34).toFixed(2)),
      })),
    },
    totalPlans: 5000,
    avgOpportunityDistricts: Number((weightedOpportunity / Math.max(1, totalOpportunityPlans)).toFixed(2)),
  };
}

const mississippiDistricts = [
  { id: 1, dem: 0.37, rep: 0.63, minorityPct: 28 },
  { id: 2, dem: 0.72, rep: 0.28, minorityPct: 64 },
  { id: 3, dem: 0.34, rep: 0.66, minorityPct: 30 },
  { id: 4, dem: 0.36, rep: 0.64, minorityPct: 26 },
];

const marylandDistricts = [
  { id: 1, dem: 0.6, rep: 0.4, minorityPct: 34 },
  { id: 2, dem: 0.72, rep: 0.28, minorityPct: 55 },
  { id: 3, dem: 0.63, rep: 0.37, minorityPct: 40 },
  { id: 4, dem: 0.68, rep: 0.32, minorityPct: 58 },
  { id: 5, dem: 0.58, rep: 0.42, minorityPct: 32 },
  { id: 6, dem: 0.4, rep: 0.6, minorityPct: 18 },
  { id: 7, dem: 0.7, rep: 0.3, minorityPct: 62 },
  { id: 8, dem: 0.55, rep: 0.45, minorityPct: 28 },
];

export const states = {
  MS: {
    name: 'Mississippi',
    abbr: 'MS',
    center: [32.7, -89.7],
    zoom: 7,
    numDistricts: 4,
    population: 2961279,
    whitePercent: 56.4,
    blackPercent: 37.8,
    hispanicPercent: 3.6,
    asianPercent: 1.1,
    preclearance: true,
    currentPlanDistricts: mississippiDistricts,
    comparisonPlanDistricts: buildAlternativePlan(mississippiDistricts),
    interestingPlanDistricts: buildAlternativePlan(mississippiDistricts, 8),
    congressionalRepresentation: buildRepresentationRows('MS', mississippiDistricts),
  },
  MD: {
    name: 'Maryland',
    abbr: 'MD',
    center: [39.0, -76.8],
    zoom: 8,
    numDistricts: 8,
    population: 6177224,
    whitePercent: 50.3,
    blackPercent: 31.1,
    hispanicPercent: 11.8,
    asianPercent: 6.7,
    preclearance: false,
    currentPlanDistricts: marylandDistricts,
    comparisonPlanDistricts: buildAlternativePlan(marylandDistricts),
    interestingPlanDistricts: buildAlternativePlan(marylandDistricts, 8),
    congressionalRepresentation: buildRepresentationRows('MD', marylandDistricts),
  },
};

export const ensembleData = {
  MS: {
    raceBlind: buildAnalysisData(4, 'raceBlind', mississippiDistricts),
    vra: buildAnalysisData(4, 'vra', mississippiDistricts),
  },
  MD: {
    raceBlind: buildAnalysisData(8, 'raceBlind', marylandDistricts),
    vra: buildAnalysisData(8, 'vra', marylandDistricts),
  },
};

export const stateMarkers = [
  { abbr: 'MS', name: 'Mississippi', position: [32.7, -89.7] },
  { abbr: 'MD', name: 'Maryland', position: [39.0, -76.8] },
];
