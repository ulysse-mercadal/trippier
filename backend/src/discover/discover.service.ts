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

  async smartDiscovery(city: string, weightsStr?: string): Promise<ProcessedPOI[]> {
    try {
      const weights = this.parseWeights(weightsStr);
      const pageData = await this.fetchWikivoyageWikitext(city);
      if (!pageData) {
        throw new HttpException('City not found on Wikivoyage', HttpStatus.NOT_FOUND);
      }

      const { wikitext, title, lat: cityLat, lon: cityLon } = pageData;
      const listings = this.parseWikivoyageListings(wikitext, title);

      const processedPOIs: ProcessedPOI[] = listings.map(listing => {
        const poiLat = listing.lat || cityLat || 0;
        const poiLng = listing.lng || cityLon || 0;
        
        return {
          place_id: `wv-${Buffer.from(listing.name).toString('base64')}`,
          name: listing.name,
          type: listing.type,
          rating: 0,
          user_ratings_total: 0,
          distance: cityLat && cityLon ? this.calculateDistance(cityLat, cityLon, poiLat, poiLng) : 0,
          lat: poiLat,
          lng: poiLng,
          address: listing.address,
          thumbnail: null,
          wikipediaUrl: null,
          wikivoyageUrl: `https://en.wikivoyage.org/wiki/${encodeURIComponent(title)}#${encodeURIComponent(listing.name.replace(/ /g, '_'))}`,
          officialWebsite: listing.url || null,
          phoneNumber: listing.phone || null,
          description: listing.content || null,
        };
      });

      // Scoring and sorting
      const scoredPOIs = processedPOIs.map(poi => {
        let score = 0;
        const nameLower = poi.name.toLowerCase();
        const descLower = (poi.description || '').toLowerCase();
        const typeLower = poi.type.toLowerCase();

        for (const [category, weight] of Object.entries(weights)) {
          const catLower = category.toLowerCase();

          // direct type match (See, Do, Buy, Eat, Drink, Sleep)
          if (typeLower === catLower) {
            score += weight * 2;
          }

          // keyword match in name or description
          if (nameLower.includes(catLower) || descLower.includes(catLower)) {
            score += weight;
          }
          
          // Enhanced mapping for common user-friendly terms to Wikivoyage types/keywords
          if (catLower === 'shopping' && (typeLower === 'buy' || descLower.includes('shop') || descLower.includes('mall'))) score += weight;
          if (catLower === 'nature' && (descLower.includes('park') || descLower.includes('nature') || descLower.includes('garden') || descLower.includes('forest'))) score += weight;
          if (catLower === 'culture' && (typeLower === 'see' || nameLower.includes('museum') || descLower.includes('museum') || descLower.includes('gallery') || descLower.includes('art'))) score += weight;
          if (catLower === 'food' && (typeLower === 'eat' || descLower.includes('restaurant') || descLower.includes('cafe'))) score += weight;
          if (catLower === 'nightlife' && (typeLower === 'drink' || descLower.includes('bar') || descLower.includes('club') || descLower.includes('pub'))) score += weight;
          if (catLower === 'activities' && typeLower === 'do') score += weight;
          if (catLower === 'monument' && (nameLower.includes('monument') || nameLower.includes('statue') || descLower.includes('historic'))) score += weight;
        }
        return { poi, score };
      });

      scoredPOIs.sort((a, b) => b.score - a.score);

      return scoredPOIs.map(s => s.poi);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to perform smart discovery: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private parseWeights(weightsStr?: string): Record<string, number> {
    const weights: Record<string, number> = {};
    if (!weightsStr) return weights;

    const parts = weightsStr.split(',');
    for (const part of parts) {
      const [key, value] = part.split(':');
      if (key && value) {
        weights[key.trim()] = parseFloat(value.trim()) || 0;
      }
    }
    return weights;
  }

  private async fetchWikivoyageWikitext(city: string): Promise<{ wikitext: string; title: string; lat?: number; lon?: number } | null> {
    const apiUrl = 'https://en.wikivoyage.org/w/api.php';
    const headers = { 'User-Agent': 'TrippierBot/1.0' };

    try {
      // First, find the page title and basic info
      const searchRes = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers,
          params: {
            action: 'query',
            titles: city,
            prop: 'revisions|coordinates',
            rvprop: 'content',
            format: 'json',
            redirects: 1,
            origin: '*',
          },
        }),
      );

      const pages = searchRes.data.query?.pages;
      if (!pages) return null;

      const pageId = Object.keys(pages)[0];
      if (pageId === '-1') return null;

      const page = pages[pageId];
      const wikitext = page.revisions?.[0]?.['*'];
      const title = page.title;
      const coords = page.coordinates?.[0];

      return {
        wikitext,
        title,
        lat: coords?.lat,
        lon: coords?.lon,
      };
    } catch (_e) {
      return null;
    }
  }

  private parseWikivoyageListings(wikitext: string, pageTitle: string): any[] {
    const listings: any[] = [];
    // Regex to match {{see|...}}, {{do|...}}, etc.
    // This is a simplified regex, real wikitext can be complex with nested templates
    const listingRegex = /\{\{(see|do|buy|eat|drink|sleep|listing)\s*\|([^}]+)\}\}/gi;
    let match;

    while ((match = listingRegex.exec(wikitext)) !== null) {
      const type = match[1];
      const paramsStr = match[2];
      const params: Record<string, string> = {};

      // Parse parameters: name=Value | lat=...
      const paramParts = paramsStr.split('|');
      for (const part of paramParts) {
        const eqIndex = part.indexOf('=');
        if (eqIndex !== -1) {
          const key = part.substring(0, eqIndex).trim().toLowerCase();
          const value = part.substring(eqIndex + 1).trim();
          params[key] = value;
        } else if (part.trim()) {
          // Some templates have unnamed parameters, usually name is the first one
          if (!params['name']) {
            params['name'] = part.trim();
          }
        }
      }

      if (params['name']) {
        listings.push({
          type: type.charAt(0).toUpperCase() + type.slice(1),
          name: params['name'],
          alt: params['alt'],
          url: params['url'],
          address: params['address'],
          lat: params['lat'] ? parseFloat(params['lat']) : null,
          lng: (params['long'] || params['lon']) ? parseFloat(params['long'] || params['lon']) : null,
          phone: params['phone'],
          content: params['content'] || params['description'],
        });
      }
    }

    return listings;
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
