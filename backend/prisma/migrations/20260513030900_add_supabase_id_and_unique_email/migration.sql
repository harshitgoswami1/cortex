-- Migration: add_supabase_id_and_unique_email
--
-- The `supabaseID` column is required (NOT NULL) and has no default.
-- Any existing rows must be removed before the column can be added.
-- This is safe because the existing row is dev/test data only.

-- Step 1: Remove stale rows that would block the NOT NULL constraint
DELETE FROM "User";

-- Step 2: Add the required supabaseID column
ALTER TABLE "User" ADD COLUMN "supabaseID" TEXT NOT NULL;

-- Step 3: Add the unique constraint on email
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");
