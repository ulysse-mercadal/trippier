// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePoiDto {
  @ApiPropertyOptional({ example: 'My personal note about this place' })
  @IsString()
  @IsOptional()
  personalDescription?: string;
}
