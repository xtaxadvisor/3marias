/*
  # Add Security Policies and Constraints

  1. Security Updates
    - Add stronger password policy
    - Add RLS policies for all tables
    - Add security constraints
    - Add audit logging

  2. Changes
    - Add password strength check
    - Add default RLS deny policy
    - Add audit logging trigger
*/

-- Add password strength policy
CREATE OR REPLACE FUNCTION auth.check_password_strength(password text)
RETURNS boolean AS $$
BEGIN
  -- Check minimum length
  IF length(password) < 12 THEN
    RAISE EXCEPTION 'Password must be at least 12 characters long';
  END IF;

  -- Check for uppercase, lowercase, number and special character
  IF NOT (
    password ~ '[A-Z]' AND
    password ~ '[a-z]' AND
    password ~ '[0-9]' AND
    password ~ '[!@#$%^&*(),.?":{}|<>]'
  ) THEN
    RAISE EXCEPTION 'Password must include uppercase, lowercase, number and special character';
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Add default deny policies for all tables
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg(
      format(
        'CREATE POLICY "Deny all by default" ON %I.%I FOR ALL USING (false);',
        table_schema,
        table_name
      ),
      E'\n'
    )
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  );
END $$;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES auth.users(id),
  timestamp timestamptz DEFAULT now()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id
  )
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to all tables
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg(
      format(
        'CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON %I.%I FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();',
        table_schema,
        table_name
      ),
      E'\n'
    )
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  );
END $$;

-- Add RLS policies for users table
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Add RLS policies for clients table
CREATE POLICY "Professionals can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('professional', 'admin')
    )
  );

CREATE POLICY "Clients can view own data"
  ON clients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Add RLS policies for consultations table
CREATE POLICY "Users can view their consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients WHERE clients.id = client_id AND clients.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM professionals WHERE professionals.id = professional_id AND professionals.user_id = auth.uid()
    )
  );

-- Add RLS policies for documents table
CREATE POLICY "Users can view their documents"
  ON documents FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Add RLS policies for messages table
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());