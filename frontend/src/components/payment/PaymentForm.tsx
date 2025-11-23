'use client';

import { useState } from 'react';
import { PaymentMethod, PAYMENT_METHODS } from '@/lib/paytech';
import PayTechButton from './PayTechButton';

interface PaymentFormProps {
  // Default values
  defaultItemName?: string;
  defaultAmount?: number;
  defaultCurrency?: string;
  
  // Form configuration
  showPaymentMethods?: boolean;
  showUserInfo?: boolean;
  enableAutofill?: boolean;
  
  // User info
  userInfo?: {
    phone_number: string;
    first_name: string;
    last_name: string;
  };
  
  // Callbacks
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  
  // UI configuration
  className?: string;
  showAmountInput?: boolean;
  showDescriptionInput?: boolean;
}

export default function PaymentForm({
  defaultItemName = '',
  defaultAmount = 0,
  defaultCurrency = 'XOF',
  showPaymentMethods = true,
  showUserInfo = false,
  enableAutofill = false,
  userInfo,
  onSuccess,
  onError,
  onCancel,
  className = '',
  showAmountInput = true,
  showDescriptionInput = true,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    itemName: defaultItemName,
    amount: defaultAmount,
    currency: defaultCurrency,
    selectedPaymentMethod: 'Orange Money' as PaymentMethod,
    phoneNumber: userInfo?.phone_number || '',
    firstName: userInfo?.first_name || '',
    lastName: userInfo?.last_name || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSuccess = (data: any) => {
    setIsSubmitting(false);
    onSuccess?.(data);
  };

  const handleError = (error: string) => {
    setIsSubmitting(false);
    onError?.(error);
  };

  const handleCancel = () => {
    setIsSubmitting(false);
    onCancel?.();
  };

  const handleSubmit = () => {
    if (!formData.itemName || formData.amount <= 0) {
      onError?.('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Configuration du paiement
      </h3>

      <form className="space-y-6">
        {/* Item Description */}
        {showDescriptionInput && (
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-2">
              Description du produit/service *
            </label>
            <input
              type="text"
              id="itemName"
              value={formData.itemName}
              onChange={(e) => handleInputChange('itemName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Abonnement Premium, Formation Basketball..."
              required
            />
          </div>
        )}

        {/* Amount */}
        {showAmountInput && (
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Montant (FCFA) *
            </label>
            <div className="flex">
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="1"
                required
              />
              <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                FCFA
              </span>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        {showPaymentMethods && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement
            </label>
            <select
              value={formData.selectedPaymentMethod}
              onChange={(e) => handleInputChange('selectedPaymentMethod', e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* User Info for Autofill */}
        {showUserInfo && enableAutofill && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-700">
              Informations pour pré-remplissage (optionnel)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+221 77 123 45 67"
              />
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Résumé du paiement</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Produit:</span>
              <span className="font-medium text-blue-900">{formData.itemName || 'Non spécifié'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Montant:</span>
              <span className="font-medium text-blue-900">
                {formData.amount.toLocaleString()} {formData.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Méthode:</span>
              <span className="font-medium text-blue-900">{formData.selectedPaymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <PayTechButton
          itemName={formData.itemName}
          itemPrice={formData.amount}
          currency={formData.currency}
          targetPayment={formData.selectedPaymentMethod}
          enableAutofill={enableAutofill}
          userInfo={enableAutofill ? {
            phone_number: formData.phoneNumber,
            first_name: formData.firstName,
            last_name: formData.lastName,
          } : undefined}
          onSuccess={handleSuccess}
          onError={handleError}
          onCancel={handleCancel}
          className="w-full"
          disabled={!formData.itemName || formData.amount <= 0 || isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Traitement...' : `Payer ${formData.amount.toLocaleString()} ${formData.currency}`}
        </PayTechButton>
      </form>

      {/* Security Notice */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>
          🔒 Paiement sécurisé par PayTech. Vos informations sont protégées.
        </p>
        <p className="mt-1">
          En cas de problème, contactez notre support.
        </p>
      </div>
    </div>
  );
}
