import React from 'react';
import CountrySection from '../components/VisitedSites/CountrySection';
import { Site } from '../types';

interface VisitedSitesPageProps {
  sites: Site[];
}

const VisitedSitesPage: React.FC<VisitedSitesPageProps> = ({ sites }) => {
  const visitedSites = sites.filter(site => site.visited);
  const sitesByCountry = visitedSites.reduce((acc, site) => {
    if (!acc[site.country]) {
      acc[site.country] = [];
    }
    acc[site.country].push(site);
    return acc;
  }, {} as Record<string, Site[]>);

  return (
    <div className="visited-sites-page">
      <div className="visited-sites-content">
        <h2>Visited Roman Sites by Country</h2>
        {Object.entries(sitesByCountry).map(([country, sites]) => (
          <CountrySection key={country} country={country} sites={sites} />
        ))}
      </div>
    </div>
  );
};

export default VisitedSitesPage;