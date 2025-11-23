const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSubscriptionRestoreFields() {
  try {
    console.log('🚀 [MIGRATION] Ajout des champs de restauration des abonnements...');

    // Ajouter le statut SUSPENDED à l'enum
    await prisma.$executeRaw`
      ALTER TYPE "SubscriptionStatus" ADD VALUE 'SUSPENDED';
    `;
    console.log('✅ [MIGRATION] Statut SUSPENDED ajouté à l\'enum');

    // Ajouter les colonnes de suspension et restauration
    await prisma.$executeRaw`
      ALTER TABLE subscriptions 
      ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS suspended_reason TEXT,
      ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP(3);
    `;
    console.log('✅ [MIGRATION] Colonnes de suspension/restauration ajoutées');

    // Créer les index pour les nouvelles colonnes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS subscriptions_suspended_at_idx ON subscriptions (suspended_at);`;
    console.log('✅ [MIGRATION] Index créés');

    console.log('🎉 [MIGRATION] Champs de restauration des abonnements ajoutés avec succès !');
  } catch (error) {
    console.error('❌ [MIGRATION] Erreur lors de l\'ajout des champs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSubscriptionRestoreFields();
