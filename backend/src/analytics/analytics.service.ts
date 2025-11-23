import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Enregistrer une vue de profil
   */
  async trackProfileView(profileId: string, viewerId?: string, metadata?: { userAgent?: string; ipAddress?: string }) {
    // Éviter de compter les vues de son propre profil
    if (viewerId && viewerId === profileId) {
      return;
    }

    await this.prisma.profileView.create({
      data: {
        profileId,
        viewerId,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
      },
    });
  }

  /**
   * Statistiques de profil pour un joueur
   */
  async getProfileStats(userId: string, period: 'week' | 'month' | 'all' = 'all') {
    const now = new Date();
    let startDate: Date | undefined;

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause: any = { profileId: userId };
    if (startDate) {
      whereClause.viewedAt = { gte: startDate };
    }

    const [
      totalViews,
      uniqueViewers,
      viewsByDay,
      topViewers,
    ] = await Promise.all([
      // Total de vues
      this.prisma.profileView.count({ where: whereClause }),
      
      // Nombre de visiteurs uniques
      this.prisma.profileView.findMany({
        where: whereClause,
        select: { viewerId: true },
        distinct: ['viewerId'],
      }),
      
      // Vues par jour (7 derniers jours)
      this.prisma.$queryRaw`
        SELECT DATE("viewed_at") as date, COUNT(*) as views
        FROM profile_views
        WHERE "profile_id" = ${userId}::uuid
        AND "viewed_at" >= NOW() - INTERVAL '7 days'
        GROUP BY DATE("viewed_at")
        ORDER BY date DESC
      `,
      
      // Top 5 visiteurs
      this.prisma.profileView.groupBy({
        by: ['viewerId'],
        where: {
          ...whereClause,
          viewerId: { not: null },
        },
        _count: {
          viewerId: true,
        },
        orderBy: {
          _count: {
            viewerId: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    // Récupérer les infos des top visiteurs
    const viewerIds = topViewers.map(v => v.viewerId).filter(Boolean) as string[];
    const viewersInfo = viewerIds.length > 0 ? await this.prisma.user.findMany({
      where: { id: { in: viewerIds } },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        role: true,
      },
    }) : [];

    const topViewersWithInfo = topViewers.map(tv => ({
      ...viewersInfo.find(v => v.id === tv.viewerId),
      viewCount: tv._count.viewerId,
    }));

    return {
      totalViews,
      uniqueViewers: uniqueViewers.length,
      viewsByDay,
      topViewers: topViewersWithInfo,
    };
  }

  /**
   * Dashboard analytics pour recruteur
   */
  async getRecruiterDashboard(recruiterId: string) {
    const [
      sentOffers,
      acceptedOffers,
      pendingOffers,
      rejectedOffers,
      myPlayers,
      recentActivity,
    ] = await Promise.all([
      // Total offres envoyées
      this.prisma.recruitRequest.count({
        where: { fromUserId: recruiterId },
      }),
      
      // Offres acceptées
      this.prisma.recruitRequest.count({
        where: { fromUserId: recruiterId, status: 'ACCEPTED' },
      }),
      
      // Offres en attente
      this.prisma.recruitRequest.count({
        where: { fromUserId: recruiterId, status: 'PENDING' },
      }),
      
      // Offres refusées
      this.prisma.recruitRequest.count({
        where: { fromUserId: recruiterId, status: 'REJECTED' },
      }),
      
      // Mes joueurs (offres acceptées)
      this.prisma.recruitRequest.findMany({
        where: {
          fromUserId: recruiterId,
          status: 'ACCEPTED',
        },
        include: {
          toUser: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              playerProfile: {
                select: {
                  position: true,
                  level: true,
                  currentClub: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
      
      // Activité récente (dernières offres)
      this.prisma.recruitRequest.findMany({
        where: { fromUserId: recruiterId },
        include: {
          toUser: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Taux de conversion
    const conversionRate = sentOffers > 0 
      ? ((acceptedOffers / sentOffers) * 100).toFixed(1)
      : '0';

    return {
      stats: {
        sentOffers,
        acceptedOffers,
        pendingOffers,
        rejectedOffers,
        conversionRate: parseFloat(conversionRate),
      },
      myPlayers,
      recentActivity,
    };
  }

  /**
   * Statistiques globales de la plateforme (pour admin)
   */
  async getPlatformStats() {
    const [
      totalUsers,
      totalPlayers,
      totalRecruiters,
      totalPosts,
      totalVideos,
      totalPhotos,
      totalRecruitRequests,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'PLAYER' } }),
      this.prisma.user.count({ where: { role: 'RECRUITER' } }),
      this.prisma.post.count(),
      this.prisma.video.count(),
      this.prisma.photo.count(),
      this.prisma.recruitRequest.count(),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        players: totalPlayers,
        recruiters: totalRecruiters,
      },
      content: {
        posts: totalPosts,
        videos: totalVideos,
        photos: totalPhotos,
      },
      recruitment: {
        totalRequests: totalRecruitRequests,
      },
      recentUsers,
    };
  }
}

