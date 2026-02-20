import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './StateMap.css';

// ─── Choropleth color scales (15 stops each) ────────────────────
// Sequential scale: light → dark (for minority %, etc.)
const SEQUENTIAL_SCALE = [
  { t: 0 / 14, color: '#f7fbff' },
  { t: 1 / 14, color: '#ebf4f9' },
  { t: 2 / 14, color: '#deebf7' },
  { t: 3 / 14, color: '#c6dbef' },
  { t: 4 / 14, color: '#9ecae1' },
  { t: 5 / 14, color: '#6baed6' },
  { t: 6 / 14, color: '#4292c6' },
  { t: 7 / 14, color: '#3082be' },
  { t: 8 / 14, color: '#2171b5' },
  { t: 9 / 14, color: '#1361a9' },
  { t: 10 / 14, color: '#08519c' },
  { t: 11 / 14, color: '#0b4084' },
  { t: 12 / 14, color: '#08306b' },
  { t: 13 / 14, color: '#062a5c' },
  { t: 14 / 14, color: '#04234d' },
];

// Diverging scale: dark red → purple (competitive) → dark blue
const DIVERGING_SCALE = [
  { t: 0 / 14, color: '#4a0000' },
  { t: 1 / 14, color: '#5c0000' },
  { t: 2 / 14, color: '#730000' },
  { t: 3 / 14, color: '#8b0000' },
  { t: 4 / 14, color: '#a31515' },
  { t: 5 / 14, color: '#b71c1c' },
  { t: 6 / 14, color: '#c62828' },
  { t: 7 / 14, color: '#7e57c2' },   // purple midpoint (50% Dem)
  { t: 8 / 14, color: '#42a5f5' },
  { t: 9 / 14, color: '#1e88e5' },
  { t: 10 / 14, color: '#1976d2' },
  { t: 11 / 14, color: '#1565c0' },
  { t: 12 / 14, color: '#0d47a1' },
  { t: 13 / 14, color: '#06418a' },
  { t: 14 / 14, color: '#002171' },
];

function getSequentialColor(value, min, max) {
  if (min === max) return SEQUENTIAL_SCALE[2].color;
  const t = (value - min) / (max - min);
  const t2 = Math.max(0, Math.min(1, t));
  return interpolateColor(t2, SEQUENTIAL_SCALE);
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

  // Build lookup: district id → value for the selected metric
  const metricLookup = {};
  let minVal = Infinity, maxVal = -Infinity;
  if (districtData) {
    districtData.forEach((d) => {
      const v = metric === 'minorityPct' ? d.minorityPct : d.dem * 100;
      metricLookup[d.id] = v;
      minVal = Math.min(minVal, v);
      maxVal = Math.max(maxVal, v);
    });
  }

  const isDiverging = metric === 'partisan';

  const createStyle = (feature) => {
    const distId = feature.properties.district;
    const value = metricLookup[distId] ?? null;
    const color = value != null
      ? (isDiverging ? getDivergingColor(value) : getSequentialColor(value, minVal, maxVal))
      : '#cccccc';
    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.65,
    };
  };

  const createPopup = (feature) => {
    const distId = feature.properties.district;
    const d = districtData?.find((x) => x.id === distId);
    if (!d) return `<div style="text-align:center;padding:6px;"><strong>${feature.properties.name}</strong></div>`;
    const demPct = (d.dem * 100).toFixed(1);
    const repPct = (d.rep * 100).toFixed(1);
    const minorityPct = d.minorityPct;
    const line2 = metric === 'minorityPct'
      ? `Minority: ${minorityPct}%`
      : `Dem: ${demPct}% · Rep: ${repPct}%`;
    return `<div style="text-align:center;padding:6px;">
      <strong>${feature.properties.name}</strong><br/>
      <span style="font-size:12px;color:#666;">${line2}</span>
    </div>`;
  };

  function onEachDistrict(feature, layer) {
    layer.bindPopup(createPopup(feature));
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.85, weight: 3 });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(createStyle(feature));
      },
    });
  }

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}data/${stateAbbr}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${stateAbbr} districts`);
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
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
            Loading districts...
          </div>
        )}
        {geoData && (
          <GeoJSON
            key={`${stateAbbr}-${metric}`}
            data={geoData}
            style={(f) => createStyle(f)}
            onEachFeature={onEachDistrict}
          />
        )}
      </MapContainer>

      {/* Choropleth legend */}
      {geoData && districtData && (
        <div className="choropleth-legend">
          <div className="choropleth-legend__title">{metricLabel}</div>
          <div className="choropleth-legend__scale">
            {(isDiverging ? DIVERGING_SCALE : SEQUENTIAL_SCALE).map((s, i) => (
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
      {geoData && districtData && (
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
