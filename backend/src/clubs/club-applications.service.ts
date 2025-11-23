import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClubApplicationDto } from './dto/create-club-application.dto';
import { UpdateClubApplicationDto } from './dto/update-club-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ClubApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClubApplicationDto, playerId: string) {
    // Vérifier que le club existe et est approuvé
    const club = await this.prisma.club.findUnique({
      where: { id: dto.clubId },
      include: { responsibleUser: true }
    });

    if (!club) {
      throw new NotFoundException('Club non trouvé');
    }

    if (club.status !== 'APPROVED') {
      throw new ForbiddenException('Ce club n\'est pas encore approuvé');
    }

    // Vérifier que le joueur n'a pas déjà postulé
    const existingApplication = await this.prisma.clubApplication.findUnique({
      where: {
        clubId_playerId: {
          clubId: dto.clubId,
          playerId: playerId
        }
      }
    });

    if (existingApplication) {
      throw new ConflictException('Vous avez déjà postulé à ce club');
    }

    // Vérifier que le joueur n'est pas déjà membre
    const existingMembership = await this.prisma.clubMember.findFirst({
      where: {
        clubId: dto.clubId,
        userId: playerId,
        leftAt: null
      }
    });

    if (existingMembership) {
      throw new ConflictException('Vous êtes déjà membre de ce club');
    }

    // Créer la candidature
    const application = await this.prisma.clubApplication.create({
      data: {
        clubId: dto.clubId,
        playerId: playerId,
        message: dto.message,
        position: dto.position,
        experience: dto.experience,
        availability: dto.availability,
        status: 'PENDING'
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            responsibleUser: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        player: {
          select: {
            id: true,
            fullName: true,
            email: true,
            playerProfile: true
          }
        }
      }
    });

    // TODO: Envoyer notification au président du club
    // await this.notificationsService.sendClubApplicationNotification(application);

    return application;
  }

  async findAll(clubId?: string, playerId?: string, status?: ApplicationStatus) {
    const where: any = {};
    
    if (clubId) where.clubId = clubId;
    if (playerId) where.playerId = playerId;
    if (status) where.status = status;

    return this.prisma.clubApplication.findMany({
      where,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true
          }
        },
        player: {
          select: {
            id: true,
            fullName: true,
            email: true,
            playerProfile: {
              select: {
                position: true,
                heightCm: true,
                weightKg: true,
                level: true
              }
            }
          }
        },
        responder: {
          select: {
            id: true,
            fullName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const application = await this.prisma.clubApplication.findUnique({
      where: { id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            responsibleUser: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        player: {
          select: {
            id: true,
            fullName: true,
            email: true,
            playerProfile: true
          }
        },
        responder: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    if (!application) {
      throw new NotFoundException('Candidature non trouvée');
    }

    return application;
  }

  async update(id: string, dto: UpdateClubApplicationDto, userId: string) {
    const application = await this.findOne(id);

    // Vérifier les permissions
    const canUpdate = 
      application.playerId === userId || // Le joueur peut modifier sa candidature
      (application.club.responsibleUser && application.club.responsibleUser.id === userId); // Le président peut répondre

    if (!canUpdate) {
      throw new ForbiddenException('Vous n\'avez pas le droit de modifier cette candidature');
    }

    // Si c'est une réponse du club (approbation/rejet)
    if (dto.status === 'APPROVED' || dto.status === 'REJECTED') {
      // Vérifier que c'est le président qui répond
      if (!application.club.responsibleUser || application.club.responsibleUser.id !== userId) {
        throw new ForbiddenException('Seul le président du club peut approuver ou rejeter une candidature');
      }

      const updatedApplication = await this.prisma.clubApplication.update({
        where: { id },
        data: {
          status: dto.status,
          response: dto.response,
          respondedBy: userId,
          respondedAt: new Date()
        },
        include: {
          club: true,
          player: true
        }
      });

      // Si approuvé, ajouter le joueur au club
      if (dto.status === 'APPROVED') {
        await this.prisma.clubMember.create({
          data: {
            clubId: application.clubId,
            userId: application.playerId,
            role: 'PLAYER',
            joinedAt: new Date()
          }
        });

        // TODO: Envoyer notification au joueur
        // await this.notificationsService.sendApplicationApprovedNotification(application);
      } else {
        // TODO: Envoyer notification de rejet
        // await this.notificationsService.sendApplicationRejectedNotification(application);
      }

      return updatedApplication;
    }

    // Si c'est une modification par le joueur
    return this.prisma.clubApplication.update({
      where: { id },
      data: {
        message: dto.message,
        position: dto.position,
        experience: dto.experience,
        availability: dto.availability
      },
      include: {
        club: true,
        player: true
      }
    });
  }

  async withdraw(id: string, playerId: string) {
    const application = await this.findOne(id);

    if (application.playerId !== playerId) {
      throw new ForbiddenException('Vous ne pouvez retirer que vos propres candidatures');
    }

    if (application.status !== 'PENDING') {
      throw new ConflictException('Cette candidature ne peut plus être retirée');
    }

    return this.prisma.clubApplication.update({
      where: { id },
      data: {
        status: 'WITHDRAWN'
      }
    });
  }

  async remove(id: string, userId: string) {
    const application = await this.findOne(id);

    // Seul le président du club ou le joueur peuvent supprimer
    const canDelete = 
      application.playerId === userId ||
      (application.club.responsibleUser && application.club.responsibleUser.id === userId);

    if (!canDelete) {
      throw new ForbiddenException('Vous n\'avez pas le droit de supprimer cette candidature');
    }

    return this.prisma.clubApplication.delete({
      where: { id }
    });
  }

  async getClubApplications(clubId: string, userId: string) {
    // Vérifier que l'utilisateur est président du club
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      include: { responsibleUser: true }
    });

    if (!club || !club.responsibleUser || club.responsibleUser.id !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas président de ce club');
    }

    return this.findAll(clubId);
  }

  async getPlayerApplications(playerId: string) {
    return this.findAll(undefined, playerId);
  }
}
