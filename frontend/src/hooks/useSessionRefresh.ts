'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export function useSessionRefresh() {
  const { data: session, update } = useSession();

  const refreshSession = useCallback(async () => {
    try {
      // Forcer la mise à jour de la session
      await update();
      console.log('Session rafraîchie avec succès');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error);
    }
  }, [update]);

  return {
    refreshSession,
    session,
  };
}
