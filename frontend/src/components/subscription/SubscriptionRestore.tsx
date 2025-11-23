'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface SuspendedSubscription {
  id: string;
  status: string;
  suspendedAt: string;
  suspendedReason: string;
  restoredAt?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  plan: {
    id: string;
    name: string;
    type: string;
    price: number;
  };
}

interface SubscriptionRestoreProps {
  className?: string;
}

export default function SubscriptionRestore({ className = '' }: SubscriptionRestoreProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [restoreReason, setRestoreReason] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);

  // Récupérer les abonnements suspendus
  const { data: suspendedSubscriptions, isLoading } = useQuery({
    queryKey: ['suspended-subscriptions'],
    queryFn: async () => {
      const response = await apiClient.get('/subscriptions/restore/suspended');
      return response.data as SuspendedSubscription[];
    },
    enabled: session?.user?.role === 'ADMIN',
  });

  // Restaurer un abonnement
  const restoreMutation = useMutation({
    mutationFn: async ({ subscriptionId, reason }: { subscriptionId: string; reason: string }) => {
      await apiClient.put(`/subscriptions/restore/restore/${subscriptionId}`, {
        restoreReason: reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suspended-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setSelectedSubscription(null);
      setRestoreReason('');
    },
  });

  // Suspendre un abonnement
  const suspendMutation = useMutation({
    mutationFn: async ({ subscriptionId, reason }: { subscriptionId: string; reason: string }) => {
      await apiClient.post(`/subscriptions/restore/suspend/${subscriptionId}`, {
        reason: reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suspended-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const handleRestore = (subscriptionId: string) => {
    if (!restoreReason.trim()) {
      alert('Veuillez indiquer une raison de restauration');
      return;
    }
    restoreMutation.mutate({ subscriptionId, reason: restoreReason });
  };

  const handleSuspend = (subscriptionId: string) => {
    const reason = prompt('Raison de la suspension:');
    if (reason) {
      suspendMutation.mutate({ subscriptionId, reason });
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 p-6 ${className}`}>
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">Accès non autorisé</h3>
          <p className="text-neutral-600">Seuls les administrateurs peuvent accéder à cette fonctionnalité.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <ArrowPathIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-neutral-800">Restauration des Abonnements</h2>
        </div>
        <p className="text-neutral-600 mt-2">
          Gérez les abonnements suspendus et restaurez-les si nécessaire.
        </p>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg">
                <div className="w-12 h-12 bg-neutral-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : suspendedSubscriptions?.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Aucun abonnement suspendu</h3>
            <p className="text-neutral-600">Tous les abonnements sont actifs.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suspendedSubscriptions?.map((subscription) => (
              <div
                key={subscription.id}
                className="border border-red-200 rounded-lg p-4 bg-red-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar utilisateur */}
                    <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>

                    {/* Informations */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-neutral-800">
                          {subscription.user.fullName}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          {subscription.user.role}
                        </span>
                      </div>
                      
                      <p className="text-sm text-neutral-600 mb-2">
                        {subscription.user.email}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Plan:</span>
                          <span className="text-blue-600">{subscription.plan.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Prix:</span>
                          <span>{subscription.plan.price}€</span>
                        </div>
                      </div>

                      <div className="mt-2 p-3 bg-white rounded border border-red-200">
                        <div className="flex items-center gap-2 mb-1">
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-red-700">Raison de suspension:</span>
                        </div>
                        <p className="text-sm text-red-600">{subscription.suspendedReason}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                          <ClockIcon className="h-3 w-3" />
                          <span>Suspendu le {new Date(subscription.suspendedAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedSubscription(subscription.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Restaurer
                    </button>
                  </div>
                </div>

                {/* Modal de restauration */}
                {selectedSubscription === subscription.id && (
                  <div className="mt-4 p-4 bg-white border border-neutral-200 rounded-lg">
                    <h4 className="font-medium text-neutral-800 mb-3">Restauration de l'abonnement</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Raison de la restauration
                        </label>
                        <textarea
                          value={restoreReason}
                          onChange={(e) => setRestoreReason(e.target.value)}
                          placeholder="Expliquez pourquoi cet abonnement est restauré..."
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(subscription.id)}
                          disabled={restoreMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-neutral-300 rounded-lg transition-colors"
                        >
                          {restoreMutation.isPending ? 'Restauration...' : 'Confirmer la restauration'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubscription(null);
                            setRestoreReason('');
                          }}
                          className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
