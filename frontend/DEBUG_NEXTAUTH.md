# 🔍 Guide de Debug NextAuth - Erreur HTTP 500

## 📋 Étapes pour Diagnostiquer le Problème

### 1. Vérifier les Logs Vercel

#### Accéder aux Logs :
1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet : **`basket-stats-frontend-ny73`**
3. Cliquez sur **"Deployments"** (en haut)
4. Cliquez sur le **dernier déploiement**
5. Cliquez sur **"Functions"** ou **"Logs"** (onglet en haut)

#### Ce qu'il faut chercher dans les logs :
- `❌ [NextAuth]` - Erreurs NextAuth
- `🔍 [NextAuth]` - Logs de diagnostic
- `NEXTAUTH_SECRET` - Vérifier si configuré
- `NEXT_PUBLIC_API_URL` - Vérifier si configuré
- Stack traces d'erreurs

### 2. Vérifier les Variables d'Environnement sur Vercel

1. Allez sur **Settings** → **Environment Variables**
2. Vérifiez que ces variables existent :

#### Variables OBLIGATOIRES :
```
NEXTAUTH_SECRET=<64 caractères hexadécimaux>
NEXTAUTH_URL=https://basket-stats-frontend-ny73.vercel.app
NEXT_PUBLIC_API_URL=https://basketstatsbackend.onrender.com/api
```

#### Comment générer NEXTAUTH_SECRET :
```powershell
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Tester la Connexion au Backend

Vérifiez que le backend est accessible depuis Vercel :

```bash
# Depuis votre machine locale
curl https://basketstatsbackend.onrender.com/api/health
```

Si ça ne répond pas, le backend est peut-être en veille (Render met les apps en veille après inactivité).

### 4. Tester l'Endpoint NextAuth Directement

Essayez d'accéder directement à :
- `https://basket-stats-frontend-ny73.vercel.app/api/auth/session`
- `https://basket-stats-frontend-ny73.vercel.app/api/auth/providers`

Ces endpoints devraient retourner du JSON, pas une erreur 500.

### 5. Vérifier les Erreurs dans la Console du Navigateur

1. Ouvrez Chrome DevTools (F12)
2. Allez dans l'onglet **Console**
3. Cherchez les erreurs :
   - `Failed to load resource: the server responded with a status of 500`
   - `JSON.parse: unexpected end of data`
   - `Unexpected end of JSON input`

### 6. Tester avec un Compte de Test

Essayez de vous connecter avec :
- Email : un email valide dans votre base de données
- Mot de passe : le mot de passe correspondant

### 7. Vérifier que le Backend Répond Correctement

Testez l'endpoint de login du backend :

```bash
curl -X POST https://basketstatsbackend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🔧 Solutions Possibles

### Solution 1 : NEXTAUTH_SECRET Manquant
**Symptôme** : Erreur 500 sur `/api/auth/session`

**Solution** :
1. Générez un nouveau secret (voir ci-dessus)
2. Ajoutez-le sur Vercel dans Environment Variables
3. Redéployez

### Solution 2 : Backend Inaccessible
**Symptôme** : Erreur lors de la connexion, timeout

**Solution** :
1. Vérifiez que le backend Render est actif
2. Réveillez-le en faisant une requête
3. Vérifiez `NEXT_PUBLIC_API_URL` sur Vercel

### Solution 3 : Erreur dans le Code NextAuth
**Symptôme** : Stack trace dans les logs Vercel

**Solution** :
1. Vérifiez les logs Vercel pour l'erreur exacte
2. Corrigez le code selon l'erreur
3. Redéployez

## 📝 Logs à Surveiller

Après le déploiement, les logs devraient montrer :

```
🔍 [NextAuth] Initialisation...
🔍 [NextAuth] NEXTAUTH_SECRET: ✅ Configuré
🔍 [NextAuth] NEXTAUTH_URL: https://basket-stats-frontend-ny73.vercel.app
🔍 [NextAuth] NEXT_PUBLIC_API_URL: https://basketstatsbackend.onrender.com/api
✅ [NextAuth] Initialisé avec succès
🔍 [NextAuth] GET request reçue
✅ [NextAuth] GET response status: 200
```

Si vous voyez `❌ MANQUANT` ou des erreurs, c'est là que se trouve le problème.

## 🚨 Si Rien ne Fonctionne

1. **Vérifiez les logs Vercel** - C'est la source la plus fiable d'information
2. **Testez localement** - Si ça marche en local mais pas en production, c'est un problème de configuration Vercel
3. **Vérifiez la version NextAuth** - NextAuth v5 beta peut avoir des bugs
4. **Contactez le support** - Si le problème persiste, partagez les logs Vercel

