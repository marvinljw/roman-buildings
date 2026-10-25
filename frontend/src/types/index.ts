export type Civilization = 'ROMAN' | 'GREEK' | 'EGYPTIAN' | 'CARTHAGINIAN' | 'BYZANTINE';

export const CIVILIZATION_LABELS: Record<Civilization, string> = {
  ROMAN: 'Roman',
  GREEK: 'Greek',
  EGYPTIAN: 'Egyptian',
  CARTHAGINIAN: 'Carthaginian',
  BYZANTINE: 'Byzantine',
};

export interface Site {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  description: string;
  yearBuilt: number | null;
  visited: boolean;
  country: string;
  civilization?: Civilization;
  wikidataId?: string | null;
  // The logged-in user's own 1-5 star rating, or null if they haven't rated it.
  myRating?: number | null;
  // 1-5 stars from online data; used whenever the user hasn't rated the site.
  publicRating?: number | null;
  // Photographer and licence for imageUrl, and the photo's page on Wikimedia Commons.
  imageCredit?: string | null;
  imageSourceUrl?: string | null;
  // On the user's "want to visit" list. Independent of `visited`.
  wantToVisit?: boolean;
}

// The user's own rating wins; otherwise the public one.
export const effectiveRating = (site: Site): number => site.myRating ?? site.publicRating ?? 0;

// 'want' = on my want-to-visit list.
export type SeenFilter = 'all' | 'seen' | 'unseen' | 'want';

// 0 = any; 'rated' = rated by me; 4 or 5 = at least that many stars (mine, else public).
export type RatingFilter = 0 | 'rated' | 4 | 5;

export interface SiteFilters {
  seen: SeenFilter;
  civilizations: Civilization[];
  rating: RatingFilter;
}

export interface User {
  id: number;
  username: string;
  email: string;
  visitedSites: number[];
}

export interface ChatMessage {
  id: number;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  unlockedAt?: Date;
}