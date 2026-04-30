// =====================================================
// PLANO DE ESTUDOS PERSONALIZADO
// =====================================================

const SP_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const SP_MINUTES_OPTIONS = [0, 15, 30, 45, 60, 90, 120];

const SP_DISC_NAMES = {
    humanas:    'Ciências Humanas',
    natureza:   'Ciências da Natureza',
    linguagens: 'Linguagens',
    matematica: 'Matemática',
};
const SP_DISC_ICONS = { humanas:'🌍', natureza:'🔬', linguagens:'📝', matematica:'➗' };

function renderStudyPlan() {
    _renderSPCountdown();
    _renderSPDayGrid();
    _renderSPGoalHint();
    _renderSPPlanPreview();
}

function _renderSPCountdown() {
    const bar = document.getElementById('sp-countdown-bar');
    if (!bar) return;
    const ENEM = new Date('2026-11-08');
    const days = Math.max(0, Math.ceil((ENEM - new Date()) / (1000 * 60 * 60 * 24)));
    bar.innerHTML = `<span class="sp-cd-num">${days}</span><span class="sp-cd-label"> dias para o ENEM</span>`;
}

function _renderSPDayGrid() {
    const grid = document.getElementById('sp-day-grid');
    if (!grid) return;
    const plan = state.user.studyPlan || {};
    const mins = plan.minutesPerDay || [30, 30, 30, 30, 30, 15];

    grid.innerHTML = SP_DAYS.map((day, i) => `
        <div class="sp-day-row">
            <span class="sp-day-name">${day}</span>
            <div class="sp-min-btns" data-day="${i}">
                ${SP_MINUTES_OPTIONS.map(m =>
                    `<button class="sp-min-btn${mins[i] === m ? ' active' : ''}" data-min="${m}" onclick="spSetMinutes(${i},${m})">${m === 0 ? 'Off' : m + 'min'}</button>`
                ).join('')}
            </div>
        </div>`
    ).join('');
}

function spSetMinutes(dayIdx, minutes) {
    if (!state.user.studyPlan) state.user.studyPlan = {};
    if (!state.user.studyPlan.minutesPerDay) state.user.studyPlan.minutesPerDay = [30, 30, 30, 30, 30, 15];
    state.user.studyPlan.minutesPerDay[dayIdx] = minutes;

    const row = document.querySelector(`.sp-min-btns[data-day="${dayIdx}"]`);
    if (row) row.querySelectorAll('.sp-min-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.min) === minutes);
    });

    _renderSPPlanPreview();
}

function spUpdateGoal(val) {
    const label = document.getElementById('sp-goal-label');
    if (label) label.textContent = val;
    if (!state.user.studyPlan) state.user.studyPlan = {};
    state.user.studyPlan.goalScore = parseInt(val);
    _renderSPGoalHint();
    _renderSPPlanPreview();
}

function _renderSPGoalHint() {
    const hint = document.getElementById('sp-goal-hint');
    const slider = document.getElementById('sp-goal-slider');
    if (!hint || !slider) return;
    const goal = parseInt(slider.value);
    const current = typeof _calcENEMScore !== 'undefined' ? _calcENEMScore() : null;

    if (current) {
        const diff = goal - current;
        if (diff <= 0) hint.textContent = 'Você já está na meta com base no seu desempenho atual!';
        else hint.textContent = `+${diff} pontos a ganhar. Foco nos seus pontos fracos vai acelerar isso.`;
    } else {
        hint.textContent = 'Complete mais questões para ver sua estimativa atual.';
    }
}

function _renderSPPlanPreview() {
    const preview = document.getElementById('sp-plan-preview');
    if (!preview) return;

    const plan = state.user.studyPlan || {};
    const mins = plan.minutesPerDay || [30, 30, 30, 30, 30, 15];
    const totalWeekMins = mins.reduce((s, m) => s + m, 0);

    if (totalWeekMins === 0) {
        preview.innerHTML = '<p class="sp-empty">Selecione pelo menos um dia com minutos de estudo.</p>';
        return;
    }

    // Priorizar disciplinas por desempenho (mais fraca = mais tempo)
    const stats = (state.progress && state.progress.stats) || {};
    const discs = ['humanas', 'natureza', 'linguagens', 'matematica'];

    const scored = discs.map(d => {
        const s = stats[d] || { correct: 0, total: 0 };
        const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 50;
        return { disc: d, pct };
    }).sort((a, b) => a.pct - b.pct);

    // Distribuir por peso inverso: menor acerto = mais peso
    const weights = scored.map((s, i) => 4 - i);
    const totalW = weights.reduce((a, b) => a + b, 0);

    const ENEM = new Date('2026-11-08');
    const daysLeft = Math.max(1, Math.ceil((ENEM - new Date()) / (1000 * 60 * 60 * 24)));
    const activeWeekDays = mins.filter(m => m > 0).length;
    const weeksLeft = Math.ceil(daysLeft / 7);
    const totalStudyHours = Math.round((totalWeekMins * weeksLeft) / 60);

    const rows = scored.map((s, i) => {
        const sharePct = Math.round((weights[i] / totalW) * 100);
        const weeklyMins = Math.round((totalWeekMins * weights[i]) / totalW);
        const icon = SP_DISC_ICONS[s.disc];
        const name = SP_DISC_NAMES[s.disc];
        const barW = sharePct;
        return `
        <div class="sp-preview-row">
            <div class="sp-preview-left">
                <span class="sp-preview-icon">${icon}</span>
                <div>
                    <p class="sp-preview-name">${name}</p>
                    <p class="sp-preview-sub">${weeklyMins}min/semana · ${sharePct}% do plano${s.pct < 50 ? ' · Prioridade alta' : ''}</p>
                </div>
            </div>
            <div class="sp-preview-bar-wrap"><div class="sp-preview-bar" style="width:${barW}%"></div></div>
        </div>`;
    }).join('');

    preview.innerHTML = `
        <div class="settings-section" style="margin-top:4px">
            <div class="settings-section-title">• Seu plano gerado</div>
            <div class="sp-summary-chips">
                <span class="sp-chip">📅 ${activeWeekDays} dias/semana</span>
                <span class="sp-chip">⏱ ${totalWeekMins}min/semana</span>
                <span class="sp-chip">📚 ~${totalStudyHours}h até o ENEM</span>
            </div>
            ${rows}
        </div>`;
}

function saveStudyPlan() {
    if (!state.user.studyPlan) state.user.studyPlan = {};
    const slider = document.getElementById('sp-goal-slider');
    if (slider) state.user.studyPlan.goalScore = parseInt(slider.value);
    saveState();

    if (typeof saveUserData !== 'undefined' && state.user.id) {
        saveUserData(state.user.id).catch(() => {});
    }

    _showQuickToast('✅ Plano de estudos salvo!');
    navigate('home');
}
