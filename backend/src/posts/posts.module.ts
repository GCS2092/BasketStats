import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [NotificationsModule, SubscriptionModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

