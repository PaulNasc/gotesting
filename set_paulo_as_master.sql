-- Script para definir paulo.santos@hybex.com.br como usuário master
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
    ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'master';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Atualiza o perfil para role master
UPDATE profiles 
SET role = 'master' 
WHERE email = 'paulo.santos@hybex.com.br';

-- Verifica se a tabela user_permissions existe e cria se não existir
DO $$ 
BEGIN
    -- Verifica se a tabela já existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_permissions') THEN
        -- Cria a tabela com o tipo correto (UUID para user_id)
        CREATE TABLE public.user_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao verificar/criar tabela: %', SQLERRM;
END $$;

-- Insere permissão para o usuário se não existir
INSERT INTO user_permissions (user_id)
SELECT id FROM auth.users 
WHERE email = 'paulo.santos@hybex.com.br'
ON CONFLICT (user_id) DO NOTHING;

-- Garante que tenha todas as permissões
UPDATE user_permissions 
SET 
  can_manage_users = TRUE,
  can_manage_plans = TRUE,
  can_manage_cases = TRUE,
  can_manage_executions = TRUE,
  can_view_reports = TRUE,
  can_use_ai = TRUE
FROM auth.users
WHERE auth.users.email = 'paulo.santos@hybex.com.br'
AND user_permissions.user_id = auth.users.id;

-- Verifica se o usuário foi atualizado corretamente
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
WHERE u.email = 'paulo.santos@hybex.com.br'; 