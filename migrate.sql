-- =====================================================
-- ENEM MASTER — Migração incremental
-- Cole este arquivo no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/nkuiwdolkluetsadauwb/sql/new
-- =====================================================

-- ─── 1. Colunas extras na tabela progress ─────────────────────────────────────
ALTER TABLE progress ADD COLUMN IF NOT EXISTS xp_gained INTEGER DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS max_combo  INTEGER DEFAULT 0;

-- ─── 2. RLS na tabela user_achievements (caso ainda não tenha) ────────────────
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_achievements' AND policyname = 'Users can read own achievements'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own achievements" ON user_achievements
      FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_achievements' AND policyname = 'Users can insert own achievements'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own achievements" ON user_achievements
      FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- ─── 3. RLS na tabela question_attempts (se existir) ─────────────────────────
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'question_attempts' AND policyname = 'Users can read own attempts'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own attempts" ON question_attempts
      FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'question_attempts' AND policyname = 'Users can insert own attempts'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own attempts" ON question_attempts
      FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- ─── 4. RLS na tabela study_recommendations ──────────────────────────────────
ALTER TABLE study_recommendations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'study_recommendations' AND policyname = 'Users can read own recommendations'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own recommendations" ON study_recommendations
      FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END $$;

-- ─── 5. Corrigir usuário "Alex" que ficou com nome errado ────────────────────
-- Atualiza o nome usando os metadados do Auth (lê full_name do raw_user_meta_data)
UPDATE public.users u
SET name = COALESCE(au.raw_user_meta_data->>'full_name', u.name),
    updated_at = NOW()
FROM auth.users au
WHERE u.id = au.id
  AND (u.name = 'Alex' OR u.name IS NULL OR u.name = '')
  AND au.raw_user_meta_data->>'full_name' IS NOT NULL;

-- ─── 6. Corrigir "Function Search Path Mutable" em process_payment ────────────
-- Aviso de segurança do Supabase: a função não tinha search_path fixo,
-- o que permite ataques de injeção de search_path (OWASP: Injection).
-- A correção declara o search_path como vazio, forçando qualificação
-- explícita de todos os objetos do banco dentro da função.
--
-- Como recriar corretamente:
-- 1. Acesse: https://supabase.com/dashboard/project/nkuiwdolkluetsadauwb/database/functions
-- 2. Abra process_payment e copie a definição atual
-- 3. Substitua pela versão abaixo (ajuste o corpo se necessário)

CREATE OR REPLACE FUNCTION public.process_payment(
    p_email  TEXT,
    p_amount NUMERIC,
    p_status TEXT,
    p_method TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''          -- ← fixa o search_path (elimina o aviso)
AS $$
BEGIN
    -- Ativa plano premium para o usuário com o e-mail informado
    UPDATE public.users
    SET plan            = 'premium',
        plan_expires_at = NOW() + INTERVAL '30 days',
        updated_at      = NOW()
    WHERE email = p_email;
END;
$$;

-- Revogar acesso público direto — apenas funções/triggers devem chamar
REVOKE ALL ON FUNCTION public.process_payment(TEXT, NUMERIC, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_payment(TEXT, NUMERIC, TEXT, TEXT) TO authenticated;

-- ─── 7. Tabela webhook_logs (usada pelo admin.html) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id          BIGSERIAL   PRIMARY KEY,
  provider    TEXT        NOT NULL,                 -- hotmart | kiwify | cakto | mercadopago
  event_type  TEXT,                                 -- ex: PURCHASE_COMPLETE
  status      TEXT        DEFAULT 'ok',             -- ok | error | ignored | pending
  buyer_email TEXT,
  payload     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Apenas service_role (Edge Functions) pode inserir
CREATE POLICY "Service role can insert webhook_logs" ON public.webhook_logs
  FOR INSERT TO service_role WITH CHECK (true);

-- Usuários autenticados podem LER os logs (necessário para o admin.html via anon key)
-- Para produção, substitua por: USING (auth.jwt() ->> 'role' = 'service_role')
CREATE POLICY "Authenticated can read webhook_logs" ON public.webhook_logs
  FOR SELECT TO authenticated USING (true);

-- ─── 8. RPCs de admin: admin_set_premium e admin_remove_premium ──────────────
-- Chamadas pelo admin.js. SECURITY DEFINER permite o UPDATE mesmo sob RLS.
-- Para restringir por e-mail admin, adicione:
--   IF auth.jwt() ->> 'email' NOT IN ('admin@seudominio.com') THEN RAISE EXCEPTION …

CREATE OR REPLACE FUNCTION public.admin_set_premium(
    p_email TEXT,
    p_days  INTEGER DEFAULT 30
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.users
    SET plan            = 'premium',
        plan_expires_at = NOW() + (p_days || ' days')::INTERVAL,
        updated_at      = NOW()
    WHERE email = p_email;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário não encontrado: %', p_email;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_premium(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_premium(TEXT, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_remove_premium(
    p_email TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.users
    SET plan            = 'free',
        plan_expires_at = NULL,
        updated_at      = NOW()
    WHERE email = p_email;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário não encontrado: %', p_email;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_remove_premium(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_remove_premium(TEXT) TO authenticated;
