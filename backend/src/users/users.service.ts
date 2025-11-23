import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        verified: true,
        createdAt: true,
        playerProfile: true,
        recruiterProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAllRecruiters(filters: { search?: string; country?: string; organization?: string }) {
    const where: any = {
      role: 'RECRUITER',
      active: true,
    };

    // Filtre de recherche (nom, organisation)
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        {
          recruiterProfile: {
            companyName: { contains: filters.search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Filtre par pays
    if (filters.country) {
      where.recruiterProfile = {
        ...where.recruiterProfile,
        country: filters.country,
      };
    }

    // Filtre par organisation
    if (filters.organization) {
      where.recruiterProfile = {
        ...where.recruiterProfile,
        companyName: { contains: filters.organization, mode: 'insensitive' },
      };
    }

    const recruiters = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        recruiterProfile: {
          select: {
            companyName: true,
            companyType: true,
            city: true,
            country: true,
            website: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recruiters;
  }

  async updateUser(userId: string, currentUserId: string, dto: UpdateUserDto) {
    // Vérifier que l'utilisateur modifie son propre profil
    if (userId !== currentUserId) {
      throw new ForbiddenException('Vous ne pouvez modifier que votre propre profil');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        verified: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getFollowers(userId: string) {
    const followers = await this.prisma.follow.findMany({
      where: { followeeId: userId },
      include: {
        follower: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return followers.map((f) => f.follower);
  }

  async getFollowing(userId: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        followee: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return following.map((f) => f.followee);
  }

  async followUser(followerId: string, followeeId: string) {
    if (followerId === followeeId) {
      throw new ForbiddenException('Vous ne pouvez pas vous suivre vous-même');
    }

    // Vérifier que le followee existe
    const followee = await this.prisma.user.findUnique({
      where: { id: followeeId },
    });

    if (!followee) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Créer le follow (ignore si existe déjà)
    const follow = await this.prisma.follow.upsert({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
      create: {
        followerId,
        followeeId,
      },
      update: {},
    });

    // Créer une notification pour le followee
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { fullName: true },
    });

    await this.notificationsService.createNotification(
      followeeId,
      'new_follower',
      'Nouvel abonné',
      `${follower?.fullName} s'est abonné à votre profil`,
      { userId: followerId },
    );

    return { message: 'Utilisateur suivi avec succès', follow };
  }

  async unfollowUser(followerId: string, followeeId: string) {
    await this.prisma.follow.delete({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
    });

    return { message: 'Utilisateur retiré des abonnements' };
  }

  async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
    });

    return !!follow;
  }

  async getUserStats(userId: string) {
    const [followersCount, followingCount, postsCount, videosCount] = await Promise.all([
      this.prisma.follow.count({ where: { followeeId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
      this.prisma.post.count({ where: { userId } }),
      this.prisma.video.count({ where: { userId } }),
    ]);

    return {
      followersCount,
      followingCount,
      postsCount,
      videosCount,
    };
  }
}

