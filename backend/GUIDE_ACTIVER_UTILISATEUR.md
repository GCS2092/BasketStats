# 🚀 Guide : Activer un Utilisateur et Lui Donner l'Abonnement PROFESSIONAL

## 📋 Description

Ce script permet d'activer un utilisateur (vérifié et actif) et de lui attribuer automatiquement l'abonnement **PROFESSIONAL** (le plus élevé).

## 🎯 Fonctionnalités

- ✅ Active l'utilisateur (`verified: true`, `active: true`)
- ✅ Désactive les anciens abonnements
- ✅ Crée un nouvel abonnement PROFESSIONAL avec statut ACTIVE
- ✅ Définit une date de fin (1 an à partir de maintenant)
- ✅ Affiche un résumé complet des modifications

---

## 🖥️ Utilisation Locale

### 1. Lister tous les utilisateurs

```bash
cd backend
npm run activate-user
```

**Résultat :**
```
📋 Liste de tous les utilisateurs:

  1. stemk2151@gmail.com (Nom Complet) - PLAYER - ✅ Actif
  2. slovengama@gmail.com (Nom Complet) - COACH - ❌ Inactif
  ...

💡 Usage: npm run activate-user <email>
   Exemple: npm run activate-user stemk2151@gmail.com
```

### 2. Activer un utilisateur spécifique

```bash
npm run activate-user stemk2151@gmail.com
```

**Résultat :**
```
🚀 Activation utilisateur et attribution abonnement PROFESSIONAL...

🔍 Recherche de l'utilisateur: stemk2151@gmail.com...

✅ Utilisateur trouvé: Nom Complet (stemk2151@gmail.com)
   Rôle: PLAYER
   Statut actuel: ❌ Non vérifié | ✅ Actif

🔍 Recherche du plan PROFESSIONAL...
✅ Plan trouvé: Professionnel (PROFESSIONAL)
   Prix: 1000 FCFA
   Durée: 30 jours

🔄 Mise à jour de l'utilisateur et création de l'abonnement...

✅ Anciens abonnements désactivés
✅ Utilisateur activé (verified: true, active: true)
✅ Abonnement PROFESSIONAL créé avec succès

📊 Résumé des modifications:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Utilisateur: Nom Complet (stemk2151@gmail.com)
   ✅ Vérifié: Oui
   ✅ Actif: Oui
📦 Abonnement: Professionnel (PROFESSIONAL)
   ✅ Statut: ACTIVE
   📅 Date de début: 03/12/2024
   📅 Date de fin: 03/12/2025
   💰 Prix: 1000 FCFA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Utilisateur activé et abonnement PROFESSIONAL attribué avec succès !
```

---

## 🌐 Utilisation sur Render (Production)

### Option 1 : Via Render Shell (Recommandé)

1. **Allez sur [Render Dashboard](https://dashboard.render.com)**
2. **Sélectionnez** : `basketstats-backend`
3. **Cliquez sur "Shell"** (menu de gauche)
4. **Dans le shell, tapez :**

   ```bash
   cd backend
   npm run activate-user
   ```

   Pour voir la liste des utilisateurs, ou :

   ```bash
   npm run activate-user stemk2151@gmail.com
   ```

   Pour activer un utilisateur spécifique.

5. **Attendez le résultat** — le script va :
   - Trouver l'utilisateur
   - L'activer
   - Désactiver ses anciens abonnements
   - Créer un nouvel abonnement PROFESSIONAL
   - Afficher un résumé complet

---

## ⚠️ Notes Importantes

1. **Le plan PROFESSIONAL doit exister** dans la base de données
   - Si le plan n'existe pas, exécutez d'abord : `npm run prisma:seed`
   - Ou initialisez les plans via le script `initialize-plans.js`

2. **Les anciens abonnements sont désactivés** (statut changé en `EXPIRED`)
   - L'utilisateur ne peut avoir qu'un seul abonnement actif à la fois

3. **La date de fin est fixée à 1 an** à partir de la date d'activation
   - Vous pouvez modifier cette durée dans le script si nécessaire

4. **Aucun redéploiement nécessaire** — le script modifie directement la base de données

---

## 🔍 Vérification

Après l'exécution, vous pouvez vérifier :

1. **Dans l'application** : L'utilisateur devrait avoir accès à toutes les fonctionnalités PROFESSIONAL
2. **Dans la base de données** :
   ```sql
   SELECT u.email, u.verified, u.active, s.status, sp.name, sp.type
   FROM users u
   LEFT JOIN subscriptions s ON s.user_id = u.id
   LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
   WHERE u.email = 'stemk2151@gmail.com';
   ```

---

## 🐛 Dépannage

### Erreur : "Plan PROFESSIONAL non trouvé"

**Solution :** Initialisez les plans d'abonnement :
```bash
npm run prisma:seed
```

### Erreur : "Utilisateur non trouvé"

**Solution :** Vérifiez l'email exact (sensible à la casse) :
```bash
npm run activate-user  # Pour voir la liste complète
```

---

## 📝 Exemple Complet

```bash
# 1. Lister tous les utilisateurs
npm run activate-user

# 2. Activer un utilisateur spécifique
npm run activate-user stemk2151@gmail.com

# 3. Vérifier le résultat
# L'utilisateur devrait maintenant avoir :
# - verified: true
# - active: true
# - Un abonnement PROFESSIONAL ACTIVE
```

---

## ✅ Checklist

- [ ] Le plan PROFESSIONAL existe dans la base de données
- [ ] L'email de l'utilisateur est correct
- [ ] Le script s'exécute sans erreur
- [ ] L'utilisateur est vérifié et actif
- [ ] L'abonnement PROFESSIONAL est créé avec statut ACTIVE
- [ ] La date de fin est correcte (1 an)

---

**🎉 C'est tout ! L'utilisateur est maintenant activé avec l'abonnement PROFESSIONAL !**

