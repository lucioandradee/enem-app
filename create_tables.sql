-- =====================================================
-- ENEM MASTER — Setup Completo (idempotente)
-- Cole este arquivo inteiro no SQL Editor do Supabase
-- Seguro para rodar múltiplas vezes — não duplica nada
-- https://supabase.com/dashboard/project/nkuiwdolkluetsadauwb/sql/new
-- =====================================================

-- ─── Tabela: users ───────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  school TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  goal TEXT,
  plan TEXT DEFAULT 'free',
  plan_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data"   ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can read own data"   ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- ─── Tabela: progress ────────────────────────────────
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  questions_answered INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE progress ADD COLUMN IF NOT EXISTS xp_gained INTEGER DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS max_combo INTEGER DEFAULT 0;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own progress"   ON progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON progress;

CREATE POLICY "Users can read own progress"   ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Tabela: user_achievements ───────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id    TEXT NOT NULL,
  badge_name  TEXT,
  category    TEXT,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own achievements"   ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;

CREATE POLICY "Users can read own achievements"   ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Tabela: badges ──────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own badges"   ON badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON badges;

CREATE POLICY "Users can read own badges"   ON badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Tabela: activation_codes ────────────────────────
CREATE TABLE IF NOT EXISTS activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'premium',
  duration_days INTEGER DEFAULT 30,
  used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read codes"           ON activation_codes;
DROP POLICY IF EXISTS "Authenticated can update own redemption" ON activation_codes;

CREATE POLICY "Authenticated can read codes"            ON activation_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update own redemption" ON activation_codes FOR UPDATE TO authenticated USING (used = false);

-- ─── Tabela: analytics_events ────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id          BIGSERIAL PRIMARY KEY,
  event_name  TEXT      NOT NULL,
  user_id     UUID      REFERENCES users(id) ON DELETE SET NULL,
  properties  JSONB,
  created_at  TIMESTAMP DEFAULT NOW()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics_events;
DROP POLICY IF EXISTS "Users can read own analytics"   ON analytics_events;

CREATE POLICY "Users can insert own analytics" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can read own analytics"   ON analytics_events FOR SELECT  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: criar perfil em public.users ao registrar no Auth
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, school, plan, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NULL,
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- MIGRAÇÃO: criar registros para usuários Auth já existentes
-- ═══════════════════════════════════════════════════════════════
INSERT INTO public.users (id, name, email, school, plan, created_at, updated_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  email,
  NULL,
  'free',
  created_at,
  NOW()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- FUNÇÃO RPC: auto_deactivate_expired_premium
-- Reverte para 'free' usuários com plano Premium expirado.
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.auto_deactivate_expired_premium()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET
    plan            = 'free',
    plan_expires_at = NULL,
    updated_at      = NOW()
  WHERE
    plan = 'premium'
    AND plan_expires_at IS NOT NULL
    AND plan_expires_at < NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_deactivate_expired_premium() TO authenticated;

-- ═══════════════════════════════════════════════════════════════
-- TABELA: webhook_events
-- Audit log de todos os webhooks recebidos + idempotência
-- Evita que o mesmo pagamento ative o premium duas vezes
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS webhook_events (
  id             BIGSERIAL PRIMARY KEY,
  gateway        TEXT      NOT NULL,
  event_type     TEXT,
  transaction_id TEXT,
  buyer_email    TEXT,
  plan_action    TEXT,
  duration_days  INTEGER,
  payload        JSONB,
  result         TEXT      DEFAULT 'pending',
  error_msg      TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Índice único: mesmo gateway + mesmo transaction_id = mesmo pagamento (idempotência)
CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_idempotency_idx
  ON webhook_events (gateway, transaction_id)
  WHERE transaction_id IS NOT NULL;

-- Índice de busca por email (para auditoria de um cliente específico)
CREATE INDEX IF NOT EXISTS webhook_events_email_idx
  ON webhook_events (buyer_email);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- Sem políticas de usuário: apenas service_role (Edge Function) pode acessar

-- ═══════════════════════════════════════════════════════════════
-- FUNÇÃO RPC: activate_premium_by_email
-- Ativa ou renova premium empilhando dias sobre expiração atual.
-- Lida com todos os cenários:
--   1. Perfil existe → atualiza
--   2. Auth user existe mas sem perfil → cria perfil com ID correto
--   3. Nenhuma conta existe → cria perfil (inviteUserByEmail é chamado antes pelo webhook)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.activate_premium_by_email(
  p_email         TEXT,
  p_name          TEXT,
  p_duration_days INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id    UUID;
  v_base_date  TIMESTAMP WITH TIME ZONE;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Busca perfil e expiração atuais
  SELECT id, plan_expires_at INTO v_user_id, v_base_date
  FROM public.users
  WHERE email = p_email;

  -- Empilha dias: soma a partir da expiração futura (se existir) ou de agora
  -- Isso garante que renovações não percam dias restantes
  v_expires_at := GREATEST(COALESCE(v_base_date, NOW()), NOW())
                + (p_duration_days || ' days')::INTERVAL;

  IF v_user_id IS NOT NULL THEN
    -- Perfil existe: apenas atualizar plano e expiração
    UPDATE public.users
    SET plan            = 'premium',
        plan_expires_at = v_expires_at,
        updated_at      = NOW()
    WHERE id = v_user_id;
    RETURN 'updated';
  END IF;

  -- Perfil não existe: verificar se há auth user com este email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

  IF v_user_id IS NOT NULL THEN
    -- Auth user existe mas sem perfil → criar com o UUID correto
    INSERT INTO public.users (id, email, name, plan, plan_expires_at, created_at, updated_at)
    VALUES (v_user_id, p_email, p_name, 'premium', v_expires_at, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
      SET plan            = 'premium',
          plan_expires_at = EXCLUDED.plan_expires_at,
          updated_at      = NOW();
    RETURN 'auth_linked';
  END IF;

  -- Nenhuma conta: inviteUserByEmail falhou ou ainda não processou o trigger.
  -- Cria perfil com UUID temporário. O trigger handle_new_user vai corrigir
  -- o ID quando o usuário ativar a conta pelo link de convite.
  INSERT INTO public.users (id, email, name, plan, plan_expires_at, created_at, updated_at)
  VALUES (gen_random_uuid(), p_email, p_name, 'premium', v_expires_at, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE
    SET plan            = 'premium',
        plan_expires_at = EXCLUDED.plan_expires_at,
        updated_at      = NOW();
  RETURN 'created_pending';
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- FUNÇÃO RPC: deactivate_premium_by_email
-- Remove acesso premium de um usuário por email
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.deactivate_premium_by_email(
  p_email TEXT
)
RETURNS TEXT
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
    RETURN 'not_found';
  END IF;

  RETURN 'deactivated';
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: handle_new_user (versão melhorada)
-- Cria perfil ao registrar no Auth.
-- Também corrige o UUID quando um perfil foi pré-criado pelo webhook
-- (comprador que não tinha conta antes de comprar).
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se já existe um perfil com este email (pré-criado pelo webhook para premium),
  -- atualiza o UUID para o correto e preserva o plano premium.
  UPDATE public.users
  SET id         = NEW.id,
      name       = COALESCE(NEW.raw_user_meta_data->>'full_name', name),
      updated_at = NOW()
  WHERE email = NEW.email
    AND id != NEW.id;

  -- Se nenhuma linha foi atualizada (caso normal), cria perfil do zero
  IF NOT FOUND THEN
    INSERT INTO public.users (id, name, email, school, plan, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      NULL,
      'free',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- POLÍTICAS RLS: acesso de administrador
-- O admin é identificado por app_metadata.role = 'admin'
-- (definido via Supabase Dashboard → Authentication → Users → Edit
--  ou via: supabase auth admin update-user <user_id> --app-metadata '{"role":"admin"}')
-- ═══════════════════════════════════════════════════════════════

-- Admin pode ler TODOS os usuários (o painel admin usa isso)
DROP POLICY IF EXISTS "Admin can read all users" ON public.users;
CREATE POLICY "Admin can read all users" ON public.users
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admin pode atualizar qualquer usuário (ativar/remover premium manual)
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;
CREATE POLICY "Admin can update all users" ON public.users
  FOR UPDATE USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admin pode ler todos os webhook_events (logs do painel)
DROP POLICY IF EXISTS "Admin can read webhook_events" ON public.webhook_events;
CREATE POLICY "Admin can read webhook_events" ON public.webhook_events
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admin pode inserir em webhook_events (caso precise registrar manualmente)
DROP POLICY IF EXISTS "Admin can insert webhook_events" ON public.webhook_events;
CREATE POLICY "Admin can insert webhook_events" ON public.webhook_events
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ═══════════════════════════════════════════════════════════════
-- GRANTS: permite que usuários autenticados chamem as RPCs admin
-- As funções são SECURITY DEFINER, portanto executam com
-- permissões do owner independente de quem chamou.
-- ═══════════════════════════════════════════════════════════════
GRANT EXECUTE ON FUNCTION public.activate_premium_by_email(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deactivate_premium_by_email(TEXT)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_deactivate_expired_premium()              TO authenticated;
