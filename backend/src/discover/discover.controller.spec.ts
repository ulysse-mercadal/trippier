// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { Test, TestingModule } from '@nestjs/testing';
import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';

describe('DiscoverController', () => {
  let controller: DiscoverController;

  const mockDiscoverService = {
    findNearbyPOIs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscoverController],
      providers: [
        {
          provide: DiscoverService,
          useValue: mockDiscoverService,
        },
      ],
    }).compile();

    controller = module.get<DiscoverController>(DiscoverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
