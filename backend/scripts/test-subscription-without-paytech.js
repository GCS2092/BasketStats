const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSubscriptionWithoutPaytech() {
  console.log('🧪 [TEST] Test d\'abonnement sans PayTech...\n');

  try {
    // 1. Trouver un utilisateur
    console.log('👤 [TEST] Recherche d\'un utilisateur...');
    const user = await prisma.user.findFirst({
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      console.log('❌ [TEST] Aucun utilisateur trouvé');
      return;
    }

    console.log(`✅ [TEST] Utilisateur trouvé: ${user.fullName} (${user.email})`);
    console.log(`📋 [TEST] Abonnements actuels: ${user.subscriptions.length}`);

    // Afficher les abonnements actuels
    if (user.subscriptions.length > 0) {
      console.log('\n📋 [TEST] Abonnements actuels:');
      user.subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.plan.name} (${sub.plan.type}) - ${sub.status}`);
        console.log(`      - Prix: ${sub.plan.price} XOF`);
        console.log(`      - Créé: ${sub.createdAt}`);
      });
    }

    // 2. Trouver un plan payant
    console.log('\n📦 [TEST] Recherche d\'un plan payant...');
    const plan = await prisma.subscriptionPlan.findFirst({
      where: {
        type: 'PREMIUM',
        isActive: true
      }
    });

    if (!plan) {
      console.log('❌ [TEST] Plan PREMIUM non trouvé, recherche d\'un autre plan...');
      const anyPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          isActive: true,
          price: {
            gt: 0
          }
        },
        orderBy: {
          price: 'asc'
        }
      });

      if (!anyPlan) {
        console.log('❌ [TEST] Aucun plan payant trouvé');
        return;
      }

      console.log(`✅ [TEST] Plan trouvé: ${anyPlan.name} (${anyPlan.type}) - ${anyPlan.price} XOF`);
      return await createSubscription(user, anyPlan);
    }

    console.log(`✅ [TEST] Plan trouvé: ${plan.name} (${plan.type}) - ${plan.price} XOF`);
    return await createSubscription(user, plan);

  } catch (error) {
    console.error('❌ [TEST] Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSubscription(user, plan) {
  console.log(`\n🔄 [TEST] Création de l'abonnement...`);

  try {
    // Désactiver les abonnements actuels
    console.log('🔄 [TEST] Désactivation des abonnements actuels...');
    const updateResult = await prisma.subscription.updateMany({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      data: {
        status: 'CANCELLED'
      }
    });

    console.log(`✅ [TEST] ${updateResult.count} abonnement(s) désactivé(s)`);

    // Créer le nouvel abonnement
    console.log('🔄 [TEST] Création du nouvel abonnement...');
    const startDate = new Date();
    const endDate = plan.duration > 0 
      ? new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000) 
      : null;

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        startDate,
        endDate,
        transactionId: `TEST_${Date.now()}`,
        paymentMethod: 'test_mode'
      },
      include: {
        plan: true
      }
    });

    console.log(`✅ [TEST] Abonnement créé avec succès!`);
    console.log(`   - ID: ${subscription.id}`);
    console.log(`   - Plan: ${subscription.plan.name} (${subscription.plan.type})`);
    console.log(`   - Prix: ${subscription.plan.price} XOF`);
    console.log(`   - Statut: ${subscription.status}`);
    console.log(`   - Début: ${subscription.startDate}`);
    console.log(`   - Fin: ${subscription.endDate || 'Permanent'}`);

    // Créer une notification
    console.log('\n🔄 [TEST] Création d\'une notification...');
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION_ACTIVATED',
        title: 'Abonnement activé (Mode Test)',
        message: `Votre abonnement ${subscription.plan.name} a été activé en mode test.`,
        payload: {
          subscriptionId: subscription.id,
          planName: subscription.plan.name,
          planType: subscription.plan.type,
          amount: Number(subscription.plan.price),
          currency: 'XOF',
          testMode: true
        }
      }
    });

    console.log('✅ [TEST] Notification créée');

    // Vérifier le résultat
    console.log('\n🔍 [TEST] Vérification du résultat...');
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    const activeSubscription = updatedUser.subscriptions.find(sub => sub.status === 'ACTIVE');
    if (activeSubscription) {
      console.log(`✅ [TEST] Abonnement actif confirmé: ${activeSubscription.plan.name}`);
      console.log(`💰 [TEST] Prix: ${activeSubscription.plan.price} XOF`);
      console.log(`📅 [TEST] Début: ${activeSubscription.startDate}`);
      console.log(`📅 [TEST] Fin: ${activeSubscription.endDate || 'Permanent'}`);
    } else {
      console.log('❌ [TEST] Aucun abonnement actif trouvé');
    }

    console.log('\n🎉 [TEST] Test terminé avec succès!');
    console.log('💡 [TEST] Vous pouvez maintenant vérifier l\'interface utilisateur');

  } catch (error) {
    console.error('❌ [TEST] Erreur lors de la création de l\'abonnement:', error);
  }
}

// Exécuter le test
testSubscriptionWithoutPaytech();
