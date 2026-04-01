# Plano de Integração Backend — ENEM MASTER

Versão: 1.0  
Status: Pendente  
Objetivo: Conectar o frontend (app.js) ao Supabase, substituindo localStorage por persistência real e autenticação segura.

---

## Diagnóstico Atual

| Área              | Hoje                        | Após integração              |
|-------------------|-----------------------------|------------------------------|
| Autenticação      | Nenhuma (localStorage)      | Supabase Auth (JWT)          |
| Dados do usuário  | localStorage (`enem_state`) | Tabela `users` (Supabase)    |
| Progresso/quiz    | localStorage                | Tabela `progress` (Supabase) |
| Ranking           | Dados fictícios hardcoded   | Query real da tabela `users` |
| Logout            | Limpa localStorage          | `supabase.auth.signOut()`    |
| Offline           | Funciona 100% local         | Offline-first com sync       |

**Arquivos-chave:**
- `supabase-config.js` — funções já escritas, chaves precisam ser preenchidas
- `app.js` — SPA principal, precisa chamar as funções do config
- `index.html` — telas de login/onboarding precisam de handlers reais

---

## Fase 0 — Configuração do Supabase (Pré-requisito)

**Responsável:** Desenvolvedor  
**Estimativa:** 1 hora

### Passos

1. Criar projeto no [supabase.com](https://supabase.com):
   - Nome: `enem-master`
   - Região: South America (São Paulo)

2. Copiar credenciais em **Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `anon public key` → `SUPABASE_ANON_KEY`

3. Preencher em `supabase-config.js`:
   ```js
   const SUPABASE_URL = 'https://xxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJ...';
   ```

4. Executar os 3 scripts SQL no **SQL Editor** do Supabase (ver `SUPABASE_SETUP.md`):
   - Tabela `users` com RLS
   - Tabela `progress` com RLS
   - Tabela `badges` com RLS

5. Ativar **Email Auth** em Authentication → Providers → Email.

---

## Fase 1 — Carregar Script Supabase no HTML

**Arquivo:** `index.html`  
**Estimativa:** 15 min

### O que fazer

Adicionar o script do Supabase CDN **antes** de `supabase-config.js`:

```html
<!-- ANTES do </body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="app.js"></script>
<script src="supabase-config.js"></script>
</body>
```

> ⚠️ Ordem obrigatória: Supabase CDN → app.js → supabase-config.js

### Validação
- Abrir console do navegador
- Deve aparecer: `✅ Supabase conectado!`

---

## Fase 2 — Autenticação

**Arquivos:** `app.js`, `supabase-config.js`  
**Estimativa:** 3–4 horas

### 2.1 Tela de Onboarding → Registro Supabase

No `app.js`, função `finishOnboarding()` (chamada quando o usuário conclui os 3 passos):

**Antes:**
```js
// Apenas salva em localStorage
state.onboardingDone = true;
saveState();
navigate('home');
```

**Depois:**
```js
state.onboardingDone = true;
saveState();

// Registrar no Supabase (email e senha coletados no onboarding)
const result = await signUpUser(state.user.email, state.user.password, state.user.name);
if (result.success) {
    await saveUserData(result.user.id);
    state.user.id = result.user.id;
    saveState();
}
navigate('home');
```

### 2.2 Tela de Settings → Login Supabase

No `app.js`, ao salvar perfil (botão "Salvar" nas configurações):

```js
// Após atualizar state.user
const user = await getCurrentUser();
if (user) {
    await saveUserData(user.id);
}
```

### 2.3 Inicialização do App → Restaurar Sessão

No início do `app.js` (função `init()` ou `DOMContentLoaded`):

```js
document.addEventListener('DOMContentLoaded', async () => {
    loadState();

    // Verificar sessão Supabase ativa
    const user = await getCurrentUser();
    if (user) {
        state.user.id = user.id;
        state.user.email = user.email;
        await loadUserData(user.id); // Carrega dados do servidor
        saveState();
    }

    updateUI();
    navigate(state.onboardingDone ? 'home' : 'onboarding');
});
```

### 2.4 Logout

Função já existe em `supabase-config.js`. Conectar ao botão de logout em `app.js`:

```js
async function handleLogout() {
    await logoutUser(); // limpa state e desloga do Supabase
    navigate('onboarding');
}
```

### Campos necessários no Onboarding

O onboarding atual coleta: nome, objetivo, matérias fracas.  
Para autenticação, adicionar **Step 0** (ou campo adicional) com:
- Email
- Senha (mínimo 6 caracteres)

---

## Fase 3 — Sincronização de Progresso

**Arquivos:** `app.js`  
**Estimativa:** 2 horas

### 3.1 Salvar progresso após cada quiz

Na função `showResult()` do `app.js`, após calcular os resultados:

```js
// Após calcular pct, xpGained, etc.
const user = await getCurrentUser();
if (user) {
    await saveProgress(
        user.id,
        currentQuiz.discipline,   // ex: "Matemática"
        currentQuiz.questions.length,
        score
    );
}
```

### 3.2 Carregar histórico ao abrir Perfil/Revisão

Na função `renderProfile()` e `renderReview()`:

```js
const user = await getCurrentUser();
if (user) {
    const history = await loadProgressHistory(user.id);
    if (history.success) {
        // Usar history.data para renderizar
    }
}
```

### Estratégia Offline-First

- Sempre salvar em `localStorage` primeiro (já feito)
- Tentar sync com Supabase em segundo plano
- Se falhar (sem internet), marcar como `pendingSync: true` no state
- Ao reconectar, enviar os itens pendentes

```js
// Em app.js, após salvar localmente
try {
    await saveProgress(...);
} catch(e) {
    state.pendingSync = true; // Sync na próxima sessão
    saveState();
}
```

---

## Fase 4 — Ranking Real

**Arquivo:** `app.js` → `renderRanking()`  
**Estimativa:** 2 horas

### 4.1 Substituir dados hardcoded

**Antes (app.js):**
```js
// Dados fictícios hardcoded no HTML
```

**Depois:**
```js
async function renderRanking() {
    // Mostrar skeleton/loading
    const user = await getCurrentUser();
    
    // Ranking da escola
    if (user && state.user.school) {
        const schoolRanking = await getSchoolRanking(state.user.school);
        if (schoolRanking.success) renderRankingList(schoolRanking.data);
    }

    // Top global
    const globalTop = await getGlobalTop();
    if (globalTop.success) renderGlobalPodium(globalTop.data);
}
```

### 4.2 Adicionar Loading State

Enquanto carrega, exibir skeleton cards no lugar dos itens da lista.

---

## Fase 5 — Variáveis de Ambiente (Segurança)

**Estimativa:** 30 min

As chaves `SUPABASE_URL` e `SUPABASE_ANON_KEY` não devem ficar hardcoded no JS que vai para produção.

### Opção A — Arquivo .env com build (Recomendado para deploy)
Usar Vite/Parcel/Webpack com `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Opção B — Config separada ignorada pelo git (Para MVP)
Criar arquivo `config.local.js` no `.gitignore`:
```js
// config.local.js (NÃO commitar)
window.SUPABASE_URL = 'https://xxxx.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJ...';
```

Incluir antes dos outros scripts no `index.html`.

> ⚠️ A `anon key` do Supabase é pública por design (segurança garantida pelo RLS), mas nunca commitar a `service_role key`.

---

## Checklist de Integração

### Fase 0 — Supabase Setup
- [ ] Criar projeto no Supabase
- [ ] Copiar URL e ANON_KEY
- [ ] Preencher chaves no `supabase-config.js`
- [ ] Executar SQL: tabela `users` com RLS
- [ ] Executar SQL: tabela `progress` com RLS
- [ ] Executar SQL: tabela `badges` com RLS
- [ ] Ativar Email Auth

### Fase 1 — HTML
- [ ] Adicionar CDN do Supabase no `index.html`
- [ ] Verificar ordem dos scripts
- [ ] Checar `✅ Supabase conectado!` no console

### Fase 2 — Autenticação
- [ ] Adicionar campos email/senha ao onboarding
- [ ] Conectar `finishOnboarding()` ao `signUpUser()`
- [ ] Restaurar sessão no `DOMContentLoaded`
- [ ] Conectar botão logout ao `logoutUser()`
- [ ] Testar fluxo completo: registro → login → logout

### Fase 3 — Progresso
- [ ] Chamar `saveProgress()` no `showResult()`
- [ ] Carregar histórico no `renderProfile()`
- [ ] Carregar histórico no `renderReview()`
- [ ] Implementar fallback offline (pendingSync)

### Fase 4 — Ranking
- [ ] Substituir dados hardcoded por `getSchoolRanking()`
- [ ] Substituir podium por `getGlobalTop()`
- [ ] Adicionar loading state (skeleton)

### Fase 5 — Segurança
- [ ] Decidir estratégia de variáveis de ambiente
- [ ] Adicionar `config.local.js` ao `.gitignore`
- [ ] Verificar que service_role key nunca está no código

---

## Ordem de Execução Recomendada

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
  30min    15min    4h       2h        2h        30min
```

**Total estimado:** ~9–10 horas de desenvolvimento

---

## Testes de Validação

Após cada fase, executar no console do navegador:

```js
// Fase 1
const { createClient } = window.supabase; // não deve ser undefined

// Fase 2
const user = await getCurrentUser();
console.log(user); // deve retornar objeto com id e email

// Fase 3
const history = await loadProgressHistory(user.id);
console.log(history.data); // deve listar registros reais

// Fase 4
const ranking = await getGlobalTop();
console.log(ranking.data); // deve listar usuários reais
```

---

## Dependências Externas

| Dependência         | Versão | Como usar                                      |
|---------------------|--------|------------------------------------------------|
| `@supabase/supabase-js` | v2 | CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` |
| Supabase projeto    | —      | Criar em supabase.com                          |
| Email Auth          | —      | Ativar em Authentication → Providers           |

---

*Documento gerado como guia de implementação. Ver também: `SUPABASE_SETUP.md` para SQL scripts detalhados.*
