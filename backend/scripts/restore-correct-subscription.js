const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreCorrectSubscription() {
  try {
    console.log('🔧 [RESTAURATION] Restauration de l\'abonnement avec le bon prix...');

    // 1. Trouver l'utilisateur Stem
    const user = await prisma.user.findFirst({
      where: { email: 'stemk2151@gmail.com' }
    });

    if (!user) {
      console.log('❌ [RESTAURATION] Utilisateur non trouvé');
      return;
    }

    console.log(`👤 [RESTAURATION] Utilisateur trouvé: ${user.fullName} (${user.email})`);

    // 2. Trouver l'abonnement actuel
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    });

    if (!currentSubscription) {
      console.log('❌ [RESTAURATION] Aucun abonnement actif trouvé');
      return;
    }

    console.log(`📋 [RESTAURATION] Abonnement actuel:`);
    console.log(`   Plan: ${currentSubscription.plan.name}`);
    console.log(`   Prix actuel: ${currentSubscription.plan.price} FCFA`);
    console.log(`   Prix attendu: 100 FCFA`);

    // 3. Mettre à jour le plan Basique avec le bon prix
    console.log(`\n💰 [RESTAURATION] Mise à jour du prix du plan Basique...`);
    
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { type: 'BASIC' },
      data: {
        price: 100, // Prix original de 100 FCFA
        description: 'Accès aux fonctionnalités essentielles - Prix original'
      }
    });

    console.log(`✅ [RESTAURATION] Plan Basique mis à jour:`);
    console.log(`   Nouveau prix: ${updatedPlan.price} FCFA`);
    console.log(`   Description: ${updatedPlan.description}`);

    // 4. Vérifier l'abonnement mis à jour
    const updatedSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    });

    console.log(`\n📋 [RESTAURATION] Abonnement après mise à jour:`);
    console.log(`   Plan: ${updatedSubscription.plan.name}`);
    console.log(`   Prix: ${updatedSubscription.plan.price} FCFA`);
    console.log(`   Statut: ${updatedSubscription.status}`);
    console.log(`   Début: ${updatedSubscription.startDate.toLocaleDateString('fr-FR')}`);
    console.log(`   Fin: ${updatedSubscription.endDate.toLocaleDateString('fr-FR')}`);

    // 5. Afficher tous les plans avec les prix corrigés
    const allPlans = await prisma.subscriptionPlan.findMany();
    console.log(`\n💰 [PLANS] Tous les plans avec prix corrigés:`);
    for (const plan of allPlans) {
      console.log(`   - ${plan.name}: ${plan.price} FCFA`);
    }

    console.log(`\n🎉 [RESTAURATION] Abonnement restauré avec le bon prix !`);
    console.log(`💡 [INFO] L'utilisateur peut maintenant utiliser son abonnement Basique à 100 FCFA`);

  } catch (error) {
    console.error('❌ [RESTAURATION] Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreCorrectSubscription();
