-- CreateEnum
CREATE TYPE "TeamCategory" AS ENUM ('PROFESSIONAL', 'ESPOIRS_U21', 'ESPOIRS_U19', 'JUNIOR_U17', 'JUNIOR_U15', 'MINIME_U13', 'FEMININE');

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TeamCategory" NOT NULL,
    "season" TEXT NOT NULL,
    "head_coach_id" UUID,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_players" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "jersey_number" INTEGER,
    "position" "Position",
    "is_captain" BOOLEAN NOT NULL DEFAULT false,
    "is_starter" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "team_players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teams_club_id_idx" ON "teams"("club_id");

-- CreateIndex
CREATE INDEX "teams_category_idx" ON "teams"("category");

-- CreateIndex
CREATE INDEX "teams_season_idx" ON "teams"("season");

-- CreateIndex
CREATE INDEX "teams_head_coach_id_idx" ON "teams"("head_coach_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_club_id_name_season_key" ON "teams"("club_id", "name", "season");

-- CreateIndex
CREATE INDEX "team_players_team_id_idx" ON "team_players"("team_id");

-- CreateIndex
CREATE INDEX "team_players_player_id_idx" ON "team_players"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_players_team_id_player_id_key" ON "team_players"("team_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_players_team_id_jersey_number_key" ON "team_players"("team_id", "jersey_number");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_head_coach_id_fkey" FOREIGN KEY ("head_coach_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
