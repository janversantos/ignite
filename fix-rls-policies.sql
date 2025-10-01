-- Fix RLS policies to allow anonymous read access
-- This allows the website to read data without authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users full access" ON worship_leaders;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON songs;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON chord_sections;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON worship_leader_songs;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON service_lineups;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON lineup_songs;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON song_tags;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON song_tag_associations;

-- Create new policies that allow anonymous read access
CREATE POLICY "Allow anonymous read access" ON worship_leaders FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON chord_sections FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON worship_leader_songs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON service_lineups FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON lineup_songs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON song_tags FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON song_tag_associations FOR SELECT USING (true);

-- Still require authentication for write operations
CREATE POLICY "Require auth for write" ON worship_leaders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Require auth for update" ON worship_leaders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Require auth for delete" ON worship_leaders FOR DELETE TO authenticated USING (true);

CREATE POLICY "Require auth for write" ON songs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Require auth for update" ON songs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Require auth for delete" ON songs FOR DELETE TO authenticated USING (true);

CREATE POLICY "Require auth for write" ON chord_sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Require auth for update" ON chord_sections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Require auth for delete" ON chord_sections FOR DELETE TO authenticated USING (true);

CREATE POLICY "Require auth for write" ON worship_leader_songs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Require auth for update" ON worship_leader_songs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Require auth for delete" ON worship_leader_songs FOR DELETE TO authenticated USING (true);