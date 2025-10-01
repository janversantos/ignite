-- Add new category fields to songs table
ALTER TABLE songs
ADD COLUMN category VARCHAR(50) DEFAULT 'Contemporary',
ADD COLUMN song_type VARCHAR(20) DEFAULT 'Slow',
ADD COLUMN language VARCHAR(20) DEFAULT 'English',
ADD COLUMN tempo INTEGER,
ADD COLUMN time_signature VARCHAR(10) DEFAULT '4/4',
ADD COLUMN notes TEXT;

-- Update chord_sections table to match new column names
ALTER TABLE chord_sections
RENAME COLUMN section_name TO section_type;

ALTER TABLE chord_sections
ADD COLUMN section_label VARCHAR(100),
ADD COLUMN content TEXT;

-- Update section_type to match enum values
UPDATE chord_sections
SET section_label = section_type
WHERE section_label IS NULL;

-- Rename chord_progression to chords for consistency
ALTER TABLE chord_sections
RENAME COLUMN chord_progression TO chords;

-- Rename lyrics to content for consistency
ALTER TABLE chord_sections
DROP COLUMN lyrics;

-- Remove key column from chord_sections as we handle transposition at display time
ALTER TABLE chord_sections
DROP COLUMN key;