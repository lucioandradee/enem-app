// =====================================================
// RANKING
// =====================================================

// Aba ativa do ranking: 'escola' | 'global'
let _rankingTab = 'escola';
let _rankingAutoRefreshTimer = null;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Formata nome para exibição: remove email, capitaliza, limita tamanho */
function _rankFormatName(raw) {
    if (!raw) return 'Aluno';
    // Se for email (tem @), usa só a parte antes do @ e limpa números/pontos
    if (raw.includes('@')) {
        raw = raw.split('@')[0].replace(/[._\-0-9]+/g, ' ').trim();
    }
    // Capitaliza cada palavra
    const words = raw.split(/\s+/).filter(Boolean);
    const capitalized = words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase());
    // Máximo 2 palavras: "Nome S."
    if (capitalized.length >= 2) {
        return capitalized[0] + ' ' + capitalized[1][0] + '.';
    }
    return capitalized[0] || 'Aluno';
}

/** Gera cor de avatar determinística baseada no nome */
function _rankAvatarColor(name) {
    const colors = [
        'linear-gradient(135deg,#0f4c7a,#0a6e6e)',
        'linear-gradient(135deg,#4c0f7a,#6e0a5a)',
        'linear-gradient(135deg,#7a4c0f,#6e5a0a)',
        'linear-gradient(135deg,#0f7a4c,#0a6e2a)',
        'linear-gradient(135deg,#7a0f0f,#6e3a0a)',
        'linear-gradient(135deg,#0f2a7a,#0a4a6e)',
        'linear-gradient(135deg,#4a7a0f,#2a6e0a)',
        'linear-gradient(135deg,#7a0f5a,#6e0a6e)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

/** Retorna tier pelo XP */
function _rankTier(xp) {
    if (xp >= 15000) return { label: 'Diamante', key: 'diamante', icon: '💎' };
    if (xp >= 7500)  return { label: 'Platina',  key: 'platina',  icon: '🔷' };
    if (xp >= 3500)  return { label: 'Ouro',     key: 'ouro',     icon: '🥇' };
    if (xp >= 1500)  return { label: 'Prata',    key: 'prata',    icon: '🥈' };
    if (xp >= 500)   return { label: 'Bronze',   key: 'bronze',   icon: '🥉' };
    return                  { label: 'Iniciante', key: 'iniciante',icon: '🎯' };
}

/** XP necessário para o próximo tier */
function _rankNextTierXp(xp) {
    const thresholds = [500, 1500, 3500, 7500, 15000, Infinity];
    for (const t of thresholds) { if (xp < t) return t; }
    return Infinity;
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

function switchRankingTab(tab) {
    _rankingTab = tab;
    document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.getElementById('tab-' + tab);
    if (activeTab) activeTab.classList.add('active');

    // Atualiza cor do pódio e label da lista
    const podium = document.getElementById('podium-wrap');
    if (podium) {
        podium.classList.toggle('podium-global', tab === 'global');
        podium.classList.toggle('podium-escola', tab === 'escola');
    }
    const labelEl = document.getElementById('ranking-list-label');
    if (labelEl) labelEl.textContent = tab === 'global' ? 'TOP GLOBAL' : 'TOP DA ESCOLA';

    _loadRankingTab(tab);
}

async function refreshRanking() {
    const btn = document.getElementById('ranking-refresh-btn');
    if (btn) { btn.style.animation = 'spin 0.7s linear'; setTimeout(() => btn.style.animation = '', 700); }
    await _loadRankingTab(_rankingTab);
}

function _renderSkeleton() {
    const item = `<div class="ranking-skeleton-item">
        <div class="skeleton sk-pos"></div>
        <div class="skeleton sk-av"></div>
        <div class="sk-info">
            <div class="skeleton sk-name"></div>
            <div class="skeleton sk-sub"></div>
        </div>
        <div class="skeleton sk-pts"></div>
    </div>`;
    return item.repeat(5);
}

async function _loadRankingTab(tab) {
    const list = document.getElementById('ranking-list');
    if (list) list.innerHTML = _renderSkeleton();

    let allItems = null;

    if (typeof getGlobalTop !== 'undefined') {
        try {
            if (tab === 'escola' && state.user.school) {
                const res = await getSchoolRanking(state.user.school);
                if (res.success && res.data && res.data.length > 0) {
                    allItems = res.data.map((item, i) => ({ pos: i + 1, name: item.name || '', school: item.school || '', pts: item.xp || 0, id: item.id, level: item.level || 1, streak: item.streak || 0 }));
                }
            }
            if (!allItems) {
                const res = await getGlobalTop();
                if (res.success && res.data && res.data.length > 0) {
                    allItems = res.data.map((item, i) => ({ pos: i + 1, name: item.name || '', school: item.school || '', pts: item.xp || 0, id: item.id, level: item.level || 1, streak: item.streak || 0 }));
                    if (tab === 'escola' && state.user.school) {
                        // Sem dados de escola — avisa
                        const titleEl = document.getElementById('ranking-title');
                        if (titleEl) titleEl.textContent = 'Ranking Global';
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Ranking Supabase não disponível:', e);
        }
    }

    // Título dinâmico com indicador live
    const titleEl = document.getElementById('ranking-title');
    if (titleEl) {
        const base = tab === 'global'
            ? 'Ranking Global'
            : (state.user.school ? 'Ranking da Escola' : 'Ranking');
        titleEl.innerHTML = base + ' <span class="ranking-live-dot"></span>';
    }

    if (allItems && allItems.length > 0) {
        _renderPodium(allItems);
        _renderRankingList(allItems.slice(3));
        _renderUserRankFooter(allItems);
        _renderRankingAvg(allItems);
        return;
    }

    _renderPodiumEmpty();
    if (list) list.innerHTML = '<div class="ranking-empty">'
        + (tab === 'escola' && !state.user.school
            ? '🏫 Cadastre sua escola no perfil para ver o ranking da sua turma!'
            : 'Ainda não há alunos no ranking.<br>Complete um simulado para aparecer aqui! 🏆')
        + '</div>';
    _renderUserRankFooter([]);
}

async function renderRanking() {
    // Sincronizar XP do usuário antes de buscar o ranking
    if (state.user.id && typeof saveUserData !== 'undefined') {
        saveUserData(state.user.id).catch(() => {});
    }

    // Define aba padrão: escola se tiver escola, global se não tiver
    _rankingTab = state.user.school ? 'escola' : 'global';
    switchRankingTab(_rankingTab);

    // Auto-refresh a cada 60s enquanto a tela estiver aberta
    clearInterval(_rankingAutoRefreshTimer);
    _rankingAutoRefreshTimer = setInterval(() => {
        if (state.currentScreen === 'ranking') _loadRankingTab(_rankingTab);
    }, 60000);
}

function inviteFriends() {
    const name = (state.user.name || 'Eu').split(' ')[0];
    const url  = 'https://enemmaster.com.br';
    const text = `🎯 Entra no ENEM Master e estuda comigo!\n\n${name} te convidou para o melhor app de preparação para o ENEM. Questões reais, ranking por escola e correção de redação por IA.\n\n👉 ${url}`;
    if (navigator.share) {
        navigator.share({ title: 'ENEM Master', text, url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            _showQuickToast('🔗 Link copiado! Manda para seus amigos.');
        }).catch(() => {
            _showQuickToast('👉 Compartilhe: ' + url);
        });
    }
}

// ── Pódio ─────────────────────────────────────────────────────────────────────

function _renderPodium(items) {
    const order = [1, 0, 2];   // slot: 2º, 1º, 3º
    const ids   = [2, 1, 3];
    order.forEach((itemIdx, slotIdx) => {
        const n    = ids[slotIdx];
        const item = items[itemIdx];
        const avEl     = document.getElementById(`pod-${n}-av`);
        const nameEl   = document.getElementById(`pod-${n}-name`);
        const ptsEl    = document.getElementById(`pod-${n}-pts`);
        const tierEl   = document.getElementById(`pod-${n}-tier`);
        const slot     = avEl?.closest('.podium-item');
        if (slot) slot.style.opacity = item ? '' : '0.25';
        if (!item) return;

        const displayName = _rankFormatName(item.name);
        const tier = _rankTier(item.pts);
        const lvl  = item.level || Math.max(1, Math.floor((item.pts || 0) / 500) + 1);

        if (avEl) {
            avEl.textContent   = displayName[0].toUpperCase();
            avEl.style.background = _rankAvatarColor(displayName);
            // Inject level badge
            const existing = avEl.querySelector('.podium-lv');
            if (existing) existing.remove();
            const lvBadge = document.createElement('span');
            lvBadge.className = 'podium-lv';
            lvBadge.textContent = 'NV ' + lvl;
            avEl.appendChild(lvBadge);
        }
        if (nameEl) nameEl.textContent = displayName;
        if (ptsEl) {
            ptsEl.textContent = item.pts > 0
                ? (item.pts || 0).toLocaleString('pt-BR') + ' XP'
                : 'Novo aluno';
        }
        if (tierEl) {
            tierEl.textContent  = tier.label;
            tierEl.className    = `podium-tier-badge tier-${tier.key}`;
        }
    });
}

function _renderPodiumEmpty() {
    [1,2,3].forEach(n => {
        const el = document.getElementById(`pod-${n}-av`)?.closest('.podium-item');
        if (el) el.style.opacity = '0.25';
    });
}

// ── Lista ─────────────────────────────────────────────────────────────────────

function _renderRankingList(items) {
    const list = document.getElementById('ranking-list');
    if (!list) return;
    list.innerHTML = '';
    if (!items || items.length === 0) return;

    items.forEach((item, idx) => {
        const isMe   = !!(state.user.id && item.id === state.user.id);
        const name   = _rankFormatName(item.name);
        const tier   = _rankTier(item.pts);
        const lvl    = item.level || Math.max(1, Math.floor((item.pts || 0) / 500) + 1);
        const hasXp  = item.pts > 0;

        const el = document.createElement('div');
        el.className = 'ranking-item' + (isMe ? ' ranking-item-me' : '');
        el.style.animationDelay = (idx * 0.04) + 's';

        // Posição
        const posWrap = document.createElement('div');
        posWrap.className = 'rank-pos-wrap';
        const posEl = document.createElement('span');
        const medals = ['🥇','🥈','🥉'];
        const realPos = item.pos;
        if (realPos <= 3) {
            posEl.className = 'rank-pos-medal';
            posEl.textContent = medals[realPos - 1];
        } else {
            posEl.className = 'rank-pos';
            posEl.textContent = realPos;
        }
        posWrap.appendChild(posEl);

        // Avatar com nível
        const avWrap = document.createElement('div');
        avWrap.className = 'rank-avatar-wrap';
        const avEl = document.createElement('div');
        avEl.className = 'rank-avatar';
        avEl.textContent = name[0].toUpperCase();
        avEl.style.background = _rankAvatarColor(name);
        const lvBadge = document.createElement('span');
        lvBadge.className = 'rank-lv';
        lvBadge.textContent = 'NV' + lvl;
        avWrap.appendChild(avEl);
        avWrap.appendChild(lvBadge);

        // Info
        const infoEl = document.createElement('div');
        infoEl.className = 'rank-info';

        const nameRow = document.createElement('div');
        nameRow.className = 'rank-name';
        nameRow.textContent = name;
        if (isMe) {
            const you = document.createElement('span');
            you.className = 'rank-you';
            you.textContent = 'você';
            nameRow.appendChild(you);
        }

        const metaRow = document.createElement('div');
        metaRow.className = 'rank-meta';
        if (item.school) {
            const schoolEl = document.createElement('span');
            schoolEl.className = 'rank-school';
            schoolEl.textContent = item.school;
            metaRow.appendChild(schoolEl);
        }
        if (item.streak && item.streak >= 3) {
            const streakEl = document.createElement('span');
            streakEl.className = 'rank-streak';
            streakEl.textContent = '🔥' + item.streak + 'd';
            metaRow.appendChild(streakEl);
        }

        infoEl.appendChild(nameRow);
        infoEl.appendChild(metaRow);

        // Pontos + tier
        const rightEl = document.createElement('div');
        rightEl.className = 'rank-right';
        const ptsEl = document.createElement('span');
        ptsEl.className = 'rank-pts' + (!hasXp ? ' rank-pts-zero' : '');
        ptsEl.textContent = hasXp ? (item.pts).toLocaleString('pt-BR') + ' XP' : 'Novo aluno';
        const tierBadge = document.createElement('span');
        tierBadge.className = `rank-tier-badge podium-tier-badge tier-${tier.key}`;
        tierBadge.textContent = tier.label;
        rightEl.appendChild(ptsEl);
        rightEl.appendChild(tierBadge);

        el.appendChild(posWrap);
        el.appendChild(avWrap);
        el.appendChild(infoEl);
        el.appendChild(rightEl);
        list.appendChild(el);
    });
}

// ── Footer do usuário ────────────────────────────────────────────────────────

function _renderUserRankFooter(items) {
    const posEl    = document.getElementById('user-rank-pos');
    const ptsEl    = document.getElementById('user-rank-pts');
    const gapEl    = document.getElementById('user-rank-gap');
    const avatarEl = document.getElementById('rank-footer-av');
    const barEl    = document.getElementById('user-rank-xp-bar');
    const myXp     = state.user.xp || 0;
    const myName   = _rankFormatName(state.user.name || '');

    if (avatarEl) {
        avatarEl.textContent  = myName[0].toUpperCase();
        avatarEl.style.background = _rankAvatarColor(myName);
    }

    const tier     = _rankTier(myXp);
    const nextXp   = _rankNextTierXp(myXp);
    const prevXp   = [0,500,1500,3500,7500,15000].filter(t => t <= myXp).pop() || 0;
    const barPct   = nextXp === Infinity ? 100 : Math.min(100, Math.round(((myXp - prevXp) / (nextXp - prevXp)) * 100));

    if (barEl) barEl.style.width = barPct + '%';
    if (ptsEl) ptsEl.textContent = myXp.toLocaleString('pt-BR') + ' XP';

    if (!items || items.length === 0) {
        if (posEl) posEl.textContent = tier.icon + ' ' + tier.label;
        if (gapEl) gapEl.textContent = nextXp === Infinity
            ? '🏆 Nível máximo!'
            : `Faltam ${(nextXp - myXp).toLocaleString('pt-BR')} XP p/ ${_rankTier(nextXp).label}`;
        return;
    }

    const myIdx = items.findIndex(i => state.user.id && i.id === state.user.id);
    if (myIdx === -1) {
        const lastPts = items[items.length - 1]?.pts || 0;
        if (posEl) posEl.textContent = `${items.length + 1}º+ • ${tier.icon} ${tier.label}`;
        if (gapEl) gapEl.textContent = myXp < lastPts
            ? `Faltam ${(lastPts - myXp + 1).toLocaleString('pt-BR')} XP para entrar no Top ${items.length}`
            : nextXp === Infinity ? '🏆 Nível máximo!' : `Faltam ${(nextXp - myXp).toLocaleString('pt-BR')} XP p/ ${_rankTier(nextXp).label}`;
    } else {
        const rank  = myIdx + 1;
        const above = items[myIdx - 1];
        if (posEl) posEl.textContent = `${rank}º • ${tier.icon} ${tier.label}`;
        if (gapEl) {
            if (rank <= 1) gapEl.textContent = '🏆 Você está em 1º lugar!';
            else if (above) gapEl.textContent = `Faltam ${((above.pts || 0) - myXp + 1).toLocaleString('pt-BR')} XP para o ${rank - 1}º lugar`;
            else gapEl.textContent = nextXp === Infinity ? '🏆 Nível máximo!' : `Faltam ${(nextXp - myXp).toLocaleString('pt-BR')} XP p/ ${_rankTier(nextXp).label}`;
        }
    }
}

function _renderRankingAvg(items) {
    const avgEl = document.querySelector('.ranking-avg');
    if (!avgEl || !items || items.length === 0) return;
    const withXp = items.filter(i => i.pts > 0);
    if (withXp.length === 0) { avgEl.textContent = ''; return; }
    const avg = Math.round(withXp.reduce((s, i) => s + (i.pts || 0), 0) / withXp.length);
    avgEl.textContent = `Média: ${avg.toLocaleString('pt-BR')} XP`;
}