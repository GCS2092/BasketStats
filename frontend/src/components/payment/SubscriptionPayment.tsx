'use client';

import { useState } from 'react';
import { SubscriptionPayTechButton } from './PayTechButton';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
  planType: string;
}

interface SubscriptionPaymentProps {
  plans: SubscriptionPlan[];
  userInfo?: {
    phone_number: string;
    first_name: string;
    last_name: string;
  };
  onSuccess?: (plan: SubscriptionPlan) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}

export default function SubscriptionPayment({
  plans,
  userInfo,
  onSuccess,
  onError,
  onCancel,
  className = '',
}: SubscriptionPaymentProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = (data: any) => {
    setIsProcessing(false);
    if (selectedPlan) {
      onSuccess?.(selectedPlan);
    }
  };

  const handlePaymentError = (error: string) => {
    setIsProcessing(false);
    onError?.(error);
  };

  const handlePaymentCancel = () => {
    setIsProcessing(false);
    onCancel?.();
  };

  const handlePaymentStart = () => {
    setIsProcessing(true);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`
              relative bg-white rounded-lg shadow-md border-2 p-6 cursor-pointer transition-all duration-200
              ${selectedPlan?.id === plan.id 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
              }
              ${plan.popular ? 'ring-2 ring-yellow-200 border-yellow-300' : ''}
            `}
            onClick={() => handlePlanSelect(plan)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Populaire
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {plan.description}
              </p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price.toLocaleString()}
                </span>
                <span className="text-gray-600 ml-1">
                  {plan.currency}
                </span>
              </div>

              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`
                  w-full py-2 px-4 rounded-md font-medium transition-colors duration-200
                  ${selectedPlan?.id === plan.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanSelect(plan);
                }}
              >
                {selectedPlan?.id === plan.id ? 'Sélectionné' : 'Sélectionner'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Section */}
      {selectedPlan && (
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Finaliser votre abonnement
          </h3>

          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Plan sélectionné:</span>
              <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Prix:</span>
              <span className="font-semibold text-gray-900">
                {selectedPlan.price.toLocaleString()} {selectedPlan.currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Période:</span>
              <span className="font-semibold text-gray-900">Mensuel</span>
            </div>
          </div>

          <div className="space-y-4">
            <SubscriptionPayTechButton
              planType={selectedPlan.planType}
              planName={selectedPlan.name}
              planDescription={selectedPlan.description}
              itemPrice={selectedPlan.price}
              currency={selectedPlan.currency}
              enableAutofill={!!userInfo}
              userInfo={userInfo}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
              className="w-full"
              disabled={isProcessing}
              loading={isProcessing}
            />

            <button
              onClick={() => setSelectedPlan(null)}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              disabled={isProcessing}
            >
              Changer de plan
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>
              🔒 Paiement sécurisé par PayTech. Annulation possible à tout moment.
            </p>
            <p className="mt-1">
              Votre abonnement sera activé immédiatement après le paiement.
            </p>
          </div>
        </div>
      )}

      {/* Payment Methods Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Méthodes de paiement acceptées
        </h4>
        <div className="flex flex-wrap gap-2 text-xs text-blue-700">
          <span className="bg-blue-100 px-2 py-1 rounded">Orange Money</span>
          <span className="bg-blue-100 px-2 py-1 rounded">Wave</span>
          <span className="bg-blue-100 px-2 py-1 rounded">Free Money</span>
          <span className="bg-blue-100 px-2 py-1 rounded">Carte Bancaire</span>
          <span className="bg-blue-100 px-2 py-1 rounded">Wizall</span>
        </div>
      </div>
    </div>
  );
}

// Default subscription plans
export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Parfait pour commencer',
    price: 5000,
    currency: 'XOF',
    planType: 'basic',
    features: [
      'Profil joueur complet',
      'Recherche de clubs',
      'Messages limités',
      'Support par email',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Le plus populaire',
    price: 15000,
    currency: 'XOF',
    planType: 'premium',
    popular: true,
    features: [
      'Tout du plan Basic',
      'Messages illimités',
      'Statistiques avancées',
      'Priorité dans les recherches',
      'Support prioritaire',
      'Formations exclusives',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les professionnels',
    price: 25000,
    currency: 'XOF',
    planType: 'pro',
    features: [
      'Tout du plan Premium',
      'Analytics détaillées',
      'Recrutement prioritaire',
      'Formations personnalisées',
      'Support téléphonique',
      'API access',
    ],
  },
];
