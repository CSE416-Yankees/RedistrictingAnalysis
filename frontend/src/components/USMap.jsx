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
      background: linear-gradient(145deg, ${color} 0%, #154e54 100%);
      width: 38px;
      height: 38px;
      border-radius: 14px;
      border: 3px solid white;
      box-shadow: 0 5px 14px rgba(0,0,0,0.26);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 11px;
      font-family: 'Manrope', 'Avenir Next', sans-serif;
    "></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
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
          icon={createIcon('#1f6f78')}
          eventHandlers={{
            click: () => navigate(`/state/${state.abbr}`),
          }}
        >
          <Popup>
            <div style={{ textAlign: 'center', padding: '6px 4px', minWidth: '170px' }}>
              <strong style={{ fontSize: '14px', color: '#17313a' }}>{state.name}</strong>
              <div style={{ fontSize: '11px', color: '#5b6972', marginTop: '3px' }}>
                Open interactive district analysis
              </div>
              <button
                onClick={() => navigate(`/state/${state.abbr}`)}
                style={{
                  marginTop: '8px',
                  padding: '5px 14px',
                  background: '#1f6f78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Explore
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
