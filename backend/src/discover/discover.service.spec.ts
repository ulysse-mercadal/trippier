// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { DiscoverService } from './discover.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse, AxiosRequestConfig } from 'axios';

describe('DiscoverService', () => {
  let service: DiscoverService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test_user'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoverService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
    service = module.get<DiscoverService>(DiscoverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return points of interest', async () => {
    const googleResponse = {
      data: {
        status: 'OK',
        results: [
          {
            place_id: '123',
            name: 'Eiffel Tower',
            geometry: {
              location: { lat: 48.8584, lng: 2.2945 },
            },
            user_ratings_total: 1000,
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;

    const wikiGeoResponse = {
      data: {
        query: {
          geosearch: [{ title: 'Eiffel Tower', pageid: 1, dist: 10 }],
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;

    const wikiDetailsResponse = {
      data: {
        query: {
          pages: {
            '1': {
              pageid: 1,
              fullurl: 'https://en.wikipedia.org/wiki/Eiffel_Tower',
              extract: 'The Eiffel Tower is...',
            },
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;

    const openSearchResponse = {
      data: [
        'Eiffel Tower',
        ['Eiffel Tower'],
        [''],
        ['https://en.wikipedia.org/wiki/Eiffel_Tower'],
      ],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;

    const detailsResponse = {
      data: { result: { website: 'http://eiffel-tower.com' } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
    mockHttpService.get.mockImplementation((url: string, config?: AxiosRequestConfig) => {
      const params: Record<string, any> = config?.params || {};

      if (url.includes('maps.googleapis.com/maps/api/place/nearbysearch')) {
        return of(googleResponse);
      }

      if (url.includes('wikipedia.org/w/api.php') || url.includes('wikivoyage.org/w/api.php')) {
        if (params.action === 'opensearch') {
          return of(openSearchResponse);
        }

        if (params.list === 'geosearch') {
          return of(wikiGeoResponse);
        }

        if (
          params.action === 'query' &&
          (String(params.prop).includes('extracts') || String(params.prop).includes('info'))
        ) {
          return of(wikiDetailsResponse);
        }
      }

      if (url.includes('maps.googleapis.com/maps/api/place/details')) {
        return of(detailsResponse);
      }

      return of({ data: {} });
    });

    const pois = await service.findNearbyPOIs(48.8584, 2.2945);
    expect(pois[0].name).toBe('Eiffel Tower');
    expect(pois[0].wikipediaUrl).toBeNull();
    expect(mockHttpService.get).toHaveBeenCalled();
  });

  it('should perform smart discovery from Wikivoyage', async () => {
    const wikitext = `
      == See ==
      * {{see|name=Eiffel Tower|lat=48.8583|long=2.2945|content=A tall iron tower.}}
      * {{see|name=Louvre Museum|lat=48.8606|long=2.3376|content=A famous museum.}}
      == Buy ==
      * {{buy|name=Galeries Lafayette|lat=48.8737|long=2.3322|content=A big department store.}}
    `;

    const wikivoyageQueryResponse = {
      data: {
        query: {
          pages: {
            '1': {
              pageid: 1,
              title: 'Paris',
              revisions: [{ '*': wikitext }],
              coordinates: [{ lat: 48.8566, lon: 2.3522 }],
            },
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;

    mockHttpService.get.mockImplementation((url: string, config?: AxiosRequestConfig) => {
      const params: Record<string, any> = config?.params || {};
      if (url.includes('en.wikivoyage.org/w/api.php') && params.action === 'query' && params.titles === 'Paris') {
        return of(wikivoyageQueryResponse);
      }
      return of({ data: {} });
    });

    const results = await service.smartDiscovery('Paris', 'museum:10');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Louvre Museum'); // Should be first because of weight on museum
    expect(results.find(r => r.name === 'Galeries Lafayette')).toBeDefined();
  });
});
