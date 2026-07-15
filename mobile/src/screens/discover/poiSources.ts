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
 * its `sources` array (each entry now carries its provider + canonical URL
 * directly — no more `providers_data` map to consult). Order is preserved so
 * the primary source stays first. Entries without a URL are silently dropped.
 *
 * @param poi - Enriched POI returned by `/v1/pois/search`.
 * @returns An ordered list of source links suitable for the Sources section.
 */
export function buildSourceLinks(poi: EnrichedPoi): PoiSourceLink[] {
  if (!poi.sources) {
    return [];
  }
  const seen = new Set<PoiProvider>();
  const links: PoiSourceLink[] = [];
  for (const src of poi.sources) {
    if (!src?.url || seen.has(src.provider)) {
      continue;
    }
    links.push({ provider: src.provider, url: src.url });
    seen.add(src.provider);
  }
  return links;
}

/**
 * Returns the Wikidata ID associated with the POI.
 *
 * The current `/v1/pois/search` schema does not surface `wikidata_id` at the
 * `EnrichedPoi` top level — it lived inside the removed `providers_data`
 * map. Until the backend exposes it again this helper always returns
 * undefined; the consumer (SourcesSection) skips the Wikidata link when
 * absent.
 *
 * @param _poi - Enriched POI (kept in the signature so reintroducing the
 *               field later is a one-line change).
 * @returns Always undefined for now.
 */
export function extractWikidataId(_poi: EnrichedPoi): string | undefined {
  return undefined;
}
