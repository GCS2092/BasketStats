import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Réinitialisation de tous les mots de passe...\n');

  try {
    // Hasher le mot de passe "password"
    const newPasswordHash = await bcrypt.hash('password', 10);
    console.log('✅ Mot de passe hashé généré\n');

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    console.log(`📊 Nombre d'utilisateurs trouvés: ${users.length}\n`);

    if (users.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé dans la base de données');
      return;
    }

    // Afficher la liste des utilisateurs
    console.log('👥 Liste des utilisateurs:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.fullName}) - ${user.role}`);
    });
    console.log('');

    // Mettre à jour tous les mots de passe
    console.log('🔄 Mise à jour des mots de passe...');
    
    const updateResult = await prisma.user.updateMany({
      data: {
        passwordHash: newPasswordHash,
      },
    });

    console.log(`✅ ${updateResult.count} utilisateur(s) mis à jour avec succès\n`);
    console.log('🔑 Tous les mots de passe ont été réinitialisés à: password');
    console.log('⚠️  IMPORTANT: Changez ces mots de passe en production !\n');

    // Vérification
    const updatedUsers = await prisma.user.findMany({
      select: {
        email: true,
        passwordHash: true,
      },
    });

    console.log('✅ Vérification:');
    updatedUsers.forEach((user) => {
      const hasPassword = !!user.passwordHash;
      console.log(`  ${user.email}: ${hasPassword ? '✅ Mot de passe défini' : '❌ Pas de mot de passe'}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

