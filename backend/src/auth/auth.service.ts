import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto, OAuthLoginDto, SendOtpDto, ResetPasswordDto } from './dto';
import { UserRole } from '@prisma/client';
import { AuthOtpService } from './auth-otp.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private otpService: AuthOtpService,
    private subscriptionService: SubscriptionService,
  ) {}

  async signup(dto: SignupDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        fullName: dto.fullName,
        role: dto.role || UserRole.PLAYER,
        bio: dto.bio,
        verified: true, // Auto-vérifier les utilisateurs simples
        active: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        verified: true,
        createdAt: true,
      },
    });

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        playerProfile: true,
        recruiterProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier que l'utilisateur a un mot de passe (pas OAuth only)
    if (!user.passwordHash) {
      throw new BadRequestException(
        'Ce compte utilise une connexion OAuth. Utilisez Google ou Facebook pour vous connecter.',
      );
    }

    // Vérifier le mot de passe
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si le compte est actif
    if (!user.active) {
      throw new UnauthorizedException('Ce compte a été désactivé');
    }

    // Mettre à jour lastLogin
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Vérifier l'abonnement de l'utilisateur
    const hasActiveSubscription = await this.subscriptionService.hasActiveSubscription(user.id);

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Retourner les données sans le passwordHash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        hasActiveSubscription,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Accès refusé');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return tokens;
  }

  async logout(userId: string) {
    // Pour l'instant simple (pas de blacklist token)
    // En production, on pourrait blacklister le token dans Redis
    return { message: 'Déconnexion réussie' };
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        verified: true,
        active: true,
      },
    });

    if (!user || !user.active) {
      return null;
    }

    return user;
  }

  /**
   * Authentification OAuth (Google/Facebook)
   * Crée automatiquement l'utilisateur s'il n'existe pas
   * Par défaut, tous les utilisateurs OAuth sont des PLAYERS
   */
  async oauthLogin(dto: OAuthLoginDto) {
    // Chercher si l'utilisateur existe déjà
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        playerProfile: true,
        recruiterProfile: true,
      },
    });

    // Si l'utilisateur n'existe pas, le créer
    if (!user) {
      // IMPORTANT : Par défaut, les connexions OAuth créent des comptes PLAYER
      const role = dto.role || UserRole.PLAYER;

      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          fullName: dto.fullName,
          avatarUrl: dto.avatarUrl,
          role: role,
          passwordHash: null, // Pas de mot de passe pour OAuth
          verified: true, // Email vérifié par le provider OAuth
          active: true,
        },
        include: {
          playerProfile: true,
          recruiterProfile: true,
        },
      });

      // Si c'est un joueur, créer automatiquement son profil certifié et public
      if (role === UserRole.PLAYER) {
        await this.prisma.playerProfile.create({
          data: {
            userId: user.id,
            certified: true,
            privacyLevel: 'PUBLIC',
            position: 'PG', // Position par défaut
            level: 'AMATEUR', // Niveau par défaut
            availability: 'IMMEDIATELY'
          },
        });
      }
    } else {
      // Mettre à jour l'avatar si fourni
      if (dto.avatarUrl && dto.avatarUrl !== user.avatarUrl) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: dto.avatarUrl },
          include: {
            playerProfile: true,
            recruiterProfile: true,
          },
        });
      }
    }

    // Vérifier que le compte est actif
    if (!user.active) {
      throw new UnauthorizedException('Ce compte a été désactivé');
    }

    // Mettre à jour lastLogin
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Retourner les données sans le passwordHash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Envoyer un code OTP pour réinitialisation de mot de passe
   */
  async sendPasswordResetOtp(email: string) {
    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Aucun compte avec cet email');
    }

    // Envoyer le code OTP
    await this.otpService.sendOtp(email);

    return { message: 'Code de vérification envoyé par email' };
  }

  /**
   * Réinitialiser le mot de passe avec code OTP
   */
  async resetPassword(dto: ResetPasswordDto) {
    // Vérifier le code OTP
    const isValid = this.otpService.verifyOtp(dto.email, dto.code);

    if (!isValid) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Mettre à jour le mot de passe
    await this.prisma.user.update({
      where: { email: dto.email },
      data: { passwordHash: hashedPassword },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  /**
   * Envoyer code OTP pour vérification email (inscription)
   */
  async sendVerificationOtp(email: string) {
    await this.otpService.sendOtp(email);
    return { message: 'Code de vérification envoyé par email' };
  }

  /**
   * Vérifier code OTP
   */
  async verifyOtp(email: string, code: string) {
    const isValid = this.otpService.verifyOtp(email, code);
    
    if (!isValid) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    return { message: 'Code vérifié avec succès', valid: true };
  }
}


