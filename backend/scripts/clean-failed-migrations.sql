-- Script SQL pour nettoyer les migrations échouées dans la table _prisma_migrations
-- Supprime l'entrée de la migration échouée 20250120000000_add_onboarding_system

DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20250120000000_add_onboarding_system' 
AND finished_at IS NULL;

-- Vérification
SELECT migration_name, finished_at, applied_steps_count 
FROM "_prisma_migrations" 
WHERE migration_name = '20250120000000_add_onboarding_system';

