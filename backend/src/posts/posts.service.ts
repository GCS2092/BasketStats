import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private subscriptionService: SubscriptionService,
  ) {}

  async create(userId: string, dto: CreatePostDto) {
    // Vérifier les limitations d'abonnement
    await this.checkPostLimitations(userId);

    return this.prisma.post.create({
      data: {
        userId,
        ...dto,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  private async checkPostLimitations(userId: string) {
    // Récupérer l'abonnement actif de l'utilisateur
    const subscription = await this.subscriptionService.getUserActiveSubscription(userId);
    
    if (!subscription) {
      throw new ForbiddenException('Un abonnement actif est requis pour créer des posts.');
    }

    const plan = subscription.plan;
    const features = plan.features as any; // Cast pour accéder aux propriétés JSON
    
    // Vérifier si la propriété posts existe dans les features
    const maxPosts = features?.posts || 0; // Par défaut 0 si pas défini

    // Si maxPosts est -1, c'est illimité
    if (maxPosts === -1) {
      return;
    }

    // Compter les posts de l'utilisateur pour cette période
    const startDate = subscription.startDate;
    const postCount = await this.prisma.post.count({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
    });

    if (postCount >= maxPosts) {
      throw new BadRequestException(
        `Limite de posts atteinte (${postCount}/${maxPosts}). Veuillez passer à un plan supérieur pour créer plus de posts.`
      );
    }
  }

  async findAll(page?: number, limit?: number) {
    // Valeurs par défaut sûres
    const validPage = page && !isNaN(page) && page > 0 ? Math.floor(page) : 1;
    const validLimit = limit && !isNaN(limit) && limit > 0 ? Math.floor(limit) : 20;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { visibility: 'PUBLIC' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (validPage - 1) * validLimit,
        take: validLimit,
      }),
      this.prisma.post.count({ where: { visibility: 'PUBLIC' } }),
    ]);

    return {
      posts,
      pagination: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  /**
   * Feed mixte : Posts + Vidéos récentes
   * Pour un vrai feed social avec contenu riche
   */
  async getMixedFeed(page?: number, limit?: number) {
    const validPage = page && !isNaN(page) && page > 0 ? Math.floor(page) : 1;
    const validLimit = limit && !isNaN(limit) && limit > 0 ? Math.floor(limit) : 20;

    // Récupérer posts et vidéos en parallèle
    const [posts, videos] = await Promise.all([
      this.prisma.post.findMany({
        where: { visibility: 'PUBLIC' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: validLimit * 2, // Prendre plus pour avoir un bon mix
      }),
      this.prisma.video.findMany({
        where: { visibility: 'PUBLIC' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: validLimit, // Moins de vidéos car plus lourdes
      }),
    ]);

    // Marquer le type de contenu et merger
    const postsWithType = posts.map((post) => ({
      ...post,
      type: 'post' as const,
    }));

    const videosWithType = videos.map((video) => ({
      ...video,
      type: 'video' as const,
    }));

    // Combiner et trier par date
    const mixedFeed = [...postsWithType, ...videosWithType].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Paginer
    const startIndex = (validPage - 1) * validLimit;
    const paginatedFeed = mixedFeed.slice(startIndex, startIndex + validLimit);

    const totalPosts = await this.prisma.post.count({ where: { visibility: 'PUBLIC' } });
    const totalVideos = await this.prisma.video.count({ where: { visibility: 'PUBLIC' } });
    const total = totalPosts + totalVideos;

    return {
      feed: paginatedFeed,
      pagination: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  async toggleLike(postId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existing) {
      await this.prisma.like.delete({
        where: { id: existing.id },
      });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      await this.prisma.like.create({
        data: { postId, userId },
      });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });

      // Créer notification pour l'auteur du post
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        include: { user: true },
      });

      const liker = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true },
      });

      if (post && post.userId !== userId) {
        await this.notificationsService.createNotification(
          post.userId,
          'post_like',
          'Nouveau like',
          `${liker?.fullName} a aimé votre publication`,
          { postId },
        );
      }

      return { liked: true };
    }
  }

  async addComment(postId: string, userId: string, content: string) {
    const comment = await this.prisma.comment.create({
      data: {
        postId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    return comment;
  }

  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
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
}

