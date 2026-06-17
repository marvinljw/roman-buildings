export interface Site {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  description: string;
  yearBuilt: number;
  visited: boolean;
  country: string;
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