'use client';

import { useState, useEffect } from 'react';
import { usePersistentAuth } from '@/hooks/usePersistentAuth';

interface PersistentAuthIndicatorProps {
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}

export default function PersistentAuthIndicator({ 
  showOnMobile = true, 
  showOnDesktop = false 
}: PersistentAuthIndicatorProps) {
  const { isAuthenticated, isInactive, lastActivity, extendSession } = usePersistentAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [timeSinceActivity, setTimeSinceActivity] = useState(0);

  // Calculer le temps depuis la dernière activité
  useEffect(() => {
    const updateTimeSinceActivity = () => {
      const now = Date.now();
      const timeDiff = now - lastActivity;
      setTimeSinceActivity(Math.floor(timeDiff / 1000)); // en secondes
    };

    updateTimeSinceActivity();
    const interval = setInterval(updateTimeSinceActivity, 1000);

    return () => clearInterval(interval);
  }, [lastActivity]);

  // Afficher l'indicateur si inactif depuis plus de 5 minutes
  useEffect(() => {
    if (isInactive && timeSinceActivity > 300) { // 5 minutes
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isInactive, timeSinceActivity]);

  // Vérifier la visibilité selon l'écran
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      const shouldShow = isMobile ? showOnMobile : showOnDesktop;
      
      if (!shouldShow) {
        setIsVisible(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [showOnMobile, showOnDesktop]);

  if (!isAuthenticated || !isVisible) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-lg p-4 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-orange-600 text-sm">⏰</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-neutral-800 mb-1">
              Session active
            </h4>
            <p className="text-xs text-neutral-600 mb-3">
              Inactif depuis {formatTime(timeSinceActivity)}
            </p>
            
            <button
              onClick={extendSession}
              className="w-full bg-blue-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Prolonger la session
            </button>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
