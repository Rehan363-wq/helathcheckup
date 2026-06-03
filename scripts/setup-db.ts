// Run this script to set up the Supabase database tables
// Usage: npx tsx scripts/setup-db.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rhqxxnjnaiwyhqdemust.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocXh4bmpuYWl3eWhxZGVtdXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2MzA2MSwiZXhwIjoyMDk2MDM5MDYxfQ.vlXN0_BI9wUjSHmX9Pb9fmThmP-pIpUTawuwK3G7m78";

const supabase = createClient(supabaseUrl, serviceRoleKey);

const SETUP_SQL = `
-- ============================================
-- MediScan AI Database Schema
-- ============================================

-- Scan Results Table
CREATE TABLE IF NOT EXISTS scan_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  condition TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT,
  recommendation TEXT,
  ai_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Analysis Table
CREATE TABLE IF NOT EXISTS report_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_url TEXT,
  summary TEXT,
  urgency TEXT NOT NULL CHECK (urgency IN ('normal', 'consult', 'urgent')),
  parameters JSONB,
  ai_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  degree TEXT,
  area TEXT,
  city TEXT,
  fees INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  distance DECIMAL(4,1),
  phone TEXT,
  verified BOOLEAN DEFAULT FALSE,
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Allow public read on doctors (everyone can see doctors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'doctors' AND policyname = 'Allow public read on doctors'
  ) THEN
    CREATE POLICY "Allow public read on doctors" ON doctors FOR SELECT USING (true);
  END IF;
END
$$;

-- Allow public insert on scan_results (no auth for hackathon MVP)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scan_results' AND policyname = 'Allow public insert on scan_results'
  ) THEN
    CREATE POLICY "Allow public insert on scan_results" ON scan_results FOR INSERT WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scan_results' AND policyname = 'Allow public read on scan_results'
  ) THEN
    CREATE POLICY "Allow public read on scan_results" ON scan_results FOR SELECT USING (true);
  END IF;
END
$$;

-- Allow public insert/read on report_analysis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'report_analysis' AND policyname = 'Allow public insert on report_analysis'
  ) THEN
    CREATE POLICY "Allow public insert on report_analysis" ON report_analysis FOR INSERT WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'report_analysis' AND policyname = 'Allow public read on report_analysis'
  ) THEN
    CREATE POLICY "Allow public read on report_analysis" ON report_analysis FOR SELECT USING (true);
  END IF;
END
$$;

-- Insert sample doctors data
INSERT INTO doctors (name, specialization, degree, area, city, fees, rating, distance, phone, verified, lat, lng)
VALUES
  ('Dr. Priya Sharma', 'Dermatologist', 'MBBS, MD (Dermatology)', 'Sector 18, Noida', 'Noida', 300, 4.8, 2.3, '+91 98765 43210', true, 28.5707000, 77.3219000),
  ('Dr. Rajesh Gupta', 'General Physician', 'MBBS, MD (Medicine)', 'Lajpat Nagar', 'Delhi', 200, 4.5, 3.1, '+91 87654 32109', true, 28.5691000, 77.2432000),
  ('Dr. Anita Verma', 'Dermatologist', 'MBBS, DVD', 'Connaught Place', 'Delhi', 500, 4.9, 5.2, '+91 76543 21098', true, 28.6315000, 77.2167000),
  ('Dr. Amit Patel', 'General Physician', 'MBBS', 'Saket', 'Delhi', 150, 4.2, 4.5, '+91 65432 10987', false, 28.5244000, 77.2066000),
  ('Dr. Sunita Rao', 'Pathologist', 'MBBS, MD (Pathology)', 'Hauz Khas', 'Delhi', 400, 4.7, 3.8, '+91 54321 09876', true, 28.5494000, 77.2001000),
  ('Dr. Vikram Singh', 'Dermatologist', 'MBBS, MD, DNB (Dermatology)', 'Greater Kailash', 'Delhi', 600, 4.6, 6.1, '+91 43210 98765', true, 28.5484000, 77.2340000)
ON CONFLICT DO NOTHING;
`;

async function setup() {
  console.log("🚀 Setting up MediScan AI database...\n");

  const { data, error } = await supabase.rpc("exec_sql", { sql: SETUP_SQL }).maybeSingle();

  if (error) {
    // If rpc doesn't work, try using the REST SQL endpoint directly
    console.log("Trying direct SQL execution...");
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql: SETUP_SQL }),
    });

    if (!response.ok) {
      console.log("⚠️  Direct SQL execution not available via REST.");
      console.log("📋 Please run the SQL below in your Supabase Dashboard > SQL Editor:\n");
      console.log("Go to: https://supabase.com/dashboard/project/rhqxxnjnaiwyhqdemust/sql/new\n");
      console.log("─".repeat(60));
      console.log(SETUP_SQL);
      console.log("─".repeat(60));
      return;
    }

    console.log("✅ Database setup complete!");
    return;
  }

  console.log("✅ Database setup complete!", data);
}

setup().catch(console.error);
