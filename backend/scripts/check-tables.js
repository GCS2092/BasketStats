const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 [CHECK] Vérification des tables existantes...');

    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('📋 [CHECK] Tables trouvées:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ [CHECK] Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();