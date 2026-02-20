/**
 * Downloads real 2020 Census Voting District (VTD/precinct) boundaries from the
 * U.S. Census Bureau TIGER/Line Shapefiles, joins with demographic and election
 * data from Dave's Redistricting (dra2020), and outputs GeoJSON.
 *
 * Boundaries: Census Bureau (public domain)
 * Demographics: dra2020/vtd_data - Census + ACS (CC BY 4.0)
 * Elections: dra2020/vtd_data - VEST (CC BY 4.0)
 */

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import shp from 'shpjs';
import * as turf from '@turf/turf';
import AdmZip from 'adm-zip';

const CENSUS_BASE = 'https://www2.census.gov/geo/tiger/TIGER2020PL/LAYER/VTD/2020';
const DRA_BASE = 'https://github.com/dra2020/vtd_data/raw/master/2020_VTD';
const STATES = { MS: 28, MD: 24 };
const DATA_DIR = new URL('../public/data/', import.meta.url);

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((h, j) => (row[h] = vals[j]));
    rows.push(row);
  }
  return rows;
}

async function loadDraDemographic(stateAbbr) {
  const url = `${DRA_BASE}/${stateAbbr}/Demographic_Data_${stateAbbr}.v06.zip`;
  const zipBuffer = await fetchBuffer(url);
  const zip = new AdmZip(zipBuffer);
  const entry = zip.getEntries().find((e) => e.entryName.endsWith('.csv'));
  if (!entry) throw new Error(`No CSV in demographic zip for ${stateAbbr}`);
  const text = entry.getData().toString('utf8');
  return parseCSV(text);
}

async function loadDraElection(stateAbbr) {
  const url = `${DRA_BASE}/${stateAbbr}/Election_Data_${stateAbbr}.v07.zip`;
  const zipBuffer = await fetchBuffer(url);
  const zip = new AdmZip(zipBuffer);
  const entry = zip.getEntries().find((e) => e.entryName.endsWith('.csv'));
  if (!entry) throw new Error(`No CSV in election zip for ${stateAbbr}`);
  const text = entry.getData().toString('utf8');
  return parseCSV(text);
}

function buildDataLookup(demRows, elecRows) {
  const lookup = {};
  for (const r of demRows) {
    const geoid = String(r.GEOID20 ?? r.geoid ?? '').trim();
    if (!geoid) continue;
    const total = parseInt(r.T_20_CENS_Total || r.T_20_ACS_Total || 0, 10);
    const white = parseInt(r.T_20_CENS_White || r.T_20_ACS_White || 0, 10);
    lookup[geoid] = lookup[geoid] || {};
    lookup[geoid].minorityPct = total > 0 ? ((total - white) / total) * 100 : 0;
  }
  for (const r of elecRows) {
    const geoid = String(r.GEOID20 ?? r.geoid ?? '').trim();
    if (!geoid) continue;
    const dem = parseInt(r.E_24_CONG_Dem || r.E_20_PRES_Dem || r['E_20-24_COMP_Dem'] || 0, 10);
    const rep = parseInt(r.E_24_CONG_Rep || r.E_20_PRES_Rep || r['E_20-24_COMP_Rep'] || 0, 10);
    const tot = dem + rep;
    lookup[geoid] = lookup[geoid] || {};
    lookup[geoid].demPct = tot > 0 ? (dem / tot) * 100 : null;
  }
  return lookup;
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

    // Join precinct-level demographic and election data from dra2020
    console.log(`  Fetching demographic and election data...`);
    let demRows = [], elecRows = [];
    try {
      [demRows, elecRows] = await Promise.all([
        loadDraDemographic(stateAbbr),
        loadDraElection(stateAbbr),
      ]);
    } catch (e) {
      console.warn(`  Could not load dra2020 data: ${e.message}. Precincts will use district-level stats.`);
    }
    const dataLookup = buildDataLookup(demRows, elecRows);
    let joined = 0;
    for (const f of precincts.features) {
      const geoid = String(f.properties.geoid ?? f.properties.GEOID20 ?? '').trim();
      const data = dataLookup[geoid];
      if (data) {
        f.properties.minorityPct = data.minorityPct;
        f.properties.demPct = data.demPct;
        joined++;
      }
    }
    console.log(`  Joined demographic/election data for ${joined}/${precincts.features.length} precincts`);

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
