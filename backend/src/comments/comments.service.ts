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
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Role, Comment } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createCommentDto: CreateCommentDto) {
    const { parentId, poiId, poiName, poiLat, poiLng, ...data } = createCommentDto;

    if (parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
      if (!parent.isPublic) {
        throw new ForbiddenException('Cannot reply to a private note');
      }
    }

    // Ensure POI exists
    await this.prisma.pointOfInterest.upsert({
      where: { id: poiId },
      update: {},
      create: {
        id: poiId,
        name: poiName,
        lat: poiLat,
        lng: poiLng,
      },
    });

    return await this.prisma.comment.create({
      data: {
        ...data,
        userId,
        poiId,
        parentId,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findByPoi(poiId: string, userId?: number): Promise<Comment[]> {
    const whereClause: any = {
      poiId,
      OR: [{ isPublic: true, hidden: false }],
    };

    if (userId) {
      whereClause.OR.push({ userId: userId, isPublic: false });
    }

    const comments = await this.prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Sort: user's public comments first, then others
    return (comments as any).sort((a, b) => {
      if (userId && a.userId === userId && a.isPublic && b.userId !== userId) return -1;
      if (userId && b.userId === userId && b.isPublic && a.userId !== userId) return 1;
      return 0;
    });
  }

  async update(id: number, userId: number, userRole: Role, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    return await this.prisma.comment.update({
      where: { id },
      data: {
        text: updateCommentDto.text,
        isPublic: updateCommentDto.isPublic,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async remove(id: number, userId: number, userRole: Role) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    return await this.prisma.comment.delete({
      where: { id },
    });
  }
}
