// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMapDto } from './dto/create-map.dto';
import { UpdateMapDto } from './dto/update-map.dto';
import { AddPoiDto } from './dto/add-poi.dto';
import { UpdatePoiDto } from './dto/update-poi.dto';
import { Map as PrismaMap, PointOfInterest } from '@prisma/client';

interface PrismaError {
  code?: string;
}

export interface PointOfInterestString extends Omit<PointOfInterest, 'lat' | 'lng'> {
  lat: string;
  lng: string;
  place_id: string;
  personalDescription?: string | null;
}

export interface MapWithPois extends Omit<PrismaMap, 'pois'> {
  pois: PointOfInterestString[];
}

interface RawPoi extends PointOfInterest {
  id: string;
  name: string;
  lat: number;
  lng: number;
  thumbnail: string | null;
}

interface RawMapPoi {
  personalDescription: string | null;
  poi: RawPoi;
}

@Injectable()
export class MapsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createMapDto: CreateMapDto): Promise<PrismaMap> {
    return await this.prisma.map.create({
      data: {
        ...createMapDto,
        userId,
      },
    });
  }

  async findAll(userId: number): Promise<
    (Pick<
      PrismaMap,
      'id' | 'title' | 'icon' | 'description' | 'isPublic' | 'isVisible' | 'createdAt' | 'updatedAt'
    > & {
      pois: {
        place_id: string;
        name: string;
        lat: number;
        lng: number;
        rating: number | null;
        user_ratings_total: number | null;
      }[];
    })[]
  > {
    const maps = await this.prisma.map.findMany({
      where: {
        userId,
      },
      orderBy: {
        title: 'asc',
      },
      select: {
        id: true,
        title: true,
        icon: true,
        description: true,
        isPublic: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
        pois: {
          select: {
            poi: {
              select: {
                id: true,
                name: true,
                lat: true,
                lng: true,
                rating: true,
                userRatingsTotal: true,
              },
            },
          },
        },
      },
    });
    return maps.map(map => ({
      ...map,
      pois: map.pois.map(p => ({
        place_id: p.poi.id,
        name: p.poi.name,
        lat: p.poi.lat,
        lng: p.poi.lng,
        rating: p.poi.rating,
        user_ratings_total: p.poi.userRatingsTotal,
      })),
    }));
  }

  async findUserPublicMaps(
    userId: number,
  ): Promise<
    Pick<
      PrismaMap,
      'id' | 'title' | 'icon' | 'description' | 'isPublic' | 'isVisible' | 'createdAt' | 'updatedAt'
    >[]
  > {
    return await this.prisma.map.findMany({
      where: {
        userId,
        isPublic: true,
        isVisible: true,
      },
      orderBy: {
        title: 'asc',
      },
      select: {
        id: true,
        title: true,
        icon: true,
        description: true,
        isPublic: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUserPublicMap(userId: number, mapId: number): Promise<MapWithPois> {
    const map = await this.prisma.map.findUnique({
      where: { id: mapId },
      include: {
        pois: {
          select: {
            personalDescription: true,
            poi: {
              select: {
                id: true,
                name: true,
                lat: true,
                lng: true,
                thumbnail: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!map) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }
    if (map.userId !== userId) {
      throw new NotFoundException(`Map with ID ${mapId} does not belong to user ${userId}`);
    }
    if (!map.isPublic || !map.isVisible) {
      throw new ForbiddenException('You do not have permission to view this map');
    }
    const rawMap = map as unknown as { pois: RawMapPoi[] };
    return {
      ...map,
      pois: rawMap.pois.map(mp => ({
        ...mp.poi,
        lat: String(mp.poi.lat),
        lng: String(mp.poi.lng),
        place_id: mp.poi.id,
        personalDescription: mp.personalDescription,
      })) as PointOfInterestString[],
    } as MapWithPois;
  }

  async findUserPublicMapPoiDetails(
    userId: number,
    mapId: number,
    poiId: string,
  ): Promise<PointOfInterestString> {
    const map = await this.prisma.map.findUnique({ where: { id: mapId } });
    if (!map) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }
    if (map.userId !== userId) {
      throw new NotFoundException(`Map with ID ${mapId} does not belong to user ${userId}`);
    }
    if (!map.isPublic || !map.isVisible) {
      throw new ForbiddenException('You do not have permission to view this map');
    }
    const mapPoi = await this.prisma.mapPoi.findUnique({
      where: {
        mapId_poiId: {
          mapId,
          poiId,
        },
      },
      include: {
        poi: true,
      },
    });
    if (!mapPoi) {
      throw new NotFoundException(`POI ${poiId} not found in map ${mapId}`);
    }
    const rawMapPoi = mapPoi as unknown as RawMapPoi;
    return {
      ...rawMapPoi.poi,
      lat: String(rawMapPoi.poi.lat),
      lng: String(rawMapPoi.poi.lng),
      place_id: rawMapPoi.poi.id,
      personalDescription: rawMapPoi.personalDescription,
    } as PointOfInterestString;
  }

  async findOne(id: number, userId: number): Promise<MapWithPois> {
    const map = await this.prisma.map.findUnique({
      where: { id },
      include: {
        pois: {
          select: {
            personalDescription: true,
            poi: {
              select: {
                id: true,
                name: true,
                lat: true,
                lng: true,
                thumbnail: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!map) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }
    if (!map.isPublic && map.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this map');
    }
    const rawMap = map as unknown as { pois: RawMapPoi[] };
    return {
      ...map,
      pois: rawMap.pois.map(mp => ({
        ...mp.poi,
        lat: String(mp.poi.lat),
        lng: String(mp.poi.lng),
        place_id: mp.poi.id,
        personalDescription: mp.personalDescription,
      })) as PointOfInterestString[],
    } as MapWithPois;
  }

  async findPoiDetails(
    mapId: number,
    poiId: string,
    userId: number,
  ): Promise<PointOfInterestString> {
    const map = await this.prisma.map.findUnique({ where: { id: mapId } });
    if (!map) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }
    if (!map.isPublic && map.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this map');
    }
    const mapPoi = await this.prisma.mapPoi.findUnique({
      where: {
        mapId_poiId: {
          mapId,
          poiId,
        },
      },
      include: {
        poi: true,
      },
    });
    if (!mapPoi) {
      throw new NotFoundException(`POI ${poiId} not found in map ${mapId}`);
    }
    const rawMapPoi = mapPoi as unknown as RawMapPoi;
    return {
      ...rawMapPoi.poi,
      lat: String(rawMapPoi.poi.lat),
      lng: String(rawMapPoi.poi.lng),
      place_id: rawMapPoi.poi.id,
      personalDescription: rawMapPoi.personalDescription,
    } as PointOfInterestString;
  }

  async update(id: number, userId: number, updateMapDto: UpdateMapDto): Promise<PrismaMap> {
    const map = await this.prisma.map.findUnique({ where: { id } });
    if (!map) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }
    if (map.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this map');
    }
    return await this.prisma.map.update({
      where: { id },
      data: updateMapDto,
    });
  }

  async updatePoi(
    mapId: number,
    poiId: string,
    userId: number,
    updatePoiDto: UpdatePoiDto,
  ): Promise<PointOfInterestString> {
    const map = await this.prisma.map.findUnique({ where: { id: mapId } });
    if (!map) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }
    if (map.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this map');
    }
    try {
      const updatedMapPoi = await this.prisma.mapPoi.update({
        where: {
          mapId_poiId: {
            mapId,
            poiId,
          },
        },
        data: {
          personalDescription: updatePoiDto.personalDescription,
        },
        include: {
          poi: true,
        },
      });
      const rawUpdated = updatedMapPoi as unknown as RawMapPoi;
      return {
        ...rawUpdated.poi,
        lat: String(rawUpdated.poi.lat),
        lng: String(rawUpdated.poi.lng),
        place_id: rawUpdated.poi.id,
        personalDescription: rawUpdated.personalDescription,
      } as PointOfInterestString;
    } catch (error) {
      if ((error as PrismaError).code === 'P2025') {
        throw new NotFoundException('POI not found in this map');
      }
      throw error;
    }
  }

  async remove(id: number, userId: number): Promise<PrismaMap> {
    const map = await this.prisma.map.findUnique({ where: { id } });
    if (!map) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }
    if (map.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this map');
    }
    return await this.prisma.map.delete({
      where: { id },
    });
  }

  async addPoi(mapId: number, userId: number, addPoiDto: AddPoiDto): Promise<MapWithPois> {
    const map = await this.prisma.map.findUnique({ where: { id: mapId } });
    if (!map) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }
    if (map.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this map');
    }
    const poi = await this.prisma.pointOfInterest.upsert({
      where: { id: addPoiDto.place_id },
      update: {
        rating: addPoiDto.rating,
        userRatingsTotal: addPoiDto.userRatingsTotal,
        description: addPoiDto.description,
        wikipediaUrl: addPoiDto.wikipediaUrl,
        wikivoyageUrl: addPoiDto.wikivoyageUrl,
        website: addPoiDto.website,
        phoneNumber: addPoiDto.phoneNumber,
        thumbnail: addPoiDto.thumbnail,
      },
      create: {
        id: addPoiDto.place_id,
        name: addPoiDto.name,
        lat: addPoiDto.lat,
        lng: addPoiDto.lng,
        address: addPoiDto.address,
        category: addPoiDto.category,
        rating: addPoiDto.rating,
        userRatingsTotal: addPoiDto.userRatingsTotal,
        thumbnail: addPoiDto.thumbnail,
        description: addPoiDto.description,
        wikipediaUrl: addPoiDto.wikipediaUrl,
        wikivoyageUrl: addPoiDto.wikivoyageUrl,
        website: addPoiDto.website,
        phoneNumber: addPoiDto.phoneNumber,
      },
    });
    try {
      await this.prisma.mapPoi.create({
        data: {
          mapId,
          poiId: poi.id,
        },
      });
    } catch (error) {
      if ((error as PrismaError).code !== 'P2002') {
        throw error;
      }
    }
    return await this.findOne(mapId, userId);
  }

  async removePoi(mapId: number, poiId: string, userId: number): Promise<MapWithPois> {
    const map = await this.prisma.map.findUnique({ where: { id: mapId } });
    if (!map) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }
    if (map.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this map');
    }
    try {
      await this.prisma.mapPoi.delete({
        where: {
          mapId_poiId: {
            mapId,
            poiId,
          },
        },
      });
    } catch (error) {
      if ((error as PrismaError).code === 'P2025') {
        throw new NotFoundException('POI not found in this map');
      }
      throw error;
    }
    return await this.findOne(mapId, userId);
  }

  async findNearbyPois(
    userId: number,
    lat: number,
    lng: number,
    radius: number = 1,
  ): Promise<(PointOfInterest & { place_id: string; distance: number })[]> {
    const mapPois = await this.prisma.mapPoi.findMany({
      where: {
        map: {
          userId,
        },
      },
      include: {
        poi: true,
      },
    });
    const uniquePois = new Map<string, PointOfInterest>();
    mapPois.forEach(mp => {
      if (!uniquePois.has(mp.poiId)) {
        uniquePois.set(mp.poiId, mp.poi);
      }
    });

    const poisWithDistance = Array.from(uniquePois.values()).map(poi => {
      const distance = this.calculateDistance(lat, lng, poi.lat, poi.lng);
      return {
        ...poi,
        place_id: poi.id,
        distance,
      };
    });
    return poisWithDistance
      .filter(p => p.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
