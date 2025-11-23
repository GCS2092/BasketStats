import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionEmailService } from './subscription-email.service';
import { SubscriptionLimitsService } from './subscription-limits.service';
import { SubscriptionLimitsController } from './subscription-limits.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaytechModule } from '../paytech/paytech.module';

@Module({
  imports: [PrismaModule, PaytechModule],
  providers: [SubscriptionService, SubscriptionEmailService, SubscriptionLimitsService],
  controllers: [SubscriptionController, SubscriptionLimitsController],
  exports: [SubscriptionService, SubscriptionEmailService, SubscriptionLimitsService],
})
export class SubscriptionModule {}
