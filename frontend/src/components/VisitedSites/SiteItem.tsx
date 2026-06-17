import React from 'react';
import { Site } from '../../types';
import './SiteItem.scss';

interface SiteItemProps {
  site: Site;
}

const SiteItem: React.FC<SiteItemProps> = ({ site }) => {
  return (
    <li className="site-item">
      <img src={site.imageUrl} alt={site.name} className="site-thumbnail" />
      <div className="site-info">
        <h4>{site.name}</h4>
        <p>Year built: {site.yearBuilt}</p>
      </div>
    </li>
  );
};

export default SiteItem;