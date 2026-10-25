import React from 'react';
import { Site } from '../../types';
import { formatYear } from '../../utils/helpers';
import PhotoPlaceholder from '../common/PhotoPlaceholder';
import './SiteItem.scss';

interface SiteItemProps {
  site: Site;
}

const SiteItem: React.FC<SiteItemProps> = ({ site }) => {
  return (
    <li className="site-item">
      {site.imageUrl ? (
        <img src={site.imageUrl} alt={site.name} className="site-thumbnail" />
      ) : (
        <div className="site-thumbnail site-thumbnail--empty">
          <PhotoPlaceholder civilization={site.civilization} />
        </div>
      )}
      <div className="site-info">
        <h4>{site.name}</h4>
        <p>Year built: {formatYear(site.yearBuilt)}</p>
      </div>
    </li>
  );
};

export default SiteItem;