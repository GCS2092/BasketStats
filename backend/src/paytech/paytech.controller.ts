import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Res,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaytechService } from './paytech.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionEmailService } from '../subscription/subscription-email.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('paytech')
export class PaytechController {
  private readonly logger = new Logger(PaytechController.name);

  constructor(
    private readonly paytechService: PaytechService,
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionEmailService: SubscriptionEmailService,
    private readonly prisma: PrismaService
  ) {}


  /**
   * Créer une demande de paiement
   */
  @Post('create-payment')
  @UseGuards(JwtAuthGuard)
  async createPayment(@Body() paymentData: any, @Req() req: any) {
    try {
      const userId = req.user.id;
      
      const paymentRequest = {
        item_name: paymentData.item_name,
        item_price: paymentData.item_price,
        currency: paymentData.currency || 'XOF',
        ref_command: `PAY_${userId}_${Date.now()}`,
        command_name: paymentData.command_name || paymentData.item_name,
        env: paymentData.env || 'test',
        custom_field: JSON.stringify({
          user_id: userId,
          ...paymentData.custom_field,
        }),
        target_payment: paymentData.target_payment,
      };

      const result = await this.paytechService.createPaymentRequest(paymentRequest);
      
      if (result.success === 1) {
        return {
          success: true,
          payment_url: result.redirect_url || result.redirectUrl,
          token: result.token,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Erreur lors de la création du paiement',
        };
      }
    } catch (error) {
      this.logger.error(`Error creating payment: ${error.message}`);
      return {
        success: false,
        message: 'Erreur interne du serveur',
      };
    }
  }

  /**
   * Créer un paiement d'abonnement
   */
  @Post('create-subscription-payment')
  @UseGuards(JwtAuthGuard)
  async createSubscriptionPayment(@Body() subscriptionData: any, @Req() req: any) {
    try {
      const userId = req.user.id;
      
      // Récupérer les informations complètes de l'utilisateur
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          fullName: true,
          email: true
        }
      });

      const userInfo = {
        phone_number: '+221771234567', // Par défaut, à améliorer avec un champ téléphone
        first_name: user?.fullName?.split(' ')[0] || 'Utilisateur',
        last_name: user?.fullName?.split(' ').slice(1).join(' ') || 'BasketStats'
      };

      console.log(`👤 [PAYTECH_CONTROLLER] Informations utilisateur:`, userInfo);

      const result = await this.paytechService.createSubscriptionPayment(
        userId,
        subscriptionData.planType,
        subscriptionData.planName,
        subscriptionData.amount,
        userInfo
      );

      if (result.success === 1) {
        return {
          success: true,
          payment_url: result.redirect_url || result.redirectUrl,
          token: result.token,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Erreur lors de la création du paiement',
        };
      }
    } catch (error) {
      this.logger.error(`Error creating subscription payment: ${error.message}`);
      return {
        success: false,
        message: 'Erreur interne du serveur',
      };
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  @Get('payment-status')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Query('token') token: string) {
    try {
      const status = await this.paytechService.getPaymentStatus(token);
      return status;
    } catch (error) {
      this.logger.error(`Error getting payment status: ${error.message}`);
      return {
        success: false,
        message: 'Erreur lors de la vérification du statut',
      };
    }
  }

  /**
   * Effectuer un remboursement
   */
  @Post('refund')
  @UseGuards(JwtAuthGuard)
  async refundPayment(@Body() refundData: { ref_command: string }) {
    try {
      const result = await this.paytechService.refundPayment(refundData.ref_command);
      return result;
    } catch (error) {
      this.logger.error(`Error refunding payment: ${error.message}`);
      return {
        success: false,
        message: 'Erreur lors du remboursement',
      };
    }
  }

  /**
   * Webhook IPN - Notification de paiement
   */
  @Post('ipn')
  async handleIPN(@Req() req: Request, @Res() res: Response) {
    try {
      const {
        type_event,
        custom_field,
        ref_command,
        item_name,
        item_price,
        currency,
        command_name,
        token,
        env,
        payment_method,
        client_phone,
        api_key_sha256,
        api_secret_sha256,
        hmac_compute,
      } = req.body;

      this.logger.log(`🔄 [PAYTECH_IPN] ===== NOUVELLE NOTIFICATION PAYTECH =====`);
      this.logger.log(`🔄 [PAYTECH_IPN] Type d'événement: ${type_event}`);
      this.logger.log(`🔄 [PAYTECH_IPN] Référence commande: ${ref_command}`);
      this.logger.log(`🔄 [PAYTECH_IPN] Item: ${item_name} - ${item_price} ${currency}`);
      this.logger.log(`🔄 [PAYTECH_IPN] Méthode de paiement: ${payment_method}`);
      this.logger.log(`🔄 [PAYTECH_IPN] Custom field: ${custom_field}`);
      this.logger.log(`🔄 [PAYTECH_IPN] Token: ${token}`);
      this.logger.log(`🔄 [PAYTECH_IPN] Environnement: ${env}`);
      this.logger.log(`🔄 [PAYTECH_IPN] ================================================`);

      // Vérifier l'authenticité de la notification
      const isValid = this.paytechService.verifyIPN(api_key_sha256, api_secret_sha256);
      
      if (!isValid) {
        this.logger.warn(`Invalid IPN received for ${ref_command}`);
        return res.status(HttpStatus.FORBIDDEN).send('IPN KO - NOT FROM PAYTECH');
      }

      // Vérifier avec HMAC si disponible
      if (hmac_compute) {
        const isValidHmac = this.paytechService.verifyIPNWithHMAC(
          hmac_compute,
          item_price,
          ref_command
        );
        
        if (!isValidHmac) {
          this.logger.warn(`Invalid HMAC for IPN ${ref_command}`);
          return res.status(HttpStatus.FORBIDDEN).send('IPN KO - INVALID HMAC');
        }
      }

      // Traiter la notification selon le type d'événement
      if (type_event === 'sale_complete') {
        await this.handlePaymentSuccess({
          custom_field,
          ref_command,
          item_name,
          item_price,
          currency,
          payment_method,
          client_phone,
          token,
        });
      } else if (type_event === 'sale_canceled') {
        await this.handlePaymentCanceled({
          ref_command,
          item_name,
          token,
        });
      }

      this.logger.log(`IPN processed successfully for ${ref_command}`);
      return res.status(HttpStatus.OK).send('IPN OK');
    } catch (error) {
      this.logger.error(`Error processing IPN: ${error.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('IPN ERROR');
    }
  }

  /**
   * Page de succès après paiement
   */
  @Get('success')
  async paymentSuccess(@Query() query: any, @Res() res: Response) {
    this.logger.log(`Payment success page accessed: ${JSON.stringify(query)}`);
    
    // Rediriger vers la page de succès du frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/payment/success?${new URLSearchParams(query).toString()}`);
  }

  /**
   * Page d'annulation après paiement
   */
  @Get('cancel')
  async paymentCancel(@Query() query: any, @Res() res: Response) {
    this.logger.log(`🔄 [PAYTECH] Payment cancel page accessed: ${JSON.stringify(query)}`);
    
    try {
      // Rediriger vers la page d'annulation du frontend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/payment/cancel?${new URLSearchParams(query).toString()}`;
      
      this.logger.log(`🔄 [PAYTECH] Redirecting to: ${redirectUrl}`);
      
      // Utiliser une redirection 302 pour éviter les problèmes Safari
      return res.redirect(302, redirectUrl);
    } catch (error) {
      this.logger.error(`❌ [PAYTECH] Error in payment cancel:`, error);
      
      // Fallback: redirection simple
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(302, `${frontendUrl}/payment/cancel`);
    }
  }

  /**
   * Traiter un paiement réussi
   */
  private async handlePaymentSuccess(paymentData: any) {
    try {
      const customField = JSON.parse(paymentData.custom_field || '{}');
      const userId = customField.user_id;

      if (customField.subscription) {
        // Traiter l'abonnement
        await this.processSubscriptionPayment(userId, paymentData, customField);
      } else {
        // Traiter un paiement normal
        await this.processNormalPayment(userId, paymentData, customField);
      }

      this.logger.log(`Payment success processed for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error processing payment success: ${error.message}`);
    }
  }

  /**
   * Traiter un paiement annulé
   */
  private async handlePaymentCanceled(paymentData: any) {
    try {
      this.logger.log(`Payment canceled for ${paymentData.ref_command}`);
      // Ici vous pouvez ajouter la logique pour traiter l'annulation
    } catch (error) {
      this.logger.error(`Error processing payment cancel: ${error.message}`);
    }
  }

  /**
   * Traiter un paiement d'abonnement
   */
  private async processSubscriptionPayment(userId: string, paymentData: any, customField: any) {
    try {
      this.logger.log(`🔄 [PAYTECH] Traitement du paiement d'abonnement pour l'utilisateur ${userId}`);
      this.logger.log(`📋 [PAYTECH] Plan: ${customField.plan_type} - ${customField.plan_name}`);
      this.logger.log(`💰 [PAYTECH] Montant: ${paymentData.item_price} ${paymentData.currency}`);
      this.logger.log(`🔑 [PAYTECH] Transaction ID: ${paymentData.ref_command}`);

      // 1. Trouver le plan d'abonnement correspondant
      const plan = await this.prisma.subscriptionPlan.findFirst({
        where: {
          type: customField.plan_type,
          isActive: true
        }
      });

      if (!plan) {
        this.logger.error(`❌ [PAYTECH] Plan ${customField.plan_type} non trouvé`);
        return;
      }

      this.logger.log(`✅ [PAYTECH] Plan trouvé: ${plan.name} (ID: ${plan.id})`);

      // 2. Désactiver les autres abonnements actifs de l'utilisateur
      await this.prisma.subscription.updateMany({
        where: {
          userId,
          status: 'ACTIVE'
        },
        data: {
          status: 'CANCELLED'
        }
      });

      this.logger.log(`🔄 [PAYTECH] Anciens abonnements désactivés pour l'utilisateur ${userId}`);

      // 3. Créer le nouvel abonnement
      const startDate = new Date();
      const endDate = plan.duration > 0 
        ? new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000) 
        : null;

      const subscription = await this.prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
          transactionId: paymentData.ref_command,
          paymentMethod: paymentData.payment_method || 'mobile_money'
        },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      this.logger.log(`✅ [PAYTECH] Abonnement créé avec succès: ${subscription.id}`);
      this.logger.log(`📋 [PAYTECH] Utilisateur: ${subscription.user.fullName} (${subscription.user.email})`);
      this.logger.log(`📋 [PAYTECH] Plan: ${subscription.plan.name} - ${subscription.plan.price} XOF`);
      this.logger.log(`📋 [PAYTECH] Statut: ${subscription.status}`);
      this.logger.log(`📋 [PAYTECH] Début: ${subscription.startDate}`);
      this.logger.log(`📋 [PAYTECH] Fin: ${subscription.endDate || 'Permanent'}`);

      // 4. Créer une notification pour l'utilisateur
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'SUBSCRIPTION_ACTIVATED',
          title: 'Abonnement activé avec succès !',
          message: `Votre abonnement ${subscription.plan.name} a été activé. Vous pouvez maintenant profiter de toutes les fonctionnalités incluses.`,
          payload: {
            subscriptionId: subscription.id,
            planName: subscription.plan.name,
            planType: subscription.plan.type,
            amount: Number(subscription.plan.price),
            currency: 'XOF'
          }
        }
      });

      this.logger.log(`✅ [PAYTECH] Notification créée pour l'utilisateur ${userId}`);

      // 5. Envoyer un email de confirmation
      try {
        await this.subscriptionEmailService.sendSubscriptionActivatedEmail(
          subscription.user.email,
          subscription.user.fullName,
          subscription.plan.name,
          subscription.plan.type,
          Number(subscription.plan.price),
          'XOF',
          subscription.endDate || undefined
        );
        this.logger.log(`✅ [PAYTECH] Email de confirmation envoyé à ${subscription.user.email}`);
      } catch (emailError) {
        this.logger.error(`❌ [PAYTECH] Erreur lors de l'envoi de l'email:`, emailError);
        // Ne pas faire échouer le processus pour un problème d'email
      }

      // 5. Log de confirmation
      this.logger.log(`🎉 [PAYTECH] Paiement d'abonnement traité avec succès !`);
      this.logger.log(`   - Utilisateur: ${subscription.user.fullName} (${userId})`);
      this.logger.log(`   - Plan: ${subscription.plan.name} (${subscription.plan.type})`);
      this.logger.log(`   - Montant: ${subscription.plan.price} XOF`);
      this.logger.log(`   - Transaction: ${paymentData.ref_command}`);
      this.logger.log(`   - Statut: ${subscription.status}`);

    } catch (error) {
      this.logger.error(`❌ [PAYTECH] Erreur lors du traitement du paiement d'abonnement:`, error);
      this.logger.error(`   - User ID: ${userId}`);
      this.logger.error(`   - Plan Type: ${customField.plan_type}`);
      this.logger.error(`   - Transaction: ${paymentData.ref_command}`);
      this.logger.error(`   - Error: ${error.message}`);
      this.logger.error(`   - Stack: ${error.stack}`);
    }
  }

  /**
   * Traiter un paiement normal
   */
  private async processNormalPayment(userId: string, paymentData: any, customField: any) {
    try {
      this.logger.log(`🔄 [PAYTECH] Traitement du paiement normal pour l'utilisateur ${userId}`);
      this.logger.log(`📋 [PAYTECH] Item: ${paymentData.item_name}`);
      this.logger.log(`💰 [PAYTECH] Montant: ${paymentData.item_price} ${paymentData.currency}`);
      this.logger.log(`🔑 [PAYTECH] Transaction ID: ${paymentData.ref_command}`);

      // Créer une notification pour l'utilisateur
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'PAYMENT_SUCCESS',
          title: 'Paiement effectué avec succès !',
          message: `Votre paiement pour "${paymentData.item_name}" a été traité avec succès.`,
          payload: {
            itemName: paymentData.item_name,
            amount: paymentData.item_price,
            currency: paymentData.currency,
            transactionId: paymentData.ref_command,
            paymentMethod: paymentData.payment_method || 'mobile_money'
          }
        }
      });

      this.logger.log(`✅ [PAYTECH] Notification créée pour l'utilisateur ${userId}`);
      this.logger.log(`🎉 [PAYTECH] Paiement normal traité avec succès !`);

    } catch (error) {
      this.logger.error(`❌ [PAYTECH] Erreur lors du traitement du paiement normal:`, error);
      this.logger.error(`   - User ID: ${userId}`);
      this.logger.error(`   - Item: ${paymentData.item_name}`);
      this.logger.error(`   - Transaction: ${paymentData.ref_command}`);
      this.logger.error(`   - Error: ${error.message}`);
    }
  }

  /**
   * Effectuer un transfert d'argent
   */
  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  async transferFund(@Body() transferData: {
    amount: number;
    destination_number: string;
    service: string;
    callback_url?: string;
    external_id?: string;
  }) {
    try {
      const result = await this.paytechService.transferFund(
        transferData.amount,
        transferData.destination_number,
        transferData.service,
        transferData.callback_url,
        transferData.external_id
      );

      return {
        success: true,
        transfer: result.transfer,
        message: result.message,
      };
    } catch (error) {
      this.logger.error(`Error creating transfer: ${error.message}`);
      return {
        success: false,
        message: 'Erreur lors de la création du transfert',
      };
    }
  }

  /**
   * Vérifier le statut d'un transfert
   */
  @Get('transfer-status')
  @UseGuards(JwtAuthGuard)
  async getTransferStatus(@Query('transfer_id') transferId: string) {
    try {
      const status = await this.paytechService.getTransferStatus(transferId);
      return status;
    } catch (error) {
      this.logger.error(`Error getting transfer status: ${error.message}`);
      return {
        success: false,
        message: 'Erreur lors de la vérification du statut du transfert',
      };
    }
  }

  /**
   * Obtenir l'historique des transferts
   */
  @Get('transfer-history')
  @UseGuards(JwtAuthGuard)
  async getTransferHistory(@Query() query: {
    start_date?: string;
    end_date?: string;
    page?: number;
    search_phone?: string;
    status_in?: string;
  }) {
    try {
      const history = await this.paytechService.getTransferHistory(query);
      return history;
    } catch (error) {
      this.logger.error(`Error getting transfer history: ${error.message}`);
      return {
        success: false,
        message: 'Erreur lors de la récupération de l\'historique',
      };
    }
  }

  /**
   * Obtenir les informations du compte
   */
  @Get('account-info')
  @UseGuards(JwtAuthGuard)
  async getAccountInfo() {
    try {
      const accountInfo = await this.paytechService.getAccountInfo();
      return accountInfo;
    } catch (error) {
      this.logger.error(`Error getting account info: ${error.message}`);
      return {
        success: false,
        message: 'Erreur lors de la récupération des informations du compte',
      };
    }
  }

  /**
   * Envoyer un SMS
   */
  @Post('send-sms')
  @UseGuards(JwtAuthGuard)
  async sendSMS(@Body() smsData: {
    destination_number: string;
    sms_content: string;
  }) {
    try {
      const result = await this.paytechService.sendSMS(
        smsData.destination_number,
        smsData.sms_content
      );

      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      this.logger.error(`Error sending SMS: ${error.message}`);
      return {
        success: false,
        message: 'Erreur lors de l\'envoi du SMS',
      };
    }
  }
}
