-- Step 3: Add more columns to songs table
-- Run this after step 2 completes successfully

ALTER TABLE songs
ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'English';