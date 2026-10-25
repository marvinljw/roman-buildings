import { CIVILIZATION_LABELS, Civilization, Site, SiteFilters, effectiveRating } from '../types';

export const ALL_CIVILIZATIONS = Object.keys(CIVILIZATION_LABELS) as Civilization[];

export const DEFAULT_FILTERS: SiteFilters = {
  seen: 'all',
  civilizations: ALL_CIVILIZATIONS,
  rating: 0,
};

type FilterKey = keyof SiteFilters;

// `ignore` leaves one filter out, so each section of the panel can show counts
// for its own options given whatever the other sections are set to.
export const matchesFilters = (site: Site, filters: SiteFilters, ignore?: FilterKey): boolean => {
  if (ignore !== 'seen') {
    if (filters.seen === 'seen' && !site.visited) return false;
    if (filters.seen === 'unseen' && site.visited) return false;
    if (filters.seen === 'want' && !site.wantToVisit) return false;
  }
  if (ignore !== 'civilizations' && site.civilization && !filters.civilizations.includes(site.civilization)) {
    return false;
  }
  if (ignore !== 'rating' && filters.rating !== 0) {
    if (filters.rating === 'rated' ? !site.myRating : effectiveRating(site) < filters.rating) return false;
  }
  return true;
};

export const isDefaultFilters = (filters: SiteFilters): boolean =>
  filters.seen === DEFAULT_FILTERS.seen &&
  filters.rating === DEFAULT_FILTERS.rating &&
  filters.civilizations.length === ALL_CIVILIZATIONS.length;
