import React, { useEffect, useState } from 'react';
import CountrySection from '../components/VisitedSites/CountrySection';
import { Site } from '../types';
import { getMyVisitedSites } from '../services';

interface VisitedSitesPageProps {
  sites: Site[];
}

const VisitedSitesPage: React.FC<VisitedSitesPageProps> = ({ sites }) => {
  const [visitedSites, setVisitedSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitedSites = async () => {
      try {
        const data = await getMyVisitedSites();
        setVisitedSites(data);
      } catch (error) {
        console.error('Failed to fetch visited sites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitedSites();
  }, []);

  if (loading) {
    return (
      <div className="visited-sites-page">
        <div className="visited-sites-content">
          <h2>Loading visited sites...</h2>
        </div>
      </div>
    );
  }

  const sitesByCountry = visitedSites.reduce((acc, site) => {
    if (!acc[site.country]) {
      acc[site.country] = [];
    }
    acc[site.country].push(site);
    return acc;
  }, {} as Record<string, any[]>);

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