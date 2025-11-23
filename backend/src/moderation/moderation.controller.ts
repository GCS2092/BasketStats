import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { AutoModerationService } from './auto-moderation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateReportDto, CreateBlockDto } from './dto';

@Controller('moderation')
export class ModerationController {
  constructor(
    private moderationService: ModerationService,
    private autoModerationService: AutoModerationService,
  ) {}

  /**
   * Signaler du contenu
   */
  @Post('report')
  @UseGuards(JwtAuthGuard)
  async createReport(@GetUser('id') reporterId: string, @Body() dto: CreateReportDto) {
    return this.moderationService.createReport(reporterId, dto);
  }

  /**
   * Récupérer les signalements (admin)
   */
  @Get('reports')
  @UseGuards(JwtAuthGuard)
  async getReports(@Query('status') status?: string) {
    return this.moderationService.getReports(status);
  }

  /**
   * Bloquer un utilisateur
   */
  @Post('block')
  @UseGuards(JwtAuthGuard)
  async blockUser(@GetUser('id') blockerId: string, @Body() dto: CreateBlockDto) {
    return this.moderationService.blockUser(blockerId, dto);
  }

  /**
   * Débloquer un utilisateur
   */
  @Delete('block/:blockedId')
  @UseGuards(JwtAuthGuard)
  async unblockUser(@GetUser('id') blockerId: string, @Param('blockedId') blockedId: string) {
    return this.moderationService.unblockUser(blockerId, blockedId);
  }

  /**
   * Vérifier si un utilisateur est bloqué
   */
  @Get('is-blocked/:userId')
  @UseGuards(JwtAuthGuard)
  async isBlocked(@GetUser('id') blockerId: string, @Param('userId') blockedId: string) {
    const blocked = await this.moderationService.isBlocked(blockerId, blockedId);
    return { isBlocked: blocked };
  }

  /**
   * Liste des utilisateurs bloqués
   */
  @Get('blocked-users')
  @UseGuards(JwtAuthGuard)
  async getBlockedUsers(@GetUser('id') blockerId: string) {
    return this.moderationService.getBlockedUsers(blockerId);
  }

  /**
   * Vérifier un contenu avant publication (modération automatique)
   */
  @Post('check-content')
  @UseGuards(JwtAuthGuard)
  async checkContent(
    @GetUser('id') userId: string,
    @Body() body: { content: string; contentType: 'POST' | 'COMMENT' | 'MESSAGE' }
  ) {
    const analysis = await this.autoModerationService.analyzeContent(
      body.content,
      userId,
      body.contentType,
    );

    // Si contenu bloqué, enregistrer et notifier
    if (analysis.shouldBlock) {
      await this.autoModerationService.recordBlock(
        userId,
        body.contentType,
        body.content,
        `Score de modération: ${analysis.score}`,
      );
      await this.autoModerationService.notifyAdmins(
        userId,
        body.contentType,
        body.content,
        analysis.issues,
        analysis.severity,
      );
    } else if (analysis.issues.length > 0) {
      // Si contenu suspect mais pas bloqué, enregistrer un avertissement
      await this.autoModerationService.recordWarning(
        userId,
        body.contentType,
        body.content,
        analysis.issues,
      );
    }

    return {
      ...analysis,
      suggestions: this.autoModerationService.getSuggestions(analysis.issues),
    };
  }

  /**
   * Nettoyer un contenu (remplacer mots interdits par ***)
   */
  @Post('clean-content')
  @UseGuards(JwtAuthGuard)
  async cleanContent(@Body() body: { content: string }) {
    const cleaned = this.autoModerationService.cleanContent(body.content);
    return { cleaned };
  }
}

