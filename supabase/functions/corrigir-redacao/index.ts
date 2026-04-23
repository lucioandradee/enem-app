// @ts-nocheck — ambiente Deno (runtime Supabase Edge); tipos Node/browser não se aplicam aqui
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Configuração ───────────────────────────────────────────────────────────────
const GROQ_KEY     = Deno.env.get('GROQ_API_KEY') ?? Deno.env.get('GROQ_KEY') ?? '';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS  = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] as const;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SVC_ROLE     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const DAILY_LIMIT  = 5;
const MAX_CHARS    = 3000;
const MIN_CHARS    = 100;
const COMP_KEYS    = ['c1', 'c2', 'c3', 'c4', 'c5'] as const;

type CompKey = typeof COMP_KEYS[number];
interface Competencia { nota: number; feedback: string; }
interface CorrecaoResult extends Record<CompKey, Competencia> {
  total: number;
  comentario_geral: string;
}

// ── Helpers HTTP ───────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
} as const;

const jsonHeaders = { ...CORS, 'Content-Type': 'application/json' } as const;
const ok  = (data: unknown)             => new Response(JSON.stringify(data), { status: 200, headers: jsonHeaders });
const err = (msg: string, status = 400) => new Response(JSON.stringify({ error: msg }), { status, headers: jsonHeaders });
const sleep = (ms: number)              => new Promise<void>(r => setTimeout(r, ms));

// ── Chamada Groq (retry + fallback de modelo) ─────────────────────────────────
async function callGroq(prompt: string): Promise<CorrecaoResult | null> {
  for (const model of GROQ_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 38_000);

      try {
        const res = await fetch(GROQ_URL, {
          method: 'POST',
          signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 1800,
          }),
        });
        clearTimeout(timer);

        if (!res.ok) {
          const e = await res.json().catch(() => ({})) as { error?: { message?: string } };
          console.error(`[redacao] groq ${res.status}:`, e?.error?.message ?? '');
          if (res.status === 401) throw new Error('invalid_key');
          if (res.status === 429 && attempt < 2) { await sleep(1500); continue; }
          break; // tenta modelo backup
        }

        const data    = await res.json().catch(() => null) as { choices?: { message?: { content?: string } }[] } | null;
        const raw     = data?.choices?.[0]?.message?.content ?? '';
        const match   = raw.match(/\{[\s\S]*\}/);
        if (!match) { if (attempt < 2) continue; break; }

        let parsed: Record<string, unknown>;
        try { parsed = JSON.parse(match[0]); }
        catch { if (attempt < 2) continue; break; }

        if (!COMP_KEYS.every(k => typeof (parsed[k] as Record<string, unknown>)?.nota === 'number')) {
          if (attempt < 2) continue;
          break;
        }

        // Recalcular total para garantir consistência
        parsed.total = COMP_KEYS.reduce((sum, k) => sum + (Number((parsed[k] as Record<string, number>).nota) || 0), 0);
        return parsed as unknown as CorrecaoResult;

      } catch (e: unknown) {
        clearTimeout(timer);
        const isAbort = e instanceof Error && e.name === 'AbortError';
        if ((e as Error).message === 'invalid_key') throw e;
        console.error('[redacao] fetch erro:', isAbort ? 'timeout' : String(e));
        if (attempt < 2) { await sleep(800); continue; }
        break;
      }
    }
  }
  return null;
}

// ── Prompt ────────────────────────────────────────────────────────────────────
function buildPrompt(theme: string, text: string): string {
  return `Você é um corretor oficial do ENEM com 10 anos de experiência. Corrija a redação abaixo com rigor real.

TEMA: "${theme}"

REDAÇÃO:
${text}

Notas por competência (múltiplos de 40: 0,40,80,120,160,200):
C1 - Norma culta: gramática, ortografia, pontuação
C2 - Tema e repertório: desenvolvimento do tema, repertório sociocultural
C3 - Argumentação: coerência, progressão, tese clara
C4 - Coesão: conectivos, articulação, repetição
C5 - Intervenção: 5 elementos (ação+agente+modo+efeito+finalidade), direitos humanos

Mencione aspectos CONCRETOS do texto. Retorne SOMENTE JSON válido (sem markdown):
{"c1":{"nota":0,"feedback":"..."},"c2":{"nota":0,"feedback":"..."},"c3":{"nota":0,"feedback":"..."},"c4":{"nota":0,"feedback":"..."},"c5":{"nota":0,"feedback":"..."},"total":0,"comentario_geral":"..."}`;
}

// ── Handler principal ─────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    if (req.method !== 'POST') return err('Method not allowed', 405);

    // 1. Guardrails de configuração
    if (!GROQ_KEY || !SVC_ROLE || !SUPABASE_URL)
      return err('Configuração do servidor incompleta. Contate o suporte.', 503);

    // 2. Validar body
    let body: { theme?: unknown; text?: unknown; userId?: unknown };
    try { body = await req.json(); }
    catch { return err('Corpo da requisição inválido.', 400); }

    const userId    = String(body.userId ?? '').trim();
    const textClean = String(body.text   ?? '').trim();
    const theme     = String(body.theme  ?? '').trim();

    if (!userId || userId.length < 30)   return err('Sessão inválida. Faça login novamente.', 401);
    if (!theme)                           return err('Tema é obrigatório.', 400);
    if (textClean.length < MIN_CHARS)    return err(`Redação muito curta (mínimo ${MIN_CHARS} caracteres).`, 400);
    if (textClean.length > MAX_CHARS)    return err(`Redação muito longa (máximo ${MAX_CHARS} caracteres).`, 400);

    // 3. Verificar usuário e plano
    const db = createClient(SUPABASE_URL, SVC_ROLE, { auth: { persistSession: false } });

    const { data: profile, error: profileErr } = await db
      .from('users')
      .select('plan, plan_expires_at')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      console.error('[redacao] buscar perfil:', profileErr.message);
      return err('Erro ao verificar perfil. Tente novamente.', 500);
    }
    if (!profile) {
      db.from('users').insert({ id: userId, name: 'Usuário', email: '', plan: 'free' }).catch(() => {});
      return err('Plano Premium necessário para corrigir redações com IA.', 403);
    }

    const premiumAtivo = profile.plan === 'premium' &&
      (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());
    if (!premiumAtivo) return err('Recurso exclusivo do plano Premium. Assine para corrigir redações com IA.', 403);

    // 4. Rate limiting diário
    const today = new Date().toISOString().slice(0, 10);
    const { count } = await db
      .from('redacao_corrections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00Z`);

    if ((count ?? 0) >= DAILY_LIMIT)
      return err(`Limite de ${DAILY_LIMIT} correções por dia atingido. Volte amanhã!`, 429);

    // 5. Chamar IA
    const safeTheme = theme.slice(0, 300).replace(/[`"]/g, "'");
    let result: CorrecaoResult | null;

    try {
      result = await callGroq(buildPrompt(safeTheme, textClean));
    } catch (e: unknown) {
      if ((e as Error).message === 'invalid_key') return err('Chave de IA inválida. Contate o suporte.', 503);
      throw e;
    }

    if (!result) {
      console.error('[redacao] falha em todos os modelos Groq.');
      return err('O serviço de correção está instável agora. Tente novamente em alguns instantes.', 503);
    }

    // 6. Registrar uso (não crítico)
    db.from('redacao_corrections')
      .insert({ user_id: userId, theme: safeTheme.slice(0, 200), score: result.total ?? null })
      .catch(() => {});

    return ok(result);

  } catch (fatal: unknown) {
    const msg = fatal instanceof Error ? fatal.message : String(fatal);
    console.error('[redacao] ERRO FATAL:', msg);
    return err(`Erro inesperado: ${msg}`, 500);
  }
});