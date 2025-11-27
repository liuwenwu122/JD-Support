-- JD-Support Supabase schema aligned with services/dbService.ts and types.ts
-- This script fixes the corrupted supabase_schema.sql and creates/adjusts the 'profiles' table
-- to match application expectations.

BEGIN;

-- 1. Create 'users' table to sync with auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Core table used by the app (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Link to Auth User
  name TEXT NOT NULL,
  target_role TEXT,
  target_job_description TEXT,
  versions JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns if table existed previously with a partial schema
DO $$
BEGIN
  -- Add user_id if it doesn't exist (for migration)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='user_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    -- NOTE: If there is existing data, you might need to handle NULLs or default values manually.
    -- For now, we assume new setup or we accept nulls temporarily until backfilled.
  END IF;

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
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);

-- Row Level Security: policies friendly for client-side usage (anon/authenticated).
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for USERS table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_view_own_data') THEN
    CREATE POLICY users_view_own_data ON public.users FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_update_own_data') THEN
    CREATE POLICY users_update_own_data ON public.users FOR UPDATE USING (auth.uid() = id);
  END IF;
END
$$;

-- Policies for PROFILES table (Strict ownership)
DO $$
BEGIN
  -- Drop old policies if they were too permissive (optional, but good practice if we are tightening security)
  -- DROP POLICY IF EXISTS profiles_allow_select ON public.profiles;
  -- DROP POLICY IF EXISTS profiles_allow_insert ON public.profiles;
  -- DROP POLICY IF EXISTS profiles_allow_update ON public.profiles;
  -- DROP POLICY IF EXISTS profiles_allow_delete ON public.profiles;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_select_own') THEN
    CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_insert_own') THEN
    CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_update_own') THEN
    CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_delete_own') THEN
    CREATE POLICY profiles_delete_own ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Trigger to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END
$$;

COMMIT;