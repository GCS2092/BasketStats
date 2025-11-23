'use client';

import { useState, useEffect } from 'react';
import { PayTechWebSDK, PaymentMethod } from '@/lib/paytech';

interface PayTechButtonProps {
  // Payment details
  itemName: string;
  itemPrice: number;
  currency?: string;
  refCommand?: string;
  commandName?: string;
  
  // Payment method configuration
  targetPayment?: PaymentMethod | PaymentMethod[];
  enableAutofill?: boolean;
  
  // User info for autofill
  userInfo?: {
    phone_number: string;
    first_name: string;
    last_name: string;
  };
  
  // UI configuration
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  
  // Callbacks
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  
  // Presentation mode
  presentationMode?: 'popup' | 'new_tab' | 'same_tab' | 'nothing';
  
  // Custom field data
  customField?: Record<string, any>;
}

export default function PayTechButton({
  itemName,
  itemPrice,
  currency = 'XOF',
  refCommand,
  commandName,
  targetPayment,
  enableAutofill = false,
  userInfo,
  className = '',
  children,
  disabled = false,
  loading = false,
  onSuccess,
  onError,
  onCancel,
  presentationMode = 'popup',
  customField = {},
}: PayTechButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paytechSDK, setPaytechSDK] = useState<PayTechWebSDK | null>(null);

  useEffect(() => {
    const sdk = new PayTechWebSDK();
    setPaytechSDK(sdk);
  }, []);

  const handlePayment = async () => {
    if (disabled || loading || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Get authentication token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        const errorMsg = 'Vous devez être connecté pour effectuer un paiement';
        onError?.(errorMsg);
        alert(errorMsg);
        return;
      }

      // Prepare payment data
      const paymentData = {
        item_name: itemName,
        item_price: itemPrice,
        currency,
        ref_command: refCommand || `PAY_${Date.now()}`,
        command_name: commandName || itemName,
        custom_field: JSON.stringify(customField),
        target_payment: Array.isArray(targetPayment) 
          ? targetPayment.join(', ') 
          : targetPayment,
      };

      // Create payment request
      const response = await fetch('/api/paytech/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (!data.success || !data.payment_url) {
        const errorMsg = data.message || 'Erreur lors de la création du paiement';
        onError?.(errorMsg);
        alert(errorMsg);
        return;
      }

      // Use PayTech Web SDK if available, otherwise redirect
      if (paytechSDK && presentationMode !== 'same_tab') {
        await paytechSDK.initializePayment({
          idTransaction: data.token || paymentData.ref_command,
          requestTokenUrl: '/api/paytech/create-payment',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          presentationMode,
          onSuccess: () => {
            onSuccess?.(data);
          },
          onError: (error) => {
            onError?.(error.message || 'Erreur lors du paiement');
          },
          onCancel: () => {
            onCancel?.();
          },
        });
      } else {
        // Fallback to direct redirect
        window.location.href = data.payment_url;
      }

    } catch (error) {
      console.error('Error creating payment:', error);
      const errorMsg = 'Erreur de connexion. Veuillez réessayer.';
      onError?.(errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || loading || isLoading;

  return (
    <button
      onClick={handlePayment}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center px-6 py-3 
        border border-transparent text-base font-medium rounded-md 
        text-white bg-blue-600 hover:bg-blue-700 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-colors duration-200
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center">
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Chargement...
        </div>
      ) : (
        children || `Payer ${itemPrice.toLocaleString()} ${currency}`
      )}
    </button>
  );
}

// Subscription Payment Button Component
interface SubscriptionPayTechButtonProps extends Omit<PayTechButtonProps, 'itemName' | 'commandName'> {
  planType: string;
  planName: string;
  planDescription?: string;
}

export function SubscriptionPayTechButton({
  planType,
  planName,
  planDescription,
  itemPrice,
  customField = {},
  ...props
}: SubscriptionPayTechButtonProps) {
  const subscriptionCustomField = {
    ...customField,
    plan_type: planType,
    plan_name: planName,
    subscription: true,
  };

  return (
    <PayTechButton
      itemName={planName}
      itemPrice={itemPrice}
      commandName={`Abonnement ${planName} - BasketStats`}
      customField={subscriptionCustomField}
      targetPayment={['Orange Money', 'Wave', 'Free Money']}
      {...props}
    />
  );
}

// Quick Payment Button for specific amounts
interface QuickPayTechButtonProps extends Omit<PayTechButtonProps, 'itemName' | 'itemPrice'> {
  amount: number;
  description: string;
}

export function QuickPayTechButton({
  amount,
  description,
  ...props
}: QuickPayTechButtonProps) {
  return (
    <PayTechButton
      itemName={description}
      itemPrice={amount}
      commandName={`Paiement ${description} - BasketStats`}
      {...props}
    />
  );
}
