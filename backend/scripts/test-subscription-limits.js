const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSubscriptionLimits() {
  console.log('🧪 [TEST] Test du système de limites d\'abonnement...\n');

  try {
    // 1. Récupérer tous les utilisateurs avec abonnement actif
    const users = await prisma.user.findMany({
      where: {
        subscriptions: {
          some: {
            status: 'ACTIVE'
          }
        }
      },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            plan: true
          }
        },
        posts: true,
        clubs: {
          where: {
            members: {
              some: {
                role: 'OWNER'
              }
            }
          }
        },
        playerProfiles: true
      }
    });

    console.log(`📊 [TEST] ${users.length} utilisateurs avec abonnement actif trouvés\n`);

    // 2. Tester chaque utilisateur
    for (const user of users) {
      const subscription = user.subscriptions[0];
      const plan = subscription.plan;
      const features = plan.features;

      console.log(`👤 [TEST] Utilisateur: ${user.fullName || user.email}`);
      console.log(`📋 [TEST] Plan: ${plan.name} (${plan.type})`);
      console.log(`📅 [TEST] Début: ${subscription.startDate.toISOString()}`);

      // Compter les ressources
      const postCount = user.posts.filter(post => 
        new Date(post.createdAt) >= subscription.startDate
      ).length;

      const clubCount = user.clubs.length;
      const playerCount = user.playerProfiles.length;

      console.log(`📝 [TEST] Posts: ${postCount}/${features.posts === -1 ? '∞' : features.posts}`);
      console.log(`🏀 [TEST] Clubs: ${clubCount}/${features.maxClubs === null ? '∞' : features.maxClubs}`);
      console.log(`👥 [TEST] Joueurs: ${playerCount}/${features.maxPlayers === null ? '∞' : features.maxPlayers}`);

      // Vérifier les limites
      const warnings = [];

      // Vérifier les posts
      if (features.posts !== -1) {
        const postPercentage = Math.round((postCount / features.posts) * 100);
        if (postPercentage >= 100) {
          warnings.push(`🚨 LIMITE POSTS ATTEINTE: ${postCount}/${features.posts} (${postPercentage}%)`);
        } else if (postPercentage >= 80) {
          warnings.push(`⚠️ LIMITE POSTS PROCHE: ${postCount}/${features.posts} (${postPercentage}%)`);
        }
      }

      // Vérifier les clubs
      if (features.maxClubs !== null) {
        const clubPercentage = Math.round((clubCount / features.maxClubs) * 100);
        if (clubPercentage >= 100) {
          warnings.push(`🚨 LIMITE CLUBS ATTEINTE: ${clubCount}/${features.maxClubs} (${clubPercentage}%)`);
        } else if (clubPercentage >= 80) {
          warnings.push(`⚠️ LIMITE CLUBS PROCHE: ${clubCount}/${features.maxClubs} (${clubPercentage}%)`);
        }
      }

      // Vérifier les joueurs
      if (features.maxPlayers !== null) {
        const playerPercentage = Math.round((playerCount / features.maxPlayers) * 100);
        if (playerPercentage >= 100) {
          warnings.push(`🚨 LIMITE JOUEURS ATTEINTE: ${playerCount}/${features.maxPlayers} (${playerPercentage}%)`);
        } else if (playerPercentage >= 80) {
          warnings.push(`⚠️ LIMITE JOUEURS PROCHE: ${playerCount}/${features.maxPlayers} (${playerPercentage}%)`);
        }
      }

      if (warnings.length > 0) {
        console.log(`⚠️ [TEST] Avertissements:`);
        warnings.forEach(warning => console.log(`   ${warning}`));
      } else {
        console.log(`✅ [TEST] Aucun avertissement - Utilisation normale`);
      }

      console.log('─'.repeat(60));
    }

    // 3. Tester la création de notifications d'avertissement
    console.log('\n🔔 [TEST] Test de création de notifications d\'avertissement...');

    const testUser = users[0];
    if (testUser) {
      const testSubscription = testUser.subscriptions[0];
      const testPlan = testSubscription.plan;
      const testFeatures = testPlan.features;

      // Créer une notification de test
      await prisma.notification.create({
        data: {
          userId: testUser.id,
          type: 'SUBSCRIPTION_LIMIT_WARNING',
          title: '🧪 Test - Limite de posts proche',
          message: `Test: Vous avez utilisé 8/10 posts de votre plan ${testPlan.name}. Pensez à passer à un plan supérieur.`,
          payload: {
            limitType: 'posts',
            percentage: 80,
            current: 8,
            max: 10,
            planName: testPlan.name,
            isTest: true
          }
        }
      });

      console.log(`✅ [TEST] Notification de test créée pour ${testUser.fullName || testUser.email}`);
    }

    // 4. Vérifier les notifications récentes
    console.log('\n📬 [TEST] Notifications récentes d\'avertissement:');
    const recentWarnings = await prisma.notification.findMany({
      where: {
        type: 'SUBSCRIPTION_LIMIT_WARNING',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
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
      },
      take: 10
    });

    if (recentWarnings.length > 0) {
      recentWarnings.forEach(notification => {
        console.log(`   📧 ${notification.user.fullName || notification.user.email}: ${notification.title}`);
        console.log(`      ${notification.message}`);
        console.log(`      📅 ${notification.createdAt.toISOString()}`);
        console.log('');
      });
    } else {
      console.log('   Aucune notification d\'avertissement récente');
    }

    console.log('\n✅ [TEST] Test terminé avec succès !');

  } catch (error) {
    console.error('❌ [TEST] Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
testSubscriptionLimits();
