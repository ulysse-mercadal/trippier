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
  Query,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RequestWithOptionalUser } from '../common/request-with-user.interface';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: RequestWithOptionalUser, @Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(req.user!.id, createCommentDto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findByPoi(@Request() req: RequestWithOptionalUser, @Query('poiId') poiId: string) {
    return this.commentsService.findByPoi(poiId, req.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithOptionalUser,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, req.user!.id, req.user!.role, updateCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: RequestWithOptionalUser) {
    return this.commentsService.remove(id, req.user!.id, req.user!.role);
  }
}
