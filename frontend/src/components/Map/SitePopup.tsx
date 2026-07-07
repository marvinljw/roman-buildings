import React from 'react';
import { Site } from '../../types';
import OptimizedImage from '../common/OptimizedImage';
import './SitePopup.scss';

interface SitePopupProps {
  site: Site;
  onToggleVisited: () => void;
}

const SitePopup: React.FC<SitePopupProps> = ({ site, onToggleVisited }) => {
  return (
    <div className="site-popup">
      <h3>{site.name}</h3>
      <div className="popup-image-container">
        <OptimizedImage src={site.imageUrl} alt={site.name} />
      </div>
      <div className="popup-content">
        <p className="description">{site.description}</p>
        <p><strong>Year built:</strong> {site.yearBuilt}</p>
        <p><strong>Country:</strong> {site.country}</p>
      </div>
      <button onClick={onToggleVisited} className="toggle-visited-btn">
        {site.visited ? 'Mark as Unvisited' : 'Mark as Visited'}
      </button>
    </div>
  );
};

export default SitePopup;