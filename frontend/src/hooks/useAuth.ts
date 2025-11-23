import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * Hook pour synchroniser les tokens NextAuth avec localStorage
 * Permet à apiClient d'accéder aux tokens pour les requêtes authentifiées
 */
export function useAuthSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      localStorage.setItem('accessToken', session.accessToken);
      localStorage.setItem('refreshToken', session.refreshToken || '');
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, [session]);

  return session;
}

