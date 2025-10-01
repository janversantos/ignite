-- Database Migration Script for Chord Sections Feature
-- Run this in your Supabase SQL Editor to add the chord_sections table and required fields

-- First, add new fields to the songs table if they don't exist
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS song_type VARCHAR(20) DEFAULT 'Slow',
ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS tempo INTEGER,
ADD COLUMN IF NOT EXISTS time_signature VARCHAR(10),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create the chord_sections table
CREATE TABLE IF NOT EXISTS chord_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL, -- 'verse', 'chorus', 'bridge', etc.
    section_label VARCHAR(100) NOT NULL, -- 'Verse 1', 'Chorus', etc.
    content TEXT, -- lyrics content
    chords TEXT, -- chord progression for this section
    section_order INTEGER DEFAULT 0, -- order of sections in the song
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chord_sections_song_id ON chord_sections(song_id);
CREATE INDEX IF NOT EXISTS idx_chord_sections_section_order ON chord_sections(song_id, section_order);

-- Create updated_at trigger for chord_sections
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to chord_sections table
DROP TRIGGER IF EXISTS update_chord_sections_updated_at ON chord_sections;
CREATE TRIGGER update_chord_sections_updated_at
    BEFORE UPDATE ON chord_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE chord_sections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chord_sections (adjust based on your auth setup)
-- Allow authenticated users to read all chord sections
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON chord_sections
    FOR SELECT USING (true);

-- Allow authenticated users to insert chord sections
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON chord_sections
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update chord sections
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users only" ON chord_sections
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete chord sections
CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users only" ON chord_sections
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the table was created successfully
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'chord_sections'
ORDER BY ordinal_position;