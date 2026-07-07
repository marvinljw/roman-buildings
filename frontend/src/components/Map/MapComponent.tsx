import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Site } from '../../types';
import SitePopup from './SitePopup';
import './MapComponent.scss';
import '../../styles/ClusterMarkers.scss';

interface MapComponentProps {
  sites: Site[];
  onToggleVisited: (id: number) => void;
  visitedIcon: L.Icon;
  defaultIcon: L.Icon;
  children?: React.ReactNode;
}

const MapComponent: React.FC<MapComponentProps> = ({
  sites,
  onToggleVisited,
  visitedIcon,
  defaultIcon,
  children
}) => {
  const createClusterCustomIcon = useMemo(() => (cluster: any) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 40 : count < 100 ? 50 : 60;

    return L.divIcon({
      html: `<div class="custom-cluster-icon">
               <div class="cluster-marker">
                 <span>${count}</span>
               </div>
             </div>`,
      className: 'custom-cluster',
      iconSize: L.point(size, size, true),
    });
  }, []);

  return (
    <MapContainer
      center={[48.8566, 2.3522]}
      zoom={4}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {children}
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        disableClusteringAtZoom={15}
        iconCreateFunction={createClusterCustomIcon}
      >
        {sites.map((site) => (
          <Marker
            key={site.id}
            position={[site.latitude, site.longitude]}
            icon={site.visited ? visitedIcon : defaultIcon}
          >
            <Popup>
              <SitePopup site={site} onToggleVisited={() => onToggleVisited(site.id)} />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapComponent;