'use client';

import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType?: string;
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    isSlowConnection: false,
  });

  useEffect(() => {
    // Fonction pour détecter le type de connexion
    const getConnectionType = (): string => {
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        return connection?.effectiveType || 'unknown';
      }
      return 'unknown';
    };

    // Fonction pour vérifier si la connexion est lente
    const isSlowConnection = (): boolean => {
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection?.effectiveType;
        return effectiveType === 'slow-2g' || effectiveType === '2g';
      }
      return false;
    };

    // Fonction pour mettre à jour le statut
    const updateNetworkStatus = () => {
      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection: isSlowConnection(),
        connectionType: getConnectionType(),
      });
    };

    // Mise à jour initiale
    updateNetworkStatus();

    // Écouter les changements de statut réseau
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouter les changements de type de connexion
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', updateNetworkStatus);
      }
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', updateNetworkStatus);
        }
      }
    };
  }, []);

  return networkStatus;
}
