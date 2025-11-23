'use client';

import { useState } from 'react';
import { usePersistentAuth } from '@/hooks/usePersistentAuth';

interface PersistentLogoutButtonProps {
  className?: string;
  showConfirmation?: boolean;
  variant?: 'button' | 'icon' | 'text';
}

export default function PersistentLogoutButton({ 
  className = '',
  showConfirmation = true,
  variant = 'button'
}: PersistentLogoutButtonProps) {
  const { manualSignOut, isAuthenticated } = usePersistentAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    if (showConfirmation && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    try {
      await manualSignOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleLogout}
          className={`p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${className}`}
          title="Déconnexion"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

        {showConfirm && (
          <div className="absolute right-0 top-12 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 z-50 min-w-48">
            <p className="text-sm text-neutral-700 mb-3">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white text-xs py-2 px-3 rounded hover:bg-red-600 transition-colors"
              >
                Déconnexion
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-neutral-200 text-neutral-700 text-xs py-2 px-3 rounded hover:bg-neutral-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        className={`text-sm text-red-600 hover:text-red-700 hover:underline transition-colors ${className}`}
      >
        Déconnexion
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleLogout}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${className}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Déconnexion
      </button>

      {showConfirm && (
        <div className="absolute right-0 top-12 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 z-50 min-w-64">
          <h4 className="font-semibold text-neutral-800 mb-2">Confirmer la déconnexion</h4>
          <p className="text-sm text-neutral-600 mb-4">
            Vous serez déconnecté de votre compte. Vous devrez vous reconnecter pour accéder à vos données.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-500 text-white text-sm py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Oui, me déconnecter
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-neutral-200 text-neutral-700 text-sm py-2 px-4 rounded-lg hover:bg-neutral-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
