import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthOtpService {
  private otpStore = new Map<string, { code: string; expiresAt: Date }>();

  constructor(private prisma: PrismaService) {}

  /**
   * Générer un code OTP à 6 chiffres
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Envoyer le code OTP par email
   */
  async sendOtp(email: string): Promise<void> {
    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Stocker le code en mémoire (ou Redis en production)
    this.otpStore.set(email, { code, expiresAt });

    // Envoyer l'email
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"BasketStats" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: email,
      subject: 'Votre code de vérification BasketStats',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">🏀 BasketStats</h1>
          <h2>Code de vérification</h2>
          <p>Votre code de vérification est :</p>
          <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1F2937; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #6B7280; margin-top: 20px;">Ce code expire dans 10 minutes.</p>
          <p style="color: #6B7280;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
        </div>
      `,
    });

    console.log(`📧 Code OTP envoyé à ${email}: ${code}`);
  }

  /**
   * Vérifier le code OTP
   */
  verifyOtp(email: string, code: string): boolean {
    const stored = this.otpStore.get(email);

    if (!stored) {
      return false;
    }

    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(email);
      return false;
    }

    if (stored.code !== code) {
      return false;
    }

    // Code valide, le supprimer
    this.otpStore.delete(email);
    return true;
  }
}

