# 🚀 Guia de Integração Supabase - ENEM Master

## 1️⃣ Criar Conta e Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Sign Up" e crie uma conta
3. Crie um novo projeto:
   - Nome: `enem-master`
   - Região: Próxima a você (ex: South America - São Paulo)
   - Copie a **URL do projeto** e a **Chave Anônima** (ANON KEY)

## 2️⃣ Obter Chaves do Supabase

Após criar o projeto:
1. Vá para **Settings → API**
2. Copie:
   - `Project URL` → substitua em `SUPABASE_URL`
   - `anon public` → substitua em `SUPABASE_ANON_KEY`

## 3️⃣ Criar Tabelas no Supabase

Vá para **SQL Editor** e execute os seguintes scripts:

### Tabela: Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  school TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  goal TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Tabela: Progress (histórico de estudos)
```sql
CREATE TABLE progress (
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
```

### Tabela: Badges
```sql
CREATE TABLE badges (
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
```

## 4️⃣ Criar Trigger de Auto-Perfil (OBRIGATÓRIO)

Sem esse trigger, novos usuários não aparecem na tabela `users`.

Vá em **SQL Editor** no Supabase e execute:

```sql
-- Função que cria perfil automaticamente ao cadastrar
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

-- Trigger no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Migrar usuários já existentes (rode uma vez)

```sql
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
```

## 5️⃣ Atualizar HTML

No arquivo `index.html`, adicione antes de `</body>`:

```html
<!-- Supabase Config -->
<script src="supabase-config.js"></script>
```

Certifique-se de que está DEPOIS do `app.js`:

```html
<script src="app.js"></script>
<script src="supabase-config.js"></script>
</body>
```

## 5️⃣ Configurar Chaves

Abra `supabase-config.js` e substitua:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co'; // ← Sua URL
const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui';     // ← Sua Chave
```

## 6️⃣ Usar as Funções no App

### Login
```javascript
const result = await loginUser('user@email.com', 'password');
if (result.success) {
    console.log('Usuário logado:', result.user);
}
```

### Registrar
```javascript
const result = await signUpUser('novo@email.com', 'password123', 'João Silva');
if (result.success) {
    console.log('Usuário criado:', result.user);
}
```

### Salvar Dados
```javascript
const user = await getCurrentUser();
if (user) {
    await saveUserData(user.id);
}
```

### Carregar Ranking
```javascript
const ranking = await getSchoolRanking('Sua Escola');
console.log('Ranking da escola:', ranking.data);
```

### Salvar Progresso do Simulado
```javascript
const user = await getCurrentUser();
if (user) {
    await saveProgress(user.id, 'Matemática', 50, 45); // 50 questões, 45 acertadas
}
```

## ✅ Testar Conexão

No console do navegador, execute:
```javascript
const user = await getCurrentUser();
console.log('Usuário conectado:', user);
```

Se aparecer os dados do usuário, está tudo funcionando! 🎉

## 📚 Funções Disponíveis

| Função | O que faz |
|--------|-----------|
| `signUpUser(email, pass, name)` | Registra novo usuário |
| `loginUser(email, pass)` | Faz login |
| `logoutUser()` | Faz logout |
| `getCurrentUser()` | Retorna usuário autenticado |
| `saveUserData(userId)` | Salva perfil do usuário |
| `loadUserData(userId)` | Carrega perfil do usuário |
| `saveProgress(userId, subject, answered, correct)` | Salva progresso de simulado |
| `loadProgressHistory(userId)` | Carrega histórico de simulados |
| `getSchoolRanking(school)` | Ranking da escola |
| `getGlobalTop()` | Top 50 global |

## 🔐 Segurança

- ✅ Usa autenticação do Supabase (mais seguro que localStorage)
- ✅ Row Level Security (RLS) ativa em todas as tabelas
- ✅ Cada usuário só vê seus próprios dados
- ✅ Senhas não são armazenadas localmente

## 🆘 Troubleshooting

**"Supabase is not defined"**
- Verifique se `supabase-config.js` está depois de `app.js` no HTML

**Erro de CORS**
- Vá em Supabase → Settings → API → CORS
- Adicione seu domínio

**Dados não sincronizam**
- Confira as chaves (URL e ANON_KEY)
- Verifique RLS policies

---

**Pronto para usar! 🚀**
