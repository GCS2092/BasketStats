# 🔐 Guide : Réinitialiser Tous les Mots de Passe

## 📋 Objectif

Réinitialiser tous les mots de passe des utilisateurs à `password` dans la base de données.

## ⚠️ ATTENTION

Ce script va **modifier tous les mots de passe** de tous les utilisateurs. Utilisez-le uniquement en développement ou si vous avez vraiment oublié tous les mots de passe.

---

## 🖥️ Option 1 : Exécuter en Local (Recommandé)

### Prérequis

1. Avoir accès à la base de données (local ou distant)
2. Avoir le fichier `.env` configuré avec `DATABASE_URL`

### Étapes

1. **Ouvrir un terminal dans le dossier backend**
   ```bash
   cd backend
   ```

2. **Vérifier que vous êtes connecté à la bonne base de données**
   ```bash
   # Vérifier la DATABASE_URL dans .env
   # Assurez-vous que c'est la bonne base de données !
   ```

3. **Exécuter le script**
   ```bash
   npm run reset-passwords
   ```

4. **Vérifier le résultat**
   Le script va :
   - Afficher tous les utilisateurs trouvés
   - Mettre à jour tous leurs mots de passe à `password`
   - Afficher un résumé

### Exemple de Sortie

```
🔐 Réinitialisation de tous les mots de passe...

✅ Mot de passe hashé généré

📊 Nombre d'utilisateurs trouvés: 5

👥 Liste des utilisateurs:
  1. user1@example.com (User One) - PLAYER
  2. user2@example.com (User Two) - RECRUITER
  3. admin@example.com (Admin User) - ADMIN
  4. player@example.com (Player Name) - PLAYER
  5. recruiter@example.com (Recruiter Name) - RECRUITER

🔄 Mise à jour des mots de passe...
✅ 5 utilisateur(s) mis à jour avec succès

🔑 Tous les mots de passe ont été réinitialisés à: password
⚠️  IMPORTANT: Changez ces mots de passe en production !
```

---

## 🌐 Option 2 : Exécuter sur Render (Production)

### Méthode A : Via Render Shell

1. **Accéder au Shell Render**
   - Allez sur [Render Dashboard](https://dashboard.render.com)
   - Sélectionnez votre service `basketstats-backend`
   - Cliquez sur **"Shell"** (dans le menu de gauche)

2. **Naviguer vers le dossier backend**
   ```bash
   cd backend
   ```

3. **Exécuter le script**
   ```bash
   npm run reset-passwords
   ```

### Méthode B : Via SSH (si configuré)

Si vous avez accès SSH à Render :
```bash
ssh render@votre-service.onrender.com
cd backend
npm run reset-passwords
```

---

## 🔍 Vérifier les Utilisateurs Avant

Si vous voulez juste voir les utilisateurs sans modifier les mots de passe, vous pouvez utiliser Prisma Studio :

```bash
cd backend
npm run prisma:studio
```

Puis allez sur `http://localhost:5555` et consultez la table `User`.

---

## ✅ Après la Réinitialisation

### Tester la Connexion

1. Allez sur votre frontend : `https://basket-stats-frontend-ny73.vercel.app/auth/login`
2. Connectez-vous avec :
   - **Email** : n'importe quel email d'utilisateur de la liste
   - **Mot de passe** : `password`

### Changer les Mots de Passe

⚠️ **IMPORTANT** : Une fois que vous vous êtes connecté, changez immédiatement votre mot de passe via l'interface de l'application.

---

## 🛠️ Dépannage

### Erreur : "Cannot find module '@prisma/client'"

```bash
cd backend
npm install
npx prisma generate
```

### Erreur : "Connection to database failed"

Vérifiez que `DATABASE_URL` est correct dans votre `.env` :
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### Erreur : "Permission denied"

Assurez-vous d'avoir les permissions d'écriture sur la base de données.

---

## 📝 Notes

- Le script hash le mot de passe avec bcrypt (10 rounds)
- Tous les utilisateurs auront le même mot de passe : `password`
- Le script affiche la liste des utilisateurs avant de modifier
- Le script vérifie que les mots de passe ont bien été mis à jour

---

## 🔒 Sécurité

⚠️ **NE JAMAIS utiliser ce script en production sans protection !**

Si vous devez l'utiliser en production :
1. Faites une sauvegarde de la base de données avant
2. Changez immédiatement tous les mots de passe après
3. Forcez les utilisateurs à changer leur mot de passe à la prochaine connexion

