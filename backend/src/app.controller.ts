// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('download-apk')
  @Redirect(
    'https://github.com/ulysse-mercadal/trippier/releases/latest/download/trippier.apk',
    302,
  )
  downloadApk() {
    return;
  }
}
