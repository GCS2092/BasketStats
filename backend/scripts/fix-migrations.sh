#!/bin/bash
set -e

echo "🔍 Vérification et résolution des migrations échouées..."

# Nettoyer d'abord la table _prisma_migrations
echo "🧹 Nettoyage de la table _prisma_migrations..."
node scripts/clean-failed-migrations.js || echo "⚠️  Nettoyage échoué, continuation..."

# Résoudre la migration échouée si elle existe
if npx prisma migrate resolve --rolled-back 20250120000000_add_onboarding_system 2>&1; then
  echo "✅ Migration 20250120000000_add_onboarding_system marquée comme rollback"
else
  echo "ℹ️  Migration 20250120000000_add_onboarding_system non trouvée ou déjà résolue"
fi

echo "🚀 Déploiement des migrations..."
npx prisma migrate deploy

