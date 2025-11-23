'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { FALLBACK_PLANS } from '../../data/fallback-plans';

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

export default function PlanSelection() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Récupérer les plans disponibles
  const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      console.log(`📡 [FRONTEND] Récupération des plans d'abonnement...`);
      console.log(`📡 [FRONTEND] URL API: /subscriptions/plans`);
      
      const response = await apiClient.get('/subscriptions/plans');
      
      console.log(`📡 [FRONTEND] Plans récupérés:`, response.data);
      console.log(`📡 [FRONTEND] Nombre de plans: ${response.data?.length || 0}`);
      
      return response.data;
    },
    retry: 1, // Essayer seulement une fois
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation pour créer un abonnement
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      console.log(`📡 [FRONTEND] Création d'abonnement pour le plan: ${planId}`);
      
      const response = await apiClient.post('/subscriptions/create', {
        planId,
      });
      
      console.log(`📡 [FRONTEND] Abonnement créé:`, response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(`✅ [FRONTEND] Abonnement créé avec succès:`, data);
      
      // Invalider les requêtes liées aux abonnements
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      
      // Rediriger vers la page de paiement PayTech
      if (data.paymentUrl) {
        console.log(`🔄 [FRONTEND] Redirection vers PayTech: ${data.paymentUrl}`);
        window.location.href = data.paymentUrl;
      } else {
        console.error(`❌ [FRONTEND] URL de paiement manquante dans la réponse:`, data);
        alert('Erreur: URL de paiement manquante. Veuillez réessayer.');
      }
    },
    onError: (error: any) => {
      console.error(`❌ [FRONTEND] Erreur lors de la création de l'abonnement:`, error);
      
      let errorMessage = 'Une erreur est survenue lors de la création de l\'abonnement.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Erreur: ${errorMessage}`);
    },
  });

  // Fonction pour formater le prix
  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit';
    return `${price} FCFA`;
  };

  // Fonction pour gérer la sélection d'un plan
  const handleSelectPlan = (planId: string) => {
    console.log(`🎯 [FRONTEND] Plan sélectionné: ${planId}`);
    setSelectedPlan(planId);
  };

  // Fonction pour gérer l'abonnement
  const handleSubscribe = () => {
    if (!selectedPlan) {
      alert('Veuillez sélectionner un plan d\'abonnement.');
      return;
    }

    if (!session?.user) {
      alert('Vous devez être connecté pour vous abonner.');
      return;
    }

    console.log(`🚀 [FRONTEND] Début de l'abonnement pour le plan: ${selectedPlan}`);
    createSubscriptionMutation.mutate(selectedPlan);
  };

  // Utiliser les plans de fallback si l'API ne fonctionne pas
  const displayPlans = plans && plans.length > 0 ? plans : FALLBACK_PLANS;
  const isUsingFallback = !plans || plans.length === 0;
  
  if (plansLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="card p-6 sm:p-8 text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Chargement des plans d'abonnement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container-custom py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              🎯 Choisissez votre plan d'abonnement
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto">
              Sélectionnez le plan qui correspond le mieux à vos besoins et commencez à développer votre réseau de basket-ball.
            </p>
          </div>

          {/* Avertissement si utilisation des plans de fallback */}
          {isUsingFallback && (
            <div className="mb-6 sm:mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-yellow-600 text-2xl mr-2">⚠️</span>
                  <h3 className="text-yellow-800 font-semibold text-sm sm:text-base">
                    Mode hors ligne
                  </h3>
                </div>
                <p className="text-yellow-700 text-xs sm:text-sm">
                  Les plans d'abonnement sont temporairement indisponibles. Les prix affichés sont indicatifs.
                </p>
              </div>
            </div>
          )}

          {/* Plans d'abonnement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 px-4 sm:px-0">
            {displayPlans?.map((plan: SubscriptionPlan) => (
              <div key={plan.id} className="relative">
                <div
                  className={`card p-4 sm:p-6 lg:p-8 cursor-pointer transition-all duration-300 relative ${
                    selectedPlan === plan.id
                      ? 'ring-4 ring-blue-500 bg-blue-50 transform scale-105 shadow-2xl'
                      : 'hover:shadow-xl hover:transform hover:scale-105'
                  } ${
                    plan.type === 'PROFESSIONAL' ? 'border-2 border-yellow-400 shadow-lg' : ''
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.type === 'PROFESSIONAL' && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-yellow-900 px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold">
                        ⭐ POPULAIRE
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{plan.description}</p>
                    
                    <div className="mb-4 sm:mb-6">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600">
                        {formatPrice(plan.price)}
                      </span>
                      <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm">
                        {plan.duration === 0 ? 'Permanent' : `par ${plan.duration} jours`}
                      </p>
                    </div>

                    {/* Fonctionnalités */}
                    <div className="space-y-2 sm:space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">Clubs:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {plan.features.maxClubs === null ? 'Illimité' : plan.features.maxClubs}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">Joueurs:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {plan.features.maxPlayers === null ? 'Illimité' : plan.features.maxPlayers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">Posts:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {plan.features.posts === -1 ? 'Illimité' : plan.features.posts}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">Événements:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {plan.features.canCreateEvents ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">Stats avancées:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {plan.features.canAccessAdvancedStats ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">Contrats:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {plan.features.canCreateContracts ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">Priorité:</span>
                        <span className="font-semibold text-xs sm:text-sm">
                          {plan.features.priority ? '✅' : '❌'}
                        </span>
                      </div>
                      {plan.features.customBranding && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm">Marque personnalisée:</span>
                          <span className="font-semibold text-xs sm:text-sm">✅</span>
                        </div>
                      )}
                      {plan.features.apiAccess && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm">Accès API:</span>
                          <span className="font-semibold text-xs sm:text-sm">✅</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Bouton de sélection - Apparaît sous le plan sélectionné */}
                  {selectedPlan === plan.id && (
                    <div className="mt-4 sm:mt-6">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 sm:p-6 shadow-2xl border-4 border-blue-300">
                        <div className="text-center mb-4">
                          <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                            🎯 Plan sélectionné !
                          </h3>
                          <p className="text-blue-100 text-xs sm:text-sm">
                            Vous êtes sur le point de choisir ce plan d'abonnement
                          </p>
                        </div>
                        
                        <button
                          onClick={handleSubscribe}
                          disabled={createSubscriptionMutation.isPending}
                          className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-h-[50px] flex items-center justify-center gap-2 sm:gap-3"
                        >
                          {createSubscriptionMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                              <span className="text-sm sm:text-base">⏳ Redirection vers le paiement...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xl sm:text-2xl">💳</span>
                              <span>Choisir ce plan maintenant</span>
                            </>
                          )}
                        </button>
                        
                        <p className="text-blue-100 text-xs mt-3 text-center">
                          🔒 Paiement 100% sécurisé via PayTech
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Informations de paiement */}
          <div className="card p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 mx-4 sm:mx-0">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                💳 Paiement sécurisé
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Paiement 100% sécurisé via PayTech
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <span className="text-green-600 text-xl sm:text-2xl">🔒</span>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Sécurisé</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Chiffrement SSL</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <span className="text-blue-600 text-xl sm:text-2xl">⚡</span>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Rapide</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Activation immédiate</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <span className="text-purple-600 text-xl sm:text-2xl">🛡️</span>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Fiable</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Support 24/7</p>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-gray-600 text-xs sm:text-sm mb-4">
                Besoin d'aide pour choisir votre plan ?
              </p>
              <button
                onClick={() => alert('Contactez-nous à support@basketstats.com')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base underline"
              >
                Contactez notre support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}