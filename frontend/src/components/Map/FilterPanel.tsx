import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { CIVILIZATION_LABELS, Civilization, RatingFilter, SeenFilter, Site, SiteFilters } from '../../types';
import { ALL_CIVILIZATIONS, DEFAULT_FILTERS, isDefaultFilters, matchesFilters } from '../../utils/siteFilters';
import { CIVILIZATION_COLORS } from './pins';
import './FilterPanel.scss';

interface FilterPanelProps {
  sites: Site[];
  filters: SiteFilters;
  onChange: (filters: SiteFilters) => void;
  shownCount: number;
}

const SEEN_OPTIONS: { value: SeenFilter; label: string; title: string }[] = [
  { value: 'all', label: 'All', title: 'All sites' },
  { value: 'seen', label: 'Seen', title: 'Sites I have seen' },
  { value: 'unseen', label: 'Unseen', title: 'Sites I have not seen yet' },
  { value: 'want', label: 'Wishlist', title: 'Sites I want to visit' },
];

const RATING_OPTIONS: { value: RatingFilter; label: React.ReactNode; title: string }[] = [
  { value: 0, label: 'Any', title: 'Any rating' },
  { value: 'rated', label: 'Mine', title: 'Only sites I have rated myself' },
  { value: 4, label: <>4<StarIcon fontSize="inherit" />+</>, title: '4 stars or more (my rating, else public)' },
  { value: 5, label: <>5<StarIcon fontSize="inherit" /></>, title: '5 stars only (my rating, else public)' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({ sites, filters, onChange, shownCount }) => {
  const [open, setOpen] = React.useState(true);

  const countWhere = (ignore: keyof SiteFilters, extra: (s: Site) => boolean) =>
    sites.filter((s) => matchesFilters(s, filters, ignore) && extra(s)).length;

  const seenCounts: Record<SeenFilter, number> = {
    all: countWhere('seen', () => true),
    seen: countWhere('seen', (s) => s.visited),
    unseen: countWhere('seen', (s) => !s.visited),
    want: countWhere('seen', (s) => !!s.wantToVisit),
  };

  const toggleCivilization = (civ: Civilization) => {
    const has = filters.civilizations.includes(civ);
    const civilizations = has
      ? filters.civilizations.filter((c) => c !== civ)
      : ALL_CIVILIZATIONS.filter((c) => c === civ || filters.civilizations.includes(c));
    onChange({ ...filters, civilizations });
  };

  if (!open) {
    return (
      <button className="filter-panel__open" onClick={() => setOpen(true)} aria-label="Show filters">
        <TuneIcon fontSize="small" />
        Filters
        {!isDefaultFilters(filters) && <span className="filter-panel__dot" />}
      </button>
    );
  }

  return (
    <aside className="filter-panel" aria-label="Filter sites">
      <header className="filter-panel__header">
        <div>
          <h2 className="filter-panel__title">Explore</h2>
          <p className="filter-panel__summary">
            Showing <strong>{shownCount}</strong> of {sites.length} sites
          </p>
        </div>
        <button className="filter-panel__close" onClick={() => setOpen(false)} aria-label="Hide filters">
          <CloseIcon fontSize="small" />
        </button>
      </header>

      <section className="filter-panel__section">
        <h3 className="filter-panel__label">Show</h3>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={filters.seen}
          onChange={(_, value: SeenFilter | null) => value && onChange({ ...filters, seen: value })}
        >
          {SEEN_OPTIONS.map((o) => (
            <ToggleButton
              key={o.value}
              value={o.value}
              className="filter-panel__toggle"
              title={o.title}
              aria-label={`${o.title} (${seenCounts[o.value]})`}
            >
              <span>{o.label}</span>
              <span className="filter-panel__count">{seenCounts[o.value]}</span>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </section>

      <section className="filter-panel__section">
        <div className="filter-panel__label-row">
          <h3 className="filter-panel__label">Civilizations</h3>
          <button
            className="filter-panel__text-btn"
            onClick={() =>
              onChange({
                ...filters,
                civilizations: filters.civilizations.length === ALL_CIVILIZATIONS.length ? [] : ALL_CIVILIZATIONS,
              })
            }
          >
            {filters.civilizations.length === ALL_CIVILIZATIONS.length ? 'None' : 'All'}
          </button>
        </div>
        <ul className="filter-panel__civs">
          {ALL_CIVILIZATIONS.map((civ) => {
            const checked = filters.civilizations.includes(civ);
            return (
              <li key={civ}>
                <label className={`filter-panel__civ${checked ? '' : ' filter-panel__civ--off'}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleCivilization(civ)} />
                  <span
                    className="filter-panel__swatch"
                    style={{ backgroundColor: checked ? CIVILIZATION_COLORS[civ] : 'transparent', borderColor: CIVILIZATION_COLORS[civ] }}
                  />
                  <span className="filter-panel__civ-name">{CIVILIZATION_LABELS[civ]}</span>
                  <span className="filter-panel__count">
                    {countWhere('civilizations', (s) => s.civilization === civ)}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="filter-panel__section">
        <h3 className="filter-panel__label">Rating</h3>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={filters.rating}
          onChange={(_, value: RatingFilter | null) => value !== null && onChange({ ...filters, rating: value })}
        >
          {RATING_OPTIONS.map((o) => (
            <ToggleButton
              key={String(o.value)}
              value={o.value}
              title={o.title}
              aria-label={o.title}
              className="filter-panel__toggle"
            >
              <span className="filter-panel__rating-label">{o.label}</span>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </section>

      {!isDefaultFilters(filters) && (
        <button className="filter-panel__reset" onClick={() => onChange(DEFAULT_FILTERS)}>
          Reset filters
        </button>
      )}
    </aside>
  );
};

export default FilterPanel;
