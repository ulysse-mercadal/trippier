// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { MapsService } from './maps.service';
import { CreateMapDto } from './dto/create-map.dto';
import { UpdateMapDto } from './dto/update-map.dto';
import { AddPoiDto } from './dto/add-poi.dto';
import { UpdatePoiDto } from './dto/update-poi.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { Map } from '@prisma/client';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
  };
}

@ApiTags('maps')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new map (Owner only)' })
  async create(@Request() req: RequestWithUser, @Body() createMapDto: CreateMapDto) {
    return await this.mapsService.create(req.user.id, createMapDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all maps for the current user (Owner only)' })
  async findAll(
    @Request() req: RequestWithUser,
  ): Promise<
    Pick<
      Map,
      'id' | 'title' | 'icon' | 'description' | 'isPublic' | 'isVisible' | 'createdAt' | 'updatedAt'
    >[]
  > {
    return await this.mapsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific map details (Owner or Public)' })
  async findOne(@Request() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return await this.mapsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a map (Owner only)' })
  async update(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMapDto: UpdateMapDto,
  ) {
    return await this.mapsService.update(id, req.user.id, updateMapDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a map (Owner only)' })
  async remove(@Request() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return await this.mapsService.remove(id, req.user.id);
  }

  @Post(':id/pois')
  @ApiOperation({ summary: 'Add a POI to a map (Owner only)' })
  async addPoi(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() addPoiDto: AddPoiDto,
  ) {
    return await this.mapsService.addPoi(id, req.user.id, addPoiDto);
  }

  @Patch(':id/pois/:poiId')
  @ApiOperation({
    summary: 'Update a POI in a map (e.g. personal description) (Owner only)',
  })
  async updatePoi(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('poiId') poiId: string,
    @Body() updatePoiDto: UpdatePoiDto,
  ) {
    return await this.mapsService.updatePoi(id, poiId, req.user.id, updatePoiDto);
  }

  @Get(':id/pois/:poiId')
  @ApiOperation({
    summary: 'Get details of a specific POI in a map (Owner or Public)',
  })
  async getPoiDetails(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('poiId') poiId: string,
  ) {
    return await this.mapsService.findPoiDetails(id, poiId, req.user.id);
  }

  @Delete(':id/pois/:poiId')
  @ApiOperation({ summary: 'Remove a POI from a map (Owner only)' })
  async removePoi(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('poiId') poiId: string,
  ) {
    return await this.mapsService.removePoi(id, poiId, req.user.id);
  }
}
