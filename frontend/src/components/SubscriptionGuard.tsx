'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: string;
}

export default function SubscriptionGuard({ children, requiredPlan }: SubscriptionGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Vérifier le statut d\'abonnement via l\'API
        const response = await apiClient.get('/subscriptions/can-access-dashboard');
        const { canAccess } = response.data;
        
        if (!canAccess) {
          setHasSubscription(false);
        } else {
          setHasSubscription(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'abonnement:', error);
        setHasSubscription(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Abonnement requis</h1>
            <p className="text-gray-600 mb-6">
              Vous devez avoir un abonnement actif pour accéder à cette fonctionnalité.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/welcome')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choisir un plan d\'abonnement
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}