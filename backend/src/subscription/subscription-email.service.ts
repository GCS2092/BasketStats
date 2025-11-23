import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SubscriptionEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurer le transporteur email
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  /**
   * Email de confirmation d'abonnement activé
   */
  async sendSubscriptionActivatedEmail(
    userEmail: string,
    userName: string,
    planName: string,
    planType: string,
    amount: number,
    currency: string = 'XOF',
    endDate?: Date
  ) {
    try {
      const subject = `🎉 Votre abonnement ${planName} est activé !`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🏀 BasketStats</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Votre abonnement est activé !</p>
          </div>
          
          <div style="padding: 30px; color: #333;">
            <p>Bonjour <strong>${userName}</strong>,</p>
            
            <div style="background: #F0F9FF; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 10px 0; color: #1E40AF;">✅ Abonnement Activé</h2>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1E40AF;">
                ${planName} (${planType})
              </p>
            </div>

            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">📋 Détails de votre abonnement</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <strong>Plan:</strong> ${planName}
                </div>
                <div>
                  <strong>Type:</strong> ${planType}
                </div>
                <div>
                  <strong>Montant:</strong> ${amount.toLocaleString()} ${currency}
                </div>
                <div>
                  <strong>Statut:</strong> <span style="color: #059669; font-weight: bold;">Actif</span>
                </div>
                ${endDate ? `
                <div>
                  <strong>Expire le:</strong> ${endDate.toLocaleDateString('fr-FR')}
                </div>
                ` : `
                <div>
                  <strong>Durée:</strong> Permanent
                </div>
                `}
              </div>
            </div>

            <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #92400E;">🎯 Fonctionnalités incluses</h3>
              <ul style="margin: 0; padding-left: 20px; color: #92400E;">
                <li>Accès complet à la plateforme BasketStats</li>
                <li>Gestion avancée des clubs et joueurs</li>
                <li>Statistiques détaillées et analyses</li>
                <li>Création d'événements et tournois</li>
                <li>Support prioritaire</li>
                ${planType === 'PROFESSIONAL' ? `
                <li>Marque personnalisée</li>
                <li>Accès API</li>
                <li>Fonctionnalités illimitées</li>
                ` : ''}
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Accéder à mon Dashboard
              </a>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription" 
                 style="color: #6B7280; text-decoration: none; font-size: 14px;">
                Gérer mon abonnement
              </a>
            </div>

            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Merci d'avoir choisi BasketStats ! Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
            
            <p style="color: #6B7280; font-size: 14px;">
              L'équipe BasketStats
            </p>
          </div>
          
          <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
            Ceci est un email automatique, merci de ne pas y répondre.
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: userEmail,
        subject,
        html: htmlContent,
      });

      console.log(`📧 Email d'activation d'abonnement envoyé à ${userEmail} pour le plan ${planName}`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email d'abonnement:`, error);
      throw error;
    }
  }

  /**
   * Email de confirmation de changement de plan
   */
  async sendPlanChangeEmail(
    userEmail: string,
    userName: string,
    oldPlanName: string,
    newPlanName: string,
    newPlanType: string,
    amount: number,
    currency: string = 'XOF'
  ) {
    try {
      const subject = `🔄 Votre abonnement a été mis à jour vers ${newPlanName}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🏀 BasketStats</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Changement de plan effectué !</p>
          </div>
          
          <div style="padding: 30px; color: #333;">
            <p>Bonjour <strong>${userName}</strong>,</p>
            
            <div style="background: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 10px 0; color: #047857;">✅ Changement de Plan Réussi</h2>
              <p style="margin: 0; font-size: 16px;">
                Votre abonnement a été mis à jour de <strong>${oldPlanName}</strong> vers <strong>${newPlanName}</strong>
              </p>
            </div>

            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">📋 Nouveau Plan</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <strong>Nouveau Plan:</strong> ${newPlanName}
                </div>
                <div>
                  <strong>Type:</strong> ${newPlanType}
                </div>
                <div>
                  <strong>Montant:</strong> ${amount.toLocaleString()} ${currency}
                </div>
                <div>
                  <strong>Statut:</strong> <span style="color: #059669; font-weight: bold;">Actif</span>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Accéder à mon Dashboard
              </a>
            </div>

            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Vous pouvez maintenant profiter de toutes les fonctionnalités de votre nouveau plan !
            </p>
            
            <p style="color: #6B7280; font-size: 14px;">
              L'équipe BasketStats
            </p>
          </div>
          
          <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
            Ceci est un email automatique, merci de ne pas y répondre.
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: userEmail,
        subject,
        html: htmlContent,
      });

      console.log(`📧 Email de changement de plan envoyé à ${userEmail} de ${oldPlanName} vers ${newPlanName}`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email de changement de plan:`, error);
      throw error;
    }
  }

  /**
   * Email de notification de problème de paiement
   */
  async sendPaymentIssueEmail(
    userEmail: string,
    userName: string,
    planName: string,
    errorMessage: string
  ) {
    try {
      const subject = `⚠️ Problème avec votre paiement ${planName}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🏀 BasketStats</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Problème de paiement détecté</p>
          </div>
          
          <div style="padding: 30px; color: #333;">
            <p>Bonjour <strong>${userName}</strong>,</p>
            
            <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 10px 0; color: #92400E;">⚠️ Problème de Paiement</h2>
              <p style="margin: 0; color: #92400E;">
                Nous avons détecté un problème avec votre paiement pour le plan <strong>${planName}</strong>.
              </p>
            </div>

            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">🔍 Détails du problème</h3>
              <p style="margin: 0; color: #6B7280; font-family: monospace; background: #F3F4F6; padding: 10px; border-radius: 4px;">
                ${errorMessage}
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription" 
                 style="background: #F59E0B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🔄 Réessayer le Paiement
              </a>
            </div>

            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Si le problème persiste, contactez notre support technique.
            </p>
            
            <p style="color: #6B7280; font-size: 14px;">
              L'équipe BasketStats
            </p>
          </div>
          
          <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
            Ceci est un email automatique, merci de ne pas y répondre.
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: userEmail,
        subject,
        html: htmlContent,
      });

      console.log(`📧 Email de problème de paiement envoyé à ${userEmail} pour le plan ${planName}`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email de problème de paiement:`, error);
      throw error;
    }
  }
}
