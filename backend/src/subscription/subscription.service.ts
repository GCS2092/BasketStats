import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaytechService } from '../paytech/paytech.service';
import { SubscriptionStatus, SubscriptionPlanType } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private paytechService: PaytechService
  ) {}

  /**
   * Vérifie si un utilisateur a un abonnement actif
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        OR: [
          { endDate: null }, // Abonnement permanent
          { endDate: { gt: new Date() } } // Abonnement non expiré
        ]
      }
    });

    return !!subscription;
  }

  /**
   * Récupère l'abonnement actuel d'un utilisateur
   */
  async getCurrentSubscription(userId: string) {
    return await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } }
        ]
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Récupère l'abonnement actif d'un utilisateur (alias pour getCurrentSubscription)
   */
  async getUserActiveSubscription(userId: string) {
    return await this.getCurrentSubscription(userId);
  }

  /**
   * Récupère tous les plans d'abonnement disponibles
   */
  async getAvailablePlans() {
    return await this.prisma.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        price: 'asc'
      }
    });
  }


  /**
   * Crée directement un abonnement en base (pour les plans gratuits ou après paiement)
   */
  private async createDirectSubscription(
    userId: string,
    planId: string,
    transactionId?: string,
    paymentMethod?: string
  ) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new Error('Plan d\'abonnement non trouvé');
    }

    // Calculer les dates de début et fin
    const startDate = new Date();
    const endDate = plan.duration > 0 ? new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000) : null;

    // Désactiver les autres abonnements de l'utilisateur
    await this.prisma.subscription.updateMany({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE
      },
      data: {
        status: SubscriptionStatus.CANCELLED
      }
    });

    // Créer le nouvel abonnement
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        transactionId,
        paymentMethod
      },
      include: {
        plan: true
      }
    });

    console.log(`✅ [SUBSCRIPTION] Abonnement créé directement:`, subscription.id);
    return subscription;
  }

  /**
   * Vérifie si un utilisateur peut accéder au dashboard
   * (doit avoir un abonnement actif ou être admin)
   */
  async canAccessDashboard(userId: string): Promise<boolean> {
    // Vérifier si l'utilisateur est admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role === 'ADMIN') {
      return true;
    }

    // Vérifier s'il a un abonnement actif
    return await this.hasActiveSubscription(userId);
  }

  /**
   * Change le plan d'abonnement d'un utilisateur
   */
  async changePlan(
    userId: string,
    newPlanId: string,
    paymentMethod?: string
  ) {
    console.log(`🔄 [SUBSCRIPTION] Changement de plan pour l'utilisateur ${userId} vers le plan ${newPlanId}`);
    console.log(`🔄 [SUBSCRIPTION] Méthode de paiement: ${paymentMethod || 'Non spécifiée'}`);

    // 1. Vérifier que le nouveau plan existe
    console.log(`📋 [SUBSCRIPTION] 1. Vérification du plan ${newPlanId}...`);
    const newPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId }
    });

    if (!newPlan) {
      console.log(`❌ [SUBSCRIPTION] Plan ${newPlanId} non trouvé`);
      throw new Error('Plan d\'abonnement non trouvé');
    }

    console.log(`✅ [SUBSCRIPTION] Plan trouvé: ${newPlan.name} (${newPlan.type}) - ${newPlan.price} XOF`);
    console.log(`📋 [SUBSCRIPTION] Fonctionnalités du plan:`, JSON.stringify(newPlan.features, null, 2));

    // 2. Récupérer l'abonnement actuel
    console.log(`📋 [SUBSCRIPTION] 2. Récupération de l'abonnement actuel...`);
    const currentSubscription = await this.getCurrentSubscription(userId);

    if (!currentSubscription) {
      console.log(`❌ [SUBSCRIPTION] Aucun abonnement actuel trouvé`);
      throw new Error('Aucun abonnement actuel trouvé');
    }

    console.log(`✅ [SUBSCRIPTION] Abonnement actuel: ${currentSubscription.plan.name} (${currentSubscription.planId})`);
    console.log(`📋 [SUBSCRIPTION] Statut actuel: ${currentSubscription.status}`);
    console.log(`📋 [SUBSCRIPTION] Date de fin: ${currentSubscription.endDate}`);

    // 3. Vérifier si c'est le même plan
    if (currentSubscription.planId === newPlanId) {
      console.log(`⚠️ [SUBSCRIPTION] L'utilisateur est déjà abonné au plan ${newPlan.name}`);
      
      // Permettre le renouvellement même si c'est le même plan
      console.log(`🔄 [SUBSCRIPTION] Renouvellement de l'abonnement ${newPlan.name}...`);
      
      // Calculer la nouvelle date de fin (prolonger de la durée du plan)
      const newEndDate = new Date();
      if (newPlan.duration > 0) {
        newEndDate.setDate(newEndDate.getDate() + newPlan.duration);
      } else {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1); // Plan gratuit = 1 an
      }

      // Mettre à jour l'abonnement existant
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: currentSubscription.id },
        data: {
          endDate: newEndDate,
          updatedAt: new Date()
        },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true
            }
          }
        }
      });

      console.log(`✅ [SUBSCRIPTION] Abonnement renouvelé jusqu'au ${newEndDate.toLocaleDateString('fr-FR')}`);

      // Créer une notification
      await this.prisma.notification.create({
        data: {
          userId,
          title: 'Abonnement renouvelé',
          message: `Votre abonnement ${newPlan.name} a été renouvelé avec succès !`,
          type: 'SUBSCRIPTION_RENEWED'
        }
      });

      return updatedSubscription;
    }

    // 4. Pour un changement de plan différent, utiliser PayTech
    console.log(`💳 [SUBSCRIPTION] Changement de plan de ${currentSubscription.plan.name} vers ${newPlan.name}`);
    
    try {
      // Récupérer les informations utilisateur pour PayTech
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          fullName: true,
          email: true
        }
      });

      const userInfo = {
        phone_number: '+221771234567',
        first_name: user?.fullName?.split(' ')[0] || 'Utilisateur',
        last_name: user?.fullName?.split(' ').slice(1).join(' ') || 'BasketStats'
      };

      console.log(`👤 [SUBSCRIPTION] Informations utilisateur pour PayTech (changement de plan):`, userInfo);

      const paymentResponse = await this.paytechService.createSubscriptionPayment(
        userId,
        newPlan.type,
        newPlan.name,
        Number(newPlan.price),
        userInfo
      );

      console.log(`✅ [SUBSCRIPTION] Paiement PayTech créé avec succès`);
      console.log(`📋 [SUBSCRIPTION] Réponse PayTech:`, JSON.stringify(paymentResponse, null, 2));

      const result = {
        success: true,
        message: 'Redirection vers le paiement pour changer de plan',
        redirectUrl: paymentResponse.redirect_url || paymentResponse.redirectUrl,
        paymentData: paymentResponse
      };

      console.log(`🎉 [SUBSCRIPTION] Résultat final:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error(`❌ Erreur lors du changement de plan:`, error);
      throw error;
    }
  }

  /**
   * Initialise les plans d'abonnement par défaut
   */
  async initializeDefaultPlans() {
    const plans = [
      {
        name: 'Gratuit',
        type: SubscriptionPlanType.FREE,
        description: 'Accès limité aux fonctionnalités de base',
        price: 0,
        duration: 0, // Permanent
        features: {
          maxClubs: 1,
          maxPlayers: 5,
          posts: 3, // Limite de 3 posts par mois
          canCreateEvents: false,
          canAccessAdvancedStats: false,
          canCreateContracts: false,
          priority: false
        }
      },
      {
        name: 'Basique',
        type: SubscriptionPlanType.BASIC,
        description: 'Accès aux fonctionnalités essentielles - Prix conforme PayTech',
        price: 100,
        duration: 30,
        features: {
          maxClubs: 3,
          maxPlayers: 50,
          posts: 20, // Limite de 20 posts par mois
          canCreateEvents: true,
          canAccessAdvancedStats: true,
          canCreateContracts: false,
          priority: false
        }
      },
      {
        name: 'Premium',
        type: SubscriptionPlanType.PREMIUM,
        description: 'Accès complet aux fonctionnalités avancées - Prix conforme PayTech',
        price: 500,
        duration: 30,
        features: {
          maxClubs: 10,
          maxPlayers: 200,
          posts: 100, // Limite de 100 posts par mois
          canCreateEvents: true,
          canAccessAdvancedStats: true,
          canCreateContracts: true,
          priority: true
        }
      },
      {
        name: 'Professionnel',
        type: SubscriptionPlanType.PROFESSIONAL,
        description: 'Accès illimité à toutes les fonctionnalités - Prix conforme PayTech',
        price: 1000,
        duration: 30,
        features: {
          maxClubs: null, // Illimité
          maxPlayers: null, // Illimité
          posts: -1, // Illimité
          canCreateEvents: true,
          canAccessAdvancedStats: true,
          canCreateContracts: true,
          priority: true,
          customBranding: true,
          apiAccess: true
        }
      }
    ];

    for (const planData of plans) {
      await this.prisma.subscriptionPlan.upsert({
        where: { type: planData.type },
        update: planData,
        create: planData
      });
    }

    console.log('✅ Plans d\'abonnement initialisés');
  }

  /**
   * Créer un nouvel abonnement pour un utilisateur
   */
  async createSubscription(
    userId: string,
    planId: string,
    transactionId?: string,
    paymentMethod?: string
  ) {
    // Vérifier si l'utilisateur a déjà un abonnement actif
    const existingSubscription = await this.getCurrentSubscription(userId);
    
    if (existingSubscription) {
      // Si l'utilisateur a déjà un abonnement, utiliser changePlan au lieu de créer un nouveau
      console.log(`🔄 [SUBSCRIPTION] Utilisateur ${userId} a déjà un abonnement ${existingSubscription.plan.name}, utilisation de changePlan`);
      return await this.changePlan(userId, planId, paymentMethod);
    }

    // Vérifier que le plan existe
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new Error('Plan d\'abonnement non trouvé');
    }

    // Calculer les dates
    const startDate = new Date();
    const endDate = plan.duration > 0 ? new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000) : null;

    // Créer l'abonnement
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        paymentMethod: paymentMethod || 'paytech',
        transactionId,
        autoRenew: false, // Par défaut, pas de renouvellement automatique
      },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Créer une notification
    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Nouvel abonnement activé',
        message: `Votre abonnement ${plan.name} a été activé avec succès !`,
        type: 'SUBSCRIPTION_CREATED'
      }
    });

    return subscription;
  }
}
