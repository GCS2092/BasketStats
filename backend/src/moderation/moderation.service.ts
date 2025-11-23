import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto, CreateBlockDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ModerationService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Créer un signalement
   */
  async createReport(reporterId: string, dto: CreateReportDto) {
    // Vérifier que le contenu existe
    await this.validateContent(dto.contentType, dto.contentId);

    const report = await this.prisma.report.create({
      data: {
        reporterId,
        contentType: dto.contentType,
        contentId: dto.contentId,
        reason: dto.reason,
        description: dto.description,
      },
    });

    return report;
  }

  /**
   * Valider l'existence d'un contenu
   */
  private async validateContent(contentType: string, contentId: string) {
    let exists = false;

    switch (contentType) {
      case 'user':
        exists = !!(await this.prisma.user.findUnique({ where: { id: contentId } }));
        break;
      case 'post':
        exists = !!(await this.prisma.post.findUnique({ where: { id: contentId } }));
        break;
      case 'video':
        exists = !!(await this.prisma.video.findUnique({ where: { id: contentId } }));
        break;
      case 'comment':
        exists = !!(await this.prisma.comment.findUnique({ where: { id: contentId } }));
        break;
    }

    if (!exists) {
      throw new NotFoundException('Contenu introuvable');
    }
  }

  /**
   * Récupérer les signalements (admin)
   */
  async getReports(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Bloquer un utilisateur
   */
  async blockUser(blockerId: string, dto: CreateBlockDto) {
    const { blockedId, reason } = dto;

    // Vérifier que l'utilisateur à bloquer existe
    const blocked = await this.prisma.user.findUnique({
      where: { id: blockedId },
    });

    if (!blocked) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Empêcher de se bloquer soi-même
    if (blockerId === blockedId) {
      throw new ForbiddenException('Vous ne pouvez pas vous bloquer vous-même');
    }

    // Créer le blocage (ou ne rien faire si déjà bloqué)
    const block = await this.prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
      create: {
        blockerId,
        blockedId,
        reason,
      },
      update: {},
    });

    // Supprimer les follows mutuels si existants
    await Promise.all([
      this.prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followeeId: blockedId },
            { followerId: blockedId, followeeId: blockerId },
          ],
        },
      }),
    ]);

    return { message: 'Utilisateur bloqué avec succès', block };
  }

  /**
   * Débloquer un utilisateur
   */
  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    return { message: 'Utilisateur débloqué' };
  }

  /**
   * Vérifier si un utilisateur est bloqué
   */
  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await this.prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    return !!block;
  }

  /**
   * Récupérer la liste des utilisateurs bloqués
   */
  async getBlockedUsers(blockerId: string) {
    const blocks = await this.prisma.block.findMany({
      where: { blockerId },
      orderBy: { createdAt: 'desc' },
    });

    // Récupérer les infos des utilisateurs bloqués
    const blockedIds = blocks.map(b => b.blockedId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: blockedIds } },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        role: true,
      },
    });

    return blocks.map(block => ({
      ...block,
      blockedUser: users.find(u => u.id === block.blockedId),
    }));
  }

  /**
   * Vérifier si deux utilisateurs ont un blocage mutuel
   */
  async checkMutualBlock(userId1: string, userId2: string): Promise<boolean> {
    const blocks = await this.prisma.block.findMany({
      where: {
        OR: [
          { blockerId: userId1, blockedId: userId2 },
          { blockerId: userId2, blockedId: userId1 },
        ],
      },
    });

    return blocks.length > 0;
  }
}

