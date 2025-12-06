'use client';

import { useState } from 'react';
import PaymentForm from '@/components/payment/PaymentForm';
import SubscriptionPayment, { DEFAULT_SUBSCRIPTION_PLANS } from '@/components/payment/SubscriptionPayment';
import { QuickPayTechButton } from '@/components/payment/PayTechButton';

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'subscription' | 'quick'>('form');
  const [userInfo, setUserInfo] = useState({
    phone_number: '+221 77 123 45 67',
    first_name: 'John',
    last_name: 'Doe',
  });

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment successful:', data);
    alert('Paiement réussi ! Redirection vers la page de confirmation...');
    // Redirect to success page or show success message
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Erreur de paiement: ${error}`);
  };

  const handlePaymentCancel = () => {
    console.log('Payment canceled');
    alert('Paiement annulé');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Paiements PayTech
          </h1>
          <p className="text-lg text-gray-600">
            Intégration complète avec PayTech - Paiements sécurisés
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('form')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'form'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Formulaire de paiement
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subscription'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Abonnements
              </button>
              <button
                onClick={() => setActiveTab('quick')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quick'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Paiements rapides
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'form' && (
              <PaymentForm
                defaultItemName="Formation Basketball"
                defaultAmount={10000}
                showPaymentMethods={true}
                showUserInfo={true}
                enableAutofill={true}
                userInfo={userInfo}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
                className="max-w-2xl mx-auto"
              />
            )}

            {activeTab === 'subscription' && (
              <SubscriptionPayment
                plans={DEFAULT_SUBSCRIPTION_PLANS}
                userInfo={userInfo}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            )}

            {activeTab === 'quick' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Paiements rapides
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Boutons de paiement prêts à l'emploi pour des montants fixes
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QuickPayTechButton
                      amount={5000}
                      description="Formation de base"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                      className="w-full"
                    >
                      Formation de base - 5,000 FCFA
                    </QuickPayTechButton>

                    <QuickPayTechButton
                      amount={15000}
                      description="Formation avancée"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                      className="w-full"
                    >
                      Formation avancée - 15,000 FCFA
                    </QuickPayTechButton>

                    <QuickPayTechButton
                      amount={25000}
                      description="Formation professionnelle"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                      className="w-full"
                    >
                      Formation pro - 25,000 FCFA
                    </QuickPayTechButton>

                    <QuickPayTechButton
                      amount={1000}
                      description="Donation"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                      className="w-full"
                    >
                      Donation - 1,000 FCFA
                    </QuickPayTechButton>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations utilisateur
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={`${userInfo.first_name} ${userInfo.last_name}`}
                    onChange={(e) => {
                      const [firstName, ...lastNameParts] = e.target.value.split(' ');
                      setUserInfo(prev => ({
                        ...prev,
                        first_name: firstName || '',
                        last_name: lastNameParts.join(' ') || '',
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={userInfo.phone_number}
                    onChange={(e) => setUserInfo(prev => ({
                      ...prev,
                      phone_number: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Méthodes de paiement
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Orange Money
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Wave
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Free Money
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Wizall
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  Carte Bancaire
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🔒 Sécurité
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Paiements sécurisés par PayTech</li>
                <li>• Conformité PCI DSS</li>
                <li>• Chiffrement SSL/TLS</li>
                <li>• Aucune donnée sensible stockée</li>
              </ul>
            </div>

            {/* Support Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                💬 Support
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Besoin d'aide avec votre paiement ?
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-800 underline">
                Contacter le support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
