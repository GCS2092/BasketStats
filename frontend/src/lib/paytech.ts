/**
 * PayTech Web SDK Integration
 * Based on official PayTech documentation: https://doc.intech.sn/doc_paytech.php
 */

export interface PayTechConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
  env?: 'test' | 'prod';
}

export interface PaymentRequest {
  item_name: string;
  item_price: number;
  currency?: string;
  ref_command: string;
  command_name: string;
  env?: string;
  ipn_url?: string;
  success_url?: string;
  cancel_url?: string;
  custom_field?: string;
  target_payment?: string;
  refund_notif_url?: string;
}

export interface PaymentResponse {
  success: number;
  token?: string;
  redirect_url?: string;
  redirectUrl?: string;
  message?: string;
}

export interface TransferRequest {
  amount: number;
  destination_number: string;
  service: string;
  callback_url?: string;
  external_id?: string;
}

export interface SMSRequest {
  destination_number: string;
  sms_content: string;
}

export class PayTechService {
  private config: PayTechConfig;
  private baseUrl: string;

  constructor(config: PayTechConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://paytech.sn/api';
  }

  /**
   * Create a payment request
   */
  async createPaymentRequest(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/request-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API_KEY': this.config.apiKey,
          'API_SECRET': this.config.apiSecret,
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment request:', error);
      throw new Error('Failed to create payment request');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/get-status?token_payment=${token}`, {
        method: 'GET',
        headers: {
          'API_KEY': this.config.apiKey,
          'API_SECRET': this.config.apiSecret,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw new Error('Failed to get payment status');
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(refCommand: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/refund-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API_KEY': this.config.apiKey,
          'API_SECRET': this.config.apiSecret,
        },
        body: JSON.stringify({ ref_command: refCommand }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw new Error('Failed to refund payment');
    }
  }

  /**
   * Create a transfer
   */
  async createTransfer(transferData: TransferRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/transfer/transferFund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API_KEY': this.config.apiKey,
          'API_SECRET': this.config.apiSecret,
        },
        body: JSON.stringify(transferData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw new Error('Failed to create transfer');
    }
  }

  /**
   * Get transfer status
   */
  async getTransferStatus(transferId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/transfer/get-status?id_transfer=${transferId}`, {
        method: 'GET',
        headers: {
          'API_KEY': this.config.apiKey,
          'API_SECRET': this.config.apiSecret,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting transfer status:', error);
      throw new Error('Failed to get transfer status');
    }
  }

  /**
   * Send SMS
   */
  async sendSMS(smsData: SMSRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/sms/sms_api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API_KEY': this.config.apiKey,
          'API_SECRET': this.config.apiSecret,
        },
        body: JSON.stringify(smsData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }

  /**
   * Create payment URL with autofill parameters
   */
  createPaymentUrlWithAutofill(
    baseUrl: string,
    userInfo: {
      phone_number: string;
      first_name: string;
      last_name: string;
    },
    paymentMethod: string = 'Orange Money'
  ): string {
    const queryParams = new URLSearchParams({
      pn: userInfo.phone_number, // +221777777777
      nn: userInfo.phone_number.replace('+221', ''), // 777777777
      fn: `${userInfo.first_name} ${userInfo.last_name}`, // John Smith
      tp: paymentMethod, // Orange Money
      nac: paymentMethod === 'Carte Bancaire' ? '0' : '1' // Auto-submit
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }
}

// PayTech Web SDK Integration
declare global {
  interface Window {
    PayTech: any;
  }
}

export class PayTechWebSDK {
  private isLoaded = false;

  /**
   * Load PayTech Web SDK
   */
  async loadSDK(): Promise<void> {
    if (this.isLoaded) return;

    return new Promise((resolve, reject) => {
      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://paytech.sn/cdn/paytech.min.css';
      document.head.appendChild(cssLink);

      // Load JavaScript
      const script = document.createElement('script');
      script.src = 'https://paytech.sn/cdn/paytech.min.js';
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load PayTech SDK'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize payment with PayTech Web SDK
   */
  async initializePayment(options: {
    idTransaction: string;
    requestTokenUrl: string;
    method?: 'POST' | 'GET';
    headers?: Record<string, string>;
    presentationMode?: 'popup' | 'new_tab' | 'same_tab' | 'nothing';
    onSuccess?: () => void;
    onError?: (error: any) => void;
    onCancel?: () => void;
  }): Promise<void> {
    if (!this.isLoaded) {
      await this.loadSDK();
    }

    if (!window.PayTech) {
      throw new Error('PayTech SDK not loaded');
    }

    const paytech = new window.PayTech({
      idTransaction: options.idTransaction,
    });

    paytech.withOption({
      requestTokenUrl: options.requestTokenUrl,
      method: options.method || 'POST',
      headers: options.headers || {},
      presentationMode: this.getPresentationMode(options.presentationMode),
      didReceiveError: (error: any) => {
        console.error('PayTech Error:', error);
        options.onError?.(error);
      },
      didReceiveNonSuccessResponse: (response: any) => {
        console.error('PayTech Non-Success Response:', response);
        options.onError?.(response);
      },
      didReceiveSuccessResponse: () => {
        console.log('PayTech Success');
        options.onSuccess?.();
      },
      didReceiveCancelResponse: () => {
        console.log('PayTech Canceled');
        options.onCancel?.();
      },
    });

    paytech.send();
  }

  private getPresentationMode(mode?: string): any {
    if (!window.PayTech) return 'popup';

    switch (mode) {
      case 'popup':
        return window.PayTech.OPEN_IN_POPUP;
      case 'new_tab':
        return window.PayTech.OPEN_IN_NEW_TAB;
      case 'same_tab':
        return window.PayTech.OPEN_IN_SAME_TAB;
      case 'nothing':
        return window.PayTech.DO_NOTHING;
      default:
        return window.PayTech.OPEN_IN_POPUP;
    }
  }
}

// Available payment methods from PayTech documentation
export const PAYMENT_METHODS = {
  'Orange Money': 'Orange Money',
  'Orange Money CI': 'Orange Money CI',
  'Orange Money ML': 'Orange Money ML',
  'Mtn Money CI': 'Mtn Money CI',
  'Moov Money CI': 'Moov Money CI',
  'Moov Money ML': 'Moov Money ML',
  'Wave': 'Wave',
  'Wave CI': 'Wave CI',
  'Wizall': 'Wizall',
  'Carte Bancaire': 'Carte Bancaire',
  'Emoney': 'Emoney',
  'Tigo Cash': 'Tigo Cash',
  'Free Money': 'Free Money',
  'Moov Money BJ': 'Moov Money BJ',
  'Mtn Money BJ': 'Mtn Money BJ',
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

// Available transfer services
export const TRANSFER_SERVICES = {
  'Orange Money Senegal': 'Orange Money Senegal',
  'Wave Senegal': 'Wave Senegal',
  'Free Money Senegal': 'Free Money Senegal',
  'Moov Money BJ': 'Moov Money BJ',
  'Mtn Money BJ': 'Mtn Money BJ',
} as const;

export type TransferService = keyof typeof TRANSFER_SERVICES;
