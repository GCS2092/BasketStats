-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('STATUTES', 'LICENSE', 'INSURANCE', 'FINANCIAL', 'FACILITIES');

-- CreateEnum
CREATE TYPE "ClubRole" AS ENUM ('PRESIDENT', 'DIRECTOR', 'COACH', 'ASSISTANT', 'PLAYER', 'STAFF', 'SCOUT');

-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "federation_id" TEXT,
ADD COLUMN     "license_number" TEXT,
ADD COLUMN     "responsible_user_id" UUID,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by" UUID,
ADD COLUMN     "status" "ClubStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "submitted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "club_documents" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "mime_type" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_members" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "ClubRole" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "club_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "club_documents_club_id_idx" ON "club_documents"("club_id");

-- CreateIndex
CREATE INDEX "club_documents_type_idx" ON "club_documents"("type");

-- CreateIndex
CREATE INDEX "club_members_club_id_idx" ON "club_members"("club_id");

-- CreateIndex
CREATE INDEX "club_members_user_id_idx" ON "club_members"("user_id");

-- CreateIndex
CREATE INDEX "club_members_role_idx" ON "club_members"("role");

-- CreateIndex
CREATE UNIQUE INDEX "club_members_club_id_user_id_key" ON "club_members"("club_id", "user_id");

-- CreateIndex
CREATE INDEX "clubs_status_idx" ON "clubs"("status");

-- CreateIndex
CREATE INDEX "clubs_responsible_user_id_idx" ON "clubs"("responsible_user_id");

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_documents" ADD CONSTRAINT "club_documents_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
