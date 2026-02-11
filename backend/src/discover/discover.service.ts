// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface EnrichedWikiData {
  description: string | null;
  wikipediaUrl: string | null;
  wikivoyageUrl: string | null;
  website?: string | null;
  phoneNumber?: string | null;
}

export interface ProcessedPOI {
  place_id: string;
  name: string;
  type: string;
  rating?: number;
  user_ratings_total?: number;
  distance: number;
  lat: number;
  lng: number;
  address?: string;
  thumbnail: string | null;
  wikipediaUrl: string | null;
  wikivoyageUrl: string | null;
  officialWebsite: string | null;
  phoneNumber: string | null;
  description: string | null;
}

interface GeoNamesWikiResult {
  name: string;
  toponymName?: string;
  fcodeName?: string;
  fcl?: string;
  lat: number;
  lng: number;
  wikipediaURL?: string;
  alternateNames?: { name: string; lang: string }[];
  distance?: string;
  rank?: number;
}

interface GeoNamesResponse {
  geonames?: GeoNamesWikiResult[];
  status?: { message: string; value: number };
}

@Injectable()
export class DiscoverService {
  private readonly logger = new Logger(DiscoverService.name);
  private readonly GEONAMES_API_URL = 'http://api.geonames.org';
  private readonly username: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.username = this.configService.get<string>('GEONAMES_USERNAME') || 'demo';
  }

  async findNearbyPOIs(lat: number, lng: number, radius = 5, q?: string): Promise<ProcessedPOI[]> {
    try {
      let rawResults: GeoNamesWikiResult[] = [];
      if (q) {
        rawResults = await this.fetchGeoNamesSearch(q);
      } else {
        rawResults = await this.fetchGeoNamesNearby(lat, lng, radius);
      }
      const filtered = rawResults.filter(item => this.isValidTouristPOI(item));
      filtered.sort((a, b) => {
        const hasWikiA = this.hasWikipedia(a);
        const hasWikiB = this.hasWikipedia(b);
        if (hasWikiA && !hasWikiB) {
          return -1;
        }
        if (!hasWikiA && hasWikiB) {
          return 1;
        }
        const distA = parseFloat(a.distance || '0');
        const distB = parseFloat(b.distance || '0');
        return distA - distB;
      });
      const top20 = filtered.slice(0, 20);
      return top20.map(item => this.mapGeoNamesToPOI(item, lat, lng));
    } catch (error) {
      this.logger.error(`Discover Service Error:`, error);
      throw new HttpException('Failed to fetch nearby places', HttpStatus.BAD_GATEWAY);
    }
  }

  async getPOIDetails(
    _place_id: string,
    _name: string | undefined,
    _lat: number,
    _lng: number,
  ): Promise<EnrichedWikiData> {
    return Promise.resolve({
      description: null,
      wikipediaUrl: null,
      wikivoyageUrl: null,
      website: null,
      phoneNumber: null,
    });
  }

  private async fetchGeoNamesNearby(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<GeoNamesWikiResult[]> {
    try {
      const safeRadius = Math.min(radiusKm, 20);
      const { data } = await firstValueFrom(
        this.httpService.get<GeoNamesResponse>(`${this.GEONAMES_API_URL}/findNearbyJSON`, {
          params: {
            lat,
            lng,
            radius: safeRadius,
            maxRows: 100,
            username: this.username,
            style: 'FULL',
            localCountry: 'true',
          },
        }),
      );
      if (data.status) {
        this.logger.warn(`GeoNames Error: ${data.status.message}`);
        return [];
      }
      return data.geonames || [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error('GeoNames Nearby Error', msg);
      return [];
    }
  }

  private async fetchGeoNamesSearch(q: string): Promise<GeoNamesWikiResult[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<GeoNamesResponse>(`${this.GEONAMES_API_URL}/searchJSON`, {
          params: {
            q,
            maxRows: 50,
            username: this.username,
            style: 'FULL',
          },
        }),
      );
      if (data.status) {
        this.logger.warn(`GeoNames Search Error: ${data.status.message}`);
        return [];
      }
      return data.geonames || [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error('GeoNames Search Error', msg);
      return [];
    }
  }

  private isValidTouristPOI(item: GeoNamesWikiResult): boolean {
    const fcl = item.fcl || '';
    const name = item.name || '';
    if (fcl === 'A') {
      return false;
    }
    if (name.includes('(') || name.includes(')')) {
      return false;
    }
    return true;
  }

  private hasWikipedia(item: GeoNamesWikiResult): boolean {
    if (item.wikipediaURL) {
      return true;
    }
    if (
      item.alternateNames &&
      item.alternateNames.some(n => n.lang === 'link' && n.name.includes('wikipedia.org'))
    ) {
      return true;
    }
    return false;
  }

  private mapGeoNamesToPOI(
    item: GeoNamesWikiResult,
    userLat: number,
    userLng: number,
  ): ProcessedPOI {
    const dist = item.distance
      ? parseFloat(item.distance)
      : this.calculateDistance(userLat, userLng, item.lat, item.lng);
    let wikiUrl = item.wikipediaURL || null;
    if (!wikiUrl && item.alternateNames) {
      const link = item.alternateNames.find(
        n => n.lang === 'link' && n.name.includes('wikipedia.org'),
      );
      if (link) {
        wikiUrl = link.name;
      }
    }
    if (wikiUrl && !wikiUrl.startsWith('http')) {
      wikiUrl = 'https://' + wikiUrl;
    }
    return {
      place_id: `geo-${item.toponymName || item.name}`,
      name: item.name,
      type: item.fcodeName || 'Attraction',
      rating: 4.0,
      user_ratings_total: 0,
      distance: dist,
      lat: item.lat,
      lng: item.lng,
      address: '',
      thumbnail: null,
      wikipediaUrl: wikiUrl,
      wikivoyageUrl: null,
      officialWebsite: null,
      phoneNumber: null,
      description: null,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return 0;
    }
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
