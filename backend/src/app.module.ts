import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlayersModule } from './players/players.module';
import { VideosModule } from './videos/videos.module';
import { PhotosModule } from './photos/photos.module';
import { PostsModule } from './posts/posts.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecruitModule } from './recruit/recruit.module';
import { SearchModule } from './search/search.module';
import { UploadModule } from './upload/upload.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ModerationModule } from './moderation/moderation.module';
import { FormationsModule } from './formations/formations.module';
import { MatchStatsModule } from './match-stats/match-stats.module';
import { ClubsModule } from './clubs/clubs.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';
import { NewsModule } from './news/news.module';
import { PaytechModule } from './paytech/paytech.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { FriendsModule } from './friends/friends.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting (protection DDoS basique)
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),

    // Modules fonctionnels
    PrismaModule,
    AuthModule,
    UsersModule,
    PlayersModule,
    VideosModule,
    PhotosModule,
    PostsModule,
    MessagesModule,
    NotificationsModule,
    RecruitModule,
    SearchModule,
    UploadModule,
    AnalyticsModule,
    ModerationModule,
    FormationsModule,
    MatchStatsModule,
    ClubsModule,
    EventsModule,
    AdminModule,
    NewsModule,
    PaytechModule,
    SubscriptionModule,
    OnboardingModule,
    FriendsModule,
    HealthModule,
  ],
})
export class AppModule {}

