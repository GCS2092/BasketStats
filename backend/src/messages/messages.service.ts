import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createConversation(userId: string, otherUserId: string) {
    // Vérifier si une conversation existe déjà
    const existing = await this.prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [userId, otherUserId],
            },
          },
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Créer nouvelle conversation
    return this.prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getConversationMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(conversationId: string, senderId: string, body: string) {
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        body,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Mettre à jour la conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: body,
        lastMessageAt: new Date(),
      },
    });

    return message;
  }

  async deleteMessage(conversationId: string, messageId: string, userId: string) {
    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Supprimer le message
    return this.prisma.message.delete({
      where: {
        id: messageId,
        conversationId,
      },
    });
  }

  async deleteConversation(conversationId: string, userId: string) {
    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Supprimer la conversation (cascade supprimera les messages)
    return this.prisma.conversation.delete({
      where: { id: conversationId },
    });
  }
}

