import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur peut accéder au dashboard
    const canAccess = await this.subscriptionService.canAccessDashboard(user.id);

    if (!canAccess) {
      throw new ForbiddenException('Un abonnement actif est requis pour accéder à cette fonctionnalité');
    }

    return true;
  }
}
