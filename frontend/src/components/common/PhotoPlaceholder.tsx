import React from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Civilization } from '../../types';
import { CIVILIZATION_COLORS } from '../Map/pins';
import './PhotoPlaceholder.scss';

interface PhotoPlaceholderProps {
  civilization?: Civilization;
}

// Shown when no real photo of a site was found, rather than a map or drawing standing in for one.
const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({ civilization }) => {
  const color = civilization ? CIVILIZATION_COLORS[civilization] : '#6b4a2b';
  return (
    <div
      className="photo-placeholder"
      style={{ background: `linear-gradient(135deg, ${color} 0%, #2b2118 100%)` }}
      role="img"
      aria-label="No photo available"
    >
      <AccountBalanceIcon className="photo-placeholder__icon" />
      <span className="photo-placeholder__text">No photo yet</span>
    </div>
  );
};

export default PhotoPlaceholder;
