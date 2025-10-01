-- Step 2: Add missing columns to songs table
-- Run this after step 1 completes successfully

ALTER TABLE songs
ADD COLUMN IF NOT EXISTS song_type VARCHAR(20) DEFAULT 'Slow';