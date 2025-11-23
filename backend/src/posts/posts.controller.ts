import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../guards/subscription.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async create(@GetUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.postsService.findAll(page, limit);
  }

  @Get('feed/mixed')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async getMixedFeed(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.postsService.getMixedFeed(page, limit);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async toggleLike(@Param('id') postId: string, @GetUser('id') userId: string) {
    return this.postsService.toggleLike(postId, userId);
  }

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async addComment(
    @Param('id') postId: string,
    @GetUser('id') userId: string,
    @Body('content') content: string,
  ) {
    return this.postsService.addComment(postId, userId, content);
  }

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async getComments(@Param('id') postId: string) {
    return this.postsService.getComments(postId);
  }
}

