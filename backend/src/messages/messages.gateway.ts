import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      // Accepter toutes les origines en développement (localhost et réseau local)
      if (!origin || 
          origin.includes('localhost') || 
          origin.includes('127.0.0.1') || 
          origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||
          origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/) ||
          origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('MessagesGateway');
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  /**
   * Émettre une notification à un utilisateur spécifique
   */
  emitNotification(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('newNotification', notification);
      this.logger.log(`Notification envoyée à ${userId}`);
    }
  }

  /**
   * Émettre un nouveau message dans une conversation
   */
  emitMessage(conversationId: string, message: any) {
    this.server.to(conversationId).emit('newMessage', message);
    this.logger.log(`Message envoyé dans conversation ${conversationId}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`);
    // Retirer de la map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    this.connectedUsers.set(userId, client.id);
    this.logger.log(`Utilisateur ${userId} enregistré avec socket ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { conversationId: string; senderId: string; body: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message reçu: ${JSON.stringify(data)}`);
    
    // Broadcast le message aux participants de la conversation
    this.server.to(data.conversationId).emit('newMessage', {
      conversationId: data.conversationId,
      senderId: data.senderId,
      body: data.body,
      createdAt: new Date(),
    });
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
    this.logger.log(`Socket ${client.id} a rejoint la conversation ${conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(conversationId);
    this.logger.log(`Socket ${client.id} a quitté la conversation ${conversationId}`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; userId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.conversationId).emit('userTyping', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }
}

