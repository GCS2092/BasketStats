const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  console.log('🧪 [TEST] Test d\'upload d\'images...\n');

  try {
    // 1. Créer un fichier de test
    const testImagePath = path.join(__dirname, '..', 'test-image.png');
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImagePath, testImageContent);
    console.log('✅ [TEST] Fichier de test créé');

    // 2. Tester l'upload d'image
    console.log('\n🖼️ [TEST] Test upload image...');
    const imageFormData = new FormData();
    imageFormData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    const imageResponse = await axios.post('http://192.168.1.118:3001/api/upload/image', imageFormData, {
      headers: {
        ...imageFormData.getHeaders(),
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Remplacez par un vrai token
      }
    });

    console.log('✅ [TEST] Upload image réussi:', imageResponse.data);

    // 3. Tester l'upload d'avatar
    console.log('\n👤 [TEST] Test upload avatar...');
    const avatarFormData = new FormData();
    avatarFormData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-avatar.png',
      contentType: 'image/png'
    });

    const avatarResponse = await axios.post('http://192.168.1.118:3001/api/upload/avatar', avatarFormData, {
      headers: {
        ...avatarFormData.getHeaders(),
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Remplacez par un vrai token
      }
    });

    console.log('✅ [TEST] Upload avatar réussi:', avatarResponse.data);

    // 4. Nettoyer
    fs.unlinkSync(testImagePath);
    console.log('\n🧹 [TEST] Fichier de test supprimé');

    console.log('\n🎉 [TEST] Tous les tests d\'upload ont réussi!');

  } catch (error) {
    console.error('❌ [TEST] Erreur lors du test d\'upload:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 [TEST] Solution: Obtenez un token JWT valide');
      console.log('   1. Connectez-vous sur le frontend');
      console.log('   2. Ouvrez les outils de développement');
      console.log('   3. Copiez le token depuis localStorage ou cookies');
      console.log('   4. Remplacez YOUR_JWT_TOKEN_HERE dans ce script');
    }
  }
}

// Exécuter le test
testUpload();
