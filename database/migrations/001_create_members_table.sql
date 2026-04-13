-- ══════════════════════════════════════════════════════════════════════════════
--  TreasureAmu — Migration 001
--  Creates the `members` table for membership and newsletter signups.
--
--  HOW TO RUN:
--  1. Go to your Supabase project → SQL Editor
--  2. Paste this entire file and click "Run"
--  (Or use the Supabase CLI: supabase db push)
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable the pgcrypto extension for UUID generation (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUM TYPES ────────────────────────────────────────────────────────────────

CREATE TYPE member_type AS ENUM ('personal', 'business', 'nonprofit');
CREATE TYPE signup_type AS ENUM ('member', 'newsletter');

-- ── MEMBERS TABLE ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.members (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name   TEXT        NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 50),
  last_name    TEXT        NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 50),
  email        TEXT        NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  member_type  member_type NOT NULL DEFAULT 'personal',
  signup_type  signup_type NOT NULL DEFAULT 'member',
  zip_code          TEXT        NOT NULL CHECK (zip_code ~ '^\d{5}(-\d{4})?$'),
  organization_name TEXT        CHECK (organization_name IS NULL OR char_length(organization_name) BETWEEN 1 AND 100),
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ,

  -- Prevent duplicate email registrations
  CONSTRAINT members_email_unique UNIQUE (email)
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────

-- Fast lookup by email (for duplicate-check queries)
CREATE INDEX IF NOT EXISTS idx_members_email
  ON public.members (email);

-- Filter by ZIP for party proximity matching
CREATE INDEX IF NOT EXISTS idx_members_zip
  ON public.members (zip_code);

-- Filter by signup type (member vs newsletter list)
CREATE INDEX IF NOT EXISTS idx_members_signup_type
  ON public.members (signup_type);

-- Filter by member type
CREATE INDEX IF NOT EXISTS idx_members_member_type
  ON public.members (member_type);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ── ROW LEVEL SECURITY (RLS) ──────────────────────────────────────────────────
-- Enables RLS so that only authenticated/service-role requests can read or write.

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Allow the service role (server-side C# API) to do everything
CREATE POLICY "Service role full access"
  ON public.members
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anonymous users can INSERT only (for the signup form)
-- If you want to prevent direct browser access to the DB, remove this policy
-- and only allow writes through your C# API.
CREATE POLICY "Anon can insert"
  ON public.members
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ── COMMENTS ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE  public.members             IS 'TreasureAmu membership and newsletter signups';
COMMENT ON COLUMN public.members.id          IS 'Primary key — UUID';
COMMENT ON COLUMN public.members.first_name  IS 'Member first name';
COMMENT ON COLUMN public.members.last_name   IS 'Member last name';
COMMENT ON COLUMN public.members.email       IS 'Unique contact email';
COMMENT ON COLUMN public.members.member_type IS 'Personal, business, or non-profit';
COMMENT ON COLUMN public.members.signup_type IS 'Full member or newsletter subscriber only';
COMMENT ON COLUMN public.members.zip_code          IS 'ZIP code for party proximity matching';
COMMENT ON COLUMN public.members.organization_name IS 'Company or organization name (required for business and nonprofit members)';
COMMENT ON COLUMN public.members.is_active         IS 'Soft-delete / unsubscribe flag';
COMMENT ON COLUMN public.members.created_at  IS 'UTC timestamp of signup';
COMMENT ON COLUMN public.members.updated_at  IS 'UTC timestamp of last update (auto-set by trigger)';
