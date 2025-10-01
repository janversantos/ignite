-- Final migration: Add missing columns to songs table
-- Run this in Supabase SQL Editor

ALTER TABLE songs
ADD COLUMN IF NOT EXISTS song_type VARCHAR(20) DEFAULT 'Slow',
ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS tempo INTEGER,
ADD COLUMN IF NOT EXISTS time_signature VARCHAR(10),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enable RLS on chord_sections if not already enabled
ALTER TABLE chord_sections ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for chord_sections
DO $$
BEGIN
    -- Check if policy already exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'chord_sections'
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON chord_sections
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'chord_sections'
        AND policyname = 'Enable insert for authenticated users only'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users only" ON chord_sections
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'chord_sections'
        AND policyname = 'Enable update for authenticated users only'
    ) THEN
        CREATE POLICY "Enable update for authenticated users only" ON chord_sections
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'chord_sections'
        AND policyname = 'Enable delete for authenticated users only'
    ) THEN
        CREATE POLICY "Enable delete for authenticated users only" ON chord_sections
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;