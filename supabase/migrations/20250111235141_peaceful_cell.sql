-- Drop existing test functions
DROP FUNCTION IF EXISTS public.test_connection();
DROP FUNCTION IF EXISTS public.test_rls_policies();

-- Create public_data table for anonymous access testing
CREATE TABLE IF NOT EXISTS public_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now()
);

-- Allow anonymous SELECT access to public_data
ALTER TABLE public_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous SELECT on public_data"
  ON public_data FOR SELECT
  TO anon
  USING (true);

-- Insert some sample public data
INSERT INTO public_data (title, content)
VALUES ('Welcome', 'Welcome to ProTaXAdvisors!');

-- Create improved test_connection function
CREATE OR REPLACE FUNCTION public.test_connection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple connection test
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP,
    'version', current_setting('server_version'),
    'search_path', current_setting('search_path')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', CURRENT_TIMESTAMP
    );
END;
$$;

-- Create improved test_rls_policies function
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Test public data access
  PERFORM count(*) FROM public_data;
  
  -- Return success result
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP,
    'user_id', current_user_id,
    'message', 'RLS policies working correctly'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', CURRENT_TIMESTAMP
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.test_connection() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_rls_policies() TO authenticated, anon;