# 🔧 Fix: Erreur HTTP 500 NextAuth - Guide de Résolution

## ❌ Problème

L'endpoint `/api/auth/session` retourne une erreur **HTTP 500** avec le message :
```
JSON.parse: unexpected end of data at line 1 column 1 of the JSON data
```

## 🔍 Causes Probables

1. **NEXTAUTH_SECRET manquant ou invalide** sur Vercel
2. **NEXTAUTH_URL non configuré** correctement
3. **NEXT_PUBLIC_API_URL manquant** ou incorrect
4. Erreur dans la configuration NextAuth qui cause un crash

## ✅ Solution : Vérifier les Variables d'Environnement sur Vercel

### Étape 1 : Accéder aux Variables d'Environnement

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet : **`basket-stats-frontend-ny73`**
3. Cliquez sur **"Settings"** (en haut)
4. Cliquez sur **"Environment Variables"** (menu de gauche)

### Étape 2 : Vérifier les Variables OBLIGATOIRES

Assurez-vous que ces 3 variables sont **présentes et correctes** :

#### 🔐 Variable 1 : NEXTAUTH_SECRET (OBLIGATOIRE)

```
Name:  NEXTAUTH_SECRET
Value: [Un secret de 64 caractères hexadécimaux]
```

**⚠️ IMPORTANT** : Cette variable est **OBLIGATOIRE** en production. Sans elle, NextAuth ne peut pas fonctionner.

**Pour générer un nouveau secret :**
```powershell
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Vérifiez que :**
- ✅ La variable existe
- ✅ Elle a une valeur (64 caractères hexadécimaux)
- ✅ Elle est cochée pour **Production**, **Preview**, et **Development**

#### 🌐 Variable 2 : NEXTAUTH_URL (OBLIGATOIRE)

```
Name:  NEXTAUTH_URL
Value: https://basket-stats-frontend-ny73.vercel.app
```

**Vérifiez que :**
- ✅ La variable existe
- ✅ La valeur correspond exactement à l'URL de votre déploiement Vercel
- ✅ Elle est cochée pour **Production**, **Preview**, et **Development**

#### 🔗 Variable 3 : NEXT_PUBLIC_API_URL (OBLIGATOIRE)

```
Name:  NEXT_PUBLIC_API_URL
Value: https://basketstatsbackend.onrender.com/api
```

**Vérifiez que :**
- ✅ La variable existe
- ✅ La valeur pointe vers votre backend Render
- ✅ Elle est cochée pour **Production**, **Preview**, et **Development**

### Étape 3 : Redéployer après Modification

**IMPORTANT** : Après avoir ajouté ou modifié des variables d'environnement :

1. Allez dans l'onglet **"Deployments"**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Cliquez sur **"Redeploy"**
4. Attendez que le déploiement se termine

**OU** faites un nouveau commit et push vers GitHub (Vercel redéploiera automatiquement)

## 🔍 Vérification dans les Logs Vercel

Pour voir les erreurs détaillées :

1. Allez dans **"Deployments"**
2. Cliquez sur le dernier déploiement
3. Cliquez sur **"Functions"** ou **"Logs"**
4. Cherchez les erreurs contenant :
   - `❌ [NextAuth]`
   - `NEXTAUTH_SECRET configuré: false`
   - `NEXTAUTH_URL configuré: false`

## 🛠️ Corrections Apportées dans le Code

J'ai ajouté :

1. **Gestion d'erreur robuste** dans le route handler NextAuth
2. **Validation de NEXTAUTH_SECRET** en production
3. **Logs détaillés** pour diagnostiquer les problèmes
4. **Réponses JSON valides** même en cas d'erreur (évite les réponses vides)

## 📋 Checklist de Vérification

Avant de tester à nouveau, vérifiez :

- [ ] `NEXTAUTH_SECRET` existe et a une valeur valide (64 caractères)
- [ ] `NEXTAUTH_URL` existe et correspond à l'URL Vercel
- [ ] `NEXT_PUBLIC_API_URL` existe et pointe vers le backend
- [ ] Toutes les variables sont cochées pour **Production**
- [ ] Un **redéploiement** a été effectué après les modifications
- [ ] Les logs Vercel ne montrent plus d'erreurs `NEXTAUTH_SECRET configuré: false`

## 🚨 Si le Problème Persiste

Si après avoir vérifié toutes les variables, l'erreur persiste :

1. **Vérifiez les logs Vercel** pour voir l'erreur exacte
2. **Testez localement** avec les mêmes variables d'environnement
3. **Vérifiez que le backend** est accessible depuis Vercel
4. **Vérifiez les CORS** si le backend bloque les requêtes

## 📝 Notes

- Les modifications de code ont été poussées sur GitHub
- Le route handler NextAuth gère maintenant les erreurs correctement
- Les réponses seront toujours en JSON valide, même en cas d'erreur
- Les logs détaillés aideront à diagnostiquer les problèmes futurs

