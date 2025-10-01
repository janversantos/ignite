-- Step 1: Create the chord_sections table
-- Run this first in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chord_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL,
    section_label VARCHAR(100) NOT NULL,
    content TEXT,
    chords TEXT,
    section_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);