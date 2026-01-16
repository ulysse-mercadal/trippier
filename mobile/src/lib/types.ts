// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

export interface POI {
  place_id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  user_ratings_total?: number;
  distance: number;
  thumbnail?: string;
  description?: string;
  wikipediaUrl?: string;
  wikivoyageUrl?: string;
  officialWebsite?: string;
  phoneNumber?: string;
  types?: string[];
}
