import React from 'react';
import SiteItem from './SiteItem';
import { Site } from '../../types';
import './CountrySection.scss';

interface CountrySectionProps {
  country: string;
  sites: Site[];
}

const CountrySection: React.FC<CountrySectionProps> = ({ country, sites }) => {
  return (
    <div className="country-section">
      <h3>{country}</h3>
      <ul>
        {sites.map(site => (
          <SiteItem key={site.id} site={site} />
        ))}
      </ul>
    </div>
  );
};

export default CountrySection;