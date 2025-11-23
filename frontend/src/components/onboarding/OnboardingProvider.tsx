'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingModal from './OnboardingModal';
import OnboardingErrorBoundary from './OnboardingErrorBoundary';

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export default function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { data: session } = useSession();
  const { isOnboardingVisible, isLoading, onboardingData } = useOnboarding();

  // Ne pas afficher l'onboarding si l'utilisateur n'est pas connecté
  if (!session || isLoading) {
    return <>{children}</>;
  }

  // Ne pas afficher l'onboarding si les données ne sont pas encore chargées
  if (!onboardingData?.progress) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {isOnboardingVisible && (
        <OnboardingErrorBoundary>
          <OnboardingModal />
        </OnboardingErrorBoundary>
      )}
    </>
  );
}
