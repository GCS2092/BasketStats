const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeSubscriptionPlans() {
  try {
    console.log('🚀 [INIT] Initialisation des plans d\'abonnement...');

    const plans = [
      {
        name: 'Gratuit',
        type: 'FREE',
        description: 'Accès de base aux fonctionnalités',
        price: 0,
        duration: 0, // Permanent
        features: {
          maxClubs: 1,
          maxPlayers: 10,
          posts: 5,
          canCreateEvents: false,
          canAccessAdvancedStats: false,
          canCreateContracts: false,
          priority: false
        }
      },
      {
        name: 'Basique',
        type: 'BASIC',
        description: 'Accès aux fonctionnalités essentielles',
        price: 200, // 2€ en centimes
        duration: 30,
        features: {
          maxClubs: 3,
          maxPlayers: 50,
          posts: 20,
          canCreateEvents: true,
          canAccessAdvancedStats: false,
          canCreateContracts: false,
          priority: false
        }
      },
      {
        name: 'Premium',
        type: 'PREMIUM',
        description: 'Accès complet aux fonctionnalités avancées',
        price: 500, // 5€ en centimes
        duration: 30,
        features: {
          maxClubs: 10,
          maxPlayers: 200,
          posts: 100,
          canCreateEvents: true,
          canAccessAdvancedStats: true,
          canCreateContracts: true,
          priority: true
        }
      },
      {
        name: 'Professionnel',
        type: 'PROFESSIONAL',
        description: 'Accès illimité à toutes les fonctionnalités',
        price: 1000, // 10€ en centimes
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
      const plan = await prisma.subscriptionPlan.upsert({
        where: { type: planData.type },
        update: planData,
        create: planData
      });
      console.log(`✅ [INIT] Plan ${plan.name} (${plan.type}) initialisé`);
    }

    console.log('🎉 [INIT] Tous les plans d\'abonnement ont été initialisés !');

  } catch (error) {
    console.error('❌ [INIT] Erreur lors de l\'initialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeSubscriptionPlans();
