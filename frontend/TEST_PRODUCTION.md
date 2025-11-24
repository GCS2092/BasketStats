# ✅ Test de la Configuration Production

## 🎯 Objectif

Vérifier que le frontend Vercel peut se connecter au backend Render et que l'authentification fonctionne.

---

## 📋 ÉTAPE 1 : Vérifier les Variables d'Environnement sur Vercel

### ⚠️ IMPORTANT : Les variables doivent être configurées AVANT de tester

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez le projet `basket-stats-frontend-ny73`
3. Allez dans **Settings** → **Environment Variables**
4. Vérifiez que vous avez **AU MOINS** ces 3 variables :

| Variable | Valeur attendue |
|----------|----------------|
| `NEXT_PUBLIC_API_URL` | `https://basketstatsbackend.onrender.com/api` |
| `NEXTAUTH_SECRET` | `6789529257dbb393631a38677fda6c481be59b8b04c34ed224d4eb9ffd862f7f` (ou un autre secret de 64 caractères) |
| `NEXTAUTH_URL` | `https://basket-stats-frontend-ny73.vercel.app` |

### ❌ Si les variables ne sont PAS configurées :

Suivez le guide : `VERCEL_SETUP_GUIDE.md`

---

## 📋 ÉTAPE 2 : Vérifier que le Backend répond

### Test 1 : Health Check

Ouvrez votre navigateur et allez sur :
```
https://basketstatsbackend.onrender.com/api/health
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T...",
  "service": "basketstats-backend"
}
```

✅ **Si vous voyez ce JSON** : Le backend fonctionne correctement

❌ **Si vous voyez une erreur** : Vérifiez les logs Render

---

## 📋 ÉTAPE 3 : Tester le Frontend

### Test 1 : Accéder au site

1. Allez sur : `https://basket-stats-frontend-ny73.vercel.app`
2. La page devrait se charger sans erreur

### Test 2 : Ouvrir la Console du Navigateur

1. Appuyez sur **F12** (ou Clic droit → Inspecter)
2. Allez dans l'onglet **Console**
3. Vérifiez qu'il n'y a **PAS** d'erreurs rouges

### Test 3 : Tester la Connexion

1. Allez sur la page de connexion
2. Entrez les identifiants :
   - **Email** : `slovengama@gmail.com`
   - **Mot de passe** : `password123`
3. Cliquez sur **Se connecter**

### ✅ Résultats Attendus

**Si tout fonctionne** :
- ✅ La connexion réussit
- ✅ Vous êtes redirigé vers le dashboard
- ✅ Aucune erreur dans la console
- ✅ Aucune erreur `NS_ERROR_NET_ERROR_RESPONSE`
- ✅ Aucune erreur `HTTP/2 500`

**Si ça ne fonctionne PAS** :
- ❌ Erreur `NS_ERROR_NET_ERROR_RESPONSE` → `NEXT_PUBLIC_API_URL` n'est pas configuré
- ❌ Erreur `HTTP/2 500` → `NEXTAUTH_SECRET` manquant ou incorrect
- ❌ Erreur "Invalid credentials" → Vérifiez les logs Render

---

## 📋 ÉTAPE 4 : Vérifier les Logs

### Logs Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez `basket-stats-frontend-ny73`
3. Allez dans **Deployments** → Cliquez sur le dernier déploiement
4. Cliquez sur **View Function Logs**

**Cherchez** :
- ✅ Pas d'erreurs liées à `NEXT_PUBLIC_API_URL`
- ✅ Pas d'erreurs liées à `NEXTAUTH_SECRET`

### Logs Render

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Sélectionnez `basketstatsbackend`
3. Allez dans **Logs**

**Cherchez** :
- ✅ Pas d'erreurs CORS
- ✅ Les requêtes `/api/auth/login` arrivent bien

---

## 🚨 DÉPANNAGE

### Problème : Erreur `NS_ERROR_NET_ERROR_RESPONSE`

**Cause** : `NEXT_PUBLIC_API_URL` n'est pas configuré sur Vercel

**Solution** :
1. Allez dans Vercel → Settings → Environment Variables
2. Ajoutez `NEXT_PUBLIC_API_URL` avec la valeur `https://basketstatsbackend.onrender.com/api`
3. Redéployez

---

### Problème : Erreur `HTTP/2 500` sur `/api/auth/_log`

**Cause** : `NEXTAUTH_SECRET` manquant ou `NEXT_PUBLIC_API_URL` incorrect

**Solution** :
1. Vérifiez que `NEXTAUTH_SECRET` est configuré (64 caractères)
2. Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers le bon backend
3. Redéployez

---

### Problème : "Invalid credentials" mais le mot de passe est correct

**Cause** : Le backend retourne une erreur

**Solution** :
1. Vérifiez les logs Render
2. Vérifiez que le compte existe dans la base de données
3. Testez directement le backend avec curl/Postman

---

## ✅ Checklist de Vérification

Avant de considérer que tout fonctionne, vérifiez :

- [ ] Les 3 variables d'environnement sont configurées sur Vercel
- [ ] Le backend répond à `/api/health`
- [ ] Le frontend se charge sans erreur
- [ ] La console du navigateur ne montre pas d'erreurs
- [ ] La connexion fonctionne avec `slovengama@gmail.com` / `password123`
- [ ] Aucune erreur `NS_ERROR_NET_ERROR_RESPONSE`
- [ ] Aucune erreur `HTTP/2 500`

---

## 📞 Si les Problèmes Persistent

1. **Vérifiez les variables** : Settings → Environment Variables sur Vercel
2. **Vérifiez les logs** : Deployments → View Function Logs sur Vercel
3. **Vérifiez le backend** : Logs sur Render
4. **Testez le backend directement** : `https://basketstatsbackend.onrender.com/api/health`

---

## 🎉 Si Tout Fonctionne

Félicitations ! Votre application est maintenant déployée et fonctionnelle :

- ✅ Frontend : `https://basket-stats-frontend-ny73.vercel.app`
- ✅ Backend : `https://basketstatsbackend.onrender.com`
- ✅ Authentification : Fonctionnelle
- ✅ API : Accessible

