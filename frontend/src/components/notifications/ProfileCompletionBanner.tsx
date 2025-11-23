'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Link from 'next/link';

interface ProfileCompletionData {
  isComplete: boolean;
  percentage: number;
  missingFields: string[];
  showNotification: boolean;
}

export default function ProfileCompletionBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: completionData, isLoading } = useQuery<ProfileCompletionData>({
    queryKey: ['profile-completion-banner'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/profile/completion-status');
      return response.data;
    },
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Vérifier si la bannière a été fermée
  useEffect(() => {
    const dismissed = localStorage.getItem('profile-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('profile-banner-dismissed', 'true');
  };

  if (isLoading || !completionData || !completionData.showNotification || isDismissed) {
    return null;
  }

  const { percentage, missingFields } = completionData;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">Profil incomplet</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {percentage}%
              </span>
            </div>
            
            <p className="text-xs text-orange-100 truncate">
              {missingFields.length > 0 
                ? `Ajoutez ${missingFields.slice(0, 2).join(', ')}${missingFields.length > 2 ? '...' : ''}`
                : 'Complétez votre profil pour être visible'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/profile"
            className="bg-white text-orange-600 text-xs font-medium py-1.5 px-3 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Compléter
          </Link>
          
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors p-1"
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
