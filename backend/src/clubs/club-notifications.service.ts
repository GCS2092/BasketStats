import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ClubNotificationsService {
  private transporter: nodemailer.Transporter;

  private isEmailConfigured(): boolean {
    return !!(process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD);
  }

  constructor() {
    // Configurer le transporteur email seulement si les credentials sont configurés
    if (this.isEmailConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });
    } else {
      console.warn('⚠️ [ClubNotifications] SMTP non configuré - Les emails de club ne seront pas envoyés');
    }
  }

  /**
   * Email de confirmation de soumission de club
   */
  async sendClubSubmissionEmail(to: string, recipientName: string, clubName: string) {
    if (!this.isEmailConfigured() || !this.transporter) {
      console.warn(`⚠️ [ClubNotifications] SMTP non configuré - Email de soumission de club non envoyé à ${to}`);
      return;
    }

    const subject = '📝 Demande de création de club soumise';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏀 BasketStats</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Bonjour <strong>${recipientName}</strong>,</p>
          <p>Votre demande de création du club <strong>${clubName}</strong> a été soumise avec succès ! 🎉</p>
          <p>Notre équipe va examiner votre demande et vérifier les informations fournies.</p>
          <p><strong>Prochaines étapes :</strong></p>
          <ul style="list-style-type: disc; margin-left: 20px; padding-left: 0;">
            <li>📋 Examen de votre demande par notre équipe</li>
            <li>✅ Validation des informations et documents</li>
            <li>📧 Notification de la décision par email</li>
          </ul>
          <p>Ce processus prend généralement <strong>24 à 48 heures</strong>.</p>
          <p style="margin-top: 30px;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <p>L'équipe BasketStats</p>
        </div>
        <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          Ceci est un email automatique, merci de ne pas y répondre.
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`📧 Email de soumission de club envoyé à ${to}`);
  }

  /**
   * Email d'approbation de club
   */
  async sendClubApprovalEmail(to: string, recipientName: string, clubName: string, clubId: string) {
    const subject = '🎉 Votre club a été approuvé !';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏀 BasketStats</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Bonjour <strong>${recipientName}</strong>,</p>
          <p>Excellente nouvelle ! Votre club <strong>${clubName}</strong> a été <strong>approuvé</strong> par notre équipe ! 🎉</p>
          <p>Vous êtes maintenant <strong>Président</strong> de ce club et avez accès à toutes les fonctionnalités de gestion :</p>
          <ul style="list-style-type: disc; margin-left: 20px; padding-left: 0;">
            <li>👥 <strong>Gestion des membres</strong> - Ajoutez des directeurs, coachs, joueurs, staff</li>
            <li>🏀 <strong>Création d'équipes</strong> - Organisez vos équipes par catégories (Pro, U21, U19, etc.)</li>
            <li>📅 <strong>Organisation d'événements</strong> - Créez des tryouts, matchs, camps d'entraînement</li>
            <li>📊 <strong>Statistiques</strong> - Suivez l'activité et les performances de votre club</li>
            <li>🔍 <strong>Recrutement</strong> - Recherchez et contactez des joueurs talentueux</li>
          </ul>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/clubs/${clubId}/manage" style="background-color: #3B82F6; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">
              🏢 Gérer mon club
            </a>
          </p>
          <p style="margin-top: 30px;">Félicitations et bienvenue dans la communauté BasketStats !</p>
          <p>L'équipe BasketStats</p>
        </div>
        <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          Ceci est un email automatique, merci de ne pas y répondre.
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`📧 Email d'approbation de club envoyé à ${to}`);
  }

  /**
   * Email de rejet de club
   */
  async sendClubRejectionEmail(to: string, recipientName: string, clubName: string, reason?: string) {
    const subject = '❌ Demande de club non approuvée';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #EF4444; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏀 BasketStats</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Bonjour <strong>${recipientName}</strong>,</p>
          <p>Nous vous informons que votre demande de création du club <strong>${clubName}</strong> n'a pas été approuvée.</p>
          ${reason ? `
            <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #991B1B;"><strong>Raison :</strong></p>
              <p style="margin: 5px 0 0 0; color: #991B1B;">${reason}</p>
            </div>
          ` : ''}
          <p><strong>Que faire maintenant ?</strong></p>
          <ul style="list-style-type: disc; margin-left: 20px; padding-left: 0;">
            <li>Vérifiez que toutes les informations fournies sont correctes et complètes</li>
            <li>Assurez-vous d'avoir fourni les documents officiels requis</li>
            <li>Vous pouvez soumettre une nouvelle demande après correction</li>
          </ul>
          <p style="margin-top: 30px;">Pour plus d'informations, contactez-nous à <a href="mailto:support@basketstats.com">support@basketstats.com</a>.</p>
          <p>L'équipe BasketStats</p>
        </div>
        <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          Ceci est un email automatique, merci de ne pas y répondre.
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`📧 Email de rejet de club envoyé à ${to}`);
  }

  /**
   * Email de suspension de club
   */
  async sendClubSuspensionEmail(to: string, recipientName: string, clubName: string) {
    const subject = '🚫 Votre club a été suspendu';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #F59E0B; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏀 BasketStats</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Bonjour <strong>${recipientName}</strong>,</p>
          <p>Nous vous informons que votre club <strong>${clubName}</strong> a été <strong>suspendu</strong>.</p>
          <p>Cette décision peut être due à diverses raisons, notamment :</p>
          <ul style="list-style-type: disc; margin-left: 20px; padding-left: 0;">
            <li>Non-respect des conditions d'utilisation</li>
            <li>Activités suspectes ou frauduleuses</li>
            <li>Plaintes répétées d'utilisateurs</li>
            <li>Informations incorrectes ou trompeuses</li>
          </ul>
          <p>Pendant la suspension, votre club n'est plus visible publiquement et les fonctionnalités sont limitées.</p>
          <p style="margin-top: 30px;">Pour contester cette décision ou obtenir plus d'informations, contactez-nous à <a href="mailto:support@basketstats.com">support@basketstats.com</a>.</p>
          <p>L'équipe BasketStats</p>
        </div>
        <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          Ceci est un email automatique, merci de ne pas y répondre.
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`📧 Email de suspension de club envoyé à ${to}`);
  }

  /**
   * Email de notification d'ajout à un club
   */
  async sendClubMemberAddedEmail(to: string, recipientName: string, clubName: string, role: string, clubId: string) {
    const roleLabels: any = {
      PRESIDENT: 'Président',
      DIRECTOR: 'Directeur Sportif',
      COACH: 'Entraîneur',
      ASSISTANT: 'Assistant Coach',
      PLAYER: 'Joueur',
      STAFF: 'Personnel',
      SCOUT: 'Scout',
    };

    const subject = `🏀 Vous avez rejoint ${clubName} !`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏀 BasketStats</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Bonjour <strong>${recipientName}</strong>,</p>
          <p>Félicitations ! Vous êtes maintenant membre du club <strong>${clubName}</strong> ! 🎉</p>
          <p>Votre rôle dans le club : <strong>${roleLabels[role] || role}</strong></p>
          <p><strong>Que pouvez-vous faire maintenant ?</strong></p>
          <ul style="list-style-type: disc; margin-left: 20px; padding-left: 0;">
            <li>👥 Voir les autres membres du club</li>
            <li>📅 Participer aux événements organisés</li>
            <li>💬 Communiquer avec les autres membres</li>
            <li>📊 Suivre l'activité du club</li>
            ${role === 'PRESIDENT' || role === 'DIRECTOR' ? '<li>⚙️ Gérer le club et ses équipes</li>' : ''}
          </ul>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/clubs/${clubId}" style="background-color: #3B82F6; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">
              🏢 Voir mon club
            </a>
          </p>
          <p style="margin-top: 30px;">Bienvenue dans l'équipe !</p>
          <p>L'équipe BasketStats</p>
        </div>
        <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          Ceci est un email automatique, merci de ne pas y répondre.
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`📧 Email d'ajout au club envoyé à ${to}`);
  }

  /**
   * Email de notification au créateur quand le club est approuvé
   */
  async sendClubApprovedAsPresidentEmail(to: string, recipientName: string, clubName: string, clubId: string) {
    const subject = '👑 Vous êtes maintenant Président !';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #8B5CF6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏀 BasketStats</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Bonjour <strong>${recipientName}</strong>,</p>
          <p>Excellente nouvelle ! Votre club <strong>${clubName}</strong> a été <strong>approuvé</strong> ! 🎉</p>
          <p>Vous avez été automatiquement nommé <strong>Président</strong> du club. 👑</p>
          <p><strong>En tant que Président, vous pouvez maintenant :</strong></p>
          <ul style="list-style-type: disc; margin-left: 20px; padding-left: 0;">
            <li>👥 <strong>Ajouter des membres</strong> - Invitez des directeurs, coachs, joueurs, staff</li>
            <li>🎯 <strong>Modifier les rôles</strong> - Assignez les responsabilités appropriées</li>
            <li>🏀 <strong>Créer des équipes</strong> - Organisez vos équipes par catégories (Pro, Espoirs, Jeunes)</li>
            <li>👨‍💼 <strong>Nommer des coachs</strong> - Assignez un coach responsable par équipe</li>
            <li>📅 <strong>Organiser des événements</strong> - Créez des tryouts, matchs, camps</li>
            <li>📊 <strong>Gérer le club</strong> - Accédez à toutes les fonctionnalités de gestion</li>
          </ul>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/clubs/${clubId}/manage" style="background-color: #8B5CF6; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">
              ⚙️ Gérer mon club
            </a>
          </p>
          <p style="margin-top: 30px;">Félicitations et bon succès avec votre club !</p>
          <p>L'équipe BasketStats</p>
        </div>
        <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          Ceci est un email automatique, merci de ne pas y répondre.
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`📧 Email de nomination président envoyé à ${to}`);
  }

  /**
   * Email de notification aux admins quand un nouveau club est soumis
   */
  async notifyAdminsNewClub(clubName: string, responsibleName: string, clubId: string) {
    // Récupérer tous les admins
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, fullName: true },
    });

    await prisma.$disconnect();

    // Envoyer un email à chaque admin
    for (const admin of admins) {
      const subject = '🏢 Nouveau club en attente d\'approbation';
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #F59E0B; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🏀 BasketStats Admin</h1>
          </div>
          <div style="padding: 20px; color: #333;">
            <p>Bonjour <strong>${admin.fullName || 'Admin'}</strong>,</p>
            <p>Un nouveau club a été soumis et attend votre validation :</p>
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Nom du club :</strong> ${clubName}</p>
              <p style="margin: 5px 0 0 0;"><strong>Créé par :</strong> ${responsibleName}</p>
            </div>
            <p>Veuillez examiner cette demande dès que possible.</p>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/admin/clubs" style="background-color: #F59E0B; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                🛡️ Examiner la demande
              </a>
            </p>
            <p style="margin-top: 30px;">L'équipe BasketStats</p>
          </div>
          <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
            Ceci est un email automatique, merci de ne pas y répondre.
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: admin.email,
        subject,
        html: htmlContent,
      });
    }
    
    console.log(`📧 Notification envoyée à ${admins.length} admin(s)`);
  }
}
