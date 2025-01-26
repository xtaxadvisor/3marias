/*
  # Fix Test Functions and Public Data

  1. Changes
    - Drop existing test functions to avoid conflicts
    - Create public_data table with proper RLS
    - Create simplified test functions that don't require parameters
    - Grant proper permissions to authenticated and anonymous users

  2. Security
    - Enable RLS on public_data table
    - Add policy for anonymous read access
    - Set proper security definer and search path
*/

-- Drop existing test functions
DROP FUNCTION IF EXISTS public.test_connection();
DROP FUNCTION IF EXISTS public.test_rls_policies();

-- Create public_data table
CREATE TABLE IF NOT EXISTS public_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and add policy
ALTER TABLE public_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to public_data"
  ON public_data
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert sample data
INSERT INTO public_data (title, content)
VALUES ('Welcome', 'Welcome to ProTaXAdvisors!')
ON CONFLICT DO NOTHING;

-- Create test_connection function
CREATE OR REPLACE FUNCTION public.test_connection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP,
    'version', current_setting('server_version')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create test_rls_policies function
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  public_data_count integer;
BEGIN
  -- Test public data access
  SELECT count(*) INTO public_data_count FROM public_data;
  
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP,
    'public_data_count', public_data_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.test_connection() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.test_rls_policies() TO authenticated, anon;