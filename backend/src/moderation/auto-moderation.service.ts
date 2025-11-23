import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AutoModerationService {
  constructor(private prisma: PrismaService) {}

  // Liste des mots interdits (à compléter selon vos besoins)
  private readonly FORBIDDEN_WORDS = [
    // Insultes et vulgarités
    'connard', 'salaud', 'enculé', 'putain', 'merde', 'con', 'idiot',
    'imbécile', 'crétin', 'débile', 'abruti', 'taré', 'nul',
    
    // Discriminations
    'raciste', 'nazi', 'fasciste', 'pédé', 'tapette', 'pd',
    
    // Violence
    'tuer', 'mort', 'suicide', 'violence', 'frapper', 'cogner',
    
    // Spam et arnaques
    'viagra', 'casino', 'bitcoin gratuit', 'argent facile', 'cliquez ici',
    
    // Coordonnées (pour éviter le spam)
    // Détection par regex séparée
  ];

  // Phrases suspectes (combinaisons)
  private readonly SUSPICIOUS_PHRASES = [
    'envoie moi ton numéro',
    'donne moi ton adresse',
    'viens en privé',
    'contacte moi sur',
    'whatsapp',
    'telegram',
    'argent rapide',
    'gagner de l\'argent',
    'investissement garanti',
  ];

  // Patterns regex pour détecter
  private readonly PATTERNS = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{0,4}/g,
    url: /(https?:\/\/[^\s]+)/g,
    repeatedChars: /(.)\1{4,}/g, // Caractères répétés 5+ fois
    capsLock: /[A-Z]{10,}/g, // 10+ majuscules consécutives
  };

  /**
   * Analyser un texte et détecter les problèmes
   */
  async analyzeContent(content: string, userId: string, contentType: 'POST' | 'COMMENT' | 'MESSAGE') {
    const issues: any[] = [];
    const contentLower = content.toLowerCase();
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let shouldBlock = false;

    // 1. Vérifier les mots interdits
    const foundWords = this.FORBIDDEN_WORDS.filter(word => 
      contentLower.includes(word.toLowerCase())
    );

    if (foundWords.length > 0) {
      issues.push({
        type: 'FORBIDDEN_WORDS',
        words: foundWords,
        severity: foundWords.length > 2 ? 'HIGH' : 'MEDIUM',
      });
      severity = foundWords.length > 2 ? 'HIGH' : 'MEDIUM';
      shouldBlock = foundWords.length > 2; // Bloquer si 3+ mots interdits
    }

    // 2. Vérifier les phrases suspectes
    const foundPhrases = this.SUSPICIOUS_PHRASES.filter(phrase => 
      contentLower.includes(phrase.toLowerCase())
    );

    if (foundPhrases.length > 0) {
      issues.push({
        type: 'SUSPICIOUS_PHRASES',
        phrases: foundPhrases,
        severity: 'MEDIUM',
      });
      if (severity === 'LOW') severity = 'MEDIUM';
    }

    // 3. Détecter les emails
    const emails = content.match(this.PATTERNS.email);
    if (emails && emails.length > 0) {
      issues.push({
        type: 'EMAIL_DETECTED',
        emails: emails,
        severity: 'MEDIUM',
      });
      if (severity === 'LOW') severity = 'MEDIUM';
    }

    // 4. Détecter les numéros de téléphone
    const phones = content.match(this.PATTERNS.phone);
    if (phones && phones.length > 0) {
      issues.push({
        type: 'PHONE_DETECTED',
        phones: phones,
        severity: 'MEDIUM',
      });
      if (severity === 'LOW') severity = 'MEDIUM';
    }

    // 5. Détecter les URLs suspectes
    const urls = content.match(this.PATTERNS.url);
    if (urls && urls.length > 0) {
      // Vérifier si ce sont des URLs de spam
      const suspiciousUrls = urls.filter(url => 
        !url.includes('basketstats') && 
        !url.includes('youtube') && 
        !url.includes('instagram')
      );
      
      if (suspiciousUrls.length > 0) {
        issues.push({
          type: 'SUSPICIOUS_URL',
          urls: suspiciousUrls,
          severity: 'HIGH',
        });
        severity = 'HIGH';
        shouldBlock = true; // Bloquer les URLs suspectes
      }
    }

    // 6. Détecter les caractères répétés (spam)
    const repeatedChars = content.match(this.PATTERNS.repeatedChars);
    if (repeatedChars && repeatedChars.length > 2) {
      issues.push({
        type: 'SPAM_PATTERN',
        pattern: 'REPEATED_CHARS',
        severity: 'LOW',
      });
    }

    // 7. Détecter le CAPS LOCK excessif
    const capsLock = content.match(this.PATTERNS.capsLock);
    if (capsLock && capsLock.length > 0) {
      issues.push({
        type: 'CAPS_LOCK',
        severity: 'LOW',
      });
    }

    // 8. Vérifier l'historique de l'utilisateur
    const userHistory = await this.getUserModerationHistory(userId);
    if (userHistory.warningCount > 3) {
      severity = 'CRITICAL';
      shouldBlock = true; // Bloquer si utilisateur déjà averti 3+ fois
      issues.push({
        type: 'REPEAT_OFFENDER',
        warningCount: userHistory.warningCount,
        severity: 'CRITICAL',
      });
    }

    // Résultat de l'analyse
    return {
      isClean: issues.length === 0,
      shouldBlock,
      severity,
      issues,
      score: this.calculateModerationScore(issues),
    };
  }

  /**
   * Calculer un score de modération (0-100, 100 = très suspect)
   */
  private calculateModerationScore(issues: any[]): number {
    let score = 0;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'CRITICAL':
          score += 50;
          break;
        case 'HIGH':
          score += 30;
          break;
        case 'MEDIUM':
          score += 15;
          break;
        case 'LOW':
          score += 5;
          break;
      }
    });

    return Math.min(score, 100);
  }

  /**
   * Obtenir l'historique de modération d'un utilisateur
   */
  async getUserModerationHistory(userId: string) {
    const warnings = await this.prisma.moderationWarning.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
        },
      },
    });

    const blocks = await this.prisma.moderationBlock.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      warningCount: warnings,
      blockCount: blocks,
    };
  }

  /**
   * Enregistrer un avertissement
   */
  async recordWarning(userId: string, contentType: string, content: string, issues: any[]) {
    return this.prisma.moderationWarning.create({
      data: {
        userId,
        contentType,
        content,
        issues: JSON.stringify(issues),
        createdAt: new Date(),
      },
    });
  }

  /**
   * Enregistrer un blocage
   */
  async recordBlock(userId: string, contentType: string, content: string, reason: string) {
    return this.prisma.moderationBlock.create({
      data: {
        userId,
        contentType,
        content,
        reason,
        createdAt: new Date(),
      },
    });
  }

  /**
   * Notifier les admins d'un contenu suspect
   */
  async notifyAdmins(userId: string, contentType: string, content: string, issues: any[], severity: string) {
    // Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    // Récupérer tous les admins
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, fullName: true },
    });

    // Créer une notification pour chaque admin
    for (const admin of admins) {
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'MODERATION_ALERT',
          title: `🚨 Contenu suspect détecté`,
          message: `L'utilisateur ${user?.fullName || user?.email} a publié un contenu suspect (${contentType}). Sévérité: ${severity}`,
          payload: {
            suspectUserId: userId,
            suspectUserName: user?.fullName,
            contentType,
            content: content.substring(0, 200), // Extrait
            issues,
            severity,
          },
        },
      });
    }

    console.log(`🚨 Alerte de modération envoyée à ${admins.length} admin(s)`);
  }

  /**
   * Nettoyer un texte (remplacer les mots interdits par ***)
   */
  cleanContent(content: string): string {
    let cleaned = content;
    
    this.FORBIDDEN_WORDS.forEach(word => {
      const regex = new RegExp(word, 'gi');
      cleaned = cleaned.replace(regex, '***');
    });

    return cleaned;
  }

  /**
   * Suggérer des corrections
   */
  getSuggestions(issues: any[]): string[] {
    const suggestions: string[] = [];

    issues.forEach(issue => {
      switch (issue.type) {
        case 'FORBIDDEN_WORDS':
          suggestions.push('Évitez d\'utiliser un langage offensant ou vulgaire');
          break;
        case 'SUSPICIOUS_PHRASES':
          suggestions.push('Ne partagez pas d\'informations personnelles dans les commentaires publics');
          break;
        case 'EMAIL_DETECTED':
          suggestions.push('Ne partagez pas d\'adresses email publiquement. Utilisez la messagerie privée.');
          break;
        case 'PHONE_DETECTED':
          suggestions.push('Ne partagez pas de numéros de téléphone publiquement. Utilisez la messagerie privée.');
          break;
        case 'SUSPICIOUS_URL':
          suggestions.push('Les liens externes suspects ne sont pas autorisés');
          break;
        case 'CAPS_LOCK':
          suggestions.push('Évitez d\'écrire entièrement en majuscules');
          break;
        case 'SPAM_PATTERN':
          suggestions.push('Évitez les caractères répétés excessivement');
          break;
      }
    });

    return [...new Set(suggestions)]; // Supprimer les doublons
  }
}

