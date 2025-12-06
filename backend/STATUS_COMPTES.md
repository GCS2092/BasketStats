# Statut des Comptes en Production

## ⚠️ Situation Actuelle

**Les comptes créés localement ne sont PAS actifs en production.**

### Pourquoi ?

1. **Base de données séparée** : 
   - Votre base de données locale (PostgreSQL local) est différente de la base de production sur Render
   - Les données locales ne sont pas synchronisées avec la production

2. **Base de production vide** :
   - Les migrations ont créé les tables (structure)
   - Mais aucune donnée n'a été insérée (pas de seed exécuté)
   - La base est donc vide : **aucun utilisateur n'existe actuellement**

3. **Test effectué** :
   - Tentative de login avec un compte de test → **401 Unauthorized**
   - Cela confirme qu'aucun compte n'existe dans la base de production

## ✅ Solutions

### Option 1 : Créer un nouveau compte via l'API (Recommandé)

Utilisez l'endpoint d'inscription pour créer un compte en production :

```bash
POST https://basketstatsbackend.onrender.com/api/auth/signup
```

Body :
```json
{
  "email": "votre-email@example.com",
  "password": "votre-mot-de-passe",
  "fullName": "Votre Nom",
  "role": "PLAYER" // ou "RECRUITER"
}
```

### Option 2 : Exécuter le seed en production (Comptes de test)

Si vous voulez créer des comptes de test en production, vous pouvez exécuter le script de seed :

**⚠️ ATTENTION** : Cela créera des comptes de test avec le mot de passe `password123`

Pour exécuter le seed en production :
1. Connectez-vous au shell Render de votre service
2. Exécutez : `npm run prisma:seed`

**Comptes qui seront créés** :
- `thomas.dubois@basketstats.com` (Joueur)
- `marcus.johnson@nba.com` (Joueur)
- `sophie.martin@basketstats.com` (Joueur)
- `john.smith@nba-scouts.com` (Recruteur)
- `pierre.bernard@asvel.com` (Recruteur)
- `miguel.santos@probasket-agency.com` (Recruteur)
- Et d'autres...

**Mot de passe pour tous** : `password123`

## 📊 Vérification

Pour vérifier si des comptes existent :

```powershell
# Test de login (échouera si aucun compte)
$body = @{email="test@example.com"; password="test123"} | ConvertTo-Json
Invoke-WebRequest -Uri "https://basketstatsbackend.onrender.com/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

## 🔐 Sécurité

**Important** : 
- Ne partagez JAMAIS les mots de passe en production
- Changez les mots de passe par défaut si vous exécutez le seed
- Utilisez des mots de passe forts pour les comptes réels

## 🚀 Prochaines Étapes

1. **Créer votre premier compte** via l'API d'inscription
2. **OU** exécuter le seed pour avoir des comptes de test
3. **Tester l'authentification** avec le compte créé

