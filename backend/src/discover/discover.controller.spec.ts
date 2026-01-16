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

describe('DiscoverController', () => {
  let controller: DiscoverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscoverController],
    }).compile();

    controller = module.get<DiscoverController>(DiscoverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
