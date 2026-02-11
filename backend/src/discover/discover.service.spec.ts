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

  it('should return points of interest using smart discovery', async () => {
    const cityNameResponse = {
      data: {
        geonames: [{ name: 'Paris' }],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;

    const wikitext = `== See ==\n* {{see|name=Eiffel Tower|lat=48.8584|long=2.2945|content=Iconic tower.}}`;
    const wikivoyageResponse = {
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
      const _params: Record<string, any> = config?.params || {};

      if (url.includes('findNearbyPlaceNameJSON')) {
        return of(cityNameResponse);
      }

      if (url.includes('en.wikivoyage.org/w/api.php')) {
        return of(wikivoyageResponse);
      }

      return of({ data: {} });
    });

    const pois = await service.findNearbyPOIs(48.8584, 2.2945);
    expect(pois.length).toBeGreaterThan(0);
    expect(pois[0].name).toBe('Eiffel Tower');
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
      if (
        url.includes('en.wikivoyage.org/w/api.php') &&
        params.action === 'query' &&
        params.titles === 'Paris'
      ) {
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
