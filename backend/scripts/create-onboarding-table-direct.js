const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createOnboardingTable() {
  console.log('🚀 [MIGRATION] Création directe de la table onboarding_progress...\n');

  try {
    // Vérifier si la table existe déjà
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'onboarding_progress'
      );
    `;

    if (tableExists[0].exists) {
      console.log('✅ [MIGRATION] La table onboarding_progress existe déjà');
      return;
    }

    // Créer la table onboarding_progress
    await prisma.$executeRaw`
      CREATE TABLE onboarding_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        current_step INTEGER NOT NULL DEFAULT 0,
        total_steps INTEGER NOT NULL DEFAULT 0,
        completed_steps TEXT[] NOT NULL DEFAULT '{}',
        is_completed BOOLEAN NOT NULL DEFAULT false,
        role VARCHAR NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `;

    console.log('✅ [MIGRATION] Table onboarding_progress créée');

    // Créer les index
    await prisma.$executeRaw`
      CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);
    `;

    await prisma.$executeRaw`
      CREATE INDEX idx_onboarding_progress_is_completed ON onboarding_progress(is_completed);
    `;

    console.log('✅ [MIGRATION] Index créés');

    // Créer un trigger pour updated_at
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    await prisma.$executeRaw`
      CREATE TRIGGER update_onboarding_progress_updated_at 
      BEFORE UPDATE ON onboarding_progress 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    console.log('✅ [MIGRATION] Trigger updated_at créé');

    console.log('\n🎉 [MIGRATION] Table onboarding_progress créée avec succès !');

  } catch (error) {
    console.error('❌ [MIGRATION] Erreur lors de la création de la table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
createOnboardingTable();
