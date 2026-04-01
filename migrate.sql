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
