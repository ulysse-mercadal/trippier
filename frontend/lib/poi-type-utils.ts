// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { IconType } from 'react-icons';
import {
  MdMuseum,
  MdDirectionsRun,
  MdRestaurant,
  MdLocalBar,
  MdShoppingBag,
  MdHotel,
  MdLocationOn,
} from 'react-icons/md';

export interface PoiTypeInfo {
  label: string;
  Icon: IconType;
}

const TYPE_MAP: Record<string, PoiTypeInfo> = {
  see: { label: 'Sightseeing', Icon: MdMuseum },
  do: { label: 'Activity', Icon: MdDirectionsRun },
  eat: { label: 'Restaurant', Icon: MdRestaurant },
  drink: { label: 'Bar & Drinks', Icon: MdLocalBar },
  buy: { label: 'Shopping', Icon: MdShoppingBag },
  sleep: { label: 'Accommodation', Icon: MdHotel },
  listing: { label: 'Place', Icon: MdLocationOn },
};

export function getPoiTypeInfo(type: string): PoiTypeInfo {
  return TYPE_MAP[type.toLowerCase()] ?? TYPE_MAP['listing'];
}
