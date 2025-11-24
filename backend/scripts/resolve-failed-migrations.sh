#!/bin/bash
# Script pour résoudre les migrations échouées avant de déployer les nouvelles

echo "🔍 Vérification des migrations échouées..."

# Résoudre la migration échouée si elle existe
npx prisma migrate resolve --rolled-back 20250120000000_add_onboarding_system 2>/dev/null || echo "Migration 20250120000000_add_onboarding_system déjà résolue ou n'existe pas"

echo "✅ Vérification terminée"

