-- Script SQL pour réinitialiser tous les mots de passe à "password"
-- ⚠️ ATTENTION: Ce hash correspond au mot de passe "password" hashé avec bcrypt (10 rounds)
-- Pour générer un nouveau hash: node -e "console.log(require('bcryptjs').hashSync('password', 10))"

-- Hash bcrypt de "password" (généré avec bcryptjs, 10 rounds)
-- Ce hash correspond au mot de passe: password
UPDATE users 
SET password_hash = '$2b$10$hFlR6iEW0tGpPXeUiqp3.u.G9SDglneBasNqOh.uy6zQ3s0oMVMKe'
WHERE password_hash IS NOT NULL;

-- Vérifier le résultat
SELECT 
  email, 
  full_name, 
  role,
  CASE 
    WHEN password_hash IS NOT NULL THEN '✅ Mot de passe défini'
    ELSE '❌ Pas de mot de passe'
  END as password_status
FROM users
ORDER BY email;

