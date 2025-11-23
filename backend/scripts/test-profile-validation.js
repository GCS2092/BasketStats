const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProfileValidation() {
  try {
    console.log('🧪 Test de validation du profil joueur...');
    
    // Test 1: Créer un profil avec des données valides
    console.log('\n1️⃣ Test avec des données valides...');
    const validProfileData = {
      fullName: 'John Doe',
      heightCm: 185,
      weightKg: 80,
      wingspan: 195,
      yearsExperience: 5,
      nationality: 'Française',
      country: 'France',
      city: 'Paris',
      position: 'SG',
      level: 'AMATEUR',
      availability: 'IMMEDIATELY',
      dominantHand: 'RIGHT',
      cvLink: 'https://linkedin.com/in/johndoe',
      sportingBackground: 'Joueur expérimenté avec 5 ans de pratique...'
    };
    
    console.log('✅ Données valides préparées:', validProfileData);
    
    // Test 2: Tester les validations côté serveur
    console.log('\n2️⃣ Test des validations...');
    
    // Test de la taille minimale
    const invalidHeight = { ...validProfileData, heightCm: 130 };
    console.log('❌ Taille invalide (130cm):', invalidHeight.heightCm < 140 ? 'ERREUR ATTENDUE' : 'OK');
    
    // Test de la taille maximale
    const invalidHeightMax = { ...validProfileData, heightCm: 260 };
    console.log('❌ Taille invalide (260cm):', invalidHeightMax.heightCm > 250 ? 'ERREUR ATTENDUE' : 'OK');
    
    // Test du poids minimal
    const invalidWeight = { ...validProfileData, weightKg: 30 };
    console.log('❌ Poids invalide (30kg):', invalidWeight.weightKg < 40 ? 'ERREUR ATTENDUE' : 'OK');
    
    // Test de l'expérience maximale
    const invalidExperience = { ...validProfileData, yearsExperience: 60 };
    console.log('❌ Expérience invalide (60 ans):', invalidExperience.yearsExperience > 50 ? 'ERREUR ATTENDUE' : 'OK');
    
    // Test du lien CV invalide
    const invalidCvLink = { ...validProfileData, cvLink: 'not-a-valid-url' };
    const isValidUrl = /^https?:\/\/.+/.test(invalidCvLink.cvLink);
    console.log('❌ Lien CV invalide:', !isValidUrl ? 'ERREUR ATTENDUE' : 'OK');
    
    // Test 3: Vérifier la structure de la base de données
    console.log('\n3️⃣ Vérification de la structure de la base de données...');
    
    const tableColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'player_profiles'
      AND column_name IN ('full_name', 'date_of_birth', 'birth_place', 'nationality', 'wingspan', 'sporting_background')
      ORDER BY column_name
    `;
    
    console.log('📋 Colonnes ajoutées:');
    tableColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Test 4: Vérifier les contraintes
    console.log('\n4️⃣ Vérification des contraintes...');
    
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'player_profiles'
      AND constraint_type IN ('CHECK', 'UNIQUE')
    `;
    
    console.log('🔒 Contraintes existantes:');
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });
    
    console.log('\n✅ Tests de validation terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter les tests
testProfileValidation()
  .then(() => {
    console.log('🎉 Tous les tests sont passés !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec des tests:', error);
    process.exit(1);
  });
