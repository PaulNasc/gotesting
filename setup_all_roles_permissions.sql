-- Script para configurar todos os perfis de usuários
-- Execute este script diretamente no Editor SQL do Supabase Dashboard

-- Cria o tipo enum user_role se não existir
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('master', 'admin', 'manager', 'tester');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adiciona a coluna role à tabela profiles se não existir
DO $$ 
BEGIN
    ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'tester';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Verifica se a tabela user_permissions existe e cria se não existir
DO $$ 
BEGIN
    -- Verifica se a tabela já existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_permissions') THEN
        -- Cria a tabela com o tipo correto (UUID para user_id)
        CREATE TABLE public.user_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          can_manage_users BOOLEAN NOT NULL DEFAULT FALSE,
          can_manage_plans BOOLEAN NOT NULL DEFAULT FALSE,
          can_manage_cases BOOLEAN NOT NULL DEFAULT TRUE,
          can_manage_executions BOOLEAN NOT NULL DEFAULT TRUE,
          can_view_reports BOOLEAN NOT NULL DEFAULT FALSE,
          can_use_ai BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(user_id)
        );
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao verificar/criar tabela: %', SQLERRM;
END $$;

-- Garante que paulo.santos@hybex.com.br seja master
UPDATE profiles 
SET role = 'master' 
WHERE email = 'paulo.santos@hybex.com.br';

-- Insere permissão para todos os usuários existentes
INSERT INTO user_permissions (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Define permissões padrão por nível de acesso
-- Permissões para masters
UPDATE user_permissions up
SET 
  can_manage_users = TRUE,
  can_manage_plans = TRUE,
  can_manage_cases = TRUE,
  can_manage_executions = TRUE,
  can_view_reports = TRUE,
  can_use_ai = TRUE
FROM profiles p
WHERE p.role = 'master' AND up.user_id = p.id;

-- Permissões para admins
UPDATE user_permissions up
SET 
  can_manage_users = TRUE,
  can_manage_plans = TRUE,
  can_manage_cases = TRUE,
  can_manage_executions = TRUE,
  can_view_reports = TRUE,
  can_use_ai = TRUE
FROM profiles p
WHERE p.role = 'admin' AND up.user_id = p.id;

-- Permissões para gerentes
UPDATE user_permissions up
SET 
  can_manage_users = FALSE,
  can_manage_plans = TRUE,
  can_manage_cases = TRUE,
  can_manage_executions = TRUE,
  can_view_reports = TRUE,
  can_use_ai = TRUE
FROM profiles p
WHERE p.role = 'manager' AND up.user_id = p.id;

-- Permissões para testers
UPDATE user_permissions up
SET 
  can_manage_users = FALSE,
  can_manage_plans = FALSE,
  can_manage_cases = TRUE,
  can_manage_executions = TRUE,
  can_view_reports = FALSE,
  can_use_ai = FALSE
FROM profiles p
WHERE p.role = 'tester' AND up.user_id = p.id;

-- Verifica os usuários e suas permissões
SELECT 
  u.email, 
  p.role, 
  up.can_manage_users,
  up.can_manage_plans,
  up.can_manage_cases,
  up.can_manage_executions,
  up.can_view_reports,
  up.can_use_ai
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_permissions up ON u.id = up.user_id
ORDER BY 
  CASE p.role 
    WHEN 'master' THEN 1 
    WHEN 'admin' THEN 2 
    WHEN 'manager' THEN 3 
    WHEN 'tester' THEN 4 
    ELSE 5 
  END, 
  u.email; 