import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  return null;
}

function districtStyle(feature) {
  return {
    fillColor: feature.properties.color,
    weight: 2,
    opacity: 1,
    color: '#ffffff',
    fillOpacity: 0.45,
  };
}

function onEachDistrict(feature, layer) {
  const props = feature.properties;
  layer.bindPopup(
    `<div style="text-align:center;padding:4px;">
      <strong>${props.name}</strong>
      ${props.Code ? `<br/><span style="font-size:11px;color:#666;">${props.Code}</span>` : ''}
    </div>`
  );
  layer.on({
    mouseover: (e) => {
      e.target.setStyle({ fillOpacity: 0.7, weight: 3 });
    },
    mouseout: (e) => {
      e.target.setStyle({ fillOpacity: 0.45, weight: 2 });
    },
  });
}

export default function StateMap({ stateAbbr, center, zoom }) {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
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
        <div style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'white',
          padding: '6px 16px',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: 13,
          fontWeight: 500,
        }}>
          Loading districts...
        </div>
      )}
      {geoData && (
        <GeoJSON
          key={stateAbbr}
          data={geoData}
          style={districtStyle}
          onEachFeature={onEachDistrict}
        />
      )}
    </MapContainer>
  );
}
