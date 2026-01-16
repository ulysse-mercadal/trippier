// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface WikiResult {
  url: string;
  summary: string;
}

interface EnrichedWikiData {
  description: string | null;
  wikipediaUrl: string | null;
  wikivoyageUrl: string | null;
  website?: string | null;
  phoneNumber?: string | null;
}

interface GooglePlace {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
  formatted_address?: string;
  photos?: Array<{
    photo_reference: string;
  }>;
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

@Injectable()
export class DiscoverService {
  private readonly googleApiKey: string | undefined;
  private wikiCache = new Map<string, EnrichedWikiData>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.googleApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  async findNearbyPOIs(lat: number, lng: number, radius = 5, q?: string): Promise<ProcessedPOI[]> {
    if (!this.googleApiKey) {
      throw new HttpException(
        'Google Maps API Key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const radiusInMeters = Math.min(radius * 1000, 50000);
    const url = q
      ? `https://maps.googleapis.com/maps/api/place/textsearch/json`
      : `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<{ results: GooglePlace[]; status: string; error_message?: string }>(
          url,
          {
            params: {
              location: `${lat},${lng}`,
              radius: radiusInMeters,
              query: q,
              keyword: q,
              type: 'tourist_attraction',
              key: this.googleApiKey,
            },
          },
        ),
      );

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(response.data.error_message || response.data.status);
      }

      const results = response.data.results || [];
      results.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));

      const processedResults: ProcessedPOI[] = [];
      const itemsToProcess = results.slice(0, 15);

      for (const item of itemsToProcess) {
        const cacheKey = item.place_id;

        if (!this.wikiCache.has(cacheKey)) {
          const itemLat = item.geometry.location.lat;
          const itemLng = item.geometry.location.lng;

          const [wikiEN, voyEN, googleDetails] = await Promise.all([
            this.fetchWikipedia('en.wikipedia.org', item.name, itemLat, itemLng),
            this.fetchWikivoyage('en.wikivoyage.org', itemLat, itemLng),
            this.fetchPlaceDetails(item.place_id),
          ]);

          const enriched: EnrichedWikiData = {
            description: voyEN?.summary || wikiEN?.summary || null,
            wikipediaUrl: wikiEN?.url || null,
            wikivoyageUrl: voyEN?.url || null,
            website: googleDetails?.website || null,
            phoneNumber:
              googleDetails?.formatted_phone_number ||
              googleDetails?.international_phone_number ||
              null,
          };
          this.wikiCache.set(cacheKey, enriched);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const extra = this.wikiCache.get(cacheKey) as EnrichedWikiData;
        processedResults.push({
          ...this.mapBasicInfo(item, lat, lng),
          wikipediaUrl: extra.wikipediaUrl,
          wikivoyageUrl: extra.wikivoyageUrl,
          officialWebsite: extra.website || null,
          phoneNumber: extra.phoneNumber || null,
          description: extra.description,
        });
      }

      return processedResults;
    } catch (_error) {
      throw new HttpException('Failed to fetch data', HttpStatus.BAD_GATEWAY);
    }
  }

  private mapBasicInfo(item: GooglePlace, userLat: number, userLng: number) {
    return {
      place_id: item.place_id,
      name: item.name,
      type: 'Tourist Attraction',
      rating: item.rating,
      user_ratings_total: item.user_ratings_total,
      distance: this.calculateDistance(
        userLat,
        userLng,
        item.geometry.location.lat,
        item.geometry.location.lng,
      ),
      lat: item.geometry.location.lat,
      lng: item.geometry.location.lng,
      address: item.formatted_address || item.vicinity,
      thumbnail: item.photos ? this.getPhotoUrl(item.photos[0].photo_reference) : null,
    };
  }

  private async fetchPlaceDetails(placeId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{
          result: {
            website?: string;
            formatted_phone_number?: string;
            international_phone_number?: string;
          };
        }>(`https://maps.googleapis.com/maps/api/place/details/json`, {
          params: {
            place_id: placeId,
            fields: 'website,formatted_phone_number,international_phone_number',
            key: this.googleApiKey,
          },
        }),
      );
      return response.data.result;
    } catch (_e) {
      return null;
    }
  }

  private async fetchWikipedia(
    domain: string,
    title: string,
    lat: number,
    lng: number,
  ): Promise<WikiResult | null> {
    try {
      const apiUrl = `https://${domain}/w/api.php`;
      const headers = { 'User-Agent': 'TrippierBot/1.0' };

      // Pass 1: Geographic search (1km)
      const geoResponse = await firstValueFrom(
        this.httpService.get<{
          query?: { geosearch: Array<{ title: string; pageid: number; dist: number }> };
        }>(apiUrl, {
          headers,
          params: {
            action: 'query',
            list: 'geosearch',
            gscoord: `${lat}|${lng}`,
            gsradius: 1000,
            gslimit: 10,
            format: 'json',
            origin: '*',
          },
        }),
      );

      // Pass 2: Title search (opensearch)
      const searchResponse = await firstValueFrom(
        this.httpService.get<[string, string[]]>(apiUrl, {
          headers,
          params: {
            action: 'opensearch',
            search: title,
            limit: 5,
            namespace: 0,
            format: 'json',
            origin: '*',
          },
        }),
      );

      const geoResults = geoResponse.data.query?.geosearch || [];
      const searchResults = searchResponse.data[1] || [];

      // Scoring
      const scores = new Map<string, { pageid?: number; score: number }>();
      const normalizedTitle = title.toLowerCase();

      // Score geo results
      geoResults.forEach((res, index) => {
        const score = 100 - index * 5; // Base points for being nearby
        scores.set(res.title, { pageid: res.pageid, score });
      });

      // Score search results
      searchResults.forEach((resTitle, index) => {
        const existing = scores.get(resTitle);
        let score = (existing?.score || 0) + (50 - index * 10);

        // Bonus for name matching
        const resTitleLower = resTitle.toLowerCase();
        if (resTitleLower === normalizedTitle) {
          score += 150;
        } else if (
          resTitleLower.includes(normalizedTitle) ||
          normalizedTitle.includes(resTitleLower)
        ) {
          score += 70;
        }

        // Cross-match bonus
        if (existing) {
          score += 200;
        }

        scores.set(resTitle, { pageid: existing?.pageid, score });
      });

      // Find best match
      let bestTitle: string | null = null;
      let maxScore = -1;

      for (const [resTitle, data] of scores.entries()) {
        if (data.score > maxScore) {
          maxScore = data.score;
          bestTitle = resTitle;
        }
      }

      if (bestTitle && maxScore > 30) {
        const bestData = scores.get(bestTitle)!;
        const detailsResponse = await firstValueFrom(
          this.httpService.get<{
            query: { pages: Record<string, { fullurl: string; extract?: string }> };
          }>(apiUrl, {
            headers,
            params: {
              action: 'query',
              prop: 'extracts|info',
              exintro: true,
              explaintext: true,
              inprop: 'url',
              [bestData.pageid ? 'pageids' : 'titles']: bestData.pageid || bestTitle,
              format: 'json',
              origin: '*',
            },
          }),
        );

        const pagesData = detailsResponse.data.query.pages;
        const pageData = pagesData[Object.keys(pagesData)[0]];

        if (pageData && !('missing' in pageData)) {
          return {
            url: pageData.fullurl,
            summary: pageData.extract ? pageData.extract.split('\n')[0] : '',
          };
        }
      }
    } catch (_e) {
      return null;
    }
    return null;
  }

  private async fetchWikivoyage(
    domain: string,
    lat: number,
    lng: number,
  ): Promise<WikiResult | null> {
    try {
      const apiUrl = `https://${domain}/w/api.php`;
      const headers = { 'User-Agent': 'TrippierBot/1.0' };

      // Purely geographic for Wikivoyage (Zone article)
      const geoResponse = await firstValueFrom(
        this.httpService.get<{ query?: { geosearch: Array<{ title: string; pageid: number }> } }>(
          apiUrl,
          {
            headers,
            params: {
              action: 'query',
              list: 'geosearch',
              gscoord: `${lat}|${lng}`,
              gsradius: 5000,
              gslimit: 1,
              format: 'json',
              origin: '*',
            },
          },
        ),
      );

      const page = geoResponse.data.query?.geosearch?.[0];

      if (page) {
        const detailsResponse = await firstValueFrom(
          this.httpService.get<{
            query: { pages: Record<string, { fullurl: string; extract?: string }> };
          }>(apiUrl, {
            headers,
            params: {
              action: 'query',
              prop: 'extracts|info',
              exintro: true,
              explaintext: true,
              inprop: 'url',
              pageids: page.pageid,
              format: 'json',
              origin: '*',
            },
          }),
        );

        const pagesData = detailsResponse.data.query.pages;
        const pageData = pagesData[Object.keys(pagesData)[0]];

        if (pageData && !('missing' in pageData)) {
          return {
            url: pageData.fullurl,
            summary: pageData.extract ? pageData.extract.split('\n')[0] : '',
          };
        }
      }
    } catch (_e) {
      return null;
    }
    return null;
  }

  private getPhotoUrl(reference: string) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${reference}&key=${this.googleApiKey}`;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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
