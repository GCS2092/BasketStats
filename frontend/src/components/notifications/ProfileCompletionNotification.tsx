'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Link from 'next/link';

interface ProfileCompletionData {
  isComplete: boolean;
  percentage: number;
  missingFields: string[];
  suggestions: {
    priority: string[];
    optional: string[];
    tips: string[];
  };
  showNotification: boolean;
}

export default function ProfileCompletionNotification() {
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: completionData, isLoading } = useQuery<ProfileCompletionData>({
    queryKey: ['profile-completion'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/profile/completion-status');
      return response.data;
    },
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Vérifier si la notification a été fermée dans le localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('profile-completion-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('profile-completion-dismissed', 'true');
  };

  const handleCompleteProfile = () => {
    // Marquer comme complété temporairement pour cette session
    localStorage.setItem('profile-completion-dismissed', 'true');
    setIsDismissed(true);
  };

  if (isLoading || !completionData || !completionData.showNotification || isDismissed) {
    return null;
  }

  const { percentage, suggestions, missingFields } = completionData;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg border border-orange-200 p-4 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Complétez votre profil</h3>
              <p className="text-xs text-orange-100">Profitez pleinement de la plateforme</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Barre de progression */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Progression</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Champs manquants prioritaires */}
        {suggestions.priority.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium mb-1">Champs prioritaires :</p>
            <div className="flex flex-wrap gap-1">
              {suggestions.priority.slice(0, 3).map((field, index) => (
                <span 
                  key={index}
                  className="text-xs bg-white/20 px-2 py-1 rounded-full"
                >
                  {field}
                </span>
              ))}
              {suggestions.priority.length > 3 && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  +{suggestions.priority.length - 3} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Conseils */}
        {suggestions.tips.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-orange-100">
              💡 {suggestions.tips[0]}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href="/profile"
            onClick={handleCompleteProfile}
            className="flex-1 bg-white text-orange-600 text-xs font-medium py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors text-center"
          >
            Compléter maintenant
          </Link>
          <button
            onClick={handleDismiss}
            className="text-xs text-white/80 hover:text-white transition-colors px-2 py-2"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
