import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../guards/subscription.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Request } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Tracker une vue de profil
   */
  @Post('profile-view/:profileId')
  async trackProfileView(
    @Param('profileId') profileId: string,
    @GetUser('id') viewerId: string | undefined,
    @Req() req: Request,
  ) {
    await this.analyticsService.trackProfileView(profileId, viewerId, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
    });
    return { message: 'Vue enregistrée' };
  }

  /**
   * Statistiques de profil pour un joueur
   */
  @Get('profile/:userId')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async getProfileStats(
    @Param('userId') userId: string,
    @Query('period') period?: 'week' | 'month' | 'all',
  ) {
    return this.analyticsService.getProfileStats(userId, period);
  }

  /**
   * Dashboard recruteur
   */
  @Get('recruiter/dashboard')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async getRecruiterDashboard(@GetUser('id') recruiterId: string) {
    return this.analyticsService.getRecruiterDashboard(recruiterId);
  }

  /**
   * Statistiques plateforme (admin)
   */
  @Get('platform')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async getPlatformStats() {
    return this.analyticsService.getPlatformStats();
  }
}

