import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
  {
    id: 2,
    name: "Pantheon",
    latitude: 41.8986,
    longitude: 12.4769,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Pantheon_Rome_01.jpg/640px-Pantheon_Rome_01.jpg",
    description: "A former Roman temple dedicated to all the gods of pagan Rome.",
    yearBuilt: 126,
    visited: false,
    country: "Italy"
  },
  {
    id: 3,
    name: "Roman Forum",
    latitude: 41.8925,
    longitude: 12.4853,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Foro_Romano_Musei_Capitolini_Roma.jpg/640px-Foro_Romano_Musei_Capitolini_Roma.jpg",
    description: "The center of ancient Rome's political and social activity.",
    yearBuilt: -800,
    visited: false,
    country: "Italy"
  },
  {
    id: 4,
    name: "Pont du Gard",
    latitude: 43.9474,
    longitude: 4.5352,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Le_Pont_du_Gard.jpg/640px-Le_Pont_du_Gard.jpg",
    description: "An ancient Roman aqueduct bridge that crosses the Gardon River in southern France.",
    yearBuilt: 40,
    visited: false,
    country: "France"
  },
  {
    id: 5,
    name: "Hadrian's Wall",
    latitude: 55.0252,
    longitude: -2.5479,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Hadrians_wall_at_Greenhead_Lough.jpg/640px-Hadrians_wall_at_Greenhead_Lough.jpg",
    description: "A defensive fortification in Roman Britain, running 73 miles across the width of northern England.",
    yearBuilt: 122,
    visited: false,
    country: "United Kingdom"
  },
  {
    id: 6,
    name: "Acropolis of Athens",
    latitude: 37.9715,
    longitude: 23.7269,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/The_Acropolis_of_Athens_viewed_from_the_Hill_of_the_Muses_%2814220794964%29.jpg/640px-The_Acropolis_of_Athens_viewed_from_the_Hill_of_the_Muses_%2814220794964%29.jpg",
    description: "An ancient citadel located on a rocky outcrop above the city of Athens.",
    yearBuilt: -480,
    visited: false,
    country: "Greece"
  }
];

interface MapProps {
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
}

const Map: React.FC<MapProps> = ({ setSites }) => {
  const [localSites, setLocalSites] = useState<Site[]>(dummySites);

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
    <MapContainer center={[48.8566, 2.3522]} zoom={4} style={{ height: 'calc(100vh - 60px)', width: '100%' }}>
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
            <div className="site-popup">
              <h3>{site.name}</h3>
              <img src={site.imageUrl} alt={site.name} />
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
    </MapContainer>
  );
};

export default Map;