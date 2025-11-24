# 🚨 URGENT : Configuration Vercel - Les Variables d'Environnement Sont OBLIGATOIRES

## ⚠️ Problème Actuel

Les erreurs dans la console montrent :
- `GET /api/auth/session 500` - NextAuth ne fonctionne pas
- `POST /api/auth/_log 500` - NextAuth ne peut pas se connecter
- `GET http://localhost:3001/api/news/basketball` - Le frontend essaie d'utiliser localhost au lieu du backend Render

**Cause** : Les variables d'environnement ne sont **PAS configurées** sur Vercel.

---

## ✅ SOLUTION IMMÉDIATE

### ÉTAPE 1 : Aller sur Vercel Dashboard

1. Allez sur : **[https://vercel.com/dashboard](https://vercel.com/dashboard)**
2. Cliquez sur le projet : **`basket-stats-frontend-ny73`**
3. Cliquez sur **"Settings"** (en haut)
4. Cliquez sur **"Environment Variables"** (menu de gauche)

---

### ÉTAPE 2 : Ajouter les 3 Variables OBLIGATOIRES

Pour **chaque variable**, suivez ces étapes :

1. Cliquez sur **"Add New"**
2. Entrez le **Name** exactement comme indiqué
3. Entrez la **Value** exactement comme indiqué
4. **Cochez** : ✅ Production, ✅ Preview, ✅ Development
5. Cliquez sur **"Save"**

---

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
Value: 6789529257dbb393631a38677fda6c481be59b8b04c34ed224d4eb9ffd862f7f
```

✅ **Cochez** : Production, Preview, Development

**⚠️ IMPORTANT** : Copiez-collez exactement cette valeur (64 caractères hexadécimaux)

---

#### 🌐 Variable 3 : NEXTAUTH_URL

```
Name:  NEXTAUTH_URL
Value: https://basket-stats-frontend-ny73.vercel.app
```

✅ **Cochez** : Production, Preview, Development

---

### ÉTAPE 3 : Vérifier que les Variables sont Ajoutées

Après avoir ajouté les 3 variables, vous devriez voir dans la liste :

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://basketstatsbackend.onrender.com/api` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `6789529257dbb393631a38677fda6c481be59b8b04c34ed224d4eb9ffd862f7f` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://basket-stats-frontend-ny73.vercel.app` | Production, Preview, Development |

---

### ÉTAPE 4 : Redéployer

**Option A (Automatique)** :
- Vercel redéploiera automatiquement après quelques secondes
- Attendez 2-3 minutes

**Option B (Manuel)** :
1. Allez dans l'onglet **"Deployments"**
2. Cliquez sur les **3 points** (⋯) à côté du dernier déploiement
3. Cliquez sur **"Redeploy"**
4. Confirmez

---

## 🔍 Vérification

### ✅ Après le Redéploiement

1. Attendez que le déploiement soit terminé (statut "Ready")
2. Allez sur : `https://basket-stats-frontend-ny73.vercel.app`
3. Ouvrez la console (F12)
4. **Vérifiez** :
   - ✅ Plus d'erreur `localhost:3001`
   - ✅ Plus d'erreur `500` sur `/api/auth/session`
   - ✅ Les appels API utilisent `https://basketstatsbackend.onrender.com`

### ✅ Test de Connexion

1. Essayez de vous connecter avec :
   - Email : `slovengama@gmail.com`
   - Mot de passe : `password123`
2. **Si ça fonctionne** : ✅ Les variables sont bien configurées !
3. **Si ça ne fonctionne pas** : Vérifiez les logs Vercel

---

## 🚨 Si les Erreurs Persistent

### Vérifier les Logs Vercel

1. Allez dans **Deployments** → Cliquez sur le dernier déploiement
2. Cliquez sur **"View Function Logs"**
3. Cherchez les erreurs liées à :
   - `NEXT_PUBLIC_API_URL`
   - `NEXTAUTH_SECRET`

### Vérifier que les Variables sont Bien Configurées

1. Allez dans **Settings** → **Environment Variables**
2. Vérifiez que les 3 variables sont bien présentes
3. Vérifiez qu'il n'y a **pas d'espaces** avant/après les valeurs
4. Vérifiez que les environnements sont bien cochés

---

## 📝 Résumé

**Les 3 variables OBLIGATOIRES** :

1. ✅ `NEXT_PUBLIC_API_URL` = `https://basketstatsbackend.onrender.com/api`
2. ✅ `NEXTAUTH_SECRET` = `6789529257dbb393631a38677fda6c481be59b8b04c34ed224d4eb9ffd862f7f`
3. ✅ `NEXTAUTH_URL` = `https://basket-stats-frontend-ny73.vercel.app`

**Sans ces variables, l'application ne peut pas fonctionner en production !**

---

## ⚡ Action Immédiate Requise

**ALLEZ MAINTENANT sur Vercel et ajoutez ces 3 variables !**

Une fois ajoutées, le redéploiement se fera automatiquement et les erreurs disparaîtront.

