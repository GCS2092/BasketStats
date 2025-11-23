'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PaymentCancelPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log('🔄 [PAYMENT_CANCEL] Page d\'annulation chargée');
    console.log('🔄 [PAYMENT_CANCEL] URL params:', searchParams.toString());
    
    // Récupérer les paramètres de l'URL
    const token = searchParams.get('token');
    const refCommand = searchParams.get('ref_command');
    const itemName = searchParams.get('item_name');

    if (token) {
      setPaymentDetails({
        token,
        refCommand,
        itemName
      });
    }

    // Auto-redirection après 5 secondes si pas d'action
    const timer = setTimeout(() => {
      console.log('⏰ [PAYMENT_CANCEL] Auto-redirection vers les abonnements...');
      router.push('/subscription?payment_cancel=true');
    }, 5000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const handleRetryPayment = () => {
    console.log('🔄 [PAYMENT_CANCEL] Retry payment clicked');
    setIsRedirecting(true);
    router.push('/subscription?payment_cancel=true');
  };

  const handleBackToDashboard = () => {
    console.log('🏠 [PAYMENT_CANCEL] Back to dashboard clicked');
    setIsRedirecting(true);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
            <svg
              className="h-10 w-10 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Paiement annulé
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Votre paiement a été annulé. Aucun montant n'a été débité.
          </p>

          {paymentDetails && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Détails de la transaction
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Produit:</span>
                  <span className="font-medium">{paymentDetails.itemName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence:</span>
                  <span className="font-medium text-xs">{paymentDetails.refCommand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className="font-medium text-yellow-600">Annulé</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleRetryPayment}
              disabled={isRedirecting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRedirecting ? 'Redirection...' : 'Réessayer le paiement'}
            </button>
            
            <button
              onClick={handleBackToDashboard}
              disabled={isRedirecting}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRedirecting ? 'Redirection...' : 'Retour au Dashboard'}
            </button>
          </div>

          <div className="mt-4 text-sm text-blue-600">
            <p>⏰ Redirection automatique dans 5 secondes...</p>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>
              Vous pouvez réessayer le paiement à tout moment.
            </p>
            <p className="mt-2">
              Si vous rencontrez des problèmes, contactez notre support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentCancelPageContent />
    </Suspense>
  );
}
