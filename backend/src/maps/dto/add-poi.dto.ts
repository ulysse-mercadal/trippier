// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddPoiDto {
  @ApiProperty({ example: 'ChIJ...' })
  @IsString()
  place_id: string;

  @ApiProperty({ example: 'Eiffel Tower' })
  @IsString()
  name: string;

  @ApiProperty({ example: 48.8584, type: Number })
  @IsNumber()
  @Type(() => Number)
  lat: number;

  @ApiProperty({ example: 2.2945, type: Number })
  @IsNumber()
  @Type(() => Number)
  lng: number;

  @ApiPropertyOptional({ example: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Tourist Attraction' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 4.7 })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ example: 25000 })
  @IsNumber()
  @IsOptional()
  userRatingsTotal?: number;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({ example: 'The Eiffel Tower is a wrought-iron lattice tower...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://en.wikipedia.org/wiki/Eiffel_Tower' })
  @IsString()
  @IsOptional()
  wikipediaUrl?: string;

  @ApiPropertyOptional({ example: 'https://en.wikivoyage.org/wiki/Paris' })
  @IsString()
  @IsOptional()
  wikivoyageUrl?: string;

  @ApiPropertyOptional({ example: 'https://www.toureiffel.paris/' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: '+33 892 70 12 39' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
