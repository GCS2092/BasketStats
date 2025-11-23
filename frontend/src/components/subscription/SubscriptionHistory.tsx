'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import { 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  XCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface SubscriptionHistoryItem {
  id: string;
  status: string;
  startDate: string;
  endDate?: string;
  suspendedAt?: string;
  suspendedReason?: string;
  restoredAt?: string;
  plan: {
    id: string;
    name: string;
    type: string;
    price: number;
  };
}

interface SubscriptionHistoryProps {
  className?: string;
}

export default function SubscriptionHistory({ className = '' }: SubscriptionHistoryProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [restoreRequestReason, setRestoreRequestReason] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);

  // Récupérer l'historique des abonnements de l'utilisateur
  const { data: subscriptionHistory, isLoading } = useQuery({
    queryKey: ['subscription-history', session?.user?.id],
    queryFn: async () => {
      const response = await apiClient.get(`/subscriptions/restore/history/${session?.user?.id}`);
      return response.data as SubscriptionHistoryItem[];
    },
    enabled: !!session?.user?.id,
  });

  // Demander la restauration d'un abonnement
  const requestRestoreMutation = useMutation({
    mutationFn: async ({ subscriptionId, reason }: { subscriptionId: string; reason: string }) => {
      // Ici on pourrait créer un système de tickets ou de demandes
      // Pour l'instant, on simule une demande
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Demande de restauration:', { subscriptionId, reason });
    },
    onSuccess: () => {
      setSelectedSubscription(null);
      setRestoreRequestReason('');
      alert('Votre demande de restauration a été envoyée. Un administrateur vous contactera bientôt.');
    },
  });

  const handleRequestRestore = (subscriptionId: string) => {
    if (!restoreRequestReason.trim()) {
      alert('Veuillez indiquer une raison pour la restauration');
      return;
    }
    requestRestoreMutation.mutate({ subscriptionId, reason: restoreRequestReason });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'SUSPENDED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'EXPIRED':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif';
      case 'SUSPENDED':
        return 'Suspendu';
      case 'EXPIRED':
        return 'Expiré';
      case 'CANCELLED':
        return 'Annulé';
      case 'PENDING':
        return 'En attente';
      case 'TRIAL':
        return 'Essai';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-700';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 p-6 ${className}`}>
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
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <ClockIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-neutral-800">Historique des Abonnements</h2>
        </div>
        <p className="text-neutral-600 mt-2">
          Consultez l'historique de vos abonnements et demandez une restauration si nécessaire.
        </p>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {subscriptionHistory?.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Aucun historique</h3>
            <p className="text-neutral-600">Vous n'avez pas encore d'abonnements.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptionHistory?.map((subscription) => (
              <div
                key={subscription.id}
                className={`border rounded-lg p-4 ${
                  subscription.status === 'SUSPENDED' 
                    ? 'border-red-200 bg-red-50' 
                    : subscription.status === 'ACTIVE'
                    ? 'border-green-200 bg-green-50'
                    : 'border-neutral-200 bg-neutral-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Icône de statut */}
                    <div className="mt-1">
                      {getStatusIcon(subscription.status)}
                    </div>

                    {/* Informations */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-neutral-800">
                          {subscription.plan.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                          {getStatusText(subscription.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Début: {new Date(subscription.startDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {subscription.endDate && (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Fin: {new Date(subscription.endDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Prix:</span>
                          <span>{subscription.plan.price}€</span>
                        </div>
                      </div>

                      {/* Informations de suspension */}
                      {subscription.status === 'SUSPENDED' && subscription.suspendedReason && (
                        <div className="mt-3 p-3 bg-white rounded border border-red-200">
                          <div className="flex items-center gap-2 mb-1">
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-red-700">Raison de suspension:</span>
                          </div>
                          <p className="text-sm text-red-600">{subscription.suspendedReason}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                            <ClockIcon className="h-3 w-3" />
                            <span>Suspendu le {new Date(subscription.suspendedAt!).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      )}

                      {/* Informations de restauration */}
                      {subscription.restoredAt && (
                        <div className="mt-3 p-3 bg-white rounded border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700">Restauration:</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <ClockIcon className="h-3 w-3" />
                            <span>Restauré le {new Date(subscription.restoredAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {subscription.status === 'SUSPENDED' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedSubscription(subscription.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        Demander restauration
                      </button>
                    </div>
                  )}
                </div>

                {/* Modal de demande de restauration */}
                {selectedSubscription === subscription.id && (
                  <div className="mt-4 p-4 bg-white border border-neutral-200 rounded-lg">
                    <h4 className="font-medium text-neutral-800 mb-3">Demande de restauration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Expliquez pourquoi votre abonnement devrait être restauré
                        </label>
                        <textarea
                          value={restoreRequestReason}
                          onChange={(e) => setRestoreRequestReason(e.target.value)}
                          placeholder="Décrivez votre situation et pourquoi vous souhaitez que votre abonnement soit restauré..."
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestRestore(subscription.id)}
                          disabled={requestRestoreMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 rounded-lg transition-colors"
                        >
                          {requestRestoreMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubscription(null);
                            setRestoreRequestReason('');
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
