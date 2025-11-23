import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto, UpdateVideoDto } from './dto';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateVideoDto) {
    const video = await this.prisma.video.create({
      data: {
        userId,
        ...dto,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return video;
  }

  async findAll(page = 1, limit = 12) {
    // Validation et valeurs par défaut pour éviter NaN
    const validPage = !isNaN(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const validLimit = !isNaN(Number(limit)) && Number(limit) > 0 ? Number(limit) : 12;

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where: { visibility: 'PUBLIC' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (validPage - 1) * validLimit,
        take: validLimit,
      }),
      this.prisma.video.count({ where: { visibility: 'PUBLIC' } }),
    ]);

    return {
      videos,
      pagination: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  async findByUser(userId: string) {
    return this.prisma.video.findMany({
      where: { userId, visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Vidéo introuvable');
    }

    // Incrémenter les vues
    await this.prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return video;
  }

  async update(id: string, userId: string, dto: UpdateVideoDto) {
    const video = await this.prisma.video.findUnique({ where: { id } });

    if (!video) {
      throw new NotFoundException('Vidéo introuvable');
    }

    if (video.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres vidéos');
    }

    return this.prisma.video.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const video = await this.prisma.video.findUnique({ where: { id } });

    if (!video) {
      throw new NotFoundException('Vidéo introuvable');
    }

    if (video.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres vidéos');
    }

    await this.prisma.video.delete({ where: { id } });
    return { message: 'Vidéo supprimée' };
  }
}

