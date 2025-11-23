import { Module } from '@nestjs/common';
import { PaytechController } from './paytech.controller';
import { PaytechService } from './paytech.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionEmailService } from '../subscription/subscription-email.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PaytechController],
  providers: [PaytechService, SubscriptionService, SubscriptionEmailService, PrismaService],
  exports: [PaytechService],
})
export class PaytechModule {}
