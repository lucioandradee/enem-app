// =====================================================
// RANKING
// =====================================================

// Aba ativa do ranking: 'escola' | 'global'
let _rankingTab = 'escola';

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

async function _loadRankingTab(tab) {
    const list = document.getElementById('ranking-list');
    if (list) list.innerHTML = '<div class="ranking-loading">Carregando...</div>';

    let allItems = null;

    if (typeof getGlobalTop !== 'undefined') {
        try {
            if (tab === 'escola' && state.user.school) {
                const res = await getSchoolRanking(state.user.school);
                if (res.success && res.data && res.data.length > 0) {
                    allItems = res.data.map((item, i) => ({ pos: i + 1, name: item.name || 'Usuário', school: item.school || '', pts: item.xp || 0, id: item.id }));
                }
            }
            if (!allItems) {
                const res = await getGlobalTop();
                if (res.success && res.data && res.data.length > 0) {
                    allItems = res.data.map((item, i) => ({ pos: i + 1, name: item.name || 'Usuário', school: item.school || '', pts: item.xp || 0, id: item.id }));
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

    // Título dinâmico
    const titleEl = document.getElementById('ranking-title');
    if (titleEl) {
        if (tab === 'global') titleEl.textContent = 'Ranking Global 🌎';
        else if (state.user.school) titleEl.textContent = 'Ranking da Escola 🏫';
        else titleEl.textContent = 'Ranking';
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
            : 'Nenhum usuário no ranking ainda.<br>Faça um simulado para aparecer aqui! 🏆')
        + '</div>';
    _renderUserRankFooter([]);
}

async function renderRanking() {
    // Sincronizar XP do usuário antes de buscar o ranking
    if (state.user.id && typeof saveUserData !== 'undefined') {
        await saveUserData(state.user.id).catch(() => {});
    }

    // Define aba padrão: escola se tiver escola, global se não tiver
    _rankingTab = state.user.school ? 'escola' : 'global';
    switchRankingTab(_rankingTab);
}

function inviteFriends() {
    const name = (state.user.name || 'Eu').split(' ')[0];
    const url  = window.location.origin + (window.location.pathname || '/');
    const text = `🎯 Entra no ENEM Master e estuda comigo!

` +
        `${name} te convidou para o app de preparação para o ENEM. Questões reais, ranking por escola e correção de redação por IA.

` +
        `👉 ${url}`;

    if (navigator.share) {
        navigator.share({ title: 'ENEM Master — Preparação Pro', text, url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            _showQuickToast('🔗 Link copiado! Manda para seus amigos.');
        }).catch(() => {
            _showQuickToast('👉 Compartilhe: ' + url);
        });
    }
}

function _renderPodium(items) {
    // Ordem: slot 2º, slot 1º, slot 3º
    const order = [1, 0, 2];
    const ids   = [2, 1, 3];
    order.forEach((itemIdx, slotIdx) => {
        const n = ids[slotIdx];
        const item = items[itemIdx];
        const avEl   = document.getElementById(`pod-${n}-av`);
        const nameEl = document.getElementById(`pod-${n}-name`);
        const ptsEl  = document.getElementById(`pod-${n}-pts`);
        const slot   = avEl?.closest('.podium-item');
        if (slot) slot.style.opacity = item ? '' : '0.3';
        if (!item) return;
        const nameWords = (item.name || '?').split(' ');
        const shortName = nameWords[0] + (nameWords[1] ? ' ' + nameWords[1][0] + '.' : '');
        if (avEl)   avEl.textContent   = (item.name || '?')[0].toUpperCase();
        if (nameEl) nameEl.textContent = shortName;
        if (ptsEl)  ptsEl.textContent  = (item.pts || 0).toLocaleString('pt-BR') + ' pts';
    });
}

function _renderPodiumEmpty() {
    [1,2,3].forEach(n => {
        const el = document.getElementById(`pod-${n}-av`)?.closest('.podium-item');
        if (el) el.style.opacity = '0.3';
    });
}

function _renderRankingList(items) {
    const list = document.getElementById('ranking-list');
    list.innerHTML = '';
    if (!items || items.length === 0) return;
    items.forEach(item => {
        const isMe = state.user.id && item.id === state.user.id;
        const el = document.createElement('div');
        el.className = 'ranking-item' + (isMe ? ' ranking-item-me' : '');

        const posEl = document.createElement('span');
        posEl.className = 'rank-pos';
        posEl.textContent = item.pos;

        const avatarEl = document.createElement('div');
        avatarEl.className = 'avatar small';
        avatarEl.textContent = (item.name || '?')[0].toUpperCase();

        const infoEl = document.createElement('div');
        infoEl.className = 'rank-info';

        const nameEl = document.createElement('div');
        nameEl.className = 'rank-name';
        nameEl.textContent = item.name || '?';
        if (isMe) {
            const youEl = document.createElement('span');
            youEl.style.cssText = 'color:var(--teal);font-size:11px';
            youEl.textContent = ' (você)';
            nameEl.appendChild(youEl);
        }

        const schoolEl = document.createElement('div');
        schoolEl.className = 'rank-class';
        schoolEl.textContent = item.school || '';

        infoEl.appendChild(nameEl);
        infoEl.appendChild(schoolEl);

        const ptsEl = document.createElement('span');
        ptsEl.className = 'rank-pts';
        ptsEl.textContent = (item.pts || 0).toLocaleString('pt-BR') + ' pts';

        el.appendChild(posEl);
        el.appendChild(avatarEl);
        el.appendChild(infoEl);
        el.appendChild(ptsEl);
        list.appendChild(el);
    });
}

function _renderUserRankFooter(items) {
    const posEl    = document.getElementById('user-rank-pos');
    const ptsEl    = document.getElementById('user-rank-pts');
    const gapEl    = document.getElementById('user-rank-gap');
    const avatarEl = document.getElementById('rank-footer-av');
    const myXp = state.user.xp || 0;

    if (avatarEl) avatarEl.textContent = (state.user.name || 'U')[0].toUpperCase();

    if (!items || items.length === 0) {
        if (posEl) posEl.textContent = '— Você';
        if (ptsEl) ptsEl.textContent = myXp.toLocaleString('pt-BR') + ' pts';
        if (gapEl) gapEl.textContent = 'Faça um simulado para entrar no ranking';
        return;
    }

    const myIdx = items.findIndex(i => state.user.id && i.id === state.user.id);
    if (myIdx === -1) {
        const lastPts = items[items.length - 1]?.pts || 0;
        if (posEl) posEl.textContent = `${items.length + 1}º+ Você`;
        if (ptsEl) ptsEl.textContent = myXp.toLocaleString('pt-BR') + ' pts';
        if (gapEl) gapEl.textContent = myXp < lastPts
            ? `Faltam ${(lastPts - myXp + 1).toLocaleString('pt-BR')} pts para entrar no Top ${items.length} 📈`
            : 'Atualizando...';
    } else {
        const rank = myIdx + 1;
        const top30 = items[Math.min(29, items.length - 1)]?.pts || 0;
        if (posEl) posEl.textContent = `${rank}º Você`;
        if (ptsEl) ptsEl.textContent = myXp.toLocaleString('pt-BR') + ' pts';
        if (gapEl) {
            if (rank <= 3) gapEl.textContent = '🏆 Você está no pódio!';
            else if (myXp < top30) gapEl.textContent = `Faltam ${(top30 - myXp + 1).toLocaleString('pt-BR')} pts p/ Top 30 📈`;
            else gapEl.textContent = 'Você está no Top 30! 🎯';
        }
    }
}

function _renderRankingAvg(items) {
    const avgEl = document.querySelector('.ranking-avg');
    if (!avgEl || !items || items.length === 0) return;
    const avg = Math.round(items.reduce((s, i) => s + (i.pts || 0), 0) / items.length);
    avgEl.textContent = `Média: ${avg.toLocaleString('pt-BR')} pts`;
}

