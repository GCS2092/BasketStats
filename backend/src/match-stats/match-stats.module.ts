import { Module } from '@nestjs/common';
import { MatchStatsController } from './match-stats.controller';
import { MatchStatsService } from './match-stats.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MatchStatsController],
  providers: [MatchStatsService],
  exports: [MatchStatsService],
})
export class MatchStatsModule {}

