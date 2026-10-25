import React from 'react';
import Rating from '@mui/material/Rating';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { Site, CIVILIZATION_LABELS, effectiveRating } from '../../types';
import { formatYear, openInNewTab } from '../../utils/helpers';
import OptimizedImage from '../common/OptimizedImage';
import PhotoPlaceholder from '../common/PhotoPlaceholder';
import { CIVILIZATION_COLORS } from './pins';
import './SitePopup.scss';

interface SitePopupProps {
  site: Site;
  onToggleVisited: () => void;
  onRate: (rating: number | null) => void;
  onToggleWant: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Not for me',
  2: 'Okay',
  3: 'Good',
  4: 'Great',
  5: 'Unmissable',
};

const SitePopup: React.FC<SitePopupProps> = ({ site, onToggleVisited, onRate, onToggleWant }) => {
  const [hoverRating, setHoverRating] = React.useState(-1);
  const isMine = site.myRating != null;
  const rating = effectiveRating(site);
  const shownRating = hoverRating > 0 ? hoverRating : rating;

  // MUI reports null when the current value is clicked again. On my own rating that clears it
  // (back to the public stars); on the public stars it means "I agree", so keep that value as mine.
  const handleRate = (value: number | null) => {
    if (value === null && !isMine) {
      onRate(rating || null);
    } else {
      onRate(value);
    }
  };
  const civColor = site.civilization ? CIVILIZATION_COLORS[site.civilization] : '#5f6368';

  return (
    <article className="site-card">
      <div className="site-card__hero">
        {site.imageUrl ? (
          <OptimizedImage
            src={site.imageUrl}
            alt={site.name}
            fallback={<PhotoPlaceholder civilization={site.civilization} />}
          />
        ) : (
          <PhotoPlaceholder civilization={site.civilization} />
        )}
        <div className="site-card__hero-shade" />
        {site.imageUrl && site.imageSourceUrl && (
          <a
            className="site-card__hero-link"
            href={site.imageSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openInNewTab}
            aria-label={`Open the full photo of ${site.name} on Wikimedia Commons (new tab)`}
          />
        )}
        {site.civilization && (
          <span className="site-card__civ" style={{ backgroundColor: civColor }}>
            {CIVILIZATION_LABELS[site.civilization]}
          </span>
        )}
        {site.visited ? (
          <span className="site-card__seen-badge">✓ Seen</span>
        ) : site.wantToVisit ? (
          <span className="site-card__seen-badge site-card__seen-badge--want">Want to visit</span>
        ) : null}
        <h3 className="site-card__title">{site.name}</h3>
      </div>
      {site.imageUrl && site.imageCredit && (
        <div className="site-card__credit" title={site.imageCredit}>
          <PhotoCameraOutlinedIcon fontSize="inherit" />
          <span>{site.imageCredit}</span>
        </div>
      )}

      <div className="site-card__body">
        <div className="site-card__meta">
          <span>
            <EventOutlinedIcon fontSize="inherit" />
            {formatYear(site.yearBuilt)}
          </span>
          <span>
            <PlaceOutlinedIcon fontSize="inherit" />
            {site.country}
          </span>
        </div>

        <p className="site-card__description">{site.description}</p>
        {site.wikidataId && (
          <a
            className="site-card__link"
            href={`https://www.wikidata.org/wiki/Special:GoToLinkedPage/enwiki/${site.wikidataId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openInNewTab}
          >
            Read more on Wikipedia <OpenInNewIcon fontSize="inherit" />
          </a>
        )}

        <div className="site-card__rating">
          <div className="site-card__rating-head">
            <span className="site-card__label">{isMine ? 'Your rating' : 'Public rating'}</span>
            {isMine && site.publicRating != null && (
              <button className="site-card__reset" onClick={() => onRate(null)}>
                Use public ({site.publicRating}★)
              </button>
            )}
          </div>
          <div className="site-card__stars">
            <Rating
              name={`rating-${site.id}`}
              className={isMine || hoverRating > 0 ? '' : 'site-card__stars--public'}
              value={rating || null}
              onChange={(_, value) => handleRate(value)}
              onChangeActive={(_, value) => setHoverRating(value)}
              size="medium"
            />
            <span className="site-card__rating-text">
              {shownRating > 0 ? RATING_LABELS[shownRating] : 'Not rated'}
            </span>
          </div>
          {!isMine && rating > 0 && (
            <span className="site-card__hint">From online popularity. Tap the stars to set your own.</span>
          )}
        </div>
      </div>

      <footer className="site-card__footer">
        <label className={`seen-check${site.visited ? ' seen-check--on' : ''}`}>
          <input type="checkbox" checked={site.visited} onChange={onToggleVisited} />
          <span className="seen-check__box" aria-hidden="true">✓</span>
          {site.visited ? 'Seen it' : 'Mark as seen'}
        </label>
        <button
          type="button"
          className={`want-toggle${site.wantToVisit ? ' want-toggle--on' : ''}`}
          aria-pressed={!!site.wantToVisit}
          onClick={onToggleWant}
        >
          {site.wantToVisit ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
          {site.wantToVisit ? 'On my list' : 'Want to visit'}
        </button>
      </footer>
    </article>
  );
};

export default SitePopup;
