'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface RestoreStats {
  totalSuspended: number;
  suspendedThisMonth: number;
  restoredThisMonth: number;
  reasons: Array<{
    reason: string;
    count: number;
  }>;
}

interface SubscriptionRestoreStatsProps {
  className?: string;
}

export default function SubscriptionRestoreStats({ className = '' }: SubscriptionRestoreStatsProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Récupérer les statistiques de restauration
  const { data: stats, isLoading } = useQuery({
    queryKey: ['subscription-restore-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/subscriptions/restore/stats');
      return response.data as RestoreStats;
    },
    enabled: session?.user?.role === 'ADMIN',
  });

  // Déclencher la restauration automatique
  const autoRestoreMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/subscriptions/restore/auto-restore');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-restore-stats'] });
      queryClient.invalidateQueries({ queryKey: ['suspended-subscriptions'] });
      alert('Restauration automatique déclenchée avec succès');
    },
  });

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-neutral-800">Statistiques de Restauration</h2>
          </div>
          <button
            onClick={() => autoRestoreMutation.mutate()}
            disabled={autoRestoreMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            {autoRestoreMutation.isPending ? 'Restauration...' : 'Restauration auto'}
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total suspendus */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700">Total Suspendus</p>
                <p className="text-2xl font-bold text-red-900">{stats?.totalSuspended || 0}</p>
              </div>
            </div>
          </div>

          {/* Suspendus ce mois */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-yellow-700">Suspendus ce mois</p>
                <p className="text-2xl font-bold text-yellow-900">{stats?.suspendedThisMonth || 0}</p>
              </div>
            </div>
          </div>

          {/* Restaurés ce mois */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-700">Restaurés ce mois</p>
                <p className="text-2xl font-bold text-green-900">{stats?.restoredThisMonth || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Raisons de suspension */}
        {stats?.reasons && stats.reasons.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Raisons de Suspension</h3>
            <div className="space-y-3">
              {stats.reasons.map((reason, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral-700">{reason.reason}</span>
                  <span className="text-sm text-neutral-500">{reason.count} abonnement(s)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucune donnée */}
        {(!stats?.reasons || stats.reasons.length === 0) && (
          <div className="text-center py-8">
            <ChartBarIcon className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
            <p className="text-neutral-500">Aucune donnée de suspension disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
