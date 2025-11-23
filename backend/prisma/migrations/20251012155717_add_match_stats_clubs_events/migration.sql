-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MATCH', 'TRYOUT', 'TRAINING_CAMP', 'SHOWCASE', 'TOURNAMENT');

-- CreateTable
CREATE TABLE "match_stats" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "match_date" DATE NOT NULL,
    "opponent" TEXT NOT NULL,
    "home_away" TEXT,
    "result" TEXT,
    "score" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "field_goals_made" INTEGER NOT NULL DEFAULT 0,
    "field_goals_attempted" INTEGER NOT NULL DEFAULT 0,
    "three_pointers_made" INTEGER NOT NULL DEFAULT 0,
    "three_pointers_attempted" INTEGER NOT NULL DEFAULT 0,
    "free_throws_made" INTEGER NOT NULL DEFAULT 0,
    "free_throws_attempted" INTEGER NOT NULL DEFAULT 0,
    "rebounds" INTEGER NOT NULL DEFAULT 0,
    "offensive_rebounds" INTEGER NOT NULL DEFAULT 0,
    "defensive_rebounds" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "steals" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "turnovers" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "minutes_played" INTEGER,
    "performance" TEXT,
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "logo" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "league" TEXT,
    "division" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "arena" TEXT,
    "arena_capacity" INTEGER,
    "founded" INTEGER,
    "colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "budget" INTEGER,
    "recruiter_id" UUID,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "type" "EventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "club_id" UUID,
    "max_participants" INTEGER,
    "participants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requirements" TEXT,
    "registration_url" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_stats_player_id_idx" ON "match_stats"("player_id");

-- CreateIndex
CREATE INDEX "match_stats_match_date_idx" ON "match_stats"("match_date");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_name_key" ON "clubs"("name");

-- CreateIndex
CREATE INDEX "clubs_country_idx" ON "clubs"("country");

-- CreateIndex
CREATE INDEX "clubs_league_idx" ON "clubs"("league");

-- CreateIndex
CREATE INDEX "clubs_verified_idx" ON "clubs"("verified");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "events"("start_date");

-- CreateIndex
CREATE INDEX "events_club_id_idx" ON "events"("club_id");

-- CreateIndex
CREATE INDEX "events_visibility_idx" ON "events"("visibility");

-- CreateIndex
CREATE INDEX "events_featured_idx" ON "events"("featured");

-- AddForeignKey
ALTER TABLE "match_stats" ADD CONSTRAINT "match_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
