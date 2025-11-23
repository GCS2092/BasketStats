import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClubRole } from '@prisma/client';
import { ClubNotificationsService } from './club-notifications.service';

@Injectable()
export class ClubMembersService {
  constructor(
    private prisma: PrismaService,
    private clubNotifications: ClubNotificationsService,
  ) {}

  /**
   * Ajouter un membre à un club
   */
  async addMember(clubId: string, userId: string, role: ClubRole, requesterId: string) {
    // Vérifier que le club existe
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      include: { members: true },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    // Vérifier les permissions (seuls les admins, présidents et directeurs peuvent ajouter des membres)
    const requesterMembership = await this.prisma.clubMember.findFirst({
      where: {
        clubId,
        userId: requesterId,
        role: { in: ['PRESIDENT', 'DIRECTOR'] },
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('Vous n\'avez pas les permissions pour ajouter des membres');
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMembership = await this.prisma.clubMember.findFirst({
      where: {
        clubId,
        userId,
        leftAt: null, // Pas encore parti
      },
    });

    if (existingMembership) {
      throw new ConflictException('Cet utilisateur est déjà membre de ce club');
    }

    return this.prisma.clubMember.create({
      data: {
        clubId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer les membres d'un club
   */
  async getClubMembers(clubId: string, requesterId: string) {
    // Vérifier que le club existe
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    // Vérifier que l'utilisateur est membre du club
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        clubId,
        userId: requesterId,
        leftAt: null,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Vous n\'êtes pas membre de ce club');
    }

    return this.prisma.clubMember.findMany({
      where: {
        clubId,
        leftAt: null, // Membres actifs seulement
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // Trier par rôle
        { joinedAt: 'asc' }, // Puis par date d'arrivée
      ],
    });
  }

  /**
   * Modifier le rôle d'un membre
   */
  async updateMemberRole(clubId: string, memberId: string, newRole: ClubRole, requesterId: string) {
    // Vérifier que le club existe
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    // Vérifier les permissions (seuls les présidents peuvent modifier les rôles)
    const requesterMembership = await this.prisma.clubMember.findFirst({
      where: {
        clubId,
        userId: requesterId,
        role: 'PRESIDENT',
        leftAt: null,
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('Seul le président peut modifier les rôles');
    }

    // Vérifier que le membre existe
    const member = await this.prisma.clubMember.findFirst({
      where: {
        id: memberId,
        clubId,
        leftAt: null,
      },
    });

    if (!member) {
      throw new NotFoundException('Membre non trouvé');
    }

    return this.prisma.clubMember.update({
      where: { id: memberId },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Retirer un membre d'un club
   */
  async removeMember(clubId: string, memberId: string, requesterId: string) {
    // Vérifier que le club existe
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    // Vérifier les permissions
    const requesterMembership = await this.prisma.clubMember.findFirst({
      where: {
        clubId,
        userId: requesterId,
        role: { in: ['PRESIDENT', 'DIRECTOR'] },
        leftAt: null,
      },
    });

    // Permettre aussi à un membre de se retirer lui-même
    const isSelfRemoval = memberId === requesterId;

    if (!requesterMembership && !isSelfRemoval) {
      throw new ForbiddenException('Vous n\'avez pas les permissions pour retirer ce membre');
    }

    // Vérifier que le membre existe
    const member = await this.prisma.clubMember.findFirst({
      where: {
        id: memberId,
        clubId,
        leftAt: null,
      },
    });

    if (!member) {
      throw new NotFoundException('Membre non trouvé');
    }

    // Empêcher le président de se retirer s'il est le seul président
    if (member.role === 'PRESIDENT' && isSelfRemoval) {
      const presidentCount = await this.prisma.clubMember.count({
        where: {
          clubId,
          role: 'PRESIDENT',
          leftAt: null,
        },
      });

      if (presidentCount <= 1) {
        throw new ConflictException('Le club doit avoir au moins un président');
      }
    }

    return this.prisma.clubMember.update({
      where: { id: memberId },
      data: { leftAt: new Date() },
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

  /**
   * Récupérer les clubs d'un utilisateur
   */
  async getUserClubs(userId: string) {
    return this.prisma.clubMember.findMany({
      where: {
        userId,
        leftAt: null, // Clubs actifs seulement
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logo: true,
            city: true,
            country: true,
            league: true,
            status: true,
            verified: true,
            _count: {
              select: {
                members: true,
                events: true,
              },
            },
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // Trier par rôle
        { joinedAt: 'desc' }, // Puis par date d'arrivée
      ],
    });
  }

  /**
   * Demander à rejoindre un club
   */
  async requestToJoin(clubId: string, userId: string, requestedRole: ClubRole = 'PLAYER') {
    // Vérifier que le club existe et est approuvé
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    if (club.status !== 'APPROVED') {
      throw new ForbiddenException('Ce club n\'est pas encore approuvé');
    }

    // Vérifier si l'utilisateur est déjà membre ou a déjà fait une demande
    const existingMembership = await this.prisma.clubMember.findFirst({
      where: {
        clubId,
        userId,
        leftAt: null,
      },
    });

    if (existingMembership) {
      throw new ConflictException('Vous êtes déjà membre de ce club');
    }

    // Pour l'instant, on ajoute directement le membre
    // Dans une version plus avancée, on pourrait créer un système de demandes
    const membership = await this.prisma.clubMember.create({
      data: {
        clubId,
        userId,
        role: requestedRole,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Envoyer un email de confirmation
    if (membership.user) {
      await this.clubNotifications.sendClubMemberAddedEmail(
        membership.user.email,
        membership.user.fullName || membership.user.email,
        membership.club.name,
        requestedRole,
        clubId,
      );
    }

    return membership;
  }

  /**
   * Obtenir les statistiques d'un club
   */
  async getClubStats(clubId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    const [
      totalMembers,
      membersByRole,
      recentMembers,
    ] = await Promise.all([
      this.prisma.clubMember.count({
        where: {
          clubId,
          leftAt: null,
        },
      }),
      this.prisma.clubMember.groupBy({
        by: ['role'],
        where: {
          clubId,
          leftAt: null,
        },
        _count: {
          role: true,
        },
      }),
      this.prisma.clubMember.findMany({
        where: {
          clubId,
          leftAt: null,
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
        orderBy: {
          joinedAt: 'desc',
        },
        take: 5,
      }),
    ]);

    return {
      totalMembers,
      membersByRole,
      recentMembers,
    };
  }
}
