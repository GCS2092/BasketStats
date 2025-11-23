'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api/client';
import PlanChangeModal from './PlanChangeModal';

interface SubscriptionPlan {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  duration: number;
  features: {
    maxClubs: number | null;
    maxPlayers: number | null;
    posts: number;
    canCreateEvents: boolean;
    canAccessAdvancedStats: boolean;
    canCreateContracts: boolean;
    priority: boolean;
    customBranding?: boolean;
    apiAccess?: boolean;
  };
}

interface CurrentSubscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string | null;
  plan: SubscriptionPlan;
}

export default function SubscriptionManagement() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);

  // Détecter les retours de paiement et rafraîchir les données
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const paymentCancel = searchParams.get('payment_cancel');
    
    if (paymentSuccess === 'true') {
      console.log('🔄 [SUBSCRIPTION] Retour de paiement réussi détecté, rafraîchissement des données...');
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    } else if (paymentCancel === 'true') {
      console.log('🔄 [SUBSCRIPTION] Retour de paiement annulé détecté');
    }
  }, [searchParams, queryClient]);

  // Récupérer les plans disponibles
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await apiClient.get('/subscriptions/plans');
      return response.data;
    },
  });

  // Récupérer l'abonnement actuel
  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: async () => {
      const response = await apiClient.get('/subscriptions/current');
      return response.data;
    },
    enabled: !!session?.user?.id,
  });

  // Mutation pour créer un nouvel abonnement
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiClient.post('/subscriptions/create', {
        planId,
        paymentMethod: 'mobile_money'
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la création de l\'abonnement:', error);
    }
  });

  // Mutation pour changer de plan
  const changePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      console.log('🔄 Tentative de changement de plan vers:', planId);
      try {
        const response = await apiClient.post('/subscriptions/change-plan', {
          planId,
          paymentMethod: 'mobile_money'
        });
        console.log('✅ Réponse du backend (succès):', response);
        return response.data;
      } catch (error) {
        console.log('❌ Erreur détaillée du backend:');
        console.log('   - Status:', error.response?.status);
        console.log('   - Status Text:', error.response?.statusText);
        console.log('   - Headers:', error.response?.headers);
        console.log('   - Data:', error.response?.data);
        console.log('   - Message:', error.message);
        console.log('   - Code:', error.code);
        console.log('   - Stack:', error.stack);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Changement de plan réussi:', data);
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      setIsChangingPlan(false);
    },
    onError: (error) => {
      console.error('❌ Erreur lors du changement de plan:', error);
      console.error('   - Response data:', error.response?.data);
      console.error('   - Response status:', error.response?.status);
      console.error('   - Full error object:', JSON.stringify(error, null, 2));
    }
  });

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    if (selectedPlan) {
      createSubscriptionMutation.mutate(selectedPlan);
    }
  };

  const handleChangePlan = () => {
    if (selectedPlan) {
      changePlanMutation.mutate(selectedPlan);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'EXPIRED': return 'text-red-600 bg-red-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'EXPIRED': return 'Expiré';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Abonnement actuel */}
      {currentSubscription && (
        <div className="card p-6 border-l-4 border-l-blue-500">
          <h2 className="text-xl font-bold mb-4">📋 Abonnement actuel</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg">{currentSubscription.plan.name}</h3>
              <p className="text-gray-600 mb-2">{currentSubscription.plan.description}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentSubscription.status)}`}>
                {getStatusText(currentSubscription.status)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(currentSubscription.plan.price)}
              </p>
              <p className="text-sm text-gray-500">
                {currentSubscription.plan.duration === 0 ? 'Permanent' : `par ${currentSubscription.plan.duration} jours`}
              </p>
              {currentSubscription.endDate && (
                <p className="text-sm text-gray-500">
                  Expire le {new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t flex justify-center">
            <button
              onClick={() => setShowPlanChangeModal(true)}
              className="btn btn-primary text-lg px-8 py-3"
            >
              🔄 Changer de plan
            </button>
          </div>
        </div>
      )}

      {/* Sélection de plan - Toujours afficher */}
      <div className="card p-6">
          <h2 className="text-xl font-bold mb-6">
            {currentSubscription ? '🔄 Changer de plan ou voir les autres options' : '📦 Choisir un plan d\'abonnement'}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans?.map((plan: SubscriptionPlan) => (
              <div
                key={plan.id}
                className={`card p-6 cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : currentSubscription && currentSubscription.plan.id === plan.id
                    ? 'ring-2 ring-green-500 bg-green-50'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                <div className="text-center">
                  {currentSubscription && currentSubscription.plan.id === plan.id && (
                    <div className="mb-2">
                      <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                        ✅ Plan actuel
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(plan.price)}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {plan.duration === 0 ? 'Permanent' : `par ${plan.duration} jours`}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Clubs:</span>
                      <span className="font-semibold">
                        {plan.features.maxClubs === null ? 'Illimité' : plan.features.maxClubs}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Joueurs:</span>
                      <span className="font-semibold">
                        {plan.features.maxPlayers === null ? 'Illimité' : plan.features.maxPlayers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Posts:</span>
                      <span className="font-semibold">
                        {plan.features.posts === -1 ? 'Illimité' : plan.features.posts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Événements:</span>
                      <span className="font-semibold">
                        {plan.features.canCreateEvents ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stats avancées:</span>
                      <span className="font-semibold">
                        {plan.features.canAccessAdvancedStats ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contrats:</span>
                      <span className="font-semibold">
                        {plan.features.canCreateContracts ? '✅' : '❌'}
                      </span>
                    </div>
                    {plan.features.priority && (
                      <div className="flex justify-between">
                        <span>Priorité:</span>
                        <span className="font-semibold">✅</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div className="mt-6 text-center">
              <button
                onClick={currentSubscription ? handleChangePlan : handleSubscribe}
                disabled={createSubscriptionMutation.isPending || changePlanMutation.isPending}
                className="btn btn-primary text-lg px-8 py-3"
              >
                {createSubscriptionMutation.isPending || changePlanMutation.isPending
                  ? '⏳ Traitement...'
                  : currentSubscription
                  ? '🔄 Changer de plan'
                  : '💳 S\'abonner'
                }
              </button>
            </div>
          )}
        </div>

      {/* Informations de paiement */}
      <div className="card p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">💳 Méthodes de paiement acceptées</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <span>Orange Money</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <span>Wave</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span>Free Money</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Paiement sécurisé via PayTech. Vous serez redirigé vers la plateforme de paiement.
        </p>
      </div>

      {/* Modal de changement de plan */}
      <PlanChangeModal
        isOpen={showPlanChangeModal}
        onClose={() => setShowPlanChangeModal(false)}
        currentSubscription={currentSubscription}
        plans={plans || []}
      />
    </div>
  );
}
