/* =====================================================
   ENEM MASTER — premium.js
   Checkout (Cakto), Polling, Verificação de Plano
   Depende de: state, saveState, _syncPlanUI,
               navigate, isPremium, planHas,
               loadUserPlan, redeemActivationCode,
               getCurrentUser, supabase
   ===================================================== */

'use strict';

// ── Configuração Cakto ────────────────────────────────────────────────────────
let _checkoutPlan   = 'mensal';
let _checkoutMethod = 'pix';

const CAKTO_CHECKOUT_URLS = {
    mensal: 'https://pay.cakto.com.br/o7mc37q_835667',
    anual:  'https://pay.cakto.com.br/nuf3enq',
};

// ── Banner de confirmação pós-pagamento (retorno do gateway) ──────────────────
function _showPaymentSuccessBanner() {
    // Remover banner anterior se existir
    document.getElementById('_ps-banner')?.remove();

    let pendingEmail = '';
    try { pendingEmail = sessionStorage.getItem('_pendingEmail') || ''; } catch { /* noop */ }

    const banner = document.createElement('div');
    banner.id = '_ps-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.style.cssText = [
        'position:fixed', 'bottom:80px', 'left:12px', 'right:12px', 'z-index:9990',
        'background:linear-gradient(135deg,#022a1e,#022040)',
        'border:1.5px solid rgba(0,180,166,.45)',
        'border-radius:14px', 'padding:14px 16px',
        'display:flex', 'align-items:flex-start', 'gap:12px',
        'box-shadow:0 8px 32px rgba(0,0,0,.6)',
        'animation:_psbIn .35s cubic-bezier(.34,1.56,.64,1) both',
    ].join(';');

    banner.innerHTML = `
        <span style="font-size:26px;flex-shrink:0">🎉</span>
        <div style="flex:1">
            <p style="font-size:13px;font-weight:700;color:#00e5c9;margin:0 0 3px">Pagamento recebido!</p>
            <p style="font-size:12px;color:rgba(255,255,255,.7);margin:0;line-height:1.5">
                ${pendingEmail
                    ? `Sua conta Premium está sendo ativada para <strong style="color:#fff">${pendingEmail}</strong>.`
                    : 'Sua conta Premium está sendo ativada.'
                }
                Faça login ou <strong style="color:#00e5c9">verifique seu e-mail</strong> para acessar.
            </p>
        </div>
        <button onclick="this.parentElement.remove()" aria-label="Fechar"
            style="background:none;border:none;color:rgba(255,255,255,.5);font-size:18px;cursor:pointer;padding:0;flex-shrink:0;line-height:1">✕</button>
    `;

    // Adicionar keyframe de animação se ainda não existir
    if (!document.getElementById('_psbStyle')) {
        const s = document.createElement('style');
        s.id = '_psbStyle';
        s.textContent = '@keyframes _psbIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}';
        document.head.appendChild(s);
    }

    document.body.appendChild(banner);
}

const PLAN_PRICES = {
    mensal: { label: 'R$ 19,90',  period: '/mês', title: 'Premium Mensal',  sub: 'Acesso ilimitado · cancele quando quiser' },
    anual:  { label: 'R$ 149,00', period: '/ano', title: 'Premium Anual 🏆', sub: 'Economize 37% · R$ 12,42/mês · melhor custo-benefício' },
};

// ── Checkout ──────────────────────────────────────────────────────────────────
function renderCheckout() {
    if (isPremium()) {
        const scroll = document.querySelector('#screen-checkout .screen-scroll');
        if (scroll) {
            const exp = state.user.planExpiresAt
                ? new Date(state.user.planExpiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                : null;
            scroll.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:48px 24px;text-align:center">
                    <div style="font-size:64px">👑</div>
                    <h2 style="font-size:22px;font-weight:800">Você já é Premium!</h2>
                    <p style="font-size:14px;color:var(--text-secondary);max-width:280px;line-height:1.6">
                        Acesso ilimitado ativo. Aproveite todos os recursos sem limites.
                    </p>
                    ${exp ? `<div style="background:rgba(0,180,166,.1);border:1px solid rgba(0,180,166,.25);border-radius:10px;padding:8px 16px;font-size:12px;color:var(--teal)">⏱ Plano válido até ${exp}</div>` : ''}
                    <button class="cta-btn" style="margin-top:4px;width:100%" onclick="navigate('home')">Ir para o App 🚀</button>
                </div>`;
        }
        return;
    }
    selectCheckoutPlan(_checkoutPlan);
    selectPaymentMethod(_checkoutMethod);
    const fb = document.getElementById('code-feedback');
    if (fb) { fb.style.display = 'none'; fb.textContent = ''; }
    const inp = document.getElementById('activation-code-input');
    if (inp) inp.value = '';
}

function selectCheckoutPlan(plan) {
    _checkoutPlan = plan;
    document.getElementById('plan-btn-mensal')?.classList.toggle('active', plan === 'mensal');
    document.getElementById('plan-btn-anual')?.classList.toggle('active', plan === 'anual');
    document.getElementById('plan-btn-mensal')?.setAttribute('aria-pressed', plan === 'mensal');
    document.getElementById('plan-btn-anual')?.setAttribute('aria-pressed', plan === 'anual');

    const prices = PLAN_PRICES[plan] || PLAN_PRICES.mensal;
    const cpsTitle    = document.getElementById('cps-title');
    const cpsSub      = document.getElementById('cps-sub');
    const cpsPrice    = document.getElementById('cps-price');
    const cpsPriceSub = document.getElementById('cps-price-sub');
    if (cpsTitle)    cpsTitle.textContent    = prices.title;
    if (cpsSub)      cpsSub.textContent      = prices.sub;
    if (cpsPrice)    cpsPrice.textContent    = prices.label;
    if (cpsPriceSub) cpsPriceSub.textContent = prices.period;

    const pixPriceEl = document.getElementById('pix-price-display');
    if (pixPriceEl) pixPriceEl.textContent = prices.label;
}

function selectPaymentMethod(method) {
    _checkoutMethod = method;
    ['pix', 'card', 'code'].forEach(m => {
        const tab = document.getElementById(`tab-${m}`);
        tab?.classList.toggle('active', m === method);
        tab?.setAttribute('aria-selected', m === method);
        const el = document.getElementById(`method-${m}`);
        if (el) el.style.display = m === method ? '' : 'none';
    });
}

function goToCaktoCheckout(method) {
    const url = CAKTO_CHECKOUT_URLS[_checkoutPlan] || CAKTO_CHECKOUT_URLS.mensal;
    if (typeof _trackEvent !== 'undefined') _trackEvent('checkout_started', { plan: _checkoutPlan, method });
    window.open(url, '_blank', 'noopener,noreferrer');
    try { sessionStorage.setItem('_pendingPayment', _checkoutPlan); } catch { /* noop */ }
    const verifyBtn = document.getElementById(`${method}-verify-btn`);
    if (verifyBtn) verifyBtn.style.display = '';
    _startPlanPolling(method, false);
}

function verifyPayment() {
    showPaymentWaiting(_checkoutMethod);
}

// ── Toggle de período na tela de Planos ──────────────────────────────────────
let _plansPeriod = 'mensal';

function selectPlanPeriod(period) {
    _plansPeriod = period;
    document.getElementById('ppt-mensal')?.classList.toggle('active', period === 'mensal');
    document.getElementById('ppt-anual')?.classList.toggle('active', period === 'anual');
    document.getElementById('ppt-mensal')?.setAttribute('aria-pressed', period === 'mensal');
    document.getElementById('ppt-anual')?.setAttribute('aria-pressed', period === 'anual');

    const prices    = PLAN_PRICES[period] || PLAN_PRICES.mensal;
    const priceEl   = document.getElementById('plan-premium-price');
    const anualEl   = document.getElementById('plan-anual-destaque');
    const mensalSub = document.getElementById('plan-mensal-sub');
    const scroll    = document.getElementById('plans-scroll');

    if (priceEl) priceEl.innerHTML = `${prices.label}<span class="plan-period">${prices.period}</span>`;

    const isAnual = period === 'anual';
    if (anualEl)   anualEl.style.display   = isAnual ? 'block' : 'none';
    if (mensalSub) mensalSub.style.display = isAnual ? 'none'  : 'block';
    scroll?.classList.toggle('period-anual', isAnual);

    const freeBadge = document.getElementById('plan-free-badge');
    if (freeBadge) freeBadge.textContent = isPremium() ? 'INATIVO' : 'ATUAL';
}

function openCheckoutFromPlans() {
    _checkoutPlan = _plansPeriod;
    navigate('checkout');
}

// ── Verificação de plano no banco ─────────────────────────────────────────────
async function verificarPremium() {
    try {
        const user = await getCurrentUser();
        if (!user) return { is_premium: false, expires_at: null };

        const { data, error } = await supabase
            .from('users')
            .select('plan, plan_expires_at')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('❌ verificarPremium:', error.message);
            return { is_premium: false, expires_at: null };
        }

        const dbPremium = data?.plan === 'premium';
        if (dbPremium && state.user.plan !== 'premium') {
            state.user.plan = 'premium';
            if (data?.plan_expires_at) state.user.planExpiresAt = data.plan_expires_at;
            saveState();
            _syncPlanUI();
        } else if (!dbPremium && state.user.plan === 'premium') {
            state.user.plan = 'free';
            state.user.planExpiresAt = null;
            saveState();
            _syncPlanUI();
        }

        return {
            is_premium: dbPremium,
            expires_at: data?.plan_expires_at || null,
        };
    } catch (e) {
        console.error('❌ verificarPremium (catch):', e);
        return { is_premium: false, expires_at: null };
    }
}

// ── Renderização da tela de Planos ────────────────────────────────────────────
function renderPlans() {
    const subscribeBtn = document.getElementById('plans-subscribe-btn');
    const guarantee    = document.querySelector('.plans-guarantee');
    const statusEl     = document.getElementById('plans-premium-msg');

    if (!subscribeBtn) return;

    const prem = isPremium();

    if (prem) {
        subscribeBtn.style.display = 'none';
        if (guarantee) guarantee.style.display = 'none';
        if (statusEl) {
            const exp = state.user.planExpiresAt
                ? new Date(state.user.planExpiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                : null;
            statusEl.style.display = '';
            statusEl.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;background:rgba(0,180,166,.08);border:1px solid rgba(0,180,166,.3);border-radius:12px;text-align:center">
                    <span style="font-size:36px">👑</span>
                    <p style="font-weight:700;font-size:15px;color:var(--teal)">Você já é Premium!</p>
                    <p style="font-size:13px;color:var(--text-secondary)">Acesso ilimitado ativo. Aproveite todos os recursos.</p>
                    ${exp ? `<p style="font-size:12px;color:var(--teal)">Válido até ${exp}</p>` : ''}
                </div>`;
        }
    } else {
        subscribeBtn.style.display = '';
        subscribeBtn.disabled = false;
        subscribeBtn.textContent = 'Assinar Premium →';
        if (guarantee) guarantee.style.display = '';
        if (statusEl) statusEl.style.display = 'none';
    }

    const freeBadge = document.getElementById('plan-free-badge');
    if (freeBadge) freeBadge.textContent = prem ? 'INATIVO' : 'ATUAL';

    verificarPremium().catch(() => {});
}

// ── Polling de plano — auto-ativação após pagamento ───────────────────────────
let _planPollingInterval = null;
let _planPollingCount    = 0;

const POLL_INTERVAL_MS  = 8000;
const POLL_MAX_ATTEMPTS = 75;

function showPaymentWaiting(method) {
    const modal = document.getElementById('payment-waiting-modal');
    if (modal) modal.classList.add('active');
    _startPlanPolling(method, true);
}

function cancelPaymentWaiting() {
    const modal = document.getElementById('payment-waiting-modal');
    if (modal) modal.classList.remove('active');
    _stopPlanPolling(false);
}

function _startPlanPolling(method, showModal) {
    _stopPlanPolling(false);
    _planPollingCount = 0;

    const planBefore = state.user?.plan || 'free';
    const statusEl   = document.getElementById('pw-status-text');
    const hintEl     = document.getElementById('pw-hint-text');
    const progressEl = document.getElementById('pw-progress-bar');

    _planPollingInterval = setInterval(async () => {
        _planPollingCount++;

        const userId = state.user?.id;
        if (!userId) { _stopPlanPolling(false); return; }

        if (progressEl) {
            progressEl.style.width = Math.min((_planPollingCount / POLL_MAX_ATTEMPTS) * 100, 100) + '%';
        }
        if (hintEl) {
            hintEl.textContent = `Verificando... (tentativa ${_planPollingCount} de ${POLL_MAX_ATTEMPTS})`;
        }

        try {
            const result = await loadUserPlan(userId);
            if (result.plan === 'premium' && planBefore !== 'premium') {
                _stopPlanPolling(true);
                return;
            }
        } catch (e) {
            console.warn('Polling erro:', e);
        }

        if (_planPollingCount >= POLL_MAX_ATTEMPTS) {
            _stopPlanPolling(false);
            if (statusEl) statusEl.textContent = '⏱ Tempo esgotado. Se já pagou, use o código de ativação abaixo.';
            if (hintEl)   hintEl.textContent   = 'Caso precise de ajuda, entre em contato pelo suporte.';
        }
    }, POLL_INTERVAL_MS);
}

function _stopPlanPolling(success) {
    if (_planPollingInterval) {
        clearInterval(_planPollingInterval);
        _planPollingInterval = null;
    }
    if (success) {
        try { sessionStorage.removeItem('_pendingPayment'); } catch { /* noop */ }
        const waitModal = document.getElementById('payment-waiting-modal');
        if (waitModal) waitModal.classList.remove('active');
        _showPremiumSuccess();
    }
}

function _resumePendingPayment() {
    let pending;
    try { pending = sessionStorage.getItem('_pendingPayment'); } catch { return; }
    if (!pending) return;
    if (!state.user?.id) return;
    if (isPremium()) {
        try { sessionStorage.removeItem('_pendingPayment'); } catch { /* noop */ }
        setTimeout(() => _showPremiumSuccess(), 600);
        return;
    }
    _checkoutPlan = pending;
    console.log('⏳ Retomando polling de pagamento:', pending);
    setTimeout(() => _startPlanPolling(pending, false), 1200);
}

function _showPremiumSuccess() {
    const modal = document.getElementById('premium-success-modal');
    if (!modal) return;
    modal.classList.add('active');
    _launchConfetti();
    document.querySelectorAll('.plan-badge, .user-plan-label')
        .forEach(el => { el.textContent = 'Premium 👑'; el.classList.add('premium'); });
}

function closePremiumSuccess() {
    const modal = document.getElementById('premium-success-modal');
    if (modal) modal.classList.remove('active');
    navigate('home');
}

function _launchConfetti() {
    const container = document.getElementById('ps-confetti');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#FFD700', '#FF6B35', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0'];
    for (let i = 0; i < 60; i++) {
        const dot = document.createElement('div');
        dot.className = 'confetti-dot';
        dot.style.cssText = [
            `left:${Math.random() * 100}%`,
            `background:${colors[Math.floor(Math.random() * colors.length)]}`,
            `animation-delay:${Math.random() * 1.5}s`,
            `animation-duration:${1.5 + Math.random()}s`,
            `width:${6 + Math.random() * 8}px`,
            `height:${6 + Math.random() * 8}px`,
        ].join(';');
        container.appendChild(dot);
    }
}

// ── Código de ativação ────────────────────────────────────────────────────────
async function activateWithCode() {
    const input = document.getElementById('activation-code-input');
    const btn   = document.getElementById('activate-btn');
    const code  = (input?.value || '').trim().toUpperCase();

    if (!code || code.length < 6) {
        _showCodeFeedback('error', '⚠️ Digite um código válido.');
        return;
    }
    const userId = state.user?.id;
    if (!userId) {
        _showCodeFeedback('error', '⚠️ Faça login antes de resgatar o código.');
        setTimeout(() => navigate('login'), 1500);
        return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Validando...';

    try {
        const result = await redeemActivationCode(code, userId);
        if (result.success) {
            btn.textContent = '✅ Ativado!';
            setTimeout(() => _showPremiumSuccess(), 600);
        } else {
            _showCodeFeedback('error', `❌ ${result.error}`);
            btn.disabled = false;
            btn.textContent = '🔑 Ativar Premium';
        }
    } catch (e) {
        _showCodeFeedback('error', '❌ Erro de conexão. Verifique sua internet.');
        btn.disabled = false;
        btn.textContent = '🔑 Ativar Premium';
    }
}

function _showCodeFeedback(type, msg) {
    const fb = document.getElementById('code-feedback');
    if (!fb) return;
    fb.textContent = msg;
    fb.className = `code-feedback code-feedback-${type}`;
    fb.style.display = '';
}

// ── Verificação de acesso premium ─────────────────────────────────────────────
async function checkPremiumAccess() {
    const user = await getCurrentUser();
    if (!user) {
        alert('Faça login primeiro para acessar esta funcionalidade.');
        return false;
    }
    const { data } = await supabase
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .single();
    if (data?.plan !== 'premium') {
        alert('Esta funcionalidade é exclusiva para usuários Premium. Assine o plano Premium para continuar.');
        return false;
    }
    return true;
}

function showPaywall(title, body) {
    const el = document.getElementById('paywall-modal');
    if (!el) return;
    document.getElementById('paywall-title').textContent = title || 'Limite atingido 🔒';
    document.getElementById('paywall-body').textContent  = body  || 'Assine o Premium para estudar sem limites.';
    el.classList.add('active');
    if (typeof _updatePaywallUrgency !== 'undefined') _updatePaywallUrgency();
}

function closePaywall() {
    const el = document.getElementById('paywall-modal');
    if (el) el.classList.remove('active');
}


// ── Navegação/Auth ────────────────────────────────────────────────────────────
function goToRegister() {
    const obNameEl  = document.getElementById('ob-name');
    const obEmailEl = document.getElementById('ob-email');
    const obPassEl  = document.getElementById('ob-password');
    if (obNameEl)  obNameEl.value  = '';
    if (obEmailEl) obEmailEl.value = '';
    if (obPassEl)  obPassEl.value  = '';
    navigate('onboarding');
}

function toggleLoginPassword(btn) {
    const input  = document.getElementById('login-password');
    const isHidden = input.type === 'password';
    input.type   = isHidden ? 'text' : 'password';
    btn.style.color = isHidden ? 'var(--teal)' : 'var(--text-muted)';
}

async function changePassword() {
    const btn   = document.getElementById('change-password-btn');
    const msgEl = document.getElementById('change-password-msg');
    const email = state.user.email || '';

    if (!email) {
        if (msgEl) { msgEl.textContent = '❌ Nenhum e-mail associado à conta.'; msgEl.style.color = 'var(--red, #ef4444)'; msgEl.style.display = ''; }
        return;
    }
    if (btn)   btn.disabled    = true;
    if (msgEl) { msgEl.textContent = 'Enviando...'; msgEl.style.color = 'var(--text-secondary)'; msgEl.style.display = ''; }

    try {
        const sb = window.supabase;
        if (!sb) throw new Error('Serviço indisponível.');
        const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://enemmaster.com.br/app',
        });
        if (error) throw error;
        if (msgEl) { msgEl.textContent = `✅ E-mail enviado para ${email}. Verifique sua caixa de entrada.`; msgEl.style.color = 'var(--teal, #00b4a6)'; }
    } catch (e) {
        if (msgEl) { msgEl.textContent = '❌ ' + (e.message || 'Erro ao enviar. Tente novamente.'); msgEl.style.color = 'var(--red, #ef4444)'; }
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function handleForgotPassword() {
    const emailEl = document.getElementById('login-email');
    const email   = emailEl.value.trim();
    const errorEl = document.getElementById('login-error');

    if (!email.includes('@')) {
        errorEl.style.color = 'var(--red)';
        errorEl.textContent = 'Digite seu e-mail acima primeiro.';
        emailEl.focus();
        return;
    }
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        errorEl.style.color = 'var(--teal)';
        errorEl.textContent = 'E-mail de recuperação enviado! ✅';
    } catch (e) {
        errorEl.style.color = 'var(--red)';
        errorEl.textContent = 'Não foi possível enviar. Verifique o e-mail.';
    }
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function toggleFAQ(btn) {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
}

function filterFAQ() {
    const query = document.getElementById('faq-search').value.toLowerCase();
    document.querySelectorAll('.faq-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
    });
}

// =====================================================
// CHIP INTERACTION
// =====================================================
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
    }
});
