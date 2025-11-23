const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePricesToCFA() {
  try {
    console.log('💰 [PRIX] Mise à jour des prix en Franc CFA...');

    // Conversion approximative : 1€ = 650 FCFA
    const plans = [
      {
        name: 'Gratuit',
        type: 'FREE',
        description: 'Accès de base aux fonctionnalités',
        price: 0, // Gratuit
        duration: 0,
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
        price: 1300, // 2€ = ~1300 FCFA
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
        price: 3250, // 5€ = ~3250 FCFA
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
        price: 6500, // 10€ = ~6500 FCFA
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
      
      const priceInCFA = plan.price;
      const priceInEuros = (plan.price / 650).toFixed(2);
      
      console.log(`✅ [PRIX] Plan ${plan.name}: ${priceInCFA} FCFA (${priceInEuros}€)`);
    }

    console.log('\n🎉 [PRIX] Tous les prix ont été mis à jour en Franc CFA !');
    console.log('💡 [INFO] Conversion utilisée : 1€ = 650 FCFA');

  } catch (error) {
    console.error('❌ [PRIX] Erreur lors de la mise à jour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePricesToCFA();
