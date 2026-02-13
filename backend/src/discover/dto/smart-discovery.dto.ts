// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SmartDiscoveryDto {
  @ApiProperty({ description: 'City or district name', example: 'Paris' })
  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  city: string;

  @ApiPropertyOptional({
    description:
      'Weights for categories in format "category1:weight1,category2:weight2". Supported categories include Wikivoyage types (see, do, buy, eat, drink, sleep) and semantic tags (nature, culture, food, nightlife, shopping, monument, activities).',
    example: 'culture:10,food:5,nature:2',
  })
  @IsOptional()
  @IsString({ message: 'Weights must be a string' })
  weights?: string;
}
