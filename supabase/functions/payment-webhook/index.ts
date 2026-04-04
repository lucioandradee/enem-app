// @ts-nocheck
// =====================================================
// ENEM MASTER — Edge Function: payment-webhook
// Recebe webhooks de gateways de pagamento e ativa Premium
//
// Gateways suportados:
//   - Hotmart      (header: x-hotmart-hottok)
//   - Kiwify       (header: x-kiwify-signature + token no body)
//   - Mercado Pago (header: x-signature)
//   - Cakto        (header: x-cakto-token)
//
// Deploy:
//   supabase functions deploy payment-webhook --no-verify-jwt
//
// Setar segredos:
//   supabase secrets set HOTMART_TOKEN=SEU_TOKEN
//   supabase secrets set KIWIFY_TOKEN=SEU_TOKEN
//   supabase secrets set MP_WEBHOOK_SECRET=SEU_SECRET
//   supabase secrets set CAKTO_TOKEN=SEU_TOKEN
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_key
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const HOTMART_TOKEN = Deno.env.get('HOTMART_TOKEN') ?? '';
const KIWIFY_TOKEN  = Deno.env.get('KIWIFY_TOKEN')  ?? '';
const CAKTO_TOKEN   = Deno.env.get('CAKTO_TOKEN')   ?? '';

// Plano: quantos dias conceder
const PLAN_DURATION: Record<string, number> = {
    mensal: 30,
    anual:  365,
};

Deno.serve(async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    // ─── Detectar gateway e extrair dados ──────────────────────
    let buyerEmail: string | null = null;
    let durationDays = 30;
    let planAction: 'activate' | 'deactivate' = 'activate';
    let gateway = 'unknown';
    let caktoEvent = '';

    const headers = Object.fromEntries(req.headers.entries());

    // --- Hotmart ---
    if (headers['x-hotmart-hottok'] === HOTMART_TOKEN) {
        gateway = 'hotmart';
        const purchase = (body as any)?.data?.purchase;
        const buyer    = (body as any)?.data?.buyer;
        const status   = purchase?.status;
        if (!['APPROVED', 'COMPLETE'].includes(status ?? '')) {
            return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });
        }
        buyerEmail   = buyer?.email ?? null;
        const offer  = purchase?.offer?.code ?? '';
        durationDays = offer.toLowerCase().includes('anual') ? 365 : 30;
    }

    // --- Kiwify ---
    else if (headers['x-kiwify-signature'] && body?.token === KIWIFY_TOKEN) {
        gateway = 'kiwify';
        const event = (body as any)?.order_status;
        if (!['paid', 'authorized'].includes(event ?? '')) {
            return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });
        }
        buyerEmail   = (body as any)?.Customer?.email ?? null;
        const freq   = (body as any)?.Product?.description ?? '';
        durationDays = freq.toLowerCase().includes('anual') ? 365 : 30;
    }

    // --- Mercado Pago ---
    else if (headers['x-signature'] || (body as any)?.type === 'payment') {
        gateway = 'mercadopago';
        const status = (body as any)?.data?.status ?? (body as any)?.status;
        if (!['approved', 'authorized'].includes(status ?? '')) {
            return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });
        }
        buyerEmail   = (body as any)?.payer?.email ?? null;
        durationDays = (body as any)?.metadata?.plan === 'anual' ? 365 : 30;
    }

    // --- Cakto ---
    else if (headers['x-cakto-token'] === CAKTO_TOKEN && CAKTO_TOKEN !== '') {
        gateway     = 'cakto';
        caktoEvent  = ((body as any)?.event ?? '').toUpperCase();

        // ── E-mail do comprador ─────────────────────────────────
        buyerEmail = (body as any)?.data?.buyer?.email
                  ?? (body as any)?.data?.customer?.email
                  ?? null;

        // ── Duração baseada no plano ────────────────────────────
        const planName = (body as any)?.data?.purchase?.offer?.code
                      ?? (body as any)?.data?.plan?.name
                      ?? '';
        durationDays = planName.toLowerCase().includes('anual') ? 365 : 30;

        // ── Roteamento por evento ───────────────────────────────
        switch (caktoEvent) {
            // Compra única aprovada → ativar Premium
            case 'PURCHASE_APPROVED':
            case 'PURCHASE.APPROVED':
                planAction = 'activate';
                break;

            // Assinatura criada (primeiro pagamento pendente) → ativar Premium
            case 'SUBSCRIPTION_CREATED':
            case 'SUBSCRIPTION.CREATED':
                planAction = 'activate';
                break;

            // Assinatura aprovada (primeiro pagamento confirmado) → ativar Premium
            case 'SUBSCRIPTION_APPROVED':
            case 'SUBSCRIPTION.APPROVED':
                planAction = 'activate';
                break;

            // Renovação cobrada com sucesso → renovar Premium
            case 'SUBSCRIPTION_CHARGED':
            case 'SUBSCRIPTION.CHARGED':
            case 'SUBSCRIPTION_RENEWAL_APPROVED':
            case 'SUBSCRIPTION.RENEWAL_APPROVED':
                planAction = 'activate';
                break;

            // Assinatura recusada (primeiro pagamento falhou) → rebaixar para free
            case 'SUBSCRIPTION_REJECTED':
            case 'SUBSCRIPTION.REJECTED':
            case 'SUBSCRIPTION_DECLINED':
            case 'SUBSCRIPTION.DECLINED':
                planAction = 'deactivate';
                break;

            // Renovação de assinatura recusada → rebaixar para free
            case 'SUBSCRIPTION_RENEWAL_FAILED':
            case 'SUBSCRIPTION.RENEWAL_FAILED':
            case 'SUBSCRIPTION_RENEWAL_DECLINED':
            case 'SUBSCRIPTION.RENEWAL_DECLINED':
                planAction = 'deactivate';
                break;

            default:
                console.log(`ℹ️ Cakto evento ignorado: ${caktoEvent}`);
                return new Response(JSON.stringify({ ok: true, skipped: true, event: caktoEvent }), { status: 200 });
        }
    }

    // --- Gateway não reconhecido ---
    else {
        console.warn('⚠️ Gateway não reconhecido. Headers:', JSON.stringify(headers));
        return new Response(JSON.stringify({ ok: false, error: 'gateway_not_recognized' }), { status: 400 });
    }

    if (!buyerEmail) {
        console.error('❌ E-mail do comprador não encontrado no payload', JSON.stringify(body));
        return new Response(JSON.stringify({ ok: false, error: 'buyer_email_missing' }), { status: 422 });
    }

    // ─── Atualizar plano no Supabase ───────────────────────────
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    let updatePayload: Record<string, unknown>;

    if (planAction === 'activate') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);
        updatePayload = {
            plan: 'premium',
            plan_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
        };
    } else {
        // deactivate: remove acesso Premium imediatamente
        updatePayload = {
            plan: 'free',
            plan_expires_at: null,
            updated_at: new Date().toISOString(),
        };
    }

    const { error } = await admin
        .from('users')
        .update(updatePayload)
        .eq('email', buyerEmail);

    if (error) {
        console.error('❌ Erro ao atualizar plano:', error.message, '| Email:', buyerEmail);
        return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
    }

    if (planAction === 'activate') {
        console.log(`✅ Premium ativado | ${buyerEmail} | ${durationDays}d | gateway: ${gateway} | evento: ${caktoEvent || 'n/a'}`);
    } else {
        console.log(`🔒 Premium removido | ${buyerEmail} | gateway: ${gateway} | evento: ${caktoEvent}`);
    }

    return new Response(JSON.stringify({ ok: true, email: buyerEmail, planAction, durationDays: planAction === 'activate' ? durationDays : 0, gateway }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
});
