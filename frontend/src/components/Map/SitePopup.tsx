import React from 'react';
import { Site } from '../../types';
import './SitePopup.scss';

interface SitePopupProps {
  site: Site;
  onToggleVisited: () => void;
}

const SitePopup: React.FC<SitePopupProps> = ({ site, onToggleVisited }) => {
  return (
    <div className="site-popup">
      <h3>{site.name}</h3>
      <img src={site.imageUrl} alt={site.name} />
      <p>{site.description}</p>
      <p><strong>Year built:</strong> {site.yearBuilt}</p>
      <p><strong>Country:</strong> {site.country}</p>
      <button onClick={onToggleVisited} className="toggle-visited-btn">
        {site.visited ? 'Mark as Unvisited' : 'Mark as Visited'}
      </button>
    </div>
  );
};

export default SitePopup;