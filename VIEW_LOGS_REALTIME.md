# 📊 Voir les Logs en Temps Réel

## 🎯 Accès aux Logs en Temps Réel

### 🔵 Backend Render (basketstatsbackend)

#### Méthode 1 : Dashboard Render (Recommandé)

1. Allez sur : **[https://dashboard.render.com](https://dashboard.render.com)**
2. Cliquez sur le service : **`basketstatsbackend`**
3. Cliquez sur l'onglet **"Logs"** (dans le menu de gauche)
4. Les logs s'affichent en temps réel et se mettent à jour automatiquement

**Fonctionnalités** :
- ✅ Logs en temps réel (mise à jour automatique)
- ✅ Filtrage par recherche
- ✅ Historique des logs
- ✅ Copie des logs

#### Méthode 2 : Render CLI (Optionnel)

Si vous avez installé le Render CLI :

```bash
# Installer Render CLI (si pas déjà fait)
npm install -g render-cli

# Se connecter
render login

# Voir les logs en temps réel
render logs basketstatsbackend --tail
```

---

### 🟢 Frontend Vercel (basket-stats-frontend-ny73)

#### Méthode 1 : Dashboard Vercel (Recommandé)

1. Allez sur : **[https://vercel.com/dashboard](https://vercel.com/dashboard)**
2. Cliquez sur le projet : **`basket-stats-frontend-ny73`**
3. Allez dans l'onglet **"Deployments"**
4. Cliquez sur le dernier déploiement (le plus récent)
5. Cliquez sur **"View Function Logs"** ou **"Runtime Logs"**

**Fonctionnalités** :
- ✅ Logs en temps réel
- ✅ Filtrage par fonction
- ✅ Recherche dans les logs
- ✅ Export des logs

#### Méthode 2 : Vercel CLI (Optionnel)

Si vous avez installé le Vercel CLI :

```bash
# Installer Vercel CLI (si pas déjà fait)
npm install -g vercel

# Se connecter
vercel login

# Voir les logs en temps réel
vercel logs basket-stats-frontend-ny73 --follow
```

---

## 🔍 Ce qu'il faut Chercher dans les Logs

### Backend Render - Logs Importants

#### ✅ Logs Normaux (Tout va bien)
```
[Nest] LOG [NestApplication] Nest application successfully started
🚀 Backend NestJS démarré sur : http://localhost:10000
✅ Base de données PostgreSQL connectée
```

#### ❌ Erreurs à Surveiller

**Erreur CORS** :
```
ERROR [ExceptionsHandler] Not allowed by CORS
```
→ **Solution** : Vérifiez `FRONTEND_URL` dans les variables d'environnement Render

**Erreur Base de Données** :
```
PrismaClientKnownRequestError: Invalid prisma.user.findUnique() invocation
```
→ **Solution** : Vérifiez `DATABASE_URL` et les migrations Prisma

**Erreur Authentification** :
```
ERROR [AuthService] Erreur lors de la vérification de l'abonnement
```
→ **Solution** : Vérifiez la connexion à la base de données

---

### Frontend Vercel - Logs Importants

#### ✅ Logs Normaux (Tout va bien)
```
✓ Compiled successfully
✓ Linting and checking validity of types
```

#### ❌ Erreurs à Surveiller

**Erreur Variables d'Environnement** :
```
Error: NEXT_PUBLIC_API_URL is not defined
```
→ **Solution** : Ajoutez `NEXT_PUBLIC_API_URL` dans Vercel Settings → Environment Variables

**Erreur NextAuth** :
```
[next-auth][error][CLIENT_FETCH_ERROR]
```
→ **Solution** : Vérifiez `NEXTAUTH_SECRET` et `NEXTAUTH_URL`

**Erreur Build** :
```
Error: Command "npm run build" exited with 1
```
→ **Solution** : Vérifiez les erreurs TypeScript/ESLint dans les logs

---

## 🚀 Accès Rapide

### Backend Render
**URL Directe** : [https://dashboard.render.com/web/basketstatsbackend](https://dashboard.render.com/web/basketstatsbackend)

1. Cliquez sur **"Logs"** dans le menu de gauche
2. Les logs s'affichent en temps réel

### Frontend Vercel
**URL Directe** : [https://vercel.com/gcs2092/basket-stats-frontend-ny73](https://vercel.com/gcs2092/basket-stats-frontend-ny73)

1. Cliquez sur **"Deployments"**
2. Cliquez sur le dernier déploiement
3. Cliquez sur **"View Function Logs"** ou **"Runtime Logs"**

---

## 📱 Astuces pour Surveiller les Logs

### 1. Garder les Onglets Ouverts

Ouvrez les deux dashboards dans des onglets séparés :
- **Onglet 1** : Render Logs (Backend)
- **Onglet 2** : Vercel Logs (Frontend)

### 2. Utiliser la Recherche

Dans les deux dashboards, utilisez la fonction de recherche pour filtrer :
- **Render** : Cherchez "ERROR", "WARN", "CORS"
- **Vercel** : Cherchez "error", "failed", "NEXT_PUBLIC"

### 3. Surveiller en Temps Réel

Les logs se mettent à jour automatiquement. Vous verrez les nouvelles entrées apparaître en temps réel.

---

## 🔧 Commandes Utiles

### Tester le Backend en Temps Réel

```bash
# Health check
curl https://basketstatsbackend.onrender.com/api/health

# Test login (remplacez par vos identifiants)
curl -X POST https://basketstatsbackend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"slovengama@gmail.com","password":"password123"}'
```

### Tester le Frontend

Ouvrez la console du navigateur (F12) sur :
```
https://basket-stats-frontend-ny73.vercel.app
```

---

## 📊 Monitoring Avancé

### Render - Métriques

1. Allez sur Render Dashboard → **`basketstatsbackend`**
2. Cliquez sur **"Metrics"**
3. Vous verrez :
   - CPU Usage
   - Memory Usage
   - Request Rate
   - Response Time

### Vercel - Analytics

1. Allez sur Vercel Dashboard → **`basket-stats-frontend-ny73`**
2. Cliquez sur **"Analytics"** (si activé)
3. Vous verrez :
   - Page Views
   - Performance Metrics
   - Error Rate

---

## ⚡ Accès Ultra-Rapide

### Liens Directs

**Backend Logs Render** :
```
https://dashboard.render.com/web/basketstatsbackend/logs
```

**Frontend Logs Vercel** :
```
https://vercel.com/gcs2092/basket-stats-frontend-ny73/deployments
```

---

## 🎯 Checklist de Surveillance

Quand vous surveillez les logs, vérifiez :

- [ ] Backend démarre correctement (pas d'erreurs au démarrage)
- [ ] Base de données connectée (pas d'erreurs Prisma)
- [ ] CORS fonctionne (pas d'erreurs "Not allowed by CORS")
- [ ] Frontend build réussi (pas d'erreurs de compilation)
- [ ] Variables d'environnement présentes (pas d'erreurs "undefined")
- [ ] Authentification fonctionne (pas d'erreurs NextAuth)

---

## 💡 Conseil Pro

**Gardez les deux dashboards ouverts** pendant que vous testez l'application. Vous verrez immédiatement les erreurs dans les logs en temps réel !

