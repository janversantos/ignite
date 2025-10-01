-- Ignite Chords Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Worship Leaders table
CREATE TABLE worship_leaders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Songs table
CREATE TABLE songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  original_key VARCHAR(10) NOT NULL,
  default_key VARCHAR(10) NOT NULL,
  primary_worship_leader_id UUID REFERENCES worship_leaders(id),
  lyrics TEXT,
  song_structure JSONB, -- Store verse, chorus, bridge order
  external_url VARCHAR(500), -- For web scraped content
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(title, original_key)
);

-- Chord sections table (verses, chorus, bridge, etc.)
CREATE TABLE chord_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  section_name VARCHAR(50) NOT NULL, -- 'Intro', 'Verse 1', 'Chorus', 'Bridge', etc.
  section_order INTEGER NOT NULL DEFAULT 1,
  chord_progression TEXT NOT NULL,
  lyrics TEXT,
  notes TEXT,
  key VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Worship leader song preferences (which songs they lead and preferred keys)
CREATE TABLE worship_leader_songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worship_leader_id UUID REFERENCES worship_leaders(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  preferred_key VARCHAR(10) NOT NULL,
  frequency_played INTEGER DEFAULT 1, -- How often they play this song
  last_played_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(worship_leader_id, song_id)
);

-- Service lineups (for tracking what songs are played when)
CREATE TABLE service_lineups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_date DATE NOT NULL,
  service_type VARCHAR(50) DEFAULT 'Sunday Service', -- 'Sunday Service', 'Prayer Meeting', etc.
  worship_leader_id UUID REFERENCES worship_leaders(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Songs in each service lineup
CREATE TABLE lineup_songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lineup_id UUID REFERENCES service_lineups(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id),
  song_order INTEGER NOT NULL,
  key_played VARCHAR(10) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Song tags/categories for organization
CREATE TABLE song_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Many-to-many relationship between songs and tags
CREATE TABLE song_tag_associations (
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES song_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (song_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_primary_leader ON songs(primary_worship_leader_id);
CREATE INDEX idx_chord_sections_song ON chord_sections(song_id);
CREATE INDEX idx_worship_leader_songs_leader ON worship_leader_songs(worship_leader_id);
CREATE INDEX idx_worship_leader_songs_song ON worship_leader_songs(song_id);
CREATE INDEX idx_lineup_songs_lineup ON lineup_songs(lineup_id);
CREATE INDEX idx_service_lineups_date ON service_lineups(service_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_worship_leaders_updated_at BEFORE UPDATE ON worship_leaders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chord_sections_updated_at BEFORE UPDATE ON chord_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worship_leader_songs_updated_at BEFORE UPDATE ON worship_leader_songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_lineups_updated_at BEFORE UPDATE ON service_lineups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE worship_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chord_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE worship_leader_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_tag_associations ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing authenticated users to read/write for now)
CREATE POLICY "Allow authenticated users full access" ON worship_leaders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON songs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON chord_sections FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON worship_leader_songs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON service_lineups FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON lineup_songs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON song_tags FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON song_tag_associations FOR ALL TO authenticated USING (true);

-- Insert some default tags
INSERT INTO song_tags (name, color) VALUES
  ('Worship', '#3B82F6'),
  ('Praise', '#10B981'),
  ('Contemporary', '#8B5CF6'),
  ('Traditional', '#F59E0B'),
  ('Filipino', '#EF4444'),
  ('English', '#06B6D4');