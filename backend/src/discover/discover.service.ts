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
  wikivoyageUrl: string | null;
  website?: string | null;
  phoneNumber?: string | null;
  lat?: number;
  lng?: number;
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

  async findNearbyPOIs(lat: number, lng: number, radius = 5, q?: string, weights?: string): Promise<ProcessedPOI[]> {
    try {
      const city = q || await this.resolveWikivoyageZone(lat, lng);
      this.logger.debug(`Resolved Wikivoyage zone for ${lat},${lng}: ${city}`);
      
      if (city) {
        let finalWeights = weights || '';
        if (q) {
          finalWeights = finalWeights ? `${finalWeights},${q}:20` : `${q}:20`;
        }
        try {
          return await this.smartDiscovery(city, finalWeights);
        } catch (e) {
          this.logger.warn(`Smart discovery failed for zone ${city}, falling back: ${e.message}`);
        }
      }

      const rawResults = await this.fetchGeoNamesNearby(lat, lng, radius);
      const filtered = rawResults.filter(item => this.isValidTouristPOI(item));
      filtered.sort((a, b) => {
        const distA = parseFloat(a.distance || '0');
        const distB = parseFloat(b.distance || '0');
        return distA - distB;
      });
      const top20 = filtered.slice(0, 20);
      return top20.map(item => this.mapGeoNamesToPOI(item, lat, lng));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Discover Service Error:`, error);
      throw new HttpException(
        `Failed to fetch nearby places: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private async resolveWikivoyageZone(lat: number, lng: number): Promise<string | null> {
    const apiUrl = 'https://en.wikivoyage.org/w/api.php';
    const headers = { 'User-Agent': 'TrippierBot/1.0' };

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers,
          params: {
            action: 'query',
            list: 'geosearch',
            gscoord: `${lat}|${lng}`,
            gsradius: 10000,
            gslimit: 1,
            format: 'json',
            origin: '*',
          },
        }),
      );

      const nearestPage = data.query?.geosearch?.[0];
      return nearestPage ? nearestPage.title : null;
    } catch (e) {
      this.logger.error(`Wikivoyage zone resolution error: ${e.message}`);
      return null;
    }
  }

  async smartDiscovery(city: string, weightsStr?: string): Promise<ProcessedPOI[]> {
    try {
      const pageData = await this.fetchWikivoyageWikitext(city);
      if (!pageData) {
        throw new HttpException('City not found on Wikivoyage', HttpStatus.NOT_FOUND);
      }

      const { wikitext, title, lat: cityLat, lon: cityLon } = pageData;
      return await this.processSmartDiscovery(wikitext, title, cityLat || 0, cityLon || 0, weightsStr);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to perform smart discovery: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async processSmartDiscovery(
    wikitext: string, 
    title: string, 
    cityLat: number, 
    cityLon: number, 
    weightsStr?: string
  ): Promise<ProcessedPOI[]> {
    const weights = this.parseWeights(weightsStr);
    const listings = this.parseWikivoyageListings(wikitext, title);
    const hasActiveWeights = Object.keys(weights).length > 0;

    const poiMap = new Map<string, any>();
    listings.forEach(listing => {
      const nameKey = listing.name.trim().toLowerCase();
      if (!poiMap.has(nameKey)) {
        poiMap.set(nameKey, listing);
      }
    });

    const uniqueListings = Array.from(poiMap.values());
    const results: ProcessedPOI[] = [];

    for (const listing of uniqueListings) {
      let score = 0;
      const nameLower = listing.name.toLowerCase();
      const descLower = (listing.content || listing.description || '').toLowerCase();
      const typeLower = listing.type.toLowerCase();

      if (hasActiveWeights) {
        for (const [category, weight] of Object.entries(weights)) {
          const catLower = category.toLowerCase();
          let match = false;

          if (typeLower === catLower) match = true;
          if (nameLower.includes(catLower) || descLower.includes(catLower)) match = true;
          
          if (catLower === 'shopping' && (typeLower === 'buy' || descLower.includes('shop') || descLower.includes('mall'))) match = true;
          if (catLower === 'nature' && (descLower.includes('park') || descLower.includes('nature') || descLower.includes('garden') || descLower.includes('forest'))) match = true;
          if (catLower === 'culture' && (typeLower === 'see' || nameLower.includes('museum') || descLower.includes('museum') || descLower.includes('gallery') || descLower.includes('art'))) match = true;
          if (catLower === 'food' && (typeLower === 'eat' || descLower.includes('restaurant') || descLower.includes('cafe'))) match = true;
          if (catLower === 'nightlife' && (typeLower === 'drink' || descLower.includes('bar') || descLower.includes('club') || descLower.includes('pub'))) match = true;
          if (catLower === 'activities' && typeLower === 'do') match = true;
          if (catLower === 'monument' && (nameLower.includes('monument') || nameLower.includes('statue') || descLower.includes('historic'))) match = true;

          if (match) score += weight;
        }

        if (score <= 0) continue;
      }

      const poiLat = listing.lat || cityLat || 0;
      const poiLng = listing.lng || cityLon || 0;

      results.push({
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
        wikivoyageUrl: `https://en.wikivoyage.org/wiki/${encodeURIComponent(title)}#${encodeURIComponent(listing.name.replace(/ /g, '_'))}`,
        officialWebsite: listing.url || null,
        phoneNumber: listing.phone || null,
        description: listing.content || null,
      });
    }

    return results;
  }

  async getPOIDetails(
    place_id: string,
    name: string | undefined,
    lat: number,
    lng: number,
  ): Promise<EnrichedWikiData> {
    const resolvedName = name || '';
    
    let refinedLat = lat;
    let refinedLng = lng;

    if (resolvedName) {
      const overpassResult = await this.fetchCoordsFromOverpass([resolvedName], lat, lng);
      const match = overpassResult[resolvedName.toLowerCase()];
      if (match) {
        refinedLat = match.lat;
        refinedLng = match.lng;
      }
    }

    return {
      description: null,
      wikivoyageUrl: null,
      website: null,
      phoneNumber: null,
      lat: refinedLat,
      lng: refinedLng,
    };
  }

  private async fetchCoordsFromOverpass(names: string[], lat: number, lng: number): Promise<Record<string, {lat: number, lng: number}>> {
    const coords: Record<string, {lat: number, lng: number}> = {};
    if (names.length === 0) return coords;

    try {
      const namesRegex = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const query = `[out:json][timeout:25];
        (
          node["name"~"^(${namesRegex})$",i](around:15000,${lat},${lng});
          way["name"~"^(${namesRegex})$",i](around:15000,${lat},${lng});
          rel["name"~"^(${namesRegex})$",i](around:15000,${lat},${lng});
        );
        out center;`;

      const response = await firstValueFrom(
        this.httpService.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );

      if (response.data && response.data.elements) {
        response.data.elements.forEach((el: any) => {
          const name = el.tags?.name?.toLowerCase();
          const pLat = el.lat || el.center?.lat;
          const pLng = el.lon || el.center?.lon;
          if (name && pLat && pLng && !coords[name]) {
            coords[name] = { lat: pLat, lng: pLng };
          }
        });
      }
    } catch (e) {
      this.logger.warn(`Overpass geocoding failed: ${e.message}`);
    }
    return coords;
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

  private async fetchWikivoyageWikitext(title: string): Promise<{ wikitext: string; title: string; lat?: number; lon?: number } | null> {
    const apiUrl = 'https://en.wikivoyage.org/w/api.php';
    const headers = { 'User-Agent': 'TrippierBot/1.0' };

    try {
      const searchRes = await firstValueFrom(
        this.httpService.get(apiUrl, {
          headers,
          params: {
            action: 'query',
            titles: title,
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
      const coords = page.coordinates?.[0];

      return {
        wikitext,
        title: page.title,
        lat: coords?.lat,
        lon: coords?.lon,
      };
    } catch (_e) {
      return null;
    }
  }

  private parseWikivoyageListings(wikitext: string, pageTitle: string): any[] {
    const listings: any[] = [];
    const templateRegex = /\{\{/g;
    let match: RegExpExecArray | null;
    
    while ((match = templateRegex.exec(wikitext)) !== null) {
      const start = match.index;
      let depth = 0;
      let end = -1;
      
      for (let i = start; i < wikitext.length - 1; i++) {
        if (wikitext[i] === '{' && wikitext[i+1] === '{') {
          depth++;
          i++;
        } else if (wikitext[i] === '}' && wikitext[i+1] === '}') {
          depth--;
          i++;
          if (depth === 0) {
            end = i + 1;
            break;
          }
        }
      }
      
      if (end === -1) continue;
      
      const content = wikitext.substring(start, end);
      const nameMatch = content.match(/^\{\{\s*(see|do|buy|eat|drink|sleep|listing)\s*\|/i);
      
      if (nameMatch) {
        const type = nameMatch[1].toLowerCase();
        const paramsStr = content.substring(nameMatch[0].length, content.length - 2);
        const params = this.parseTemplateParams(paramsStr);
        
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
      templateRegex.lastIndex = end;
    }
    return listings;
  }

  private parseTemplateParams(paramsStr: string): Record<string, string> {
    const params: Record<string, string> = {};
    let currentKey = '';
    let currentValue = '';
    let depth = 0;
    let inLink = 0;
    let inEqual = false;
    let unnamedCount = 1;

    let i = 0;
    while (i < paramsStr.length) {
      const char = paramsStr[i];
      const nextChar = paramsStr[i+1];

      if (char === '{' && nextChar === '{') { depth++; i++; currentValue += '{{'; }
      else if (char === '}' && nextChar === '}') { depth--; i++; currentValue += '}}'; }
      else if (char === '[' && nextChar === '[') { inLink++; i++; currentValue += '[['; }
      else if (char === ']' && nextChar === ']') { inLink--; i++; currentValue += ']]'; }
      else if (char === '|' && depth === 0 && inLink === 0) {
        this.saveParam(params, currentKey, currentValue, unnamedCount++);
        currentKey = '';
        currentValue = '';
        inEqual = false;
      }
      else if (char === '=' && depth === 0 && inLink === 0 && !inEqual) {
        currentKey = currentValue.trim();
        currentValue = '';
        inEqual = true;
      }
      else {
        currentValue += char;
      }
      i++;
    }
    this.saveParam(params, currentKey, currentValue, unnamedCount);
    return params;
  }

  private saveParam(params: Record<string, string>, key: string, value: string, unnamedIndex: number) {
    const cleanValue = value.trim();
    if (!cleanValue) return;
    
    if (key) {
      params[key.toLowerCase()] = cleanValue;
    } else {
      if (unnamedIndex === 1) {
        params['name'] = cleanValue;
      }
    }
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
    if (fcl === 'A') return false;
    if (name.includes('(') || name.includes(')')) return false;
    return true;
  }

  private mapGeoNamesToPOI(item: GeoNamesWikiResult, userLat: number, userLng: number): ProcessedPOI {
    const dist = item.distance ? parseFloat(item.distance) : this.calculateDistance(userLat, userLng, item.lat, item.lng);
    
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
      wikivoyageUrl: null,
      officialWebsite: null,
      phoneNumber: null,
      description: null,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
