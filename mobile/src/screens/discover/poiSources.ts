// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import type { EnrichedPoi, PoiProvider } from '../../api/pois';
import type { PoiSourceLink } from '../../navigation/types';

/**
 * Human-readable label for each provider, used by the "Sources" section.
 * Falls back to a capitalised version of the provider id when missing.
 */
export const PROVIDER_LABELS: Partial<Record<PoiProvider, string>> = {
  overpass: 'OpenStreetMap',
  wikivoyage: 'Wikivoyage',
  wikipedia: 'Wikipedia',
  wikipedia_events: 'Wikipedia',
  geonames: 'GeoNames',
  foursquare: 'Foursquare',
  here: 'Here',
  ticketmaster: 'Ticketmaster',
  eventbrite: 'Eventbrite',
  meetup: 'Meetup',
  openagenda: 'OpenAgenda',
};

/**
 * Returns the display label for a provider, defaulting to the provider id
 * with the first character upper-cased when no explicit label is registered.
 *
 * @param provider - Provider identifier returned by the API.
 * @returns A short human-readable label.
 */
export function providerLabel(provider: PoiProvider): string {
  return (
    PROVIDER_LABELS[provider] ??
    provider.charAt(0).toUpperCase() + provider.slice(1)
  );
}

/**
 * Extracts the list of back-to-source links from an EnrichedPoi by walking
 * its `providers_data` map. The primary source (first in `sources`) comes
 * first so the section's top link is the canonical one. Providers that did
 * not expose a `source_url` are silently dropped.
 *
 * @param poi - Enriched POI returned by `/pois/search`.
 * @returns An ordered list of source links suitable for the Sources section.
 */
export function buildSourceLinks(poi: EnrichedPoi): PoiSourceLink[] {
  const data = poi.providers_data ?? {};
  const seen = new Set<PoiProvider>();
  const links: PoiSourceLink[] = [];

  // Primary first so the top of the section matches `poi.sources[0]`.
  for (const provider of poi.sources) {
    if (seen.has(provider)) {
      continue;
    }
    const entry = data[provider];
    if (entry?.source_url) {
      links.push({ provider, url: entry.source_url });
      seen.add(provider);
    }
  }

  // Catch any provider present in providers_data but missing from sources
  // (defensive — the backend keeps them in sync, but a stale cache could not).
  for (const key of Object.keys(data) as PoiProvider[]) {
    if (seen.has(key)) {
      continue;
    }
    const entry = data[key];
    if (entry?.source_url) {
      links.push({ provider: key, url: entry.source_url });
      seen.add(key);
    }
  }

  return links;
}

/**
 * Returns the Wikidata ID associated with the POI, if any. Pulled from the
 * first provider entry that carries one (typically Wikipedia or Overpass).
 *
 * @param poi - Enriched POI returned by `/pois/search`.
 * @returns The Wikidata Q-id or undefined.
 */
export function extractWikidataId(poi: EnrichedPoi): string | undefined {
  const data = poi.providers_data;
  if (!data) {
    return undefined;
  }
  for (const entry of Object.values(data)) {
    if (entry?.wikidata_id) {
      return entry.wikidata_id;
    }
  }
  return undefined;
}
