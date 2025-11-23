import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhotoDto, UpdatePhotoDto } from './dto';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePhotoDto) {
    const photo = await this.prisma.photo.create({
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

    return photo;
  }

  async findByUser(userId: string) {
    return this.prisma.photo.findMany({
      where: { 
        userId, 
        visibility: 'PUBLIC' 
      },
      orderBy: [
        { isPinned: 'desc' }, // Photos épinglées en premier
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const photo = await this.prisma.photo.findUnique({
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

    if (!photo) {
      throw new NotFoundException('Photo introuvable');
    }

    return photo;
  }

  async update(id: string, userId: string, dto: UpdatePhotoDto) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });

    if (!photo) {
      throw new NotFoundException('Photo introuvable');
    }

    if (photo.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres photos');
    }

    // Si on épingle cette photo, désépingler les autres
    if (dto.isPinned === true) {
      await this.prisma.photo.updateMany({
        where: { 
          userId,
          id: { not: id },
          isPinned: true,
        },
        data: { isPinned: false },
      });
    }

    return this.prisma.photo.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });

    if (!photo) {
      throw new NotFoundException('Photo introuvable');
    }

    if (photo.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres photos');
    }

    await this.prisma.photo.delete({ where: { id } });
    return { message: 'Photo supprimée' };
  }

  async getUserPhotos(userId: string) {
    const [photos, pinnedPhoto] = await Promise.all([
      this.prisma.photo.findMany({
        where: { 
          userId, 
          visibility: 'PUBLIC',
          isPinned: false,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.photo.findFirst({
        where: {
          userId,
          isPinned: true,
          visibility: 'PUBLIC',
        },
      }),
    ]);

    return {
      pinnedPhoto,
      photos,
      total: photos.length + (pinnedPhoto ? 1 : 0),
    };
  }
}

