// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import axios from 'axios';
import { ITINERARY_API_URL, ITINERARY_API_KEY } from '@env';

export type ItineraryPoiType = 'see' | 'eat' | 'drink' | 'do' | 'buy' | 'sleep' | 'generic';

export interface ItineraryCoords {
  lat: number;
  lng: number;
  approximate?: boolean;
}

export interface ItineraryPoi {
  id: string;
  name: string;
  type: ItineraryPoiType;
  coords?: ItineraryCoords;
  description?: string;
  distance?: number;
}

export interface ItineraryPreferences {
  pace?: 'relaxed' | 'moderate' | 'intensive';
  priorities?: ItineraryPoiType[];
  avoid?: ItineraryPoiType[];
  start_time?: string;
  end_time?: string;
}

export interface ItineraryPoiQuery {
  mode?: 'radius' | 'polygon' | 'district';
  lat?: number;
  lng?: number;
  radius?: number;
  polygon?: string;
  district?: string;
  types?: ItineraryPoiType[];
  lang?: string;
  limit?: number;
  offset?: number;
  min_score?: number;
}

export interface ItineraryGeneratePayload {
  pois?: ItineraryPoi[];
  poi_query?: ItineraryPoiQuery;
  days?: number;
  start_location?: ItineraryCoords;
  preferences?: ItineraryPreferences;
}

export interface ItineraryDayPlan {
  day: number;
  pois: ItineraryPoi[];
  estimated_duration_hours: number;
  description?: string;
}

export interface ItineraryGenerateResponse {
  days: ItineraryDayPlan[];
  total_pois: number;
  summary?: string;
}

const POI_CATEGORY_MAP: Record<string, ItineraryPoiType> = {
  see: 'see',
  monument: 'see',
  view: 'see',
  park: 'see',
  eat: 'eat',
  food: 'eat',
  drink: 'drink',
  do: 'do',
  walk: 'do',
  event: 'do',
  buy: 'buy',
  sleep: 'sleep',
  generic: 'generic',
};

/**
 * Converts the broader front-end `PoiCategory` to the strict
 * `ItineraryPoiType` enum accepted by the Python API. Unknown categories
 * fall back to `'generic'`.
 *
 * @param category - The mobile-side category string.
 * @returns The narrowed itinerary type.
 */
export function toItineraryPoiType(category: string): ItineraryPoiType {
  return POI_CATEGORY_MAP[category] ?? 'generic';
}

const itineraryClient = axios.create({
  baseURL: ITINERARY_API_URL,
  headers: ITINERARY_API_KEY ? { 'X-API-Key': ITINERARY_API_KEY } : undefined,
});

/**
 * Calls the public itinerary-api `POST /v1/itinerary/generate` endpoint.
 *
 * Uses a dedicated axios instance keyed off `ITINERARY_API_URL`. The
 * `X-API-Key` header is injected when `ITINERARY_API_KEY` is defined.
 *
 * @param payload - The itinerary generation request body.
 * @returns The generated multi-day itinerary.
 */
export async function generateItinerary(
  payload: ItineraryGeneratePayload,
): Promise<ItineraryGenerateResponse> {
  const { data } = await itineraryClient.post<ItineraryGenerateResponse>(
    '/v1/itinerary/generate',
    payload,
  );
  return data;
}

export { itineraryClient };
