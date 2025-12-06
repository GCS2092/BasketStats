import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Liste des abonnements et rôles en base de données...\n');

  try {
    // 1. Lister tous les utilisateurs avec leurs rôles
    console.log('👥 UTILISATEURS ET RÔLES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        verified: true,
        active: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Compter les rôles
    const roleCounts: Record<string, number> = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });

    console.log(`\n📈 Statistiques par rôle:`);
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} utilisateur(s)`);
    });

    console.log(`\n📋 Détail des utilisateurs (${users.length} total):`);
    users.forEach((user, index) => {
      const status = user.verified && user.active ? '✅' : '❌';
      console.log(`   ${index + 1}. ${user.email}`);
      console.log(`      Nom: ${user.fullName}`);
      console.log(`      Rôle: ${user.role}`);
      console.log(`      Statut: ${status} (Vérifié: ${user.verified ? 'Oui' : 'Non'}, Actif: ${user.active ? 'Oui' : 'Non'})`);
      console.log(`      Créé le: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // 2. Lister tous les abonnements
    console.log('\n\n📦 ABONNEMENTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const subscriptions = await prisma.subscription.findMany({
      select: {
        id: true,
        userId: true,
        planId: true,
        status: true,
        startDate: true,
        endDate: true,
        paymentMethod: true,
        transactionId: true,
        autoRenew: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            fullName: true,
            role: true,
          },
        },
        plan: {
          select: {
            name: true,
            type: true,
            price: true,
            duration: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Compter les statuts d'abonnements
    const statusCounts: Record<string, number> = {};
    subscriptions.forEach(sub => {
      statusCounts[sub.status] = (statusCounts[sub.status] || 0) + 1;
    });

    console.log(`\n📈 Statistiques par statut:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} abonnement(s)`);
    });

    // Compter les types de plans
    const planTypeCounts: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const planType = sub.plan.type;
      planTypeCounts[planType] = (planTypeCounts[planType] || 0) + 1;
    });

    console.log(`\n📈 Statistiques par type de plan:`);
    Object.entries(planTypeCounts).forEach(([planType, count]) => {
      console.log(`   ${planType}: ${count} abonnement(s)`);
    });

    console.log(`\n📋 Détail des abonnements (${subscriptions.length} total):`);
    subscriptions.forEach((sub, index) => {
      const statusIcon = sub.status === 'ACTIVE' ? '✅' : '❌';
      console.log(`   ${index + 1}. Abonnement ${sub.id.substring(0, 8)}...`);
      console.log(`      Utilisateur: ${sub.user.email} (${sub.user.fullName})`);
      console.log(`      Rôle: ${sub.user.role}`);
      console.log(`      Plan: ${sub.plan.name} (${sub.plan.type})`);
      console.log(`      Prix: ${sub.plan.price} FCFA`);
      console.log(`      Durée: ${sub.plan.duration} jours`);
      console.log(`      Statut: ${sub.status} ${statusIcon}`);
      console.log(`      Date de début: ${sub.startDate.toLocaleDateString()}`);
      if (sub.endDate) {
        const isExpired = sub.endDate < new Date();
        console.log(`      Date de fin: ${sub.endDate.toLocaleDateString()} ${isExpired ? '(Expiré)' : ''}`);
      } else {
        console.log(`      Date de fin: Permanent`);
      }
      console.log(`      Méthode de paiement: ${sub.paymentMethod || 'N/A'}`);
      console.log(`      Renouvellement auto: ${sub.autoRenew ? 'Oui' : 'Non'}`);
      console.log(`      Créé le: ${sub.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // 3. Lister tous les plans disponibles
    console.log('\n\n💎 PLANS D\'ABONNEMENT DISPONIBLES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const plans = await prisma.subscriptionPlan.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        price: true,
        duration: true,
        maxClubs: true,
        maxPlayers: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        price: 'asc',
      },
    });

    console.log(`\n📋 Plans disponibles (${plans.length} total):`);
    plans.forEach((plan, index) => {
      const activeIcon = plan.isActive ? '✅' : '❌';
      console.log(`   ${index + 1}. ${plan.name} (${plan.type}) ${activeIcon}`);
      console.log(`      Description: ${plan.description || 'N/A'}`);
      console.log(`      Prix: ${plan.price} FCFA`);
      console.log(`      Durée: ${plan.duration} jours ${plan.duration === 0 ? '(Permanent)' : ''}`);
      console.log(`      Max Clubs: ${plan.maxClubs || 'Illimité'}`);
      console.log(`      Max Joueurs: ${plan.maxPlayers || 'Illimité'}`);
      console.log(`      Actif: ${plan.isActive ? 'Oui' : 'Non'}`);
      console.log(`      Créé le: ${plan.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Résumé final
    console.log('\n\n📊 RÉSUMÉ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👥 Total utilisateurs: ${users.length}`);
    console.log(`📦 Total abonnements: ${subscriptions.length}`);
    console.log(`💎 Total plans: ${plans.length}`);
    console.log(`✅ Abonnements actifs: ${statusCounts['ACTIVE'] || 0}`);
    console.log(`❌ Abonnements expirés: ${statusCounts['EXPIRED'] || 0}`);
    console.log(`🚫 Abonnements annulés: ${statusCounts['CANCELLED'] || 0}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

