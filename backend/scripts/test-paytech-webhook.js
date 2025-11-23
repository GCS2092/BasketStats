const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const PAYTECH_IPN_URL = `${BACKEND_URL}/paytech/ipn`;

// Simuler un webhook PayTech de succès
async function testPaytechWebhook() {
  console.log('🧪 [TEST] Test du webhook PayTech...\n');

  try {
    // Données simulées d'un webhook PayTech
    const webhookData = {
      type_event: 'sale_complete',
      custom_field: JSON.stringify({
        user_id: 'test-user-id', // Remplacez par un vrai ID utilisateur
        plan_type: 'PREMIUM',
        plan_name: 'Premium',
        subscription: true
      }),
      ref_command: `TEST_${Date.now()}`,
      item_name: 'Premium',
      item_price: '500',
      currency: 'XOF',
      command_name: 'Abonnement Premium - BasketStats',
      token: `test_token_${Date.now()}`,
      env: 'test',
      payment_method: 'Orange Money',
      client_phone: '+221771234567',
      api_key_sha256: 'test_api_key_sha256', // En test, on peut utiliser des valeurs factices
      api_secret_sha256: 'test_api_secret_sha256',
      hmac_compute: 'test_hmac_compute'
    };

    console.log('📤 [TEST] Envoi du webhook PayTech...');
    console.log('📋 [TEST] Données:', JSON.stringify(webhookData, null, 2));

    const response = await axios.post(PAYTECH_IPN_URL, webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PayTech-Webhook/1.0'
      },
      timeout: 10000
    });

    console.log('✅ [TEST] Webhook envoyé avec succès!');
    console.log('📋 [TEST] Status:', response.status);
    console.log('📋 [TEST] Response:', response.data);

  } catch (error) {
    console.error('❌ [TEST] Erreur lors du test du webhook:');
    console.error('   - Status:', error.response?.status);
    console.error('   - Status Text:', error.response?.statusText);
    console.error('   - Data:', error.response?.data);
    console.error('   - Message:', error.message);
  }
}

// Fonction pour tester avec un vrai utilisateur
async function testWithRealUser(userId) {
  console.log(`🧪 [TEST] Test avec l'utilisateur ${userId}...\n`);

  try {
    // Récupérer les informations de l'utilisateur
    const userResponse = await axios.get(`${BACKEND_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_JWT_TOKEN || 'test-token'}`
      }
    });

    const user = userResponse.data;
    console.log('👤 [TEST] Utilisateur trouvé:', user.fullName, `(${user.email})`);

    // Données simulées avec le vrai utilisateur
    const webhookData = {
      type_event: 'sale_complete',
      custom_field: JSON.stringify({
        user_id: userId,
        plan_type: 'PREMIUM',
        plan_name: 'Premium',
        subscription: true
      }),
      ref_command: `REAL_TEST_${Date.now()}`,
      item_name: 'Premium',
      item_price: '500',
      currency: 'XOF',
      command_name: 'Abonnement Premium - BasketStats',
      token: `real_test_token_${Date.now()}`,
      env: 'test',
      payment_method: 'Orange Money',
      client_phone: '+221771234567',
      api_key_sha256: 'test_api_key_sha256',
      api_secret_sha256: 'test_api_secret_sha256',
      hmac_compute: 'test_hmac_compute'
    };

    console.log('📤 [TEST] Envoi du webhook avec utilisateur réel...');
    const response = await axios.post(PAYTECH_IPN_URL, webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PayTech-Webhook/1.0'
      },
      timeout: 10000
    });

    console.log('✅ [TEST] Webhook envoyé avec succès!');
    console.log('📋 [TEST] Status:', response.status);
    console.log('📋 [TEST] Response:', response.data);

  } catch (error) {
    console.error('❌ [TEST] Erreur lors du test avec utilisateur réel:');
    console.error('   - Status:', error.response?.status);
    console.error('   - Status Text:', error.response?.statusText);
    console.error('   - Data:', error.response?.data);
    console.error('   - Message:', error.message);
  }
}

// Fonction principale
async function main() {
  console.log('🚀 [TEST] Démarrage des tests PayTech...\n');

  // Test 1: Webhook basique
  await testPaytechWebhook();

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Avec un utilisateur réel (si fourni)
  const userId = process.argv[2];
  if (userId) {
    await testWithRealUser(userId);
  } else {
    console.log('💡 [TEST] Pour tester avec un utilisateur réel, utilisez:');
    console.log('   node test-paytech-webhook.js <USER_ID>');
  }

  console.log('\n✅ [TEST] Tests terminés!');
}

// Exécuter les tests
main();
