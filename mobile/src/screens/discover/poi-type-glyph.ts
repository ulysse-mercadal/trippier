// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import type { ComponentType } from 'react';
import {
  Calendar,
  Coffee,
  Compass,
  MapPin,
  Moon,
  Star,
  Wallet,
  type IconProps,
} from '../../components/icons';
import type { PoiType } from '../../api/pois';

/**
 * Discreet single-character glyph painted on the pin core for each POI
 * category. Kept to one printable Unicode character (no emoji) so the
 * MapTiler default font ships the glyph and the SymbolLayer stays light.
 *
 * Mapping rationale:
 * - `see` uses a star to evoke sights / landmarks.
 * - `eat` / `drink` use letters because there is no widespread one-char
 *   utensil glyph in the bundled font.
 * - `do` uses a forward-triangle (play / activity).
 * - `buy` uses a dollar sign (universal commerce signal).
 * - `sleep` uses Z for the classic "zzz" sleep shorthand.
 * - `event` uses a music note as a stand-in for cultural events.
 *
 * @param type - POI category as returned by the public API.
 * @returns A single-character glyph (or an empty string for generic POIs
 *   where a plain dot reads better than a placeholder letter).
 */
export function glyphForPoiType(type: PoiType): string {
  switch (type) {
    case 'see':
      return '★';
    case 'eat':
      return 'F';
    case 'drink':
      return 'D';
    case 'do':
      return '▶';
    case 'buy':
      return '$';
    case 'sleep':
      return 'Z';
    case 'event':
      return '♪';
    case 'generic':
    default:
      return '';
  }
}

/**
 * React-Native icon component used to depict the same POI category on the
 * drawer row thumb. Stays visually aligned with {@link glyphForPoiType} so
 * a user who learns the map pin meanings sees the same metaphor in the list.
 *
 * @param type - POI category.
 * @returns A lucide-style icon component accepting the standard {@link IconProps}.
 */
export function iconForPoiType(type: PoiType): ComponentType<IconProps> {
  switch (type) {
    case 'see':
      return Star;
    case 'eat':
    case 'drink':
      return Coffee;
    case 'do':
      return Compass;
    case 'buy':
      return Wallet;
    case 'sleep':
      return Moon;
    case 'event':
      return Calendar;
    case 'generic':
    default:
      return MapPin;
  }
}
