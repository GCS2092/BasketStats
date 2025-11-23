import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendshipStatus } from '@prisma/client';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  // Envoyer une demande d'amitié
  async sendFriendRequest(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Vous ne pouvez pas vous ajouter vous-même comme ami');
    }

    // Vérifier si l'utilisateur existe
    const addressee = await this.prisma.user.findUnique({
      where: { id: addresseeId },
    });

    if (!addressee) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si une demande existe déjà
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        throw new BadRequestException('Une demande d\'amitié est déjà en attente');
      }
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new BadRequestException('Vous êtes déjà amis avec cet utilisateur');
      }
      if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        throw new BadRequestException('Cette amitié a été bloquée');
      }
    }

    // Créer la demande d'amitié
    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        addressee: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return friendship;
  }

  // Accepter une demande d'amitié
  async acceptFriendRequest(friendshipId: string, userId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        addressee: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    if (!friendship) {
      throw new NotFoundException('Demande d\'amitié non trouvée');
    }

    if (friendship.addresseeId !== userId) {
      throw new BadRequestException('Vous ne pouvez pas accepter cette demande');
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    const updatedFriendship = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.ACCEPTED },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        addressee: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return updatedFriendship;
  }

  // Refuser une demande d'amitié
  async declineFriendRequest(friendshipId: string, userId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Demande d\'amitié non trouvée');
    }

    if (friendship.addresseeId !== userId) {
      throw new BadRequestException('Vous ne pouvez pas refuser cette demande');
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    const updatedFriendship = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.DECLINED },
    });

    return updatedFriendship;
  }

  // Supprimer un ami
  async removeFriend(friendshipId: string, userId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Amitié non trouvée');
    }

    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      throw new BadRequestException('Vous ne pouvez pas supprimer cette amitié');
    }

    await this.prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return { message: 'Ami supprimé avec succès' };
  }

  // Obtenir la liste des amis
  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: FriendshipStatus.ACCEPTED },
          { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            lastLogin: true,
          },
        },
        addressee: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            lastLogin: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transformer les données pour retourner les amis
    const friends = friendships.map(friendship => {
      const friend = friendship.requesterId === userId 
        ? friendship.addressee 
        : friendship.requester;
      
      return {
        id: friend.id,
        fullName: friend.fullName,
        avatarUrl: friend.avatarUrl,
        role: friend.role,
        lastLogin: friend.lastLogin,
        friendshipId: friendship.id,
        isOnline: friend.lastLogin ? 
          (new Date().getTime() - friend.lastLogin.getTime()) < 5 * 60 * 1000 : // 5 minutes
          false,
      };
    });

    return friends;
  }

  // Obtenir les demandes d'amitié reçues
  async getReceivedFriendRequests(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  // Obtenir les demandes d'amitié envoyées
  async getSentFriendRequests(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        addressee: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  // Vérifier si deux utilisateurs sont amis
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId1, addresseeId: userId2 },
          { requesterId: userId2, addresseeId: userId1 },
        ],
        status: FriendshipStatus.ACCEPTED,
      },
    });

    return !!friendship;
  }

  // Rechercher des utilisateurs
  async searchUsers(query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        fullName: {
          contains: query,
          mode: 'insensitive',
        },
        active: true,
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        bio: true,
      },
      take: 10,
    });

    return users;
  }
}
