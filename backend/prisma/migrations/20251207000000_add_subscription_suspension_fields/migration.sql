-- Add missing suspension fields to subscriptions table
ALTER TABLE "subscriptions" 
ADD COLUMN IF NOT EXISTS "suspended_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "suspended_reason" TEXT,
ADD COLUMN IF NOT EXISTS "restored_at" TIMESTAMP(3);

-- Add index for suspended_at
CREATE INDEX IF NOT EXISTS "subscriptions_suspended_at_idx" ON "subscriptions"("suspended_at");

-- Add SUSPENDED status to SubscriptionStatus enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUSPENDED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SubscriptionStatus')) THEN
        ALTER TYPE "SubscriptionStatus" ADD VALUE 'SUSPENDED';
    END IF;
END $$;

