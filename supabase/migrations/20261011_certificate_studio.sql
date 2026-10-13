-- ========================================================
-- EVENTORA CERTIFICATE STUDIO SUPABASE MIGRATION
-- Migration Name: 20261011_certificate_studio.sql
-- Description: Creates certificate_templates, extends certificates with
-- metadata & audit trail, adds unique constraints, applies strict RLS,
-- provides public verification RPC, and configures Supabase Storage bucket.
-- ========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================
-- 1. CREATE CERTIFICATE TEMPLATES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Certificate of Excellence',
    subtitle TEXT DEFAULT 'This is proudly presented to',
    description TEXT,
    logo_type TEXT DEFAULT 'eventora',
    theme TEXT DEFAULT 'classic',
    issuer_name TEXT NOT NULL DEFAULT 'Dr. Eleanor Vance',
    issuer_title TEXT NOT NULL DEFAULT 'Chief Academic Officer',
    co_issuer_name TEXT DEFAULT 'Marcus Sterling',
    co_issuer_title TEXT DEFAULT 'Event Director',
    eligibility_rules JSONB DEFAULT '{"require_registration": true, "require_dynamic_qr": true, "require_approval": true, "min_attendance_percent": 80}'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_certificate_templates_event UNIQUE (event_id)
);

-- ========================================================
-- 2. EXTEND CERTIFICATES TABLE WITH METADATA & AUDIT FIELDS
-- ========================================================
ALTER TABLE public.certificates 
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('verified', 'revoked', 'pending')),
    ADD COLUMN IF NOT EXISTS certificate_type TEXT NOT NULL DEFAULT 'excellence' CHECK (certificate_type IN ('excellence', 'participation', 'completion', 'merit')),
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS revoked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS revocation_reason TEXT,
    ADD COLUMN IF NOT EXISTS audit_trail JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ========================================================
-- 3. UNIQUE CONSTRAINT TO PREVENT DUPLICATE CERTIFICATES
-- ========================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_certificates_event_student'
    ) THEN
        ALTER TABLE public.certificates 
        ADD CONSTRAINT uq_certificates_event_student UNIQUE (event_id, student_id);
    END IF;
END $$;

-- ========================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================================
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 5. CLEAN UP PREVIOUS PERMISSIVE POLICIES
-- ========================================================
DROP POLICY IF EXISTS "Students view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins manage certificates" ON public.certificates;
DROP POLICY IF EXISTS "View authorized certificates" ON public.certificates;
DROP POLICY IF EXISTS "Organizers issue certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins update or revoke certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins delete certificates" ON public.certificates;

DROP POLICY IF EXISTS "Organizers view own event templates" ON public.certificate_templates;
DROP POLICY IF EXISTS "Organizers manage event templates" ON public.certificate_templates;

-- ========================================================
-- 6. STRICT RLS POLICIES FOR CERTIFICATE_TEMPLATES
-- ========================================================
-- Organizers and Admins can view templates for events they manage
CREATE POLICY "Organizers view own event templates" ON public.certificate_templates
    FOR SELECT USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = certificate_templates.event_id 
              AND events.organizer_id = auth.uid()
        )
    );

-- Organizers and Admins can insert/update templates for events they manage
CREATE POLICY "Organizers manage event templates" ON public.certificate_templates
    FOR ALL USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = certificate_templates.event_id 
              AND events.organizer_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = certificate_templates.event_id 
              AND events.organizer_id = auth.uid()
        )
    );

-- ========================================================
-- 7. STRICT RLS POLICIES FOR CERTIFICATES
-- ========================================================
-- Policy 1: Students see only their own certificates; Organizers see certificates for their events
CREATE POLICY "View authorized certificates" ON public.certificates
    FOR SELECT USING (
        auth.uid() = student_id OR
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = certificates.event_id 
              AND events.organizer_id = auth.uid()
        )
    );

-- Policy 2: Organizers issue certificates only for events they manage
CREATE POLICY "Organizers issue certificates" ON public.certificates
    FOR INSERT WITH CHECK (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = certificates.event_id 
              AND events.organizer_id = auth.uid()
        )
    );

-- Policy 3: Only authorized administrators can revoke, reissue, or update certificates
CREATE POLICY "Admins update or revoke certificates" ON public.certificates
    FOR UPDATE USING (
        public.is_admin()
    );

-- Policy 4: Only authorized administrators can delete certificates
CREATE POLICY "Admins delete certificates" ON public.certificates
    FOR DELETE USING (
        public.is_admin()
    );

-- ========================================================
-- 8. PRIVACY-PRESERVING PUBLIC VERIFICATION FUNCTION (RPC)
-- Exposes ONLY non-sensitive approved metadata to public visitors
-- ========================================================
CREATE OR REPLACE FUNCTION public.verify_certificate_public(lookup_cert_id TEXT)
RETURNS TABLE (
    certificate_id TEXT,
    event_title TEXT,
    recipient_name TEXT,
    recipient_usn TEXT,
    issue_date TIMESTAMPTZ,
    status TEXT,
    certificate_url TEXT,
    is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.certificate_id,
        e.title AS event_title,
        p.name AS recipient_name,
        p.usn AS recipient_usn,
        c.issued_at AS issue_date,
        c.status,
        c.certificate_url,
        (c.status = 'verified') AS is_valid
    FROM public.certificates c
    JOIN public.events e ON c.event_id = e.id
    JOIN public.profiles p ON c.student_id = p.id
    WHERE UPPER(c.certificate_id) = UPPER(TRIM(lookup_cert_id))
      AND c.status IN ('verified', 'revoked');
END;
$$;

-- Grant execute to public (anon) and authenticated users
GRANT EXECUTE ON FUNCTION public.verify_certificate_public(TEXT) TO anon, authenticated;

-- ========================================================
-- 9. SUPABASE STORAGE BUCKET CONFIGURATION FOR CERTIFICATES
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Students and Admins can read certificate PDFs
DROP POLICY IF EXISTS "Read certificate files" ON storage.objects;
CREATE POLICY "Read certificate files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'certificates' AND (
            auth.role() = 'authenticated' OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

-- Only Admins and Organizers can upload to certificates bucket
DROP POLICY IF EXISTS "Admins upload certificate files" ON storage.objects;
CREATE POLICY "Admins upload certificate files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'certificates' AND (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
            auth.role() = 'service_role'
        )
    );

-- ========================================================
-- 10. REALTIME PUBLICATION SETUP
-- ========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'certificates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.certificates;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'certificate_templates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.certificate_templates;
  END IF;
END $$;
