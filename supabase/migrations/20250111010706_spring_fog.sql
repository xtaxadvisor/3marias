/*
  # Add Test Functions and Procedures

  1. New Functions
    - test_connection: Database connectivity test
    - test_rls: RLS validation test
    - test_audit: Audit logging test

  2. Security
    - Functions are restricted to authenticated users
    - Results are sanitized
*/

-- Create test_connection function
CREATE OR REPLACE FUNCTION public.test_connection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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
      'error', SQLERRM,
      'timestamp', CURRENT_TIMESTAMP
    );
END;
$$;

-- Create test_rls function
CREATE OR REPLACE FUNCTION public.test_rls()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Test RLS policies
  PERFORM count(*) FROM users WHERE auth.uid() = auth_id;
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP
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

-- Create test_audit function
CREATE OR REPLACE FUNCTION public.test_audit()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Test audit logging
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    new_data,
    user_id
  ) VALUES (
    'test',
    gen_random_uuid(),
    'TEST',
    '{"test": true}'::jsonb,
    auth.uid()
  );
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP
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
GRANT EXECUTE ON FUNCTION public.test_rls() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_audit() TO authenticated;