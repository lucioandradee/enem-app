// @ts-nocheck
// =====================================================
// ENEM MASTER — Edge Function: payment-webhook v3
// =====================================================
// Gateways suportados:
//   - Cakto        (body.secret)                  ← autenticação no body
//   - Hotmart      (header: x-hotmart-hottok)
//   - Kiwify       (header: x-kiwify-signature + body.token)
//   - Mercado Pago (header: x-signature)
//
// Funcionalidades:
//   • Idempotência via tabela webhook_events (evita duplo-processamento)
//   • Renovação empilhada (preserva dias restantes ao renovar)
//   • Criação automática de conta para novos compradores (invite)
//   • Logs detalhados para diagnóstico no Supabase Dashboard
//
// Deploy:
//   supabase functions deploy payment-webhook --no-verify-jwt
//
// Secrets necessários:
//   supabase secrets set CAKTO_TOKEN=SEU_TOKEN
//   supabase secrets set HOTMART_TOKEN=SEU_TOKEN
//   supabase secrets set KIWIFY_TOKEN=SEU_TOKEN
//   supabase secrets set APP_URL=https://enemmaster.com.br
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Variáveis de ambiente ─────────────────────────────────────────────────────
const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const HOTMART_TOKEN = Deno.env.get('HOTMART_TOKEN') ?? '';
const KIWIFY_TOKEN  = Deno.env.get('KIWIFY_TOKEN')  ?? '';
const CAKTO_TOKEN   = Deno.env.get('CAKTO_TOKEN')   ?? '';
const APP_URL       = Deno.env.get('APP_URL')        ?? 'https://enemmaster.com.br';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Action = 'activate' | 'deactivate' | 'skip';

interface ParsedEvent {
    gateway:       string;
    action:        Action;
    buyerEmail:    string | null;
    buyerName:     string;
    durationDays:  number;
    transactionId: string | null;
    eventType:     string;
}

// ── Helper: cast seguro para string ──────────────────────────────────────────
const s = (v: unknown): string => String(v ?? '').trim();

// ── Parser: Cakto ─────────────────────────────────────────────────────────────
// A Cakto envia o token no campo body.secret (não em header)
function parseCakto(body: any): ParsedEvent | null {
    if (body?.secret === undefined) return null; // não é Cakto

    if (!CAKTO_TOKEN) throw new Error('CAKTO_TOKEN_NOT_CONFIGURED');
    if (body.secret !== CAKTO_TOKEN) throw new Error('INVALID_TOKEN');

    // Normaliza: MAIÚSCULO + pontos → underscores ('purchase.approved' → 'PURCHASE_APPROVED')
    const eventType = s(body?.event ?? body?.type).toUpperCase().replace(/\./g, '_');

    const ACTIVATE_EVENTS = new Set([
        'PURCHASE_APPROVED',            'ORDER_APPROVED',
        'ORDER_PAID',                   'SALE_APPROVED',
        'SUBSCRIPTION_CREATED',         'SUBSCRIPTION_APPROVED',
        'SUBSCRIPTION_ACTIVE',          'SUBSCRIPTION_ACTIVATED',
        'SUBSCRIPTION_CHARGED',         'SUBSCRIPTION_RENEWED',
        'SUBSCRIPTION_RENEWAL_APPROVED','SUBSCRIPTION_RENEWAL_SUCCESS',
        'RECURRENCE_CHARGED',           'RECURRENCE_APPROVED',
    ]);

    const DEACTIVATE_EVENTS = new Set([
        'SUBSCRIPTION_CANCELLED',        'SUBSCRIPTION_CANCELED',
        'SUBSCRIPTION_REJECTED',         'SUBSCRIPTION_DECLINED',
        'SUBSCRIPTION_EXPIRED',          'SUBSCRIPTION_CHARGEBACK',
        'PURCHASE_REFUNDED',             'ORDER_REFUNDED',
        'SUBSCRIPTION_RENEWAL_FAILED',   'SUBSCRIPTION_RENEWAL_DECLINED',
        'SUBSCRIPTION_RENEWAL_REJECTED', 'RECURRENCE_FAILED',
        'RECURRENCE_DECLINED',
    ]);

    let action: Action = 'skip';
    if (ACTIVATE_EVENTS.has(eventType))   action = 'activate';
    if (DEACTIVATE_EVENTS.has(eventType)) action = 'deactivate';

    const d          = body?.data ?? {};
    const buyerEmail = d?.buyer?.email ?? d?.customer?.email ?? d?.email
                    ?? body?.buyer?.email ?? body?.customer?.email ?? null;
    const buyerName  = s(d?.buyer?.name  ?? d?.customer?.name ?? d?.buyer?.full_name
                    ??  body?.buyer?.name ?? body?.customer?.name);
    const planName     = s(d?.purchase?.offer?.code ?? d?.plan?.name ?? body?.plan?.name);
    const durationDays = planName.toLowerCase().includes('anual') ? 365 : 30;
    const transactionId = s(d?.purchase?.id ?? d?.id ?? d?.order?.id) || null;

    return { gateway: 'cakto', action, buyerEmail, buyerName, durationDays, transactionId, eventType };
}

// ── Parser: Hotmart ───────────────────────────────────────────────────────────
function parseHotmart(headers: Record<string, string>, body: any): ParsedEvent | null {
    if (!headers['x-hotmart-hottok'] || !HOTMART_TOKEN) return null;
    if (headers['x-hotmart-hottok'] !== HOTMART_TOKEN) throw new Error('INVALID_TOKEN');

    const status = s(body?.data?.purchase?.status).toUpperCase();
    let action: Action = 'skip';
    if (['APPROVED', 'COMPLETE'].includes(status))                action = 'activate';
    if (['REFUNDED', 'CANCELLED', 'CHARGEBACK'].includes(status)) action = 'deactivate';

    const offer        = s(body?.data?.purchase?.offer?.code).toLowerCase();
    const durationDays = offer.includes('anual') ? 365 : 30;

    return {
        gateway: 'hotmart', action,
        buyerEmail:    body?.data?.buyer?.email ?? null,
        buyerName:     s(body?.data?.buyer?.name),
        durationDays,
        transactionId: s(body?.data?.purchase?.transaction) || null,
        eventType:     status,
    };
}

// ── Parser: Kiwify ────────────────────────────────────────────────────────────
function parseKiwify(headers: Record<string, string>, body: any): ParsedEvent | null {
    if (!headers['x-kiwify-signature']) return null;
    if (!KIWIFY_TOKEN || body?.token !== KIWIFY_TOKEN) throw new Error('INVALID_TOKEN');

    const event        = s(body?.order_status).toLowerCase();
    let action: Action = 'skip';
    if (['paid', 'authorized'].includes(event))                   action = 'activate';
    if (['refunded', 'cancelled', 'chargedback'].includes(event)) action = 'deactivate';

    const freq         = s(body?.Product?.description).toLowerCase();
    const durationDays = freq.includes('anual') ? 365 : 30;

    return {
        gateway: 'kiwify', action,
        buyerEmail:    body?.Customer?.email ?? null,
        buyerName:     s(body?.Customer?.full_name ?? body?.Customer?.name),
        durationDays,
        transactionId: s(body?.order_id) || null,
        eventType:     event,
    };
}

// ── Parser: Mercado Pago ──────────────────────────────────────────────────────
// Usa 'x-signature' como identificador — não faz match por body.type para evitar
// falsos positivos com outros gateways
function parseMercadoPago(headers: Record<string, string>, body: any): ParsedEvent | null {
    if (!headers['x-signature'] && !headers['x-request-id']) return null;

    const status       = s(body?.data?.status ?? body?.status).toLowerCase();
    let action: Action = 'skip';
    if (['approved', 'authorized'].includes(status))               action = 'activate';
    if (['refunded', 'cancelled', 'charged_back'].includes(status)) action = 'deactivate';

    const durationDays = body?.metadata?.plan === 'anual' ? 365 : 30;
    const name = [s(body?.payer?.first_name), s(body?.payer?.last_name)].filter(Boolean).join(' ');

    return {
        gateway: 'mercadopago', action,
        buyerEmail:    body?.payer?.email ?? null,
        buyerName:     name,
        durationDays,
        transactionId: s(body?.data?.id ?? body?.id) || null,
        eventType:     status,
    };
}

// ── Handler principal ─────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
    // Health check — gateways fazem GET ao cadastrar a URL
    if (req.method === 'GET') {
        return new Response(JSON.stringify({ ok: true, service: 'payment-webhook', version: '3' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    // ── Parse do body ─────────────────────────────────────────────
    let body: any;
    try {
        body = await req.json();
    } catch {
        console.error('❌ Body inválido: não é JSON');
        return new Response('Invalid JSON', { status: 400 });
    }

    const headers = Object.fromEntries(req.headers.entries());

    console.log('📥 Webhook recebido', JSON.stringify({
        has_cakto_secret: body?.secret   ? '[sim]' : '[não]',
        has_hotmart:  headers['x-hotmart-hottok']   ? '[sim]' : '[não]',
        has_kiwify:   headers['x-kiwify-signature'] ? '[sim]' : '[não]',
        has_mp:       headers['x-signature']        ? '[sim]' : '[não]',
        event:        s(body?.event ?? body?.type ?? body?.data?.purchase?.status) || '[?]',
        root_keys:    Object.keys(body).join(','),
    }));

    // ── Detectar gateway ──────────────────────────────────────────
    // Cakto verificado PRIMEIRO (autenticação no body, não em header)
    let parsed: ParsedEvent | null = null;
    let authError: string | null   = null;

    try {
        parsed = parseCakto(body)
              ?? parseHotmart(headers, body)
              ?? parseKiwify(headers, body)
              ?? parseMercadoPago(headers, body);
    } catch (e: any) {
        authError = e.message;
    }

    if (authError === 'CAKTO_TOKEN_NOT_CONFIGURED') {
        console.error('❌ CAKTO_TOKEN não está configurado. Execute: supabase secrets set CAKTO_TOKEN=SEU_TOKEN');
        return new Response(JSON.stringify({ ok: false, error: 'cakto_token_not_configured' }), { status: 500 });
    }
    if (authError === 'INVALID_TOKEN') {
        console.error('❌ Token de autenticação inválido recebido');
        return new Response(JSON.stringify({ ok: false, error: 'invalid_token' }), { status: 401 });
    }

    if (!parsed) {
        console.warn('⚠️ Nenhum gateway reconhecido. Root keys:', Object.keys(body).join(', '));
        // Retorna 200 para não gerar retentativas infinitas do gateway
        return new Response(JSON.stringify({ ok: false, error: 'gateway_not_recognized' }), { status: 200 });
    }

    const { gateway, action, buyerEmail, buyerName, durationDays, transactionId, eventType } = parsed;

    console.log(`📌 ${gateway.toUpperCase()} | evento: ${eventType} | ação: ${action} | email: ${buyerEmail ?? '[sem email]'} | tx: ${transactionId ?? 'n/a'} | dias: ${durationDays}`);

    if (action === 'skip') {
        console.log(`⏭️ Evento não mapeado, ignorando: "${eventType}"`);
        return new Response(JSON.stringify({ ok: true, skipped: true, event: eventType }), { status: 200 });
    }

    if (!buyerEmail) {
        console.error('❌ E-mail do comprador ausente no payload:', JSON.stringify(body).slice(0, 500));
        return new Response(JSON.stringify({ ok: false, error: 'buyer_email_missing' }), { status: 422 });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // ── Idempotência: evita processar o mesmo pagamento duas vezes ─
    if (transactionId) {
        const { data: alreadyDone } = await admin
            .from('webhook_events')
            .select('id')
            .eq('gateway', gateway)
            .eq('transaction_id', transactionId)
            .eq('result', 'success')
            .maybeSingle();

        if (alreadyDone) {
            console.log(`⏭️ Pagamento já processado (idempotente): ${gateway}/${transactionId}`);
            return new Response(JSON.stringify({ ok: true, already_processed: true }), { status: 200 });
        }
    }

    // ── Registrar no audit log (resultado = 'pending' até o final) ─
    const { data: logRow } = await admin
        .from('webhook_events')
        .insert({
            gateway,
            event_type:     eventType,
            transaction_id: transactionId,
            buyer_email:    buyerEmail,
            plan_action:    action,
            duration_days:  durationDays,
            payload:        body,
            result:         'pending',
        })
        .select('id')
        .single();

    const logId: number | null = logRow?.id ?? null;

    const finalizeLog = (result: 'success' | 'error', error_msg?: string) =>
        logId
            ? admin.from('webhook_events').update({ result, error_msg: error_msg ?? null }).eq('id', logId)
            : Promise.resolve({ error: null });

    try {
        // ── Desativar premium ─────────────────────────────────────
        if (action === 'deactivate') {
            const { error } = await admin.rpc('deactivate_premium_by_email', { p_email: buyerEmail });
            if (error) throw error;
            await finalizeLog('success');
            console.log(`🔒 Premium removido | ${buyerEmail} | ${gateway}`);
            return new Response(
                JSON.stringify({ ok: true, action: 'deactivated', email: buyerEmail, gateway }),
                { status: 200, headers: { 'Content-Type': 'application/json' } },
            );
        }

        // ── Ativar / renovar premium ──────────────────────────────
        const displayName = buyerName || buyerEmail.split('@')[0];

        // Verifica se o usuário já tem perfil (para decidir se envia invite)
        const { data: existingProfile } = await admin
            .from('users')
            .select('id')
            .eq('email', buyerEmail)
            .maybeSingle();

        if (!existingProfile) {
            // Novo comprador: enviar convite cria o auth user e dispara o trigger
            // que cria o perfil automaticamente (handle_new_user)
            const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(buyerEmail, {
                redirectTo: `${APP_URL}/app?ref=payment-success`,
                data: { full_name: displayName },
            });
            if (inviteErr) {
                // Usuário já existe no auth mas sem perfil — o RPC abaixo vai corrigir
                console.warn(`⚠️ inviteUserByEmail: ${inviteErr.message} — continuando com RPC`);
            } else {
                console.log(`📧 Convite enviado → ${buyerEmail}`);
            }
        }

        // Ativa/renova via RPC (empilha dias, lida com todos os cenários de perfil)
        const { error: rpcErr } = await admin.rpc('activate_premium_by_email', {
            p_email:         buyerEmail,
            p_name:          displayName,
            p_duration_days: durationDays,
        });
        if (rpcErr) throw rpcErr;

        await finalizeLog('success');
        console.log(`✅ Premium ativado | ${buyerEmail} | +${durationDays}d | ${gateway} | ${eventType}`);

        return new Response(
            JSON.stringify({ ok: true, action: 'activated', email: buyerEmail, durationDays, gateway }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        );

    } catch (err: any) {
        await finalizeLog('error', err.message);
        console.error(`❌ Falha ao processar | ${buyerEmail} | ${gateway} | ${err.message}`);
        return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
    }
});
