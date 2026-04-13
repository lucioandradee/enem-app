/* =====================================================
   ENEM MASTER — admin.js
   Dashboard de administração: usuários, premium, webhooks
   Depende de: supabase-config.js (supabase client global)
   ===================================================== */

'use strict';

// ── Constantes ────────────────────────────────────────────────────────────────
const ADMIN_SESSION_KEY = 'enem_admin_session';

// ── Estado ────────────────────────────────────────────────────────────────────
let adminUser = null;

// ── Utils ─────────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-dot"></span>${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity .3s, transform .3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch { return dateStr; }
}

function escapedHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function setPlanBadge(plan) {
    if (plan === 'premium') {
        return '<span class="badge badge-premium">👑 Premium</span>';
    }
    return '<span class="badge badge-free">Free</span>';
}

function setStatusBadge(status) {
    const map = {
        ok:      '<span class="badge badge-success">✓ ok</span>',
        success: '<span class="badge badge-success">✓ success</span>',
        error:   '<span class="badge badge-error">✗ error</span>',
        pending: '<span class="badge badge-pending">⏳ pending</span>',
        ignored: '<span class="badge badge-free">— ignored</span>',
    };
    const key = String(status || '').toLowerCase();
    return map[key] || `<span class="badge badge-info">${escapedHtml(status)}</span>`;
}

function setProviderBadge(provider) {
    const colors = {
        hotmart:    'color:#ff6b35;background:rgba(255,107,53,.12);border-color:rgba(255,107,53,.25)',
        kiwify:     'color:#a78bfa;background:rgba(167,139,250,.12);border-color:rgba(167,139,250,.25)',
        cakto:      'color:#34d399;background:rgba(52,211,153,.12);border-color:rgba(52,211,153,.25)',
        mercadopago:'color:#60a5fa;background:rgba(96,165,250,.12);border-color:rgba(96,165,250,.25)',
    };
    const key = String(provider || '').toLowerCase();
    const style = colors[key] || '';
    return `<span class="badge" style="${style}">${escapedHtml(provider || 'unknown')}</span>`;
}

function isExpired(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function adminLogin() {
    const email    = document.getElementById('gate-email').value.trim();
    const password = document.getElementById('gate-pass').value;
    const errEl    = document.getElementById('gate-error');
    const btn      = document.getElementById('gate-btn');
    const btnTxt   = document.getElementById('gate-btn-text');

    errEl.style.display = 'none';

    if (!email || !password) {
        errEl.textContent = 'Preencha e-mail e senha.';
        errEl.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btnTxt.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px"></span> Entrando…';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        adminUser = data.user;
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ email: data.user.email }));
        bootApp();
    } catch (err) {
        errEl.textContent = err.message || 'E-mail ou senha incorretos.';
        errEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btnTxt.textContent = 'Entrar';
    }
}

async function adminLogout() {
    await supabase.auth.signOut();
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    adminUser = null;
    document.getElementById('app').style.display  = 'none';
    document.getElementById('gate').style.display = 'flex';
    document.getElementById('gate-email').value   = '';
    document.getElementById('gate-pass').value    = '';
}

// Enter key on gate inputs
document.addEventListener('DOMContentLoaded', () => {
    ['gate-email', 'gate-pass'].forEach(id => {
        document.getElementById(id)?.addEventListener('keydown', e => {
            if (e.key === 'Enter') adminLogin();
        });
    });

    // Restore session if still valid
    supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
            adminUser = data.session.user;
            bootApp();
        }
    });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function bootApp() {
    // Verifica role no servidor (app_metadata não pode ser alterado pelo usuário)
    const { data: { user: verifiedUser }, error: verifyErr } = await supabase.auth.getUser();
    if (verifyErr || verifiedUser?.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut();
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        adminUser = null;
        const errEl = document.getElementById('gate-error');
        if (errEl) {
            errEl.textContent = 'Acesso negado: conta sem privilégios de administrador.';
            errEl.style.display = 'block';
        }
        const btn    = document.getElementById('gate-btn');
        const btnTxt = document.getElementById('gate-btn-text');
        if (btn)    btn.disabled = false;
        if (btnTxt) btnTxt.textContent = 'Entrar';
        return;
    }
    adminUser = verifiedUser;
    document.getElementById('gate').style.display = 'none';
    const appEl = document.getElementById('app');
    appEl.style.display = 'flex';
    document.getElementById('topbar-email').textContent = adminUser?.email ?? '—';
    loadAll();
}

async function loadAll() {
    loadStats();
    loadUsers();
    loadWebhookLogs();
    loadSubscriptionMetrics();
}

// ── Stats / KPIs ──────────────────────────────────────────────────────────────
const PRICE_MENSAL = 19.90;

async function loadStats() {
    const nowIso       = new Date().toISOString();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const startOfToday = new Date(new Date().setHours(0,0,0,0)).toISOString();

    // ── Usuários ────────────────────────────────────────────────────────────
    try {
        const [
            { count: total },
            { count: active },
            { count: newToday },
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('users').select('*', { count: 'exact', head: true })
                .eq('plan', 'premium')
                .or(`plan_expires_at.is.null,plan_expires_at.gt.${nowIso}`),
            supabase.from('users').select('*', { count: 'exact', head: true })
                .gte('created_at', startOfToday),
        ]);

        document.getElementById('stat-total').textContent  = total  ?? '—';
        document.getElementById('stat-active').textContent = active ?? '—';

        const pct = total > 0 ? Math.round((active / total) * 100) : 0;
        const activeSub = document.getElementById('stat-active-sub');
        if (activeSub) activeSub.textContent = `${pct}% do total`;

        const todaySub = document.getElementById('stat-new-today-sub');
        if (todaySub && newToday > 0) todaySub.textContent = `+${newToday} hoje`;

        // MRR e ARR estimados (base conservadora: todos mensal)
        const mrr = (active ?? 0) * PRICE_MENSAL;
        const arr = mrr * 12;
        document.getElementById('stat-mrr').textContent = mrr > 0
            ? 'R$ ' + mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : 'R$ 0,00';
        document.getElementById('stat-arr').textContent = arr > 0
            ? 'R$ ' + arr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : 'R$ 0,00';

    } catch (err) {
        console.warn('loadStats (users) error:', err.message);
    }

    // ── Webhooks: novas e canceladas no mês ─────────────────────────────────
    try {
        const EVENTS_NEW    = ['PURCHASE_APPROVED','PURCHASE.APPROVED','SUBSCRIPTION_CREATED','SUBSCRIPTION.CREATED','SUBSCRIPTION_APPROVED','SUBSCRIPTION.APPROVED'];
        const EVENTS_CANCEL = ['SUBSCRIPTION_CANCELLED','SUBSCRIPTION.CANCELLED','PURCHASE_REFUNDED','PURCHASE.REFUNDED','SUBSCRIPTION_REJECTED','SUBSCRIPTION.REJECTED','SUBSCRIPTION_RENEWAL_FAILED','SUBSCRIPTION.RENEWAL_FAILED'];

        const [{ data: logsNew }, { data: logsCancel }, { count: whTotal }] = await Promise.all([
            supabase.from('webhook_logs')
                .select('event_type')
                .gte('created_at', startOfMonth)
                .in('event_type', EVENTS_NEW),
            supabase.from('webhook_logs')
                .select('event_type')
                .gte('created_at', startOfMonth)
                .in('event_type', EVENTS_CANCEL),
            supabase.from('webhook_logs').select('*', { count: 'exact', head: true }),
        ]);

        const newMonth      = logsNew?.length    ?? 0;
        const cancelMonth   = logsCancel?.length ?? 0;
        const activeCnt     = parseInt(document.getElementById('stat-active').textContent) || 0;
        const churnRate     = activeCnt > 0 ? ((cancelMonth / activeCnt) * 100).toFixed(1) + '%' : '0%';

        document.getElementById('stat-new-month').textContent      = newMonth;
        document.getElementById('stat-cancelled-month').textContent = cancelMonth;
        document.getElementById('stat-churn').textContent           = churnRate;
        document.getElementById('stat-webhooks').textContent        = whTotal ?? '—';

        const mLabel = new Date().toLocaleString('pt-BR', { month: 'long' });
        const sub = document.getElementById('stat-new-month-sub');
        if (sub) sub.textContent = mLabel;

    } catch (err) {
        // tabela webhook_logs pode não existir ainda
        document.getElementById('stat-new-month').textContent      = 'N/A';
        document.getElementById('stat-cancelled-month').textContent = 'N/A';
        document.getElementById('stat-churn').textContent           = 'N/A';
        document.getElementById('stat-webhooks').textContent        = 'N/A';
    }
}

// ── Subscription Metrics (bar chart mensal) ───────────────────────────────────
async function loadSubscriptionMetrics() {
    const wrap = document.getElementById('mrr-bars-wrap');
    if (!wrap) return;

    const EVENTS_NEW    = ['PURCHASE_APPROVED','PURCHASE.APPROVED','SUBSCRIPTION_CREATED','SUBSCRIPTION.CREATED','SUBSCRIPTION_APPROVED','SUBSCRIPTION.APPROVED'];
    const EVENTS_CANCEL = ['SUBSCRIPTION_CANCELLED','SUBSCRIPTION.CANCELLED','PURCHASE_REFUNDED','PURCHASE.REFUNDED','SUBSCRIPTION_REJECTED','SUBSCRIPTION.REJECTED','SUBSCRIPTION_RENEWAL_FAILED','SUBSCRIPTION.RENEWAL_FAILED'];

    // Últimos 6 meses
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d   = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        months.push({
            label : d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
            start : new Date(d.getFullYear(), d.getMonth(), 1).toISOString(),
            end   : new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString(),
        });
    }

    try {
        const { data: logsAll, error } = await supabase
            .from('webhook_logs')
            .select('event_type, created_at')
            .gte('created_at', months[0].start);

        if (error) {
            if (error.code === '42P01') { wrap.innerHTML = '<p style="color:var(--text-3);font-size:13px">Nenhum dado de webhook ainda.</p>'; return; }
            throw error;
        }

        const rows = months.map(m => {
            const newCnt    = (logsAll || []).filter(l => l.created_at >= m.start && l.created_at < m.end && EVENTS_NEW.includes(l.event_type)).length;
            const cancelCnt = (logsAll || []).filter(l => l.created_at >= m.start && l.created_at < m.end && EVENTS_CANCEL.includes(l.event_type)).length;
            const mrr       = newCnt * PRICE_MENSAL;
            return { ...m, newCnt, cancelCnt, mrr };
        });

        const maxNew = Math.max(1, ...rows.map(r => r.newCnt));

        wrap.innerHTML = `
        <table class="mrr-table">
          <thead><tr>
            <th style="width:80px">Mês</th>
            <th>Novas</th>
            <th>Canceladas</th>
            <th style="text-align:right">MRR est.</th>
          </tr></thead>
          <tbody>
            ${rows.map(r => `
            <tr>
              <td class="mono" style="color:var(--text-2);font-size:12px">${escapedHtml(r.label)}</td>
              <td>
                <div class="mrr-bar-row">
                  <div class="mrr-bar-wrap"><div class="mrr-bar-fill mrr-bar-new" style="width:${Math.round((r.newCnt/maxNew)*100)}%"></div></div>
                  <span class="mrr-bar-header">${r.newCnt}</span>
                </div>
              </td>
              <td style="color:var(--red);font-size:13px;font-weight:600">${r.cancelCnt}</td>
              <td style="text-align:right;font-size:13px;color:var(--teal)">
                ${r.mrr > 0 ? 'R$ ' + r.mrr.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 }) : '—'}
              </td>
            </tr>`).join('')}
          </tbody>
        </table>`;

    } catch (err) {
        wrap.innerHTML = `<p style="color:var(--red);font-size:13px">Erro: ${escapedHtml(err.message)}</p>`;
    }
}

// ── User search & filter ──────────────────────────────────────────────────────
let _userFilter = 'all';

function setUserFilter(filter, el) {
    _userFilter = filter;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    filterUsers();
}

function filterUsers() {
    const q     = (document.getElementById('user-search')?.value || '').toLowerCase().trim();
    const rows  = document.querySelectorAll('#users-tbody tr');
    const nowMs = Date.now();

    rows.forEach(row => {
        if (row.classList.contains('loading-row')) return;

        const email    = row.cells[0]?.textContent?.toLowerCase() || '';
        const name     = row.cells[1]?.textContent?.toLowerCase() || '';
        const planText = (row.cells[2]?.textContent || '').toLowerCase();
        const expiryEl = row.cells[3];
        const expiryText = expiryEl?.textContent?.trim() || '';

        // plan filter
        let planOk = true;
        if (_userFilter === 'premium')  planOk = planText.includes('premium');
        if (_userFilter === 'free')     planOk = planText.includes('free');
        if (_userFilter === 'expired')  planOk = expiryText.startsWith('⚠');

        // text filter
        const textOk = !q || email.includes(q) || name.includes(q);

        row.style.display = planOk && textOk ? '' : 'none';
    });
}

// ── Users ─────────────────────────────────────────────────────────────────────
async function loadUsers() {
    const tbody   = document.getElementById('users-tbody');
    const emptyEl = document.getElementById('users-empty');
    const btn     = document.getElementById('btn-refresh-users');

    tbody.innerHTML   = '<tr class="loading-row"><td colspan="5"><span class="spinner"></span></td></tr>';
    emptyEl.style.display = 'none';
    btn.disabled      = true;
    btn.classList.add('spinning');

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, name, plan, plan_expires_at')
            .order('plan', { ascending: false })
            .order('plan_expires_at', { ascending: false, nullsFirst: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        tbody.innerHTML = data.map(u => {
            const expired   = isExpired(u.plan_expires_at);
            const isPrem    = u.plan === 'premium';
            const expiresHtml = u.plan_expires_at
                ? `<span style="color:${expired ? 'var(--red)' : 'var(--text-2)'}">
                     ${expired ? '⚠ ' : ''}${formatDate(u.plan_expires_at)}
                   </span>`
                : '<span style="color:var(--text-3)">—</span>';

            return `
            <tr data-userid="${escapedHtml(u.id)}" data-email="${escapedHtml(u.email)}">
              <td>${escapedHtml(u.email)}</td>
              <td style="color:var(--text-2)">${escapedHtml(u.name || '—')}</td>
              <td>${setPlanBadge(u.plan)}</td>
              <td class="mono">${expiresHtml}</td>
              <td>
                <div class="td-actions">
                  ${!isPrem ? `
                    <button class="btn btn-success btn-sm"
                      onclick="activateUser('${escapedHtml(u.email)}', 30)"
                      title="Ativar 30 dias">
                      ✓ Ativar
                    </button>
                  ` : `
                    <button class="btn btn-success btn-sm"
                      onclick="activateUser('${escapedHtml(u.email)}', 30)"
                      title="Renovar 30 dias">
                      ↺ Renovar
                    </button>
                  `}
                  ${isPrem ? `
                    <button class="btn btn-danger btn-sm"
                      onclick="removeUser('${escapedHtml(u.email)}')"
                      title="Remover premium">
                      ✕ Remover
                    </button>
                  ` : ''}
                </div>
              </td>
            </tr>`;
        }).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--red);text-align:center;padding:24px">
          Erro ao carregar: ${escapedHtml(err.message)}
        </td></tr>`;
        showToast('Erro ao carregar usuários: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.classList.remove('spinning');
        filterUsers();
    }
}

// ── Webhook Logs ──────────────────────────────────────────────────────────────
async function loadWebhookLogs() {
    const tbody   = document.getElementById('logs-tbody');
    const emptyEl = document.getElementById('logs-empty');
    const btn     = document.getElementById('btn-refresh-logs');

    tbody.innerHTML   = '<tr class="loading-row"><td colspan="5"><span class="spinner"></span></td></tr>';
    emptyEl.style.display = 'none';
    btn.disabled      = true;
    btn.classList.add('spinning');

    try {
        const { data, error } = await supabase
            .from('webhook_logs')
            .select('id, provider, event_type, status, buyer_email, created_at')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            // Table might not exist yet
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                tbody.innerHTML = '';
                emptyEl.style.display = 'block';
                document.getElementById('stat-webhooks').textContent = 'N/A';
                return;
            }
            throw error;
        }

        if (!data || data.length === 0) {
            tbody.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        tbody.innerHTML = data.map(log => `
            <tr>
              <td>${setProviderBadge(log.provider)}</td>
              <td class="mono">${escapedHtml(log.event_type || '—')}</td>
              <td>${setStatusBadge(log.status)}</td>
              <td style="color:var(--text-2);font-size:12px">${escapedHtml(log.buyer_email || '—')}</td>
              <td class="mono" style="white-space:nowrap">${formatDate(log.created_at)}</td>
            </tr>`).join('');

        document.getElementById('stat-webhooks').textContent = data.length >= 50
            ? '50+' : data.length;

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--red);text-align:center;padding:24px">
          Erro ao carregar: ${escapedHtml(err.message)}
        </td></tr>`;
        showToast('Erro ao carregar webhook logs: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.classList.remove('spinning');
    }
}

// ── Premium Actions ───────────────────────────────────────────────────────────

/**
 * Tenta chamar a RPC admin_set_premium; se não existir, faz UPDATE direto.
 * O UPDATE direto só vai funcionar se o usuário autenticado tiver permissão
 * (exige política RLS de admin ou service_role).
 */
async function setPremium(email, days) {
    // Tenta via RPC primeiro (função SECURITY DEFINER no Supabase)
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_set_premium', {
        p_email: email,
        p_days:  days,
    });

    if (!rpcError) return { success: true, data: rpcData };

    // RPC não existe (42883) → fallback: UPDATE direto
    if (rpcError.code === '42883' || rpcError.message?.includes('does not exist')) {
        const expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
        const { error: upErr } = await supabase
            .from('users')
            .update({ plan: 'premium', plan_expires_at: expiresAt })
            .eq('email', email);

        if (upErr) return { success: false, error: upErr.message };
        return { success: true };
    }

    return { success: false, error: rpcError.message };
}

/**
 * Tenta chamar a RPC admin_remove_premium; se não existir, faz UPDATE direto.
 */
async function removePremium(email) {
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_remove_premium', {
        p_email: email,
    });

    if (!rpcError) return { success: true, data: rpcData };

    if (rpcError.code === '42883' || rpcError.message?.includes('does not exist')) {
        const { error: upErr } = await supabase
            .from('users')
            .update({ plan: 'free', plan_expires_at: null })
            .eq('email', email);

        if (upErr) return { success: false, error: upErr.message };
        return { success: true };
    }

    return { success: false, error: rpcError.message };
}

// ── Button handlers ───────────────────────────────────────────────────────────
async function activateUser(email, days) {
    if (!email) return;
    if (!confirm(`Ativar premium por ${days} dias para:\n${email}`)) return;

    showToast(`Ativando premium para ${email}…`, 'info');
    const result = await setPremium(email, days);

    if (result.success) {
        showToast(`✓ Premium ativado para ${email}`, 'success');
        loadUsers();
        loadStats();
    } else {
        showToast(`Erro: ${result.error}`, 'error');
    }
}

async function removeUser(email) {
    if (!email) return;
    if (!confirm(`Remover premium de:\n${email}\n\nO usuário voltará para o plano Free.`)) return;

    showToast(`Removendo premium de ${email}…`, 'info');
    const result = await removePremium(email);

    if (result.success) {
        showToast(`✓ Premium removido de ${email}`, 'success');
        loadUsers();
        loadStats();
    } else {
        showToast(`Erro: ${result.error}`, 'error');
    }
}

async function manualActivate() {
    const email  = document.getElementById('manual-email').value.trim();
    const daysRaw = parseInt(document.getElementById('manual-days').value, 10);
    const btn    = document.getElementById('btn-activate');
    const btnTxt = document.getElementById('btn-activate-txt');

    if (!email) {
        showToast('Informe o e-mail do usuário.', 'error');
        document.getElementById('manual-email').focus();
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showToast('E-mail inválido.', 'error');
        return;
    }

    const days = isNaN(daysRaw) || daysRaw < 1 ? 30 : Math.min(daysRaw, 3650);

    btn.disabled = true;
    btnTxt.innerHTML = '<span class="spinner" style="width:13px;height:13px;border-width:2px"></span> Ativando…';

    try {
        const result = await setPremium(email, days);

        if (result.success) {
            showToast(`✓ Premium ativado por ${days} dias para ${email}`, 'success');
            document.getElementById('manual-email').value = '';
            document.getElementById('manual-days').value  = '30';
            loadUsers();
            loadStats();
        } else {
            showToast(`Erro: ${result.error}`, 'error');
        }
    } finally {
        btn.disabled = false;
        btnTxt.textContent = '✓ Ativar Premium';
    }
}
