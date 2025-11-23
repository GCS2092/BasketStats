import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private gateway: any; // Référence au gateway Socket.IO

  constructor(private prisma: PrismaService) {}

  setGateway(gateway: any) {
    this.gateway = gateway;
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    payload?: any,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        payload,
      },
    });

    // Émettre via Socket.IO si le gateway est disponible
    if (this.gateway) {
      this.gateway.emitNotification(userId, notification);
    }

    return notification;
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.delete({
      where: {
        id: notificationId,
        userId, // S'assurer que l'utilisateur ne peut supprimer que ses propres notifications
      },
    });
  }

  async deleteAllNotifications(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  async hideNotification(notificationId: string, userId: string) {
    // Pour masquer, on marque comme lue et on ajoute un flag "hidden"
    return this.prisma.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
        // On pourrait ajouter un champ "hidden" dans le schéma si nécessaire
        // Pour l'instant, on utilise le payload pour stocker l'état hidden
        payload: {
          hidden: true,
        },
      },
    });
  }
}

