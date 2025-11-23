import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ProfileCompletionService } from './profile-completion.service';
import { ProfileCompletionController } from './profile-completion.controller';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsService, ProfileCompletionService],
  controllers: [NotificationsController, ProfileCompletionController],
  exports: [NotificationsService, ProfileCompletionService],
})
export class NotificationsModule {}