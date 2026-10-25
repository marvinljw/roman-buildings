import L from 'leaflet';
import { Civilization } from '../../types';

export const CIVILIZATION_COLORS: Record<Civilization, string> = {
  ROMAN: '#b3261e',
  GREEK: '#1f5fbf',
  EGYPTIAN: '#c98a00',
  CARTHAGINIAN: '#7b3fa0',
  BYZANTINE: '#0f7c6e',
};

const FALLBACK_COLOR = '#5f6368';

const PIN_WIDTH = 28;
const PIN_HEIGHT = 40;

// Teardrop whose tip is the bottom-centre pixel, so the anchor puts the tip exactly on the site.
const pinSvg = (color: string) => `
  <svg class="site-pin__body" width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 28 40" aria-hidden="true">
    <path d="M14 39.5C14 39.5 1 23.6 1 13.8 1 6.7 6.8 1 14 1s13 5.7 13 12.8C27 23.6 14 39.5 14 39.5z"
          fill="${color}" stroke="#fff" stroke-width="2"/>
    <circle cx="14" cy="13.5" r="5" fill="#fff"/>
  </svg>`;

const seenBadge = `
  <span class="site-pin__seen" aria-label="Seen">
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1.5 5.2 4 7.6 8.5 2.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </span>`;

const wantBadge = `
  <span class="site-pin__want" aria-label="Want to visit">
    <svg width="8" height="10" viewBox="0 0 8 10" aria-hidden="true">
      <path d="M1 1h6v8L4 6.8 1 9z" fill="#fff"/>
    </svg>
  </span>`;

const cache = new Map<string, L.DivIcon>();

// Only a handful of distinct icons exist (civilization x badge), so they are shared by all markers.
// A seen tick wins over the want-to-visit bookmark: once seen, that is the more useful fact.
export const getPinIcon = (civilization: Civilization | undefined, seen: boolean, wanted = false): L.DivIcon => {
  const badge = seen ? 'seen' : wanted ? 'want' : 'none';
  const key = `${civilization ?? 'NONE'}:${badge}`;
  let icon = cache.get(key);
  if (!icon) {
    const color = civilization ? CIVILIZATION_COLORS[civilization] : FALLBACK_COLOR;
    icon = L.divIcon({
      className: `site-pin${badge === 'none' ? '' : ` site-pin--${badge}`}`,
      html: pinSvg(color) + (badge === 'seen' ? seenBadge : badge === 'want' ? wantBadge : ''),
      iconSize: [PIN_WIDTH, PIN_HEIGHT],
      iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT],
      popupAnchor: [0, -PIN_HEIGHT + 4],
    });
    cache.set(key, icon);
  }
  return icon;
};
