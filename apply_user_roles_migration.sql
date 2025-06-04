-- Este script deve ser executado diretamente no Editor SQL do Supabase Dashboard

-- Create roles enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('master', 'admin', 'manager', 'tester');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to profiles table if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'master';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create user_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_manage_users BOOLEAN NOT NULL DEFAULT TRUE,
  can_manage_plans BOOLEAN NOT NULL DEFAULT TRUE,
  can_manage_cases BOOLEAN NOT NULL DEFAULT TRUE,
  can_manage_executions BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_reports BOOLEAN NOT NULL DEFAULT TRUE,
  can_use_ai BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add RLS policies for user_permissions
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Policy for selecting - only user themselves or masters/admins can view permissions
DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
CREATE POLICY "Users can view their own permissions" 
  ON user_permissions 
  FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'master' OR profiles.role = 'admin')
  ));

-- Policy for inserting - only masters/admins can insert permissions
DROP POLICY IF EXISTS "Only masters and admins can insert permissions" ON user_permissions;
CREATE POLICY "Only masters and admins can insert permissions" 
  ON user_permissions 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'master' OR profiles.role = 'admin')
  ));

-- Policy for updating - only masters/admins can update permissions
DROP POLICY IF EXISTS "Only masters and admins can update permissions" ON user_permissions;
CREATE POLICY "Only masters and admins can update permissions" 
  ON user_permissions 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'master' OR profiles.role = 'admin')
  ));

-- Garante que paulo.santos@hybex.com.br seja master (mesmo se o email for diferente, ajuste aqui)
UPDATE profiles 
SET role = 'master' 
WHERE email = 'paulo.santos@hybex.com.br' OR email = 'paulo.santos@hybex.com';

-- Certifique-se de que todos os usuários existentes são atualizados para master
UPDATE profiles SET role = 'master';

-- Create trigger for updating the updated_at column if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_permissions_updated_at') THEN
    CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
EXCEPTION WHEN others THEN
  -- Do nothing if error
END $$;

-- Insert default permissions for all existing users
INSERT INTO user_permissions (user_id, can_manage_users)
SELECT id, TRUE FROM auth.users
ON CONFLICT (user_id) DO UPDATE
SET can_manage_users = TRUE;

-- Garante que paulo.santos@hybex.com.br tenha todas as permissões
UPDATE user_permissions 
SET 
  can_manage_users = TRUE,
  can_manage_plans = TRUE,
  can_manage_cases = TRUE,
  can_manage_executions = TRUE,
  can_view_reports = TRUE,
  can_use_ai = TRUE
FROM auth.users
WHERE (auth.users.email = 'paulo.santos@hybex.com.br' OR auth.users.email = 'paulo.santos@hybex.com')
AND user_permissions.user_id = auth.users.id;

-- Update user_settings RLS policies to allow masters/admins to manage all settings
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
CREATE POLICY "Users can view settings" 
  ON user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'master' OR profiles.role = 'admin')
  ));

DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
CREATE POLICY "Users can insert settings" 
  ON user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'master' OR profiles.role = 'admin')
  ));

DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update settings" 
  ON user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'master' OR profiles.role = 'admin')
  ));

DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
CREATE POLICY "Users can delete settings" 
  ON user_settings 
  FOR DELETE 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'master' OR profiles.role = 'admin')
  )); 