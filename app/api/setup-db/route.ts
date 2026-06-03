import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// POST /api/setup-db — One-time database setup
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Create tables one by one using Supabase's built-in methods
    // We'll check if tables exist by trying to query them

    // 1. Try to create scan_results table by inserting/checking
    const { error: scanError } = await supabase
      .from("scan_results")
      .select("id")
      .limit(1);

    // 2. Try doctors table
    const { error: doctorsError } = await supabase
      .from("doctors")
      .select("id")
      .limit(1);

    // 3. Try report_analysis table
    const { error: reportError } = await supabase
      .from("report_analysis")
      .select("id")
      .limit(1);

    const tablesExist = !scanError && !doctorsError && !reportError;

    if (tablesExist) {
      // Check if doctors table has data
      const { data: doctors, error: countErr } = await supabase
        .from("doctors")
        .select("id")
        .limit(1);

      if (!countErr && doctors && doctors.length === 0) {
        // Seed doctors data
        const { error: seedError } = await supabase.from("doctors").insert([
          { name: "Dr. Priya Sharma", specialization: "Dermatologist", degree: "MBBS, MD (Dermatology)", area: "Sector 18, Noida", city: "Noida", fees: 300, rating: 4.8, distance: 2.3, phone: "+91 98765 43210", verified: true, lat: 28.5707, lng: 77.3219 },
          { name: "Dr. Rajesh Gupta", specialization: "General Physician", degree: "MBBS, MD (Medicine)", area: "Lajpat Nagar", city: "Delhi", fees: 200, rating: 4.5, distance: 3.1, phone: "+91 87654 32109", verified: true, lat: 28.5691, lng: 77.2432 },
          { name: "Dr. Anita Verma", specialization: "Dermatologist", degree: "MBBS, DVD", area: "Connaught Place", city: "Delhi", fees: 500, rating: 4.9, distance: 5.2, phone: "+91 76543 21098", verified: true, lat: 28.6315, lng: 77.2167 },
          { name: "Dr. Amit Patel", specialization: "General Physician", degree: "MBBS", area: "Saket", city: "Delhi", fees: 150, rating: 4.2, distance: 4.5, phone: "+91 65432 10987", verified: false, lat: 28.5244, lng: 77.2066 },
          { name: "Dr. Sunita Rao", specialization: "Pathologist", degree: "MBBS, MD (Pathology)", area: "Hauz Khas", city: "Delhi", fees: 400, rating: 4.7, distance: 3.8, phone: "+91 54321 09876", verified: true, lat: 28.5494, lng: 77.2001 },
          { name: "Dr. Vikram Singh", specialization: "Dermatologist", degree: "MBBS, MD, DNB (Dermatology)", area: "Greater Kailash", city: "Delhi", fees: 600, rating: 4.6, distance: 6.1, phone: "+91 43210 98765", verified: true, lat: 28.5484, lng: 77.234 },
        ]);

        if (seedError) {
          return Response.json({ status: "tables_exist", seeded: false, seedError: seedError.message });
        }

        return Response.json({ status: "tables_exist", seeded: true, message: "Doctor data seeded!" });
      }

      return Response.json({ status: "tables_exist", seeded: false, message: "Tables and data already set up." });
    }

    // Tables don't exist — return the SQL that needs to be run
    return Response.json({
      status: "tables_missing",
      message: "Tables not found. Please create them in Supabase SQL Editor.",
      errors: {
        scan_results: scanError?.message,
        doctors: doctorsError?.message,
        report_analysis: reportError?.message,
      },
      sql: `
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

CREATE TABLE IF NOT EXISTS report_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_url TEXT,
  summary TEXT,
  urgency TEXT NOT NULL CHECK (urgency IN ('normal', 'consult', 'urgent')),
  parameters JSONB,
  ai_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "public_read_scans" ON scan_results FOR SELECT USING (true);
CREATE POLICY "public_insert_scans" ON scan_results FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_reports" ON report_analysis FOR SELECT USING (true);
CREATE POLICY "public_insert_reports" ON report_analysis FOR INSERT WITH CHECK (true);
      `,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Setup failed" },
      { status: 500 }
    );
  }
}
