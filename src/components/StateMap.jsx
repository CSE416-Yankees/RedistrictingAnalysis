import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './StateMap.css';

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

const DIVERGING_SCALE = [
  { t: 0 / 14, color: '#5c0000' },
  { t: 1 / 14, color: '#8b0000' },
  { t: 2 / 14, color: '#a52a2a' },
  { t: 3 / 14, color: '#b22222' },
  { t: 4 / 14, color: '#c0392b' },
  { t: 5 / 14, color: '#e57373' },
  { t: 6 / 14, color: '#ef9a9a' },
  { t: 7 / 14, color: '#eeeeee' },
  { t: 8 / 14, color: '#90caf9' },
  { t: 9 / 14, color: '#64b5f6' },
  { t: 10 / 14, color: '#42a5f5' },
  { t: 11 / 14, color: '#1976d2' },
  { t: 12 / 14, color: '#1565c0' },
  { t: 13 / 14, color: '#0d47a1' },
  { t: 14 / 14, color: '#002171' },
];

const DELTA_SCALE = [
  { t: 0 / 8, color: '#7f0000' },
  { t: 1 / 8, color: '#b22222' },
  { t: 2 / 8, color: '#ef9a9a' },
  { t: 3 / 8, color: '#fbe9e7' },
  { t: 4 / 8, color: '#f5f5f5' },
  { t: 5 / 8, color: '#e3f2fd' },
  { t: 6 / 8, color: '#90caf9' },
  { t: 7 / 8, color: '#1e88e5' },
  { t: 8 / 8, color: '#0d47a1' },
];

function interpolateColor(t, scale) {
  for (let i = scale.length - 1; i >= 0; i--) {
    if (t >= scale[i].t) {
      const next = scale[i + 1] || scale[i];
      const curr = scale[i];
      const span = next.t - curr.t;
      const frac = span > 0 ? (t - curr.t) / span : 1;
      return frac < 1 ? curr.color : next.color;
    }
  }
  return scale[0].color;
}

function normalizeDistrictId(properties) {
  const raw = properties?.district
    ?? properties?.DISTRICT
    ?? properties?.district_id
    ?? properties?.districtId
    ?? properties?.cd116fp
    ?? properties?.CD116FP;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  return null;
}

export default function StateMap({
  stateAbbr,
  center,
  zoom,
  districtData,
  comparisonDistrictData,
  planMode,
  highlightedDistrict,
  onDistrictSelect,
  analysisView,
}) {
  const [geoData, setGeoData] = useState(null);
  const [precinctData, setPrecinctData] = useState(null);
  const [blockData, setBlockData] = useState(null);
  const [metric, setMetric] = useState('minorityPct');
  const [geographyLevel, setGeographyLevel] = useState('precinct');
  const isDeltaMode = planMode === 'delta';
  const isEiChoroplethView = analysisView === 'eiChoropleth';
  const activeMetric = analysisView === 'eiChoropleth'
    && !isDeltaMode
    && metric !== 'eiCandidateA'
    && metric !== 'eiTurnoutGap'
    ? 'eiCandidateA'
    : metric;

  const districtDataLookup = useMemo(() => {
    const lookup = {};
    districtData?.forEach((district) => {
      lookup[district.id] = district;
    });
    return lookup;
  }, [districtData]);

  const currentPlanLookup = useMemo(() => {
    const lookup = {};
    districtData?.forEach((district) => {
      lookup[district.id] = district;
    });
    return lookup;
  }, [districtData]);

  const comparisonLookup = useMemo(() => {
    const lookup = {};
    comparisonDistrictData?.forEach((district) => {
      lookup[district.id] = district;
    });
    return lookup;
  }, [comparisonDistrictData]);

  const districtOutlines = useMemo(() => {
    if (!geoData?.features?.length) return null;
    return {
      type: 'FeatureCollection',
      features: geoData.features.map((feature) => ({
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          district: normalizeDistrictId(feature.properties),
          name: `District ${normalizeDistrictId(feature.properties)}`,
        },
      })),
    };
  }, [geoData]);

  const activeGeoData = useMemo(() => {
    if (geographyLevel === 'censusBlock' && blockData?.features?.length) return blockData;
    if (precinctData?.features?.length) return precinctData;
    return geoData;
  }, [geographyLevel, blockData, precinctData, geoData]);

  const usingBlockFallback = geographyLevel === 'censusBlock' && !(blockData?.features?.length);

  const valueForFeature = (feature) => {
    const districtId = normalizeDistrictId(feature.properties);
    const district = districtId != null ? districtDataLookup[districtId] : null;
    if (planMode === 'delta') {
      if (districtId == null) return null;
      const currentDistrict = currentPlanLookup[districtId];
      const comparisonDistrict = comparisonLookup[districtId];
      if (!currentDistrict || !comparisonDistrict) return null;
      return comparisonDistrict.minorityPct - currentDistrict.minorityPct;
    }
    if (activeMetric === 'partisan') {
      const demPct = feature.properties?.demPct;
      if (demPct != null) return demPct;
      if (!district) return null;
      return district.dem * 100;
    }
    if (activeMetric === 'eiCandidateA') {
      const minorityPct = feature.properties?.minorityPct ?? district?.minorityPct;
      const demPct = feature.properties?.demPct ?? (district ? district.dem * 100 : null);
      if (minorityPct == null || demPct == null) return null;
      const supportPct = 16 + minorityPct * 0.5 + demPct * 0.24;
      return Math.max(0, Math.min(100, supportPct));
    }
    if (activeMetric === 'eiTurnoutGap') {
      const minorityPct = feature.properties?.minorityPct ?? district?.minorityPct;
      if (minorityPct == null) return null;
      const minorityTurnout = 31 + minorityPct * 0.43;
      const whiteTurnout = 39 + (100 - minorityPct) * 0.31;
      return minorityTurnout - whiteTurnout;
    }
    const minorityPct = feature.properties?.minorityPct;
    if (minorityPct != null) return minorityPct;
    return district?.minorityPct ?? null;
  };

  const { minVal, maxVal } = (() => {
    if (planMode === 'delta') {
      const values = Object.keys(currentPlanLookup)
        .map((key) => {
          const currentDistrict = currentPlanLookup[key];
          const comparisonDistrict = comparisonLookup[key];
          if (!currentDistrict || !comparisonDistrict) return null;
          return comparisonDistrict.minorityPct - currentDistrict.minorityPct;
        })
        .filter((value) => value != null);
      const maxAbs = values.length ? Math.max(...values.map((value) => Math.abs(value))) : 10;
      return { minVal: -maxAbs, maxVal: maxAbs };
    }

    let min = Infinity;
    let max = -Infinity;
    activeGeoData?.features?.forEach((feature) => {
      const value = valueForFeature(feature);
      if (value == null || Number.isNaN(value)) return;
      min = Math.min(min, value);
      max = Math.max(max, value);
    });
    if (min === Infinity) {
      districtData?.forEach((district) => {
        let value = district.minorityPct;
        if (activeMetric === 'partisan') value = district.dem * 100;
        if (activeMetric === 'eiCandidateA') {
          value = Math.max(0, Math.min(100, 16 + district.minorityPct * 0.5 + district.dem * 100 * 0.24));
        }
        if (activeMetric === 'eiTurnoutGap') {
          const minorityTurnout = 31 + district.minorityPct * 0.43;
          const whiteTurnout = 39 + (100 - district.minorityPct) * 0.31;
          value = minorityTurnout - whiteTurnout;
        }
        min = Math.min(min, value);
        max = Math.max(max, value);
      });
    }
    return {
        minVal: min === Infinity ? 0 : min,
        maxVal: max === -Infinity ? 100 : max,
      };
  })();

  const createColor = (value) => {
    if (value == null) return '#d1d5db';
    if (planMode === 'delta') {
      if (minVal === maxVal) return DELTA_SCALE[4].color;
      const t = (value - minVal) / (maxVal - minVal);
      return interpolateColor(Math.max(0, Math.min(1, t)), DELTA_SCALE);
    }
    if (activeMetric === 'partisan') {
      const t = Math.max(0, Math.min(1, value / 100));
      return interpolateColor(t, DIVERGING_SCALE);
    }
    if (activeMetric === 'eiTurnoutGap') {
      if (minVal === maxVal) return DELTA_SCALE[4].color;
      const t = (value - minVal) / (maxVal - minVal);
      return interpolateColor(Math.max(0, Math.min(1, t)), DELTA_SCALE);
    }
    if (minVal === maxVal) return HEAT_SCALE[4].color;
    const t = (value - minVal) / (maxVal - minVal);
    return interpolateColor(Math.max(0, Math.min(1, t)), HEAT_SCALE);
  };

  const createFeatureStyle = (feature) => {
    const districtId = normalizeDistrictId(feature.properties);
    const isHighlighted = highlightedDistrict != null && districtId === highlightedDistrict;
    const value = valueForFeature(feature);
    const color = createColor(value);
    return {
      fillColor: color,
      weight: isHighlighted ? 1.4 : 0,
      opacity: 1,
      color: isHighlighted ? '#111827' : color,
      fillOpacity: isHighlighted ? 0.92 : 0.72,
    };
  };

  const createPopupText = (feature) => {
    const districtId = normalizeDistrictId(feature.properties);
    const district = districtId != null ? districtDataLookup[districtId] : null;
    const name = feature.properties?.name || feature.properties?.geoid || `District ${districtId ?? 'N/A'}`;

    let detailLine;
    if (planMode === 'delta') {
      const currentDistrict = districtId != null ? currentPlanLookup[districtId] : null;
      const comparisonDistrict = districtId != null ? comparisonLookup[districtId] : null;
      const delta = currentDistrict && comparisonDistrict
        ? (comparisonDistrict.minorityPct - currentDistrict.minorityPct).toFixed(1)
        : '—';
      detailLine = `Minority % change: ${delta}%`;
    } else if (activeMetric === 'partisan') {
      const demPct = feature.properties?.demPct ?? (district ? district.dem * 100 : null);
      const repPct = demPct != null ? 100 - demPct : null;
      detailLine = `Dem: ${demPct != null ? demPct.toFixed(1) : '—'}% · Rep: ${repPct != null ? repPct.toFixed(1) : '—'}%`;
    } else if (activeMetric === 'eiCandidateA') {
      const eiSupport = valueForFeature(feature);
      detailLine = `EI Candidate A support: ${eiSupport != null ? eiSupport.toFixed(1) : '—'}%`;
    } else if (activeMetric === 'eiTurnoutGap') {
      const turnoutGap = valueForFeature(feature);
      detailLine = `EI turnout gap (minority-white): ${turnoutGap != null ? turnoutGap.toFixed(1) : '—'} pts`;
    } else {
      const minorityPct = feature.properties?.minorityPct ?? district?.minorityPct;
      detailLine = `Minority: ${minorityPct != null ? Number(minorityPct).toFixed(1) : '—'}%`;
    }

    return `<div style="text-align:center;padding:6px;">
      <strong>${name}</strong><br/>
      <span style="font-size:12px;color:#666;">${detailLine}</span>
    </div>`;
  };

  function onEachFeature(feature, layer) {
    layer.bindPopup(createPopupText(feature));
    layer.on({
      click: () => {
        const districtId = normalizeDistrictId(feature.properties);
        if (districtId != null) onDistrictSelect(districtId);
      },
      mouseover: (event) => {
        event.target.setStyle({ fillOpacity: 0.94, weight: 1.5, color: '#111827' });
      },
      mouseout: (event) => {
        event.target.setStyle(createFeatureStyle(feature));
      },
    });
  }

  function onEachOutline(feature, layer) {
    const districtId = normalizeDistrictId(feature.properties);
    layer.bindPopup(`<strong>District ${districtId}</strong>`);
    layer.on({
      click: () => {
        if (districtId != null) onDistrictSelect(districtId);
      },
    });
  }

  useEffect(() => {
    const controller = new AbortController();
    const base = import.meta.env.BASE_URL;
    Promise.all([
      fetch(`${base}data/${stateAbbr}.json`, { signal: controller.signal }).then((response) => (response.ok ? response.json() : null)),
      fetch(`${base}data/${stateAbbr}-precincts.json`, { signal: controller.signal }).then((response) => (response.ok ? response.json() : null)),
      fetch(`${base}data/${stateAbbr}-blocks.json`, { signal: controller.signal }).then((response) => (response.ok ? response.json() : null)),
    ])
      .then(([districts, precincts, blocks]) => {
        setGeoData(districts);
        setPrecinctData(precincts);
        setBlockData(blocks);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    return () => controller.abort();
  }, [stateAbbr]);

  const isLoading = !geoData && !precinctData && !blockData;
  const isEiGapMetric = activeMetric === 'eiTurnoutGap';
  const legendScale = isDeltaMode
    ? DELTA_SCALE
    : activeMetric === 'partisan'
      ? DIVERGING_SCALE
      : isEiGapMetric
        ? DELTA_SCALE
        : HEAT_SCALE;
  const legendTitle = isDeltaMode
    ? 'Minority % Delta (Comparison - Current)'
    : activeMetric === 'partisan'
      ? 'Democrat ↔ Republican %'
      : activeMetric === 'eiCandidateA'
        ? 'EI Candidate A Support %'
        : activeMetric === 'eiTurnoutGap'
          ? 'EI Turnout Gap (Minority - White)'
          : 'Minority Population %';

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
        {activeGeoData?.features?.length > 0 && (
          <GeoJSON
            key={`${stateAbbr}-${planMode}-${activeMetric}-${geographyLevel}`}
            data={activeGeoData}
            style={createFeatureStyle}
            onEachFeature={onEachFeature}
          />
        )}
        {districtOutlines && (
          <GeoJSON
            key={`${stateAbbr}-outlines-${highlightedDistrict ?? 'none'}`}
            data={districtOutlines}
            style={(feature) => {
              const districtId = normalizeDistrictId(feature.properties);
              return {
                fillColor: 'none',
                fillOpacity: 0,
                weight: highlightedDistrict === districtId ? 4 : 2.5,
                color: highlightedDistrict === districtId ? '#111827' : '#1f2937',
                opacity: highlightedDistrict === districtId ? 1 : 0.7,
              };
            }}
            onEachFeature={onEachOutline}
          />
        )}
      </MapContainer>

      {isLoading && <div className="state-map__loading">Loading...</div>}

      {(activeGeoData || districtData) && (
        <div className="choropleth-legend">
          <div className="choropleth-legend__title">{legendTitle}</div>
          <div className="choropleth-legend__scale">
            {legendScale.map((step, index) => (
              <div
                key={index}
                className="choropleth-legend__swatch"
                style={{ background: step.color }}
              />
            ))}
          </div>
          <div className="choropleth-legend__labels">
            {activeMetric === 'partisan' && !isDeltaMode ? (
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

      {(activeGeoData || districtData) && (
        <div className="choropleth-controls">
          <div className="choropleth-metric">
            <label htmlFor="metric-select">Color by:</label>
            <select
              id="metric-select"
              value={activeMetric}
              disabled={isDeltaMode}
              onChange={(event) => setMetric(event.target.value)}
            >
              {isEiChoroplethView ? (
                <>
                  <option value="eiCandidateA">EI: Candidate A Support</option>
                  <option value="eiTurnoutGap">EI: Turnout Gap</option>
                </>
              ) : (
                <>
                  <option value="minorityPct">Minority %</option>
                  <option value="partisan">Democrat ↔ Republican</option>
                  <option value="eiCandidateA">EI: Candidate A Support</option>
                  <option value="eiTurnoutGap">EI: Turnout Gap</option>
                </>
              )}
            </select>
          </div>
          <div className="choropleth-metric">
            <label htmlFor="geography-select">Geography:</label>
            <select
              id="geography-select"
              value={geographyLevel}
              onChange={(event) => setGeographyLevel(event.target.value)}
            >
              <option value="precinct">Precinct</option>
              <option value="censusBlock">Census Block</option>
            </select>
          </div>
          {usingBlockFallback && (
            <div className="choropleth-note">
              Census block data unavailable for this state; showing precincts.
            </div>
          )}
          {planMode === 'interesting' && (
            <div className="choropleth-note">
              Showing an "interesting" plan variant designed to surface notable district shifts.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
