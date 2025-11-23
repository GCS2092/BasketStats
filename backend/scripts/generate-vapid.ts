import * as webpush from 'web-push';

console.log('🔐 Génération des clés VAPID pour Web Push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Clés VAPID générées avec succès!\n');
console.log('📋 Copiez ces valeurs dans votre fichier .env:\n');
console.log('VAPID_PUBLIC_KEY="' + vapidKeys.publicKey + '"');
console.log('VAPID_PRIVATE_KEY="' + vapidKeys.privateKey + '"');
console.log('\n⚠️  Gardez ces clés secrètes et ne les partagez jamais publiquement!');
console.log('💡 La clé publique sera utilisée côté frontend pour les souscriptions push.\n');

