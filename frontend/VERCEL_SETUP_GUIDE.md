# 🚀 Guide de Configuration Vercel - ÉTAPE PAR ÉTAPE

## ⚠️ Problème Actuel

Les erreurs suivantes apparaissent :
- `GET /api/auth/error` - `NS_ERROR_NET_ERROR_RESPONSE`
- `POST /api/auth/_log` - `HTTP/2 500`

**Cause** : Les variables d'environnement ne sont pas configurées sur Vercel.

---

## ✅ SOLUTION : Configuration des Variables d'Environnement

### 📋 ÉTAPE 1 : Générer NEXTAUTH_SECRET

**Sur Windows (PowerShell) :**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copiez le résultat** (64 caractères hexadécimaux) - vous en aurez besoin à l'étape 3.

---

### 📋 ÉTAPE 2 : Accéder aux Variables d'Environnement sur Vercel

1. Allez sur **[Vercel Dashboard](https://vercel.com/dashboard)**
2. Dans la liste des projets, **cliquez sur** `basket-stats-frontend-ny73`
3. Cliquez sur l'onglet **"Settings"** (en haut)
4. Dans le menu de gauche, cliquez sur **"Environment Variables"**

---

### 📋 ÉTAPE 3 : Ajouter les Variables (UNE PAR UNE)

Pour chaque variable, suivez ces étapes :

1. Cliquez sur **"Add New"**
2. Entrez le **Name** (nom de la variable)
3. Entrez la **Value** (valeur)
4. Cochez **"Production"** (et "Preview" si vous voulez)
5. Cliquez sur **"Save"**

#### 🔗 Variable 1 : NEXT_PUBLIC_API_URL

```
Name:  NEXT_PUBLIC_API_URL
Value: https://basketstatsbackend.onrender.com/api
```

✅ **Cochez** : Production, Preview, Development

---

#### 🔐 Variable 2 : NEXTAUTH_SECRET

```
Name:  NEXTAUTH_SECRET
Value: [COLLEZ ICI LE SECRET GÉNÉRÉ À L'ÉTAPE 1]
```

✅ **Cochez** : Production, Preview, Development

**Exemple** : `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

---

#### 🌐 Variable 3 : NEXTAUTH_URL

```
Name:  NEXTAUTH_URL
Value: https://basket-stats-frontend-ny73.vercel.app
```

✅ **Cochez** : Production, Preview, Development

---

#### 🔑 Variables Optionnelles : OAuth (si vous utilisez Google/Facebook)

Si vous avez configuré OAuth, ajoutez aussi :

```
Name:  GOOGLE_CLIENT_ID
Value: [votre-google-client-id]
```

```
Name:  GOOGLE_CLIENT_SECRET
Value: [votre-google-client-secret]
```

```
Name:  FACEBOOK_CLIENT_ID
Value: [votre-facebook-app-id]
```

```
Name:  FACEBOOK_CLIENT_SECRET
Value: [votre-facebook-app-secret]
```

---

### 📋 ÉTAPE 4 : Redéployer

Après avoir ajouté toutes les variables :

1. **Option A (Automatique)** : Vercel redéploiera automatiquement après quelques secondes
2. **Option B (Manuel)** :
   - Allez dans l'onglet **"Deployments"**
   - Cliquez sur les **3 points** (⋯) à côté du dernier déploiement
   - Cliquez sur **"Redeploy"**
   - Confirmez

---

## 🔍 VÉRIFICATION

### ✅ Test 1 : Vérifier que le Backend répond

Ouvrez votre navigateur et allez sur :
```
https://basketstatsbackend.onrender.com/api/health
```

Vous devriez voir :
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "basketstats-backend"
}
```

### ✅ Test 2 : Vérifier le Frontend

1. Attendez que le redéploiement Vercel soit terminé (2-3 minutes)
2. Allez sur : `https://basket-stats-frontend-ny73.vercel.app`
3. Ouvrez la console du navigateur (F12)
4. Essayez de vous connecter avec :
   - Email : `slovengama@gmail.com`
   - Mot de passe : `password123`

### ✅ Test 3 : Vérifier les Variables dans Vercel

1. Allez dans **Settings** → **Environment Variables**
2. Vérifiez que vous voyez bien :
   - ✅ `NEXT_PUBLIC_API_URL`
   - ✅ `NEXTAUTH_SECRET`
   - ✅ `NEXTAUTH_URL`

---

## 🚨 DÉPANNAGE

### Erreur : "NS_ERROR_NET_ERROR_RESPONSE"

**Cause** : `NEXT_PUBLIC_API_URL` n'est pas configuré ou incorrect

**Solution** :
1. Vérifiez que `NEXT_PUBLIC_API_URL=https://basketstatsbackend.onrender.com/api` est bien dans Vercel
2. Vérifiez qu'il n'y a **pas d'espace** avant/après la valeur
3. Redéployez après modification

---

### Erreur : "HTTP/2 500" sur `/api/auth/_log`

**Cause** : `NEXTAUTH_SECRET` manquant ou `NEXT_PUBLIC_API_URL` incorrect

**Solution** :
1. Vérifiez que `NEXTAUTH_SECRET` est bien configuré (64 caractères)
2. Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers le bon backend
3. Redéployez après modification

---

### Erreur : "Invalid credentials"

**Cause** : Le backend retourne une erreur

**Solution** :
1. Vérifiez les logs Render : https://dashboard.render.com
2. Vérifiez que le backend est bien démarré
3. Testez le login directement sur le backend avec curl/Postman

---

## 📝 RÉCAPITULATIF DES VARIABLES OBLIGATOIRES

| Variable | Valeur | Où la trouver |
|----------|--------|---------------|
| `NEXT_PUBLIC_API_URL` | `https://basketstatsbackend.onrender.com/api` | Backend Render |
| `NEXTAUTH_SECRET` | `[64 caractères hex]` | Généré à l'étape 1 |
| `NEXTAUTH_URL` | `https://basket-stats-frontend-ny73.vercel.app` | URL Vercel |

---

## ✅ Après Configuration

Une fois les variables configurées et le redéploiement terminé :

1. ✅ Le frontend pourra se connecter au backend
2. ✅ L'authentification fonctionnera
3. ✅ Les appels API fonctionneront
4. ✅ Plus d'erreurs `NS_ERROR_NET_ERROR_RESPONSE` ou `HTTP/2 500`

---

## 📞 Besoin d'aide ?

Si les erreurs persistent après avoir configuré les variables :

1. Vérifiez les logs Vercel : **Deployments** → **View Function Logs**
2. Vérifiez les logs Render : **Logs** dans le dashboard Render
3. Vérifiez que le backend répond : `https://basketstatsbackend.onrender.com/api/health`

