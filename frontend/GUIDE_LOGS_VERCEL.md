# 📊 Guide : Comment Voir les Erreurs dans les Logs Vercel

## 🎯 Objectif

Apprendre à consulter les logs Vercel pour diagnostiquer les erreurs de votre application Next.js.

---

## 📋 Étapes pour Accéder aux Logs

### Étape 1 : Accéder au Dashboard Vercel

1. Allez sur **[https://vercel.com/dashboard](https://vercel.com/dashboard)**
2. Connectez-vous avec votre compte
3. Sélectionnez votre projet : **`basket-stats-frontend-ny73`**

### Étape 2 : Accéder aux Deployments

1. Cliquez sur l'onglet **"Deployments"** (en haut de la page)
2. Vous verrez la liste de tous vos déploiements
3. Le dernier déploiement est en haut de la liste

### Étape 3 : Ouvrir les Logs d'un Déploiement

1. Cliquez sur le **dernier déploiement** (celui avec le statut "Ready" ou "Building")
2. Vous verrez plusieurs onglets :
   - **Overview** : Vue d'ensemble
   - **Functions** : Logs des fonctions serverless
   - **Logs** : Logs de runtime
   - **Source** : Code source déployé

### Étape 4 : Consulter les Logs

#### Option A : Logs de Runtime (Recommandé)

1. Cliquez sur l'onglet **"Logs"**
2. Vous verrez tous les logs en temps réel
3. Utilisez les filtres pour chercher :
   - **Status** : Filtrer par code HTTP (200, 500, etc.)
   - **Route** : Filtrer par route (`/api/auth/session`, etc.)
   - **Time** : Filtrer par période

#### Option B : Logs des Functions

1. Cliquez sur l'onglet **"Functions"**
2. Cliquez sur la fonction qui pose problème (ex: `/api/auth/[...nextauth]`)
3. Vous verrez les logs spécifiques à cette fonction

---

## 🔍 Ce qu'il faut Chercher

### Erreurs Communes

#### 1. Erreurs NextAuth
```
❌ [NextAuth] ...
🔍 [NextAuth] ...
```

#### 2. Erreurs de Variables d'Environnement
```
❌ MANQUANT
NEXTAUTH_SECRET
NEXT_PUBLIC_API_URL
```

#### 3. Erreurs de Build
```
Error: ...
Failed to compile
Module not found
```

#### 4. Erreurs Runtime
```
500 Internal Server Error
TypeError: ...
ReferenceError: ...
```

---

## 📸 Exemple de Navigation

```
Vercel Dashboard
  └── basket-stats-frontend-ny73
      └── Deployments
          └── [Dernier déploiement]
              ├── Overview
              ├── Functions ← Cliquez ici pour les fonctions
              ├── Logs ← Cliquez ici pour les logs runtime
              └── Source
```

---

## 🎨 Interface des Logs

Dans l'onglet **Logs**, vous verrez :

```
Time          Status  Host                              Request              Messages
12:07:33.44   500     basket-stats-frontend-ny73...    /api/auth/session    4
```

- **Time** : Heure de la requête
- **Status** : Code HTTP (200 = OK, 500 = Erreur)
- **Host** : Domaine
- **Request** : Route appelée
- **Messages** : Nombre de messages de log

### Cliquer sur une Ligne

Quand vous cliquez sur une ligne, vous verrez :
- Les détails de la requête
- Les messages de log complets
- Les stack traces d'erreur

---

## 🔎 Recherche dans les Logs

### Recherche par Texte

1. Utilisez la barre de recherche en haut
2. Tapez des mots-clés :
   - `NextAuth`
   - `error`
   - `500`
   - `NEXTAUTH_SECRET`

### Filtres Avancés

1. Cliquez sur **"Filters"** (filtres)
2. Sélectionnez :
   - **Status** : `500` pour voir seulement les erreurs
   - **Route** : `/api/auth/*` pour voir seulement NextAuth
   - **Time** : Dernière heure, dernière journée, etc.

---

## 📝 Exemple de Logs à Surveiller

### ✅ Logs Normaux (Tout va bien)
```
✅ [NextAuth] Initialisé avec succès
🔍 [NextAuth] GET request reçue
✅ [NextAuth] GET response status: 200
```

### ❌ Logs d'Erreur (Problème)
```
❌ [NextAuth] Erreur dans GET handler: ...
❌ [NextAuth] Stack: ...
❌ [NextAuth] NEXTAUTH_SECRET configuré: false
500 Internal Server Error
```

---

## 🚨 Actions après Avoir Vu les Logs

### Si vous voyez "NEXTAUTH_SECRET configuré: false"

1. Allez dans **Settings** → **Environment Variables**
2. Vérifiez que `NEXTAUTH_SECRET` existe
3. Si elle n'existe pas, ajoutez-la
4. Redéployez

### Si vous voyez une Stack Trace

1. Copiez l'erreur complète
2. Cherchez l'erreur sur Google ou dans la documentation
3. Corrigez le code selon l'erreur
4. Redéployez

### Si vous voyez "Module not found"

1. Vérifiez que toutes les dépendances sont dans `package.json`
2. Vérifiez que `npm install` a bien fonctionné
3. Redéployez

---

## 💡 Astuces

1. **Mode Live** : Activez le mode "Live" pour voir les logs en temps réel
2. **Export** : Vous pouvez exporter les logs pour les analyser
3. **Notifications** : Configurez des alertes pour les erreurs critiques
4. **Historique** : Les logs sont conservés pendant plusieurs jours

---

## 🆘 Si vous ne Trouvez pas les Logs

1. Vérifiez que vous êtes sur le bon projet
2. Vérifiez que le déploiement est terminé (statut "Ready")
3. Essayez de rafraîchir la page
4. Vérifiez que vous avez les permissions nécessaires

---

## 📞 Support

Si vous ne trouvez toujours pas les logs ou si vous avez besoin d'aide :
- Documentation Vercel : https://vercel.com/docs/monitoring/logs
- Support Vercel : https://vercel.com/support

