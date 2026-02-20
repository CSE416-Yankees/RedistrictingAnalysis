/**
 * Downloads real 2020 Census Voting District (VTD/precinct) boundaries from the
 * U.S. Census Bureau TIGER/Line Shapefiles and converts to GeoJSON.
 *
 * Source: https://www2.census.gov/geo/tiger/TIGER2020PL/LAYER/VTD/2020/
 * Data: Public domain (U.S. Census Bureau)
 */

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import shp from 'shpjs';
import * as turf from '@turf/turf';

const CENSUS_BASE = 'https://www2.census.gov/geo/tiger/TIGER2020PL/LAYER/VTD/2020';
const STATES = { MS: 28, MD: 24 };
const DATA_DIR = new URL('../public/data/', import.meta.url);

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function downloadPrecincts(stateAbbr) {
  const stateFips = STATES[stateAbbr];
  if (!stateFips) throw new Error(`Unknown state: ${stateAbbr}`);

  const zipUrl = `${CENSUS_BASE}/tl_2020_${String(stateFips).padStart(2, '0')}_vtd20.zip`;
  console.log(`Downloading ${stateAbbr} VTDs from Census...`);

  const zipBuffer = await fetchBuffer(zipUrl);
  const geojson = await shp(zipBuffer);

  if (Array.isArray(geojson)) {
    throw new Error('Unexpected: multiple shapefiles in zip');
  }

  // Normalize property names (Census uses GEOID20, NAME20, etc.)
  for (const f of geojson.features) {
    const p = f.properties;
    f.properties = {
      geoid: p.GEOID20 ?? p.GEOID ?? p.geoid20,
      name: p.NAME20 ?? p.NAMELSAD20 ?? p.name ?? 'Precinct',
      statefp: p.STATEFP20 ?? p.STATEFP,
      countyfp: p.COUNTYFP20 ?? p.COUNTYFP,
      vtdst: p.VTDST20 ?? p.VTDST,
      ...p,
    };
  }

  console.log(`  ${geojson.features.length} precincts loaded`);
  return geojson;
}

async function main() {
  mkdirSync(new URL('.', DATA_DIR), { recursive: true });

  for (const stateAbbr of Object.keys(STATES)) {
    const precincts = await downloadPrecincts(stateAbbr);

    // Load congressional districts to assign each precinct to a district
    const districtsPath = new URL(`${stateAbbr}.json`, DATA_DIR);
    let districts;
    try {
      districts = JSON.parse(readFileSync(districtsPath, 'utf8'));
    } catch (e) {
      console.warn(`  No ${stateAbbr}.json found - run download-districts.mjs first. Skipping district assignment.`);
    }

    if (districts?.features) {
      precincts.features = precincts.features.filter((f) => {
        const center = turf.centroid(f);
        for (const d of districts.features) {
          if (turf.booleanPointInPolygon(center, d)) {
            f.properties.district = d.properties.district;
            return true;
          }
        }
        return false; // Drop precincts outside any district (e.g. water)
      });
      console.log(`  ${precincts.features.length} precincts fall within congressional districts`);
    }

    const outPath = new URL(`${stateAbbr}-precincts.json`, DATA_DIR);
    writeFileSync(outPath, JSON.stringify(precincts));
    console.log(`  ✓ Saved ${stateAbbr}-precincts.json`);
  }

  console.log('\nDone. Run download-districts.mjs first if district assignment is missing.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
