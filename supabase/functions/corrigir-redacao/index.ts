// @ts-nocheck
// =====================================================
// ENEM MASTER — Edge Function: corrigir-redacao
// Corrige redações ENEM usando Gemini API server-side
//
// ── DEPLOY VIA DASHBOARD (sem CLI) ───────────────────
// 1. Acesse https://supabase.com/dashboard/project/nkuiwdolkluetsadauwb
// 2. Clique em "Edge Functions" (menu lateral)
// 3. Clique em "Deploy a new function"
// 4. Nome da função: corrigir-redacao
// 5. Cole TODO o conteúdo deste arquivo e clique em Deploy
// 6. Vá em "Project Settings" → "Secrets" → "Add new secret"
//    Nome: GEMINI_KEY   Valor: AIzaSy... (sua chave Gemini)
//
// Pronto! Todos os usuários usarão essa chave central.
// ─────────────────────────────────────────────────────

const GROQ_KEY = Deno.env.get('GROQ_KEY') ?? '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    // Preflight CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS });
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: CORS });
    }

    if (!GROQ_KEY) {
        return new Response(
            JSON.stringify({ error: 'Serviço de IA não configurado. Contate o suporte.' }),
            { status: 503, headers: { ...CORS, 'Content-Type': 'application/json' } }
        );
    }

    let body: { theme?: string; text?: string };
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
        });
    }

    const { theme, text } = body;

    if (!theme || !text || text.trim().length < 100) {
        return new Response(JSON.stringify({ error: 'Tema e texto são obrigatórios (mínimo 100 caracteres).' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
        });
    }

    const prompt = `Você é um avaliador oficial de redações do ENEM. Corrija a redação abaixo usando as 5 competências do ENEM. Para cada competência, atribua uma nota de 0 a 200 (somente múltiplos de 40: 0, 40, 80, 120, 160 ou 200) e um feedback específico de 2-3 linhas.

TEMA: "${theme}"

REDAÇÃO:
${text}

Retorne APENAS um JSON válido, sem markdown, neste formato exato:
{"c1":{"nota":120,"feedback":"..."},"c2":{"nota":160,"feedback":"..."},"c3":{"nota":120,"feedback":"..."},"c4":{"nota":120,"feedback":"..."},"c5":{"nota":80,"feedback":"..."},"total":600,"comentario_geral":"Parágrafo de comentário geral sobre a redação."}`;

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
                temperature: 0.3,
                max_tokens: 1500,
            }),
        });

        if (!groqRes.ok) {
            const err = await groqRes.json().catch(() => ({}));
            const status = groqRes.status;
            const msg = status === 429
                ? 'Limite de requisições da IA atingido. Tente em alguns instantes.'
                : `Erro na IA (${status}): ${err?.error?.message ?? 'desconhecido'}`;
            return new Response(JSON.stringify({ error: msg }), {
                status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
            });
        }

        const data = await groqRes.json();
        const raw: string = data.choices?.[0]?.message?.content ?? '';

        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return new Response(JSON.stringify({ error: 'Resposta da IA em formato inesperado.' }), {
                status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
            });
        }

        const result = JSON.parse(jsonMatch[0]);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...CORS, 'Content-Type': 'application/json' },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: `Erro interno: ${err.message}` }), {
            status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
        });
    }
});
