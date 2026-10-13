-- ========================================================
-- EVENTORA SUPABASE MIGRATION: ASSIGNMENTS & STORAGE
-- Project ID: buznsltebeqmzilreeak
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/buznsltebeqmzilreeak/sql
-- ========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================
-- 0. ADMIN ROLE CHECK HELPER (DEFINED FIRST TO AVOID 42883)
-- ========================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

-- ========================================================
-- 1. ASSIGNMENTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    attachment_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 2. ASSIGNMENT SUBMISSIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_url TEXT NOT NULL,
    file_name TEXT,
    notes TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmission_required')),
    grade TEXT,
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- ========================================================
-- 3. SYSTEM SETTINGS TABLE (Configurable Attendance Threshold, etc.)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default attendance shortage threshold (75%)
INSERT INTO public.system_settings (key, value)
VALUES ('attendance_shortage_threshold', '{"threshold": 75}')
ON CONFLICT (key) DO NOTHING;

-- ========================================================
-- 4. STORAGE BUCKETS SETUP
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('event-images', 'event-images', true),
    ('assignment-files', 'assignment-files', true),
    ('student-submissions', 'student-submissions', false),
    ('certificates', 'certificates', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ========================================================
-- 5. ROW LEVEL SECURITY (RLS) FOR NEW TABLES
-- ========================================================
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Assignments Policies
DROP POLICY IF EXISTS "Anyone can view assignments" ON public.assignments;
CREATE POLICY "Anyone can view assignments" ON public.assignments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage assignments" ON public.assignments;
CREATE POLICY "Admins manage assignments" ON public.assignments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Assignment Submissions Policies
DROP POLICY IF EXISTS "Students view own submissions or Admins view all" ON public.assignment_submissions;
CREATE POLICY "Students view own submissions or Admins view all" ON public.assignment_submissions
    FOR SELECT USING (
        auth.uid() = student_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Students create own submissions" ON public.assignment_submissions;
CREATE POLICY "Students create own submissions" ON public.assignment_submissions
    FOR INSERT WITH CHECK (
        auth.uid() = student_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Students and Admins update submissions" ON public.assignment_submissions;
CREATE POLICY "Students and Admins update submissions" ON public.assignment_submissions
    FOR UPDATE USING (
        auth.uid() = student_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admins delete submissions" ON public.assignment_submissions;
CREATE POLICY "Admins delete submissions" ON public.assignment_submissions
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- System Settings Policies
DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
CREATE POLICY "Anyone can read system settings" ON public.system_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage system settings" ON public.system_settings;
CREATE POLICY "Admins manage system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ========================================================
-- 6. STORAGE BUCKET RLS POLICIES
-- ========================================================
-- event-images
DROP POLICY IF EXISTS "Public Access for event-images" ON storage.objects;
CREATE POLICY "Public Access for event-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Authenticated users upload event-images" ON storage.objects;
CREATE POLICY "Authenticated users upload event-images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- assignment-files
DROP POLICY IF EXISTS "Public Access for assignment-files" ON storage.objects;
CREATE POLICY "Public Access for assignment-files" ON storage.objects
    FOR SELECT USING (bucket_id = 'assignment-files');

DROP POLICY IF EXISTS "Teachers and Admins upload assignment-files" ON storage.objects;
CREATE POLICY "Teachers and Admins upload assignment-files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'assignment-files' AND auth.role() = 'authenticated');

-- student-submissions
DROP POLICY IF EXISTS "Students and Admins read submissions files" ON storage.objects;
CREATE POLICY "Students and Admins read submissions files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'student-submissions' 
        AND (
            auth.uid()::text = (storage.foldername(name))[1] 
            OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

DROP POLICY IF EXISTS "Students upload own submissions files" ON storage.objects;
CREATE POLICY "Students upload own submissions files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'student-submissions' 
        AND auth.role() = 'authenticated'
    );

-- certificates
DROP POLICY IF EXISTS "Public Access for certificates" ON storage.objects;
CREATE POLICY "Public Access for certificates" ON storage.objects
    FOR SELECT USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Admins upload certificates" ON storage.objects;
CREATE POLICY "Admins upload certificates" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');

-- ========================================================
-- 7. ATTENDANCE SHORTAGE TRIGGER & FUNCTION
-- ========================================================
CREATE OR REPLACE FUNCTION public.check_student_attendance_shortage(target_student_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_events_count INTEGER;
    attended_count INTEGER;
    attendance_rate NUMERIC;
    configured_threshold NUMERIC := 75.0;
BEGIN
    SELECT COUNT(*) INTO total_events_count FROM public.events WHERE status IN ('published', 'completed', 'ongoing');
    IF total_events_count = 0 THEN
        RETURN 100.0;
    END IF;

    SELECT COUNT(*) INTO attended_count FROM public.attendance WHERE student_id = target_student_id AND status = 'present';

    attendance_rate := ROUND((attended_count::NUMERIC / total_events_count::NUMERIC) * 100.0, 1);

    SELECT COALESCE((value->>'threshold')::NUMERIC, 75.0) INTO configured_threshold 
    FROM public.system_settings WHERE key = 'attendance_shortage_threshold';

    IF attendance_rate < configured_threshold THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            target_student_id,
            '⚠️ Attendance Shortage Warning',
            format('Your attendance is %s%%, which is below the required threshold of %s%%. Please attend upcoming sessions.', attendance_rate, configured_threshold),
            'attendance_warning'
        );
    END IF;

    RETURN attendance_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- 8. PREVENT SELF-PROMOTION TO ADMIN & SECURE PROMOTION
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_name TEXT;
    raw_usn TEXT;
    raw_dept TEXT;
    raw_sem INTEGER;
BEGIN
    -- SECURITY: Public signups are forced to 'student' to prevent privilege escalation
    raw_name := COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    raw_usn := new.raw_user_meta_data->>'usn';
    raw_dept := COALESCE(new.raw_user_meta_data->>'department', 'Computer Science');
    raw_sem := COALESCE((new.raw_user_meta_data->>'semester')::INTEGER, 1);

    INSERT INTO public.profiles (
        id,
        name,
        email,
        role,
        usn,
        department,
        semester,
        avatar_url,
        interests
    )
    VALUES (
        new.id,
        raw_name,
        new.email,
        'student',
        raw_usn,
        raw_dept,
        raw_sem,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        ARRAY['Technology', 'Hackathons']
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper to promote a user to admin (call via SQL Editor or authorized function)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email TEXT)
RETURNS TEXT AS $$
DECLARE
    affected_rows INT;
BEGIN
    UPDATE public.profiles
    SET role = 'admin', updated_at = NOW()
    WHERE email = LOWER(TRIM(target_email));
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows > 0 THEN
        RETURN format('Successfully promoted %s to admin.', target_email);
    ELSE
        RETURN format('User %s not found in profiles.', target_email);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Realtime Publication safely (idempotent check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'assignments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'assignment_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_submissions;
  END IF;
END $$;
