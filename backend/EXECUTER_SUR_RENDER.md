# 🚀 Exécuter le Script de Réinitialisation sur Render

## ⚠️ Problème

Le script a été exécuté en **local**, donc il a modifié la base de données **locale**, pas celle de **production** sur Render.

## ✅ Solution : Exécuter sur Render

### Méthode 1 : Via Render Shell (Recommandé)

1. **Accéder au Shell Render**
   - Allez sur [Render Dashboard](https://dashboard.render.com)
   - Sélectionnez votre service : **`basketstats-backend`**
   - Cliquez sur **"Shell"** (dans le menu de gauche)

2. **Dans le Shell Render, exécutez :**
   ```bash
   cd backend
   npm run reset-passwords
   ```

3. **Attendre le résultat**
   - Le script va lister tous les utilisateurs
   - Mettre à jour tous leurs mots de passe à `password`
   - Afficher un résumé

---

### Méthode 2 : Via SQL Direct (Alternative)

Si le shell ne fonctionne pas, vous pouvez exécuter directement du SQL :

1. **Accéder à la base de données**
   - Render Dashboard → votre base de données `basketstats-db`
   - Cliquez sur **"Connect"** ou **"Info"**
   - Copiez la **Internal Database URL**

2. **Se connecter avec psql ou un client SQL**
   ```bash
   psql <votre-internal-database-url>
   ```

3. **Exécuter cette requête SQL :**
   ```sql
   -- Hasher le mot de passe "password" avec bcrypt
   -- Note: Vous devez générer le hash bcrypt d'abord
   UPDATE users 
   SET password_hash = '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
   WHERE password_hash IS NOT NULL;
   ```

⚠️ **Attention** : Cette méthode nécessite de générer le hash bcrypt manuellement.

---

## 🔧 Méthode 3 : Créer un Endpoint API Temporaire

Je peux créer un endpoint API temporaire que vous pouvez appeler pour réinitialiser les mots de passe. Voulez-vous que je le fasse ?

---

## 📋 Résumé

**Pour que ça fonctionne en production :**
1. ✅ Le script doit être exécuté sur **Render** (pas en local)
2. ✅ Il doit utiliser la **DATABASE_URL de production** (celle de Render)
3. ✅ Après exécution, les utilisateurs pourront se connecter avec `password`

**Le redéploiement n'est PAS nécessaire** - le script modifie directement la base de données.

