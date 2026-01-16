// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { Test, TestingModule } from '@nestjs/testing';
import { DiscoverService } from './discover.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

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
    const result = {
      data: [{ name: 'Eiffel Tower', type: 'tourism' }],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    } as AxiosResponse;
    mockHttpService.get.mockReturnValue(of(result));
    const pois = await service.findNearbyPOIs(48.8584, 2.2945);
    expect(pois).toEqual([{ name: 'Eiffel Tower', type: 'tourism' }]);
    expect(mockHttpService.get).toHaveBeenCalled();
  });
});
