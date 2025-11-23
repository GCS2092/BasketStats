'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingModalProps {
  className?: string;
}

export default function OnboardingModal({ className = '' }: OnboardingModalProps) {
  const {
    currentStep,
    currentStepIndex,
    isOnboardingVisible,
    progressPercentage,
    canGoNext,
    canGoPrevious,
    completeCurrentStep,
    goToNextStep,
    goToPreviousStep,
    skipCurrentStep,
    completeOnboarding,
    closeOnboarding,
    isCompletingStep,
    isGoingNext,
    isCompleting,
  } = useOnboarding();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOnboardingVisible) {
      setIsVisible(true);
    }
  }, [isOnboardingVisible]);

  if (!isVisible || !currentStep) {
    return null;
  }

  const handleNext = () => {
    if (canGoNext) {
      goToNextStep();
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      goToPreviousStep();
    }
  };

  const handleSkip = () => {
    skipCurrentStep();
  };

  const handleComplete = () => {
    completeCurrentStep();
  };

  const handleClose = () => {
    closeOnboarding();
  };

  const handleFinish = () => {
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header avec progression */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">
              🎯 Bienvenue sur BasketStats !
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Étape {currentStepIndex + 1}</span>
              <span>{progressPercentage}% terminé</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="text-4xl sm:text-5xl mb-4">
              {getStepIcon(currentStep)}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {currentStep.title}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Composant spécifique à l'étape */}
          <div className="mb-8">
            {renderStepComponent(currentStep)}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {canGoPrevious && (
              <button
                onClick={handlePrevious}
                className="btn btn-secondary flex-1 sm:flex-none"
                disabled={isGoingNext}
              >
                ← Précédent
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {currentStep.skipable && (
                <button
                  onClick={handleSkip}
                  className="btn btn-ghost flex-1"
                  disabled={isGoingNext}
                >
                  Passer
                </button>
              )}

              {!currentStep.completed && (
                <button
                  onClick={handleComplete}
                  className="btn btn-primary flex-1"
                  disabled={isCompletingStep}
                >
                  {isCompletingStep ? '⏳' : '✓'} Terminer cette étape
                </button>
              )}

              {currentStep.completed && canGoNext && (
                <button
                  onClick={handleNext}
                  className="btn btn-primary flex-1"
                  disabled={isGoingNext}
                >
                  {isGoingNext ? '⏳' : '→'} Suivant
                </button>
              )}

              {currentStep.completed && !canGoNext && (
                <button
                  onClick={handleFinish}
                  className="btn btn-accent flex-1"
                  disabled={isCompleting}
                >
                  {isCompleting ? '⏳' : '🎉'} Terminer l\'onboarding
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonction pour obtenir l'icône de l'étape
function getStepIcon(step: OnboardingStep): string {
  const iconMap: { [key: string]: string } = {
    'welcome': '👋',
    'profile-setup': '👤',
    'role-selection': '🎭',
    'preferences': '⚙️',
    'first-action': '🚀',
    'explore-features': '🔍',
    'complete': '🎉',
  };
  
  return iconMap[step.id] || '📋';
}

// Fonction pour rendre le composant spécifique à l'étape
function renderStepComponent(step: OnboardingStep) {
  switch (step.id) {
    case 'welcome':
      return <WelcomeStep />;
    case 'profile-setup':
      return <ProfileSetupStep />;
    case 'role-selection':
      return <RoleSelectionStep />;
    case 'preferences':
      return <PreferencesStep />;
    case 'first-action':
      return <FirstActionStep />;
    case 'explore-features':
      return <ExploreFeaturesStep />;
    case 'complete':
      return <CompleteStep />;
    default:
      return <DefaultStep step={step} />;
  }
}

// Composants pour chaque étape
function WelcomeStep() {
  return (
    <div className="text-center space-y-4">
      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">
          🏀 Bienvenue dans l'univers du basketball !
        </h4>
        <p className="text-blue-800 text-sm">
          BasketStats est votre plateforme complète pour connecter joueurs, recruteurs et clubs de basketball.
          Nous allons vous guider à travers les fonctionnalités principales.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-2">👥</div>
          <div className="font-medium">Connecter</div>
          <div className="text-gray-600">Joueurs & Recruteurs</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-medium">Analyser</div>
          <div className="text-gray-600">Performances</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-2">🏆</div>
          <div className="font-medium">Progresser</div>
          <div className="text-gray-600">Carrière</div>
        </div>
      </div>
    </div>
  );
}

function ProfileSetupStep() {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-green-900 mb-3">
          👤 Configurez votre profil
        </h4>
        <p className="text-green-800 text-sm mb-4">
          Un profil complet augmente vos chances de connexion avec d'autres utilisateurs.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Photo de profil</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Informations personnelles</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Statistiques de jeu</span>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <a
          href="/profile"
          className="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          🚀 Aller au profil
        </a>
      </div>
    </div>
  );
}

function RoleSelectionStep() {
  return (
    <div className="space-y-4">
      <div className="bg-purple-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-purple-900 mb-3">
          🎭 Choisissez votre rôle
        </h4>
        <p className="text-purple-800 text-sm mb-4">
          Votre rôle détermine les fonctionnalités disponibles et l'expérience sur la plateforme.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
          <div className="text-3xl mb-3">🏀</div>
          <h5 className="font-semibold text-blue-900 mb-2">Joueur</h5>
          <p className="text-blue-800 text-sm">
            Créez votre profil, partagez vos performances et connectez-vous avec des recruteurs.
          </p>
        </div>
        
        <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
          <div className="text-3xl mb-3">🔍</div>
          <h5 className="font-semibold text-green-900 mb-2">Recruteur</h5>
          <p className="text-green-800 text-sm">
            Découvrez des talents, gérez vos équipes et analysez les performances.
          </p>
        </div>
      </div>
    </div>
  );
}

function PreferencesStep() {
  return (
    <div className="space-y-4">
      <div className="bg-orange-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-orange-900 mb-3">
          ⚙️ Personnalisez votre expérience
        </h4>
        <p className="text-orange-800 text-sm">
          Configurez vos préférences pour une expérience optimale.
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Notifications par email</span>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Notifications push</span>
          <input type="checkbox" className="toggle" defaultChecked />
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Mode sombre</span>
          <input type="checkbox" className="toggle" />
        </div>
      </div>
    </div>
  );
}

function FirstActionStep() {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-yellow-900 mb-3">
          🚀 Votre première action
        </h4>
        <p className="text-yellow-800 text-sm">
          Choisissez ce que vous souhaitez faire en premier sur la plateforme.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a href="/feed" className="btn btn-primary text-center">
          📱 Explorer le feed
        </a>
        <a href="/players" className="btn btn-secondary text-center">
          👥 Voir les joueurs
        </a>
        <a href="/events" className="btn btn-secondary text-center">
          📅 Découvrir les événements
        </a>
        <a href="/clubs" className="btn btn-secondary text-center">
          🏀 Voir les clubs
        </a>
      </div>
    </div>
  );
}

function ExploreFeaturesStep() {
  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-indigo-900 mb-3">
          🔍 Explorez les fonctionnalités
        </h4>
        <p className="text-indigo-800 text-sm">
          Découvrez les principales fonctionnalités de BasketStats.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="text-2xl mb-2">📊</div>
          <h5 className="font-semibold mb-1">Analytics</h5>
          <p className="text-sm text-gray-600">Suivez vos performances</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="text-2xl mb-2">💬</div>
          <h5 className="font-semibold mb-1">Messages</h5>
          <p className="text-sm text-gray-600">Communiquez avec d'autres</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="text-2xl mb-2">📅</div>
          <h5 className="font-semibold mb-1">Événements</h5>
          <p className="text-sm text-gray-600">Participez à des événements</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="text-2xl mb-2">🏆</div>
          <h5 className="font-semibold mb-1">Contrats</h5>
          <p className="text-sm text-gray-600">Gérez vos contrats</p>
        </div>
      </div>
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">🎉</div>
      <div>
        <h4 className="text-2xl font-bold text-gray-900 mb-3">
          Félicitations !
        </h4>
        <p className="text-gray-600 text-lg">
          Vous êtes maintenant prêt à utiliser BasketStats au maximum de ses capacités.
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h5 className="font-semibold text-gray-900 mb-3">Prochaines étapes recommandées :</h5>
        <div className="space-y-2 text-sm text-gray-700">
          <div>• Complétez votre profil à 100%</div>
          <div>• Explorez le feed et les fonctionnalités</div>
          <div>• Connectez-vous avec d'autres utilisateurs</div>
          <div>• Participez à des événements</div>
        </div>
      </div>
    </div>
  );
}

function DefaultStep({ step }: { step: OnboardingStep }) {
  return (
    <div className="text-center">
      <p className="text-gray-600">
        Étape : {step.title}
      </p>
    </div>
  );
}
