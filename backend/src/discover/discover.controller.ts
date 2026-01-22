// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { GetNearbyDto } from './dto/get-nearby.dto';
import { GetDetailsDto } from './dto/get-details.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('discover')
@Controller('discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @ApiOperation({ summary: 'Find nearby POIs' })
  @ApiResponse({ status: 200, description: 'List of nearby POIs.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @Get('nearby')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getNearby(@Query() query: GetNearbyDto) {
    return this.discoverService.findNearbyPOIs(query.lat, query.lng, query.radius, query.q);
  }

  @ApiOperation({ summary: 'Get POI details' })
  @ApiResponse({ status: 200, description: 'POI details.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @Get('details')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getDetails(@Query() query: GetDetailsDto) {
    return this.discoverService.getPOIDetails(query.place_id, query.name, query.lat, query.lng);
  }
}
