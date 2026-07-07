import React, { useState, useEffect, useMemo } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import greenIcon from '../../assets/icons/marker-icon-green.png?url';
import defaultIcon from '../../assets/icons/marker-icon.png?url';
import MapComponent from '../../components/Map/MapComponent';
import UploadLocationForm from '../../components/common/UploadLocationForm';
import { getSites, markSiteAsVisited, unmarkSiteAsVisited } from '../../services';
import './MapPage.scss';

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
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Colosseo_2020.jpg",
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
      <div className="map-page__loading">
        <Typography variant="h6">Loading sites...</Typography>
      </div>
    );
  }

  return (
    <div className="map-page">
      <MapComponent
        sites={localSites}
        onToggleVisited={toggleVisited}
        visitedIcon={visitedIcon}
        defaultIcon={defaultLeafletIcon}
      >
        <MapEvents />
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
      </MapComponent>
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="map-page__add-location-btn"
      >
        {showSidebar ? 'Hide Sidebar' : 'Add New Location'}
      </button>
      {showSidebar && (
        <div className="map-page__sidebar">
          <button
            onClick={() => setShowSidebar(false)}
            className="map-page__sidebar-close"
          >
            &times;
          </button>
          <h2 className="map-page__sidebar-title">Add New Location</h2>
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
