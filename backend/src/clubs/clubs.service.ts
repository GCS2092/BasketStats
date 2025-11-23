import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClubDto, UpdateClubDto } from './dto';
import { ClubNotificationsService } from './club-notifications.service';
import { SubscriptionLimitsService } from '../subscription/subscription-limits.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class ClubsService {
  constructor(
    private prisma: PrismaService,
    private clubNotifications: ClubNotificationsService,
    private subscriptionLimitsService: SubscriptionLimitsService,
    private subscriptionService: SubscriptionService,
  ) {}

  /**
   * Créer un club avec système d'approbation
   * Réservé aux recruteurs vérifiés et admins
   */
  async create(dto: CreateClubDto, responsibleUserId?: string) {
    // Vérifier si le club existe déjà
    const existing = await this.prisma.club.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Un club avec ce nom existe déjà');
    }

    // Vérifier que l'utilisateur est un recruteur vérifié ou admin
    if (responsibleUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: responsibleUserId },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Seuls les recruteurs vérifiés et admins peuvent créer des clubs
      if (user.role === 'RECRUITER' && !user.verified) {
        throw new ConflictException('Votre compte recruteur doit être vérifié pour créer un club');
      }

      if (user.role === 'PLAYER') {
        throw new ConflictException('Seuls les recruteurs et admins peuvent créer des clubs');
      }

      // Vérifier les limitations d'abonnement pour les clubs
      await this.checkClubLimitations(responsibleUserId);
    }

    // Créer le club avec statut PENDING par défaut
    const club = await this.prisma.club.create({
      data: {
        ...dto,
        status: 'PENDING',
        submittedAt: new Date(),
        responsibleUserId,
      },
      include: {
        responsibleUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Envoyer un email de confirmation au créateur
    if (club.responsibleUser) {
      await this.clubNotifications.sendClubSubmissionEmail(
        club.responsibleUser.email,
        club.responsibleUser.fullName || club.responsibleUser.email,
        club.name,
      );
    }

    // Notifier les admins
    await this.clubNotifications.notifyAdminsNewClub(
      club.name,
      club.responsibleUser?.fullName || 'Utilisateur',
      club.id,
    );

    return club;
  }

  /**
   * Vérifier les limitations d'abonnement pour les clubs
   */
  private async checkClubLimitations(userId: string) {
    // Récupérer l'abonnement actif de l'utilisateur
    const subscription = await this.subscriptionService.getUserActiveSubscription(userId);
    
    if (!subscription) {
      throw new ForbiddenException('Un abonnement actif est requis pour créer des clubs.');
    }

    const plan = subscription.plan;
    const features = plan.features as any;

    // Vérifier si la propriété maxClubs existe dans les features
    const maxClubs = features?.maxClubs ?? null;

    // Si maxClubs est null, c'est illimité
    if (maxClubs === null) {
      return;
    }

    // Compter les clubs dont l'utilisateur est président
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

    if (clubCount >= maxClubs) {
      throw new BadRequestException(
        `Limite de clubs atteinte (${clubCount}/${maxClubs}). Veuillez passer à un plan supérieur pour gérer plus de clubs.`
      );
    }
  }

  /**
   * Récupérer tous les clubs
   */
  async findAll(filters?: {
    country?: string;
    league?: string;
    verified?: boolean;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  }) {
    return this.prisma.club.findMany({
      where: {
        ...(filters?.country && { country: filters.country }),
        ...(filters?.league && { league: filters.league }),
        ...(filters?.verified !== undefined && { verified: filters.verified }),
        ...(filters?.status && { status: filters.status }),
        active: true,
      },
      orderBy: [
        { verified: 'desc' },
        { name: 'asc' },
      ],
      include: {
        events: {
          where: {
            startDate: {
              gte: new Date(),
            },
          },
          take: 5,
          orderBy: { startDate: 'asc' },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer un club par ID
   */
  async findOne(id: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    return club;
  }

  /**
   * Mettre à jour un club
   */
  async update(id: string, dto: UpdateClubDto) {
    const club = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    return this.prisma.club.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Supprimer un club
   */
  async remove(id: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    await this.prisma.club.delete({
      where: { id },
    });

    return { message: 'Club supprimé' };
  }

  /**
   * Rechercher des clubs
   */
  async search(query: string) {
    return this.prisma.club.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { league: { contains: query, mode: 'insensitive' } },
        ],
        active: true,
      },
      take: 20,
    });
  }

  /**
   * Vérifier un club (ancien système - maintenu pour compatibilité)
   */
  async verify(id: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    return this.prisma.club.update({
      where: { id },
      data: { 
        verified: true,
        status: 'APPROVED', // Mettre à jour le nouveau statut aussi
      },
    });
  }

  /**
   * Approuver un club
   * Ajoute automatiquement le créateur comme PRESIDENT
   */
  async approve(id: string, adminId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    // Approuver le club
    const approvedClub = await this.prisma.club.update({
      where: { id },
      data: { 
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        verified: true, // Mettre à jour l'ancien système aussi
      },
      include: {
        responsibleUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // ✅ AJOUTER AUTOMATIQUEMENT LE CRÉATEUR COMME PRÉSIDENT
    if (club.responsibleUserId) {
      // Vérifier s'il n'est pas déjà membre
      const existingMembership = await this.prisma.clubMember.findFirst({
        where: {
          clubId: id,
          userId: club.responsibleUserId,
          leftAt: null,
        },
      });

      if (!existingMembership) {
        await this.prisma.clubMember.create({
          data: {
            clubId: id,
            userId: club.responsibleUserId,
            role: 'PRESIDENT',
          },
        });
      }

      // Envoyer un email au créateur pour lui dire qu'il est président
      if (approvedClub.responsibleUser) {
        await this.clubNotifications.sendClubApprovedAsPresidentEmail(
          approvedClub.responsibleUser.email,
          approvedClub.responsibleUser.fullName || approvedClub.responsibleUser.email,
          approvedClub.name,
          approvedClub.id,
        );
      }
    }

    return approvedClub;
  }

  /**
   * Rejeter un club
   */
  async reject(id: string, adminId: string, reason?: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        responsibleUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    const rejectedClub = await this.prisma.club.update({
      where: { id },
      data: { 
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
      include: {
        responsibleUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Envoyer un email au créateur
    if (club.responsibleUser) {
      await this.clubNotifications.sendClubRejectionEmail(
        club.responsibleUser.email,
        club.responsibleUser.fullName || club.responsibleUser.email,
        club.name,
        reason,
      );
    }

    return rejectedClub;
  }

  /**
   * Suspendre un club
   */
  async suspend(id: string, adminId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        responsibleUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    const suspendedClub = await this.prisma.club.update({
      where: { id },
      data: { 
        status: 'SUSPENDED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        active: false,
      },
      include: {
        responsibleUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Envoyer un email au responsable
    if (club.responsibleUser) {
      await this.clubNotifications.sendClubSuspensionEmail(
        club.responsibleUser.email,
        club.responsibleUser.fullName || club.responsibleUser.email,
        club.name,
      );
    }

    return suspendedClub;
  }

  /**
   * Récupérer les clubs en attente d'approbation
   */
  async findPending() {
    return this.prisma.club.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        responsibleUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        documents: true,
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });
  }

  /**
   * Récupérer les clubs par statut
   */
  async findByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED') {
    return this.prisma.club.findMany({
      where: {
        status,
      },
      include: {
        responsibleUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            events: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

