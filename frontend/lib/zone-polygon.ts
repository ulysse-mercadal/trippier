// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

type PolygonFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

const cache = new Map<string, PolygonFeature | null>();

export async function fetchZonePolygon(query: string): Promise<PolygonFeature | null> {
  if (cache.has(query)) {
    return cache.get(query)!;
  }
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=geojson&polygon_geojson=1&limit=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'TrippierApp/1.0' } },
    );
    const data = await res.json();
    const feature = data.features?.[0] ?? null;
    const type = feature?.geometry?.type;
    const result: PolygonFeature | null =
      type === 'Polygon' || type === 'MultiPolygon' ? feature : null;
    cache.set(query, result);
    return result;
  } catch {
    cache.set(query, null);
    return null;
  }
}
