// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import axios, { AxiosInstance } from 'axios';
import { POI_API_URL, POI_API_KEY } from '@env';

/**
 * POI category, aligned with the public `/pois/search` taxonomy.
 */
export type PoiType =
  | 'see'
  | 'eat'
  | 'drink'
  | 'do'
  | 'buy'
  | 'sleep'
  | 'generic'
  | 'event';

/**
 * Identifier of a data source the public API merges from.
 */
export type PoiProvider =
  | 'overpass'
  | 'wikivoyage'
  | 'wikipedia'
  | 'wikipedia_events'
  | 'geonames'
  | 'foursquare'
  | 'here'
  | 'ticketmaster'
  | 'eventbrite'
  | 'meetup'
  | 'openagenda';

export interface PoiCoordinates {
  lat: number;
  lng: number;
  approximate: boolean;
}

export interface PoiZone {
  name: string;
  source: PoiProvider;
}

export interface PoiContact {
  website?: string;
  phone?: string;
  email?: string;
  opening_hours?: string;
}

/**
 * Lightweight POI projection returned by `/pois/search/slim`.
 */
export interface SlimPoi {
  name: string;
  type: PoiType;
  coords?: PoiCoordinates;
}

/**
 * Top-level body of `/pois/search/slim`.
 */
export interface SlimResult {
  total: number;
  results: SlimPoi[];
}

/**
 * One per-provider POI record nested inside an EnrichedPoi's `providers_data`.
 * Only the fields the mobile app reads are typed; the backend may include more.
 */
export interface RawPoiData {
  id: string;
  name: string;
  type: PoiType;
  provider: PoiProvider;
  coords?: PoiCoordinates;
  description?: string;
  contact?: PoiContact;
  thumbnail?: string;
  wikidata_id?: string;
  /**
   * Canonical link to this POI's page on the originating provider
   * (e.g. https://www.openstreetmap.org/node/12345). Empty when the
   * provider does not expose a stable browse URL.
   */
  source_url?: string;
}

/**
 * Final merged + scored POI returned by `/pois/search`.
 */
export interface EnrichedPoi {
  id: string;
  name: string;
  type: PoiType;
  score: number;
  coords?: PoiCoordinates;
  zone?: PoiZone;
  distance: number;
  description?: string;
  contact?: PoiContact;
  thumbnail?: string;
  sources: PoiProvider[];
  /**
   * Per-provider raw POI records the enriched POI was merged from. Each
   * entry exposes its own `source_url` plus any provider-specific metadata.
   * Keyed by provider id.
   */
  providers_data?: Partial<Record<PoiProvider, RawPoiData>>;
}

/**
 * Top-level body of `/pois/search`.
 */
export interface SearchResult {
  total: number;
  results: EnrichedPoi[];
}

/**
 * Common parameters accepted by every search endpoint.
 */
export interface RadiusSearchParams {
  lat: number;
  lng: number;
  radius?: number;
  types?: PoiType[];
  limit?: number;
  page?: number;
}

/**
 * Builds the axios instance pointed at the public POI API.
 * Auth uses the `X-API-Key` header — the deployed gateway rejects
 * `Authorization: Bearer …` with 401.
 *
 * @returns A configured axios client.
 */
function buildPoiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: POI_API_URL,
    timeout: 12_000,
    headers: { 'X-API-Key': POI_API_KEY },
  });
  return instance;
}

const client = buildPoiClient();

/**
 * Converts a search params bag into the query string the API expects.
 *
 * @param params - Caller-supplied search parameters.
 * @returns An object suitable for axios `params`.
 */
function toQuery(params: RadiusSearchParams): Record<string, string | number> {
  const q: Record<string, string | number> = {
    mode: 'radius',
    lat: params.lat,
    lng: params.lng,
  };
  if (params.radius != null) {q.radius = params.radius;}
  if (params.limit != null) {q.limit = params.limit;}
  if (params.page != null) {q.page = params.page;}
  if (params.types && params.types.length > 0) {q.types = params.types.join(',');}
  return q;
}

/**
 * Issues a lightweight POI search around a coordinate (slim response).
 *
 * Use this for map pins and list snippets where description/contact data
 * are not yet needed — the slim payload is ~5× smaller than the enriched one.
 *
 * @param params - Search parameters (lat/lng required).
 * @param signal - Optional `AbortSignal` so callers can cancel a stale fetch
 *   when a newer one is in flight.
 * @returns The slim search result with up to `limit` entries.
 */
export async function searchPoisSlim(
  params: RadiusSearchParams,
  signal?: AbortSignal,
): Promise<SlimResult> {
  const { data } = await client.get<SlimResult>('/pois/search/slim', {
    params: toQuery(params),
    signal,
  });
  return data;
}

/**
 * Issues a full POI search around a coordinate (enriched response).
 *
 * @param params - Search parameters (lat/lng required).
 * @param signal - Optional `AbortSignal` for cancellation.
 * @returns The enriched search result with description, contact, sources.
 */
export async function searchPois(
  params: RadiusSearchParams,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const { data } = await client.get<SearchResult>('/pois/search', {
    params: toQuery(params),
    signal,
  });
  return data;
}

export default client;
