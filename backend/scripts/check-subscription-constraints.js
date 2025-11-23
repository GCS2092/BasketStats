const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSubscriptionConstraints() {
  console.log('🔍 [CONSTRAINTS] Vérification des contraintes d\'abonnement...\n');

  try {
    // 1. Vérifier tous les utilisateurs et leurs abonnements
    console.log('👥 [CONSTRAINTS] 1. Utilisateurs et leurs abonnements:');
    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    for (const user of users) {
      console.log(`\n👤 Utilisateur: ${user.fullName} (${user.email})`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Rôle: ${user.role}`);
      console.log(`   - Créé: ${user.createdAt}`);
      
      if (user.subscriptions.length === 0) {
        console.log('   - ❌ Aucun abonnement');
      } else {
        console.log(`   - 📋 ${user.subscriptions.length} abonnement(s):`);
        user.subscriptions.forEach((sub, index) => {
          console.log(`     ${index + 1}. ${sub.plan.name} (${sub.plan.type})`);
          console.log(`        - Statut: ${sub.status}`);
          console.log(`        - Prix: ${sub.plan.price} XOF`);
          console.log(`        - Début: ${sub.startDate}`);
          console.log(`        - Fin: ${sub.endDate || 'Permanent'}`);
          console.log(`        - Transaction: ${sub.transactionId || 'N/A'}`);
          console.log(`        - Créé: ${sub.createdAt}`);
        });
      }
    }

    // 2. Vérifier les plans et leurs contraintes
    console.log('\n📦 [CONSTRAINTS] 2. Plans d\'abonnement et contraintes:');
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    for (const plan of plans) {
      console.log(`\n📋 Plan: ${plan.name} (${plan.type})`);
      console.log(`   - Prix: ${plan.price} XOF`);
      console.log(`   - Durée: ${plan.duration} jours`);
      console.log(`   - Fonctionnalités:`);
      const features = plan.features;
      console.log(`     - Clubs max: ${features.maxClubs === null ? 'Illimité' : features.maxClubs}`);
      console.log(`     - Joueurs max: ${features.maxPlayers === null ? 'Illimité' : features.maxPlayers}`);
      console.log(`     - Posts max: ${features.posts === -1 ? 'Illimité' : features.posts}`);
      console.log(`     - Événements: ${features.canCreateEvents ? '✅' : '❌'}`);
      console.log(`     - Stats avancées: ${features.canAccessAdvancedStats ? '✅' : '❌'}`);
      console.log(`     - Contrats: ${features.canCreateContracts ? '✅' : '❌'}`);
      console.log(`     - Priorité: ${features.priority ? '✅' : '❌'}`);
    }

    // 3. Vérifier les contraintes appliquées
    console.log('\n🔒 [CONSTRAINTS] 3. Vérification des contraintes appliquées:');
    
    for (const user of users) {
      const activeSubscription = user.subscriptions.find(sub => sub.status === 'ACTIVE');
      
      if (!activeSubscription) {
        console.log(`\n❌ ${user.fullName}: Aucun abonnement actif`);
        continue;
      }

      const plan = activeSubscription.plan;
      const features = plan.features;
      
      console.log(`\n✅ ${user.fullName}: Abonnement actif - ${plan.name}`);
      
      // Vérifier les posts
      if (features.posts !== -1) {
        const postCount = await prisma.post.count({
          where: {
            userId: user.id,
            createdAt: {
              gte: activeSubscription.startDate
            }
          }
        });
        console.log(`   - Posts: ${postCount}/${features.posts} (${postCount >= features.posts ? 'LIMITE ATTEINTE' : 'OK'})`);
      } else {
        console.log(`   - Posts: Illimité`);
      }

      // Vérifier les clubs
      if (features.maxClubs !== null) {
        const clubCount = await prisma.club.count({
          where: {
            members: {
              some: {
                userId: user.id,
                role: 'OWNER'
              }
            }
          }
        });
        console.log(`   - Clubs: ${clubCount}/${features.maxClubs} (${clubCount >= features.maxClubs ? 'LIMITE ATTEINTE' : 'OK'})`);
      } else {
        console.log(`   - Clubs: Illimité`);
      }

      // Vérifier les joueurs
      if (features.maxPlayers !== null) {
        const playerCount = await prisma.playerProfile.count({
          where: {
            userId: user.id
          }
        });
        console.log(`   - Joueurs: ${playerCount}/${features.maxPlayers} (${playerCount >= features.maxPlayers ? 'LIMITE ATTEINTE' : 'OK'})`);
      } else {
        console.log(`   - Joueurs: Illimité`);
      }
    }

    // 4. Vérifier les notifications récentes
    console.log('\n🔔 [CONSTRAINTS] 4. Notifications récentes:');
    const recentNotifications = await prisma.notification.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
        },
        type: {
          in: ['SUBSCRIPTION_ACTIVATED', 'PAYMENT_SUCCESS']
        }
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`   Total: ${recentNotifications.length} notifications`);
    recentNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.user.fullName}: ${notif.title}`);
      console.log(`      - Type: ${notif.type}`);
      console.log(`      - Créé: ${notif.createdAt}`);
    });

    console.log('\n✅ [CONSTRAINTS] Vérification terminée!');

  } catch (error) {
    console.error('❌ [CONSTRAINTS] Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la vérification
checkSubscriptionConstraints();
