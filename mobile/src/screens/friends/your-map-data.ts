// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

/**
 * Compact trip card surfaced inside the "Your map" horizontal scroller.
 */
export interface CompactTripCard {
  id: string;
  title: string;
  meta: string;
}

/**
 * Public-map row surfaced inside the "Your public maps" grouped list.
 */
export interface PublicMap {
  id: string;
  name: string;
  meta: string;
}

/**
 * Stub trips rendered in the horizontal scroller of the Your map view.
 *
 * @returns The frozen list of mock compact trip cards.
 */
// data: stub for wave 4 — wire when backend ready
export function getMockTrips(): readonly CompactTripCard[] {
  return [
    { id: 't1', title: 'Lisbon weekender', meta: '3 days · 12 stops' },
    { id: 't2', title: 'Reykjavik aurora chase', meta: '5 days · 8 stops' },
    { id: 't3', title: 'Kyoto temples', meta: '4 days · 14 stops' },
  ];
}

/**
 * Stub public maps surfaced under the trips scroller.
 *
 * @returns The frozen list of mock public-map rows.
 */
// data: stub for wave 4 — wire when backend ready
export function getMockPublicMaps(): readonly PublicMap[] {
  return [
    { id: 'm1', name: 'Best coffee in BCN', meta: '23 places · 412 saves' },
    { id: 'm2', name: 'Hidden viewpoints', meta: '9 places · 87 saves' },
    { id: 'm3', name: 'Vegetarian Lisbon', meta: '14 places · 156 saves' },
  ];
}

export const MOCK_TRIPS: readonly CompactTripCard[] = getMockTrips();
export const MOCK_PUBLIC_MAPS: readonly PublicMap[] = getMockPublicMaps();
