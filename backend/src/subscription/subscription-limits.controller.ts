import { Controller, Get, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionLimitsService } from './subscription-limits.service';

@Controller('subscriptions')
export class SubscriptionLimitsController {
  constructor(private readonly limitsService: SubscriptionLimitsService) {}

  /**
   * Récupérer les limites d'abonnement de l'utilisateur connecté
   */
  @Get('limits')
  @UseGuards(JwtAuthGuard)
  async getLimits(@Request() req) {
    try {
      const userId = req.user.id;
      const limits = await this.limitsService.getUserLimits(userId);
      
      return {
        success: true,
        data: limits,
      };
    } catch (error) {
      console.error('❌ [LIMITS] Erreur lors de la récupération des limites:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération des limites d\'abonnement',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Vérifier si l'utilisateur peut créer un post
   */
  @Get('can-create-post')
  @UseGuards(JwtAuthGuard)
  async canCreatePost(@Request() req) {
    try {
      const userId = req.user.id;
      const result = await this.limitsService.canCreatePost(userId);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('❌ [LIMITS] Erreur lors de la vérification des posts:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la vérification des limites de posts',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Vérifier si l'utilisateur peut créer un club
   */
  @Get('can-create-club')
  @UseGuards(JwtAuthGuard)
  async canCreateClub(@Request() req) {
    try {
      const userId = req.user.id;
      const result = await this.limitsService.canCreateClub(userId);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('❌ [LIMITS] Erreur lors de la vérification des clubs:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la vérification des limites de clubs',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Vérifier si l'utilisateur peut créer un profil de joueur
   */
  @Get('can-create-player')
  @UseGuards(JwtAuthGuard)
  async canCreatePlayer(@Request() req) {
    try {
      const userId = req.user.id;
      const result = await this.limitsService.canCreatePlayerProfile(userId);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('❌ [LIMITS] Erreur lors de la vérification des joueurs:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la vérification des limites de joueurs',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
