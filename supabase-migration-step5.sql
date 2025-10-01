-- Step 5: Create indexes and enable RLS
-- Run this after step 4 completes successfully

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chord_sections_song_id ON chord_sections(song_id);
CREATE INDEX IF NOT EXISTS idx_chord_sections_section_order ON chord_sections(song_id, section_order);

-- Enable Row Level Security
ALTER TABLE chord_sections ENABLE ROW LEVEL SECURITY;