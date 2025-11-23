const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function forceUpdateSubscription(userEmail, planType) {
  console.log(`🔄 [FORCE_UPDATE] Mise à jour forcée de l'abonnement...`);
  console.log(`👤 Utilisateur: ${userEmail}`);
  console.log(`📋 Plan: ${planType}\n`);

  try {
    // 1. Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
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
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.fullName} (${user.id})`);
    console.log(`📋 Abonnements actuels: ${user.subscriptions.length}`);

    // 2. Trouver le plan
    const plan = await prisma.subscriptionPlan.findFirst({
      where: {
        type: planType,
        isActive: true
      }
    });

    if (!plan) {
      console.log(`❌ Plan ${planType} non trouvé`);
      return;
    }

    console.log(`✅ Plan trouvé: ${plan.name} (${plan.price} XOF)`);

    // 3. Désactiver les abonnements actuels
    console.log('\n🔄 Désactivation des abonnements actuels...');
    const updateResult = await prisma.subscription.updateMany({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      data: {
        status: 'CANCELLED'
      }
    });

    console.log(`✅ ${updateResult.count} abonnement(s) désactivé(s)`);

    // 4. Créer le nouvel abonnement
    console.log('\n🔄 Création du nouvel abonnement...');
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
        transactionId: `FORCE_UPDATE_${Date.now()}`,
        paymentMethod: 'manual_update'
      },
      include: {
        plan: true
      }
    });

    console.log(`✅ Abonnement créé: ${subscription.id}`);
    console.log(`📋 Plan: ${subscription.plan.name}`);
    console.log(`💰 Prix: ${subscription.plan.price} XOF`);
    console.log(`📅 Début: ${subscription.startDate}`);
    console.log(`📅 Fin: ${subscription.endDate || 'Permanent'}`);

    // 5. Créer une notification
    console.log('\n🔄 Création d\'une notification...');
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION_ACTIVATED',
        title: 'Abonnement mis à jour manuellement',
        message: `Votre abonnement a été mis à jour vers ${subscription.plan.name} par l'administrateur.`,
        payload: {
          subscriptionId: subscription.id,
          planName: subscription.plan.name,
          planType: subscription.plan.type,
          amount: Number(subscription.plan.price),
          currency: 'XOF',
          manualUpdate: true
        }
      }
    });

    console.log('✅ Notification créée');

    // 6. Vérifier le résultat
    console.log('\n🔍 Vérification du résultat...');
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
      console.log(`✅ Abonnement actif: ${activeSubscription.plan.name} (${activeSubscription.plan.type})`);
      console.log(`💰 Prix: ${activeSubscription.plan.price} XOF`);
    } else {
      console.log('❌ Aucun abonnement actif trouvé');
    }

    console.log('\n🎉 Mise à jour forcée terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour forcée:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);
const userEmail = args[0];
const planType = args[1];

if (!userEmail || !planType) {
  console.log('Usage: node force-update-subscription.js <user_email> <plan_type>');
  console.log('Exemple: node force-update-subscription.js user@example.com PREMIUM');
  process.exit(1);
}

// Exécuter la mise à jour forcée
forceUpdateSubscription(userEmail, planType);
