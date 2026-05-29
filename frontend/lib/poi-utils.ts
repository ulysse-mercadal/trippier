// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { POI } from './types';

export function isPoiEqual(
  poi1: Pick<POI, 'place_id' | 'id' | 'lat' | 'lng'>,
  poi2: Pick<POI, 'place_id' | 'id' | 'lat' | 'lng'>,
): boolean {
  const id1 = poi1.place_id || poi1.id;
  const id2 = poi2.place_id || poi2.id;
  if (id1 && id2) {
    return id1 === id2;
  }
  return (
    Math.abs(Number(poi1.lat) - Number(poi2.lat)) < 0.0001 &&
    Math.abs(Number(poi1.lng) - Number(poi2.lng)) < 0.0001
  );
}
