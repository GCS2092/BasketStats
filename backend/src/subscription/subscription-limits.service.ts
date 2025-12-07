import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionLimitsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupérer les limites d'abonnement d'un utilisateur
   */
  async getUserLimits(userId: string) {
    // Récupérer l'abonnement actif
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        userId: true,
        planId: true,
        status: true,
        startDate: true,
        endDate: true,
        paymentMethod: true,
        transactionId: true,
        autoRenew: true,
        createdAt: true,
        updatedAt: true,
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
            price: true,
            duration: true,
            features: true,
            maxClubs: true,
            maxPlayers: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      },
    });

    if (!subscription) {
      throw new Error('Aucun abonnement actif trouvé');
    }

    const plan = subscription.plan;
    const features = plan.features as any;

    // Compter les posts depuis le début de l'abonnement
    const postCount = await this.prisma.post.count({
      where: {
        userId,
        createdAt: {
          gte: subscription.startDate,
        },
      },
    });

    // Compter les clubs dont l'utilisateur est propriétaire
    const clubCount = await this.prisma.club.count({
      where: {
        members: {
          some: {
            userId,
            role: 'PRESIDENT',
          },
        },
      },
    });

    // Compter les profils de joueurs créés par l'utilisateur
    const playerCount = await this.prisma.playerProfile.count({
      where: {
        userId,
      },
    });

    // Calculer les limites et pourcentages
    const posts = {
      current: postCount,
      max: features.posts === -1 ? -1 : features.posts,
      percentage: features.posts === -1 ? 0 : Math.round((postCount / features.posts) * 100),
    };

    const clubs = {
      current: clubCount,
      max: features.maxClubs === null ? -1 : features.maxClubs,
      percentage: features.maxClubs === null ? 0 : Math.round((clubCount / features.maxClubs) * 100),
    };

    const players = {
      current: playerCount,
      max: features.maxPlayers === null ? -1 : features.maxPlayers,
      percentage: features.maxPlayers === null ? 0 : Math.round((playerCount / features.maxPlayers) * 100),
    };

    return {
      posts,
      clubs,
      players,
      plan: {
        name: plan.name,
        type: plan.type,
      },
    };
  }

  /**
   * Vérifier si l'utilisateur peut créer un post
   */
  async canCreatePost(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    const limits = await this.getUserLimits(userId);
    
    if (limits.posts.max === -1) {
      return { canCreate: true };
    }

    if (limits.posts.current >= limits.posts.max) {
      return {
        canCreate: false,
        reason: `Limite de posts atteinte (${limits.posts.current}/${limits.posts.max}). Veuillez passer à un plan supérieur pour créer plus de posts.`,
      };
    }

    return { canCreate: true };
  }

  /**
   * Vérifier si l'utilisateur peut créer un club
   */
  async canCreateClub(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    const limits = await this.getUserLimits(userId);
    
    if (limits.clubs.max === -1) {
      return { canCreate: true };
    }

    if (limits.clubs.current >= limits.clubs.max) {
      return {
        canCreate: false,
        reason: `Limite de clubs atteinte (${limits.clubs.current}/${limits.clubs.max}). Veuillez passer à un plan supérieur pour gérer plus de clubs.`,
      };
    }

    return { canCreate: true };
  }

  /**
   * Vérifier si l'utilisateur peut créer un profil de joueur
   */
  async canCreatePlayerProfile(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    const limits = await this.getUserLimits(userId);
    
    if (limits.players.max === -1) {
      return { canCreate: true };
    }

    if (limits.players.current >= limits.players.max) {
      return {
        canCreate: false,
        reason: `Limite de profils de joueurs atteinte (${limits.players.current}/${limits.players.max}). Veuillez passer à un plan supérieur pour ajouter plus de joueurs.`,
      };
    }

    return { canCreate: true };
  }

  /**
   * Créer une notification d'avertissement de limite
   */
  async createLimitWarningNotification(userId: string, limitType: 'posts' | 'clubs' | 'players', percentage: number) {
    const limits = await this.getUserLimits(userId);
    
    let title = '';
    let message = '';
    let notificationType = '';

    switch (limitType) {
      case 'posts':
        title = percentage >= 100 ? '🚨 Limite de posts atteinte' : '⚠️ Limite de posts proche';
        message = percentage >= 100 
          ? `Vous avez atteint la limite de ${limits.posts.max} posts de votre plan ${limits.plan.name}. Passez à un plan supérieur pour continuer à publier.`
          : `Vous avez utilisé ${limits.posts.current}/${limits.posts.max} posts de votre plan ${limits.plan.name}. Pensez à passer à un plan supérieur.`;
        notificationType = 'SUBSCRIPTION_LIMIT_WARNING';
        break;
      case 'clubs':
        title = percentage >= 100 ? '🚨 Limite de clubs atteinte' : '⚠️ Limite de clubs proche';
        message = percentage >= 100 
          ? `Vous avez atteint la limite de ${limits.clubs.max} clubs de votre plan ${limits.plan.name}. Passez à un plan supérieur pour gérer plus de clubs.`
          : `Vous gérez ${limits.clubs.current}/${limits.clubs.max} clubs avec votre plan ${limits.plan.name}. Pensez à passer à un plan supérieur.`;
        notificationType = 'SUBSCRIPTION_LIMIT_WARNING';
        break;
      case 'players':
        title = percentage >= 100 ? '🚨 Limite de joueurs atteinte' : '⚠️ Limite de joueurs proche';
        message = percentage >= 100 
          ? `Vous avez atteint la limite de ${limits.players.max} profils de joueurs de votre plan ${limits.plan.name}. Passez à un plan supérieur pour ajouter plus de joueurs.`
          : `Vous avez ${limits.players.current}/${limits.players.max} profils de joueurs avec votre plan ${limits.plan.name}. Pensez à passer à un plan supérieur.`;
        notificationType = 'SUBSCRIPTION_LIMIT_WARNING';
        break;
    }

    // Créer la notification
    await this.prisma.notification.create({
      data: {
        userId,
        type: notificationType,
        title,
        message,
        payload: {
          limitType,
          percentage,
          current: limits[limitType].current,
          max: limits[limitType].max,
          planName: limits.plan.name,
        },
      },
    });

    console.log(`🔔 [LIMITS] Notification d'avertissement créée pour ${limitType} (${percentage}%)`);
  }
}
