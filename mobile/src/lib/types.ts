// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

/**
 * Shared front-end domain types for the Trippier mobile app.
 *
 * These mirror the design-handoff data shapes and the contract exposed by the
 * NestJS backend + the public POI / itinerary APIs. Coordinates are always
 * carried as `{ lat, lng }` objects.
 */

export interface Coords {
  lat: number;
  lng: number;
}

export type PoiCategory =
  | 'see'
  | 'eat'
  | 'drink'
  | 'do'
  | 'buy'
  | 'sleep'
  | 'monument'
  | 'park'
  | 'food'
  | 'walk'
  | 'event'
  | 'view'
  | 'generic';

export interface Poi {
  id: string;
  placeId?: string;
  name: string;
  category: PoiCategory;
  coords: Coords;
  address?: string;
  description?: string;
  rating?: number;
  userRatingsTotal?: number;
  distance?: number;
  thumbnail?: string;
  wikipediaUrl?: string;
  wikivoyageUrl?: string;
  website?: string;
  phoneNumber?: string;
  tags?: string[];
}

export interface MapPoi {
  id: string;
  placeId: string;
  name: string;
  coords: Coords;
  category?: PoiCategory;
  rating?: number;
  userRatingsTotal?: number;
  thumbnail?: string;
}

export interface ItineraryStop {
  id: string;
  poi: Poi;
  day: number;
  order: number;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  notes?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  days: number;
  coverImage?: string;
  stops: ItineraryStop[];
  isPublic?: boolean;
  authorId?: number;
  summary?: string;
}

export interface CommunityTrip {
  id: string;
  title: string;
  destination: string;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  days: number;
  stopsCount: number;
  likes: number;
  coverImage?: string;
  summary?: string;
}

export interface AISuggestion {
  id: string;
  label: string;
  description?: string;
  pois: Poi[];
  vibe?: string;
  estimatedHours?: number;
}

export interface SocialPost {
  id: string;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  body: string;
  image?: string;
  likes: number;
  comments: number;
  locationName?: string;
  coords?: Coords;
}

export interface NearbyTraveler {
  id: number;
  name: string;
  avatar?: string;
  distanceMeters: number;
  status?: string;
  interests?: string[];
}

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  city?: string;
  createdAt?: string;
}

export interface CommentUser {
  id: number;
  name: string | null;
}

export interface Comment {
  id: number;
  text: string;
  isPublic: boolean;
  hidden: boolean;
  userId: number;
  user: CommentUser;
  poiId: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

/**
 * Legacy POI shape kept for backwards compatibility with the wave-0 screens
 * still living under `screens/DiscoverScreen.tsx`. New code should consume
 * the typed `Poi` interface above.
 */
export interface POI {
  place_id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  user_ratings_total?: number;
  distance: number;
  thumbnail?: string;
  description?: string;
  wikipediaUrl?: string;
  wikivoyageUrl?: string;
  officialWebsite?: string;
  phoneNumber?: string;
  types?: string[];
}

/**
 * Legacy Map shape consumed by wave-0 screens.
 */
export interface Map {
  id: number;
  title: string;
  icon: string | null;
  description: string | null;
  isPublic: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  pois?: POI[];
}
