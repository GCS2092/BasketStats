'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';

interface PWARedirectProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export default function PWARedirect({ children, fallbackPath = '/subscription' }: PWARedirectProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (status === 'loading' || !session) {
        return;
      }

      console.log('🔍 [PWA_REDIRECT] Vérification de l\'abonnement...');
      
      try {
        const response = await apiClient.get('/subscriptions/can-access-dashboard');
        const { canAccess } = response.data;
        
        console.log('🔍 [PWA_REDIRECT] Accès autorisé:', canAccess);
        
        if (!canAccess) {
          console.log('❌ [PWA_REDIRECT] Pas d\'abonnement, redirection vers:', fallbackPath);
          router.push(fallbackPath);
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('❌ [PWA_REDIRECT] Erreur lors de la vérification:', error);
        // En cas d'erreur, rediriger vers la page d'abonnement par sécurité
        router.push(fallbackPath);
      } finally {
        setIsChecking(false);
      }
    };

    checkSubscription();
  }, [session, status, router, fallbackPath]);

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'abonnement...</p>
          <p className="text-sm text-gray-500 mt-2">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
