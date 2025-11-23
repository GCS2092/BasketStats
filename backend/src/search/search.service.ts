import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, limit = 20) {
    const [users, players, videos, posts] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          role: true,
        },
        take: limit,
      }),
      this.prisma.playerProfile.findMany({
        where: {
          OR: [
            { nickname: { contains: query, mode: 'insensitive' } },
            { currentClub: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
          ],
          privacyLevel: 'PUBLIC',
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
        take: limit,
      }),
      this.prisma.video.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          visibility: 'PUBLIC',
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
        take: limit,
      }),
      this.prisma.post.findMany({
        where: {
          content: { contains: query, mode: 'insensitive' },
          visibility: 'PUBLIC',
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
        take: limit,
      }),
    ]);

    return {
      users,
      players,
      videos,
      posts,
    };
  }
}

