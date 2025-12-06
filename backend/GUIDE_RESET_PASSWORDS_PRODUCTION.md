# 🔐 Guide Rapide : Réinitialiser les Mots de Passe en Production

## ⚠️ Problème

Le script a été exécuté en **local**, donc il a modifié la base de données **locale**, pas celle de **production** sur Render.

## ✅ Solution : Exécuter sur Render

### Option 1 : Via Render Shell (Le Plus Simple)

1. **Allez sur [Render Dashboard](https://dashboard.render.com)**
2. **Sélectionnez** : `basketstats-backend`
3. **Cliquez sur "Shell"** (menu de gauche)
4. **Dans le shell, tapez :**
   ```bash
   cd backend
   npm run reset-passwords
   ```

5. **Résultat attendu :**
   ```
   🔐 Réinitialisation de tous les mots de passe...
   ✅ Mot de passe hashé généré
   📊 Nombre d'utilisateurs trouvés: X
   👥 Liste des utilisateurs:
   ...
   ✅ X utilisateur(s) mis à jour avec succès
   🔑 Tous les mots de passe ont été réinitialisés à: password
   ```

---

### Option 2 : Via SQL Direct (Si le shell ne fonctionne pas)

1. **Allez sur Render Dashboard** → votre base de données `basketstats-db`
2. **Cliquez sur "Connect"** ou **"Info"**
3. **Copiez la Internal Database URL**
4. **Connectez-vous avec psql** (ou un client SQL) :
   ```bash
   psql <votre-internal-database-url>
   ```

5. **Exécutez cette commande SQL :**
   ```sql
   UPDATE users 
   SET password_hash = '$2b$10$hFlR6iEW0tGpPXeUiqp3.u.G9SDglneBasNqOh.uy6zQ3s0oMVMKe'
   WHERE password_hash IS NOT NULL;
   ```

6. **Vérifiez le résultat :**
   ```sql
   SELECT email, full_name, role FROM users;
   ```

---

## 🎯 Après l'Exécution

Une fois le script exécuté sur Render :

1. ✅ Tous les utilisateurs auront le mot de passe : `password`
2. ✅ Vous pourrez vous connecter avec n'importe quel email + `password`
3. ⚠️ **Changez les mots de passe après connexion !**

---

## ❓ Le Redéploiement est-il Nécessaire ?

**NON** ❌ - Le script modifie directement la base de données, pas le code. Aucun redéploiement nécessaire.

---

## 🧪 Tester

1. Allez sur : `https://basket-stats-frontend-ny73.vercel.app/auth/login`
2. Utilisez n'importe quel email de vos utilisateurs
3. Mot de passe : `password`

---

## 📝 Liste des Utilisateurs (de la base locale)

D'après l'exécution locale, vous devriez avoir ces utilisateurs en production aussi :
- stemk2151@gmail.com
- slovengama@gmail.com
- coeurson.gama@esmt.sn
- test.player1@basketstats.com
- test.player3@basketstats.com
- test.player4@basketstats.com
- test.player5@basketstats.com

