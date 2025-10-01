-- Step 4: Add remaining columns and create indexes
-- Run this after step 3 completes successfully

ALTER TABLE songs
ADD COLUMN IF NOT EXISTS tempo INTEGER,
ADD COLUMN IF NOT EXISTS time_signature VARCHAR(10),
ADD COLUMN IF NOT EXISTS notes TEXT;