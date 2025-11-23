'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

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

interface PlanChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription: CurrentSubscription | null;
  plans: SubscriptionPlan[];
}

export default function PlanChangeModal({ 
  isOpen, 
  onClose, 
  currentSubscription, 
  plans 
}: PlanChangeModalProps) {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
        console.log('   - Data:', error.response?.data);
        console.log('   - Message:', error.message);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Changement de plan réussi:', data);
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      setIsProcessing(false);
      onClose();
    },
    onError: (error) => {
      console.error('❌ Erreur lors du changement de plan:', error);
      setIsProcessing(false);
    }
  });

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleChangePlan = () => {
    if (selectedPlan) {
      setIsProcessing(true);
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

  const getFeatureIcon = (feature: boolean) => {
    return feature ? '✅' : '❌';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              🔄 Changer de plan d'abonnement
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isProcessing}
            >
              ×
            </button>
          </div>
          {currentSubscription && (
            <p className="text-gray-600 mt-2">
              Plan actuel : <span className="font-semibold">{currentSubscription.plan.name}</span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans?.map((plan: SubscriptionPlan) => (
              <div
                key={plan.id}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : currentSubscription && currentSubscription.plan.id === plan.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                <div className="text-center mb-4">
                  {currentSubscription && currentSubscription.plan.id === plan.id && (
                    <div className="mb-2">
                      <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                        ✅ Plan actuel
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(plan.price)}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {plan.duration === 0 ? 'Permanent' : `par ${plan.duration} jours`}
                  </p>
                </div>
                
                {/* Features */}
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
                      {getFeatureIcon(plan.features.canCreateEvents)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stats avancées:</span>
                    <span className="font-semibold">
                      {getFeatureIcon(plan.features.canAccessAdvancedStats)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contrats:</span>
                    <span className="font-semibold">
                      {getFeatureIcon(plan.features.canCreateContracts)}
                    </span>
                  </div>
                  {plan.features.priority && (
                    <div className="flex justify-between">
                      <span>Priorité:</span>
                      <span className="font-semibold">✅</span>
                    </div>
                  )}
                  {plan.features.customBranding && (
                    <div className="flex justify-between">
                      <span>Marque personnalisée:</span>
                      <span className="font-semibold">✅</span>
                    </div>
                  )}
                  {plan.features.apiAccess && (
                    <div className="flex justify-between">
                      <span>Accès API:</span>
                      <span className="font-semibold">✅</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          {selectedPlan && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleChangePlan}
                disabled={isProcessing || !selectedPlan}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Traitement...
                  </>
                ) : (
                  '🔄 Changer de plan'
                )}
              </button>
            </div>
          )}

          {/* Payment Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">💳 Méthodes de paiement acceptées</h3>
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
        </div>
      </div>
    </div>
  );
}
