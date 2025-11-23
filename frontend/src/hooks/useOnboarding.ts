'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

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

export interface OnboardingData {
  progress: OnboardingProgress;
  steps: OnboardingStep[];
}

export function useOnboarding() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);

  // Récupérer les données d'onboarding
  const { data: onboardingData, isLoading, error } = useQuery({
    queryKey: ['onboarding', session?.user?.id],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/onboarding/progress');
        return response.data as OnboardingData;
      } catch (error) {
        console.error('Erreur lors du chargement de l\'onboarding:', error);
        // Retourner des données par défaut en cas d'erreur
        return {
          progress: {
            userId: session?.user?.id || '',
            currentStep: 0,
            totalSteps: 0,
            completedSteps: [],
            isCompleted: true, // Marquer comme terminé pour éviter l'affichage
            role: session?.user?.role || 'PLAYER',
            lastUpdated: new Date().toISOString(),
          },
          steps: [],
        };
      }
    },
    enabled: !!session,
    retry: 1, // Ne retry qu'une fois en cas d'erreur
  });

  // Mutation pour marquer une étape comme terminée
  const completeStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const response = await apiClient.post('/onboarding/complete-step', { stepId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });

  // Mutation pour passer à l'étape suivante
  const nextStepMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/onboarding/next-step');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      if (data.isCompleted) {
        setIsOnboardingVisible(false);
      }
    },
  });

  // Mutation pour terminer l'onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/onboarding/complete');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      setIsOnboardingVisible(false);
    },
  });

  // Vérifier si l'onboarding doit être affiché
  useEffect(() => {
    if (onboardingData?.progress && !onboardingData.progress.isCompleted) {
      setIsOnboardingVisible(true);
      setCurrentStepIndex(onboardingData.progress.currentStep);
    }
  }, [onboardingData]);

  // Fonctions utilitaires
  const getCurrentStep = () => {
    if (!onboardingData?.steps) return null;
    return onboardingData.steps[currentStepIndex];
  };

  const getProgressPercentage = () => {
    if (!onboardingData?.progress) return 0;
    if (onboardingData.progress.totalSteps === 0) return 0;
    return Math.round((onboardingData.progress.completedSteps.length / onboardingData.progress.totalSteps) * 100);
  };

  const canGoNext = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return false;
    return currentStep.completed || currentStep.skipable;
  };

  const canGoPrevious = () => {
    return currentStepIndex > 0;
  };

  const goToNextStep = () => {
    if (canGoNext()) {
      nextStepMutation.mutate();
    }
  };

  const goToPreviousStep = () => {
    if (canGoPrevious()) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const skipCurrentStep = () => {
    const currentStep = getCurrentStep();
    if (currentStep?.skipable) {
      nextStepMutation.mutate();
    }
  };

  const completeCurrentStep = () => {
    const currentStep = getCurrentStep();
    if (currentStep) {
      completeStepMutation.mutate(currentStep.id);
    }
  };

  const closeOnboarding = () => {
    setIsOnboardingVisible(false);
  };

  const restartOnboarding = () => {
    setCurrentStepIndex(0);
    setIsOnboardingVisible(true);
  };

  return {
    // Données
    onboardingData,
    isLoading,
    currentStep: getCurrentStep(),
    currentStepIndex,
    isOnboardingVisible,
    progressPercentage: getProgressPercentage(),
    
    // Actions
    completeCurrentStep,
    goToNextStep,
    goToPreviousStep,
    skipCurrentStep,
    completeOnboarding: completeOnboardingMutation.mutate,
    closeOnboarding,
    restartOnboarding,
    
    // États des mutations
    isCompletingStep: completeStepMutation.isPending,
    isGoingNext: nextStepMutation.isPending,
    isCompleting: completeOnboardingMutation.isPending,
    
    // Utilitaires
    canGoNext: canGoNext(),
    canGoPrevious: canGoPrevious(),
  };
}
