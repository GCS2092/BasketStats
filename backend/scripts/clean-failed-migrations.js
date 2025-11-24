/**
 * Script Node.js pour nettoyer les migrations échouées dans la base de données
 * Exécute le SQL pour supprimer l'entrée de la migration échouée
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanFailedMigrations() {
  try {
    console.log('🔍 Recherche des migrations échouées...');
    
    // Vérifier les migrations échouées
    const failedMigrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count, started_at
      FROM "_prisma_migrations"
      WHERE migration_name = '20250120000000_add_onboarding_system'
      AND finished_at IS NULL
    `;
    
    if (failedMigrations && failedMigrations.length > 0) {
      console.log('❌ Migration échouée trouvée:', failedMigrations);
      
      // Supprimer la migration échouée
      const result = await prisma.$executeRaw`
        DELETE FROM "_prisma_migrations"
        WHERE migration_name = '20250120000000_add_onboarding_system'
        AND finished_at IS NULL
      `;
      
      console.log(`✅ ${result} migration(s) échouée(s) supprimée(s)`);
    } else {
      console.log('✅ Aucune migration échouée trouvée');
    }
    
    // Afficher toutes les migrations
    const allMigrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count
      FROM "_prisma_migrations"
      ORDER BY started_at DESC
      LIMIT 10
    `;
    
    console.log('\n📋 Dernières migrations:');
    console.table(allMigrations);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanFailedMigrations();

