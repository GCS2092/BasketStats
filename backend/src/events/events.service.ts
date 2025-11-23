import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un événement
   */
  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        type: dto.type,
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        location: dto.location,
        city: dto.city,
        country: dto.country,
        clubId: dto.clubId,
        maxParticipants: dto.maxParticipants,
        requirements: dto.requirements,
        registrationUrl: dto.registrationUrl,
        visibility: dto.visibility || 'PUBLIC',
        featured: dto.featured || false,
      },
      include: {
        club: true,
      },
    });
  }

  /**
   * Récupérer tous les événements
   */
  async findAll(filters?: {
    type?: string;
    upcoming?: boolean;
    clubId?: string;
    featured?: boolean;
  }) {
    const now = new Date();

    return this.prisma.event.findMany({
      where: {
        ...(filters?.type && { type: filters.type as any }),
        ...(filters?.clubId && { clubId: filters.clubId }),
        ...(filters?.featured !== undefined && { featured: filters.featured }),
        ...(filters?.upcoming && {
          startDate: {
            gte: now,
          },
        }),
        visibility: 'PUBLIC',
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { startDate: 'asc' },
      ],
    });
  }

  /**
   * Récupérer un événement par ID
   */
  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        club: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }

    return event;
  }

  /**
   * Mettre à jour un événement
   */
  async update(id: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }

    return this.prisma.event.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Supprimer un événement
   */
  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Événement supprimé' };
  }

  /**
   * Inscription à un événement
   */
  async register(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }

    // Vérifier si déjà inscrit
    if (event.participants.includes(userId)) {
      throw new BadRequestException('Déjà inscrit à cet événement');
    }

    // Vérifier le nombre max de participants
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      throw new BadRequestException('Événement complet');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        participants: {
          push: userId,
        },
      },
    });
  }

  /**
   * Désinscription d'un événement
   */
  async unregister(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Événement non trouvé');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        participants: event.participants.filter((id) => id !== userId),
      },
    });
  }

  /**
   * Récupérer les événements d'un joueur
   */
  async getPlayerEvents(userId: string) {
    return this.prisma.event.findMany({
      where: {
        participants: {
          has: userId,
        },
      },
      include: {
        club: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }
}

