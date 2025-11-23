import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

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

@Injectable()
export class PaytechService {
  private readonly logger = new Logger(PaytechService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string;
  private readonly env: string;
  private readonly ipnUrl: string;
  private readonly successUrl: string;
  private readonly cancelUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PAYTECH_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('PAYTECH_API_SECRET') || '';
    this.baseUrl = this.configService.get<string>('PAYTECH_BASE_URL') || 'https://paytech.sn/api';
    this.env = this.configService.get<string>('PAYTECH_ENV', 'test');
    
    // S'assurer que les URLs sont complètes et valides
    this.ipnUrl = this.ensureCompleteUrl(this.configService.get<string>('PAYTECH_IPN_URL') || '');
    this.successUrl = this.ensureCompleteUrl(this.configService.get<string>('PAYTECH_SUCCESS_URL') || '');
    this.cancelUrl = this.ensureCompleteUrl(this.configService.get<string>('PAYTECH_CANCEL_URL') || '');
    
    this.logger.log(`🔧 [PAYTECH] URLs configurées:`);
    this.logger.log(`   - IPN: ${this.ipnUrl}`);
    this.logger.log(`   - Success: ${this.successUrl}`);
    this.logger.log(`   - Cancel: ${this.cancelUrl}`);
  }

  /**
   * S'assurer que l'URL est complète et valide
   */
  private ensureCompleteUrl(url: string): string {
    if (!url) {
      this.logger.warn(`⚠️ URL vide détectée`);
      return '';
    }
    
    // Si l'URL commence par http, elle est déjà complète
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si l'URL commence par /, elle est relative, on la préfixe avec ngrok
    if (url.startsWith('/')) {
      const ngrokUrl = this.configService.get<string>('NGROK_URL') || 'https://unresurrected-agonistic-pauline.ngrok-free.dev';
      const completeUrl = `${ngrokUrl}${url}`;
      this.logger.log(`🔧 [PAYTECH] URL relative convertie: ${url} → ${completeUrl}`);
      return completeUrl;
    }
    
    // URL invalide
    this.logger.error(`❌ [PAYTECH] URL invalide: ${url}`);
    return '';
  }

  /**
   * Créer une demande de paiement
   */
  async createPaymentRequest(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      // S'assurer que les URLs sont complètes
      const ipnUrl = this.ensureCompleteUrl(paymentData.ipn_url || this.ipnUrl);
      const successUrl = this.ensureCompleteUrl(paymentData.success_url || this.successUrl);
      const cancelUrl = this.ensureCompleteUrl(paymentData.cancel_url || this.cancelUrl);
      
      // Vérifier que les URLs sont valides
      if (!ipnUrl || !successUrl || !cancelUrl) {
        throw new Error('URLs PayTech invalides. Vérifiez la configuration ngrok.');
      }

      const payload = {
        item_name: paymentData.item_name,
        item_price: paymentData.item_price,
        currency: paymentData.currency || 'XOF',
        ref_command: paymentData.ref_command,
        command_name: paymentData.command_name,
        env: paymentData.env || this.env,
        ipn_url: ipnUrl,
        success_url: successUrl,
        cancel_url: cancelUrl,
        custom_field: paymentData.custom_field,
        target_payment: paymentData.target_payment,
        refund_notif_url: paymentData.refund_notif_url,
      };

      this.logger.log(`🔄 Création d'une requête de paiement pour: ${paymentData.item_name}`);
      this.logger.log(`📋 Payload PayTech:`, JSON.stringify(payload, null, 2));
      this.logger.log(`🌐 URL PayTech: ${this.baseUrl}/payment/request-payment`);
      this.logger.log(`🔑 API Key: ${this.apiKey.substring(0, 10)}...`);
      this.logger.log(`🔐 API Secret: ${this.apiSecret.substring(0, 10)}...`);

      const response = await axios.post(
        `${this.baseUrl}/payment/request-payment`,
        payload,
        {
          headers: {
            'API_KEY': this.apiKey,
            'API_SECRET': this.apiSecret,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`✅ Requête de paiement créée avec succès:`, response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la création de la requête de paiement:`);
      this.logger.error(`   - Message: ${error.message}`);
      this.logger.error(`   - Status: ${error.response?.status}`);
      this.logger.error(`   - Data:`, error.response?.data);
      this.logger.error(`   - Headers:`, error.response?.headers);
      throw new Error(`Payment request failed: ${error.message}`);
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async getPaymentStatus(token: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payment/get-status?token_payment=${token}`,
        {
          headers: {
            'API_KEY': this.apiKey,
            'API_SECRET': this.apiSecret,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error getting payment status: ${error.message}`);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * Effectuer un remboursement
   */
  async refundPayment(refCommand: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payment/refund-payment`,
        { ref_command: refCommand },
        {
          headers: {
            'API_KEY': this.apiKey,
            'API_SECRET': this.apiSecret,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error refunding payment: ${error.message}`);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Vérifier l'authenticité d'une notification IPN
   */
  verifyIPN(apiKeySha256: string, apiSecretSha256: string): boolean {
    const expectedApiKey = crypto.createHash('sha256').update(this.apiKey).digest('hex');
    const expectedApiSecret = crypto.createHash('sha256').update(this.apiSecret).digest('hex');

    return expectedApiKey === apiKeySha256 && expectedApiSecret === apiSecretSha256;
  }

  /**
   * Vérifier l'authenticité d'une notification IPN avec HMAC
   */
  verifyIPNWithHMAC(hmacCompute: string, itemPrice: string, refCommand: string): boolean {
    const message = `${itemPrice}|${refCommand}|${this.apiKey}`;
    const expectedHmac = crypto.createHmac('sha256', this.apiSecret).update(message).digest('hex');
    
    return expectedHmac === hmacCompute;
  }

  /**
   * Créer un paiement pour un abonnement
   */
  async createSubscriptionPayment(
    userId: string,
    planType: string,
    planName: string,
    amount: number,
    userInfo?: any
  ): Promise<PaymentResponse> {
    this.logger.log(`🔄 Création d'un paiement d'abonnement pour l'utilisateur ${userId}`);
    this.logger.log(`   - Plan: ${planName} (${planType})`);
    this.logger.log(`   - Montant: ${amount} XOF`);
    this.logger.log(`   - UserInfo:`, userInfo);

    const refCommand = `SUB_${userId}_${Date.now()}`;
    const customField = JSON.stringify({
      user_id: userId,
      plan_type: planType,
      plan_name: planName,
      subscription: true,
    });

    const paymentData: PaymentRequest = {
      item_name: planName,
      item_price: amount,
      currency: 'XOF',
      ref_command: refCommand,
      command_name: `Abonnement ${planName} - BasketStats`,
      env: this.env,
      custom_field: customField,
      target_payment: 'Orange Money, Wave, Free Money', // Méthodes disponibles
    };

    this.logger.log(`📋 Données de paiement:`, paymentData);

    // Si une seule méthode et infos utilisateur, activer l'autofill
    if (userInfo && userInfo.phone_number) {
      const response = await this.createPaymentRequest(paymentData);
      
      if (response.success === 1 && response.redirect_url) {
        // Ajouter les paramètres d'autofill
        const queryParams = new URLSearchParams({
          pn: userInfo.phone_number,
          nn: userInfo.phone_number.replace('+221', ''),
          fn: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
          tp: 'Orange Money',
          nac: '1'
        });

        response.redirect_url += '?' + queryParams.toString();
        response.redirectUrl = response.redirect_url;
      }

      return response;
    }

    return this.createPaymentRequest(paymentData);
  }

  /**
   * Effectuer un transfert d'argent
   */
  async transferFund(
    amount: number,
    destinationNumber: string,
    service: string,
    callbackUrl?: string,
    externalId?: string
  ): Promise<any> {
    try {
      const transferData = {
        amount,
        destination_number: destinationNumber,
        service,
        callback_url: callbackUrl,
        external_id: externalId || `TRANSFER_${Date.now()}`,
      };

      this.logger.log(`Creating transfer: ${amount} XOF to ${destinationNumber}`);

      const response = await axios.post(
        `${this.baseUrl}/transfer/transferFund`,
        transferData,
        {
          headers: {
            'API_KEY': this.apiKey,
            'API_SECRET': this.apiSecret,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`Transfer created successfully: ${response.data.transfer?.id_transfer}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating transfer: ${error.message}`);
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  /**
   * Vérifier le statut d'un transfert
   */
  async getTransferStatus(transferId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transfer/get-status?id_transfer=${transferId}`,
        {
          headers: {
            'API_KEY': this.apiKey,
            'API_SECRET': this.apiSecret,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error getting transfer status: ${error.message}`);
      throw new Error(`Failed to get transfer status: ${error.message}`);
    }
  }

  /**
   * Obtenir l'historique des transferts
   */
  async getTransferHistory(params: {
    start_date?: string;
    end_date?: string;
    page?: number;
    search_phone?: string;
    status_in?: string;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.search_phone) queryParams.append('search_phone', params.search_phone);
      if (params.status_in) queryParams.append('status_in', params.status_in);

      const response = await axios.get(
        `${this.baseUrl}/transfer/get-history?${queryParams.toString()}`,
        {
          headers: {
            'API_KEY': this.apiKey,
            'API_SECRET': this.apiSecret,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error getting transfer history: ${error.message}`);
      throw new Error(`Failed to get transfer history: ${error.message}`);
    }
  }

  /**
   * Obtenir les informations du compte
   */
  async getAccountInfo(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transfer/get-account-info`,
        {
          headers: {
            'API_KEY': this.apiKey,
            'API_SECRET': this.apiSecret,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error getting account info: ${error.message}`);
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  /**
   * Envoyer un SMS
   */
  async sendSMS(destinationNumber: string, smsContent: string): Promise<any> {
    try {
      const smsData = {
        destination_number: destinationNumber,
        sms_content: smsContent,
      };

      this.logger.log(`Sending SMS to: ${destinationNumber}`);

      const response = await axios.post(
        `${this.baseUrl}/sms/sms_api`,
        smsData,
        {
          headers: {
            'API_KEY': this.apiKey,
            'API_SECRET': this.apiSecret,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`SMS sent successfully to ${destinationNumber}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error sending SMS: ${error.message}`);
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }
}
