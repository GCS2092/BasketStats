-- Add missing columns to player_profiles table
ALTER TABLE "player_profiles" 
ADD COLUMN IF NOT EXISTS "full_name" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "date_of_birth" DATE,
ADD COLUMN IF NOT EXISTS "birth_place" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "nationality" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "wingspan" INTEGER,
ADD COLUMN IF NOT EXISTS "sporting_background" TEXT;

