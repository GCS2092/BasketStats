import { Module } from '@nestjs/common';
import { RecruitService } from './recruit.service';
import { RecruitController } from './recruit.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { MessagesModule } from '../messages/messages.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [NotificationsModule, MessagesModule, SubscriptionModule],
  controllers: [RecruitController],
  providers: [RecruitService],
})
export class RecruitModule {}

