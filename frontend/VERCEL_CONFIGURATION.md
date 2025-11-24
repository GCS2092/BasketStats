# Configuration Vercel - Variables d'Environnement

## ⚠️ Problème Actuel

Les erreurs suivantes apparaissent :
- `GET /api/auth/error` - NS_ERROR_NET_ERROR_RESPONSE
- `POST /api/auth/_log` - HTTP/2 500

Cela indique que le frontend ne peut pas se connecter au backend.

## ✅ Solution : Configurer les Variables d'Environnement dans Vercel

### 1. Accéder aux Variables d'Environnement

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `basket-stats-frontend-ny73`
3. Cliquez sur **"Settings"**
4. Cliquez sur **"Environment Variables"**

### 2. Variables Requises

Ajoutez ou modifiez les variables suivantes :

#### 🔗 URL du Backend (OBLIGATOIRE)
```
NEXT_PUBLIC_API_URL=https://basketstatsbackend.onrender.com/api
```

#### 🔐 NextAuth (OBLIGATOIRE)
```
NEXTAUTH_SECRET=<générez-un-secret-fort-64-caractères>
NEXTAUTH_URL=https://basket-stats-frontend-ny73.vercel.app
```

#### 🔑 OAuth (Optionnel - si vous utilisez Google/Facebook)
```
GOOGLE_CLIENT_ID=<votre-google-client-id>
GOOGLE_CLIENT_SECRET=<votre-google-client-secret>
FACEBOOK_CLIENT_ID=<votre-facebook-app-id>
FACEBOOK_CLIENT_SECRET=<votre-facebook-app-secret>
```

### 3. Générer NEXTAUTH_SECRET

Si vous n'avez pas de `NEXTAUTH_SECRET`, générez-en un :

**Sur Windows (PowerShell) :**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Sur Linux/Mac :**
```bash
openssl rand -hex 32
```

### 4. Redéployer

Après avoir ajouté/modifié les variables :
1. Cliquez sur **"Save"**
2. Vercel redéploiera automatiquement votre application
3. OU allez dans **"Deployments"** et cliquez sur **"Redeploy"**

## 🔍 Vérification

### Test de l'URL du Backend

Vérifiez que l'URL du backend est correcte :
```bash
curl https://basketstatsbackend.onrender.com/api/health
```

Devrait retourner :
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "basketstats-backend"
}
```

### Test de la Connexion Frontend → Backend

Une fois les variables configurées, testez la connexion depuis le frontend :
1. Ouvrez la console du navigateur (F12)
2. Allez sur votre site Vercel
3. Essayez de vous connecter
4. Vérifiez les erreurs dans la console

## 📝 Liste Complète des Variables

### Production (Vercel)
```
NEXT_PUBLIC_API_URL=https://basketstatsbackend.onrender.com/api
NEXTAUTH_SECRET=<votre-secret-64-caractères>
NEXTAUTH_URL=https://basket-stats-frontend-ny73.vercel.app
GOOGLE_CLIENT_ID=<optionnel>
GOOGLE_CLIENT_SECRET=<optionnel>
FACEBOOK_CLIENT_ID=<optionnel>
FACEBOOK_CLIENT_SECRET=<optionnel>
```

### Développement Local
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_SECRET=<votre-secret-local>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<optionnel>
GOOGLE_CLIENT_SECRET=<optionnel>
FACEBOOK_CLIENT_ID=<optionnel>
FACEBOOK_CLIENT_SECRET=<optionnel>
```

## 🚨 Erreurs Courantes

### Erreur : "NS_ERROR_NET_ERROR_RESPONSE"
- **Cause** : `NEXT_PUBLIC_API_URL` n'est pas configuré ou incorrect
- **Solution** : Vérifiez que `NEXT_PUBLIC_API_URL=https://basketstatsbackend.onrender.com/api` est bien configuré

### Erreur : "HTTP/2 500" sur `/api/auth/_log`
- **Cause** : NextAuth ne peut pas se connecter au backend
- **Solution** : Vérifiez `NEXT_PUBLIC_API_URL` et `NEXTAUTH_SECRET`

### Erreur : "Invalid credentials"
- **Cause** : Le backend retourne une erreur
- **Solution** : Vérifiez les logs Render pour voir l'erreur exacte

## ✅ Après Configuration

Une fois les variables configurées et le redéploiement terminé :
1. ✅ Le frontend pourra se connecter au backend
2. ✅ L'authentification fonctionnera
3. ✅ Les appels API fonctionneront

