import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  completed: boolean;
  order: number;
  role?: string[];
  skipable?: boolean;
}

export interface OnboardingProgress {
  userId: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  isCompleted: boolean;
  role: string;
  lastUpdated: string;
}

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Définir les étapes d'onboarding par rôle
   */
  private getOnboardingSteps(role: string): OnboardingStep[] {
    const baseSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'Bienvenue sur BasketStats',
        description: 'Découvrez la plateforme qui connecte le monde du basketball',
        component: 'WelcomeStep',
        required: true,
        completed: false,
        order: 1,
        skipable: false,
      },
      {
        id: 'profile-setup',
        title: 'Configuration du profil',
        description: 'Créez un profil complet pour maximiser vos connexions',
        component: 'ProfileSetupStep',
        required: true,
        completed: false,
        order: 2,
        skipable: false,
      },
      {
        id: 'role-selection',
        title: 'Sélection du rôle',
        description: 'Choisissez votre rôle principal sur la plateforme',
        component: 'RoleSelectionStep',
        required: true,
        completed: false,
        order: 3,
        skipable: false,
      },
      {
        id: 'preferences',
        title: 'Préférences',
        description: 'Personnalisez votre expérience utilisateur',
        component: 'PreferencesStep',
        required: false,
        completed: false,
        order: 4,
        skipable: true,
      },
    ];

    // Étapes spécifiques au rôle
    const roleSpecificSteps: { [key: string]: OnboardingStep[] } = {
      PLAYER: [
        {
          id: 'player-profile',
          title: 'Profil de joueur',
          description: 'Complétez vos informations de joueur (position, statistiques, etc.)',
          component: 'PlayerProfileStep',
          required: true,
          completed: false,
          order: 5,
          role: ['PLAYER'],
          skipable: false,
        },
        {
          id: 'first-post',
          title: 'Premier post',
          description: 'Partagez votre première publication avec la communauté',
          component: 'FirstPostStep',
          required: false,
          completed: false,
          order: 6,
          role: ['PLAYER'],
          skipable: true,
        },
      ],
      RECRUITER: [
        {
          id: 'recruiter-profile',
          title: 'Profil de recruteur',
          description: 'Configurez votre profil de recruteur et vos préférences',
          component: 'RecruiterProfileStep',
          required: true,
          completed: false,
          order: 5,
          role: ['RECRUITER'],
          skipable: false,
        },
        {
          id: 'first-search',
          title: 'Première recherche',
          description: 'Effectuez votre première recherche de joueurs',
          component: 'FirstSearchStep',
          required: false,
          completed: false,
          order: 6,
          role: ['RECRUITER'],
          skipable: true,
        },
      ],
      CLUB: [
        {
          id: 'club-profile',
          title: 'Profil de club',
          description: 'Créez ou configurez le profil de votre club',
          component: 'ClubProfileStep',
          required: true,
          completed: false,
          order: 5,
          role: ['CLUB'],
          skipable: false,
        },
        {
          id: 'first-event',
          title: 'Premier événement',
          description: 'Créez votre premier événement ou tryout',
          component: 'FirstEventStep',
          required: false,
          completed: false,
          order: 6,
          role: ['CLUB'],
          skipable: true,
        },
      ],
    };

    // Étapes communes finales
    const finalSteps: OnboardingStep[] = [
      {
        id: 'first-action',
        title: 'Première action',
        description: 'Choisissez votre première action sur la plateforme',
        component: 'FirstActionStep',
        required: false,
        completed: false,
        order: 7,
        skipable: true,
      },
      {
        id: 'explore-features',
        title: 'Explorer les fonctionnalités',
        description: 'Découvrez les principales fonctionnalités de BasketStats',
        component: 'ExploreFeaturesStep',
        required: false,
        completed: false,
        order: 8,
        skipable: true,
      },
      {
        id: 'complete',
        title: 'Onboarding terminé',
        description: 'Félicitations ! Vous êtes prêt à utiliser BasketStats',
        component: 'CompleteStep',
        required: true,
        completed: false,
        order: 9,
        skipable: false,
      },
    ];

    // Combiner toutes les étapes
    const roleSteps = roleSpecificSteps[role] || [];
    return [...baseSteps, ...roleSteps, ...finalSteps];
  }

  /**
   * Récupérer ou créer le progrès d'onboarding d'un utilisateur
   */
  async getOnboardingProgress(userId: string): Promise<{
    progress: OnboardingProgress;
    steps: OnboardingStep[];
  }> {
    // Récupérer l'utilisateur avec son rôle
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Récupérer ou créer le progrès d'onboarding
    let progress = await this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      // Créer un nouveau progrès d'onboarding
      const steps = this.getOnboardingSteps(user.role);
      progress = await this.prisma.onboardingProgress.create({
        data: {
          userId,
          currentStep: 0,
          totalSteps: steps.length,
          completedSteps: [],
          isCompleted: false,
          role: user.role,
        },
      });
    }

    // Récupérer les étapes pour ce rôle
    const steps = this.getOnboardingSteps(user.role);

    // Marquer les étapes comme terminées
    const stepsWithCompletion = steps.map(step => ({
      ...step,
      completed: progress.completedSteps.includes(step.id),
    }));

    return {
      progress: {
        userId: progress.userId,
        currentStep: progress.currentStep,
        totalSteps: progress.totalSteps,
        completedSteps: progress.completedSteps,
        isCompleted: progress.isCompleted,
        role: progress.role,
        lastUpdated: progress.updatedAt.toISOString(),
      },
      steps: stepsWithCompletion,
    };
  }

  /**
   * Marquer une étape comme terminée
   */
  async completeStep(userId: string, stepId: string): Promise<void> {
    const progress = await this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      throw new Error('Progrès d\'onboarding non trouvé');
    }

    // Ajouter l'étape aux étapes terminées si elle n'y est pas déjà
    const updatedCompletedSteps = progress.completedSteps.includes(stepId)
      ? progress.completedSteps
      : [...progress.completedSteps, stepId];

    await this.prisma.onboardingProgress.update({
      where: { userId },
      data: {
        completedSteps: updatedCompletedSteps,
      },
    });
  }

  /**
   * Passer à l'étape suivante
   */
  async nextStep(userId: string): Promise<{ isCompleted: boolean }> {
    const progress = await this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      throw new Error('Progrès d\'onboarding non trouvé');
    }

    const nextStepIndex = progress.currentStep + 1;
    const isCompleted = nextStepIndex >= progress.totalSteps;

    await this.prisma.onboardingProgress.update({
      where: { userId },
      data: {
        currentStep: isCompleted ? progress.currentStep : nextStepIndex,
        isCompleted,
      },
    });

    return { isCompleted };
  }

  /**
   * Terminer l'onboarding
   */
  async completeOnboarding(userId: string): Promise<void> {
    await this.prisma.onboardingProgress.update({
      where: { userId },
      data: {
        isCompleted: true,
      },
    });
  }

  /**
   * Réinitialiser l'onboarding
   */
  async resetOnboarding(userId: string): Promise<void> {
    await this.prisma.onboardingProgress.update({
      where: { userId },
      data: {
        currentStep: 0,
        completedSteps: [],
        isCompleted: false,
      },
    });
  }

  /**
   * Vérifier si l'utilisateur a besoin d'onboarding
   */
  async needsOnboarding(userId: string): Promise<boolean> {
    const progress = await this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    return !progress || !progress.isCompleted;
  }
}
