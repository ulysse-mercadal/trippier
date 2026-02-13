// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { IsString, IsBoolean, IsOptional, IsInt, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  text: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  poiId: string;

  @IsString()
  poiName: string;

  @IsNumber()
  poiLat: number;

  @IsNumber()
  poiLng: number;

  @IsInt()
  @IsOptional()
  parentId?: number;
}
