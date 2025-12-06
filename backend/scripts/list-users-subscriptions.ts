import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Liste des utilisateurs avec leurs abonnements...\n');

  try {
    // Récupérer tous les utilisateurs avec leurs abonnements actifs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        verified: true,
        active: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            plan: {
              select: {
                name: true,
                type: true,
                price: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Prendre seulement le plus récent
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Statistiques
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.active).length;
    const verifiedUsers = users.filter(u => u.verified).length;
    const usersWithSubscription = users.filter(u => u.subscriptions.length > 0).length;
    const usersWithoutSubscription = users.filter(u => u.subscriptions.length === 0).length;

    // Compter les plans
    const planCounts: Record<string, number> = {};
    users.forEach(user => {
      if (user.subscriptions.length > 0) {
        const planType = user.subscriptions[0].plan.type;
        planCounts[planType] = (planCounts[planType] || 0) + 1;
      } else {
        planCounts['AUCUN'] = (planCounts['AUCUN'] || 0) + 1;
      }
    });

    // Afficher les statistiques
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 STATISTIQUES GLOBALES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👥 Total utilisateurs: ${totalUsers}`);
    console.log(`✅ Utilisateurs actifs: ${activeUsers} (${Math.round(activeUsers/totalUsers*100)}%)`);
    console.log(`🔐 Utilisateurs vérifiés: ${verifiedUsers} (${Math.round(verifiedUsers/totalUsers*100)}%)`);
    console.log(`📦 Utilisateurs avec abonnement: ${usersWithSubscription} (${Math.round(usersWithSubscription/totalUsers*100)}%)`);
    console.log(`❌ Utilisateurs sans abonnement: ${usersWithoutSubscription} (${Math.round(usersWithoutSubscription/totalUsers*100)}%)`);
    console.log('');

    console.log('📊 RÉPARTITION PAR PLAN D\'ABONNEMENT:');
    Object.entries(planCounts).forEach(([plan, count]) => {
      const percentage = Math.round(count/totalUsers*100);
      console.log(`   ${plan}: ${count} utilisateur(s) (${percentage}%)`);
    });
    console.log('');

    // Afficher le détail
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 DÉTAIL DES UTILISATEURS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    users.forEach((user, index) => {
      const activeIcon = user.active ? '✅' : '❌';
      const verifiedIcon = user.verified ? '🔐' : '🔓';
      const subscription = user.subscriptions[0];
      
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Nom: ${user.fullName}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Statut: ${activeIcon} ${user.active ? 'Actif' : 'Inactif'} | ${verifiedIcon} ${user.verified ? 'Vérifié' : 'Non vérifié'}`);
      
      if (subscription) {
        const isExpired = subscription.endDate && subscription.endDate < new Date();
        console.log(`   📦 Abonnement: ${subscription.plan.name} (${subscription.plan.type})`);
        console.log(`      Prix: ${subscription.plan.price} FCFA`);
        if (subscription.endDate) {
          console.log(`      Expire le: ${subscription.endDate.toLocaleDateString()} ${isExpired ? '⚠️ EXPIRÉ' : ''}`);
        } else {
          console.log(`      Expire le: Permanent`);
        }
      } else {
        console.log(`   📦 Abonnement: ❌ AUCUN`);
      }
      console.log('');
    });

    // Résumé par rôle
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 RÉPARTITION PAR RÔLE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const roleStats: Record<string, { total: number; active: number; verified: number; withSub: number }> = {};
    
    users.forEach(user => {
      if (!roleStats[user.role]) {
        roleStats[user.role] = { total: 0, active: 0, verified: 0, withSub: 0 };
      }
      roleStats[user.role].total++;
      if (user.active) roleStats[user.role].active++;
      if (user.verified) roleStats[user.role].verified++;
      if (user.subscriptions.length > 0) roleStats[user.role].withSub++;
    });

    Object.entries(roleStats).forEach(([role, stats]) => {
      console.log(`\n${role}:`);
      console.log(`   Total: ${stats.total}`);
      console.log(`   Actifs: ${stats.active} (${Math.round(stats.active/stats.total*100)}%)`);
      console.log(`   Vérifiés: ${stats.verified} (${Math.round(stats.verified/stats.total*100)}%)`);
      console.log(`   Avec abonnement: ${stats.withSub} (${Math.round(stats.withSub/stats.total*100)}%)`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

