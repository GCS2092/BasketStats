const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePlayerProfileSchema() {
  try {
    console.log('🔄 Mise à jour du schéma PlayerProfile...');
    
    // Vérifier si les nouvelles colonnes existent déjà
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'player_profiles' 
      AND column_name IN ('full_name', 'date_of_birth', 'birth_place', 'nationality', 'wingspan', 'sporting_background')
    `;
    
    const existingColumns = tableInfo.map(row => row.column_name);
    console.log('Colonnes existantes:', existingColumns);
    
    // Ajouter les colonnes manquantes
    const columnsToAdd = [
      { name: 'full_name', type: 'VARCHAR(255)', nullable: true },
      { name: 'date_of_birth', type: 'DATE', nullable: true },
      { name: 'birth_place', type: 'VARCHAR(255)', nullable: true },
      { name: 'nationality', type: 'VARCHAR(100)', nullable: true },
      { name: 'wingspan', type: 'INTEGER', nullable: true },
      { name: 'sporting_background', type: 'TEXT', nullable: true }
    ];
    
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`➕ Ajout de la colonne ${column.name}...`);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE player_profiles 
          ADD COLUMN ${column.name} ${column.type}${column.nullable ? '' : ' NOT NULL'}
        `);
        console.log(`✅ Colonne ${column.name} ajoutée avec succès`);
      } else {
        console.log(`⏭️  Colonne ${column.name} existe déjà`);
      }
    }
    
    // Ajouter l'index sur nationality s'il n'existe pas
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_player_profiles_nationality ON player_profiles(nationality)`;
      console.log('✅ Index sur nationality créé/confirmé');
    } catch (error) {
      console.log('ℹ️  Index sur nationality déjà existant ou erreur:', error.message);
    }
    
    console.log('🎉 Mise à jour du schéma terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du schéma:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
updatePlayerProfileSchema()
  .then(() => {
    console.log('✅ Migration terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur de migration:', error);
    process.exit(1);
  });
