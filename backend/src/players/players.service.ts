import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerProfileDto, UpdatePlayerProfileDto, SearchPlayersDto } from './dto';
import { Prisma } from '@prisma/client';
import { SubscriptionLimitsService } from '../subscription/subscription-limits.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class PlayersService {
  constructor(
    private prisma: PrismaService,
    private subscriptionLimitsService: SubscriptionLimitsService,
    private subscriptionService: SubscriptionService,
  ) {}

  async createProfile(userId: string, dto: CreatePlayerProfileDto) {
    // Vérifier qu'un profil n'existe pas déjà
    const existing = await this.prisma.playerProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ForbiddenException('Un profil joueur existe déjà pour cet utilisateur');
    }

    // Vérifier les limitations d'abonnement pour les profils de joueurs
    await this.checkPlayerProfileLimitations(userId);

    const profile = await this.prisma.playerProfile.create({
      data: {
        userId,
        ...dto,
        // Auto-certifier et rendre public tous les profils
        certified: true,
        privacyLevel: 'PUBLIC',
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    });

    return profile;
  }

  /**
   * Vérifier les limitations d'abonnement pour les profils de joueurs
   */
  private async checkPlayerProfileLimitations(userId: string) {
    // Récupérer l'abonnement actif de l'utilisateur
    const subscription = await this.subscriptionService.getUserActiveSubscription(userId);
    
    if (!subscription) {
      throw new ForbiddenException('Un abonnement actif est requis pour créer des profils de joueurs.');
    }

    const plan = subscription.plan;
    const features = plan.features as any;

    // Vérifier si la propriété maxPlayers existe dans les features
    const maxPlayers = features?.maxPlayers ?? null;

    // Si maxPlayers est null, c'est illimité
    if (maxPlayers === null) {
      return;
    }

    // Compter les profils de joueurs créés par l'utilisateur
    const playerCount = await this.prisma.playerProfile.count({
      where: {
        userId,
      },
    });

    if (playerCount >= maxPlayers) {
      throw new BadRequestException(
        `Limite de profils de joueurs atteinte (${playerCount}/${maxPlayers}). Veuillez passer à un plan supérieur pour ajouter plus de joueurs.`
      );
    }
  }

  async updateProfile(userId: string, currentUserId: string, dto: UpdatePlayerProfileDto) {
    // Vérifier que l'utilisateur modifie son propre profil
    if (userId !== currentUserId) {
      throw new ForbiddenException('Vous ne pouvez modifier que votre propre profil');
    }

    const profile = await this.prisma.playerProfile.update({
      where: { userId },
      data: dto,
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

    return profile;
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            bio: true,
            verified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil joueur introuvable');
    }

    // Incrémenter les vues du profil
    await this.prisma.playerProfile.update({
      where: { userId },
      data: { profileViews: { increment: 1 } },
    });

    return profile;
  }

  async searchPlayers(dto: SearchPlayersDto) {
    const {
      query,
      position,
      level,
      availability,
      country,
      minHeight,
      maxHeight,
      certified,
      page = 1,
      limit = 20,
    } = dto;

    const where: Prisma.PlayerProfileWhereInput = {
      privacyLevel: 'PUBLIC', // Seulement les profils publics
      ...(position && { position }),
      ...(level && { level }),
      ...(availability && { availability }),
      ...(country && { country }),
      ...(minHeight && { heightCm: { gte: minHeight } }),
      ...(maxHeight && { heightCm: { lte: maxHeight } }),
      ...(certified !== undefined && { certified }),
      ...(query && {
        OR: [
          { user: { fullName: { contains: query, mode: 'insensitive' } } },
          { nickname: { contains: query, mode: 'insensitive' } },
          { currentClub: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      }),
    };

    const [players, total] = await Promise.all([
      this.prisma.playerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              verified: true,
            },
          },
        },
        orderBy: [
          { certified: 'desc' },
          { profileViews: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.playerProfile.count({ where }),
    ]);

    return {
      players,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTopPlayers(limit?: number) {
    const actualLimit = limit || 10; // Utiliser 10 par défaut si limit n'est pas fourni
    
    const players = await this.prisma.playerProfile.findMany({
      where: {
        privacyLevel: 'PUBLIC',
        certified: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            verified: true,
          },
        },
      },
      orderBy: {
        profileViews: 'desc',
      },
      take: actualLimit,
    });

    return players;
  }

  async getSuggestedPlayers(userId: string, limit = 6) {
    // Suggestions basées sur le même pays et le même niveau (simple pour l'instant)
    const userProfile = await this.prisma.playerProfile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      return [];
    }

    const suggested = await this.prisma.playerProfile.findMany({
      where: {
        privacyLevel: 'PUBLIC',
        userId: { not: userId },
        OR: [
          { country: userProfile.country },
          { level: userProfile.level },
          { position: userProfile.position },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            verified: true,
          },
        },
      },
      take: limit,
    });

    return suggested;
  }

  // Recherches sauvegardées
  async saveSearch(recruiterId: string, data: { name: string; filters: any }) {
    return this.prisma.savedSearch.create({
      data: {
        recruiterId,
        name: data.name,
        filters: data.filters,
      },
    });
  }

  async getSavedSearches(recruiterId: string) {
    const searches = await this.prisma.savedSearch.findMany({
      where: { recruiterId },
      orderBy: { createdAt: 'desc' },
    });
    return { searches };
  }

  async deleteSavedSearch(id: string) {
    await this.prisma.savedSearch.delete({
      where: { id },
    });
    return { message: 'Recherche supprimée' };
  }

  // === HISTORIQUE CARRIÈRE ===

  async getCareerHistory(playerId: string) {
    return this.prisma.careerHistory.findMany({
      where: { playerId },
      orderBy: [
        { isCurrent: 'desc' },
        { startDate: 'desc' },
      ],
    });
  }

  async addCareerHistory(playerId: string, data: any) {
    // Si c'est l'équipe actuelle, mettre à jour les autres pour qu'elles ne soient plus actuelles
    if (data.isCurrent) {
      await this.prisma.careerHistory.updateMany({
        where: { playerId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return this.prisma.careerHistory.create({
      data: {
        playerId,
        ...data,
      },
    });
  }

  async updateCareerHistory(id: string, data: any) {
    return this.prisma.careerHistory.update({
      where: { id },
      data,
    });
  }

  async deleteCareerHistory(id: string) {
    await this.prisma.careerHistory.delete({
      where: { id },
    });
    return { message: 'Expérience supprimée' };
  }
}

