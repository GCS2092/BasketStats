const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseSubscription() {
  console.log('🔍 [DIAGNOSTIC] Début du diagnostic des abonnements...\n');

  try {
    // 1. Vérifier tous les abonnements
    console.log('📋 [DIAGNOSTIC] 1. Liste de tous les abonnements:');
    const allSubscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`   Total d'abonnements: ${allSubscriptions.length}`);
    allSubscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.user.fullName} (${sub.user.email})`);
      console.log(`      - Plan: ${sub.plan.name} (${sub.plan.type})`);
      console.log(`      - Prix: ${sub.plan.price} XOF`);
      console.log(`      - Statut: ${sub.status}`);
      console.log(`      - Début: ${sub.startDate}`);
      console.log(`      - Fin: ${sub.endDate || 'Permanent'}`);
      console.log(`      - Transaction: ${sub.transactionId || 'N/A'}`);
      console.log(`      - Créé: ${sub.createdAt}`);
      console.log('');
    });

    // 2. Vérifier les abonnements actifs
    console.log('✅ [DIAGNOSTIC] 2. Abonnements actifs:');
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`   Total d'abonnements actifs: ${activeSubscriptions.length}`);
    activeSubscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.user.fullName} (${sub.user.email})`);
      console.log(`      - Plan: ${sub.plan.name} (${sub.plan.type})`);
      console.log(`      - Prix: ${sub.plan.price} XOF`);
      console.log(`      - Transaction: ${sub.transactionId || 'N/A'}`);
      console.log('');
    });

    // 3. Vérifier les plans disponibles
    console.log('📦 [DIAGNOSTIC] 3. Plans d\'abonnement disponibles:');
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    console.log(`   Total de plans: ${plans.length}`);
    plans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name} (${plan.type})`);
      console.log(`      - Prix: ${plan.price} XOF`);
      console.log(`      - Durée: ${plan.duration} jours`);
      console.log(`      - Actif: ${plan.isActive}`);
      console.log('');
    });

    // 4. Vérifier les notifications récentes
    console.log('🔔 [DIAGNOSTIC] 4. Notifications récentes (dernières 24h):');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentNotifications = await prisma.notification.findMany({
      where: {
        createdAt: {
          gte: yesterday
        },
        type: {
          in: ['SUBSCRIPTION_ACTIVATED', 'PAYMENT_SUCCESS']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`   Total de notifications récentes: ${recentNotifications.length}`);
    recentNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.user.fullName} (${notif.user.email})`);
      console.log(`      - Type: ${notif.type}`);
      console.log(`      - Titre: ${notif.title}`);
      console.log(`      - Créé: ${notif.createdAt}`);
      console.log('');
    });

    // 5. Vérifier les utilisateurs sans abonnement actif
    console.log('👥 [DIAGNOSTIC] 5. Utilisateurs sans abonnement actif:');
    const usersWithoutActiveSubscription = await prisma.user.findMany({
      where: {
        subscriptions: {
          none: {
            status: 'ACTIVE'
          }
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`   Total d'utilisateurs sans abonnement actif: ${usersWithoutActiveSubscription.length}`);
    usersWithoutActiveSubscription.slice(0, 10).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.fullName} (${user.email})`);
      console.log(`      - Créé: ${user.createdAt}`);
      console.log('');
    });

    if (usersWithoutActiveSubscription.length > 10) {
      console.log(`   ... et ${usersWithoutActiveSubscription.length - 10} autres utilisateurs`);
    }

    console.log('✅ [DIAGNOSTIC] Diagnostic terminé avec succès!');

  } catch (error) {
    console.error('❌ [DIAGNOSTIC] Erreur lors du diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le diagnostic
diagnoseSubscription();
