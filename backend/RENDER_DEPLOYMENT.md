# 🚀 Guide de Déploiement sur Render

Ce guide vous explique comment déployer le backend BasketStats sur Render.

## 📋 Prérequis

1. Un compte Render (gratuit disponible)
2. Un compte GitHub avec le code poussé
3. Une base de données PostgreSQL (Render propose des bases de données gratuites)

## 🔧 Étapes de Déploiement

### 1. Créer une Base de Données PostgreSQL sur Render

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Cliquez sur **"New +"** → **"PostgreSQL"**
3. Configurez :
   - **Name**: `basketstats-db`
   - **Database**: `basketstats`
   - **User**: `basketstats_user`
   - **Region**: Choisissez la région la plus proche
   - **Plan**: `Free` (pour commencer)
4. Cliquez sur **"Create Database"**
5. **IMPORTANT**: Copiez la **Internal Database URL** (vous en aurez besoin)

### 2. Créer le Service Web (Backend)

1. Dans Render Dashboard, cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre repository GitHub
3. Sélectionnez le repository `BasketStats`
4. Configurez :
   - **Name**: `basketstats-backend`
   - **Root Directory**: `backend` (important !)
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     npm install && npm run build && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command**: 
     ```bash
     npm run start:prod
     ```
   - **Plan**: `Free` (pour commencer)

### 3. Configurer les Variables d'Environnement

Dans la section **"Environment"** du service web, ajoutez :

#### Base de Données
```
DATABASE_URL=<votre-internal-database-url-de-render>
```

#### Serveur
```
NODE_ENV=production
PORT=10000
```

#### JWT (Générez des secrets forts)
```bash
# Générez des secrets avec :
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
```
JWT_SECRET=<générez-un-secret-fort-64-caractères>
JWT_REFRESH_SECRET=<générez-un-secret-fort-64-caractères>
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
```

#### CORS - URL du Frontend (Vercel)
```
FRONTEND_URL=https://votre-frontend.vercel.app
```

#### PayTech (si utilisé)
```
PAYTECH_API_KEY=<votre-clé-api>
PAYTECH_API_SECRET=<votre-secret>
PAYTECH_BASE_URL=https://paytech.sn/api
PAYTECH_ENV=production
PAYTECH_IPN_URL=https://votre-backend.onrender.com/api/paytech/ipn
PAYTECH_SUCCESS_URL=https://votre-frontend.vercel.app/payment/success
PAYTECH_CANCEL_URL=https://votre-frontend.vercel.app/payment/cancel
```

#### Email (Nodemailer) - Optionnel
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-app-password
SMTP_FROM=noreply@basketstats.com
```

#### OAuth (si utilisé)
```
GOOGLE_CLIENT_ID=<votre-google-client-id>
GOOGLE_CLIENT_SECRET=<votre-google-client-secret>
FACEBOOK_CLIENT_ID=<votre-facebook-app-id>
FACEBOOK_CLIENT_SECRET=<votre-facebook-app-secret>
```

#### Rate Limiting
```
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

#### Web Push (si utilisé)
```
VAPID_PUBLIC_KEY=<votre-vapid-public-key>
VAPID_PRIVATE_KEY=<votre-vapid-private-key>
VAPID_SUBJECT=mailto:votre-email@example.com
```

### 4. Health Check

Render vérifiera automatiquement l'endpoint `/api/health` pour s'assurer que le service fonctionne.

### 5. Déployer

1. Cliquez sur **"Create Web Service"**
2. Render va :
   - Cloner votre repository
   - Installer les dépendances
   - Builder l'application
   - Générer Prisma Client
   - Exécuter les migrations
   - Démarrer le service

### 6. Vérifier le Déploiement

Une fois déployé, vous devriez voir :
- ✅ Status: **Live**
- 🌐 URL: `https://basketstats-backend.onrender.com`
- 📊 Health Check: **Healthy**

Testez l'API :
```bash
curl https://votre-backend.onrender.com/api/health
```

Vous devriez recevoir :
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "basketstats-backend"
}
```

## 🔄 Mises à Jour Automatiques

Render déploie automatiquement à chaque push sur la branche `main` de votre repository GitHub.

## 📝 Notes Importantes

1. **Free Tier Limitations**:
   - Le service se met en veille après 15 minutes d'inactivité
   - Le premier démarrage après veille peut prendre 30-60 secondes
   - Pour éviter cela, utilisez un plan payant ou un service de ping

2. **Base de Données**:
   - La base de données gratuite se met aussi en veille
   - Utilisez l'**Internal Database URL** pour les connexions (plus rapide et gratuit)
   - L'Internal URL est de la forme : `postgresql://user:password@dpg-xxxxx-a/basketstats`

3. **Variables d'Environnement**:
   - Ne commitez JAMAIS les vraies valeurs dans le code
   - Utilisez toujours les variables d'environnement de Render
   - L'Internal Database URL est différente de l'External URL

4. **CORS**:
   - Assurez-vous que `FRONTEND_URL` pointe vers votre frontend Vercel
   - Le backend acceptera automatiquement les requêtes depuis cette URL

5. **Port**:
   - Render définit automatiquement `PORT` (généralement 10000)
   - Votre code utilise déjà `process.env.PORT || 3001`

## 🐛 Dépannage

### Le service ne démarre pas
- Vérifiez les logs dans Render Dashboard → **"Logs"**
- Assurez-vous que toutes les variables d'environnement sont définies
- Vérifiez que `DATABASE_URL` est correct (utilisez l'Internal URL)

### Erreurs de migration Prisma
- Vérifiez que la base de données est créée
- Vérifiez que `DATABASE_URL` est correct
- Les migrations s'exécutent automatiquement avec `prisma migrate deploy`

### Erreurs CORS
- Vérifiez que `FRONTEND_URL` est défini et correct
- Vérifiez que l'URL du frontend correspond exactement (avec/sans trailing slash)

### Service en veille (Free Tier)
- Le service se réveille automatiquement à la première requête
- Cela peut prendre 30-60 secondes
- Pour éviter cela, utilisez un service de ping comme [UptimeRobot](https://uptimerobot.com) (gratuit)

### Base de données en veille
- La base de données se réveille automatiquement
- La première connexion peut être lente
- Utilisez l'Internal Database URL pour de meilleures performances

## 🔗 Liens Utiles

- [Documentation Render](https://render.com/docs)
- [Render Dashboard](https://dashboard.render.com)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [UptimeRobot](https://uptimerobot.com) - Pour éviter la mise en veille (gratuit)

## 💡 Astuces

1. **Éviter la mise en veille** (Free Tier):
   - Utilisez UptimeRobot pour ping votre service toutes les 5 minutes
   - Configurez une URL de ping : `https://votre-backend.onrender.com/api/health`

2. **Performance**:
   - Utilisez toujours l'Internal Database URL (plus rapide)
   - L'Internal URL est visible dans les paramètres de la base de données

3. **Monitoring**:
   - Render fournit des logs en temps réel
   - Surveillez les logs pour détecter les erreurs rapidement

4. **Sécurité**:
   - Ne partagez jamais vos variables d'environnement
   - Utilisez des secrets forts pour JWT
   - Limitez CORS à votre domaine de production uniquement

