-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "club_applications" (
    "id" TEXT NOT NULL,
    "club_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "position" "Position",
    "experience" TEXT,
    "availability" TEXT,
    "response" TEXT,
    "responded_by" UUID,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "club_applications_club_id_idx" ON "club_applications"("club_id");

-- CreateIndex
CREATE INDEX "club_applications_player_id_idx" ON "club_applications"("player_id");

-- CreateIndex
CREATE INDEX "club_applications_status_idx" ON "club_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "club_applications_club_id_player_id_key" ON "club_applications"("club_id", "player_id");

-- AddForeignKey
ALTER TABLE "club_applications" ADD CONSTRAINT "club_applications_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_applications" ADD CONSTRAINT "club_applications_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_applications" ADD CONSTRAINT "club_applications_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
