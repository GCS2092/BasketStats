'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import Link from 'next/link';

interface SubscriptionLimits {
  posts: {
    current: number;
    max: number;
    percentage: number;
  };
  clubs: {
    current: number;
    max: number;
    percentage: number;
  };
  players: {
    current: number;
    max: number;
    percentage: number;
  };
  plan: {
    name: string;
    type: string;
  };
}

interface SubscriptionLimitsWarningProps {
  className?: string;
}

function SubscriptionLimitsWarning({ className = '' }: SubscriptionLimitsWarningProps) {
  const { data: session } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState<'posts' | 'clubs' | 'players' | null>(null);

  // Récupérer les limites d'abonnement
  const { data: limits, isLoading } = useQuery({
    queryKey: ['subscription-limits'],
    queryFn: async () => {
      const response = await apiClient.get('/subscriptions/limits');
      return response.data as SubscriptionLimits;
    },
    enabled: !!session,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  // Vérifier si des avertissements doivent être affichés
  useEffect(() => {
    if (!limits) return;

    const { posts, clubs, players } = limits;

    // Vérifier les posts (avertissement à 80% et 100%)
    if (posts.percentage >= 100) {
      setWarningType('posts');
      setShowWarning(true);
    } else if (posts.percentage >= 80) {
      setWarningType('posts');
      setShowWarning(true);
    }
    // Vérifier les clubs (avertissement à 80% et 100%)
    else if (clubs.percentage >= 100) {
      setWarningType('clubs');
      setShowWarning(true);
    } else if (clubs.percentage >= 80) {
      setWarningType('clubs');
      setShowWarning(true);
    }
    // Vérifier les joueurs (avertissement à 80% et 100%)
    else if (players.percentage >= 100) {
      setWarningType('players');
      setShowWarning(true);
    } else if (players.percentage >= 80) {
      setWarningType('players');
      setShowWarning(true);
    } else {
      setShowWarning(false);
      setWarningType(null);
    }
  }, [limits]);

  if (isLoading || !limits || !showWarning) {
    return null;
  }

  const getWarningData = () => {
    switch (warningType) {
      case 'posts':
        return {
          icon: '📝',
          title: 'Limite de posts atteinte',
          message: `Vous avez utilisé ${limits.posts.current}/${limits.posts.max} posts de votre plan ${limits.plan.name}`,
          action: 'Créer plus de posts',
          color: limits.posts.percentage >= 100 ? 'red' : 'orange',
        };
      case 'clubs':
        return {
          icon: '🏀',
          title: 'Limite de clubs atteinte',
          message: `Vous gérez ${limits.clubs.current}/${limits.clubs.max} clubs avec votre plan ${limits.plan.name}`,
          action: 'Gérer plus de clubs',
          color: limits.clubs.percentage >= 100 ? 'red' : 'orange',
        };
      case 'players':
        return {
          icon: '👥',
          title: 'Limite de joueurs atteinte',
          message: `Vous avez ${limits.players.current}/${limits.players.max} joueurs avec votre plan ${limits.plan.name}`,
          action: 'Ajouter plus de joueurs',
          color: limits.players.percentage >= 100 ? 'red' : 'orange',
        };
      default:
        return null;
    }
  };

  const warningData = getWarningData();
  if (!warningData) return null;

  const isLimitReached = warningData.color === 'red';
  const bgColor = isLimitReached ? 'bg-red-50' : 'bg-orange-50';
  const borderColor = isLimitReached ? 'border-red-200' : 'border-orange-200';
  const textColor = isLimitReached ? 'text-red-800' : 'text-orange-800';
  const buttonColor = isLimitReached ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700';

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 ${className}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="text-2xl sm:text-3xl flex-shrink-0">
          {warningData.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg sm:text-xl font-bold ${textColor} mb-2`}>
            {isLimitReached ? '🚨 ' : '⚠️ '}{warningData.title}
          </h3>
          
          <p className={`text-sm sm:text-base ${textColor} mb-4`}>
            {warningData.message}
          </p>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs sm:text-sm font-medium ${textColor}`}>
                Utilisation
              </span>
              <span className={`text-xs sm:text-sm font-bold ${textColor}`}>
                {limits[warningType].percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLimitReached ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(limits[warningType].percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link
              href="/subscription"
              className={`${buttonColor} text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-center text-sm sm:text-base transition-all duration-200 hover:shadow-lg transform hover:scale-105`}
            >
              🚀 Passer au plan supérieur
            </Link>
            
            <button
              onClick={() => setShowWarning(false)}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm sm:text-base underline"
            >
              Fermer cet avertissement
            </button>
          </div>

          {/* Message d'encouragement */}
          <div className={`mt-3 p-3 rounded-lg ${isLimitReached ? 'bg-red-100' : 'bg-orange-100'}`}>
            <p className={`text-xs sm:text-sm ${textColor} text-center`}>
              {isLimitReached 
                ? '🔒 Vous avez atteint la limite de votre plan actuel. Passez à un plan supérieur pour continuer !'
                : '💡 Vous approchez de la limite de votre plan. Pensez à passer à un plan supérieur pour plus de flexibilité !'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher les limites dans le dashboard
export function SubscriptionLimitsDashboard() {
  const { data: session } = useSession();

  const { data: limits, isLoading } = useQuery({
    queryKey: ['subscription-limits-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/subscriptions/limits');
      return response.data as SubscriptionLimits;
    },
    enabled: !!session,
  });

  if (isLoading || !limits) {
    return (
      <div className="card p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const limitsData = [
    {
      name: 'Posts',
      icon: '📝',
      current: limits.posts.current,
      max: limits.posts.max,
      percentage: limits.posts.percentage,
      color: limits.posts.percentage >= 100 ? 'red' : limits.posts.percentage >= 80 ? 'orange' : 'green',
    },
    {
      name: 'Clubs',
      icon: '🏀',
      current: limits.clubs.current,
      max: limits.clubs.max,
      percentage: limits.clubs.percentage,
      color: limits.clubs.percentage >= 100 ? 'red' : limits.clubs.percentage >= 80 ? 'orange' : 'green',
    },
    {
      name: 'Joueurs',
      icon: '👥',
      current: limits.players.current,
      max: limits.players.max,
      percentage: limits.players.percentage,
      color: limits.players.percentage >= 100 ? 'red' : limits.players.percentage >= 80 ? 'orange' : 'green',
    },
  ];

  return (
    <div className="card p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
        📊 Utilisation de votre abonnement
      </h3>
      
      <div className="space-y-4">
        {limitsData.map((limit) => (
          <div key={limit.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{limit.icon}</span>
                <span className="font-medium text-sm sm:text-base">{limit.name}</span>
              </div>
              <span className={`text-sm font-semibold ${
                limit.color === 'red' ? 'text-red-600' : 
                limit.color === 'orange' ? 'text-orange-600' : 
                'text-green-600'
              }`}>
                {limit.current}/{limit.max === -1 ? '∞' : limit.max}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  limit.color === 'red' ? 'bg-red-500' : 
                  limit.color === 'orange' ? 'bg-orange-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(limit.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <Link
          href="/subscription"
          className="btn btn-primary text-sm sm:text-base w-full sm:w-auto"
        >
          🚀 Gérer mon abonnement
        </Link>
      </div>
    </div>
  );
}

export default SubscriptionLimitsWarning;
