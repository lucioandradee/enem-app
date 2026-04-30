/* =====================================================
   ENEM MASTER — achievements.js
   Conquistas, Notificações, Sparkline
   Depende de: state, saveState, navigate,
               getCurrentUser, saveBadgeToSupabase
   ===================================================== */

'use strict';

// =====================================================
// ACHIEVEMENTS — DINÂMICO
// =====================================================
const BADGE_DEFINITIONS = {
    ofensiva: [
        { id: 'inicio_feroz',   icon: '🔥', name: 'Início Feroz',     xp: 50,  hint: 'Complete seu primeiro simulado',       check: () => (state.quizHistory||[]).length >= 1 },
        { id: 'semana_ouro',    icon: '⭐', name: 'Semana de Ouro',   xp: 75,  hint: 'Mantenha 7 dias consecutivos de estudo', check: () => (state.user.streak||0) >= 7 },
        { id: 'constante',      icon: '📅', name: 'Constante',        xp: 75,  hint: 'Complete 5 simulados no total',          check: () => (state.quizHistory||[]).length >= 5 },
        { id: 'mes_imparavel',  icon: '💪', name: 'Mês Imparável',    xp: 150, hint: 'Mantenha 30 dias consecutivos de estudo', check: () => (state.user.streak||0) >= 30 },
        { id: 'lendario',       icon: '👑', name: 'Lendário',         xp: 300, hint: 'Mantenha 100 dias consecutivos de estudo', check: () => (state.user.streak||0) >= 100 },
    ],
    especialista: [
        { id: 'genio_redacao',       icon: '✍️', name: 'Gênio da Redação',      xp: 100, hint: 'Alcance 70% de acerto em Linguagens',       check: () => getAreaPct('linguagens') >= 70 },
        { id: 'rei_natureza',        icon: '🌿', name: 'Rei da Natureza',        xp: 100, hint: 'Alcance 70% de acerto em Ciências da Natureza', check: () => getAreaPct('natureza') >= 70 },
        { id: 'calculadora_humana',  icon: '🔢', name: 'Calculadora Humana',     xp: 100, hint: 'Alcance 70% de acerto em Matemática',        check: () => getAreaPct('matematica') >= 70 },
        { id: 'globalista',          icon: '🌍', name: 'Globalista',             xp: 100, hint: 'Alcance 70% de acerto em Ciências Humanas',  check: () => getAreaPct('humanas') >= 70 },
    ],
    maratonista: [
        { id: '100_questoes',   icon: '💯', name: 'Caçador de XP',   xp: 100, hint: 'Responda 100 questões corretamente',   check: () => (state.progress.totalCorretas||0) >= 100 },
        { id: '500_questoes',   icon: '🏅', name: 'Mestre das Questões', xp: 200, hint: 'Responda 500 questões corretamente', check: () => (state.progress.totalCorretas||0) >= 500 },
        { id: 'o_maratonista',  icon: '🏃', name: 'Maratonista',     xp: 400, hint: 'Responda 1000 questões corretamente',  check: () => (state.progress.totalCorretas||0) >= 1000 },
    ],
};

function getAreaPct(disc) {
    const st = state.progress.stats && state.progress.stats[disc];
    if (!st || st.total === 0) return 0;
    return Math.round((st.correct / st.total) * 100);
}

function checkBadges() {
    if (!state.badges) state.badges = { ofensiva: [], especialista: [], maratonista: [] };
    const newlyUnlocked = [];

    for (const [category, defs] of Object.entries(BADGE_DEFINITIONS)) {
        for (const badge of defs) {
            if (!state.badges[category].includes(badge.id) && badge.check()) {
                state.badges[category].push(badge.id);
                newlyUnlocked.push(badge);
            }
        }
    }
    if (newlyUnlocked.length > 0) {
        saveState();

        if (typeof getCurrentUser !== 'undefined' && typeof saveBadgeToSupabase !== 'undefined') {
            getCurrentUser().then(user => {
                if (user) {
                    newlyUnlocked.forEach(badge => {
                        saveBadgeToSupabase(user.id, badge.id, badge.name, badge.category || 'geral')
                            .catch(() => {});
                    });
                }
            }).catch(() => {});
        }

        newlyUnlocked.forEach((badge, i) => {
            setTimeout(() => showBadgeToast(badge), i * 2200);
        });
        _pushNotification({
            type: 'purple',
            icon: '🎯',
            title: newlyUnlocked.length === 1
                ? `Conquista: ${newlyUnlocked[0].name}!`
                : `${newlyUnlocked.length} conquistas desbloqueadas!`,
            body: newlyUnlocked.length === 1
                ? `Parabéns! Você desbloqueou "${newlyUnlocked[0].name}" e ganhou +${newlyUnlocked[0].xp || 50} XP bônus!`
                : `Você desbloqueou: ${newlyUnlocked.map(b => b.name).join(', ')}. Incrível progresso!`,
            ctaScreen: 'achievements',
            cta: 'Ver conquistas',
        });
    }
}

// =====================================================
// NOTIFICAÇÕES REAIS
// =====================================================
const NOTIF_LIMIT = 50;

function _pushNotification(opts) {
    if (!state.notifications) state.notifications = [];
    const notif = {
        id: Date.now(),
        type: opts.type || 'blue',
        icon: opts.icon || '🔔',
        title: opts.title || '',
        body: opts.body || '',
        ctaScreen: opts.ctaScreen || null,
        cta: opts.cta || null,
        unread: true,
        date: new Date().toISOString(),
    };
    state.notifications.unshift(notif);
    if (state.notifications.length > NOTIF_LIMIT) {
        state.notifications = state.notifications.slice(0, NOTIF_LIMIT);
    }
    saveState();

    const unread = state.notifications.filter(n => n.unread).length;
    const badge = document.getElementById('notif-count');
    if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }
}

// =====================================================
// SPARKLINE DE PROGRESSO HISTÓRICO
// =====================================================
function renderHistorySparkline() {
    const container = document.getElementById('history-sparkline-card');
    if (!container) return;

    const history = (state.quizHistory || []).slice(-7);
    const labelEl = container.querySelector('.sparkline-label');
    const svgEl   = container.querySelector('#history-sparkline');

    if (history.length < 2) {
        if (labelEl) labelEl.textContent = 'Histórico de acertos';
        if (svgEl) svgEl.innerHTML = '';
        const emptyEl = container.querySelector('.sparkline-empty');
        if (emptyEl) emptyEl.style.display = '';
        return;
    }

    const emptyEl = container.querySelector('.sparkline-empty');
    if (emptyEl) emptyEl.style.display = 'none';

    const pcts    = history.map(h => h.pct);
    const last    = pcts[pcts.length - 1];
    const prev    = pcts[pcts.length - 2];
    const trend   = last >= prev ? 'up' : 'down';
    const trendColor = trend === 'up' ? 'var(--green)' : 'var(--orange)';

    if (labelEl) {
        labelEl.textContent = `Último: ${last}%`;
        labelEl.style.color = trendColor;
    }

    if (!svgEl) return;

    const W = 120, H = 44;
    const min = Math.max(0, Math.min(...pcts) - 5);
    const max = Math.min(100, Math.max(...pcts) + 5);
    const range = max - min || 1;

    const toX = (i) => (i / (pcts.length - 1)) * W;
    const toY = (v) => H - ((v - min) / range) * H;

    const points = pcts.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const fillPoints = `0,${H} ` + points + ` ${W},${H}`;

    svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svgEl.innerHTML = `
        <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${trendColor}" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="${trendColor}" stop-opacity="0.0"/>
            </linearGradient>
        </defs>
        <polygon points="${fillPoints}" fill="url(#sparkGrad)"/>
        <polyline points="${points}" fill="none" stroke="${trendColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        ${pcts.map((v, i) => `<circle cx="${toX(i).toFixed(1)}" cy="${toY(v).toFixed(1)}" r="2.3" fill="${trendColor}"/>`).join('')}
    `;

    const subEl = container.querySelector('.sparkline-sub');
    if (subEl) {
        const trendIcon = trend === 'up' ? '↑' : '↓';
        subEl.textContent = `${trendIcon} últimas ${history.length} sessões`;
        subEl.style.color = trendColor;
    }
}

function showBadgeToast(badge) {
    const toast = document.getElementById('badge-toast');
    document.getElementById('badge-toast-icon').textContent = badge.icon;
    document.getElementById('badge-toast-name').textContent = badge.name;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

function _showQuickToast(message) {
    let toast = document.getElementById('quick-xp-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'quick-xp-toast';
        toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--teal,#00b4a6);color:#fff;padding:10px 20px;border-radius:20px;font-size:14px;font-weight:600;z-index:9999;pointer-events:none;transition:opacity .4s;opacity:0;';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

function renderAchievements() {
    if (!state.badges) state.badges = { ofensiva: [], especialista: [], maratonista: [] };

    const allBadges = Object.entries(BADGE_DEFINITIONS).flatMap(([cat, defs]) =>
        defs.map(b => ({ ...b, cat }))
    );
    const totalBadges    = allBadges.length;
    const totalUnlocked  = Object.values(state.badges).flat().length;
    const pct            = Math.round((totalUnlocked / totalBadges) * 100);
    const totalXp        = Object.entries(BADGE_DEFINITIONS).reduce((sum, [cat, defs]) => {
        return sum + defs.reduce((s, b) =>
            (state.badges[cat] || []).includes(b.id) ? s + (b.xp || 50) : s, 0);
    }, 0);

    const unlockedEl = document.getElementById('ach-total-unlocked');
    const xpEl       = document.getElementById('ach-total-xp');
    const compEl     = document.getElementById('ach-completion');
    if (unlockedEl) unlockedEl.textContent = `${totalUnlocked}/${totalBadges}`;
    if (xpEl)       xpEl.textContent       = `+${totalXp}`;
    if (compEl)     compEl.textContent     = pct + '%';

    document.querySelectorAll('.badge-section').forEach((section, idx) => {
        const categories = ['ofensiva', 'especialista', 'maratonista'];
        const cat = categories[idx];
        if (!cat) return;
        const defs     = BADGE_DEFINITIONS[cat];
        const unlocked = state.badges[cat] || [];

        const countEl = section.querySelector('.badge-count');
        if (countEl) countEl.textContent = `${unlocked.length}/${defs.length} Desbloqueados`;

        const grid = section.querySelector('.badge-grid');
        if (!grid) return;
        grid.innerHTML = '';
        defs.forEach(badge => {
            const isUnlocked = unlocked.includes(badge.id);
            const item = document.createElement('div');
            item.className = 'badge-item ' + (isUnlocked ? 'unlocked' : 'locked');
            if (isUnlocked) {
                item.innerHTML = `
                    <div class="badge-icon">${badge.icon}</div>
                    <span>${badge.name}</span>
                    <span class="badge-xp-chip">+${badge.xp || 50} XP</span>`;
            } else {
                item.innerHTML = `
                    <div class="badge-icon">🔒</div>
                    <span>${badge.name}</span>
                    <span class="badge-hint">${badge.hint || 'Continue estudando'}</span>`;
            }
            grid.appendChild(item);
        });
    });

    const nextBadge = allBadges.find(b => !state.badges[b.cat]?.includes(b.id));
    if (nextBadge) {
        document.querySelector('.na-title').textContent = nextBadge.name;
        document.querySelector('.na-icon').textContent  = nextBadge.icon;
        const descEl = document.querySelector('.na-desc');
        if (descEl) descEl.textContent = nextBadge.hint || 'Continue estudando para desbloquear.';
        document.querySelector('.progress-count.teal').textContent = pct + '%';
        document.querySelector('.next-achievement-card .progress-bar').style.width = pct + '%';
        document.querySelector('.na-remaining').textContent = `${totalUnlocked} de ${totalBadges} desbloqueados`;
        const xpRewardEl = document.querySelector('.na-xp-el');
        if (xpRewardEl) xpRewardEl.textContent = `+${nextBadge.xp || 50} XP`;
    }
}
