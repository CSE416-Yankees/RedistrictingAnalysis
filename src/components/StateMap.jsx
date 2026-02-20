import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import './StateMap.css';
// ─── Choropleth color scales (15 stops each) ────────────────────
// Heat map scale for minority %: yellow (low) → orange → red (high), 10 levels
const HEAT_SCALE = [
  { t: 0 / 9, color: '#ffffcc' },
  { t: 1 / 9, color: '#ffeda0' },
  { t: 2 / 9, color: '#fed976' },
  { t: 3 / 9, color: '#feb24c' },
  { t: 4 / 9, color: '#fd8d3c' },
  { t: 5 / 9, color: '#fc4e2a' },
  { t: 6 / 9, color: '#e31a1c' },
  { t: 7 / 9, color: '#bd0026' },
  { t: 8 / 9, color: '#8c0d11' },
  { t: 9 / 9, color: '#5c0008' },
];

// Partisan scale: dark red (Rep) → light red → light gray (competitive) → light blue → dark blue (Dem)
const DIVERGING_SCALE = [
  { t: 0 / 14, color: '#5c0000' },     // dark red (very Rep)
  { t: 1 / 14, color: '#8b0000' },
  { t: 2 / 14, color: '#a52a2a' },
  { t: 3 / 14, color: '#b22222' },
  { t: 4 / 14, color: '#c0392b' },
  { t: 5 / 14, color: '#e57373' },     // light red (slightly Rep)
  { t: 6 / 14, color: '#ef9a9a' },
  { t: 7 / 14, color: '#eeeeee' },     // light gray (competitive)
  { t: 8 / 14, color: '#90caf9' },     // light blue (slightly Dem)
  { t: 9 / 14, color: '#64b5f6' },
  { t: 10 / 14, color: '#42a5f5' },
  { t: 11 / 14, color: '#1976d2' },
  { t: 12 / 14, color: '#1565c0' },
  { t: 13 / 14, color: '#0d47a1' },
  { t: 14 / 14, color: '#002171' },    // dark blue (very Dem)
];

function getHeatColor(value, min, max) {
  if (min === max) return HEAT_SCALE[4].color;
  const t = (value - min) / (max - min);
  const t2 = Math.max(0, Math.min(1, t));
  return interpolateColor(t2, HEAT_SCALE);
}

function getDivergingColor(demPct) {
  // 0% Dem = red, 50% Dem = white, 100% Dem = blue
  const t = demPct / 100;
  const t2 = Math.max(0, Math.min(1, t));
  return interpolateColor(t2, DIVERGING_SCALE);
}

function interpolateColor(t, scale) {
  for (let i = scale.length - 1; i >= 0; i--) {
    if (t >= scale[i].t) {
      const next = scale[i + 1] || scale[i];
      const curr = scale[i];
      const frac = (t - curr.t) / (next.t - curr.t);
      return frac < 1 ? curr.color : next.color;
    }
  }
  return scale[0].color;
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  return null;
}

export default function StateMap({ stateAbbr, center, zoom, districtData }) {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState('minorityPct');

  const districtDataLookup = useMemo(() => {
    const lookup = {};
    districtData?.forEach((d) => {
      lookup[d.id] = { minorityPct: d.minorityPct, dem: d.dem };
    });
    return lookup;
  }, [districtData]);

  const [precinctData, setPrecinctData] = useState(null);
  const districtOutlines = useMemo(() => {
    if (!geoData?.features?.length) return null;
    return { type: 'FeatureCollection', features: geoData.features.map((f) => ({ type: 'Feature', geometry: f.geometry, properties: { district: f.properties.district, name: `District ${f.properties.district}` } })) };
  }, [geoData]);

  // Min/max: use precinct-level data when available, else district-level
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    if (precinctData?.features?.length && precinctData.features.some((f) => f.properties.minorityPct != null || f.properties.demPct != null)) {
      precinctData.features.forEach((f) => {
        const v = metric === 'minorityPct' ? f.properties.minorityPct : f.properties.demPct;
        if (v != null && !Number.isNaN(v)) {
          min = Math.min(min, v);
          max = Math.max(max, v);
        }
      });
    }
    if (min === Infinity && districtData) {
      districtData.forEach((d) => {
        const v = metric === 'minorityPct' ? d.minorityPct : d.dem * 100;
        min = Math.min(min, v);
        max = Math.max(max, v);
      });
    }
    return { minVal: min === Infinity ? 0 : min, maxVal: max === -Infinity ? 100 : max };
  }, [precinctData, districtData, metric]);

  const isDiverging = metric === 'partisan';

  const createPrecinctStyle = (feature) => {
    const p = feature.properties;
    const distId = p.district;
    const d = districtDataLookup[distId];
    const precinctVal = metric === 'minorityPct' ? p.minorityPct : p.demPct;
    const districtVal = d ? (metric === 'minorityPct' ? d.minorityPct : d.dem * 100) : null;
    const value = precinctVal != null ? precinctVal : districtVal;
    const color = value != null
      ? (isDiverging ? getDivergingColor(value) : getHeatColor(value, minVal, maxVal))
      : '#cccccc';
    return {
      fillColor: color,
      weight: 0,
      opacity: 0.9,
      color: color,
      fillOpacity: 0.7,
    };
  };

  const createPrecinctPopup = (feature) => {
    const p = feature.properties;
    const distId = p.district;
    const d = districtData?.find((x) => x.id === distId);
    const name = p.name || p.geoid || `District ${distId}`;
    const minorityPct = p.minorityPct != null ? p.minorityPct.toFixed(1) : (d?.minorityPct?.toFixed(1) ?? '—');
    const demPctVal = p.demPct != null ? p.demPct : (d ? d.dem * 100 : null);
    const demPct = demPctVal != null ? demPctVal.toFixed(1) : '—';
    const repPct = demPctVal != null ? (100 - demPctVal).toFixed(1) : (d ? (d.rep * 100).toFixed(1) : '—');
    const line2 = metric === 'minorityPct'
      ? `Minority: ${minorityPct}%`
      : `Dem: ${demPct}% · Rep: ${repPct}%`;
    return `<div style="text-align:center;padding:6px;">
      <strong>${name} (District ${distId})</strong><br/>
      <span style="font-size:12px;color:#666;">${line2}</span>
    </div>`;
  };

  const outlineStyle = {
    fillColor: 'none',
    fillOpacity: 0,
    weight: 3,
    color: '#1a1a1a',
    opacity: 1,
  };

  function onEachPrecinct(feature, layer) {
    layer.bindPopup(createPrecinctPopup(feature));
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.9 });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(createPrecinctStyle(feature));
      },
    });
  }

  useEffect(() => {
    setLoading(true);
    setPrecinctData(null);
    const base = import.meta.env.BASE_URL;
    Promise.all([
      fetch(`${base}data/${stateAbbr}.json`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${base}data/${stateAbbr}-precincts.json`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([districts, precincts]) => {
        setGeoData(districts);
        setPrecinctData(precincts);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [stateAbbr]);

  const metricLabel = metric === 'minorityPct' ? 'Minority Population %' : 'Democrat ↔ Republican %';

  return (
    <div className="state-map">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={5}
        maxZoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo center={center} zoom={zoom} />
        {loading && (
          <div className="state-map__loading">
            Loading...
          </div>
        )}
        {precinctData?.features?.length > 0 ? (
          <>
            <GeoJSON
              key={`${stateAbbr}-${metric}-precincts`}
              data={precinctData}
              style={(f) => createPrecinctStyle(f)}
              onEachFeature={onEachPrecinct}
            />
            {districtOutlines && (
          <GeoJSON
            key={`${stateAbbr}-outlines`}
            data={districtOutlines}
            style={() => outlineStyle}
            interactive={false}
          />
            )}
          </>
        ) : geoData && (
          <GeoJSON
            key={`${stateAbbr}-${metric}-districts`}
            data={geoData}
            style={(f) => createPrecinctStyle(f)}
            onEachFeature={onEachPrecinct}
          />
        )}
      </MapContainer>

      {/* Choropleth legend */}
      {(precinctData || geoData) && districtData && (
        <div className="choropleth-legend">
          <div className="choropleth-legend__title">{metricLabel}</div>
          <div className="choropleth-legend__scale">
            {(isDiverging ? DIVERGING_SCALE : HEAT_SCALE).map((s, i) => (
              <div
                key={i}
                className="choropleth-legend__swatch"
                style={{ background: s.color }}
                title={isDiverging ? `${(s.t * 100).toFixed(0)}% Dem` : `${(minVal + (maxVal - minVal) * s.t).toFixed(0)}%`}
              />
            ))}
          </div>
          <div className="choropleth-legend__labels">
            {isDiverging ? (
              <>
                <span>Rep</span>
                <span>Dem</span>
              </>
            ) : (
              <>
                <span>{minVal.toFixed(0)}%</span>
                <span>{maxVal.toFixed(0)}%</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Metric selector */}
      {(precinctData || geoData) && districtData && (
        <div className="choropleth-metric">
          <label>Color by:</label>
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="minorityPct">Minority %</option>
            <option value="partisan">Democrat ↔ Republican</option>
          </select>
        </div>
      )}
    </div>
  );
}
