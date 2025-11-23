# 🚂 Guide de Déploiement sur Railway

Ce guide vous explique comment déployer le backend BasketStats sur Railway.

## 📋 Prérequis

1. Un compte Railway (gratuit avec crédits mensuels)
2. Un compte GitHub avec le code poussé
3. GitHub CLI installé (optionnel, pour CLI) ou utilisez le dashboard web

## 🔧 Étapes de Déploiement

### 1. Créer un Nouveau Projet sur Railway

#### Option A : Via le Dashboard Web (Recommandé)

1. Allez sur [Railway Dashboard](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Autorisez Railway à accéder à votre GitHub si nécessaire
5. Sélectionnez le repository `BasketStats`
6. Railway détectera automatiquement le dossier `backend`

#### Option B : Via Railway CLI

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Initialiser le projet
railway init

# Lier au repository GitHub
railway link
```

### 2. Ajouter une Base de Données PostgreSQL

1. Dans votre projet Railway, cliquez sur **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway créera automatiquement une base de données PostgreSQL
3. **IMPORTANT**: Railway créera automatiquement la variable `DATABASE_URL` - vous n'avez pas besoin de la créer manuellement !

### 3. Configurer les Variables d'Environnement

Dans votre service backend, allez dans **"Variables"** et ajoutez :

#### Base de Données
```
# DATABASE_URL est automatiquement créé par Railway quand vous ajoutez PostgreSQL
# Pas besoin de le créer manuellement !
```

#### Serveur
```
NODE_ENV=production
PORT=3001
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
PAYTECH_IPN_URL=https://votre-backend.up.railway.app/api/paytech/ipn
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

### 4. Configurer le Build et le Démarrage

Railway détecte automatiquement :
- **Root Directory**: `backend` (détecté automatiquement)
- **Build Command**: `npm install && npm run build && npx prisma generate`
- **Start Command**: `npm run start:prod`

Si Railway ne détecte pas automatiquement, configurez dans **"Settings"** → **"Deploy"** :
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build && npx prisma generate`
- **Start Command**: `npm run start:prod`

### 5. Exécuter les Migrations Prisma

Railway exécutera automatiquement les migrations au build grâce à la commande dans `package.json`.

Si vous devez les exécuter manuellement, utilisez Railway CLI :

```bash
railway run npx prisma migrate deploy
```

### 6. Déployer

Railway déploiera automatiquement :
1. À chaque push sur la branche `main`
2. Ou manuellement via le dashboard en cliquant sur **"Deploy"**

### 7. Vérifier le Déploiement

Une fois déployé, vous verrez :
- ✅ Status: **Active**
- 🌐 URL: `https://votre-backend.up.railway.app`
- 📊 Health Check: Testez `/api/health`

Testez l'API :
```bash
curl https://votre-backend.up.railway.app/api/health
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

Railway déploie automatiquement à chaque push sur la branche connectée (généralement `main`).

## 📝 Notes Importantes

1. **Free Tier**:
   - Railway offre $5 de crédits gratuits par mois
   - Après épuisement, le service s'arrête (mais les données sont conservées)
   - Pour la production, considérez un plan payant

2. **Base de Données**:
   - Railway crée automatiquement `DATABASE_URL`
   - Utilisez cette variable - ne la créez pas manuellement
   - La base de données est persistante même si le service s'arrête

3. **Variables d'Environnement**:
   - Ne commitez JAMAIS les vraies valeurs dans le code
   - Utilisez toujours les variables d'environnement de Railway
   - Railway peut importer depuis un fichier `.env` (mais ne le commitez pas !)

4. **CORS**:
   - Assurez-vous que `FRONTEND_URL` pointe vers votre frontend Vercel
   - Le backend acceptera automatiquement les requêtes depuis cette URL

5. **Port**:
   - Railway définit automatiquement `PORT` - votre code l'utilise déjà
   - Ne définissez pas `PORT` manuellement sauf si nécessaire

6. **Domaines Personnalisés**:
   - Railway permet d'ajouter des domaines personnalisés
   - Allez dans **"Settings"** → **"Networking"** → **"Custom Domain"**

## 🐛 Dépannage

### Le service ne démarre pas
- Vérifiez les logs dans Railway Dashboard → **"Deployments"** → Cliquez sur le déploiement
- Assurez-vous que toutes les variables d'environnement sont définies
- Vérifiez que `DATABASE_URL` existe (créé automatiquement par Railway)

### Erreurs de migration Prisma
- Vérifiez que la base de données PostgreSQL est créée
- Vérifiez les logs de build pour voir les erreurs de migration
- Les migrations s'exécutent automatiquement au build

### Erreurs CORS
- Vérifiez que `FRONTEND_URL` est défini et correct
- Vérifiez que l'URL du frontend correspond exactement
- Testez avec `curl` pour voir les headers CORS

### Le service redémarre en boucle
- Vérifiez les logs pour les erreurs
- Vérifiez que le port est correctement configuré
- Vérifiez que la base de données est accessible

### Base de données non accessible
- Vérifiez que `DATABASE_URL` est bien défini
- Vérifiez que la base de données est dans le même projet Railway
- Vérifiez les logs de connexion Prisma

## 🔗 Liens Utiles

- [Documentation Railway](https://docs.railway.app)
- [Railway Dashboard](https://railway.app/dashboard)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## 🚀 Commandes Railway CLI Utiles

```bash
# Se connecter
railway login

# Voir les logs en temps réel
railway logs

# Exécuter une commande dans l'environnement Railway
railway run npm run prisma:studio

# Ouvrir le dashboard
railway open

# Voir les variables d'environnement
railway variables

# Ajouter une variable
railway variables set KEY=value

# Voir les services
railway status
```

## 📊 Monitoring

Railway fournit :
- **Logs en temps réel** dans le dashboard
- **Métriques** (CPU, RAM, réseau)
- **Historique des déploiements**
- **Alertes** (configurables)

## 🔐 Sécurité

1. **Secrets**:
   - Utilisez Railway Variables pour tous les secrets
   - Ne commitez jamais les secrets dans le code
   - Utilisez des secrets forts pour JWT

2. **CORS**:
   - Limitez `FRONTEND_URL` à votre domaine de production uniquement
   - En développement, le code accepte localhost automatiquement

3. **Rate Limiting**:
   - Configuré via `THROTTLE_TTL` et `THROTTLE_LIMIT`
   - Ajustez selon vos besoins

