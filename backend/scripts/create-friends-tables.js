const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createFriendsTables() {
  try {
    console.log('🚀 [MIGRATION] Création des tables d\'amitié...');

    // Créer l'enum FriendshipStatus
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✅ [MIGRATION] Enum FriendshipStatus créé');

    // Créer la table friendships
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(requester_id, addressee_id)
      );
    `;
    console.log('✅ [MIGRATION] Table friendships créée');

    // Créer les index
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS friendships_requester_id_idx ON friendships (requester_id);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS friendships_addressee_id_idx ON friendships (addressee_id);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS friendships_status_idx ON friendships (status);`;
    console.log('✅ [MIGRATION] Index créés');

    // Créer un trigger pour updated_at
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION update_friendships_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS update_friendships_updated_at ON friendships;
      CREATE TRIGGER update_friendships_updated_at
      BEFORE UPDATE ON friendships
      FOR EACH ROW
      EXECUTE FUNCTION update_friendships_updated_at();
    `;
    console.log('✅ [MIGRATION] Trigger updated_at créé');

    console.log('🎉 [MIGRATION] Tables d\'amitié créées avec succès !');
  } catch (error) {
    console.error('❌ [MIGRATION] Erreur lors de la création des tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFriendsTables();
