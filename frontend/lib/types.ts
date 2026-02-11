// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

export interface POI {
  id?: string;
  place_id: string;
  name: string;
  type: string;
  rating?: number;
  user_ratings_total?: number;
  distance: number;
  lat: number | string;
  lng: number | string;
  address?: string;
  thumbnail: string | null;
  wikipediaUrl?: string | null;
  wikivoyageUrl?: string | null;
  officialWebsite?: string | null;
  phoneNumber?: string | null;
  description?: string | null;
}

export interface Map {
  id: number;
  title: string;
  icon: string | null;
  description: string | null;
  isPublic: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  pois?: POI[];
}
