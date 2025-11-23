import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileCompletionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vérifie si un profil joueur est complet
   */
  async isProfileComplete(userId: string): Promise<boolean> {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
      select: {
        nickname: true,
        position: true,
        level: true,
        heightCm: true,
        weightKg: true,
        birthdate: true,
        country: true,
        city: true,
        currentClub: true,
        stats: true,
      },
    });

    if (!profile) {
      return false;
    }

    // Critères de complétion du profil
    const requiredFields = [
      profile.nickname,
      profile.position,
      profile.level,
      profile.heightCm,
      profile.weightKg,
      profile.birthdate,
      profile.country,
      profile.city,
    ];

    // Au moins 6 champs sur 8 doivent être remplis
    const filledFields = requiredFields.filter(field => field !== null && field !== undefined).length;
    return filledFields >= 6;
  }

  /**
   * Calcule le pourcentage de complétion du profil
   */
  async getProfileCompletionPercentage(userId: string): Promise<number> {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
      select: {
        nickname: true,
        position: true,
        level: true,
        heightCm: true,
        weightKg: true,
        birthdate: true,
        country: true,
        city: true,
        currentClub: true,
        stats: true,
      },
    });

    if (!profile) {
      return 0;
    }

    const allFields = [
      profile.nickname,
      profile.position,
      profile.level,
      profile.heightCm,
      profile.weightKg,
      profile.birthdate,
      profile.country,
      profile.city,
      profile.currentClub,
      profile.stats,
    ];

    const filledFields = allFields.filter(field => 
      field !== null && 
      field !== undefined && 
      field !== '' &&
      (typeof field !== 'object' || (field && Object.keys(field).length > 0))
    ).length;

    return Math.round((filledFields / allFields.length) * 100);
  }

  /**
   * Obtient les champs manquants pour compléter le profil
   */
  async getMissingFields(userId: string): Promise<string[]> {
    const profile = await this.prisma.playerProfile.findUnique({
      where: { userId },
      select: {
        nickname: true,
        position: true,
        level: true,
        heightCm: true,
        weightKg: true,
        birthdate: true,
        country: true,
        city: true,
        currentClub: true,
        stats: true,
      },
    });

    if (!profile) {
      return ['nickname', 'position', 'level', 'heightCm', 'weightKg', 'birthdate', 'country', 'city'];
    }

    const fieldLabels = {
      nickname: 'Pseudo',
      position: 'Position',
      level: 'Niveau',
      heightCm: 'Taille',
      weightKg: 'Poids',
      birthdate: 'Date de naissance',
      country: 'Pays',
      city: 'Ville',
      currentClub: 'Club actuel',
      stats: 'Statistiques',
    };

    const missingFields: string[] = [];

    Object.entries(profile).forEach(([key, value]) => {
      if (!value || value === '' || (typeof value === 'object' && Object.keys(value).length === 0)) {
        missingFields.push(fieldLabels[key as keyof typeof fieldLabels]);
      }
    });

    return missingFields;
  }

  /**
   * Obtient les suggestions pour compléter le profil
   */
  async getProfileSuggestions(userId: string): Promise<{
    priority: string[];
    optional: string[];
    tips: string[];
  }> {
    const missingFields = await this.getMissingFields(userId);
    const completionPercentage = await this.getProfileCompletionPercentage(userId);

    const priority = missingFields.slice(0, 4); // Les 4 premiers champs manquants
    const optional = missingFields.slice(4); // Les autres champs

    const tips: string[] = [];
    
    if (completionPercentage < 30) {
      tips.push('Ajoutez au moins votre position et votre niveau pour être visible');
    } else if (completionPercentage < 60) {
      tips.push('Complétez vos informations physiques pour attirer les recruteurs');
    } else if (completionPercentage < 90) {
      tips.push('Ajoutez votre biographie et vos statistiques pour vous démarquer');
    }

    return {
      priority,
      optional,
      tips,
    };
  }
}
