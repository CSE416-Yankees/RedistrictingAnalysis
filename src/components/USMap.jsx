import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { stateMarkers } from '../data/mockData';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const createIcon = (color) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 11px;
      font-family: -apple-system, sans-serif;
    "></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

export default function USMap() {
  const navigate = useNavigate();

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
      {stateMarkers.map((state) => (
        <Marker
          key={state.abbr}
          position={state.position}
          icon={createIcon('#1a73e8')}
          eventHandlers={{
            click: () => navigate(`/state/${state.abbr}`),
          }}
        >
          <Popup>
            <div style={{ textAlign: 'center', padding: '4px' }}>
              <strong style={{ fontSize: '14px' }}>{state.name}</strong>
              <br />
              <button
                onClick={() => navigate(`/state/${state.abbr}`)}
                style={{
                  marginTop: '8px',
                  padding: '4px 14px',
                  background: '#1a73e8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Analyze →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
