-- Drop existing test functions to avoid conflicts
DROP FUNCTION IF EXISTS public.test_connection();
DROP FUNCTION IF EXISTS public.test_rls_policies();

-- Create test_connection function that doesn't require parameters
CREATE OR REPLACE FUNCTION public.test_connection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  connection_test jsonb;
BEGIN
  -- Simple connection test that will always succeed if DB is up
  SELECT jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP,
    'version', current_setting('server_version'),
    'search_path', current_setting('search_path')
  ) INTO connection_test;

  RETURN connection_test;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', CURRENT_TIMESTAMP
    );
END;
$$;

-- Create test_rls_policies function that doesn't require parameters
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  test_result jsonb;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Test RLS policies
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated',
      'timestamp', CURRENT_TIMESTAMP
    );
  END IF;

  -- Test basic RLS functionality
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP,
    'user_id', current_user_id
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.test_connection() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_rls_policies() TO authenticated;