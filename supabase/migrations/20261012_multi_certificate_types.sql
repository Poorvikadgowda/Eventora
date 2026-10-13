-- ==============================================================================
-- EVENTORA SUPABASE MIGRATION: Multi-Type Certificates & Competition Results
-- Date: 2026-10-12
-- Enables:
-- 1. Multiple certificate types per event (Participation, Winner, Achievement, No Certificate).
-- 2. Event Results & Awards table for hackathons, competitions, quizzes, and projects.
-- 3. Individual and team member credential issuance.
-- 4. Constraint update to UNIQUE(event_id, student_id, certificate_type).
-- ==============================================================================

-- 1. Create event_results table for competitions, hackathons, and special awards
CREATE TABLE IF NOT EXISTS public.event_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    award_category TEXT NOT NULL CHECK (award_category IN ('winner', 'achievement')),
    award_title TEXT NOT NULL, -- e.g. '1st Place Winner', '2nd Place Runner Up', 'Best Project', 'Best Innovation'
    rank INTEGER, -- 1, 2, 3 or NULL for non-ranked awards
    is_team BOOLEAN DEFAULT FALSE,
    team_name TEXT,
    student_ids JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of student UUIDs
    student_names JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of student display names
    project_title TEXT,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('draft', 'pending_approval', 'approved')),
    approved_by TEXT,
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on event_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_event_results_event_id ON public.event_results(event_id);
CREATE INDEX IF NOT EXISTS idx_event_results_status ON public.event_results(status);

-- 2. Add columns to certificates table for awards, ranks, and multi-type support
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS certificate_type TEXT DEFAULT 'Participation';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS award_title TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS rank INTEGER;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS result_id UUID REFERENCES public.event_results(id) ON DELETE SET NULL;

-- 3. Relax unique constraint from (event_id, student_id) to (event_id, student_id, certificate_type)
-- Allows a student to earn BOTH a Participation certificate AND a Winner/Achievement certificate for the same event
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS uq_certificates_event_student;
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS uq_certificates_event_student_type;
ALTER TABLE public.certificates ADD CONSTRAINT uq_certificates_event_student_type UNIQUE (event_id, student_id, certificate_type);

-- 4. Add certificate_types configuration column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS certificate_types JSONB DEFAULT '["participation"]'::jsonb;

-- 5. Row Level Security for event_results
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view approved competition results (Public Transparency)
DROP POLICY IF EXISTS "Public can view approved event results" ON public.event_results;
CREATE POLICY "Public can view approved event results"
ON public.event_results
FOR SELECT
USING (status = 'approved');

-- Policy: Authenticated Organizers & Admins can manage results
DROP POLICY IF EXISTS "Organizers can manage event results" ON public.event_results;
CREATE POLICY "Organizers can manage event results"
ON public.event_results
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = event_results.event_id
        AND (e.organizer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = event_results.event_id
        AND (e.organizer_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
);

-- 6. Update verify_certificate_public RPC to return certificate_type, award_title, and rank
CREATE OR REPLACE FUNCTION public.verify_certificate_public(lookup_cert_id TEXT)
RETURNS TABLE (
    certificate_id TEXT,
    event_title TEXT,
    recipient_name TEXT,
    recipient_usn TEXT,
    issue_date TEXT,
    certificate_type TEXT,
    award_title TEXT,
    rank INTEGER,
    status TEXT,
    is_valid BOOLEAN,
    certificate_url TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.certificate_id,
        COALESCE(e.title, 'Campus Event') as event_title,
        COALESCE(p.name, 'Verified Recipient') as recipient_name,
        COALESCE(p.usn, '') as recipient_usn,
        TO_CHAR(c.issued_at, 'Month DD, YYYY') as issue_date,
        c.certificate_type,
        c.award_title,
        c.rank,
        c.status,
        (c.status = 'verified') as is_valid,
        c.certificate_url
    FROM public.certificates c
    LEFT JOIN public.events e ON c.event_id = e.id
    LEFT JOIN public.profiles p ON c.student_id = p.id
    WHERE UPPER(c.certificate_id) = UPPER(TRIM(lookup_cert_id))
    LIMIT 1;
END;
$$;
