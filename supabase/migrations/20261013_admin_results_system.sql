-- ==============================================================================
-- EVENTORA SUPABASE MIGRATION: Admin Result Management System
-- Migration Name: 20261013_admin_results_system.sql
-- Description: Creates teams & event_results with scores, judge notes, audit trail,
-- approval workflows, reapproval gating, and strict student-tamper protection RLS.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    project_title TEXT,
    members JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create / Extend event_results Table
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

-- Add missing columns safely if table already existed
ALTER TABLE public.event_results
    ADD COLUMN IF NOT EXISTS score NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS judge_notes TEXT,
    ADD COLUMN IF NOT EXISTS audit_trail JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

-- 3. Row Level Security (RLS) Setup
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

-- Teams Policies: Authenticated users can read teams; only organizers/admins can create/modify
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
CREATE POLICY "Anyone can view teams"
ON public.teams FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins and organizers manage teams" ON public.teams;
CREATE POLICY "Admins and organizers manage teams"
ON public.teams FOR ALL
USING (public.is_admin() OR auth.role() = 'service_role')
WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Event Results Policies:
-- 1. Read: Public and students can ONLY see APPROVED results
DROP POLICY IF EXISTS "Public and students can only view approved results" ON public.event_results;
CREATE POLICY "Public and students can only view approved results"
ON public.event_results FOR SELECT
USING (status = 'approved' OR public.is_admin());

-- 2. Write: ONLY organizers and admins can insert, update, or delete results
-- Students attempting direct REST mutations will receive 403 Forbidden
DROP POLICY IF EXISTS "Only organizers and admins can insert results" ON public.event_results;
CREATE POLICY "Only organizers and admins can insert results"
ON public.event_results FOR INSERT
WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Only organizers and admins can update results" ON public.event_results;
CREATE POLICY "Only organizers and admins can update results"
ON public.event_results FOR UPDATE
USING (public.is_admin() OR auth.role() = 'service_role')
WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Only organizers and admins can delete results" ON public.event_results;
CREATE POLICY "Only organizers and admins can delete results"
ON public.event_results FOR DELETE
USING (public.is_admin() OR auth.role() = 'service_role');

-- 4. Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'event_results'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.event_results;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
