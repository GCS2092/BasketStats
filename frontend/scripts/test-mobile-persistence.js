const fs = require('fs');
const path = require('path');

// Script de test pour les fonctionnalités mobile et de connexion persistante
function testMobilePersistence() {
  console.log('🧪 [TEST] Test des fonctionnalités mobile et de connexion persistante...\n');

  // Vérifier que tous les composants existent
  const components = [
    'src/components/common/MobileBackButton.tsx',
    'src/hooks/usePersistentAuth.ts',
    'src/components/common/PersistentAuthIndicator.tsx',
    'src/components/common/PersistentLogoutButton.tsx'
  ];

  console.log('📁 [TEST] Vérification des composants:');
  components.forEach(component => {
    const filePath = path.join(__dirname, '..', component);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${component}`);
    } else {
      console.log(`  ❌ ${component} - MANQUANT`);
    }
  });

  // Vérifier les imports dans MainLayout
  console.log('\n🔗 [TEST] Vérification des imports dans MainLayout:');
  const mainLayoutPath = path.join(__dirname, '..', 'src', 'components', 'layout', 'MainLayout.tsx');
  
  if (fs.existsSync(mainLayoutPath)) {
    const content = fs.readFileSync(mainLayoutPath, 'utf8');
    
    const requiredImports = [
      'MobileBackButton',
      'PersistentAuthIndicator'
    ];

    requiredImports.forEach(importName => {
      if (content.includes(importName)) {
        console.log(`  ✅ ${importName} importé`);
      } else {
        console.log(`  ❌ ${importName} - IMPORT MANQUANT`);
      }
    });

    // Vérifier l'utilisation des composants
    if (content.includes('<MobileBackButton')) {
      console.log('  ✅ MobileBackButton utilisé');
    } else {
      console.log('  ❌ MobileBackButton - UTILISATION MANQUANTE');
    }

    if (content.includes('<PersistentAuthIndicator')) {
      console.log('  ✅ PersistentAuthIndicator utilisé');
    } else {
      console.log('  ❌ PersistentAuthIndicator - UTILISATION MANQUANTE');
    }
  }

  // Vérifier les imports dans Header
  console.log('\n🔗 [TEST] Vérification des imports dans Header:');
  const headerPath = path.join(__dirname, '..', 'src', 'components', 'layout', 'Header.tsx');
  
  if (fs.existsSync(headerPath)) {
    const content = fs.readFileSync(headerPath, 'utf8');
    
    if (content.includes('PersistentLogoutButton')) {
      console.log('  ✅ PersistentLogoutButton importé et utilisé');
    } else {
      console.log('  ❌ PersistentLogoutButton - IMPORT/UTILISATION MANQUANTE');
    }
  }

  // Vérifier les imports dans ElegantHamburgerMenu
  console.log('\n🔗 [TEST] Vérification des imports dans ElegantHamburgerMenu:');
  const hamburgerPath = path.join(__dirname, '..', 'src', 'components', 'layout', 'ElegantHamburgerMenu.tsx');
  
  if (fs.existsSync(hamburgerPath)) {
    const content = fs.readFileSync(hamburgerPath, 'utf8');
    
    if (content.includes('PersistentLogoutButton')) {
      console.log('  ✅ PersistentLogoutButton importé et utilisé dans le menu hamburger');
    } else {
      console.log('  ❌ PersistentLogoutButton - IMPORT/UTILISATION MANQUANTE dans le menu hamburger');
    }
  }

  console.log('\n🎯 [TEST] Instructions de test manuel:');
  console.log('1. 📱 Testez sur mobile (375px - 768px):');
  console.log('   - Vérifiez que le bouton retour apparaît sur les pages de détail');
  console.log('   - Vérifiez qu\'il est masqué sur les pages principales');
  console.log('   - Testez la fonctionnalité de retour');
  
  console.log('\n2. 🔐 Testez la connexion persistante:');
  console.log('   - Connectez-vous et laissez la page ouverte');
  console.log('   - Vérifiez que la session reste active');
  console.log('   - Testez l\'indicateur d\'inactivité après 5 minutes');
  console.log('   - Testez le bouton "Prolonger la session"');
  
  console.log('\n3. 🚪 Testez la déconnexion:');
  console.log('   - Cliquez sur le bouton de déconnexion');
  console.log('   - Vérifiez la modal de confirmation');
  console.log('   - Confirmez la déconnexion');
  console.log('   - Vérifiez que localStorage est nettoyé');

  console.log('\n✅ [TEST] Test terminé !');
}

// Exécuter le test
testMobilePersistence();
