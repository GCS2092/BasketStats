const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanUserSubscriptions() {
  try {
    console.log('🧹 [NETTOYAGE] Nettoyage des abonnements utilisateur...');

    // Trouver l'utilisateur Stem
    const user = await prisma.user.findFirst({
      where: { email: 'stemk2151@gmail.com' },
      include: {
        subscriptions: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ [NETTOYAGE] Utilisateur non trouvé');
      return;
    }

    console.log(`👤 [NETTOYAGE] Utilisateur trouvé: ${user.fullName} (${user.email})`);
    console.log(`📊 [NETTOYAGE] Abonnements actuels: ${user.subscriptions.length}`);

    if (user.subscriptions.length > 0) {
      console.log('\n📋 [NETTOYAGE] Abonnements à nettoyer:');
      for (const subscription of user.subscriptions) {
        console.log(`   - ${subscription.plan.name} (${subscription.status}) - ${subscription.plan.price} FCFA`);
      }

      // Supprimer tous les abonnements de cet utilisateur
      const deleteResult = await prisma.subscription.deleteMany({
        where: {
          userId: user.id
        }
      });

      console.log(`\n🗑️ [NETTOYAGE] ${deleteResult.count} abonnement(s) supprimé(s)`);
    } else {
      console.log('📝 [NETTOYAGE] Aucun abonnement à nettoyer');
    }

    // Vérifier le résultat
    const remainingSubscriptions = await prisma.subscription.findMany({
      where: { userId: user.id }
    });

    console.log(`\n✅ [NETTOYAGE] Abonnements restants: ${remainingSubscriptions.length}`);

    // Afficher les plans disponibles avec les prix CFA
    const plans = await prisma.subscriptionPlan.findMany();
    console.log('\n💰 [PLANS] Plans disponibles avec prix CFA:');
    for (const plan of plans) {
      const priceInCFA = plan.price;
      const priceInEuros = plan.price > 0 ? (plan.price / 650).toFixed(2) : '0.00';
      console.log(`   - ${plan.name}: ${priceInCFA} FCFA (${priceInEuros}€)`);
    }

    console.log('\n🎯 [NETTOYAGE] L\'utilisateur peut maintenant tester un nouveau paiement !');

  } catch (error) {
    console.error('❌ [NETTOYAGE] Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanUserSubscriptions();
