export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Click handler for external links: always open a new tab and never navigate the app itself.
// target="_blank" alone isn't enough in embedded browsers, which may load the link in place.
// The href stays on the <a>, so middle-click and "copy link" still work.
export const openInNewTab = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  e.stopPropagation();
  window.open(e.currentTarget.href, '_blank', 'noopener,noreferrer');
};

// Years are stored as signed integers: -447 is 447 BC.
export const formatYear = (year: number | null | undefined): string => {
  if (year === null || year === undefined || year === 0) return 'Unknown';
  return year < 0 ? `${-year} BC` : `AD ${year}`;
};

// Wikimedia originals can be 10,000+ px wide; ask Commons for a card-sized version instead.
const COMMONS_ORIGINAL = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)$/;

export const thumbnailUrl = (url: string, width = 640): string => {
  const match = COMMONS_ORIGINAL.exec(url);
  return match ? `https://commons.wikimedia.org/wiki/Special:FilePath/${match[1]}?width=${width}` : url;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 100) / 100;
};

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};