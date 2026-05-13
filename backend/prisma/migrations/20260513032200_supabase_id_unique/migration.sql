-- Add unique constraint to supabaseID
-- (This was already enforced on the column at creation time;
--  this migration records the schema intent explicitly.)
ALTER TABLE "User" ADD CONSTRAINT "User_supabaseID_key" UNIQUE ("supabaseID");
