-- ==============================================================================
-- EVENTORA COMPLETE SUPABASE SCHEMA & SECURITY MIGRATION
-- Migration Name: 20261014_supabase_full_connection.sql
-- Description: Sets up profiles, events, event_registrations, and event_results
-- with primary keys, foreign keys, unique constraints, automatic profile triggers,
-- and strict Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. USER PROFILES TABLE (Linked to Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    usn TEXT,
    department TEXT DEFAULT 'Computer Science & Engineering',
    semester TEXT DEFAULT 'Semester 4',
    phone TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    interests TEXT[] DEFAULT ARRAY['Technology', 'Hackathons', 'Artificial Intelligence'],
    attendance_rate NUMERIC(5, 2) DEFAULT 100.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. EVENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Technical' CHECK (category IN ('Technical', 'Workshop', 'Hackathon', 'Seminar', 'Sports', 'Cultural')),
    department TEXT DEFAULT 'Computer Science & Engineering',
    date DATE NOT NULL,
    start_time TEXT DEFAULT '09:00 AM',
    end_time TEXT DEFAULT '05:00 PM',
    venue TEXT DEFAULT 'Auditorium A',
    building TEXT DEFAULT 'Campus Main Block',
    capacity INTEGER DEFAULT 200,
    price TEXT DEFAULT 'Free',
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
    image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
    speakers JSONB DEFAULT '["Distinguished Speaker"]'::jsonb,
    agenda JSONB DEFAULT '[{"time": "09:00 AM", "title": "Inauguration"}]'::jsonb,
    features JSONB DEFAULT '{"enableQR": true, "enableCertificate": true, "enableFeedback": true, "enableAICopilot": true}'::jsonb,
    certificate_types JSONB DEFAULT '["participation"]'::jsonb,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure missing columns exist if table was partially created previously
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Computer Science & Engineering';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS building TEXT DEFAULT 'Campus Main Block';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price TEXT DEFAULT 'Free';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS speakers JSONB DEFAULT '["Distinguished Speaker"]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS agenda JSONB DEFAULT '[{"time": "09:00 AM", "title": "Inauguration"}]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{"enableQR": true, "enableCertificate": true, "enableFeedback": true, "enableAICopilot": true}'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS certificate_types JSONB DEFAULT '["participation"]'::jsonb;

-- ==============================================================================
-- 4. EVENT REGISTRATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, student_id) -- Strict Duplicate Prevention
);

-- ==============================================================================
-- 5. EVENT RESULTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.event_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    award_category TEXT NOT NULL CHECK (award_category IN ('winner', 'achievement')),
    award_title TEXT NOT NULL,
    rank INTEGER,
    is_team BOOLEAN DEFAULT FALSE,
    team_name TEXT,
    student_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    student_names JSONB NOT NULL DEFAULT '[]'::jsonb,
    project_title TEXT,
    score NUMERIC(5, 2) CHECK (score >= 0 AND score <= 100),
    judge_notes TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'reapproval_required')),
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    audit_trail JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. AUTOMATIC USER PROFILE CREATION ON AUTH SIGNUP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_role TEXT;
    user_usn TEXT;
    user_dept TEXT;
BEGIN
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
    user_name := COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    user_usn := new.raw_user_meta_data->>'usn';
    user_dept := COALESCE(new.raw_user_meta_data->>'department', 'Computer Science & Engineering');

    INSERT INTO public.profiles (
        id,
        name,
        email,
        role,
        usn,
        department,
        avatar_url
    )
    VALUES (
        new.id,
        user_name,
        new.email,
        user_role,
        user_usn,
        user_dept,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        usn = COALESCE(EXCLUDED.usn, public.profiles.usn),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- A. PROFILES POLICIES
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Public and authenticated can read profiles" ON public.profiles;
CREATE POLICY "Public and authenticated can read profiles"
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- B. EVENTS POLICIES
-- ----------------------------------------------------
-- Anyone can view published events; admins can view all events (including drafts)
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
CREATE POLICY "Anyone can view published events"
ON public.events FOR SELECT
USING (
    status = 'published'
    OR status = 'ongoing'
    OR status = 'completed'
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Only authenticated users with admin role can create events
DROP POLICY IF EXISTS "Admins can create events" ON public.events;
CREATE POLICY "Admins can create events"
ON public.events FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);

-- Only admins can update events
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);

-- Only admins can delete events
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);

-- ----------------------------------------------------
-- C. EVENT REGISTRATIONS POLICIES
-- ----------------------------------------------------
-- Students can view their own registrations; admins can view all registrations
DROP POLICY IF EXISTS "Students view own registrations and admins view all" ON public.event_registrations;
CREATE POLICY "Students view own registrations and admins view all"
ON public.event_registrations FOR SELECT
USING (
    auth.uid() = student_id
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);

-- Students can register themselves
DROP POLICY IF EXISTS "Students can register for events" ON public.event_registrations;
CREATE POLICY "Students can register for events"
ON public.event_registrations FOR INSERT
WITH CHECK (
    auth.uid() = student_id
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);

-- Students can cancel their own registration; admins can manage
DROP POLICY IF EXISTS "Students cancel own registration and admins delete" ON public.event_registrations;
CREATE POLICY "Students cancel own registration and admins delete"
ON public.event_registrations FOR DELETE
USING (
    auth.uid() = student_id
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);

-- ----------------------------------------------------
-- D. EVENT RESULTS POLICIES
-- ----------------------------------------------------
-- Anyone can view approved results; admins can view all results
DROP POLICY IF EXISTS "Anyone can view approved results" ON public.event_results;
CREATE POLICY "Anyone can view approved results"
ON public.event_results FOR SELECT
USING (
    status = 'approved'
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);

-- Only organizers/admins can manage results
DROP POLICY IF EXISTS "Admins manage results" ON public.event_results;
CREATE POLICY "Admins manage results"
ON public.event_results FOR ALL
USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);
