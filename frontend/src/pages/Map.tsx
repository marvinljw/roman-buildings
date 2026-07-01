import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import greenIcon from '../assets/icons/marker-icon-green.png?url';
import defaultIcon from '../assets/icons/marker-icon.png?url';
import UploadLocationForm from '../components/common/UploadLocationForm';
import { getSites, markSiteAsVisited, unmarkSiteAsVisited } from '../services';

interface Site {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  description: string;
  yearBuilt: number;
  visited: boolean;
  country: string;
}

// Dummy data for Roman sites across Europe
const dummySites: Site[] = [
  {
    id: 1,
    name: "Colosseum",
    latitude: 41.8902,
    longitude: 12.4922,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/640px-Colosseo_2020.jpg",
    description: "An iconic symbol of Imperial Rome and its architectural prowess.",
    yearBuilt: 80,
    visited: false,
    country: "Italy"
  },
  // ... (other sites remain unchanged)
];

interface MapProps {
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
}

const Map: React.FC<MapProps> = ({ setSites }) => {
  const [localSites, setLocalSites] = useState<Site[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSites = async () => {
    try {
      const sitesData = await getSites();
      const transformedSites = sitesData.map((site: any) => ({
        id: site.id,
        name: site.name,
        latitude: site.latitude,
        longitude: site.longitude,
        imageUrl: site.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
        description: site.description,
        yearBuilt: site.yearBuilt || 0,
        visited: site.visited || false,
        country: site.country || 'Unknown'
      }));
      setLocalSites(transformedSites);
      setSites(transformedSites);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
      setLocalSites(dummySites);
      setSites(dummySites);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [setSites]);

  const toggleVisited = async (id: number) => {
    const site = localSites.find(s => s.id === id);
    if (!site) return;

    try {
      if (site.visited) {
        await unmarkSiteAsVisited(id);
      } else {
        await markSiteAsVisited(id);
      }

      // Refresh sites from backend to get updated visited status
      await fetchSites();
    } catch (error) {
      console.error('Failed to toggle visited status:', error);
    }
  };

  const visitedIcon = useMemo(() => new L.Icon({
    iconUrl: greenIcon,
    iconSize: [30, 30],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }), []);

  const defaultLeafletIcon = useMemo(() => new L.Icon({
    iconUrl: defaultIcon,
    iconSize: [30, 30],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }), []);

  const handleNewLocation = (location: {
    name: string;
    latitude: number;
    longitude: number;
    description: string;
    imageUrl: string;
    yearBuilt: number;
    country: string;
  }) => {
    const newSite: Site = {
      id: localSites.length + 1,
      ...location,
      visited: false
    };
    setLocalSites(prevSites => [...prevSites, newSite]);
    setShowSidebar(false);
    setNewMarkerPosition(null);
  };

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        if (showSidebar) {
          setNewMarkerPosition([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' }}>
        <Typography variant="h6">Loading sites...</Typography>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 60px)' }}>
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents />
        {localSites.map((site) => (
          <Marker
            key={site.id}
            position={[site.latitude, site.longitude]}
            icon={site.visited ? visitedIcon : defaultLeafletIcon}
          >
            <Popup>
              <div className="site-popup">
                <h3>{site.name}</h3>
                <img src={site.imageUrl} alt={site.name} style={{ maxWidth: '100%', height: 'auto' }} />
                <p>{site.description}</p>
                <p><strong>Year built:</strong> {site.yearBuilt}</p>
                <p><strong>Country:</strong> {site.country}</p>
                <button onClick={() => toggleVisited(site.id)} className="toggle-visited-btn">
                  {site.visited ? 'Mark as Unvisited' : 'Mark as Visited'}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        {newMarkerPosition && (
          <Marker position={newMarkerPosition} icon={defaultLeafletIcon}>
            <Popup>
              <div>
                <p>New Location</p>
                <p>Latitude: {newMarkerPosition[0].toFixed(4)}</p>
                <p>Longitude: {newMarkerPosition[1].toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '10px',
          backgroundColor: '#fff',
          border: '2px solid rgba(0,0,0,0.2)',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {showSidebar ? 'Hide Sidebar' : 'Add New Location'}
      </button>
      {showSidebar && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '400px',
          height: '100%',
          backgroundColor: 'white',
          boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
          zIndex: 1001,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <button
            onClick={() => setShowSidebar(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
          <h2>Add New Location</h2>
          <UploadLocationForm
            onLocationSubmit={handleNewLocation}
            initialLatitude={newMarkerPosition ? newMarkerPosition[0] : undefined}
            initialLongitude={newMarkerPosition ? newMarkerPosition[1] : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default Map;