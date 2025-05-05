-- Migration: Add phone and is_active to profiles and update trigger function

-- 1. Add new columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Replace trigger function to populate profiles on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_user_created()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone, is_active)
  VALUES (
    NEW.id,
    NEW.user_metadata->>'full_name',
    NEW.email,
    NEW.user_metadata->>'role',
    NEW.user_metadata->>'phone',
    (NEW.user_metadata->>'is_active')::BOOLEAN
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
