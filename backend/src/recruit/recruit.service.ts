import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecruitRequestDto } from './dto/create-recruit-request.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class RecruitService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private messagesService: MessagesService,
  ) {}

  async createRequest(fromUserId: string, dto: CreateRecruitRequestDto) {
    const request = await this.prisma.recruitRequest.create({
      data: {
        fromUserId,
        ...dto,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Créer une notification pour le destinataire
    await this.notificationsService.createNotification(
      dto.toUserId,
      'recruit_request',
      'Nouvelle offre de recrutement',
      `${request.fromUser.fullName} vous a envoyé une offre : ${dto.subject || 'Sans objet'}`,
      { requestId: request.id },
    );

    return request;
  }

  async getReceivedRequests(userId: string) {
    return this.prisma.recruitRequest.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            recruiterProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSentRequests(userId: string) {
    return this.prisma.recruitRequest.findMany({
      where: { fromUserId: userId },
      include: {
        toUser: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            playerProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    const request = await this.prisma.recruitRequest.update({
      where: { id },
      data: { status: status as any },
      include: {
        fromUser: {
          select: {
            id: true,
            fullName: true,
            recruiterProfile: true,
          },
        },
        toUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // Si le joueur ACCEPTE l'offre
    if (status === 'ACCEPTED') {
      // 1. Créer automatiquement une conversation
      let conversation = await this.messagesService.createConversation(
        request.toUserId,
        request.fromUserId,
      );

      // 2. Envoyer message automatique du joueur au recruteur
      const welcomeMessage = `Bonjour ${request.fromUser.fullName} ! J'ai accepté votre offre. Je suis très intéressé(e) et souhaiterais en discuter davantage. 🏀`;
      
      await this.messagesService.sendMessage(
        conversation.id,
        request.toUserId,
        welcomeMessage,
      );

      // 3. Notifier le recruteur
      await this.notificationsService.createNotification(
        request.fromUserId,
        'offer_accepted',
        'Offre acceptée !',
        `${request.toUser.fullName} a accepté votre offre ! Une conversation a été créée.`,
        { 
          requestId: request.id,
          playerId: request.toUserId,
          conversationId: conversation.id,
        },
      );
    } else if (status === 'REJECTED') {
      // Notifier le recruteur du refus
      await this.notificationsService.createNotification(
        request.fromUserId,
        'offer_rejected',
        'Offre refusée',
        `${request.toUser.fullName} a refusé votre offre.`,
        { requestId: request.id },
      );
    }

    return request;
  }

  /**
   * Récupérer les joueurs avec qui le recruteur a une offre acceptée
   * = "Mes joueurs"
   */
  async getMyPlayers(recruiterId: string) {
    const acceptedRequests = await this.prisma.recruitRequest.findMany({
      where: {
        fromUserId: recruiterId,
        status: 'ACCEPTED',
      },
      include: {
        toUser: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            playerProfile: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return acceptedRequests.map(req => ({
      ...req.toUser,
      acceptedAt: req.updatedAt,
      requestId: req.id,
    }));
  }

  /**
   * Créer une demande de contact d'un joueur vers un recruteur
   */
  async createContactRequest(playerId: string, recruiterId: string, message: string) {
    // Créer une conversation (ou récupérer si existe déjà)
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          {
            AND: [
              { participants: { some: { userId: playerId } } },
              { participants: { some: { userId: recruiterId } } },
            ],
          },
        ],
      },
    });

    if (!conversation) {
      // Créer la conversation
      conversation = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: playerId },
              { userId: recruiterId },
            ],
          },
        },
      });
    }

    // Envoyer le message de présentation
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: playerId,
        body: message,
      },
    });

    // Créer une notification pour le recruteur
    const player = await this.prisma.user.findUnique({
      where: { id: playerId },
      select: { fullName: true },
    });

    await this.notificationsService.createNotification(
      recruiterId,
      'contact_request',
      'Nouveau joueur intéressé',
      `${player?.fullName} souhaite entrer en contact avec vous`,
      { 
        userId: playerId,
        conversationId: conversation.id,
      },
    );

    return {
      message: 'Demande de contact envoyée avec succès',
      conversationId: conversation.id,
    };
  }
}

