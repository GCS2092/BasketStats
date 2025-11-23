'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ConnectionStatus from '../common/ConnectionStatus';
import LoadingSpinner from '../common/LoadingSpinner';
import ProfileCompletionNotification from '../notifications/ProfileCompletionNotification';
import ProfileCompletionBanner from '../notifications/ProfileCompletionBanner';
import MobileBackButton from '../common/MobileBackButton';
import PersistentAuthIndicator from '../common/PersistentAuthIndicator';
import MobilePersistenceTest from '../test/MobilePersistenceTest';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Chargement...');
  const pathname = usePathname();
  const { data: session } = useSession();

  // Simuler le chargement lors des changements de page
  useEffect(() => {
    setIsLoading(true);
    setLoadingText('Chargement de la page...');
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Pages qui n'ont pas besoin de notifications
  const noNotificationPages = ['/auth/login', '/auth/register', '/profile/edit'];
  const showNotifications = !noNotificationPages.includes(pathname) && session?.user?.role === 'PLAYER';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière de complétion de profil (mobile) */}
      {showNotifications && (
        <div className="lg:hidden">
          <ProfileCompletionBanner />
        </div>
      )}
      
      {/* Bouton retour mobile */}
      <MobileBackButton />
      
      {/* Contenu principal */}
      <main>
        {children}
      </main>

      {/* Notification de complétion de profil (desktop) */}
      {showNotifications && (
        <div className="hidden lg:block">
          <ProfileCompletionNotification />
        </div>
      )}

      {/* Indicateur de connexion persistante */}
      <PersistentAuthIndicator />

      {/* Composant de test (développement uniquement) */}
      {process.env.NODE_ENV === 'development' && <MobilePersistenceTest />}

      {/* Indicateur de chargement global */}
      <LoadingSpinner isLoading={isLoading} text={loadingText} />
      
      {/* Statut de connexion */}
      <ConnectionStatus />
    </div>
  );
}

// Hook pour contrôler le chargement depuis les composants
export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Chargement...');

  const startLoading = (text?: string) => {
    setLoadingText(text || 'Chargement...');
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading
  };
}
