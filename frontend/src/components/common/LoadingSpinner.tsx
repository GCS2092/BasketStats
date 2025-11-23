'use client';

import { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  isLoading: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ 
  isLoading, 
  text = 'Chargement...', 
  size = 'md' 
}: LoadingSpinnerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!show) return null;

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center space-y-4">
        {/* Boule de basket qui tourne */}
        <div className="relative">
          <div className={`${sizeClasses[size]} text-orange-500 animate-spin`}>
            🏀
          </div>
          {/* Cercle de rotation */}
          <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin`}></div>
        </div>
        
        {/* Texte de chargement */}
        <p className={`${textSizeClasses[size]} text-gray-700 font-medium`}>
          {text}
        </p>
        
        {/* Barre de progression animée */}
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Composant pour les boutons avec état de chargement
export function LoadingButton({ 
  isLoading, 
  children, 
  className = '',
  ...props 
}: {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button 
      className={`relative ${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 text-white animate-spin">🏀</div>
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : ''}>
        {children}
      </span>
    </button>
  );
}

// Hook pour gérer l'état de chargement global
export function useLoading() {
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
    stopLoading,
    LoadingSpinner: () => <LoadingSpinner isLoading={isLoading} text={loadingText} />
  };
}