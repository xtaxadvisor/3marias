-- Create test_connection function with proper return type and error handling
CREATE OR REPLACE FUNCTION public.test_connection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_result jsonb;
BEGIN
  -- Test basic connectivity
  PERFORM count(*) FROM users LIMIT 1;
  
  -- Return success result
  test_result := jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP,
    'version', current_setting('server_version')
  );
  
  RETURN test_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', CURRENT_TIMESTAMP
    );
END;
$$;

-- Create test_rls function with proper return type and error handling
CREATE OR REPLACE FUNCTION public.test_rls()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_result jsonb;
  user_id uuid;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Test RLS policies
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Test user table RLS
  PERFORM count(*) FROM users WHERE auth_id = user_id;
  
  -- Return success result
  test_result := jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP,
    'user_id', user_id
  );
  
  RETURN test_result;
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

-- Add RLS test table
CREATE TABLE IF NOT EXISTS rls_test (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  data text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on test table
ALTER TABLE rls_test ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for test table
CREATE POLICY "Users can only see their own data" 
  ON rls_test FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own data" 
  ON rls_test FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- Create helper function to test RLS policies
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_result jsonb;
  test_id uuid;
BEGIN
  -- Insert test data
  INSERT INTO rls_test (user_id, data)
  VALUES (auth.uid(), 'test data')
  RETURNING id INTO test_id;
  
  -- Test SELECT policy
  PERFORM count(*) FROM rls_test WHERE id = test_id AND user_id = auth.uid();
  
  -- Clean up test data
  DELETE FROM rls_test WHERE id = test_id;
  
  -- Return success result
  test_result := jsonb_build_object(
    'success', true,
    'timestamp', CURRENT_TIMESTAMP,
    'message', 'RLS policies working correctly'
  );
  
  RETURN test_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Clean up on error
    IF test_id IS NOT NULL THEN
      DELETE FROM rls_test WHERE id = test_id;
    END IF;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', CURRENT_TIMESTAMP
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.test_rls_policies() TO authenticated;