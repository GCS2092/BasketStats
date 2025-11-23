const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndCleanSubscriptions() {
  try {
    console.log('🔍 [DIAGNOSTIC] Vérification des abonnements...');

    // 1. Lister tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        subscriptions: {
          include: {
            plan: true
          }
        }
      }
    });

    console.log(`📊 [DIAGNOSTIC] ${users.length} utilisateurs trouvés`);

    // 2. Analyser les abonnements par utilisateur
    for (const user of users) {
      console.log(`\n👤 [DIAGNOSTIC] Utilisateur: ${user.fullName} (${user.email})`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Abonnements: ${user.subscriptions.length}`);

      if (user.subscriptions.length > 0) {
        for (const subscription of user.subscriptions) {
          console.log(`   📋 Abonnement: ${subscription.plan.name} (${subscription.status})`);
          console.log(`      Début: ${subscription.startDate.toLocaleDateString('fr-FR')}`);
          console.log(`      Fin: ${subscription.endDate ? subscription.endDate.toLocaleDateString('fr-FR') : 'Permanent'}`);
          console.log(`      Transaction: ${subscription.transactionId || 'N/A'}`);
        }

        // Vérifier s'il y a plusieurs abonnements actifs
        const activeSubscriptions = user.subscriptions.filter(sub => sub.status === 'ACTIVE');
        if (activeSubscriptions.length > 1) {
          console.log(`   ⚠️  PROBLÈME: ${activeSubscriptions.length} abonnements actifs détectés !`);
          
          // Garder le plus récent et annuler les autres
          const sortedActive = activeSubscriptions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const keepSubscription = sortedActive[0];
          const cancelSubscriptions = sortedActive.slice(1);

          console.log(`   🔧 Correction: Conservation de l'abonnement ${keepSubscription.plan.name}`);
          
          for (const subToCancel of cancelSubscriptions) {
            await prisma.subscription.update({
              where: { id: subToCancel.id },
              data: {
                status: 'CANCELLED'
              }
            });
            console.log(`   ✅ Abonnement ${subToCancel.plan.name} annulé`);
          }
        }
      }
    }

    // 3. Statistiques globales
    const totalSubscriptions = await prisma.subscription.count();
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' }
    });
    const suspendedSubscriptions = await prisma.subscription.count({
      where: { status: 'CANCELLED' }
    });

    console.log(`\n📊 [STATISTIQUES] Total abonnements: ${totalSubscriptions}`);
    console.log(`📊 [STATISTIQUES] Abonnements actifs: ${activeSubscriptions}`);
    console.log(`📊 [STATISTIQUES] Abonnements suspendus: ${suspendedSubscriptions}`);

    // 4. Vérifier les plans
    const plans = await prisma.subscriptionPlan.findMany();
    console.log(`\n📋 [PLANS] ${plans.length} plans disponibles:`);
    for (const plan of plans) {
      console.log(`   - ${plan.name} (${plan.type}): ${plan.price}€`);
    }

    console.log('\n✅ [DIAGNOSTIC] Vérification terminée avec succès !');

  } catch (error) {
    console.error('❌ [DIAGNOSTIC] Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCleanSubscriptions();
