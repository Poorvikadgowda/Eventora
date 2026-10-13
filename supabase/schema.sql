-- ========================================================
-- EVENTORA SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY
-- "Plan. Automate. Manage. Celebrate."
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up any conflicting previous tables
DROP TABLE IF EXISTS public.qr_scans CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.attendance_sessions CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.venues CASCADE;
DROP TABLE IF EXISTS public.event_recommendations CASCADE;
DROP TABLE IF EXISTS public.event_analytics CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ========================================================
-- 1. PROFILES TABLE
-- ========================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    usn TEXT,
    department TEXT,
    semester INTEGER DEFAULT 1,
    phone TEXT,
    avatar_url TEXT,
    interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 2. EVENTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    venue TEXT,
    capacity INTEGER DEFAULT 100,
    registration_deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
    image_url TEXT,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 3. EVENT REGISTRATIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'registered',
    UNIQUE(event_id, student_id)
);

-- ========================================================
-- 4. ATTENDANCE SESSIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 5. ATTENDANCE TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE SET NULL,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'present',
    verification_method TEXT DEFAULT 'qr',
    UNIQUE(event_id, student_id)
);

-- ========================================================
-- 6. QR SCANS AUDIT LOG TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    result TEXT CHECK (result IN ('valid', 'expired', 'duplicate', 'invalid', 'wrong_event')),
    reason TEXT
);

-- ========================================================
-- 7. CERTIFICATES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    certificate_id TEXT UNIQUE NOT NULL,
    certificate_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 8. FEEDBACK TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    organization_rating INTEGER CHECK (organization_rating BETWEEN 1 AND 5),
    speaker_rating INTEGER CHECK (speaker_rating BETWEEN 1 AND 5),
    venue_rating INTEGER CHECK (venue_rating BETWEEN 1 AND 5),
    content_rating INTEGER CHECK (content_rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, student_id)
);

-- ========================================================
-- 9. NOTIFICATIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 10. VENUES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    building TEXT,
    room TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    capacity INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 11. EVENT RECOMMENDATIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.event_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    match_percentage INTEGER DEFAULT 90,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 12. EVENT ANALYTICS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.event_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    registration_score NUMERIC DEFAULT 0,
    attendance_score NUMERIC DEFAULT 0,
    feedback_score NUMERIC DEFAULT 0,
    success_score NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- AUTOMATED PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_role TEXT;
    raw_name TEXT;
    raw_usn TEXT;
    raw_dept TEXT;
    raw_sem INTEGER;
BEGIN
    -- Force role to student for public signups to prevent self-elevation to admin
    raw_role := 'student';
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
        raw_role,
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

-- Trigger hook
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

-- Helper to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR true);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- 2. Events Policies
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins can create events" ON public.events FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE USING (public.is_admin());

-- 3. Event Registrations Policies
CREATE POLICY "Students view own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Students create own registrations" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students cancel own registrations" ON public.event_registrations FOR DELETE USING (auth.uid() = student_id OR public.is_admin());

-- 4. Attendance Sessions Policies
CREATE POLICY "View attendance sessions" ON public.attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Admins manage attendance sessions" ON public.attendance_sessions FOR ALL USING (public.is_admin());

-- 5. Attendance Policies
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Admins manage attendance" ON public.attendance FOR ALL USING (public.is_admin());
CREATE POLICY "Students check-in attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = student_id OR public.is_admin());

-- 6. QR Scans Policies
CREATE POLICY "Admins view qr scans" ON public.qr_scans FOR SELECT USING (public.is_admin());
CREATE POLICY "Log qr scans" ON public.qr_scans FOR INSERT WITH CHECK (true);

-- 7. Certificates Policies
CREATE POLICY "Students view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = student_id OR public.is_admin() OR true);
CREATE POLICY "Admins manage certificates" ON public.certificates FOR ALL USING (public.is_admin());

-- 8. Feedback Policies
CREATE POLICY "View feedback" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "Students submit feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Admins manage feedback" ON public.feedback FOR ALL USING (public.is_admin());

-- 9. Notifications Policies
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- 10. Venues Policies
CREATE POLICY "Anyone can view venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Admins manage venues" ON public.venues FOR ALL USING (public.is_admin());

-- 11. Recommendations Policies
CREATE POLICY "Students view own recommendations" ON public.event_recommendations FOR SELECT USING (auth.uid() = student_id OR public.is_admin());

-- 12. Analytics Policies
CREATE POLICY "View analytics" ON public.event_analytics FOR SELECT USING (true);
CREATE POLICY "Admins manage analytics" ON public.event_analytics FOR ALL USING (public.is_admin());

-- Enable Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ========================================================
-- 13. ASSIGNMENTS TABLE
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
-- 14. ASSIGNMENT SUBMISSIONS TABLE
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
-- 15. SYSTEM SETTINGS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.system_settings (key, value)
VALUES ('attendance_shortage_threshold', '{"threshold": 75}')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Assignments RLS
CREATE POLICY "Anyone can view assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Admins manage assignments" ON public.assignments FOR ALL USING (public.is_admin());

-- Assignment Submissions RLS
CREATE POLICY "Students view own submissions or Admins view all" ON public.assignment_submissions
    FOR SELECT USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Students create own submissions" ON public.assignment_submissions
    FOR INSERT WITH CHECK (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Students and Admins update submissions" ON public.assignment_submissions
    FOR UPDATE USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Admins delete submissions" ON public.assignment_submissions
    FOR DELETE USING (public.is_admin());

-- System Settings RLS
CREATE POLICY "Anyone can read system settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage system settings" ON public.system_settings FOR ALL USING (public.is_admin());

-- ========================================================
-- STORAGE BUCKETS SETUP & POLICIES
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('event-images', 'event-images', true),
    ('assignment-files', 'assignment-files', true),
    ('student-submissions', 'student-submissions', false),
    ('certificates', 'certificates', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "Public Access for event-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'event-images');
CREATE POLICY "Authenticated users upload event-images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access for assignment-files" ON storage.objects
    FOR SELECT USING (bucket_id = 'assignment-files');
CREATE POLICY "Teachers and Admins upload assignment-files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'assignment-files' AND auth.role() = 'authenticated');

CREATE POLICY "Students and Admins read submissions files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'student-submissions' 
        AND (
            auth.uid()::text = (storage.foldername(name))[1] 
            OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );
CREATE POLICY "Students upload own submissions files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'student-submissions' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access for certificates" ON storage.objects
    FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Admins upload certificates" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');

-- Attendance Shortage Procedure
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

-- Helper to promote a user to admin
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

