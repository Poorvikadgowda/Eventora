-- ==============================================================================
-- EVENTORA DATABASE CLEANUP: REMOVE GENERICSWAP & KEEP ONLY EVENTORA
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/buznsltebeqmzilreeak/sql
-- ==============================================================================

-- 1. DROP ALL OLD GENERICSWAP MEDICINE/PHARMACY TABLES
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.medicines CASCADE;
DROP TABLE IF EXISTS public.pharmacies CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.substitutes CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;

-- 2. ENSURE ALL EVENTORA REQUIRED TABLES EXIST WITH PROPER SCHEMAS

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- A. Profiles (Linked to Supabase Auth)
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

-- B. Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Technical',
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

-- C. Event Registrations (with Unique Constraint to prevent duplicates)
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, student_id)
);

-- D. Event Results
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

-- E. Attendance (Dynamic QR check-in)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    verification_method TEXT DEFAULT 'qr',
    status TEXT DEFAULT 'present',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    certificate_id TEXT UNIQUE NOT NULL,
    certificate_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. Feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER DEFAULT 5,
    organization_rating INTEGER DEFAULT 5,
    speaker_rating INTEGER DEFAULT 5,
    venue_rating INTEGER DEFAULT 5,
    content_rating INTEGER DEFAULT 5,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'event',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS) ON ALL EVENTORA TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
DROP POLICY IF EXISTS "Public and authenticated can read profiles" ON public.profiles;
CREATE POLICY "Public and authenticated can read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (
    status IN ('published', 'ongoing', 'completed')
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Students view own registrations and admins view all" ON public.event_registrations;
CREATE POLICY "Students view own registrations and admins view all" ON public.event_registrations FOR SELECT USING (
    auth.uid() = student_id
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Students can register for events" ON public.event_registrations;
CREATE POLICY "Students can register for events" ON public.event_registrations FOR INSERT WITH CHECK (
    auth.uid() = student_id
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.role() = 'service_role'
);
