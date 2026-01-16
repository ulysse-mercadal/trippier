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

@Injectable()
export class DiscoverService {
  private readonly googleApiKey: string | undefined;
  private wikiCache = new Map<string, EnrichedWikiData>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.googleApiKey = this.configService.get<string>('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
  }

  async findNearbyPOIs(lat: number, lng: number, radius = 5, q?: string) {
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

      const processedResults = await Promise.all(
        results.slice(0, 15).map(async item => {
          const cacheKey = item.place_id;

          if (!this.wikiCache.has(cacheKey)) {
            const itemLat = item.geometry.location.lat;
            const itemLng = item.geometry.location.lng;

            const [wikiFR, wikiEN, voyEN, googleDetails] = await Promise.all([
              this.fetchWikiData('fr.wikipedia.org', item.name, itemLat, itemLng),
              this.fetchWikiData('en.wikipedia.org', item.name, itemLat, itemLng),
              this.fetchWikiData('en.wikivoyage.org', item.name, itemLat, itemLng, true),
              this.fetchPlaceDetails(item.place_id),
            ]);

            this.wikiCache.set(cacheKey, {
              description: voyEN?.summary || wikiFR?.summary || wikiEN?.summary || null,
              wikipediaUrl: wikiFR?.url || wikiEN?.url || null,
              wikivoyageUrl: voyEN?.url || null,
              website: googleDetails?.website || null,
              phoneNumber:
                googleDetails?.formatted_phone_number ||
                googleDetails?.international_phone_number ||
                null,
            });
          }

          const extra = this.wikiCache.get(cacheKey) as EnrichedWikiData;
          return {
            ...this.mapBasicInfo(item, lat, lng),
            wikipediaUrl: extra.wikipediaUrl,
            wikivoyageUrl: extra.wikivoyageUrl,
            officialWebsite: extra.website,
            phoneNumber: extra.phoneNumber,
            description: extra.description,
          };
        }),
      );

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

  private async fetchWikiData(
    domain: string,
    title: string,
    lat: number,
    lng: number,
    isVoyage = false,
  ): Promise<WikiResult | null> {
    try {
      const apiUrl = `https://${domain}/w/api.php`;
      const headers = { 'User-Agent': 'TrippierBot/1.0' };

      // 1. Try search by coords (Best for international places with nested articles)
      const geoResponse = await firstValueFrom(
        this.httpService.get<{ query?: { geosearch: Array<{ title: string; pageid: number }> } }>(
          apiUrl,
          {
            headers,
            params: {
              action: 'query',
              list: 'geosearch',
              gscoord: `${lat}|${lng}`,
              gsradius: isVoyage ? 5000 : 1000, // Large radius for Wikivoyage (cities/districts)
              gslimit: 5,
              format: 'json',
              origin: '*',
            },
          },
        ),
      );

      let pages = geoResponse.data.query?.geosearch || [];

      // 2. Try search by title if no coords match
      if (pages.length === 0) {
        const searchResponse = await firstValueFrom(
          this.httpService.get<[string, string[]]>(apiUrl, {
            headers,
            params: {
              action: 'opensearch',
              search: title,
              limit: 1,
              namespace: 0,
              format: 'json',
              origin: '*',
            },
          }),
        );
        const bestTitle = searchResponse.data[1]?.[0];
        if (bestTitle) {
          pages = [{ title: bestTitle, pageid: 0 }]; // pageid will be solved by titles param
        }
      }

      if (pages.length > 0) {
        // Match logic: Prefer title that contains our place name or vice versa
        const bestPage =
          pages.find(
            p =>
              title.toLowerCase().includes(p.title.toLowerCase()) ||
              p.title.toLowerCase().includes(title.toLowerCase()),
          ) || pages[0];

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
              [bestPage.pageid ? 'pageids' : 'titles']: bestPage.pageid || bestPage.title,
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
