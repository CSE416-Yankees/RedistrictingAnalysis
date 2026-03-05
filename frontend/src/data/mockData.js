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

function buildRepresentationRows(stateAbbr, districts, profiles = []) {
  return districts.map((district) => {
    const profile = profiles[district.id - 1] || {};
    const party = district.dem >= district.rep ? 'Dem' : 'Rep';
    const voteMarginPct = Number((Math.abs(district.dem - district.rep) * 100).toFixed(1));
    return {
      district: `${stateAbbr}-${district.id}`,
      districtNumber: district.id,
      representative: profile.name || `Representative ${stateAbbr}-${district.id}`,
      party,
      representativeRaceEthnicity: profile.raceEthnicity || 'Data pending',
      voteMarginPct,
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

function candidateKey(label) {
  return label.replace(/[^A-Za-z]/g, '').toLowerCase();
}

function generateEiCandidateDensityData(districts, ensembleType) {
  const candidates = [
    { key: candidateKey('Candidate A (Dem)'), label: 'Candidate A (Dem)' },
    { key: candidateKey('Candidate B (Rep)'), label: 'Candidate B (Rep)' },
    { key: candidateKey('Candidate C (Ind)'), label: 'Candidate C (Ind)' },
  ];
  const groups = [
    { key: 'black', label: 'Black', color: '#7b1fa2' },
    { key: 'hispanic', label: 'Hispanic', color: '#fb8c00' },
    { key: 'asian', label: 'Asian', color: '#00897b' },
    { key: 'white', label: 'White', color: '#78909c' },
  ];

  const avgDemPct = (districts.reduce((sum, district) => sum + district.dem * 100, 0) / Math.max(1, districts.length));
  const avgRepPct = 100 - avgDemPct;
  const ensembleShift = ensembleType === 'vra' ? 1.5 : -1.5;

  const profileByCandidate = {
    candidateadem: {
      black: { mean: 82, sigma: 11, amp: 4.3 },
      hispanic: { mean: 66, sigma: 10, amp: 3.9 },
      asian: { mean: 61, sigma: 9, amp: 4.2 },
      white: { mean: 38, sigma: 9, amp: 4.7 },
    },
    candidatebrep: {
      black: { mean: 20, sigma: 7, amp: 5.7 },
      hispanic: { mean: 30, sigma: 8, amp: 5.3 },
      asian: { mean: 38, sigma: 9, amp: 4.5 },
      white: { mean: 69, sigma: 11, amp: 4.2 },
    },
    candidatecind: {
      black: { mean: 26, sigma: 5, amp: 3.8 },
      hispanic: { mean: 24, sigma: 5, amp: 4.0 },
      asian: { mean: 27, sigma: 5.5, amp: 3.7 },
      white: { mean: 22, sigma: 4.6, amp: 5.4 },
    },
  };

  const series = {};
  candidates.forEach((candidate) => {
    const profile = profileByCandidate[candidate.key];
    const rows = [];
    for (let supportPct = 0; supportPct <= 100; supportPct += 1) {
      const row = { supportPct };
      groups.forEach((group) => {
        const base = profile[group.key];
        let mean = base.mean;
        if (candidate.key === 'candidateadem') {
          mean += group.key === 'white' ? (avgDemPct - 50) * 0.08 : (avgDemPct - 50) * 0.18 + ensembleShift;
        } else if (candidate.key === 'candidatebrep') {
          mean += group.key === 'white' ? (avgRepPct - 50) * 0.2 + ensembleShift : (avgRepPct - 50) * 0.07;
        } else {
          mean += (avgDemPct - 50) * 0.03;
        }
        mean = clamp(mean, 2, 98);
        const exponent = -((supportPct - mean) ** 2) / (2 * (base.sigma ** 2));
        const probability = base.amp * Math.exp(exponent);
        row[group.key] = Number(probability.toFixed(4));
      });
      rows.push(row);
    }
    series[candidate.key] = rows;
  });

  return {
    candidates,
    groups,
    series,
  };
}

function deriveDistrictDemographicShares(district) {
  const minority = clamp(Number(district.minorityPct), 1, 97);
  const blackShare = clamp(0.5 + ((district.id % 3) - 1) * 0.08, 0.24, 0.72);
  const hispanicShare = clamp(0.28 + ((district.id % 4) - 1.5) * 0.05, 0.1, 0.44);
  const asianShare = clamp(0.18 + ((district.id % 5) - 2) * 0.025, 0.06, 0.32);
  const shareTotal = blackShare + hispanicShare + asianShare;
  const black = minority * (blackShare / shareTotal);
  const hispanic = minority * (hispanicShare / shareTotal);
  const asian = minority * (asianShare / shareTotal);
  return {
    minorityPct: Number(minority.toFixed(1)),
    blackPct: Number(black.toFixed(1)),
    hispanicPct: Number(hispanic.toFixed(1)),
    asianPct: Number(asian.toFixed(1)),
  };
}

function generateBoxWhiskerData(districtRows, proposedDistrictRows, ensembleType) {
  const proposedById = Object.fromEntries((proposedDistrictRows || []).map((district) => [district.id, district]));
  const groupDefs = [
    { key: 'minorityPct', label: 'Minority %', color: '#4f7f9a', spread: 12, vraShift: 2.8, raceBlindShift: -1.4 },
    { key: 'blackPct', label: 'Black %', color: '#6f2da8', spread: 10, vraShift: 2.2, raceBlindShift: -1.1 },
    { key: 'hispanicPct', label: 'Hispanic %', color: '#ef8c1a', spread: 8.5, vraShift: 1.4, raceBlindShift: -0.7 },
    { key: 'asianPct', label: 'Asian %', color: '#0f8c75', spread: 7, vraShift: 0.9, raceBlindShift: -0.35 },
  ];

  const byGroup = {};
  groupDefs.forEach((group) => {
    const rows = districtRows.map((district) => {
      const currentShares = deriveDistrictDemographicShares(district);
      const proposedShares = proposedById[district.id]
        ? deriveDistrictDemographicShares(proposedById[district.id])
        : null;
      const enacted = currentShares[group.key];
      const proposed = proposedShares ? proposedShares[group.key] : null;

      const spread = group.spread + (district.id % 3) * 1.25;
      const ensembleShift = ensembleType === 'vra' ? group.vraShift : group.raceBlindShift;
      const jitter = ((district.id % 2 === 0 ? 1 : -1) * (1.05 + (district.id % 5) * 0.18));
      const median = clamp(enacted + ensembleShift + jitter, 0.8, 99.2);
      const q1 = clamp(median - spread * 0.5, 0.5, 98);
      const q3 = clamp(median + spread * 0.5, q1 + 0.8, 99.5);
      const min = clamp(q1 - spread * 0.62 - (district.id % 2) * 0.7, 0, q1);
      const max = clamp(q3 + spread * 0.62 + ((district.id + 1) % 2) * 0.7, q3, 100);
      const lowWhisker = median - min;
      const highWhisker = max - median;

      return {
        districtId: district.id,
        district: `D${district.id}`,
        min: Number(min.toFixed(1)),
        q1: Number(q1.toFixed(1)),
        median: Number(median.toFixed(1)),
        q3: Number(q3.toFixed(1)),
        max: Number(max.toFixed(1)),
        enacted: Number(enacted.toFixed(1)),
        proposed: proposed != null ? Number(proposed.toFixed(1)) : null,
        iqrBase: Number(q1.toFixed(1)),
        iqrHeight: Number((q3 - q1).toFixed(1)),
        whisker: [Number(lowWhisker.toFixed(1)), Number(highWhisker.toFixed(1))],
      };
    });

    rows.sort((a, b) => a.enacted - b.enacted);
    byGroup[group.key] = rows;
  });

  return {
    groups: groupDefs.map(({ key, label, color }) => ({ key, label, color })),
    byGroup,
  };
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function generateGinglesScatterData(districtRows, ensembleType) {
  const points = [];
  const precinctsPerDistrict = 34;
  districtRows.forEach((district) => {
    for (let i = 0; i < precinctsPerDistrict; i++) {
      const minorityBase = clamp(district.minorityPct + (Math.random() * 24 - 12), 2, 95);
      const wBlackRaw = 0.55 + Math.random() * 0.35;
      const wHispanicRaw = 0.22 + Math.random() * 0.36;
      const wAsianRaw = 0.14 + Math.random() * 0.26;
      const weightTotal = wBlackRaw + wHispanicRaw + wAsianRaw;
      const blackPct = minorityBase * (wBlackRaw / weightTotal);
      const hispanicPct = minorityBase * (wHispanicRaw / weightTotal);
      const asianPct = minorityBase * (wAsianRaw / weightTotal);

      const ensembleShift = ensembleType === 'vra' ? 2.2 : -1.4;
      const noise = Math.random() * 10 - 5;
      const demVoteShare = clamp(
        34 + blackPct * 0.42 + hispanicPct * 0.26 + asianPct * 0.21 + ensembleShift + noise,
        4,
        96,
      );
      const repVoteShare = clamp(100 - demVoteShare, 4, 96);

      points.push({
        precinctId: `D${district.id}-P${String(i + 1).padStart(2, '0')}`,
        district: `D${district.id}`,
        blackPct: Number(blackPct.toFixed(1)),
        hispanicPct: Number(hispanicPct.toFixed(1)),
        asianPct: Number(asianPct.toFixed(1)),
        demVoteShare: Number(demVoteShare.toFixed(1)),
        repVoteShare: Number(repVoteShare.toFixed(1)),
      });
    }
  });

  return {
    groups: [
      { key: 'blackPct', label: 'Black' },
      { key: 'hispanicPct', label: 'Hispanic' },
      { key: 'asianPct', label: 'Asian' },
    ],
    points,
  };
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

function buildAnalysisData(numDistricts, ensembleType, districtRows, proposedDistrictRows, populationEqualityThresholdPct) {
  const boxWhisker = generateBoxWhiskerData(districtRows, proposedDistrictRows, ensembleType);
  const candidateEi = buildEiResults(districtRows);
  const candidateEiDensity = generateEiCandidateDensityData(districtRows, ensembleType);
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
      scatter: generateGinglesScatterData(districtRows, ensembleType),
    },
    ei: {
      candidateSupport: candidateEi,
      candidateDensity: candidateEiDensity,
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
    populationEqualityThresholdPct,
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

const mississippiComparisonDistricts = buildAlternativePlan(mississippiDistricts);
const marylandComparisonDistricts = buildAlternativePlan(marylandDistricts);
const mississippiInterestingDistricts = buildAlternativePlan(mississippiDistricts, 8);
const marylandInterestingDistricts = buildAlternativePlan(marylandDistricts, 8);

const representativeProfiles = {
  MS: [
    { name: 'Rep. Alex Carter', raceEthnicity: 'White' },
    { name: 'Rep. Morgan Fields', raceEthnicity: 'Black' },
    { name: 'Rep. Jordan Hayes', raceEthnicity: 'White' },
    { name: 'Rep. Taylor Boone', raceEthnicity: 'White' },
  ],
  MD: [
    { name: 'Rep. Riley Brooks', raceEthnicity: 'White' },
    { name: 'Rep. Avery Sutton', raceEthnicity: 'Black' },
    { name: 'Rep. Cameron Ellis', raceEthnicity: 'Black' },
    { name: 'Rep. Skyler Reed', raceEthnicity: 'Black' },
    { name: 'Rep. Quinn Harper', raceEthnicity: 'White' },
    { name: 'Rep. Peyton Moore', raceEthnicity: 'White' },
    { name: 'Rep. Logan Pierce', raceEthnicity: 'Black' },
    { name: 'Rep. Hayden Clark', raceEthnicity: 'White' },
  ],
};

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
    redistrictingControl: 'Republican trifecta (governor + legislature)',
    statewideVoterDistribution: { dem: 42.1, rep: 57.9 },
    currentPlanDistricts: mississippiDistricts,
    comparisonPlanDistricts: mississippiComparisonDistricts,
    interestingPlanDistricts: mississippiInterestingDistricts,
    congressionalRepresentation: buildRepresentationRows('MS', mississippiDistricts, representativeProfiles.MS),
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
    redistrictingControl: 'Democratic trifecta (governor + legislature)',
    statewideVoterDistribution: { dem: 63.4, rep: 36.6 },
    currentPlanDistricts: marylandDistricts,
    comparisonPlanDistricts: marylandComparisonDistricts,
    interestingPlanDistricts: marylandInterestingDistricts,
    congressionalRepresentation: buildRepresentationRows('MD', marylandDistricts, representativeProfiles.MD),
  },
};

export const ensembleData = {
  MS: {
    raceBlind: buildAnalysisData(4, 'raceBlind', mississippiDistricts, mississippiComparisonDistricts, 0.5),
    vra: buildAnalysisData(4, 'vra', mississippiDistricts, mississippiComparisonDistricts, 1.0),
  },
  MD: {
    raceBlind: buildAnalysisData(8, 'raceBlind', marylandDistricts, marylandComparisonDistricts, 0.5),
    vra: buildAnalysisData(8, 'vra', marylandDistricts, marylandComparisonDistricts, 0.75),
  },
};

export const stateMarkers = [
  { abbr: 'MS', name: 'Mississippi', position: [32.7, -89.7] },
  { abbr: 'MD', name: 'Maryland', position: [39.0, -76.8] },
];
