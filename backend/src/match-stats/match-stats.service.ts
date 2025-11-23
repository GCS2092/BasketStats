import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchStatsDto, UpdateMatchStatsDto } from './dto';

@Injectable()
export class MatchStatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer des stats de match
   */
  async create(dto: CreateMatchStatsDto) {
    return this.prisma.matchStats.create({
      data: {
        playerId: dto.playerId,
        matchDate: new Date(dto.matchDate),
        opponent: dto.opponent,
        homeAway: dto.homeAway,
        result: dto.result,
        score: dto.score,
        points: dto.points,
        fieldGoalsMade: dto.fieldGoalsMade || 0,
        fieldGoalsAttempted: dto.fieldGoalsAttempted || 0,
        threePointersMade: dto.threePointersMade || 0,
        threePointersAttempted: dto.threePointersAttempted || 0,
        freeThrowsMade: dto.freeThrowsMade || 0,
        freeThrowsAttempted: dto.freeThrowsAttempted || 0,
        rebounds: dto.rebounds || 0,
        offensiveRebounds: dto.offensiveRebounds || 0,
        defensiveRebounds: dto.defensiveRebounds || 0,
        assists: dto.assists || 0,
        steals: dto.steals || 0,
        blocks: dto.blocks || 0,
        turnovers: dto.turnovers || 0,
        fouls: dto.fouls || 0,
        minutesPlayed: dto.minutesPlayed,
        performance: dto.performance,
        highlights: dto.highlights || [],
      },
    });
  }

  /**
   * Récupérer toutes les stats d'un joueur
   */
  async findByPlayer(playerId: string) {
    return this.prisma.matchStats.findMany({
      where: { playerId },
      orderBy: { matchDate: 'desc' },
    });
  }

  /**
   * Récupérer les stats d'un match spécifique
   */
  async findOne(id: string) {
    const stats = await this.prisma.matchStats.findUnique({
      where: { id },
      include: {
        playerProfile: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!stats) {
      throw new NotFoundException('Stats de match non trouvées');
    }

    return stats;
  }

  /**
   * Mettre à jour des stats de match
   */
  async update(id: string, dto: UpdateMatchStatsDto) {
    const stats = await this.prisma.matchStats.findUnique({
      where: { id },
    });

    if (!stats) {
      throw new NotFoundException('Stats de match non trouvées');
    }

    return this.prisma.matchStats.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Supprimer des stats de match
   */
  async remove(id: string) {
    const stats = await this.prisma.matchStats.findUnique({
      where: { id },
    });

    if (!stats) {
      throw new NotFoundException('Stats de match non trouvées');
    }

    await this.prisma.matchStats.delete({
      where: { id },
    });

    return { message: 'Stats de match supprimées' };
  }

  /**
   * Calculer les moyennes d'un joueur
   */
  async getPlayerAverages(playerId: string) {
    const stats = await this.prisma.matchStats.findMany({
      where: { playerId },
    });

    if (stats.length === 0) {
      return {
        gamesPlayed: 0,
        averages: {},
      };
    }

    const totals = stats.reduce(
      (acc, stat) => ({
        points: acc.points + stat.points,
        rebounds: acc.rebounds + stat.rebounds,
        assists: acc.assists + stat.assists,
        steals: acc.steals + stat.steals,
        blocks: acc.blocks + stat.blocks,
        turnovers: acc.turnovers + stat.turnovers,
        fieldGoalsMade: acc.fieldGoalsMade + stat.fieldGoalsMade,
        fieldGoalsAttempted: acc.fieldGoalsAttempted + stat.fieldGoalsAttempted,
        threePointersMade: acc.threePointersMade + stat.threePointersMade,
        threePointersAttempted: acc.threePointersAttempted + stat.threePointersAttempted,
      }),
      {
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        fieldGoalsMade: 0,
        fieldGoalsAttempted: 0,
        threePointersMade: 0,
        threePointersAttempted: 0,
      },
    );

    const gamesPlayed = stats.length;

    return {
      gamesPlayed,
      averages: {
        points: (totals.points / gamesPlayed).toFixed(1),
        rebounds: (totals.rebounds / gamesPlayed).toFixed(1),
        assists: (totals.assists / gamesPlayed).toFixed(1),
        steals: (totals.steals / gamesPlayed).toFixed(1),
        blocks: (totals.blocks / gamesPlayed).toFixed(1),
        turnovers: (totals.turnovers / gamesPlayed).toFixed(1),
        fieldGoalPercentage: totals.fieldGoalsAttempted > 0
          ? ((totals.fieldGoalsMade / totals.fieldGoalsAttempted) * 100).toFixed(1)
          : '0.0',
        threePointPercentage: totals.threePointersAttempted > 0
          ? ((totals.threePointersMade / totals.threePointersAttempted) * 100).toFixed(1)
          : '0.0',
      },
      totals,
    };
  }

  /**
   * Récupérer les meilleurs matchs d'un joueur
   */
  async getTopMatches(playerId: string, limit = 5) {
    return this.prisma.matchStats.findMany({
      where: { playerId },
      orderBy: { points: 'desc' },
      take: limit,
    });
  }
}

