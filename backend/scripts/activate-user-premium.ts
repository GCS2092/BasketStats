import { PrismaClient, SubscriptionStatus, SubscriptionPlanType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Récupérer l'email depuis les arguments de ligne de commande
  const email = process.argv[2];

  console.log('🚀 Activation utilisateur et attribution abonnement PROFESSIONAL...\n');

  try {
    // Si aucun email n'est fourni, lister tous les utilisateurs
    if (!email) {
      console.log('📋 Liste de tous les utilisateurs:\n');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          verified: true,
          active: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (allUsers.length === 0) {
        console.log('⚠️  Aucun utilisateur trouvé dans la base de données');
        return;
      }

      allUsers.forEach((user, index) => {
        const status = user.verified && user.active ? '✅ Actif' : '❌ Inactif';
        console.log(`  ${index + 1}. ${user.email} (${user.fullName}) - ${user.role} - ${status}`);
      });

      console.log('\n💡 Usage: npm run activate-user <email>');
      console.log('   Exemple: npm run activate-user stemk2151@gmail.com\n');
      return;
    }

    // Trouver l'utilisateur par email
    console.log(`🔍 Recherche de l'utilisateur: ${email}...\n`);
    
    // Utiliser select pour éviter les colonnes qui n'existent pas encore (suspended_at, etc.)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        verified: true,
        active: true,
        subscriptions: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            plan: {
              select: {
                id: true,
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
        },
      },
    });

    if (!user) {
      console.error(`❌ Utilisateur non trouvé avec l'email: ${email}`);
      console.log('\n💡 Utilisez la commande sans email pour voir la liste des utilisateurs:');
      console.log('   npm run activate-user\n');
      process.exit(1);
    }

    console.log(`✅ Utilisateur trouvé: ${user.fullName} (${user.email})`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   Statut actuel: ${user.verified ? '✅ Vérifié' : '❌ Non vérifié'} | ${user.active ? '✅ Actif' : '❌ Inactif'}\n`);

    // Afficher les abonnements existants
    if (user.subscriptions.length > 0) {
      console.log('📦 Abonnements existants:');
      user.subscriptions.forEach((sub, index) => {
        const status = sub.status === SubscriptionStatus.ACTIVE ? '✅' : '❌';
        console.log(`   ${index + 1}. ${sub.plan.name} (${sub.plan.type}) - ${sub.status} ${status}`);
        if (sub.endDate) {
          console.log(`      Expire le: ${sub.endDate.toLocaleDateString()}`);
        }
      });
      console.log('');
    }

    // Trouver le plan PROFESSIONAL
    console.log('🔍 Recherche du plan PROFESSIONAL...');
    const professionalPlan = await prisma.subscriptionPlan.findUnique({
      where: { type: SubscriptionPlanType.PROFESSIONAL },
    });

    if (!professionalPlan) {
      console.error('❌ Plan PROFESSIONAL non trouvé dans la base de données');
      console.log('💡 Exécutez d\'abord: npm run prisma:seed (ou initialisez les plans)\n');
      process.exit(1);
    }

    console.log(`✅ Plan trouvé: ${professionalPlan.name} (${professionalPlan.type})`);
    console.log(`   Prix: ${professionalPlan.price} FCFA`);
    console.log(`   Durée: ${professionalPlan.duration} jours\n`);

    // Calculer la date de fin (1 an à partir de maintenant)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    console.log('🔄 Mise à jour de l\'utilisateur et création de l\'abonnement...\n');

    // Désactiver tous les abonnements existants
    if (user.subscriptions.length > 0) {
      await prisma.subscription.updateMany({
        where: {
          userId: user.id,
          status: SubscriptionStatus.ACTIVE,
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
        },
      });
      console.log('✅ Anciens abonnements désactivés');
    }

    // Activer l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        active: true,
      },
    });
    console.log('✅ Utilisateur activé (verified: true, active: true)');

    // Créer le nouvel abonnement PROFESSIONAL
    const newSubscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: professionalPlan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        autoRenew: false,
        paymentMethod: 'ADMIN_GRANT',
        transactionId: `ADMIN-${Date.now()}`,
      },
      include: {
        plan: true,
      },
    });

    console.log('✅ Abonnement PROFESSIONAL créé avec succès\n');

    // Afficher le résumé
    console.log('📊 Résumé des modifications:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Utilisateur: ${user.fullName} (${user.email})`);
    console.log(`   ✅ Vérifié: Oui`);
    console.log(`   ✅ Actif: Oui`);
    console.log(`📦 Abonnement: ${newSubscription.plan.name} (${newSubscription.plan.type})`);
    console.log(`   ✅ Statut: ${newSubscription.status}`);
    console.log(`   📅 Date de début: ${startDate.toLocaleDateString()}`);
    console.log(`   📅 Date de fin: ${endDate.toLocaleDateString()}`);
    console.log(`   💰 Prix: ${professionalPlan.price} FCFA`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Utilisateur activé et abonnement PROFESSIONAL attribué avec succès !\n');

  } catch (error) {
    console.error('❌ Erreur lors de l\'activation:', error);
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

