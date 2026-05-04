function buildRepresentationRows(stateAbbr, districts, profiles) {
  return districts.map((district) => {
    const profile = profiles[district.id - 1] || {};
    const party = district.dem >= district.rep ? 'Democrat' : 'Republican';
    return {
      district: `${stateAbbr}-${district.id}`,
      districtNumber: district.id,
      representative: profile.name || `Representative ${stateAbbr}-${district.id}`,
      party,
      representativeRaceEthnicity: profile.raceEthnicity || 'Data pending',
      voteMarginPct: Number((Math.abs(district.dem - district.rep) * 100).toFixed(1)),
      demVotePct: Number((district.dem * 100).toFixed(1)),
      repVotePct: Number((district.rep * 100).toFixed(1)),
    };
  });
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
    congressionalRepresentation: buildRepresentationRows('MD', marylandDistricts, representativeProfiles.MD),
  },
};

export const stateMarkers = [
  { abbr: 'MS', name: 'Mississippi', position: [32.7, -89.7] },
  { abbr: 'MD', name: 'Maryland', position: [39.0, -76.8] },
];
