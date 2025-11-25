-- JD-Support Supabase schema aligned with services/dbService.ts and types.ts
-- This script fixes the corrupted supabase_schema.sql and creates/adjusts the 'profiles' table
-- to match application expectations.

BEGIN;

-- Core table used by the app
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_role TEXT,
  target_job_description TEXT,
  versions JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns if table existed previously with a partial schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='target_role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN target_role TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='target_job_description'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN target_job_description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='versions'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN versions JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END
$$;

-- Ensure correct data types/defaults when columns already exist
DO $$
BEGIN
  -- versions should be jsonb
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='versions' AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN versions TYPE jsonb USING versions::jsonb;
  END IF;
  -- always set default to empty array
  ALTER TABLE public.profiles ALTER COLUMN versions SET DEFAULT '[]'::jsonb;

  -- updated_at should be timestamptz
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='updated_at' AND data_type NOT IN ('timestamp with time zone','timestamptz')
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN updated_at TYPE timestamptz USING updated_at::timestamptz;
  END IF;
END
$$;

-- Indexes for ordering and efficient JSON operations
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON public.profiles (updated_at);
CREATE INDEX IF NOT EXISTS profiles_versions_gin_idx ON public.profiles USING gin (versions);

-- Row Level Security: policies friendly for client-side usage (anon/authenticated).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_allow_select') THEN
    CREATE POLICY profiles_allow_select ON public.profiles FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_allow_insert') THEN
    CREATE POLICY profiles_allow_insert ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_allow_update') THEN
    CREATE POLICY profiles_allow_update ON public.profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_allow_delete') THEN
    CREATE POLICY profiles_allow_delete ON public.profiles FOR DELETE TO anon, authenticated USING (true);
  END IF;
END
$$;

COMMIT;