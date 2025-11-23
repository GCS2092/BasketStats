import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { AutoModerationService } from './auto-moderation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ModerationController],
  providers: [ModerationService, AutoModerationService],
  exports: [ModerationService, AutoModerationService],
})
export class ModerationModule {}

