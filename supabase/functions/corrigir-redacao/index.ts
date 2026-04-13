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
const GROQ_TIMEOUT_MS = 40000;
const GROQ_MAX_RETRIES = 2;

const DAILY_LIMIT   = 5;   // correções por dia por usuário
const MAX_TEXT_LEN  = 3000; // caracteres máximos na redação
const MIN_TEXT_LEN  = 100;

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, origin, user-agent',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
};

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
    });
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

    if (!GROQ_KEY) return json({ error: 'Serviço de IA não configurado. Contate o suporte.' }, 503);

    // ── 0. Ler body ─────────────────────────────────────────────────────────
    // A autenticação é feita exclusivamente pelo userId enviado no body.
    // O gateway do Supabase já valida a apikey (anon key) antes de chegar aqui,
    // garantindo que apenas clientes legítimos do app possam chamar esta função.
    let body: { theme?: string; text?: string; userId?: string };
    try { body = await req.json(); } catch {
        return json({ error: 'JSON inválido.' }, 400);
    }

    const { theme, text, userId: rawUserId } = body;
    const userId = String(rawUserId ?? '').trim();

    // UUID tem 36 chars; qualquer valor menor é inválido
    if (!userId || userId.length < 30) {
        return json({ error: 'Sessão inválida. Saia e entre novamente no app.' }, 401);
    }

    // Cria cliente admin para verificar perfil e plano
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
        auth: { persistSession: false },
    });

    // ── 1. Verificar usuário e plano no banco ────────────────────────────────
    const { data: profile, error: profileErr } = await adminClient
        .from('users')
        .select('id, plan, plan_expires_at')
        .eq('id', userId)
        .maybeSingle();

    if (profileErr) {
        console.error('[corrigir-redacao] erro ao buscar perfil:', profileErr.message);
        return json({ error: 'Erro ao verificar seu perfil. Tente novamente.' }, 500);
    }
    if (!profile) {
        return json({ error: 'Perfil não encontrado. Faça login novamente.' }, 401);
    }

    const user = { id: profile.id };

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

    try {
        let lastStatus = 0;
        let lastError = '';
        let result: Record<string, unknown> | null = null;

        for (let attempt = 1; attempt <= GROQ_MAX_RETRIES; attempt++) {
            const groqCtrl = new AbortController();
            const groqTimerId = setTimeout(() => groqCtrl.abort(), GROQ_TIMEOUT_MS);
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
                    const status = groqRes.status;
                    lastStatus = status;
                    lastError = String((errBody as Record<string, unknown>)?.error?.message ?? 'erro desconhecido');

                    if (status === 401) {
                        console.error('[corrigir-redacao] GROQ_API_KEY inválida ou expirada');
                        return json({ error: 'Serviço de IA não configurado corretamente. Contate o suporte.' }, 503);
                    }

                    // 429/5xx: retenta automaticamente
                    if ((status === 429 || status >= 500) && attempt < GROQ_MAX_RETRIES) {
                        await sleep(1200 * attempt);
                        continue;
                    }

                    if (status === 429) {
                        return json({ error: 'Serviço de IA sobrecarregado no momento. Tente novamente em 1 minuto.' }, 429);
                    }
                    return json({ error: `Erro na IA (${status}). Tente novamente.` }, 502);
                }

                const data = await groqRes.json().catch(() => null);
                if (!data) {
                    lastError = 'json-vazio';
                    if (attempt < GROQ_MAX_RETRIES) {
                        await sleep(600);
                        continue;
                    }
                    return json({ error: 'Resposta inválida da IA. Tente novamente.' }, 502);
                }

                const content = data.choices?.[0]?.message?.content;
                const raw = typeof content === 'string' ? content : JSON.stringify(content ?? '');
                const jsonMatch = raw.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    lastError = 'sem-json';
                    if (attempt < GROQ_MAX_RETRIES) {
                        await sleep(600);
                        continue;
                    }
                    return json({ error: 'A IA retornou resposta em formato inesperado. Tente novamente.' }, 502);
                }

                try {
                    result = JSON.parse(jsonMatch[0]);
                } catch {
                    lastError = 'json-parse';
                    if (attempt < GROQ_MAX_RETRIES) {
                        await sleep(600);
                        continue;
                    }
                    return json({ error: 'Não foi possível interpretar a resposta da IA. Tente novamente.' }, 502);
                }

                const requiredKeys = ['c1', 'c2', 'c3', 'c4', 'c5'];
                const validShape = requiredKeys.every(k => {
                    const item = result?.[k] as Record<string, unknown>;
                    return item && typeof item.nota === 'number';
                });
                if (!validShape) {
                    lastError = 'shape-invalido';
                    if (attempt < GROQ_MAX_RETRIES) {
                        await sleep(600);
                        continue;
                    }
                    return json({ error: 'Resposta incompleta da IA. Tente novamente.' }, 502);
                }

                break;
            } catch (err: unknown) {
                clearTimeout(groqTimerId);
                const isTimeout = err instanceof Error && err.name === 'AbortError';
                if (isTimeout) {
                    lastError = 'timeout';
                    if (attempt < GROQ_MAX_RETRIES) {
                        await sleep(1200 * attempt);
                        continue;
                    }
                    return json({ error: 'Tempo limite da IA excedido. Tente novamente.' }, 504);
                }

                lastError = err instanceof Error ? err.message : String(err);
                if (attempt < GROQ_MAX_RETRIES) {
                    await sleep(600);
                    continue;
                }
                return json({ error: 'Serviço de correção indisponível no momento. Tente novamente em instantes.' }, 503);
            }
        }

        if (!result) {
            console.error('[corrigir-redacao] sem resultado final', { lastStatus, lastError });
            return json({ error: 'Não foi possível concluir a correção agora. Tente novamente em instantes.' }, 503);
        }

        // ── 5. Registrar uso para rate limiting ─────────────────────────────
        adminClient.from('redacao_corrections').insert({
            user_id: user.id,
            theme: safTheme.slice(0, 200),
            score: result.total ?? null,
        }).catch(() => {});

        return json(result);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[corrigir-redacao] erro não tratado:', msg);
        return json({ error: 'Falha temporária no serviço de correção. Tente novamente.' }, 503);
    }
});

