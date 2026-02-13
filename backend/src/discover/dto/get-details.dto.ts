// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { IsNumber, IsString, Min, Max, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetDetailsDto {
  @ApiProperty({ description: 'Unique identifier of the place', example: 'ChIJ...' })
  @IsDefined({ message: 'Place ID (place_id) is required' })
  @IsString({ message: 'Place ID (place_id) must be a string' })
  place_id: string;

  @ApiProperty({ description: 'Name of the place', example: 'Eiffel Tower' })
  @IsDefined({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ description: 'Latitude of the place', example: 48.8566 })
  @IsDefined({ message: 'Latitude (lat) is required' })
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Latitude (lat) must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  lat: number;

  @ApiProperty({ description: 'Longitude of the place', example: 2.3522 })
  @IsDefined({ message: 'Longitude (lng) is required' })
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Longitude (lng) must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  lng: number;
}
