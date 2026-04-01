-- =====================================================
-- ENEM MASTER — Criação de Tabelas
-- Cole este arquivo inteiro no SQL Editor do Supabase
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
  plan_expires_at TIMESTAMP,          -- NULL = free / data = expiração do premium
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Se a tabela já existir, adicione a coluna manualmente:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

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

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Tabela: user_achievements (conquistas/badges persistidos) ───────────────
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

CREATE POLICY "Users can read own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Migração: colunas extras em progress ─────────────────────────────────────
ALTER TABLE progress ADD COLUMN IF NOT EXISTS xp_gained  INTEGER DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS max_combo  INTEGER DEFAULT 0;

-- ─── Tabela: badges ──────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own badges" ON badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Tabela: activation_codes ──────────────────────────────
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

-- Qualquer usuário autenticado pode consultar se um código é válido
CREATE POLICY "Authenticated can read codes" ON activation_codes
  FOR SELECT TO authenticated USING (true);

-- Usuário autenticado pode atualizar o próprio uso (marcar como usado)
CREATE POLICY "Authenticated can update own redemption" ON activation_codes
  FOR UPDATE TO authenticated USING (used = false);

-- ─── Tabela: analytics_events ──────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id          BIGSERIAL PRIMARY KEY,
  event_name  TEXT        NOT NULL,
  user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
  properties  JSONB,
  created_at  TIMESTAMP   DEFAULT NOW()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode inserir seus próprios eventos
CREATE POLICY "Users can insert own analytics" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Apenas o próprio usuário pode ler seus eventos
CREATE POLICY "Users can read own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: criar perfil em public.users ao registrar no Auth
-- Rode este bloco no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════

-- Função chamada automaticamente quando um novo usuário se registra
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

-- Trigger disparado a cada novo cadastro no Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- MIGRAÇÃO: criar registros para usuários Auth já existentes
-- (rode uma única vez após adicionar o trigger acima)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO public.users (id, name, email, school, plan, created_at, updated_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) AS name,
  email,
  NULL,
  'free',
  created_at,
  NOW()
FROM auth.users
ON CONFLICT (id) DO NOTHING;
