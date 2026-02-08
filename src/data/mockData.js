// ─── State Metadata ────────────────────────────────────────────
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
    currentPlanDistricts: [
      { id: 1, dem: 0.37, rep: 0.63, minorityPct: 28 },
      { id: 2, dem: 0.72, rep: 0.28, minorityPct: 64 },
      { id: 3, dem: 0.34, rep: 0.66, minorityPct: 30 },
      { id: 4, dem: 0.36, rep: 0.64, minorityPct: 26 },
    ],
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
    currentPlanDistricts: [
      { id: 1, dem: 0.60, rep: 0.40, minorityPct: 34 },
      { id: 2, dem: 0.72, rep: 0.28, minorityPct: 55 },
      { id: 3, dem: 0.63, rep: 0.37, minorityPct: 40 },
      { id: 4, dem: 0.68, rep: 0.32, minorityPct: 58 },
      { id: 5, dem: 0.58, rep: 0.42, minorityPct: 32 },
      { id: 6, dem: 0.40, rep: 0.60, minorityPct: 18 },
      { id: 7, dem: 0.70, rep: 0.30, minorityPct: 62 },
      { id: 8, dem: 0.55, rep: 0.45, minorityPct: 28 },
    ],
  },
};

// ─── District GeoJSON (simplified polygons) ────────────────────
// GeoJSON uses [lng, lat] ordering
export const districtGeoJSON = {
  MS: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { district: 1, name: 'District 1', color: '#4285f4' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-91.6, 32.6], [-89.9, 32.6], [-89.9, 35.0], [-91.6, 35.0], [-91.6, 32.6],
          ]],
        },
      },
      {
        type: 'Feature',
        properties: { district: 2, name: 'District 2', color: '#ea4335' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-91.6, 30.2], [-89.9, 30.2], [-89.9, 32.6], [-91.6, 32.6], [-91.6, 30.2],
          ]],
        },
      },
      {
        type: 'Feature',
        properties: { district: 3, name: 'District 3', color: '#fbbc04' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-89.9, 30.2], [-88.1, 30.2], [-88.1, 32.6], [-89.9, 32.6], [-89.9, 30.2],
          ]],
        },
      },
      {
        type: 'Feature',
        properties: { district: 4, name: 'District 4', color: '#34a853' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-89.9, 32.6], [-88.1, 32.6], [-88.1, 35.0], [-89.9, 35.0], [-89.9, 32.6],
          ]],
        },
      },
    ],
  },
  MD: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { district: 1, name: 'District 1', color: '#4285f4' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-76.15, 37.9], [-75.0, 37.9], [-75.0, 38.8], [-76.15, 38.8], [-76.15, 37.9],
          ]],
        },
      },
      {
        type: 'Feature',
        properties: { district: 2, name: 'District 2', color: '#ea4335' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-77.3, 37.9], [-76.15, 37.9], [-76.15, 38.8], [-77.3, 38.8], [-77.3, 37.9],
          ]],
        },
      },
      {
        type: 'Feature',
        properties: { district: 3, name: 'District 3', color: '#fbbc04' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-78.4, 37.9], [-77.3, 37.9], [-77.3, 38.8], [-78.4, 38.8], [-78.4, 37.9],
          ]],
        },
      },
      {
        type: 'Feature',
        properties: { district: 4, name: 'District 4', color: '#34a853' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-79.5, 37.9], [-78.4, 37.9], [-78.4, 38.8], [-79.5, 38.8], [-79.5, 37.9],
          ]],
        },
      },
      {
        type: 'Feature',
        properties: { district: 5, name: 'District 5', color: '#a142f4' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-76.15, 38.8], [-75.0, 38.8], [-75.0, 39.7], [-76.15, 39.7], [-76.15, 38.8],
          ]],
        },
      },
      {
        type: 'Feature',
        properties: { district: 6, name: 'District 6', color: '#ff6d01' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-77.3, 38.8], [-76.15, 38.8], [-76.15, 39.7], [-77.3, 39.7], [-77.3, 38.8],
          ]],
        },
      },
      {
        type: 'Feature',
        properties: { district: 7, name: 'District 7', color: '#e91e63' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-78.4, 38.8], [-77.3, 38.8], [-77.3, 39.7], [-78.4, 39.7], [-78.4, 38.8],
          ]],
        },
      },
      {
        type: 'Feature',
        properties: { district: 8, name: 'District 8', color: '#00bcd4' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-79.5, 38.8], [-78.4, 38.8], [-78.4, 39.7], [-79.5, 39.7], [-79.5, 38.8],
          ]],
        },
      },
    ],
  },
};

// ─── Ensemble Analysis Data ────────────────────────────────────
// Simulates results from 5,000 ReCom runs
function generateBoxPlotData(numDistricts, ensembleType) {
  const data = [];
  for (let d = 1; d <= numDistricts; d++) {
    // VRA ensemble tends to have higher minority % in some districts
    const baseMin = ensembleType === 'vra' ? 12 + d * 3 : 8 + d * 2;
    const range = 20 + Math.random() * 15;
    data.push({
      district: `D${d}`,
      min: Math.round(baseMin),
      q1: Math.round(baseMin + range * 0.2),
      median: Math.round(baseMin + range * 0.45),
      q3: Math.round(baseMin + range * 0.7),
      max: Math.round(baseMin + range * 0.95),
    });
  }
  // Sort by median for cleaner display
  return data.sort((a, b) => a.median - b.median);
}

function generateSeatShareData(numDistricts) {
  const labels = [];
  for (let i = 0; i <= numDistricts; i++) {
    if (i === 0) labels.push('All D');
    else if (i === numDistricts) labels.push('All R');
    else labels.push(`${i}R`);
  }
  return labels.map((label, i) => {
    const center = Math.floor(labels.length / 2);
    const dist = Math.abs(i - center);
    const freq = Math.max(2, Math.round(40 * Math.exp(-0.5 * dist * dist) + Math.random() * 10));
    return { split: label, frequency: freq };
  });
}

function generateOpportunityData(numDistricts, ensembleType) {
  const data = [];
  const maxOpp = ensembleType === 'vra' ? Math.min(numDistricts, 4) : Math.min(numDistricts, 3);
  for (let i = 0; i <= maxOpp; i++) {
    let freq;
    if (ensembleType === 'vra') {
      freq = i === 2 ? 3200 : i === 1 ? 1200 : i === 3 ? 500 : 100;
    } else {
      freq = i === 1 ? 3500 : i === 0 ? 800 : i === 2 ? 600 : 100;
    }
    freq += Math.round(Math.random() * 200 - 100);
    data.push({ opportunityDistricts: i, plans: Math.max(0, freq) });
  }
  return data;
}

export const ensembleData = {
  MS: {
    raceBlind: {
      boxPlot: generateBoxPlotData(4, 'raceBlind'),
      seatShare: generateSeatShareData(4),
      opportunityDistricts: generateOpportunityData(4, 'raceBlind'),
      totalPlans: 5000,
      avgOpportunityDistricts: 1.1,
    },
    vra: {
      boxPlot: generateBoxPlotData(4, 'vra'),
      seatShare: generateSeatShareData(4),
      opportunityDistricts: generateOpportunityData(4, 'vra'),
      totalPlans: 5000,
      avgOpportunityDistricts: 1.9,
    },
  },
  MD: {
    raceBlind: {
      boxPlot: generateBoxPlotData(8, 'raceBlind'),
      seatShare: generateSeatShareData(8),
      opportunityDistricts: generateOpportunityData(8, 'raceBlind'),
      totalPlans: 5000,
      avgOpportunityDistricts: 1.4,
    },
    vra: {
      boxPlot: generateBoxPlotData(8, 'vra'),
      seatShare: generateSeatShareData(8),
      opportunityDistricts: generateOpportunityData(8, 'vra'),
      totalPlans: 5000,
      avgOpportunityDistricts: 2.5,
    },
  },
};

// ─── Available states on the US map ────────────────────────────
export const stateMarkers = [
  { abbr: 'MS', name: 'Mississippi', position: [32.7, -89.7] },
  { abbr: 'MD', name: 'Maryland', position: [39.0, -76.8] },
];
