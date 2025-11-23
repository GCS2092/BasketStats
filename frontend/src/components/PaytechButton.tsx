'use client';

import { useState } from 'react';

interface PaytechButtonProps {
  planType: string;
  planName: string;
  amount: number;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PaytechButton({
  planType,
  planName,
  amount,
  className = '',
  children,
  onSuccess,
  onError
}: PaytechButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Récupérer le token depuis la session ou localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        onError?.('Vous devez être connecté pour effectuer un paiement');
        alert('Vous devez être connecté pour effectuer un paiement');
        return;
      }

      const response = await fetch('/api/paytech/create-subscription-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType,
          planName,
          amount
        })
      });

      const data = await response.json();

      if (data.success && data.payment_url) {
        // Rediriger vers PayTech
        window.location.href = data.payment_url;
        onSuccess?.();
      } else {
        const errorMessage = data.message || 'Erreur lors de la création du paiement';
        onError?.(errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      const errorMessage = 'Erreur de connexion. Veuillez réessayer.';
      onError?.(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Chargement...
        </div>
      ) : (
        children || `Payer ${amount.toLocaleString()} FCFA`
      )}
    </button>
  );
}
