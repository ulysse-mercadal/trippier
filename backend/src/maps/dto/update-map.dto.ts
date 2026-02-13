// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { PartialType } from '@nestjs/swagger';
import { CreateMapDto } from './create-map.dto';

export class UpdateMapDto extends PartialType(CreateMapDto) {}
