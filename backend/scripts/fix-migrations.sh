#!/bin/bash
set -e

echo "🔍 Vérification et résolution des migrations échouées..."

# Nettoyer d'abord la table _prisma_migrations
echo "🧹 Nettoyage de la table _prisma_migrations..."
node scripts/clean-failed-migrations.js || echo "⚠️  Nettoyage échoué, continuation..."

# La migration 20250120000000_add_onboarding_system a été supprimée car elle était dupliquée
# La table onboarding_progress existe déjà via la migration 20251020000000_add_onboarding_system
echo "ℹ️  Migration dupliquée onboarding supprimée (table existe déjà via migration 20251020)"

echo "🚀 Déploiement des migrations..."
npx prisma migrate deploy

