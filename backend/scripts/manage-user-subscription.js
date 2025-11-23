const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function manageUserSubscription() {
  try {
    console.log('🔍 [GESTION] Gestion des abonnements utilisateur...');

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
      console.log('❌ [GESTION] Utilisateur non trouvé');
      return;
    }

    console.log(`👤 [GESTION] Utilisateur trouvé: ${user.fullName} (${user.email})`);
    console.log(`📊 [GESTION] Abonnements actuels: ${user.subscriptions.length}`);

    if (user.subscriptions.length > 0) {
      for (const subscription of user.subscriptions) {
        console.log(`   📋 Abonnement: ${subscription.plan.name} (${subscription.status})`);
        console.log(`      ID: ${subscription.id}`);
        console.log(`      Début: ${subscription.startDate.toLocaleDateString('fr-FR')}`);
        console.log(`      Fin: ${subscription.endDate ? subscription.endDate.toLocaleDateString('fr-FR') : 'Permanent'}`);
      }

      // Proposer des options
      console.log('\n🔧 [OPTIONS] Que voulez-vous faire ?');
      console.log('1. Supprimer l\'abonnement actuel (pour tester un nouveau paiement)');
      console.log('2. Changer vers le plan Basique');
      console.log('3. Changer vers le plan Premium');
      console.log('4. Changer vers le plan Professionnel');
      console.log('5. Annuler');

      // Pour l'instant, supprimons l'abonnement actuel pour permettre les tests
      const activeSubscription = user.subscriptions.find(sub => sub.status === 'ACTIVE');
      
      if (activeSubscription) {
        console.log(`\n🗑️ [GESTION] Suppression de l'abonnement ${activeSubscription.plan.name}...`);
        
        await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: { status: 'CANCELLED' }
        });

        console.log('✅ [GESTION] Abonnement supprimé avec succès !');
        console.log('🎯 [GESTION] Vous pouvez maintenant tester un nouveau paiement');
      }
    } else {
      console.log('📝 [GESTION] Aucun abonnement trouvé');
    }

    // Afficher les plans disponibles
    const plans = await prisma.subscriptionPlan.findMany();
    console.log('\n📋 [PLANS] Plans disponibles:');
    for (const plan of plans) {
      console.log(`   - ${plan.name} (${plan.type}): ${plan.price}€ - ${plan.description}`);
    }

  } catch (error) {
    console.error('❌ [GESTION] Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manageUserSubscription();
