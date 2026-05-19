import { MapContainer, TileLayer, GeoJSON, Tooltip as LeafletTooltip } from 'react-leaflet';
import { featureCollection, union } from '@turf/turf';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stateMarkers, states } from '../data/mockData';
import 'leaflet/dist/leaflet.css';

const STATE_FILL_COLOR = '#1f6f78';
const STATE_HOVER_FILL = '#f18f5d';
const STATE_OUTLINE_COLOR = '#0f3a40';

function stateDataUrl(stateAbbr) {
  const base = import.meta.env.BASE_URL || '/';
  const trailing = base.endsWith('/') ? base : `${base}/`;
  return `${trailing}data/${encodeURIComponent(stateAbbr)}.json`;
}

function stateOutlineFromDistricts(geo, entry) {
  const features = Array.isArray(geo?.features) ? geo.features : [];
  if (features.length <= 1) return geo;

  try {
    const outline = union(featureCollection(features));
    if (!outline?.geometry) return geo;

    return {
      type: 'FeatureCollection',
      features: [{
        ...outline,
        properties: {
          abbr: entry.abbr,
          name: entry.name,
        },
      }],
    };
  } catch {
    return geo;
  }
}

export default function USMap() {
  const navigate = useNavigate();
  const [stateGeo, setStateGeo] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    Promise.all(
      stateMarkers.map(async (entry) => {
        try {
          const response = await fetch(stateDataUrl(entry.abbr), { signal: controller.signal });
          if (!response.ok) return [entry.abbr, null];
          const json = await response.json();
          return [entry.abbr, stateOutlineFromDistricts(json, entry)];
        } catch {
          return [entry.abbr, null];
        }
      }),
    ).then((pairs) => {
      if (!active) return;
      setStateGeo(Object.fromEntries(pairs));
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const handleStateClick = (abbr) => navigate(`/state/${abbr}`);

  return (
    <MapContainer
      center={[37.8, -96]}
      zoom={4}
      minZoom={3}
      maxZoom={8}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stateMarkers.map((entry) => {
        const geo = stateGeo[entry.abbr];
        if (!geo?.features?.length) return null;

        const stateInfo = states[entry.abbr];

        return (
          <GeoJSON
            key={entry.abbr}
            data={geo}
            style={() => ({
              color: STATE_OUTLINE_COLOR,
              weight: 1.5,
              opacity: 0.85,
              fillColor: STATE_FILL_COLOR,
              fillOpacity: 0.28,
            })}
            onEachFeature={(_feature, layer) => {
              layer.on({
                click: () => handleStateClick(entry.abbr),
                mouseover: (event) => {
                  event.target.setStyle({
                    fillColor: STATE_HOVER_FILL,
                    fillOpacity: 0.55,
                    weight: 2,
                  });
                  if (event.target.bringToFront) event.target.bringToFront();
                },
                mouseout: (event) => {
                  event.target.setStyle({
                    color: STATE_OUTLINE_COLOR,
                    weight: 1.5,
                    opacity: 0.85,
                    fillColor: STATE_FILL_COLOR,
                    fillOpacity: 0.28,
                  });
                },
              });
              const container = layer.getElement?.();
              if (container) container.style.cursor = 'pointer';
            }}
          >
            <LeafletTooltip sticky direction="top" offset={[0, -4]} opacity={0.95}>
              <span className="us-map-tooltip">
                <strong>{stateInfo?.name || entry.name}</strong>
                <span>Click to open analysis</span>
              </span>
            </LeafletTooltip>
          </GeoJSON>
        );
      })}
      {stateMarkers.map((entry) => {
        const stateInfo = states[entry.abbr];
        if (!stateInfo) return null;
        const geo = stateGeo[entry.abbr];
        if (!geo?.features?.length) return null;

        const bounds = L.geoJSON(geo).getBounds();
        if (!bounds?.isValid?.()) return null;

        const center = bounds.getCenter();
        return (
          <GeoJSON
            key={`${entry.abbr}-label`}
            data={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [center.lng, center.lat] },
                  properties: { abbr: entry.abbr, name: stateInfo.name },
                },
              ],
            }}
            pointToLayer={(_feature, latlng) =>
              L.marker(latlng, {
                interactive: false,
                icon: L.divIcon({
                  className: 'us-map-label',
                  html: `<span class="us-map-label__pill">${entry.abbr}</span>`,
                  iconSize: [34, 22],
                  iconAnchor: [17, 11],
                }),
              })
            }
          />
        );
      })}
    </MapContainer>
  );
}
