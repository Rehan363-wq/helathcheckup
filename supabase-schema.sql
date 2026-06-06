-- ============================================================
-- CLINIHOME AI UNIFIED SUPABASE SQL SCHEMA
-- Copy and run this in your Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Extends Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor')),
  specialization TEXT, -- Only for doctors
  degree TEXT,         -- Only for doctors
  area TEXT,           -- Only for doctors
  city TEXT,           -- Only for doctors
  fees INTEGER DEFAULT 0, -- Only for doctors
  rating DECIMAL(2,1) DEFAULT 4.5,
  phone TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
CREATE POLICY "Allow public read on profiles" 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. TRIGGER FOR NEW SIGNUPS (Auto-populate profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, specialization, degree, fees, is_approved)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'patient'),
    new.raw_user_meta_data->>'specialization',
    new.raw_user_meta_data->>'degree',
    COALESCE((new.raw_user_meta_data->>'fees')::integer, 0),
    CASE WHEN COALESCE(new.raw_user_meta_data->>'role', 'patient') = 'doctor' THEN false ELSE true END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. SCAN RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.scan_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  image_url TEXT,
  condition TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT,
  recommendation TEXT,
  ai_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on scan_results" ON public.scan_results;
CREATE POLICY "Allow public insert on scan_results" 
  ON public.scan_results FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to read own scan_results" ON public.scan_results;
CREATE POLICY "Allow users to read own scan_results" 
  ON public.scan_results FOR SELECT USING (
    patient_id IS NULL OR auth.uid() = patient_id
  );

-- 4. REPORT ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS public.report_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_url TEXT,
  summary TEXT,
  urgency TEXT NOT NULL CHECK (urgency IN ('normal', 'consult', 'urgent')),
  parameters JSONB,
  ai_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.report_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on report_analysis" ON public.report_analysis;
CREATE POLICY "Allow public insert on report_analysis" 
  ON public.report_analysis FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to read own report_analysis" ON public.report_analysis;
CREATE POLICY "Allow users to read own report_analysis" 
  ON public.report_analysis FOR SELECT USING (
    patient_id IS NULL OR auth.uid() = patient_id
  );

-- 5. CHAT ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_patient_doctor UNIQUE (patient_id, doctor_id)
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to see their own chats" ON public.chats;
CREATE POLICY "Allow users to see their own chats" 
  ON public.chats FOR SELECT USING (
    auth.uid() = patient_id OR auth.uid() = doctor_id
  );

DROP POLICY IF EXISTS "Allow users to create chats" ON public.chats;
CREATE POLICY "Allow users to create chats" 
  ON public.chats FOR INSERT WITH CHECK (
    auth.uid() = patient_id OR auth.uid() = doctor_id
  );

-- 6. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow participants to read messages" ON public.messages;
CREATE POLICY "Allow participants to read messages" 
  ON public.messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = messages.chat_id 
      AND (chats.patient_id = auth.uid() OR chats.doctor_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Allow participants to insert messages" ON public.messages;
CREATE POLICY "Allow participants to insert messages" 
  ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = messages.chat_id 
      AND (chats.patient_id = auth.uid() OR chats.doctor_id = auth.uid())
    )
  );

-- 7. MEDICINE REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.medicine_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  instruction TEXT,
  timings TEXT[] NOT NULL, -- Format: ['08:00', '20:00']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medicine_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to manage own reminders" ON public.medicine_reminders;
CREATE POLICY "Allow users to manage own reminders"
  ON public.medicine_reminders FOR ALL USING (
    auth.uid() = user_id
  );

-- 8. PRE-VERIFIED DOCTORS SEED DATA
-- First enable pgcrypto for secure password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert seed users into auth.users to satisfy the public.profiles -> auth.users foreign key constraint
-- Note: Trigger handle_new_user automatically creates matching public.profiles rows when these are inserted!
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'priya@clinihome.ai', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Dr. Priya Sharma","role":"doctor","specialization":"Dermatologist","degree":"MBBS, MD (Dermatology)","fees":300}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'rajesh@clinihome.ai', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Dr. Rajesh Gupta","role":"doctor","specialization":"General Physician","degree":"MBBS, MD (Medicine)","fees":200}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'anita@clinihome.ai', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Dr. Anita Verma","role":"doctor","specialization":"Dermatologist","degree":"MBBS, DVD","fees":500}', 'authenticated', 'authenticated'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'amit@clinihome.ai', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Dr. Amit Patel","role":"doctor","specialization":"General Physician","degree":"MBBS","fees":150}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Now update the location and details for each created doctor profile
UPDATE public.profiles SET area = 'Sector 18, Noida', city = 'Noida', rating = 4.8, phone = '+91 98765 43210' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET area = 'Lajpat Nagar', city = 'Delhi', rating = 4.5, phone = '+91 87654 32109' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET area = 'Connaught Place', city = 'Delhi', rating = 4.9, phone = '+91 76543 21098' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET area = 'Saket', city = 'Delhi', rating = 4.2, phone = '+91 65432 10987' WHERE id = '44444444-4444-4444-4444-444444444444';

-- ============================================================
-- HEALTH TRACKER TABLES
-- ============================================================

-- 9. USER HEALTH PROFILE (Extended health info for tracker)
CREATE TABLE IF NOT EXISTS public.user_health_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  age INTEGER,
  weight_kg DECIMAL,
  height_cm DECIMAL,
  conditions TEXT[],         -- ["diabetes", "hypertension"]
  medications TEXT[],
  daily_cal_goal INTEGER DEFAULT 2000,
  step_goal INTEGER DEFAULT 8000,
  sleep_goal_hrs DECIMAL DEFAULT 7.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_health_profile UNIQUE (user_id)
);

ALTER TABLE public.user_health_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to manage own health profile" ON public.user_health_profile;
CREATE POLICY "Allow users to manage own health profile"
  ON public.user_health_profile FOR ALL USING (auth.uid() = user_id);

-- 10. HEALTH LOGS (Daily tracking entries)
CREATE TABLE IF NOT EXISTS public.health_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  meals JSONB DEFAULT '[]'::jsonb,
  water_glasses INTEGER DEFAULT 0,
  steps INTEGER DEFAULT 0,
  workouts JSONB DEFAULT '[]'::jsonb,
  sleep_start TIME,
  sleep_end TIME,
  sleep_quality TEXT CHECK (sleep_quality IN ('good', 'average', 'poor')),
  vitals JSONB DEFAULT '{}'::jsonb,
  medications_taken TEXT[],
  medications_missed TEXT[],
  mood TEXT CHECK (mood IN ('happy', 'calm', 'stressed', 'anxious', 'neutral')),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  daily_score INTEGER CHECK (daily_score BETWEEN 1 AND 10),
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_daily_log UNIQUE (user_id, log_date)
);

ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to manage own health logs" ON public.health_logs;
CREATE POLICY "Allow users to manage own health logs"
  ON public.health_logs FOR ALL USING (auth.uid() = user_id);

-- 11. HEALTH CHAT (Tracker chat history)
CREATE TABLE IF NOT EXISTS public.health_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  log_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.health_chat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to manage own health chat" ON public.health_chat;
CREATE POLICY "Allow users to manage own health chat"
  ON public.health_chat FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- ONBOARDING & PROFILE EXTENSION
-- ============================================================

-- 12. EXTEND PROFILES with onboarding fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS conditions TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medications TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allergies TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS health_goals TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'english';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
-- Doctor-specific extensions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_conditions TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_age_groups TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{"ai_assisted_replies":true,"auto_patient_summary":true,"patient_data_access":"full"}'::jsonb;

-- 13. UPLOADED REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.uploaded_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN ('lab_report', 'prescription', 'scan', 'other')),
  file_url TEXT,
  summary TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.uploaded_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to manage own reports" ON public.uploaded_reports;
CREATE POLICY "Allow users to manage own reports"
  ON public.uploaded_reports FOR ALL USING (auth.uid() = user_id);
