// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import type { PoiType, SlimPoi } from '../../api/pois';

/**
 * Default map center used for the very first render — Barcelona, Plaça de
 * Catalunya — picked because the v4 reference design ships with Barcelona
 * sample copy. As soon as the user moves the map, the visible bounds drive
 * the POI fetch, so this only matters on cold boot.
 */
export const DISCOVER_DEFAULT_CENTER = {
  lat: 41.3874,
  lng: 2.1686,
  city: 'Barcelona',
};

/**
 * Initial zoom level on cold boot. Picked so the user sees a neighbourhood
 * (~1.5 km across) rather than an entire region — enough context to drop
 * pins and still see the city skyline.
 */
export const DISCOVER_DEFAULT_ZOOM = 14;

/**
 * Chip filter offered above the POI list. Beyond the leading "For you" entry
 * (which sends no `types`, letting the public API merge everything), there is
 * one chip per public-API POI tag, so the filter row mirrors the `/v1/pois`
 * taxonomy 1:1 and each chip narrows the search to that single `type`.
 */
export interface DiscoverChip {
  id: 'for-you' | PoiType;
  label: string;
  types?: PoiType[];
}

export const DISCOVER_CHIPS: DiscoverChip[] = [
  { id: 'for-you', label: 'For you' },
  { id: 'see', label: 'See', types: ['see'] },
  { id: 'eat', label: 'Eat', types: ['eat'] },
  { id: 'drink', label: 'Drink', types: ['drink'] },
  { id: 'do', label: 'Do', types: ['do'] },
  { id: 'buy', label: 'Buy', types: ['buy'] },
  { id: 'sleep', label: 'Sleep', types: ['sleep'] },
];

/**
 * Composes the v4 meta line shown under a POI name in the drawer. The chip
 * label is appended for context only when it adds information — a single-type
 * chip (e.g. "Eat") already matches the POI type, so it is dropped to avoid a
 * redundant "Eat · Eat".
 *
 * @param poi - The slim POI returned by the API.
 * @param chipLabel - The label of the currently selected filter chip.
 * @returns A short caption — "{type}" or "{type} · {chip}".
 */
export function formatPoiMeta(poi: SlimPoi, chipLabel: string): string {
  const type = poi.type.charAt(0).toUpperCase() + poi.type.slice(1);
  if (chipLabel.toLowerCase() === poi.type.toLowerCase()) {
    return type;
  }
  return `${type} · ${chipLabel}`;
}

/** Maximum radius accepted by the public `/v1/pois/search` endpoint. */
export const API_MAX_RADIUS_M = 50_000;

/**
 * Floor under which a viewport-derived radius is clamped up.
 *
 * Past a certain zoom level the visible map covers a single block — querying
 * that tight a circle returns 1–2 POIs at best and leaves the drawer feeling
 * empty. Floor it to a neighbourhood-ish 800 m so the drawer always has
 * something to populate, even when the user is zoomed in tight.
 */
export const MIN_SEARCH_RADIUS_M = 800;

/**
 * Computes the great-circle distance between the NE and SW corners of the
 * viewport. Exposed so callers can detect "zoom is too far out" without
 * having to do trig themselves.
 *
 * @param neLat - Latitude of the north-east corner of the viewport.
 * @param neLng - Longitude of the north-east corner.
 * @param swLat - Latitude of the south-west corner.
 * @param swLng - Longitude of the south-west corner.
 * @returns Diagonal length in metres.
 */
export function diagonalFromBounds(
  neLat: number,
  neLng: number,
  swLat: number,
  swLng: number,
): number {
  const R = 6371000;
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(neLat - swLat);
  const dLng = toRad(neLng - swLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(swLat)) * Math.cos(toRad(neLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Computes a search radius from the map's visible diagonal so the API call
 * always covers the camera frame without over-fetching.
 *
 * @param neLat - Latitude of the north-east corner of the viewport.
 * @param neLng - Longitude of the north-east corner.
 * @param swLat - Latitude of the south-west corner.
 * @param swLng - Longitude of the south-west corner.
 * @returns Radius in metres, clamped between {@link MIN_SEARCH_RADIUS_M} and
 *   {@link API_MAX_RADIUS_M}.
 */
export function radiusFromBounds(
  neLat: number,
  neLng: number,
  swLat: number,
  swLng: number,
): number {
  const diag = diagonalFromBounds(neLat, neLng, swLat, swLng);
  return Math.max(
    MIN_SEARCH_RADIUS_M,
    Math.min(API_MAX_RADIUS_M, Math.round(diag / 2)),
  );
}

/**
 * Tests whether a coordinate falls inside the rectangular viewport
 * (`neLat`/`neLng`/`swLat`/`swLng`), with a soft margin so a pin sitting
 * exactly on the edge isn't culled by jitter from the camera-region debounce.
 *
 * Used to filter the rendered POI set down to what's actually on the screen
 * — the API result is anchored to the *last* fetch center, so without this
 * filter a slightly stale list would draw pins that visually belong to the
 * adjacent neighbourhood.
 *
 * @param lat - Coordinate latitude (degrees).
 * @param lng - Coordinate longitude (degrees).
 * @param neLat - Viewport north-east latitude.
 * @param neLng - Viewport north-east longitude.
 * @param swLat - Viewport south-west latitude.
 * @param swLng - Viewport south-west longitude.
 * @param marginRatio - Fraction of the viewport span treated as a soft
 *   inclusion margin (default `0.05` ≈ 5 % on each side).
 * @returns `true` when the point lies inside the (slightly inflated) viewport.
 */
export function isInBounds(
  lat: number,
  lng: number,
  neLat: number,
  neLng: number,
  swLat: number,
  swLng: number,
  marginRatio = 0.05,
): boolean {
  const latMargin = (neLat - swLat) * marginRatio;
  const lngMargin = (neLng - swLng) * marginRatio;
  return (
    lat >= swLat - latMargin &&
    lat <= neLat + latMargin &&
    lng >= swLng - lngMargin &&
    lng <= neLng + lngMargin
  );
}

/**
 * Detects when the viewport is too wide to be fully covered by the API's
 * 50 km radius cap. Past this point the search can only sample the center
 * of the screen, so the UI should nudge the user to zoom in.
 *
 * The threshold is the diagonal that would still be fully covered: `2 *
 * API_MAX_RADIUS_M` (a radius covers half the diagonal). We add a small
 * margin so the message doesn't flicker right at the edge.
 *
 * @param neLat - Latitude of the north-east corner of the viewport.
 * @param neLng - Longitude of the north-east corner.
 * @param swLat - Latitude of the south-west corner.
 * @param swLng - Longitude of the south-west corner.
 * @returns `true` when the viewport is wider than the API can cover.
 */
export function isZoomedTooFarOut(
  neLat: number,
  neLng: number,
  swLat: number,
  swLng: number,
): boolean {
  return diagonalFromBounds(neLat, neLng, swLat, swLng) > 2 * API_MAX_RADIUS_M * 1.1;
}
