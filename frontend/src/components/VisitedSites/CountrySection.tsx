import React from 'react';
import SiteItem from './SiteItem';
import { Site } from '../../types';
import './CountrySection.scss';
import { Box } from '@mui/material';

interface CountrySectionProps {
  country: string;
  sites: Site[];
}

const CountrySection: React.FC<CountrySectionProps> = ({ country, sites }) => {
  return (
    <Box className="country-section">
      <h3>{country}</h3>
      <ul>
        {sites.map(site => (
          <SiteItem key={site.id} site={site} />
        ))}
      </ul>
    </Box>
  );
};

export default CountrySection;