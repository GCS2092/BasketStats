import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('plans')
  async getPlans() {
    return await this.subscriptionService.getAvailablePlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('current')
  async getCurrentSubscription(@Request() req) {
    return await this.subscriptionService.getCurrentSubscription(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('can-access-dashboard')
  async canAccessDashboard(@Request() req) {
    const canAccess = await this.subscriptionService.canAccessDashboard(req.user.id);
    return { canAccess };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createSubscription(
    @Request() req,
    @Body() body: { planId: string; transactionId?: string; paymentMethod?: string }
  ) {
    return await this.subscriptionService.createSubscription(
      req.user.id,
      body.planId,
      body.transactionId,
      body.paymentMethod
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-plan')
  async changePlan(
    @Request() req,
    @Body() body: { planId: string; paymentMethod?: string }
  ) {
    console.log(`🎯 [CONTROLLER] POST /subscriptions/change-plan appelé`);
    console.log(`🎯 [CONTROLLER] Utilisateur: ${req.user?.id}`);
    console.log(`🎯 [CONTROLLER] Données reçues:`, JSON.stringify(body, null, 2));
    console.log(`🎯 [CONTROLLER] Headers:`, JSON.stringify(req.headers, null, 2));
    
    try {
      const result = await this.subscriptionService.changePlan(
        req.user.id,
        body.planId,
        body.paymentMethod
      );
      
      console.log(`✅ [CONTROLLER] Changement de plan réussi:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.log(`❌ [CONTROLLER] Erreur lors du changement de plan:`, error.message);
      console.log(`❌ [CONTROLLER] Stack trace:`, error.stack);
      throw error;
    }
  }
}
