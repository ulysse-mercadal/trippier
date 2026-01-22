// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { IsNumber, IsOptional, IsString, Min, Max, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetNearbyDto {
  @ApiProperty({ description: 'Latitude of the location', example: 48.8566 })
  @IsDefined({ message: 'Latitude (lat) is required' })
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Latitude (lat) must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  lat: number;

  @ApiProperty({ description: 'Longitude of the location', example: 2.3522 })
  @IsDefined({ message: 'Longitude (lng) is required' })
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Longitude (lng) must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  lng: number;

  @ApiPropertyOptional({ description: 'Search radius in meters', example: 5000, default: 5000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Radius must be a number' })
  @Min(0, { message: 'Radius must be positive' })
  radius?: number;

  @ApiPropertyOptional({ description: 'Search query for filtering POIs', example: 'restaurant' })
  @IsOptional()
  @IsString({ message: 'Query (q) must be a string' })
  q?: string;
}
