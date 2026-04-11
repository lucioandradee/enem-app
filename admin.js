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
}

// ── Stats ─────────────────────────────────────────────────────────────────────
async function loadStats() {
    try {
        const [{ count: total }, { count: premium }] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'premium'),
        ]);

        // Active = premium AND not expired (plan_expires_at > now, or null when no expiry set)
        const { count: active } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('plan', 'premium')
            .or('plan_expires_at.is.null,plan_expires_at.gt.' + new Date().toISOString());

        document.getElementById('stat-total').textContent   = total   ?? '—';
        document.getElementById('stat-premium').textContent = premium ?? '—';
        document.getElementById('stat-active').textContent  = active  ?? '—';
    } catch (err) {
        console.warn('loadStats error:', err.message);
    }

    try {
        const { count: wh } = await supabase
            .from('webhook_logs')
            .select('*', { count: 'exact', head: true });
        document.getElementById('stat-webhooks').textContent = wh ?? '—';
    } catch {
        document.getElementById('stat-webhooks').textContent = 'N/A';
    }
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
