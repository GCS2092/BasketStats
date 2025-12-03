'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PersistentAuthOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number; // en millisecondes
  maxInactivityTime?: number; // en millisecondes
  enableInactivityDetection?: boolean;
}

export function usePersistentAuth(options: PersistentAuthOptions = {}) {
  const {
    enableAutoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    maxInactivityTime = 30 * 60 * 1000, // 30 minutes
    enableInactivityDetection = true
  } = options;

  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isInactive, setIsInactive] = useState(false);

  // Mettre à jour l'activité utilisateur
  const updateActivity = () => {
    setLastActivity(Date.now());
    setIsInactive(false);
  };

  // Détecter l'inactivité
  useEffect(() => {
    if (!enableInactivityDetection || !session) return;

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      updateActivity();
    };

    // Ajouter les écouteurs d'événements
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Vérifier l'inactivité périodiquement
    const inactivityCheck = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity > maxInactivityTime) {
        setIsInactive(true);
        // Optionnel : déconnecter automatiquement après inactivité
        // signOut({ callbackUrl: '/auth/login' });
      }
    }, 60000); // Vérifier toutes les minutes

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(inactivityCheck);
    };
  }, [session, lastActivity, maxInactivityTime, enableInactivityDetection]);

  // Rafraîchir la session automatiquement
  useEffect(() => {
    if (!enableAutoRefresh || !session || status !== 'authenticated') return;

    const refreshSession = async () => {
      try {
        await update();
        console.log('🔄 [AUTH] Session rafraîchie automatiquement');
      } catch (error) {
        console.error('❌ [AUTH] Erreur lors du rafraîchissement de la session:', error);
      }
    };

    const interval = setInterval(refreshSession, refreshInterval);

    return () => clearInterval(interval);
  }, [session, status, enableAutoRefresh, refreshInterval, update]);

  // Vérifier la validité du token
  useEffect(() => {
    if (!session?.user) return;

    const checkTokenValidity = async () => {
      try {
        const response = await fetch('/api/auth/session');
        
        // Vérifier si la réponse est OK
        if (!response.ok) {
          console.log('🔒 [AUTH] Session invalide, déconnexion...');
          await signOut({ callbackUrl: '/' });
          return;
        }

        // Vérifier si la réponse a du contenu avant de parser
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.log('🔒 [AUTH] Réponse invalide, déconnexion...');
          await signOut({ callbackUrl: '/' });
          return;
        }

        // Vérifier si le body n'est pas vide
        const text = await response.text();
        if (!text || text.trim().length === 0) {
          console.log('🔒 [AUTH] Session vide, déconnexion...');
          await signOut({ callbackUrl: '/' });
          return;
        }

        // Parser le JSON seulement si on a du contenu valide
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('❌ [AUTH] Erreur de parsing JSON:', parseError);
          await signOut({ callbackUrl: '/' });
          return;
        }

        if (!data || !data.user) {
          console.log('🔒 [AUTH] Token expiré, déconnexion...');
          await signOut({ callbackUrl: '/' });
        }
      } catch (error) {
        console.error('❌ [AUTH] Erreur lors de la vérification du token:', error);
        // En cas d'erreur réseau ou autre, ne pas déconnecter automatiquement
        // pour éviter les déconnexions intempestives
      }
    };

    // Vérifier toutes les 10 minutes
    const tokenCheckInterval = setInterval(checkTokenValidity, 10 * 60 * 1000);

    return () => clearInterval(tokenCheckInterval);
  }, [session]);

  // Sauvegarder l'état de connexion dans localStorage
  useEffect(() => {
    if (session?.user) {
      localStorage.setItem('basketstats_user_authenticated', 'true');
      localStorage.setItem('basketstats_user_id', session.user.id || '');
      localStorage.setItem('basketstats_user_role', session.user.role || '');
    } else {
      localStorage.removeItem('basketstats_user_authenticated');
      localStorage.removeItem('basketstats_user_id');
      localStorage.removeItem('basketstats_user_role');
    }
  }, [session]);

  // Restaurer la session au chargement de la page
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('basketstats_user_authenticated');
    
    if (isAuthenticated === 'true' && !session && status === 'unauthenticated') {
      // Forcer le rafraîchissement de la session
      window.location.reload();
    }
  }, [session, status]);

  // Fonction pour déconnecter manuellement
  const manualSignOut = async () => {
    // Nettoyer le localStorage
    localStorage.removeItem('basketstats_user_authenticated');
    localStorage.removeItem('basketstats_user_id');
    localStorage.removeItem('basketstats_user_role');
    
    // Déconnecter et rediriger vers la page d'accueil
    await signOut({ callbackUrl: '/' });
  };

  // Fonction pour prolonger la session
  const extendSession = async () => {
    try {
      await update();
      updateActivity();
      console.log('⏰ [AUTH] Session prolongée');
    } catch (error) {
      console.error('❌ [AUTH] Erreur lors de la prolongation de la session:', error);
    }
  };

  return {
    session,
    status,
    isInactive,
    lastActivity,
    updateActivity,
    manualSignOut,
    extendSession,
    isAuthenticated: !!session?.user
  };
}
