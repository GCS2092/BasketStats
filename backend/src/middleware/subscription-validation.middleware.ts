import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class SubscriptionValidationMiddleware implements NestMiddleware {
  constructor(private subscriptionService: SubscriptionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Endpoints publics (pas besoin d'abonnement)
    const publicEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/subscriptions/plans',
      '/api/health',
      '/uploads'
    ];

    // Vérifier si l'endpoint est public
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      req.path.startsWith(endpoint)
    );

    if (isPublicEndpoint) {
      return next();
    }

    // Vérifier l'authentification
    const userId = (req as any).user?.id;
    if (!userId) {
      return next(); // Laisser JwtAuthGuard gérer l'authentification
    }

    // Vérifier l'abonnement pour tous les autres endpoints
    const canAccess = await this.subscriptionService.canAccessDashboard(userId);
    
    if (!canAccess) {
      throw new ForbiddenException('Un abonnement actif est requis pour accéder à cette fonctionnalité');
    }

    next();
  }
}
