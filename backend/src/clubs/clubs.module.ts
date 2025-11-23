import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';
import { ClubMembersService } from './club-members.service';
import { TeamsService } from './teams.service';
import { ClubNotificationsService } from './club-notifications.service';
import { ClubApplicationsService } from './club-applications.service';
import { ClubApplicationsController } from './club-applications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PrismaModule, SubscriptionModule],
  controllers: [ClubsController, ClubApplicationsController],
  providers: [ClubsService, ClubMembersService, TeamsService, ClubNotificationsService, ClubApplicationsService],
  exports: [ClubsService, ClubMembersService, TeamsService, ClubNotificationsService, ClubApplicationsService],
})
export class ClubsModule {}

