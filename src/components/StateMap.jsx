import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { districtGeoJSON } from '../data/mockData';
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
  layer.bindPopup(
    `<div style="text-align:center;padding:2px;">
      <strong>${feature.properties.name}</strong>
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
  const geoData = districtGeoJSON[stateAbbr];

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
