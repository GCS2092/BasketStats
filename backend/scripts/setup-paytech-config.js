const fs = require('fs');
const path = require('path');

function setupPaytechConfig() {
  console.log('🔧 [SETUP] Configuration PayTech...\n');

  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    // Lire le fichier .env actuel
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Configuration PayTech avec ngrok
    const paytechConfig = `
# PayTech Configuration (Test)
PAYTECH_API_KEY="test_api_key_12345"
PAYTECH_API_SECRET="test_api_secret_67890"
PAYTECH_ENV="test"
PAYTECH_BASE_URL="https://paytech.sn/api"

# URLs Ngrok (remplacer par votre URL ngrok actuelle)
PAYTECH_IPN_URL="https://unresurrected-agonistic-pauline.ngrok-free.dev/api/paytech/ipn"
PAYTECH_SUCCESS_URL="https://unresurrected-agonistic-pauline.ngrok-free.dev/api/paytech/success"
PAYTECH_CANCEL_URL="https://unresurrected-agonistic-pauline.ngrok-free.dev/api/paytech/cancel"

# Désactiver le mode skip pour tester PayTech
SKIP_PAYTECH=false`;

    // Mettre à jour les variables PayTech
    let updatedContent = envContent;

    // Remplacer ou ajouter les variables PayTech
    const paytechVars = [
      'PAYTECH_API_KEY',
      'PAYTECH_API_SECRET', 
      'PAYTECH_ENV',
      'PAYTECH_BASE_URL',
      'PAYTECH_IPN_URL',
      'PAYTECH_SUCCESS_URL',
      'PAYTECH_CANCEL_URL',
      'SKIP_PAYTECH'
    ];

    paytechVars.forEach(varName => {
      const regex = new RegExp(`^${varName}=.*$`, 'm');
      if (regex.test(updatedContent)) {
        // Remplacer la variable existante
        updatedContent = updatedContent.replace(regex, `${varName}="${getPaytechValue(varName)}"`);
      } else {
        // Ajouter la variable
        updatedContent += `\n${varName}="${getPaytechValue(varName)}"`;
      }
    });

    // Écrire le fichier .env mis à jour
    fs.writeFileSync(envPath, updatedContent);

    console.log('✅ [SETUP] Configuration PayTech mise à jour!');
    console.log('📋 [SETUP] Variables configurées:');
    console.log('   - PAYTECH_API_KEY: test_api_key_12345');
    console.log('   - PAYTECH_API_SECRET: test_api_secret_67890');
    console.log('   - PAYTECH_ENV: test');
    console.log('   - PAYTECH_BASE_URL: https://paytech.sn/api');
    console.log('   - PAYTECH_IPN_URL: https://unresurrected-agonistic-pauline.ngrok-free.dev/api/paytech/ipn');
    console.log('   - PAYTECH_SUCCESS_URL: https://unresurrected-agonistic-pauline.ngrok-free.dev/api/paytech/success');
    console.log('   - PAYTECH_CANCEL_URL: https://unresurrected-agonistic-pauline.ngrok-free.dev/api/paytech/cancel');
    console.log('   - SKIP_PAYTECH: false');

    console.log('\n💡 [SETUP] Prochaines étapes:');
    console.log('   1. Obtenir vos vraies clés PayTech sur https://paytech.sn');
    console.log('   2. Remplacer les clés de test par les vraies clés');
    console.log('   3. Redémarrer le backend');
    console.log('   4. Tester le changement de plan');

    console.log('\n🧪 [SETUP] Pour tester maintenant (mode test):');
    console.log('   cd backend && npm run start:dev');

  } catch (error) {
    console.error('❌ [SETUP] Erreur lors de la configuration:', error);
  }
}

function getPaytechValue(varName) {
  const values = {
    'PAYTECH_API_KEY': 'test_api_key_12345',
    'PAYTECH_API_SECRET': 'test_api_secret_67890',
    'PAYTECH_ENV': 'test',
    'PAYTECH_BASE_URL': 'https://paytech.sn/api',
    'PAYTECH_IPN_URL': 'https://unresurrected-agonistic-pauline.ngrok-free.dev/api/paytech/ipn',
    'PAYTECH_SUCCESS_URL': 'https://unresurrected-agonistic-pauline.ngrok-free.dev/api/paytech/success',
    'PAYTECH_CANCEL_URL': 'https://unresurrected-agonistic-pauline.ngrok-free.dev/api/paytech/cancel',
    'SKIP_PAYTECH': 'false'
  };
  return values[varName] || '';
}

// Exécuter la configuration
setupPaytechConfig();
