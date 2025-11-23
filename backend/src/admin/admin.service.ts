import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { AdminNotificationsService } from './admin-notifications.service';

export interface GetUsersFilters {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  verified?: boolean;
}

export interface GetPostsFilters {
  page: number;
  limit: number;
  status?: string;
}

export interface GetReportsFilters {
  page: number;
  limit: number;
  status?: string;
}

export interface GetClubsFilters {
  page: number;
  limit: number;
  verified?: boolean;
}

export interface GetEventsFilters {
  page: number;
  limit: number;
  status?: string;
}

export interface GetLogsFilters {
  page: number;
  limit: number;
  level?: string;
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private adminNotifications: AdminNotificationsService,
  ) {}

  // Dashboard - Statistiques générales
  async getDashboardStats() {
    const [
      totalUsers,
      totalPlayers,
      totalRecruiters,
      totalPosts,
      totalClubs,
      totalEvents,
      verifiedUsers,
      recentUsers,
      activeUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'PLAYER' } }),
      this.prisma.user.count({ where: { role: 'RECRUITER' } }),
      this.prisma.post.count(),
      this.prisma.club.count(),
      this.prisma.event.count(),
      this.prisma.user.count({ where: { verified: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 derniers jours
          },
        },
      }),
      this.prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
          },
        },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalPlayers,
        totalRecruiters,
        totalPosts,
        totalClubs,
        totalEvents,
        verifiedUsers,
        recentUsers,
        activeUsers,
        verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      },
    };
  }

  // Gestion des utilisateurs
  async getUsers(filters: GetUsersFilters) {
    const { page, limit, search, role, verified } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (verified !== undefined) where.verified = verified;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          verified: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
          playerProfile: {
            select: {
              id: true,
              position: true,
              level: true,
              currentClub: true,
            },
          },
          recruiterProfile: {
            select: {
              id: true,
              companyName: true,
              companyType: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        playerProfile: true,
        recruiterProfile: true,
        posts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async verifyUser(userId: string, verified: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { verified },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        verified: true,
        active: true,
      },
    });

    // Envoyer un email de notification
    if (user.role === UserRole.RECRUITER) {
      if (verified) {
        await this.adminNotifications.sendAccountValidationEmail(
          user.email,
          user.fullName || user.email,
        );
      } else {
        await this.adminNotifications.sendAccountDevalidationEmail(
          user.email,
          user.fullName || user.email,
        );
      }
    }

    return user;
  }

  async toggleUserActive(userId: string, active: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { active },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        verified: true,
        active: true,
      },
    });

    // Envoyer un email de notification
    if (!active) {
      await this.adminNotifications.sendAccountDeactivationEmail(
        user.email,
        user.fullName || user.email,
      );
    } else {
      await this.adminNotifications.sendAccountReactivationEmail(
        user.email,
        user.fullName || user.email,
      );
    }

    return user;
  }

  async updateUserRole(userId: string, role: UserRole) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return user;
  }

  async deleteUser(userId: string) {
    // Vérifier que ce n'est pas le dernier admin
    const adminCount = await this.prisma.user.count({ where: { role: 'ADMIN' } });
    const userToDelete = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (userToDelete?.role === 'ADMIN' && adminCount <= 1) {
      throw new BadRequestException('Impossible de supprimer le dernier administrateur');
    }

    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Utilisateur supprimé avec succès' };
  }

  // Gestion des posts
  async getPosts(filters: GetPostsFilters) {
    const { page, limit, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async moderatePost(postId: string, action: 'APPROVE' | 'REJECT', reason?: string) {
    // Pour l'instant, on ne peut que supprimer un post
    if (action === 'REJECT') {
      return this.prisma.post.delete({
        where: { id: postId },
      });
    }
    // Pour APPROVE, on ne fait rien car les posts sont publiés par défaut
    return this.prisma.post.findUnique({ 
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async deletePost(postId: string) {
    await this.prisma.post.delete({ where: { id: postId } });
    return { message: 'Post supprimé avec succès' };
  }

  // Gestion des signalements
  async getReports(filters: GetReportsFilters) {
    const { page, limit, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async resolveReport(reportId: string, action: string, reason?: string) {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolution: action,
        reviewedAt: new Date(),
      },
    });

    return report;
  }

  // Statistiques détaillées
  async getUserStats() {
    const [
      totalUsers,
      verifiedUsers,
      usersByRole,
      usersByMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { verified: true } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      this.prisma.user.groupBy({
        by: ['createdAt'],
        _count: { createdAt: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000), // 12 mois
          },
        },
      }),
    ]);

    return {
      totalUsers,
      verifiedUsers,
      verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      usersByRole,
      usersByMonth,
    };
  }

  async getPostStats() {
    const [
      totalPosts,
      publishedPosts,
      postsByMonth,
      topUsers,
    ] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count(), // Tous les posts sont publiés par défaut
      this.prisma.post.groupBy({
        by: ['createdAt'],
        _count: { createdAt: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000), // 12 mois
          },
        },
      }),
      this.prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          _count: { select: { posts: true } },
        },
        orderBy: { posts: { _count: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalPosts,
      publishedPosts,
      postsByMonth,
      topUsers,
    };
  }

  async getActivityStats(days: number) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [newUsers, newPosts, newClubs, newEvents] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.post.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.club.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.event.count({ where: { createdAt: { gte: startDate } } }),
    ]);

    return {
      period: `${days} derniers jours`,
      newUsers,
      newPosts,
      newClubs,
      newEvents,
    };
  }

  // Gestion des clubs
  async getClubs(filters: GetClubsFilters) {
    const { page, limit, verified } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (verified !== undefined) where.verified = verified;

    const [clubs, total] = await Promise.all([
      this.prisma.club.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      }),
      this.prisma.club.count({ where }),
    ]);

    return {
      clubs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async verifyClub(clubId: string, verified: boolean) {
    const club = await this.prisma.club.update({
      where: { id: clubId },
      data: { verified },
      select: {
        id: true,
        name: true,
        verified: true,
      },
    });

    return club;
  }

  // Gestion des événements
  async getEvents(filters: GetEventsFilters) {
    const { page, limit, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          club: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async featureEvent(eventId: string, featured: boolean) {
    const event = await this.prisma.event.update({
      where: { id: eventId },
      data: { featured },
      select: {
        id: true,
        title: true,
        featured: true,
      },
    });

    return event;
  }

  // Logs système (simulation - dans un vrai projet, utiliser un système de logs)
  async getSystemLogs(filters: GetLogsFilters) {
    // Simulation de logs système
    const mockLogs = [
      {
        id: '1',
        level: 'INFO',
        message: 'Utilisateur connecté',
        timestamp: new Date(),
        userId: 'user-1',
        action: 'LOGIN',
      },
      {
        id: '2',
        level: 'WARN',
        message: 'Tentative de connexion échouée',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        userId: null,
        action: 'LOGIN_FAILED',
      },
      {
        id: '3',
        level: 'ERROR',
        message: 'Erreur de validation de données',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        userId: 'user-2',
        action: 'VALIDATION_ERROR',
      },
    ];

    const { page, limit, level } = filters;
    const skip = (page - 1) * limit;

    let filteredLogs = mockLogs;
    if (level) {
      filteredLogs = mockLogs.filter(log => log.level === level);
    }

    const total = filteredLogs.length;
    const logs = filteredLogs.slice(skip, skip + limit);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Gestion des abonnements
  /**
   * Récupérer tous les plans d'abonnement avec leurs statistiques
   */
  async getSubscriptionPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: {
        price: 'asc',
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    // Pour chaque plan, compter les abonnements actifs
    const plansWithStats = await Promise.all(
      plans.map(async (plan) => {
        const activeSubscriptions = await this.prisma.subscription.count({
          where: {
            planId: plan.id,
            status: 'ACTIVE',
            OR: [
              { endDate: null },
              { endDate: { gt: new Date() } },
            ],
          },
        });

        const expiredSubscriptions = await this.prisma.subscription.count({
          where: {
            planId: plan.id,
            status: 'EXPIRED',
          },
        });

        const cancelledSubscriptions = await this.prisma.subscription.count({
          where: {
            planId: plan.id,
            status: 'CANCELLED',
          },
        });

        return {
          ...plan,
          stats: {
            totalSubscriptions: plan._count.subscriptions,
            activeSubscriptions,
            expiredSubscriptions,
            cancelledSubscriptions,
          },
        };
      })
    );

    return plansWithStats;
  }

  /**
   * Récupérer les utilisateurs d'un plan spécifique
   */
  async getPlanUsers(planId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Vérifier que le plan existe
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan d\'abonnement non trouvé');
    }

    // Récupérer les abonnements actifs pour ce plan
    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: {
          planId,
          status: 'ACTIVE',
          OR: [
            { endDate: null },
            { endDate: { gt: new Date() } },
          ],
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatarUrl: true,
              role: true,
              verified: true,
              createdAt: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              type: true,
              price: true,
            },
          },
        },
      }),
      this.prisma.subscription.count({
        where: {
          planId,
          status: 'ACTIVE',
          OR: [
            { endDate: null },
            { endDate: { gt: new Date() } },
          ],
        },
      }),
    ]);

    return {
      plan: {
        id: plan.id,
        name: plan.name,
        type: plan.type,
        price: plan.price,
        description: plan.description,
      },
      users: subscriptions.map((sub) => ({
        subscription: {
          id: sub.id,
          status: sub.status,
          startDate: sub.startDate,
          endDate: sub.endDate,
          createdAt: sub.createdAt,
        },
        user: sub.user,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupérer les statistiques globales des abonnements
   */
  async getSubscriptionStats() {
    const [
      totalPlans,
      activePlans,
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      subscriptionsByPlan,
      revenueByPlan,
    ] = await Promise.all([
      this.prisma.subscriptionPlan.count(),
      this.prisma.subscriptionPlan.count({ where: { isActive: true } }),
      this.prisma.subscription.count(),
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          OR: [
            { endDate: null },
            { endDate: { gt: new Date() } },
          ],
        },
      }),
      this.prisma.subscription.count({ where: { status: 'EXPIRED' } }),
      this.prisma.subscription.count({ where: { status: 'CANCELLED' } }),
      this.prisma.subscription.groupBy({
        by: ['planId'],
        _count: {
          planId: true,
        },
        where: {
          status: 'ACTIVE',
          OR: [
            { endDate: null },
            { endDate: { gt: new Date() } },
          ],
        },
      }),
      this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { endDate: null },
            { endDate: { gt: new Date() } },
          ],
        },
        include: {
          plan: {
            select: {
              price: true,
            },
          },
        },
      }),
    ]);

    // Calculer le revenu total (somme des prix des plans actifs)
    const totalRevenue = revenueByPlan.reduce((sum, sub) => {
      const price = Number(sub.plan.price) || 0;
      return sum + price;
    }, 0);

    // Enrichir les statistiques par plan
    const subscriptionsByPlanDetails = await Promise.all(
      subscriptionsByPlan.map(async (item) => {
        const plan = await this.prisma.subscriptionPlan.findUnique({
          where: { id: item.planId },
          select: {
            name: true,
            type: true,
            price: true,
          },
        });

        return {
          planId: item.planId,
          planName: plan?.name || 'Plan inconnu',
          planType: plan?.type || 'UNKNOWN',
          planPrice: plan?.price || 0,
          userCount: item._count.planId,
        };
      })
    );

    return {
      overview: {
        totalPlans,
        activePlans,
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        totalRevenue,
      },
      subscriptionsByPlan: subscriptionsByPlanDetails,
    };
  }
}
