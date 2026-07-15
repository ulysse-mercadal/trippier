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
 * POI category, aligned with the public `/v1/pois/search` taxonomy.
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
 * Class of a result — a place versus a time-bound event. Orthogonal to
 * {@link PoiType}; every `/v1/pois/search` result carries one so places and
 * events can be displayed separately.
 */
export type PointKind = 'poi' | 'event';

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
 * Lightweight POI projection returned by `/v1/pois/search/slim`.
 */
export interface SlimPoi {
  name: string;
  kind?: PointKind;
  type: PoiType;
  coords?: PoiCoordinates;
}

/**
 * Top-level body of `/v1/pois/search/slim`.
 */
export interface SlimResult {
  total: number;
  results: SlimPoi[];
}

/**
 * One contributing source for an EnrichedPoi: the provider id plus the
 * canonical URL clients can follow for richer detail on that source.
 * Returned by `/v1/pois/search` as the `sources` array — replaces the previous
 * `sources: string[]` + `providers_data` map shape.
 */
export interface SourceLink {
  provider: PoiProvider;
  url?: string;
}

/**
 * Final merged + scored POI returned by `/v1/pois/search`. All per-provider
 * data is folded into the top-level fields; follow each `SourceLink.url`
 * for more detail on that specific source.
 */
export interface EnrichedPoi {
  id: string;
  name: string;
  kind?: PointKind;
  type: PoiType;
  score: number;
  coords?: PoiCoordinates;
  zone?: PoiZone;
  distance: number;
  description?: string;
  contact?: PoiContact;
  thumbnail?: string;
  /**
   * Gallery images — first one is the merged lead image, the rest are
   * supporting visuals when the providers exposed them.
   */
  images?: string[];
  sources: SourceLink[];
}

/**
 * Top-level body of `/v1/pois/search`.
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
  const { data } = await client.get<SlimResult>('/v1/pois/search/slim', {
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
  const { data } = await client.get<SearchResult>('/v1/pois/search', {
    params: toQuery(params),
    signal,
  });
  return data;
}

export default client;
