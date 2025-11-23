const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deepCheckSubscriptions() {
  try {
    console.log('🔍 [DEEP CHECK] Vérification approfondie des abonnements...');

    // 1. Vérifier tous les abonnements sans filtre
    const allSubscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 [DEEP CHECK] Total abonnements trouvés: ${allSubscriptions.length}`);

    if (allSubscriptions.length > 0) {
      console.log('\n📋 [DEEP CHECK] Détail de tous les abonnements:');
      
      for (const subscription of allSubscriptions) {
        console.log(`\n👤 Utilisateur: ${subscription.user.fullName} (${subscription.user.email})`);
        console.log(`   📋 Plan: ${subscription.plan.name} (${subscription.plan.type})`);
        console.log(`   🔄 Statut: ${subscription.status}`);
        console.log(`   📅 Début: ${subscription.startDate.toLocaleDateString('fr-FR')}`);
        console.log(`   📅 Fin: ${subscription.endDate ? subscription.endDate.toLocaleDateString('fr-FR') : 'Permanent'}`);
        console.log(`   💰 Prix: ${subscription.plan.price} FCFA`);
        console.log(`   🆔 ID: ${subscription.id}`);
        console.log(`   🏷️ Transaction: ${subscription.transactionId || 'N/A'}`);
        console.log(`   📝 Méthode: ${subscription.paymentMethod || 'N/A'}`);
        
        // Vérifier si l'abonnement est techniquement actif
        const isTechnicallyActive = subscription.status === 'ACTIVE' && 
          (!subscription.endDate || subscription.endDate > new Date());
        console.log(`   ✅ Techniquement actif: ${isTechnicallyActive ? 'OUI' : 'NON'}`);
      }
    }

    // 2. Vérifier spécifiquement l'utilisateur Stem
    const stemUser = await prisma.user.findFirst({
      where: { email: 'stemk2151@gmail.com' },
      include: {
        subscriptions: {
          include: {
            plan: true
          }
        }
      }
    });

    if (stemUser) {
      console.log(`\n👤 [STEM] Utilisateur Stem trouvé:`);
      console.log(`   📧 Email: ${stemUser.email}`);
      console.log(`   👤 Nom: ${stemUser.fullName}`);
      console.log(`   🔑 Rôle: ${stemUser.role}`);
      console.log(`   📊 Abonnements: ${stemUser.subscriptions.length}`);
      
      if (stemUser.subscriptions.length > 0) {
        console.log(`\n📋 [STEM] Abonnements de Stem:`);
        for (const sub of stemUser.subscriptions) {
          console.log(`   - ${sub.plan.name} (${sub.status}) - ${sub.plan.price} FCFA`);
        }
      }
    }

    // 3. Vérifier les plans avec les nouveaux prix
    const plans = await prisma.subscriptionPlan.findMany();
    console.log(`\n💰 [PLANS] Plans avec prix CFA:`);
    for (const plan of plans) {
      console.log(`   - ${plan.name}: ${plan.price} FCFA`);
    }

  } catch (error) {
    console.error('❌ [DEEP CHECK] Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deepCheckSubscriptions();
