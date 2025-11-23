import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormationDto, CreateLineupDto, UpdateFormationDto, UpdateLineupDto } from './dto';

@Injectable()
export class FormationsService {
  constructor(private prisma: PrismaService) {}

  // === FORMATIONS ===

  async createFormation(recruiterId: string, dto: CreateFormationDto) {
    // Si c'est la formation par défaut, désactiver les autres
    if (dto.isDefault) {
      await this.prisma.formation.updateMany({
        where: { recruiterId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const formation = await this.prisma.formation.create({
      data: {
        recruiterId,
        ...dto,
      },
      include: {
        recruiter: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return formation;
  }

  async getFormations(recruiterId: string) {
    return this.prisma.formation.findMany({
      where: { recruiterId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async getFormation(id: string, recruiterId: string) {
    const formation = await this.prisma.formation.findUnique({
      where: { id },
      include: {
        recruiter: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!formation) {
      throw new NotFoundException('Formation introuvable');
    }

    if (formation.recruiterId !== recruiterId) {
      throw new ForbiddenException('Accès non autorisé');
    }

    return formation;
  }

  async updateFormation(id: string, recruiterId: string, dto: UpdateFormationDto) {
    const formation = await this.getFormation(id, recruiterId);

    // Si on définit comme par défaut, désactiver les autres
    if (dto.isDefault === true) {
      await this.prisma.formation.updateMany({
        where: { recruiterId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.formation.update({
      where: { id },
      data: dto,
    });
  }

  async deleteFormation(id: string, recruiterId: string) {
    await this.getFormation(id, recruiterId);

    await this.prisma.formation.delete({
      where: { id },
    });

    return { message: 'Formation supprimée' };
  }

  // === LIGNEUPS ===

  async createLineup(recruiterId: string, dto: CreateLineupDto) {
    const lineup = await this.prisma.lineup.create({
      data: {
        recruiterId,
        ...dto,
      },
      include: {
        formation: true,
        recruiter: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return lineup;
  }

  async getLineups(recruiterId: string) {
    return this.prisma.lineup.findMany({
      where: { recruiterId },
      include: {
        formation: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLineup(id: string, recruiterId: string) {
    const lineup = await this.prisma.lineup.findUnique({
      where: { id },
      include: {
        formation: true,
        recruiter: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!lineup) {
      throw new NotFoundException('Lineup introuvable');
    }

    if (lineup.recruiterId !== recruiterId) {
      throw new ForbiddenException('Accès non autorisé');
    }

    return lineup;
  }

  async updateLineup(id: string, recruiterId: string, dto: UpdateLineupDto) {
    await this.getLineup(id, recruiterId);

    return this.prisma.lineup.update({
      where: { id },
      data: dto,
    });
  }

  async deleteLineup(id: string, recruiterId: string) {
    await this.getLineup(id, recruiterId);

    await this.prisma.lineup.delete({
      where: { id },
    });

    return { message: 'Lineup supprimée' };
  }

  // === ANALYTICS FORMATIONS ===

  async getFormationStats(recruiterId: string) {
    const [formations, lineups, mostUsedFormation] = await Promise.all([
      this.prisma.formation.count({ where: { recruiterId } }),
      this.prisma.lineup.count({ where: { recruiterId } }),
      this.prisma.lineup.groupBy({
        by: ['formationId'],
        where: { recruiterId },
        _count: { formationId: true },
        orderBy: { _count: { formationId: 'desc' } },
        take: 1,
      }),
    ]);

    return {
      totalFormations: formations,
      totalLineups: lineups,
      mostUsedFormation: mostUsedFormation[0] || null,
    };
  }

  // === JOUEURS DISPONIBLES POUR FORMATIONS ===

  async getAvailablePlayers(recruiterId: string) {
    // Récupérer les joueurs qui ont accepté des offres de ce recruteur
    const acceptedOffers = await this.prisma.recruitRequest.findMany({
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
                secondaryPos: true,
                level: true,
                currentClub: true,
                heightCm: true,
                weightKg: true,
                jerseyNumber: true,
              },
            },
          },
        },
      },
    });

    return acceptedOffers.map(offer => ({
      id: offer.toUserId,
      fullName: offer.toUser.fullName,
      avatarUrl: offer.toUser.avatarUrl,
      position: offer.toUser.playerProfile?.position,
      secondaryPos: offer.toUser.playerProfile?.secondaryPos,
      level: offer.toUser.playerProfile?.level,
      currentClub: offer.toUser.playerProfile?.currentClub,
      heightCm: offer.toUser.playerProfile?.heightCm,
      weightKg: offer.toUser.playerProfile?.weightKg,
      jerseyNumber: offer.toUser.playerProfile?.jerseyNumber,
    }));
  }
}
