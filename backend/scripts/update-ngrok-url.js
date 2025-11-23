const fs = require('fs');
const path = require('path');

function updateNgrokUrl() {
  console.log('🔄 [NGROK] Mise à jour de l\'URL ngrok...\n');

  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    // Lire le fichier .env actuel
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Récupérer l'URL ngrok depuis l'API ngrok
    const axios = require('axios');
    
    axios.get('http://localhost:4040/api/tunnels')
      .then(response => {
        const tunnels = response.data.tunnels;
        if (tunnels && tunnels.length > 0) {
          const ngrokUrl = tunnels[0].public_url;
          console.log(`✅ [NGROK] URL ngrok trouvée: ${ngrokUrl}`);
          
          // Mettre à jour les URLs PayTech
          const paytechUrls = {
            'PAYTECH_IPN_URL': `${ngrokUrl}/api/paytech/ipn`,
            'PAYTECH_SUCCESS_URL': `${ngrokUrl}/api/paytech/success`,
            'PAYTECH_CANCEL_URL': `${ngrokUrl}/api/paytech/cancel`
          };

          // Mettre à jour chaque URL
          let updatedContent = envContent;
          
          Object.entries(paytechUrls).forEach(([varName, newValue]) => {
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

          // Ajouter l'URL ngrok pour référence
          const ngrokRegex = /^NGROK_URL=.*$/m;
          if (ngrokRegex.test(updatedContent)) {
            updatedContent = updatedContent.replace(ngrokRegex, `NGROK_URL="${ngrokUrl}"`);
          } else {
            updatedContent += `\nNGROK_URL="${ngrokUrl}"`;
          }
          console.log(`✅ [NGROK] NGROK_URL: ${ngrokUrl}`);

          // Écrire le fichier .env mis à jour
          fs.writeFileSync(envPath, updatedContent);

          console.log('\n✅ [NGROK] URLs ngrok mises à jour avec succès!');
          console.log('\n💡 [NGROK] Prochaines étapes:');
          console.log('   1. Redémarrer le backend');
          console.log('   2. Tester le changement de plan');
          console.log('   3. Vérifier que PayTech fonctionne');

        } else {
          console.log('❌ [NGROK] Aucun tunnel ngrok trouvé');
          console.log('💡 [NGROK] Assurez-vous que ngrok est démarré sur le port 4040');
        }
      })
      .catch(error => {
        console.error('❌ [NGROK] Erreur lors de la récupération de l\'URL ngrok:', error.message);
        console.log('💡 [NGROK] Assurez-vous que ngrok est démarré et accessible sur http://localhost:4040');
      });

  } catch (error) {
    console.error('❌ [NGROK] Erreur lors de la mise à jour:', error);
  }
}

// Exécuter la mise à jour
updateNgrokUrl();
