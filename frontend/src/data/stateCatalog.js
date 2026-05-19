/** Navigation metadata for states supported by the app (not analysis payloads). */
export const stateMarkers = [
  { abbr: 'MS', name: 'Mississippi', position: [32.7, -89.7] },
  { abbr: 'MD', name: 'Maryland', position: [39.0, -76.8] },
];

export const states = {
  MS: {
    name: 'Mississippi',
    abbr: 'MS',
    center: [32.7, -89.7],
    zoom: 7,
    numDistricts: 4,
    preclearance: true,
  },
  MD: {
    name: 'Maryland',
    abbr: 'MD',
    center: [39.0, -76.8],
    zoom: 8,
    numDistricts: 8,
    preclearance: false,
  },
};
