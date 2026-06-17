import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Site } from '../../types';
import SitePopup from './SitePopup';
import './MapComponent.scss';

interface MapComponentProps {
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
}

const MapComponent: React.FC<MapComponentProps> = ({ setSites }) => {
  const [localSites, setLocalSites] = useState<Site[]>([]);

  useEffect(() => {
    // In a real app, you would fetch the sites from an API
    setLocalSites(dummySites);
  }, []);

  useEffect(() => {
    setSites(localSites);
  }, [localSites, setSites]);

  const toggleVisited = (id: number) => {
    setLocalSites(prevSites =>
      prevSites.map(site =>
        site.id === id ? { ...site, visited: !site.visited } : site
      )
    );
  };

  const getMarkerIcon = (visited: boolean) => {
    return L.icon({
      iconUrl: visited ? '/marker-icon-green.png' : '/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: '/marker-shadow.png',
      shadowSize: [41, 41],
    });
  };

  return (
    <MapContainer center={[48.8566, 2.3522]} zoom={4} className="map-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {localSites.map((site) => (
        <Marker
          key={site.id}
          position={[site.latitude, site.longitude]}
          icon={getMarkerIcon(site.visited)}
        >
          <Popup>
            <SitePopup site={site} onToggleVisited={() => toggleVisited(site.id)} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;

// Dummy data (in a real app, this would be fetched from an API)
const dummySites: Site[] = [
  // ... (keep the existing dummy data here)
];