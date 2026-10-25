import React, { useState, useEffect, useMemo } from 'react';
import { Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import MapComponent from '../../components/Map/MapComponent';
import FilterPanel from '../../components/Map/FilterPanel';
import {
  addToWantToVisit,
  clearSiteRating,
  getSites,
  markSiteAsVisited,
  rateSite,
  removeFromWantToVisit,
  unmarkSiteAsVisited,
} from '../../services';
import { Site, SiteFilters } from '../../types';
import { DEFAULT_FILTERS, matchesFilters } from '../../utils/siteFilters';
import { thumbnailUrl } from '../../utils/helpers';
import './MapPage.scss';

const FILTERS_KEY = 'mapFilters';

// Filters are a per-browser convenience; fall back to defaults if storage is unavailable.
const loadFilters = (): SiteFilters => {
  try {
    const saved = localStorage.getItem(FILTERS_KEY);
    return saved ? { ...DEFAULT_FILTERS, ...JSON.parse(saved) } : DEFAULT_FILTERS;
  } catch {
    return DEFAULT_FILTERS;
  }
};

const saveFilters = (filters: SiteFilters) => {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // Not critical: the filters just won't be remembered.
  }
};

// Dummy data for Roman sites across Europe
const dummySites: Site[] = [
  {
    id: 1,
    name: "Colosseum",
    latitude: 41.8902,
    longitude: 12.4922,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Colosseo_2020.jpg",
    description: "An iconic symbol of Imperial Rome and its architectural prowess.",
    yearBuilt: 80,
    visited: false,
    country: "Italy",
    civilization: "ROMAN"
  },
  // ... (other sites remain unchanged)
];

interface MapProps {
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
}

const Map: React.FC<MapProps> = ({ setSites }) => {
  const [localSites, setLocalSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SiteFilters>(loadFilters);

  const shownSites = useMemo(
    () => localSites.filter(s => matchesFilters(s, filters)),
    [localSites, filters]
  );

  const changeFilters = (next: SiteFilters) => {
    setFilters(next);
    saveFilters(next);
  };

  const fetchSites = async () => {
    try {
      const sitesData = await getSites();
      const transformedSites = sitesData.map((site: any) => ({
        id: site.id,
        name: site.name,
        latitude: site.latitude,
        longitude: site.longitude,
        // Empty when no real photo was found; the card then shows a placeholder.
        imageUrl: site.imageUrl ? thumbnailUrl(site.imageUrl) : '',
        description: site.description,
        yearBuilt: site.yearBuilt ?? null,
        visited: site.visited || false,
        country: site.country || 'Unknown',
        civilization: site.civilization,
        wikidataId: site.wikidataId,
        myRating: site.myRating ?? null,
        publicRating: site.publicRating ?? null,
        imageCredit: site.imageCredit ?? null,
        imageSourceUrl: site.imageSourceUrl ?? null,
        wantToVisit: site.wantToVisit || false
      }));
      setLocalSites(transformedSites);
      setSites(transformedSites);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
      setLocalSites(dummySites);
      setSites(dummySites);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [setSites]);

  const updateSite = (id: number, changes: Partial<Site>) => {
    const update = (sites: Site[]) => sites.map(s => (s.id === id ? { ...s, ...changes } : s));
    setLocalSites(update);
    setSites(update);
  };

  const setSeen = (id: number, seen: boolean) => updateSite(id, { visited: seen });

  // Flip the tick straight away, and undo it if the backend rejects the change.
  const toggleVisited = async (id: number) => {
    const site = localSites.find(s => s.id === id);
    if (!site) return;

    const nowSeen = !site.visited;
    setSeen(id, nowSeen);
    try {
      if (nowSeen) {
        await markSiteAsVisited(id);
      } else {
        await unmarkSiteAsVisited(id);
      }
    } catch (error) {
      console.error('Failed to toggle visited status:', error);
      setSeen(id, !nowSeen);
    }
  };

  const toggleWant = async (id: number) => {
    const site = localSites.find(s => s.id === id);
    if (!site) return;

    const nowWanted = !site.wantToVisit;
    updateSite(id, { wantToVisit: nowWanted });
    try {
      if (nowWanted) {
        await addToWantToVisit(id);
      } else {
        await removeFromWantToVisit(id);
      }
    } catch (error) {
      console.error('Failed to update want-to-visit list:', error);
      updateSite(id, { wantToVisit: !nowWanted });
    }
  };

  // Same idea for stars: show the new rating at once, restore the old one if saving fails.
  // Clicking the current star again clears the rating (rating === null).
  const rate = async (id: number, rating: number | null) => {
    const previous = localSites.find(s => s.id === id)?.myRating ?? null;
    updateSite(id, { myRating: rating });
    try {
      if (rating === null) {
        await clearSiteRating(id);
      } else {
        await rateSite(id, rating);
      }
    } catch (error) {
      console.error('Failed to save rating:', error);
      updateSite(id, { myRating: previous });
    }
  };

  if (loading) {
    return (
      <div className="map-page__loading">
        <Typography variant="h6">Loading sites...</Typography>
      </div>
    );
  }

  return (
    <div className="map-page">
      <MapComponent
        sites={shownSites}
        onToggleVisited={toggleVisited}
        onRate={rate}
        onToggleWant={toggleWant}
      />
      <FilterPanel
        sites={localSites}
        filters={filters}
        onChange={changeFilters}
        shownCount={shownSites.length}
      />
    </div>
  );
};

export default Map;
