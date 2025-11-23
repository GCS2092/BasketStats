'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const token = searchParams.get('token');
    const refCommand = searchParams.get('ref_command');
    const itemName = searchParams.get('item_name');
    const itemPrice = searchParams.get('item_price');
    const paymentMethod = searchParams.get('payment_method');

    if (token) {
      setPaymentDetails({
        token,
        refCommand,
        itemName,
        itemPrice,
        paymentMethod
      });

      // Vérifier le statut du paiement
      verifyPaymentStatus(token);
    }
  }, [searchParams]);

  const verifyPaymentStatus = async (token: string) => {
    try {
      console.log('🔄 [PAYMENT_SUCCESS] Vérification du statut du paiement...');
      
      const response = await fetch(`/api/paytech/payment-status?token=${token}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      console.log('✅ [PAYMENT_SUCCESS] Statut du paiement:', data);
      
      if (data.success) {
        // Invalider les caches React Query pour forcer le rafraîchissement
        console.log('🔄 [PAYMENT_SUCCESS] Invalidation des caches...');
        await queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
        await queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
        await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        
        // Attendre un peu pour que les données se mettent à jour
        setTimeout(() => {
          console.log('✅ [PAYMENT_SUCCESS] Caches invalidés avec succès');
        }, 1000);
      }
      
      setIsVerifying(false);
    } catch (error) {
      console.error('❌ [PAYMENT_SUCCESS] Erreur lors de la vérification:', error);
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <svg
              className="h-10 w-10 text-green-600"
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
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Paiement réussi ! 🎉
          </h1>
          
          {isVerifying ? (
            <div className="flex items-center justify-center mb-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-lg text-gray-600">
                Vérification de votre abonnement...
              </p>
            </div>
          ) : (
            <p className="text-lg text-gray-600 mb-8">
              Votre abonnement a été activé avec succès
            </p>
          )}

          {paymentDetails && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Détails du paiement
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Produit:</span>
                  <span className="font-medium">{paymentDetails.itemName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant:</span>
                  <span className="font-medium">
                    {paymentDetails.itemPrice ? 
                      `${parseInt(paymentDetails.itemPrice).toLocaleString()} FCFA` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode:</span>
                  <span className="font-medium">{paymentDetails.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence:</span>
                  <span className="font-medium text-xs">{paymentDetails.refCommand}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Aller au Dashboard
            </Link>
            
            <Link
              href="/subscription?payment_success=true"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Gérer mon abonnement
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>
              Un email de confirmation vous a été envoyé avec tous les détails.
            </p>
            <p className="mt-2">
              Si vous avez des questions, contactez notre support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
