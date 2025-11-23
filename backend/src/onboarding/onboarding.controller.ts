import { Controller, Get, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * Récupérer le progrès d'onboarding de l'utilisateur connecté
   */
  @Get('progress')
  @UseGuards(JwtAuthGuard)
  async getProgress(@Request() req) {
    try {
      const userId = req.user.id;
      const data = await this.onboardingService.getOnboardingProgress(userId);
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur lors de la récupération du progrès:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération du progrès d\'onboarding',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Marquer une étape comme terminée
   */
  @Post('complete-step')
  @UseGuards(JwtAuthGuard)
  async completeStep(@Request() req, @Body() body: { stepId: string }) {
    try {
      const userId = req.user.id;
      const { stepId } = body;

      if (!stepId) {
        throw new HttpException(
          {
            success: false,
            message: 'ID de l\'étape requis',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.onboardingService.completeStep(userId, stepId);
      
      return {
        success: true,
        message: 'Étape marquée comme terminée',
      };
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur lors de la completion de l\'étape:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la completion de l\'étape',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Passer à l'étape suivante
   */
  @Post('next-step')
  @UseGuards(JwtAuthGuard)
  async nextStep(@Request() req) {
    try {
      const userId = req.user.id;
      const result = await this.onboardingService.nextStep(userId);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur lors du passage à l\'étape suivante:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors du passage à l\'étape suivante',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Terminer l'onboarding
   */
  @Post('complete')
  @UseGuards(JwtAuthGuard)
  async completeOnboarding(@Request() req) {
    try {
      const userId = req.user.id;
      await this.onboardingService.completeOnboarding(userId);
      
      return {
        success: true,
        message: 'Onboarding terminé avec succès',
      };
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur lors de la completion de l\'onboarding:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la completion de l\'onboarding',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Réinitialiser l'onboarding
   */
  @Post('reset')
  @UseGuards(JwtAuthGuard)
  async resetOnboarding(@Request() req) {
    try {
      const userId = req.user.id;
      await this.onboardingService.resetOnboarding(userId);
      
      return {
        success: true,
        message: 'Onboarding réinitialisé',
      };
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur lors de la réinitialisation:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la réinitialisation de l\'onboarding',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Vérifier si l'utilisateur a besoin d'onboarding
   */
  @Get('needs-onboarding')
  @UseGuards(JwtAuthGuard)
  async needsOnboarding(@Request() req) {
    try {
      const userId = req.user.id;
      const needsOnboarding = await this.onboardingService.needsOnboarding(userId);
      
      return {
        success: true,
        data: { needsOnboarding },
      };
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur lors de la vérification:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la vérification du besoin d\'onboarding',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
