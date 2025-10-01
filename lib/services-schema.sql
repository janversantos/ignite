-- ===================================
-- IGNITE CHORDS - SERVICES SCHEMA
-- Phase 1: Hybrid Approach
-- Services in Supabase, Songs in JSON
-- ===================================

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  description TEXT,
  worship_leader TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service_songs junction table
CREATE TABLE IF NOT EXISTS service_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL, -- References songs by ID from JSON file
  order_index INT NOT NULL,
  key TEXT, -- Override key for this specific service
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_date ON services(date);
CREATE INDEX IF NOT EXISTS idx_service_songs_service_id ON service_songs(service_id);
CREATE INDEX IF NOT EXISTS idx_service_songs_order ON service_songs(service_id, order_index);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_songs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on services" ON services;
DROP POLICY IF EXISTS "Allow all operations on service_songs" ON service_songs;

-- Create policies to allow all operations (public app)
-- Note: In production, you may want to add authentication
CREATE POLICY "Allow all operations on services"
  ON services
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on service_songs"
  ON service_songs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for services table
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- INSERT INTO services (title, date, time, description, worship_leader) VALUES
--   ('Sunday Morning Service', '2025-10-05', '09:00:00', 'Regular Sunday worship', 'John Smith'),
--   ('Sunday Evening Service', '2025-10-05', '18:00:00', 'Evening praise and worship', 'Mary Johnson'),
--   ('Wednesday Prayer Meeting', '2025-10-08', '19:00:00', 'Midweek prayer and worship', 'David Lee');

-- Grant permissions (if using service role)
-- GRANT ALL ON services TO authenticated;
-- GRANT ALL ON service_songs TO authenticated;
-- GRANT ALL ON services TO anon;
-- GRANT ALL ON service_songs TO anon;

-- Verification queries
-- SELECT * FROM services ORDER BY date;
-- SELECT * FROM service_songs ORDER BY service_id, order_index;
