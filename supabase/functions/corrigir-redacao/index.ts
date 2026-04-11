// @ts-nocheck
// =====================================================
// ENEM MASTER — Edge Function: corrigir-redacao
// Corrige redações ENEM usando Groq API server-side
//
// ── DEPLOY VIA DASHBOARD (sem CLI) ───────────────────
// 1. Acesse https://supabase.com/dashboard/project/nkuiwdolkluetsadauwb
// 2. Clique em "Edge Functions" (menu lateral)
// 3. Clique em "Deploy a new function"
// 4. Nome da função: corrigir-redacao
// 5. Cole TODO o conteúdo deste arquivo e clique em Deploy
// 6. Vá em "Project Settings" → "Secrets" → "Add new secret"
//    Nome: GROQ_API_KEY   Valor: gsk_... (sua chave Groq)
//
// Segredos obrigatórios:
//   GROQ_KEY               — chave da API Groq
//   SUPABASE_URL           — URL do projeto Supabase
//   SUPABASE_SERVICE_ROLE_KEY — service_role key (para verificar plano)
// ─────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GROQ_KEY      = Deno.env.get('GROQ_API_KEY') ?? Deno.env.get('GROQ_KEY') ?? '';
const GROQ_URL      = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL    = 'llama-3.3-70b-versatile';
const SUPABASE_URL  = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const DAILY_LIMIT   = 5;   // correções por dia por usuário
const MAX_TEXT_LEN  = 3000; // caracteres máximos na redação
const MIN_TEXT_LEN  = 100;

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
    });
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

    if (!GROQ_KEY) return json({ error: 'Serviço de IA não configurado. Contate o suporte.' }, 503);

    // ── 1. Verificar autenticação (JWT do usuário) ──────────────────────────
    const authHeader = req.headers.get('authorization') ?? '';
    const userJwt    = authHeader.replace(/^Bearer\s+/i, '');

    if (!userJwt || userJwt.length < 20) {
        return json({ error: 'Autenticação necessária.' }, 401);
    }

    // Cria cliente com service_role para verificar o plano do usuário
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
        auth: { persistSession: false },
    });

    // Cria cliente autenticado como o usuário para obter o ID
    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${userJwt}` } },
    });

    let user: { id: string } | null = null;
    try {
        const { data: { user: u }, error: authErr } = await userClient.auth.getUser(userJwt);
        if (authErr || !u) return json({ error: 'Token inválido ou sessão expirada.' }, 401);
        user = u;
    } catch {
        return json({ error: 'Erro ao verificar autenticação. Tente novamente.' }, 500);
    }

    // ── 2. Verificar plano premium no banco ─────────────────────────────────
    const { data: profile, error: profileErr } = await adminClient
        .from('users')
        .select('plan, plan_expires_at')
        .eq('id', user.id)
        .single();

    if (profileErr) return json({ error: 'Erro ao verificar seu perfil. Tente novamente.' }, 500);
    if (!profile)   return json({ error: 'Perfil não encontrado. Contate o suporte.' }, 404);

    const isPremium = profile.plan === 'premium' &&
        (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

    if (!isPremium) {
        return json({ error: 'Recurso exclusivo do plano Premium. Assine para corrigir redações com IA.' }, 403);
    }

    // ── 3. Rate limiting: máx. DAILY_LIMIT correções por dia ────────────────
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { count: todayCount } = await adminClient
        .from('redacao_corrections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00Z`);

    if ((todayCount ?? 0) >= DAILY_LIMIT) {
        return json({ error: `Limite diário de ${DAILY_LIMIT} correções atingido. Volte amanhã!` }, 429);
    }

    // ── 4. Validar corpo da requisição ──────────────────────────────────────
    let body: { theme?: string; text?: string };
    try { body = await req.json(); } catch {
        return json({ error: 'JSON inválido.' }, 400);
    }

    const { theme, text } = body;
    const textTrimmed = (text ?? '').trim();

    if (!theme || textTrimmed.length < MIN_TEXT_LEN) {
        return json({ error: `Tema e texto são obrigatórios (mínimo ${MIN_TEXT_LEN} caracteres).` }, 400);
    }
    if (textTrimmed.length > MAX_TEXT_LEN) {
        return json({ error: `Texto excede o limite de ${MAX_TEXT_LEN} caracteres.` }, 400);
    }

    // Sanitiza tema (evita injeção no prompt)
    const safTheme = String(theme).slice(0, 300).replace(/[`"]/g, "'");

    const prompt = `Você é um corretor oficial credenciado do ENEM com 10 anos de experiência. Leia ATENTAMENTE a redação abaixo e corrija com rigor real — as notas devem refletir o texto específico enviado.

TEMA: "${safTheme}"

REDAÇÃO DO ALUNO:
${textTrimmed}

INSTRUÇÕES por competência (notas em múltiplos de 40: 0, 40, 80, 120, 160 ou 200):
- C1 (Norma culta): identifique erros gramaticais, ortográficos ou de pontuação que aparecem no texto. Se houver erros graves ou frequentes, limite a nota a no máximo 120.
- C2 (Repertório e tema): o aluno fugiu do tema, tangenciou ou desenvolveu bem? Comente a qualidade e pertinência do repertório sociocultural usado.
- C3 (Argumentação): os argumentos são coerentes e progressivos? A tese está clara? Há contradições ou argumentos superficiais?
- C4 (Coesão): identifique os conectivos usados. O texto tem boa articulação entre parágrafos? Há repetições excessivas de palavras?
- C5 (Proposta de intervenção): a proposta contém os 5 elementos obrigatórios (ação + agente + modo/instrumento + efeito esperado + finalidade)? Respeita os direitos humanos?

Seja HONESTO e RIGOROSO. Redações diferentes devem receber notas diferentes — nunca repita automaticamente os mesmos valores. Mencione aspectos concretos do texto fornecido nos feedbacks.

Retorne APENAS JSON válido sem markdown:
{"c1":{"nota":NUMERO,"feedback":"feedback específico sobre esta redação"},"c2":{"nota":NUMERO,"feedback":"..."},"c3":{"nota":NUMERO,"feedback":"..."},"c4":{"nota":NUMERO,"feedback":"..."},"c5":{"nota":NUMERO,"feedback":"..."},"total":SOMA_DAS_5_NOTAS,"comentario_geral":"Análise geral desta redação específica, citando pontos fortes e fracos concretos encontrados no texto."}`;

    const groqCtrl    = new AbortController();
    const groqTimerId = setTimeout(() => groqCtrl.abort(), 25000);
    try {
        const groqRes = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.6,
                max_tokens: 2000,
            }),
            signal: groqCtrl.signal,
        });
        clearTimeout(groqTimerId);

        if (!groqRes.ok) {
            const errBody = await groqRes.json().catch(() => ({}));
            const status  = groqRes.status;
            if (status === 401) {
                console.error('[corrigir-redacao] GROQ_API_KEY inválida ou expirada');
                return json({ error: 'Serviço de IA não configurado corretamente. Contate o suporte.' }, 503);
            }
            const msg = status === 429
                ? 'Serviço de IA sobrecarregado no momento. Tente novamente em 1 minuto.'
                : `Erro na IA (${status}): ${(errBody as Record<string,unknown>)?.error?.message ?? 'desconhecido'}`;
            return json({ error: msg }, 502);
        }

        const data = await groqRes.json().catch(() => null);
        if (!data) return json({ error: 'Resposta inválida da IA. Tente novamente.' }, 502);

        const raw: string = (data.choices?.[0]?.message?.content ?? '') as string;
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return json({ error: 'A IA retornou resposta em formato inesperado. Tente novamente.' }, 502);

        let result: Record<string, unknown>;
        try {
            result = JSON.parse(jsonMatch[0]);
        } catch {
            return json({ error: 'Não foi possível interpretar a resposta da IA. Tente novamente.' }, 502);
        }

        // Valida shape mínima esperada
        const requiredKeys = ['c1', 'c2', 'c3', 'c4', 'c5'];
        const validShape = requiredKeys.every(k => {
            const item = result[k] as Record<string, unknown>;
            return item && typeof item.nota === 'number';
        });
        if (!validShape) return json({ error: 'Resposta incompleta da IA. Tente novamente.' }, 502);

        // ── 5. Registrar uso para rate limiting ─────────────────────────────
        adminClient.from('redacao_corrections').insert({
            user_id: user.id,
            theme:   safTheme.slice(0, 200),
            score:   result.total ?? null,
        }).catch(() => {});   // falha silêncio — não bloqueia a resposta

        return json(result);

    } catch (err: unknown) {
        clearTimeout(groqTimerId);
        const isTimeout = err instanceof Error && err.name === 'AbortError';
        if (isTimeout) return json({ error: 'Tempo limite da IA excedido. Tente novamente.' }, 504);
        const msg = err instanceof Error ? err.message : String(err);
        return json({ error: `Erro interno: ${msg}` }, 500);
    }
});

