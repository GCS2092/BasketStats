# 🖥️ Accéder au Shell Render

## 🎯 Comment Accéder au Shell Render

### Méthode 1 : Via le Dashboard Render (Recommandé)

1. Allez sur : **[https://dashboard.render.com](https://dashboard.render.com)**
2. Cliquez sur le service : **`basketstatsbackend`**
3. Dans le menu de gauche, cliquez sur **"Shell"**
4. Un terminal s'ouvre directement dans votre navigateur
5. Vous pouvez maintenant exécuter des commandes !

**Lien Direct** : [https://dashboard.render.com/web/basketstatsbackend/shell](https://dashboard.render.com/web/basketstatsbackend/shell)

---

## 📋 Commandes Utiles dans le Shell Render

### Navigation et Informations

```bash
# Voir où vous êtes
pwd

# Lister les fichiers
ls -la

# Aller dans le répertoire backend
cd /opt/render/project/src/backend

# Voir les variables d'environnement
env | grep DATABASE_URL
env | grep JWT_SECRET
env | grep FRONTEND_URL
```

---

### Prisma - Base de Données

```bash
# Aller dans le répertoire backend
cd /opt/render/project/src/backend

# Générer Prisma Client
npx prisma generate

# Voir l'état des migrations
npx prisma migrate status

# Appliquer les migrations
npx prisma migrate deploy

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio
```

---

### Vérifier l'État du Service

```bash
# Voir les processus en cours
ps aux

# Voir l'utilisation de la mémoire
free -h

# Voir l'utilisation du disque
df -h

# Voir les variables d'environnement Node
node -e "console.log(process.env.NODE_ENV)"
node -e "console.log(process.env.PORT)"
```

---

### Tester la Connexion à la Base de Données

```bash
# Aller dans le répertoire backend
cd /opt/render/project/src/backend

# Tester la connexion Prisma
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ Connecté')).catch(e => console.error('❌ Erreur:', e.message));"
```

---

### Vérifier les Fichiers et Structure

```bash
# Voir la structure du projet
cd /opt/render/project/src/backend
tree -L 2

# Voir les fichiers de configuration
cat package.json
cat prisma/schema.prisma

# Voir les logs du build
cat /opt/render/project/src/backend/dist/main.js | head -20
```

---

### Commandes de Débogage

```bash
# Voir les dernières lignes des logs
tail -f /opt/render/project/src/backend/logs/*.log

# Vérifier si Node.js est installé
node --version
npm --version

# Vérifier les dépendances installées
cd /opt/render/project/src/backend
npm list --depth=0
```

---

### Commandes Prisma Avancées

```bash
# Aller dans le répertoire backend
cd /opt/render/project/src/backend

# Voir le schéma de la base de données
npx prisma db pull

# Réinitialiser la base de données (⚠️ DANGEREUX - supprime toutes les données)
# npx prisma migrate reset

# Créer une nouvelle migration
# npx prisma migrate dev --name nom_de_la_migration

# Voir les données d'une table
npx prisma studio
```

---

### Tester l'API depuis le Shell

```bash
# Tester le health check
curl http://localhost:10000/api/health

# Tester avec l'URL externe
curl https://basketstatsbackend.onrender.com/api/health

# Tester le login (remplacez par vos identifiants)
curl -X POST https://basketstatsbackend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"slovengama@gmail.com","password":"password123"}'
```

---

## ⚠️ Commandes à Éviter

### ⛔ Ne PAS Exécuter

```bash
# ❌ Ne PAS supprimer des fichiers système
rm -rf /opt/render

# ❌ Ne PAS modifier les fichiers de configuration Render
# Ne modifiez pas les fichiers dans /opt/render/project/src/backend directement

# ❌ Ne PAS réinitialiser la base de données en production
# npx prisma migrate reset  # ⚠️ Supprime toutes les données !
```

---

## 🔍 Cas d'Usage Courants

### Problème : Migration Prisma Échouée

```bash
cd /opt/render/project/src/backend

# Voir l'état des migrations
npx prisma migrate status

# Nettoyer les migrations échouées
node scripts/clean-failed-migrations.js

# Réappliquer les migrations
npx prisma migrate deploy
```

---

### Problème : Prisma Client Non Généré

```bash
cd /opt/render/project/src/backend

# Générer Prisma Client
npx prisma generate

# Vérifier que c'est bien généré
ls -la node_modules/.prisma/client/
```

---

### Problème : Vérifier les Variables d'Environnement

```bash
# Voir toutes les variables d'environnement
env

# Filtrer les variables importantes
env | grep DATABASE_URL
env | grep JWT
env | grep FRONTEND_URL
env | grep NODE_ENV
env | grep PORT
```

---

### Problème : Vérifier les Logs en Temps Réel

```bash
# Les logs Render sont visibles dans le dashboard
# Mais vous pouvez aussi voir les logs système
journalctl -u render -f

# Ou voir les logs de l'application
tail -f /opt/render/project/src/backend/logs/*.log
```

---

## 📝 Notes Importantes

1. **Répertoire de Travail** :
   - Le répertoire par défaut est : `/opt/render/project/src/backend`
   - Tous vos fichiers sont dans ce répertoire

2. **Permissions** :
   - Vous avez les permissions pour exécuter des commandes
   - Vous ne pouvez pas modifier les fichiers système Render

3. **Variables d'Environnement** :
   - Toutes les variables d'environnement sont disponibles
   - Utilisez `env` pour les voir toutes

4. **Base de Données** :
   - Utilisez `DATABASE_URL` pour la connexion
   - C'est l'Internal Database URL de Render

---

## 🚀 Accès Rapide

**Lien Direct vers le Shell** :
```
https://dashboard.render.com/web/basketstatsbackend/shell
```

1. Cliquez sur le lien ci-dessus
2. Le terminal s'ouvre dans votre navigateur
3. Vous pouvez exécuter des commandes directement !

---

## 💡 Astuces

1. **Utilisez Tab pour l'auto-complétion** : Comme dans un terminal normal
2. **Utilisez Ctrl+C** : Pour arrêter une commande en cours
3. **Utilisez Ctrl+L** : Pour effacer l'écran
4. **Utilisez la flèche haut** : Pour voir l'historique des commandes

---

## 🔗 Commandes Rapides

Copiez-collez ces commandes directement dans le Shell Render :

```bash
# Vérifier l'état complet
cd /opt/render/project/src/backend && pwd && ls -la && npx prisma migrate status
```

```bash
# Tester la connexion à la base de données
cd /opt/render/project/src/backend && node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => { console.log('✅ Base de données connectée'); prisma.\$disconnect(); }).catch(e => { console.error('❌ Erreur:', e.message); process.exit(1); });"
```

```bash
# Voir toutes les variables d'environnement importantes
env | grep -E "DATABASE_URL|JWT|FRONTEND_URL|NODE_ENV|PORT"
```

