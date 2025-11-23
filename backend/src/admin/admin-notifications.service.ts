import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AdminNotificationsService {
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
   * Envoyer un email de notification de validation de compte
   */
  async sendAccountValidationEmail(userEmail: string, userName: string) {
    try {
      await this.transporter.sendMail({
        from: `"BasketStats Admin" <${process.env.MAIL_FROM_ADDRESS || 'noreply@basketstats.com'}>`,
        to: userEmail,
        subject: '✅ Votre compte recruteur a été validé !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #7C3AED, #8B5CF6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🏀 BasketStats</h1>
            </div>
            
            <div style="background: #fff; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1F2937; margin-top: 0;">Félicitations ${userName} !</h2>
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                Votre compte recruteur sur <strong>BasketStats</strong> a été validé par notre équipe. 🎉
              </p>
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                Vous avez maintenant accès à toutes les fonctionnalités de la plateforme :
              </p>
              
              <ul style="color: #4B5563; font-size: 16px; line-height: 1.8; margin-left: 20px;">
                <li>🔍 <strong>Recherche avancée de joueurs</strong> - Trouvez les talents qui correspondent à vos critères</li>
                <li>📊 <strong>Statistiques détaillées</strong> - Accédez aux performances complètes des joueurs</li>
                <li>💬 <strong>Communication directe</strong> - Échangez avec les joueurs et autres recruteurs</li>
                <li>📅 <strong>Gestion d'événements</strong> - Créez et gérez vos tryouts, camps ou matchs</li>
                <li>📝 <strong>Création de formations</strong> - Organisez vos équipes et lineups</li>
                <li>⭐ <strong>Suivi des joueurs</strong> - Gérez votre liste de joueurs favoris</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://192.168.1.118:3000'}/dashboard" 
                   style="display: inline-block; background: linear-gradient(to right, #7C3AED, #8B5CF6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Accéder à mon dashboard
                </a>
              </div>
              
              <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #6B7280; margin: 0; font-size: 14px;">
                  <strong>💡 Conseil :</strong> Complétez votre profil recruteur pour maximiser votre visibilité auprès des joueurs.
                </p>
              </div>
              
              <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                Besoin d'aide ? Contactez-nous à <a href="mailto:support@basketstats.com" style="color: #7C3AED;">support@basketstats.com</a>
              </p>
            </div>
          </div>
        `,
      });

      console.log(`✅ Email de validation envoyé à ${userEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email à ${userEmail}:`, error);
      return false;
    }
  }

  /**
   * Envoyer un email de notification de dévalidation de compte
   */
  async sendAccountDevalidationEmail(userEmail: string, userName: string, reason?: string) {
    try {
      await this.transporter.sendMail({
        from: `"BasketStats Admin" <${process.env.MAIL_FROM_ADDRESS || 'noreply@basketstats.com'}>`,
        to: userEmail,
        subject: '⚠️ Votre compte recruteur a été suspendu',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #DC2626, #EF4444); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🏀 BasketStats</h1>
            </div>
            
            <div style="background: #fff; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1F2937; margin-top: 0;">Bonjour ${userName},</h2>
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                Votre compte recruteur sur <strong>BasketStats</strong> a été temporairement suspendu.
              </p>
              
              ${reason ? `
                <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0;">
                  <p style="color: #991B1B; margin: 0; font-size: 14px;">
                    <strong>Raison :</strong> ${reason}
                  </p>
                </div>
              ` : ''}
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                Pour toute question ou pour demander une réactivation de votre compte, 
                veuillez contacter notre équipe de support.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:support@basketstats.com" 
                   style="display: inline-block; background: #DC2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Contacter le support
                </a>
              </div>
              
              <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                Email de support : <a href="mailto:support@basketstats.com" style="color: #7C3AED;">support@basketstats.com</a>
              </p>
            </div>
          </div>
        `,
      });

      console.log(`✅ Email de dévalidation envoyé à ${userEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email à ${userEmail}:`, error);
      return false;
    }
  }

  /**
   * Envoyer un email de notification de désactivation de compte
   */
  async sendAccountDeactivationEmail(userEmail: string, userName: string) {
    try {
      await this.transporter.sendMail({
        from: `"BasketStats Admin" <${process.env.MAIL_FROM_ADDRESS || 'noreply@basketstats.com'}>`,
        to: userEmail,
        subject: '⚠️ Votre compte a été désactivé',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #DC2626, #EF4444); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🏀 BasketStats</h1>
            </div>
            
            <div style="background: #fff; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1F2937; margin-top: 0;">Bonjour ${userName},</h2>
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                Votre compte sur <strong>BasketStats</strong> a été désactivé pour des raisons de sécurité.
              </p>
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                Vous ne pouvez plus accéder à la plateforme jusqu'à ce que votre compte soit réactivé.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:support@basketstats.com" 
                   style="display: inline-block; background: #DC2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Contacter le support
                </a>
              </div>
              
              <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                Email de support : <a href="mailto:support@basketstats.com" style="color: #7C3AED;">support@basketstats.com</a>
              </p>
            </div>
          </div>
        `,
      });

      console.log(`✅ Email de désactivation envoyé à ${userEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email à ${userEmail}:`, error);
      return false;
    }
  }

  /**
   * Envoyer un email de notification de réactivation de compte
   */
  async sendAccountReactivationEmail(userEmail: string, userName: string) {
    try {
      await this.transporter.sendMail({
        from: `"BasketStats Admin" <${process.env.MAIL_FROM_ADDRESS || 'noreply@basketstats.com'}>`,
        to: userEmail,
        subject: '✅ Votre compte a été réactivé !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #059669, #10B981); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🏀 BasketStats</h1>
            </div>
            
            <div style="background: #fff; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1F2937; margin-top: 0;">Bienvenue de retour ${userName} !</h2>
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                Votre compte sur <strong>BasketStats</strong> a été réactivé. 🎉
              </p>
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités de la plateforme.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login" 
                   style="display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Se connecter
                </a>
              </div>
              
              <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                Merci de votre compréhension et bienvenue de retour sur BasketStats !
              </p>
            </div>
          </div>
        `,
      });

      console.log(`✅ Email de réactivation envoyé à ${userEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email à ${userEmail}:`, error);
      return false;
    }
  }
}

