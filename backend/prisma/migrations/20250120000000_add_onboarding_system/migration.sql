-- CreateTable
CREATE TABLE "onboarding_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "total_steps" INTEGER NOT NULL DEFAULT 0,
    "completed_steps" TEXT[] NOT NULL DEFAULT '{}',
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "role" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_progress_user_id_key" ON "onboarding_progress"("user_id");

-- CreateIndex
CREATE INDEX "onboarding_progress_user_id_idx" ON "onboarding_progress"("user_id");

-- CreateIndex
CREATE INDEX "onboarding_progress_is_completed_idx" ON "onboarding_progress"("is_completed");

-- AddForeignKey
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_onboarding_progress_updated_at 
    BEFORE UPDATE ON onboarding_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
