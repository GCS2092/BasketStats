import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TeamCategory, Position } from '@prisma/client';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une équipe
   */
  async createTeam(
    clubId: string,
    data: {
      name: string;
      category: TeamCategory;
      season: string;
      headCoachId?: string;
      description?: string;
    },
    requesterId: string,
  ) {
    // Vérifier que le club existe
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    // Vérifier les permissions (président, directeur ou coach)
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        clubId,
        userId: requesterId,
        role: { in: ['PRESIDENT', 'DIRECTOR', 'COACH'] },
        leftAt: null,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Vous n\'avez pas les permissions pour créer une équipe');
    }

    // Vérifier qu'une équipe avec ce nom n'existe pas déjà pour cette saison
    const existingTeam = await this.prisma.team.findFirst({
      where: {
        clubId,
        name: data.name,
        season: data.season,
      },
    });

    if (existingTeam) {
      throw new ConflictException('Une équipe avec ce nom existe déjà pour cette saison');
    }

    return this.prisma.team.create({
      data: {
        clubId,
        ...data,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        headCoach: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            players: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer les équipes d'un club
   */
  async getClubTeams(clubId: string, season?: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    return this.prisma.team.findMany({
      where: {
        clubId,
        ...(season && { season }),
        active: true,
      },
      include: {
        headCoach: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            players: true,
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Récupérer une équipe par ID
   */
  async getTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logo: true,
            city: true,
            country: true,
          },
        },
        headCoach: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        players: {
          where: {
            leftAt: null,
          },
          include: {
            player: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
                playerProfile: {
                  select: {
                    heightCm: true,
                    weightKg: true,
                    position: true,
                    level: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { isCaptain: 'desc' },
            { isStarter: 'desc' },
            { jerseyNumber: 'asc' },
          ],
        },
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Équipe non trouvée');
    }

    return team;
  }

  /**
   * Mettre à jour une équipe
   */
  async updateTeam(
    teamId: string,
    data: {
      name?: string;
      category?: TeamCategory;
      season?: string;
      headCoachId?: string;
      description?: string;
      active?: boolean;
    },
    requesterId: string,
  ) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { club: true },
    });

    if (!team) {
      throw new NotFoundException('Équipe non trouvée');
    }

    // Vérifier les permissions
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        clubId: team.clubId,
        userId: requesterId,
        role: { in: ['PRESIDENT', 'DIRECTOR', 'COACH'] },
        leftAt: null,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Vous n\'avez pas les permissions pour modifier cette équipe');
    }

    return this.prisma.team.update({
      where: { id: teamId },
      data,
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        headCoach: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            players: true,
          },
        },
      },
    });
  }

  /**
   * Supprimer une équipe
   */
  async deleteTeam(teamId: string, requesterId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { club: true },
    });

    if (!team) {
      throw new NotFoundException('Équipe non trouvée');
    }

    // Vérifier les permissions (seuls président et directeur)
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        clubId: team.clubId,
        userId: requesterId,
        role: { in: ['PRESIDENT', 'DIRECTOR'] },
        leftAt: null,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Vous n\'avez pas les permissions pour supprimer cette équipe');
    }

    return this.prisma.team.delete({
      where: { id: teamId },
    });
  }

  /**
   * Ajouter un joueur à une équipe
   */
  async addPlayerToTeam(
    teamId: string,
    data: {
      playerId: string;
      jerseyNumber?: number;
      position?: Position;
      isCaptain?: boolean;
      isStarter?: boolean;
    },
    requesterId: string,
  ) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { club: true },
    });

    if (!team) {
      throw new NotFoundException('Équipe non trouvée');
    }

    // Vérifier les permissions
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        clubId: team.clubId,
        userId: requesterId,
        role: { in: ['PRESIDENT', 'DIRECTOR', 'COACH'] },
        leftAt: null,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Vous n\'avez pas les permissions pour ajouter des joueurs');
    }

    // Vérifier que le joueur est membre du club
    const playerMembership = await this.prisma.clubMember.findFirst({
      where: {
        clubId: team.clubId,
        userId: data.playerId,
        leftAt: null,
      },
    });

    if (!playerMembership) {
      throw new ForbiddenException('Le joueur doit être membre du club');
    }

    // Vérifier que le joueur n'est pas déjà dans l'équipe
    const existingPlayer = await this.prisma.teamPlayer.findFirst({
      where: {
        teamId,
        playerId: data.playerId,
        leftAt: null,
      },
    });

    if (existingPlayer) {
      throw new ConflictException('Ce joueur est déjà dans l\'équipe');
    }

    // Vérifier que le numéro de maillot n'est pas déjà pris
    if (data.jerseyNumber) {
      const existingNumber = await this.prisma.teamPlayer.findFirst({
        where: {
          teamId,
          jerseyNumber: data.jerseyNumber,
          leftAt: null,
        },
      });

      if (existingNumber) {
        throw new ConflictException('Ce numéro de maillot est déjà pris');
      }
    }

    return this.prisma.teamPlayer.create({
      data: {
        teamId,
        ...data,
      },
      include: {
        player: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            playerProfile: {
              select: {
                heightCm: true,
                weightKg: true,
                position: true,
                level: true,
              },
            },
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });
  }

  /**
   * Mettre à jour un joueur dans une équipe
   */
  async updateTeamPlayer(
    teamPlayerId: string,
    data: {
      jerseyNumber?: number;
      position?: Position;
      isCaptain?: boolean;
      isStarter?: boolean;
    },
    requesterId: string,
  ) {
    const teamPlayer = await this.prisma.teamPlayer.findUnique({
      where: { id: teamPlayerId },
      include: {
        team: {
          include: {
            club: true,
          },
        },
      },
    });

    if (!teamPlayer) {
      throw new NotFoundException('Joueur non trouvé dans l\'équipe');
    }

    // Vérifier les permissions
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        clubId: teamPlayer.team.clubId,
        userId: requesterId,
        role: { in: ['PRESIDENT', 'DIRECTOR', 'COACH'] },
        leftAt: null,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Vous n\'avez pas les permissions pour modifier ce joueur');
    }

    // Vérifier le numéro de maillot si changé
    if (data.jerseyNumber && data.jerseyNumber !== teamPlayer.jerseyNumber) {
      const existingNumber = await this.prisma.teamPlayer.findFirst({
        where: {
          teamId: teamPlayer.teamId,
          jerseyNumber: data.jerseyNumber,
          leftAt: null,
          id: { not: teamPlayerId },
        },
      });

      if (existingNumber) {
        throw new ConflictException('Ce numéro de maillot est déjà pris');
      }
    }

    return this.prisma.teamPlayer.update({
      where: { id: teamPlayerId },
      data,
      include: {
        player: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Retirer un joueur d'une équipe
   */
  async removePlayerFromTeam(teamPlayerId: string, requesterId: string) {
    const teamPlayer = await this.prisma.teamPlayer.findUnique({
      where: { id: teamPlayerId },
      include: {
        team: {
          include: {
            club: true,
          },
        },
      },
    });

    if (!teamPlayer) {
      throw new NotFoundException('Joueur non trouvé dans l\'équipe');
    }

    // Vérifier les permissions
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        clubId: teamPlayer.team.clubId,
        userId: requesterId,
        role: { in: ['PRESIDENT', 'DIRECTOR', 'COACH'] },
        leftAt: null,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Vous n\'avez pas les permissions pour retirer ce joueur');
    }

    return this.prisma.teamPlayer.update({
      where: { id: teamPlayerId },
      data: {
        leftAt: new Date(),
      },
      include: {
        player: {
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
   * Obtenir les statistiques d'une équipe
   */
  async getTeamStats(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Équipe non trouvée');
    }

    const [
      totalPlayers,
      playersByPosition,
      starters,
      captain,
    ] = await Promise.all([
      this.prisma.teamPlayer.count({
        where: {
          teamId,
          leftAt: null,
        },
      }),
      this.prisma.teamPlayer.groupBy({
        by: ['position'],
        where: {
          teamId,
          leftAt: null,
        },
        _count: {
          position: true,
        },
      }),
      this.prisma.teamPlayer.count({
        where: {
          teamId,
          leftAt: null,
          isStarter: true,
        },
      }),
      this.prisma.teamPlayer.findFirst({
        where: {
          teamId,
          leftAt: null,
          isCaptain: true,
        },
        include: {
          player: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return {
      totalPlayers,
      playersByPosition,
      starters,
      captain,
    };
  }

  /**
   * Obtenir les équipes d'un utilisateur
   */
  async getUserTeams(userId: string) {
    return this.prisma.teamPlayer.findMany({
      where: {
        playerId: userId,
        leftAt: null,
      },
      include: {
        team: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logo: true,
                city: true,
                country: true,
              },
            },
            headCoach: {
              select: {
                id: true,
                fullName: true,
              },
            },
            _count: {
              select: {
                players: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });
  }
}
