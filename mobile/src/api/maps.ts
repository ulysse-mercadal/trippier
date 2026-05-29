// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import client from './client';

export interface MapSummaryPoi {
  place_id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number | null;
  user_ratings_total: number | null;
}

export interface MapSummary {
  id: number;
  title: string;
  icon: string | null;
  description: string | null;
  isPublic: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  pois?: MapSummaryPoi[];
}

export interface MapDetailPoi {
  id: string;
  place_id: string;
  name: string;
  lat: string;
  lng: string;
  thumbnail: string | null;
  personalDescription: string | null;
}

export interface MapDetail {
  id: number;
  title: string;
  icon: string | null;
  description: string | null;
  isPublic: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  pois: MapDetailPoi[];
  user?: { id: number; name: string | null; email: string };
}

export interface MapPoiPayload {
  place_id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  category?: string;
  rating?: number | null;
  userRatingsTotal?: number | null;
  thumbnail?: string;
  description?: string;
  wikipediaUrl?: string;
  wikivoyageUrl?: string;
  website?: string;
  phoneNumber?: string;
}

export interface NearbyMapPoi extends MapPoiPayload {
  id: string;
  distance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMapInput {
  title: string;
  icon?: string | null;
  description?: string | null;
  isPublic?: boolean;
  isVisible?: boolean;
}

export type UpdateMapInput = Partial<CreateMapInput>;

export interface NearbyQuery {
  lat: number;
  lng: number;
  radius?: number;
}

/**
 * Lists every map owned by the authenticated user. Each map carries a
 * compact projection of its POIs (slim `MapSummaryPoi`, no descriptions).
 *
 * @returns Array of map summaries.
 */
export async function listMyMaps(): Promise<MapSummary[]> {
  const { data } = await client.get<MapSummary[]>('/maps');
  return data;
}

/**
 * Fetches a single map detail (with full POI list, lat/lng as strings and
 * personal descriptions per POI).
 *
 * @param id - The map identifier.
 * @returns The detailed map payload.
 */
export async function getMap(id: number): Promise<MapDetail> {
  const { data } = await client.get<MapDetail>(`/maps/${id}`);
  return data;
}

/**
 * Creates a new map for the authenticated user.
 *
 * @param input - The map creation payload.
 * @returns The freshly created map summary (without POIs).
 */
export async function createMap(input: CreateMapInput): Promise<MapSummary> {
  const { data } = await client.post<MapSummary>('/maps', input);
  return data;
}

/**
 * Partially updates an existing map.
 *
 * @param id - The map identifier.
 * @param input - The map fields to update.
 * @returns The updated map summary (without POIs).
 */
export async function updateMap(id: number, input: UpdateMapInput): Promise<MapSummary> {
  const { data } = await client.patch<MapSummary>(`/maps/${id}`, input);
  return data;
}

/**
 * Deletes a map owned by the authenticated user.
 *
 * @param id - The map identifier.
 * @returns A promise resolving once the deletion succeeds.
 */
export async function deleteMap(id: number): Promise<void> {
  await client.delete(`/maps/${id}`);
}

/**
 * Adds a POI to a map. The backend response is the full `MapDetail`.
 *
 * @param mapId - The target map identifier.
 * @param poi - The POI payload accepted by the NestJS DTO.
 * @returns The updated map detail.
 */
export async function addPoiToMap(mapId: number, poi: MapPoiPayload): Promise<MapDetail> {
  const { data } = await client.post<MapDetail>(`/maps/${mapId}/pois`, poi);
  return data;
}

/**
 * Updates the per-user `personalDescription` of a POI inside a map.
 *
 * @param mapId - The target map identifier.
 * @param poiId - The `place_id` of the POI to update.
 * @param input - The personal description to persist.
 * @returns The updated map detail.
 */
export async function updateMapPoi(
  mapId: number,
  poiId: string,
  input: { personalDescription?: string | null },
): Promise<MapDetail> {
  const { data } = await client.patch<MapDetail>(`/maps/${mapId}/pois/${poiId}`, input);
  return data;
}

/**
 * Removes a POI from a map.
 *
 * @param mapId - The target map identifier.
 * @param poiId - The `place_id` of the POI to remove.
 * @returns A promise resolving once the deletion succeeds.
 */
export async function removePoiFromMap(mapId: number, poiId: string): Promise<void> {
  await client.delete(`/maps/${mapId}/pois/${poiId}`);
}

/**
 * Fetches a single POI inside a map (owner / public).
 *
 * @param mapId - The target map identifier.
 * @param poiId - The POI place id.
 * @returns The POI detail row.
 */
export async function getMapPoi(mapId: number, poiId: string): Promise<MapDetailPoi> {
  const { data } = await client.get<MapDetailPoi>(`/maps/${mapId}/pois/${poiId}`);
  return data;
}

/**
 * Returns saved POIs near a location for the authenticated user.
 *
 * The radius is interpreted in **kilometers** (default 1, max 100) by the
 * backend.
 *
 * @param query - Latitude / longitude and optional radius (km).
 * @returns The nearby saved POIs sorted by ascending distance (km).
 */
export async function nearbyMyMaps(query: NearbyQuery): Promise<NearbyMapPoi[]> {
  const { data } = await client.get<NearbyMapPoi[]>('/maps/nearby', { params: query });
  return data;
}

/**
 * Lists all public maps owned by another user.
 *
 * @param userId - The owner user id.
 * @returns The public maps belonging to that user.
 */
export async function listOtherUserMaps(userId: number): Promise<MapSummary[]> {
  const { data } = await client.get<MapSummary[]>(`/maps/other/${userId}`);
  return data;
}

/**
 * Fetches a public map of another user.
 *
 * @param userId - The owner user id.
 * @param mapId - The map id.
 * @returns The detailed public map.
 */
export async function getOtherUserMap(userId: number, mapId: number): Promise<MapDetail> {
  const { data } = await client.get<MapDetail>(`/maps/other/${userId}/${mapId}`);
  return data;
}

/**
 * Fetches a POI inside a public map of another user.
 *
 * @param userId - The owner user id.
 * @param mapId - The map id.
 * @param poiId - The POI place id.
 * @returns The POI detail row.
 */
export async function getOtherUserMapPoi(
  userId: number,
  mapId: number,
  poiId: string,
): Promise<MapDetailPoi> {
  const { data } = await client.get<MapDetailPoi>(
    `/maps/other/${userId}/${mapId}/pois/${poiId}`,
  );
  return data;
}
