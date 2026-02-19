import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './StateMap.css';

// ─── Choropleth color scales ────────────────────────────────────
// Sequential scale: light → dark (for minority %, etc.)
const CHOROPLETH_SCALE = [
  { t: 0, color: '#f7fbff' },
  { t: 0.2, color: '#c6dbef' },
  { t: 0.4, color: '#6baed6' },
  { t: 0.6, color: '#2171b5' },
  { t: 0.8, color: '#08519c' },
  { t: 1, color: '#08306b' },
];

function getChoroplethColor(value, min, max) {
  if (min === max) return CHOROPLETH_SCALE[2].color;
  const t = (value - min) / (max - min);
  const t2 = Math.max(0, Math.min(1, t));
  for (let i = CHOROPLETH_SCALE.length - 1; i >= 0; i--) {
    if (t2 >= CHOROPLETH_SCALE[i].t) {
      const next = CHOROPLETH_SCALE[i + 1] || CHOROPLETH_SCALE[i];
      const curr = CHOROPLETH_SCALE[i];
      const frac = (t2 - curr.t) / (next.t - curr.t);
      return frac < 1 ? curr.color : next.color;
    }
  }
  return CHOROPLETH_SCALE[0].color;
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
      const v = metric === 'minorityPct' ? d.minorityPct : metric === 'dem' ? d.dem * 100 : d.rep * 100;
      metricLookup[d.id] = v;
      minVal = Math.min(minVal, v);
      maxVal = Math.max(maxVal, v);
    });
  }

  const createStyle = (feature) => {
    const distId = feature.properties.district;
    const value = metricLookup[distId] ?? null;
    const color = value != null ? getChoroplethColor(value, minVal, maxVal) : '#cccccc';
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
    const value = d ? (metric === 'minorityPct' ? d.minorityPct : metric === 'dem' ? (d.dem * 100).toFixed(1) : (d.rep * 100).toFixed(1)) : '—';
    const label = metric === 'minorityPct' ? 'Minority %' : metric === 'dem' ? 'Dem %' : 'Rep %';
    return `<div style="text-align:center;padding:6px;">
      <strong>${feature.properties.name}</strong><br/>
      <span style="font-size:12px;color:#666;">${label}: ${value}${metric === 'minorityPct' ? '%' : '%'}</span>
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

  const metricLabel = metric === 'minorityPct' ? 'Minority Population %' : metric === 'dem' ? 'Democrat Vote Share %' : 'Republican Vote Share %';

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
      {geoData && districtData && minVal <= maxVal && (
        <div className="choropleth-legend">
          <div className="choropleth-legend__title">{metricLabel}</div>
          <div className="choropleth-legend__scale">
            {CHOROPLETH_SCALE.map((s, i) => (
              <div
                key={i}
                className="choropleth-legend__swatch"
                style={{ background: s.color }}
                title={`${(minVal + (maxVal - minVal) * s.t).toFixed(0)}%`}
              />
            ))}
          </div>
          <div className="choropleth-legend__labels">
            <span>{minVal.toFixed(0)}%</span>
            <span>{maxVal.toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Metric selector */}
      {geoData && districtData && (
        <div className="choropleth-metric">
          <label>Color by:</label>
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="minorityPct">Minority %</option>
            <option value="dem">Democrat %</option>
            <option value="rep">Republican %</option>
          </select>
        </div>
      )}
    </div>
  );
}
