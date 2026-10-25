import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Site } from '../../types';
import SitePopup from './SitePopup';
import { getPinIcon } from './pins';
import './MapComponent.scss';
import '../../styles/ClusterMarkers.scss';

interface MapComponentProps {
  sites: Site[];
  onToggleVisited: (id: number) => void;
  onRate: (id: number, rating: number | null) => void;
  onToggleWant: (id: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ sites, onToggleVisited, onRate, onToggleWant }) => {
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
      <LayersControl position="topleft">
        <LayersControl.BaseLayer checked name="Map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
        {/* Zoom in on satellite imagery to see the actual ruins under each pin. */}
        <LayersControl.BaseLayer name="Satellite">
          <LayerGroup>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community"
              maxZoom={19}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayerGroup>
        </LayersControl.BaseLayer>
      </LayersControl>
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
            icon={getPinIcon(site.civilization, site.visited, site.wantToVisit)}
            title={site.visited ? `${site.name} (seen)` : site.wantToVisit ? `${site.name} (want to visit)` : site.name}
          >
            {/* Pan so the card isn't hidden behind the filter panel on the right. */}
            <Popup
              className="site-card-popup"
              minWidth={300}
              maxWidth={300}
              autoPanPaddingTopLeft={[60, 20]}
              autoPanPaddingBottomRight={[300, 20]}
            >
              <SitePopup
                site={site}
                onToggleVisited={() => onToggleVisited(site.id)}
                onRate={(rating) => onRate(site.id, rating)}
                onToggleWant={() => onToggleWant(site.id)}
              />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapComponent;
