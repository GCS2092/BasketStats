import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { SubscriptionService } from '../subscription/subscription.service';
import { Reflector } from '@nestjs/core';

// Décorateur pour marquer les endpoints publics (pas besoin d'abonnement)
export const Public = () => SetMetadata('isPublic', true);

@Injectable()
export class GlobalSubscriptionGuard implements CanActivate {
  constructor(
    private subscriptionService: SubscriptionService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Vérifier si l'endpoint est marqué comme public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur peut accéder aux fonctionnalités
    const canAccess = await this.subscriptionService.canAccessDashboard(user.id);

    if (!canAccess) {
      throw new ForbiddenException('Un abonnement actif est requis pour accéder à cette fonctionnalité');
    }

    return true;
  }
}