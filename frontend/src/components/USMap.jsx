import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { stateMarkers } from '../data/mockData';
import 'leaflet/dist/leaflet.css';

const createIcon = (color, label) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div class="custom-marker__pin" style="--marker-color: ${color};">${label}</div>`,
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
          icon={createIcon('#1f6f78', state.abbr)}
          eventHandlers={{
            click: () => navigate(`/state/${state.abbr}`),
          }}
        >
          <Popup>
            <div className="us-map-popup">
              <strong>{state.name}</strong>
              <div>
                Open interactive district analysis
              </div>
              <button
                onClick={() => navigate(`/state/${state.abbr}`)}
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
