-- CreateTable
CREATE TABLE "moderation_warnings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "issues" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_warnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_blocks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "moderation_warnings_user_id_idx" ON "moderation_warnings"("user_id");

-- CreateIndex
CREATE INDEX "moderation_warnings_created_at_idx" ON "moderation_warnings"("created_at");

-- CreateIndex
CREATE INDEX "moderation_blocks_user_id_idx" ON "moderation_blocks"("user_id");

-- CreateIndex
CREATE INDEX "moderation_blocks_created_at_idx" ON "moderation_blocks"("created_at");
