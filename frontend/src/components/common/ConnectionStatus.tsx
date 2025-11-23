'use client';

import { useState, useEffect } from 'react';
import { 
  WifiIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface ConnectionStatusProps {
  backendUrl?: string;
}

export default function ConnectionStatus({ 
  backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api' 
}: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    // Vérifier la connexion internet
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier la connexion au backend
    const checkBackend = async () => {
      try {
        const response = await fetch(`${backendUrl}/posts`, {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        });
        setBackendOnline(response.ok);
        setLastCheck(new Date());
      } catch (error) {
        setBackendOnline(false);
        setLastCheck(new Date());
      }
    };

    // Vérification initiale
    checkBackend();
    
    // Vérifier toutes les 30 secondes (désactivé temporairement)
    // const interval = setInterval(checkBackend, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      // clearInterval(interval);
    };
  }, [backendUrl]);

  // Ne pas afficher si tout est OK
  if (isOnline && backendOnline && !showStatus) return null;

  const getStatusIcon = () => {
    if (!isOnline) return <XCircleIcon className="w-5 h-5 text-red-500" />;
    if (!backendOnline) return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
  };

  const getStatusMessage = () => {
    if (!isOnline) return 'Hors ligne - Vérifiez votre connexion internet';
    if (!backendOnline) return 'Serveur indisponible - Tentative de reconnexion...';
    return 'Connexion rétablie !';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-50 border-red-200 text-red-800';
    if (!backendOnline) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'bg-green-50 border-green-200 text-green-800';
  };

  return (
    <div className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
      showStatus ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`max-w-sm p-4 rounded-lg border shadow-lg ${getStatusColor()}`}>
        <div className="flex items-start space-x-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {getStatusMessage()}
            </p>
            {lastCheck && (
              <p className="text-xs mt-1 opacity-75">
                Dernière vérification: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowStatus(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher le statut dans la barre de navigation
export function ConnectionIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier le backend
    const checkBackend = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/posts`, {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        setBackendOnline(response.ok);
      } catch {
        setBackendOnline(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && backendOnline) return null;

  return (
    <div className="flex items-center space-x-1">
      <WifiIcon className={`w-4 h-4 ${
        !isOnline ? 'text-red-500' : 
        !backendOnline ? 'text-yellow-500' : 
        'text-green-500'
      }`} />
      <span className={`text-xs ${
        !isOnline ? 'text-red-500' : 
        !backendOnline ? 'text-yellow-500' : 
        'text-green-500'
      }`}>
        {!isOnline ? 'Hors ligne' : 'Serveur'}
      </span>
    </div>
  );
}