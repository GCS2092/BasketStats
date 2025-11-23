const fs = require('fs');
const path = require('path');

function updateNgrokUrls() {
  console.log('🔄 [NGROK] Mise à jour des URLs ngrok...\n');

  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    // Lire le fichier .env actuel
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Demander la nouvelle URL ngrok
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('🌐 Entrez votre nouvelle URL ngrok (ex: https://abc123.ngrok-free.dev): ', (newNgrokUrl) => {
      if (!newNgrokUrl || !newNgrokUrl.includes('ngrok')) {
        console.log('❌ URL ngrok invalide');
        rl.close();
        return;
      }

      // Nettoyer l'URL (enlever le slash final si présent)
      const cleanUrl = newNgrokUrl.replace(/\/$/, '');
      
      console.log(`\n🔄 [NGROK] Mise à jour avec: ${cleanUrl}`);

      // URLs à mettre à jour
      const ngrokUrls = {
        'PAYTECH_IPN_URL': `${cleanUrl}/api/paytech/ipn`,
        'PAYTECH_SUCCESS_URL': `${cleanUrl}/api/paytech/success`,
        'PAYTECH_CANCEL_URL': `${cleanUrl}/api/paytech/cancel`
      };

      // Mettre à jour chaque URL
      let updatedContent = envContent;
      
      Object.entries(ngrokUrls).forEach(([varName, newValue]) => {
        const regex = new RegExp(`^${varName}=.*$`, 'm');
        if (regex.test(updatedContent)) {
          // Remplacer l'URL existante
          updatedContent = updatedContent.replace(regex, `${varName}="${newValue}"`);
          console.log(`✅ [NGROK] ${varName}: ${newValue}`);
        } else {
          // Ajouter la variable
          updatedContent += `\n${varName}="${newValue}"`;
          console.log(`➕ [NGROK] ${varName}: ${newValue}`);
        }
      });

      // Écrire le fichier .env mis à jour
      fs.writeFileSync(envPath, updatedContent);

      console.log('\n✅ [NGROK] URLs ngrok mises à jour avec succès!');
      console.log('\n💡 [NGROK] Prochaines étapes:');
      console.log('   1. Redémarrer le backend');
      console.log('   2. Tester le changement de plan');
      console.log('   3. Vérifier que PayTech fonctionne');

      rl.close();
    });

  } catch (error) {
    console.error('❌ [NGROK] Erreur lors de la mise à jour:', error);
  }
}

// Exécuter la mise à jour
updateNgrokUrls();
