/**
 * Downloads real congressional district GeoJSON boundaries from the
 * unitedstates/districts GitHub repo and combines them into per-state
 * FeatureCollection files saved to public/data/.
 */

const BASE_URL =
  'https://raw.githubusercontent.com/unitedstates/districts/gh-pages/cds/2016';

const STATES = {
  MS: { districts: 4, name: 'Mississippi' },
  MD: { districts: 8, name: 'Maryland' },
};

const COLORS = [
  '#4285f4', '#ea4335', '#fbbc04', '#34a853',
  '#a142f4', '#ff6d01', '#e91e63', '#00bcd4',
];

async function fetchDistrict(state, num) {
  const url = `${BASE_URL}/${state}-${num}/shape.geojson`;
  console.log(`  Fetching ${state}-${num}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const feature = await res.json();

  // Attach our display properties
  feature.properties = {
    ...feature.properties,
    district: num,
    name: `District ${num}`,
    color: COLORS[(num - 1) % COLORS.length],
  };
  return feature;
}

async function main() {
  for (const [abbr, { districts, name }] of Object.entries(STATES)) {
    console.log(`\nDownloading ${name} (${districts} districts)...`);

    const features = [];
    for (let i = 1; i <= districts; i++) {
      features.push(await fetchDistrict(abbr, i));
    }

    const collection = {
      type: 'FeatureCollection',
      features,
    };

    const outPath = new URL(`../public/data/${abbr}.json`, import.meta.url);
    const { writeFileSync } = await import('fs');
    writeFileSync(outPath, JSON.stringify(collection));
    const sizeKB = (JSON.stringify(collection).length / 1024).toFixed(0);
    console.log(`  ✓ Saved ${abbr}.json (${sizeKB} KB)`);
  }
  console.log('\nDone!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
