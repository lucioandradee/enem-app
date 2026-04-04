// =====================================================
// PROFILE ÔÇö STATS DIN├éMICAS
// =====================================================
function renderProfile() {
    const s = state.user;
    const safeName = (s.name && s.name.trim()) ? s.name : 'Estudante';
    document.getElementById('profile-avatar').textContent = safeName[0].toUpperCase();
    document.getElementById('profile-name').textContent = safeName;
    document.getElementById('profile-level').textContent = s.level;
    document.getElementById('profile-xp').textContent = s.xp.toLocaleString('pt-BR');

    // Card de status do plano
    const planStatusEl = document.getElementById('profile-plan-status');
    if (planStatusEl) {
        const remaining = getRemainingQuestions();
        if (isPremium()) {
            const exp = state.user.planExpiresAt
                ? new Date(state.user.planExpiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                : null;
            planStatusEl.innerHTML = `
                <div class="profile-plan-card profile-plan-premium">
                    <span class="ppc-icon">­ƒææ</span>
                    <div class="ppc-info">
                        <span class="ppc-name">Plano Premium</span>
                        <span class="ppc-sub">Ativo ┬À simulados e reda├º├úo ilimitados${exp ? ` ┬À at├® ${exp}` : ''}</span>
                    </div>
                    <span class="ppc-active">ATIVO</span>
                </div>`;
        } else {
            const remText = remaining <= 0
                ? 'Limite di├írio atingido ­ƒöÆ'
                : remaining <= 3
                    ? `ÔÜá´©Å Apenas ${remaining} ${remaining === 1 ? 'quest├úo restante' : 'quest├Áes restantes'} hoje`
                    : `${remaining} quest├Áes restantes hoje`;
            planStatusEl.innerHTML = `
                <div class="profile-plan-card profile-plan-free">
                    <span class="ppc-icon">ÔÜí</span>
                    <div class="ppc-info">
                        <span class="ppc-name">Plano Gr├ítis</span>
                        <span class="ppc-sub">${remText}</span>
                    </div>
                    <button class="ppc-upgrade-btn" onclick="navigate('plans')">Upgrade ­ƒææ</button>
                </div>`;
        }
    }

    // ├ürea grid din├ómica
    renderAreaGrid();

    // Metas pessoais din├ómicas
    renderGoals();

    // Atividade recente (├║ltimos badges)
    renderRecentActivity();

    // Retrospectiva mensal
    renderMonthlyRetro();
}

function renderAreaGrid() {
    const grid = document.getElementById('area-grid');
    if (!grid) return;

    const areas = [
        { disc: 'humanas',    icon: '­ƒôÜ', name: 'HUMANAS' },
        { disc: 'natureza',   icon: '­ƒö¼', name: 'NATUREZA' },
        { disc: 'linguagens', icon: '­ƒôØ', name: 'LINGUAGENS' },
        { disc: 'matematica', icon: 'Ô×ù', name: 'MATEM├üTICA' },
    ];

    grid.innerHTML = '';
    areas.forEach(a => {
        const pct = getAreaPct(a.disc);
        const st = state.progress.stats?.[a.disc] || { correct: 0, total: 0 };
        const color = pct >= 70 ? 'var(--teal)' : pct >= 50 ? 'var(--orange)' : 'var(--red)';
        const card = document.createElement('div');
        card.className = 'area-card';
        card.innerHTML = `
            <span class="area-icon">${a.icon}</span>
            <span class="area-name">${a.name}</span>
            <span class="area-pct" style="color:${color}">${st.total > 0 ? pct + '%' : 'ÔÇö'}</span>
            <div class="progress-bar-wrap thin">
                <div class="progress-bar" style="width:${pct}%"></div>
            </div>
            <span class="area-questions">${st.total > 0 ? st.correct + '/' + st.total + ' acertos' : 'Nenhuma quest├úo ainda'}</span>
        `;
        grid.appendChild(card);
    });
}

function renderGoals() {
    const el = document.getElementById('goals-list');
    if (!el) return;

    const today = new Date();
    const todayStr = today.toDateString();

    // --- Meta 1: Simulados da semana ---
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weeklyDone = (state.quizHistory || []).filter(h => h.date && new Date(h.date) >= weekStart).length;
    const weeklyGoal = state.user.weeklyGoal || 3;

    // --- Meta 2: Quest├Áes hoje ---
    const todayDone = state.user.questoesHojeData === todayStr ? (state.user.questoesHoje || 0) : 0;
    const todayTotal = state.user.dailyGoal || state.progress.totalHoje || 10;
    const topRec = _getRecommendationAgent()[0];
    const areaLabel = topRec ? topRec.area : 'Quest├Áes';
    const areaIcon  = topRec ? topRec.icon : '­ƒÄ»';

    // --- Meta 3: Ofensiva ---
    const streak = state.user.streak || 0;
    const studiedToday = (state.quizHistory || []).some(h => h.date && new Date(h.date).toDateString() === todayStr);

    const goals = [
        {
            icon: '­ƒôï', iconBg: 'teal-bg-sm',
            title: 'Simulados Semanais',
            sub: weeklyDone >= weeklyGoal ? 'Meta da semana atingida! ­ƒÄë' : `Faltam ${weeklyGoal - weeklyDone} para a meta ÔÇö at├® domingo`,
            done: weeklyDone >= weeklyGoal,
            badge: weeklyDone >= weeklyGoal ? null : `${weeklyDone}/${weeklyGoal}`,
        },
        {
            icon: areaIcon, iconBg: 'teal-bg-sm',
            title: `Quest├Áes de Hoje`,
            sub: todayDone >= todayTotal ? 'Meta di├íria conclu├¡da! ­ƒöÑ' : `${todayTotal - todayDone} restantes ┬À foco em ${areaLabel}`,
            done: todayDone >= todayTotal,
            badge: todayDone >= todayTotal ? null : `${todayDone}/${todayTotal}`,
        },
    ];

    if (streak >= 2 || studiedToday) {
        goals.push({
            icon: '­ƒöÑ', iconBg: 'orange-bg-sm',
            title: streak > 0 ? `Ofensiva: ${streak} dia${streak > 1 ? 's' : ''}` : 'Manter Ofensiva',
            sub: studiedToday ? 'J├í estudou hoje ÔÇö sequ├¬ncia mantida!' : 'Estude hoje para n├úo perder a sequ├¬ncia',
            done: studiedToday,
            badge: null,
        });
    }

    el.innerHTML = '';
    goals.forEach(g => {
        const right = g.done
            ? `<span class="goal-check">Ô£à</span>`
            : g.badge ? `<span class="goal-progress">${g.badge}</span>` : '';
        const div = document.createElement('div');
        div.className = 'goal-item';
        div.innerHTML = `
            <div class="goal-icon ${g.iconBg}">${g.icon}</div>
            <div class="goal-info">
                <span class="goal-title">${g.title}</span>
                <span class="goal-sub">${g.sub}</span>
            </div>
            ${right}`;
        el.appendChild(div);
    });
}

// =====================================================
// RETROSPECTIVA MENSAL ÔÇö Wrapped
// =====================================================

function computeMonthlyRetro(month, year) {
    const history = state.quizHistory || [];
    const entries = history.filter(h => {
        if (!h.date) return false;
        const d = new Date(h.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });
    if (entries.length === 0) return null;

    const totalQuestoes = entries.reduce((acc, h) => acc + (h.total || 0), 0);
    const totalCorretas = entries.reduce((acc, h) => acc + (h.correct || 0), 0);
    const totalXP       = entries.reduce((acc, h) => acc + (h.xp || 0), 0);
    const accuracy      = totalQuestoes > 0 ? Math.round((totalCorretas / totalQuestoes) * 100) : 0;
    const uniqueDays    = new Set(entries.map(h => new Date(h.date).toDateString())).size;
    const simulados     = entries.length;

    // Tempo real de sess├úo (durationMinutes salvo desde v2; fallback 1.5 min/quest├úo)
    const studyMinutes = entries.reduce((acc, h) =>
        acc + (h.durationMinutes != null ? h.durationMinutes : Math.round((h.total || 0) * 1.5)), 0);
    const studyHours = studyMinutes >= 60
        ? `${Math.floor(studyMinutes / 60)}h${studyMinutes % 60 > 0 ? (studyMinutes % 60) + 'min' : ''}`
        : `${studyMinutes}min`;

    const areaNames = { humanas: 'Humanas', natureza: 'Natureza', linguagens: 'Linguagens', matematica: 'Mat.', misto: 'Misto' };
    const areaIcons = { humanas: '­ƒôÜ', natureza: '­ƒö¼', linguagens: '­ƒôØ', matematica: 'Ô×ù', misto: '­ƒÄ»' };

    // ÔöÇÔöÇ Erros reais do m├¬s via wrongAnswers ÔöÇÔöÇ
    const AREA_TO_DISC = {
        'CI├èNCIAS HUMANAS': 'humanas', 'CI├èNCIAS DA NATUREZA': 'natureza',
        'LINGUAGENS': 'linguagens', 'MATEM├üTICA': 'matematica',
    };
    const wrongThisMonth = (state.wrongAnswers || []).filter(wa => {
        if (!wa.date) return false;
        const d = new Date(wa.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });
    const wrongByDisc = {};
    wrongThisMonth.forEach(wa => {
        const disc = AREA_TO_DISC[wa.question?.area] || 'misto';
        wrongByDisc[disc] = (wrongByDisc[disc] || 0) + 1;
    });

    // ÔöÇÔöÇ Acur├ícia por disciplina do m├¬s (quizHistory de disciplina espec├¡fica) ÔöÇÔöÇ
    const areaStats = {};
    entries.forEach(h => {
        const d = h.discipline || 'misto';
        if (d === 'misto') return; // misto n├úo representa uma disciplina
        if (!areaStats[d]) areaStats[d] = { correct: 0, total: 0 };
        areaStats[d].correct += (h.correct || 0);
        areaStats[d].total   += (h.total || 0);
    });

    // Complementar com progress.stats (dados reais acumulados) se n├úo houver
    // quizzes por disciplina no m├¬s
    const globalStats = (state.progress && state.progress.stats) || {};
    const discsWithMonthData = Object.keys(areaStats).filter(d => areaStats[d].total >= 3);
    if (discsWithMonthData.length === 0) {
        ['humanas', 'natureza', 'linguagens', 'matematica'].forEach(d => {
            const gs = globalStats[d];
            if (gs && gs.total >= 5) {
                areaStats[d] = { correct: gs.correct, total: gs.total, isGlobal: true };
            }
        });
    }

    const areasRanked = Object.entries(areaStats)
        .filter(([, s]) => s.total >= 3)
        .map(([disc, s]) => ({ disc, pct: Math.round((s.correct / s.total) * 100), isGlobal: !!s.isGlobal }))
        .sort((a, b) => b.pct - a.pct);

    // Pior ├írea: prioridade para a que tem mais erros reais no m├¬s
    const worstByErrors = Object.entries(wrongByDisc)
        .filter(([d]) => d !== 'misto')
        .sort((a, b) => b[1] - a[1])[0];

    const bestArea  = areasRanked[0] || null;
    const worstArea = worstByErrors
        ? { disc: worstByErrors[0], erros: worstByErrors[1],
            pct: areaStats[worstByErrors[0]] ? Math.round((areaStats[worstByErrors[0]].correct / areaStats[worstByErrors[0]].total) * 100) : null }
        : (areasRanked.length > 1 ? areasRanked[areasRanked.length - 1] : null);

    return { totalQuestoes, totalCorretas, totalXP, accuracy, uniqueDays, studyHours, studyMinutes,
             simulados, bestArea, worstArea, areaNames, areaIcons, wrongByDisc };
}

function renderMonthlyRetro() {
    const wrap = document.getElementById('monthly-retro-wrap');
    if (!wrap) return;

    const now = new Date();
    let month = now.getMonth();
    let year  = now.getFullYear();
    let retro = computeMonthlyRetro(month, year);

    // Sem dados no m├¬s atual ÔåÆ tentar m├¬s anterior
    if (!retro) {
        month = month === 0 ? 11 : month - 1;
        year  = (month === 11 && now.getMonth() === 0) ? year - 1 : year;
        retro = computeMonthlyRetro(month, year);
    }

    const MONTH_NAMES = ['Janeiro','Fevereiro','Mar├ºo','Abril','Maio','Junho',
                         'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    if (!retro) {
        wrap.innerHTML = `
            <div class="section-header"><span class="section-title">RETROSPECTIVA DO M├èS</span></div>
            <div class="retro-empty-card">
                <div style="font-size:32px;margin-bottom:8px">­ƒôè</div>
                <p>Responda alguns simulados para ver<br>sua retrospectiva mensal!</p>
            </div>`;
        return;
    }

    const monthLabel  = `${MONTH_NAMES[month]} ${year}`;

    // Melhor mat├®ria: badge "(global)" se vier de progress.stats
    const bestLabel = retro.bestArea
        ? `${retro.areaIcons[retro.bestArea.disc]} ${retro.areaNames[retro.bestArea.disc]} (${retro.bestArea.pct}%${retro.bestArea.isGlobal ? ' geral' : ''})`
        : 'ÔÇö';

    // Pior mat├®ria: prefere mat├®ria com mais erros reais no m├¬s
    let worstLabel = null;
    if (retro.worstArea) {
        const wa = retro.worstArea;
        const pctStr = wa.pct != null ? ` (${wa.pct}%)` : '';
        const errStr = wa.erros != null ? ` ┬À ${wa.erros} erros` : '';
        worstLabel = `${retro.areaIcons[wa.disc]} ${retro.areaNames[wa.disc]}${pctStr}${errStr}`;
    }

    // Tempo: indicar se ├® real ou estimado
    const hasRealTime = (state.quizHistory || []).some(h => h.durationMinutes != null);
    const timePrefix  = hasRealTime ? '' : '~';

    const streakValue = state.user.streak || 0;

    // Erros por mat├®ria no m├¬s
    const wrongByDisc = retro.wrongByDisc || {};
    const discOrder = ['humanas', 'natureza', 'linguagens', 'matematica'];
    const wrongRowsHtml = discOrder
        .filter(d => wrongByDisc[d] > 0)
        .map(d => `<div class="retro-wrong-row">
            <span>${retro.areaIcons[d]} ${retro.areaNames[d]}</span>
            <span class="retro-wrong-count">${wrongByDisc[d]} erro${wrongByDisc[d] !== 1 ? 's' : ''}</span>
        </div>`).join('');

    wrap.innerHTML = `
        <div class="section-header">
            <span class="section-title">RETROSPECTIVA DO M├èS</span>
        </div>
        <div class="retro-card">
            <div class="retro-glow"></div>
            <div class="retro-header">
                <div class="retro-title-block">
                    <div class="retro-label">ENEM Master Wrapped Ô£¿</div>
                    <div class="retro-month">${monthLabel}</div>
                </div>
                <button class="retro-share-btn" onclick="shareRetro()">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Compartilhar
                </button>
            </div>
            <div class="retro-big-stats">
                <div class="retro-stat">
                    <span class="retro-stat-icon">­ƒôÜ</span>
                    <span class="retro-stat-value">${retro.totalQuestoes.toLocaleString('pt-BR')}</span>
                    <span class="retro-stat-label">Quest├Áes</span>
                </div>
                <div class="retro-stat">
                    <span class="retro-stat-icon">­ƒÄ»</span>
                    <span class="retro-stat-value">${retro.accuracy}%</span>
                    <span class="retro-stat-label">Taxa de acerto</span>
                </div>
                <div class="retro-stat">
                    <span class="retro-stat-icon">ÔÜí</span>
                    <span class="retro-stat-value">${retro.totalXP.toLocaleString('pt-BR')}</span>
                    <span class="retro-stat-label">XP ganho</span>
                </div>
                <div class="retro-stat">
                    <span class="retro-stat-icon">­ƒôà</span>
                    <span class="retro-stat-value">${retro.uniqueDays}</span>
                    <span class="retro-stat-label">Dias estudados</span>
                </div>
            </div>
            <div class="retro-highlights">
                ${bestLabel !== 'ÔÇö' ? `
                <div class="retro-highlight-row">
                    <div class="retro-highlight-left"><span class="retro-hl-icon">­ƒÅå</span><span class="retro-hl-text">Melhor mat├®ria</span></div>
                    <span class="retro-hl-value">${bestLabel}</span>
                </div>` : ''}
                ${worstLabel ? `
                <div class="retro-highlight-row">
                    <div class="retro-highlight-left"><span class="retro-hl-icon">ÔÜö´©Å</span><span class="retro-hl-text">Focar mais em</span></div>
                    <span class="retro-hl-value">${worstLabel}</span>
                </div>` : ''}
                <div class="retro-highlight-row">
                    <div class="retro-highlight-left"><span class="retro-hl-icon">­ƒòÉ</span><span class="retro-hl-text">Tempo de estudo</span></div>
                    <span class="retro-hl-value">${timePrefix}${retro.studyHours}</span>
                </div>
                <div class="retro-highlight-row">
                    <div class="retro-highlight-left"><span class="retro-hl-icon">­ƒôï</span><span class="retro-hl-text">Simulados feitos</span></div>
                    <span class="retro-hl-value">${retro.simulados} ${retro.simulados === 1 ? 'simulado' : 'simulados'}</span>
                </div>
                ${wrongRowsHtml ? `<div class="retro-wrong-section">${wrongRowsHtml}</div>` : ''}
                <div class="retro-streak-pill">
                    ­ƒöÑ Sequ├¬ncia atual: <strong>${streakValue} dia${streakValue !== 1 ? 's' : ''}</strong>
                </div>
            </div>
        </div>`;
}

function shareRetro() {
    const now = new Date();
    let month = now.getMonth();
    let year  = now.getFullYear();
    let retro = computeMonthlyRetro(month, year);
    if (!retro) {
        month = month === 0 ? 11 : month - 1;
        year  = (month === 11 && now.getMonth() === 0) ? year - 1 : year;
        retro = computeMonthlyRetro(month, year);
    }
    if (!retro) {
        _showQuickToast('Nenhum dado para compartilhar ainda!');
        return;
    }

    const MONTH_NAMES = ['Janeiro','Fevereiro','Mar├ºo','Abril','Maio','Junho',
                         'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const bestLabel = retro.bestArea
        ? `${retro.areaNames[retro.bestArea.disc]} (${retro.bestArea.pct}%)`
        : 'ÔÇö';

    const text = [
        `­ƒÄô Meu ENEM Master Wrapped ÔÇö ${MONTH_NAMES[month]} ${year}`,
        ``,
        `­ƒôÜ ${retro.totalQuestoes} quest├Áes respondidas`,
        `­ƒÄ» ${retro.accuracy}% de taxa de acerto`,
        `ÔÜí ${retro.totalXP.toLocaleString('pt-BR')} XP ganho`,
        `­ƒôà ${retro.uniqueDays} dias estudados`,
        `­ƒòÉ ~${retro.studyHours} de estudo estimado`,
        `­ƒöÑ Sequ├¬ncia atual: ${state.user.streak || 0} dias`,
        `­ƒÅå Melhor em: ${bestLabel}`,
        ``,
        `­ƒô▓ #ENEMMaster`,
    ].join('\n');

    if (navigator.share) {
        navigator.share({ title: 'ENEM Master Wrapped', text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text)
            .then(() => _showQuickToast('Copiado! Cole no WhatsApp ou Instagram ­ƒÄë'))
            .catch(() => _showQuickToast('N├úo foi poss├¡vel copiar. Tente novamente.'));
    }
}

function renderRecentActivity() {
    const scroll = document.querySelector('.recent-badges-scroll');
    if (!scroll) return;

    const history = (state.quizHistory || []).slice(-6).reverse();
    if (history.length === 0) return;

    scroll.innerHTML = '';
    const discColors = {
        humanas: 'teal-bg', natureza: 'purple-bg', linguagens: 'gold-bg', matematica: 'teal-bg', misto: 'purple-bg'
    };
    const discIcons = { humanas: '­ƒîì', natureza: '­ƒö¼', linguagens: '­ƒôØ', matematica: 'Ô×ù', misto: '­ƒÄ»' };
    const discNames = { humanas: 'HUMANAS', natureza: 'NATUREZA', linguagens: 'LINGUAGENS', matematica: 'MATEM├üTICA', misto: 'MISTO' };

    history.forEach(h => {
        const badge = document.createElement('div');
        badge.className = `recent-badge ${discColors[h.discipline] || 'teal-bg'}`;
        badge.innerHTML = `
            <div class="rb-icon">${discIcons[h.discipline] || '­ƒÄ»'}</div>
            <span>${h.pct}% ÔÇö ${discNames[h.discipline] || h.discipline.toUpperCase()}</span>
        `;
        scroll.appendChild(badge);
    });
}

