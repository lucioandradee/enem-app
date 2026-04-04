// =====================================================
// QUIZ SETUP
// =====================================================
let quizSetup = { discipline: 'misto', count: 10, topic: null };

function renderQuizSetup() {
    _renderPausedQuizBanner('setup');
    // Restore selections
    const plan = getUserPlan();
    document.querySelectorAll('.disc-card').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.disc === quizSetup.discipline);
    });
    document.querySelectorAll('.count-btn').forEach(btn => {
        const btnCount = parseInt(btn.dataset.count);
        const locked = btnCount > plan.maxQuizSize;
        btn.classList.toggle('selected', btnCount === quizSetup.count && !locked);
        btn.classList.toggle('count-locked', locked);
        btn.innerHTML = locked ? `${btnCount} 🔒` : String(btnCount);
    });

    // Renderizar filtro de tópico
    renderTopicFilter();

    // Banner de limite diário — só para usuários do plano Grátis
    const remaining = getRemainingQuestions();
    const limitEl = document.getElementById('quiz-plan-limit');
    if (limitEl) {
        if (!isPremium()) {
            if (remaining <= 0) {
                limitEl.innerHTML = '🔒 Limite diário atingido — <button class="link-inline" onclick="navigate(\'plans\')">Assinar Premium</button>';
                limitEl.className = 'quiz-limit-banner limit-reached';
            } else {
                const word = remaining === 1 ? 'questão restante' : 'questões restantes';
                limitEl.textContent = `⚡ Plano Grátis: ${remaining} ${word} hoje`;
                limitEl.className = 'quiz-limit-banner limit-ok' + (remaining <= 3 ? ' limit-low' : '');
            }
            limitEl.style.display = '';
        } else {
            limitEl.style.display = 'none';
        }
    }

    // Desabilitar botão de início se o usuário atingiu o limite
    const startBtn = document.getElementById('start-quiz-btn');
    if (startBtn) startBtn.disabled = !isPremium() && remaining <= 0;

    // Check API status
    checkAPIAvailability();
}

function selectDisc(btn) {
    document.querySelectorAll('.disc-card').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    quizSetup.discipline = btn.dataset.disc;
    quizSetup.topic = null;
    renderTopicFilter();
}

function selectCount(btn) {
    const count = parseInt(btn.dataset.count);
    if (!planHas('largeQuiz') && count > getUserPlan().maxQuizSize) {
        showFeaturePaywall('largeQuiz');
        return;
    }
    document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    quizSetup.count = count;
}

async function checkAPIAvailability() {
    const subEl = document.getElementById('api-source-sub');
    const statusEl = document.getElementById('api-source-status');
    if (!subEl) return;

    subEl.textContent = 'Verificando...';
    statusEl.textContent = '⏳';

    try {
        const status = await window.enemAPI.checkAPIStatus();
        if (status.ok) {
            subEl.textContent = `ENEM ${status.latestYear} disponível — ${status.totalYears} anos de provas`;
            statusEl.textContent = '✅';
        } else {
            subEl.textContent = 'API offline — usando banco local';
            statusEl.textContent = '⚠️';
        }
    } catch {
        subEl.textContent = 'Sem conexão — usando banco local';
        statusEl.textContent = '⚠️';
    }
}

// ---- Modo ENEM: Dia 1 — Linguagens (Q.1–45) + Humanas (Q.46–90) ----
function toggleENEMBanner() {
    const body = document.getElementById('enem-banner-body');
    const chevron = document.getElementById('enem-banner-chevron');
    const header = document.querySelector('.enem-banner-toggle');
    if (!body) return;
    const isOpen = body.classList.toggle('open');
    if (chevron) chevron.classList.toggle('open', isOpen);
    if (header) header.setAttribute('aria-expanded', isOpen);
}

async function startENEMMode(day = 1) {
    const btnId = day === 2 ? 'enem-mode-btn-2' : 'enem-mode-btn';
    const btnLabel = day === 2 ? '🎯 Iniciar 2° Dia de Prova' : '🎯 Iniciar 1° Dia de Prova';
    const lockedLabel = '🔒 Premium';
    const btn = document.getElementById(btnId);
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Verificando...'; }

    // Validação server-side do plano: recarrega do Supabase antes de liberar recurso Premium
    if (state.user.id && typeof loadUserPlan !== 'undefined') {
        await loadUserPlan(state.user.id).catch(() => {});
    }

    if (!planHas('enemMode')) {
        if (btn) { btn.disabled = false; btn.textContent = lockedLabel; }
        showFeaturePaywall('enemMode');
        return;
    }

    if (btn) { btn.textContent = '⏳ Carregando questões...'; }

    const ENEM_TIME = 5 * 60 * 60 + 30 * 60; // 19.800 s = 5h30min
    const discipline = day === 2 ? 'enem-dia2' : 'enem-dia1';
    await startQuiz(discipline, 90, false, ENEM_TIME);

    if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
}

async function initQuizFromSetup(forceLocal = false) {
    if (!quizSetup.discipline) {
        // Selecionar misto como padrão
        quizSetup.discipline = 'misto';
        document.querySelector('[data-disc="misto"]').classList.add('selected');
    }

    // Verificar e ATUALIZAR plano via Supabase antes de checar limite
    if (state.user.id && typeof loadUserPlan !== 'undefined') {
        await loadUserPlan(state.user.id).catch(() => {});
    }

    // Verificar limite do plano gratuito
    const remaining = getRemainingQuestions();
    if (!isPremium() && remaining <= 0) {
        showFeaturePaywall('dailyLimit');
        return;
    }

    // Limitar a quantidade de questões ao menor entre o pedido e o restante do plano
    const plan = getUserPlan();
    const allowedCount = Math.min(quizSetup.count, plan.maxQuizSize, remaining === Infinity ? quizSetup.count : remaining);

    const btn = document.getElementById('start-quiz-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Carregando...';

    await startQuiz(quizSetup.discipline, allowedCount, forceLocal);

    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5,3 19,12 5,21" /></svg> INICIAR SIMULADO';
}

// =====================================================
// QUIZ ENGINE
// =====================================================
async function startQuiz(discipline = 'misto', count = 10, forceLocal = false, customTime = null) {
    navigate('quiz');
    showQuizLoading(true);

    // Ao iniciar novo quiz, descartar qualquer pausa anterior
    _clearPausedQuiz();
    _renderPausedQuizBanner('home');
    _renderPausedQuizBanner('setup');

    const isENEMDay = discipline === 'enem-dia1' || discipline === 'enem-dia2';
    const enemDay = discipline === 'enem-dia2' ? 2 : 1;

    // Atualizar texto de loading
    const loadingSubEl = document.getElementById('loading-sub-text');
    if (loadingSubEl) {
        loadingSubEl.textContent = isENEMDay
            ? 'Montando cadernos do ENEM real... 🏛️'
            : customTime !== null
                ? 'Carregando questões do ENEM real... 🏛️'
                : 'Aguarde um momento 🎓';
    }

    let selectedQuestions = null;

    if (!forceLocal) {
        try {
            if (isENEMDay) {
                selectedQuestions = await window.enemAPI.getENEMDayQuestions(enemDay);
            } else {
                selectedQuestions = await window.enemAPI.getQuizQuestions(discipline, count);
            }
        } catch (e) {
            console.warn('API error:', e);
        }
    }

    // Fallback: banco local
    if (!selectedQuestions || selectedQuestions.length === 0) {
        const localDisc = isENEMDay ? 'misto' : discipline;
        const localCount = isENEMDay ? 90 : count;
        selectedQuestions = getLocalQuestions(localDisc, localCount);
        // Atribuir numeração ENEM ao fallback local
        if (isENEMDay) {
            const dayConfig = window.enemAPI.ENEM_DAY_CONFIG[enemDay];
            const half = Math.ceil(selectedQuestions.length / 2);
            selectedQuestions = selectedQuestions.map((q, i) => ({
                ...q,
                enemNumber: i < half ? dayConfig[0].start + i : dayConfig[1].start + (i - half),
                enemArea: i < half ? dayConfig[0].label : dayConfig[1].label,
            }));
        }
        console.log('📚 Usando banco local:', selectedQuestions.length, 'questões');
    } else {
        console.log('🌐 Questões API:', selectedQuestions.length);
    }

    quizState.questions = selectedQuestions;
    quizState.answers = [];
    quizState.currentIndex = 0;
    quizState.correct = 0;
    quizState.wrong = 0;
    quizState.selectedOption = null;
    quizState.confirmed = false;
    quizState.discipline = isENEMDay ? 'misto' : discipline;
    quizState.isENEMMode = isENEMDay || (customTime !== null);
    quizState.timeLeft  = customTime !== null ? customTime : Math.max(5 * 60, count * 75);
    quizState.totalTime = quizState.timeLeft;
    quizState.startTime = Date.now();

    showQuizLoading(false);
    renderQuestion();
    startTimer();
}

function showQuizLoading(show) {
    const overlay = document.getElementById('quiz-loading-overlay');
    if (overlay) overlay.classList.toggle('visible', show);
}

function exitQuiz() {
    stopTimer();
    navigate('home');
}

// Pegar questões do banco local filtradas por disciplina
function getLocalQuestions(discipline, count) {
    const bank = window.LOCAL_QUESTIONS || [];
    const discToArea = {
        humanas: 'CIÊNCIAS HUMANAS',
        natureza: 'CIÊNCIAS DA NATUREZA',
        linguagens: 'LINGUAGENS',
        matematica: 'MATEMÁTICA',
    };

    let pool;
    if (discipline === 'misto') {
        pool = bank;
    } else {
        const area = discToArea[discipline];
        pool = bank.filter(q => q.area === area);
        if (pool.length < 3) pool = bank; // fallback
    }

    // Deduplicação por sessão no banco local também
    const seenKey = 'enem_local_seen';
    let seen = [];
    try { seen = JSON.parse(sessionStorage.getItem(seenKey) || '[]'); } catch { seen = []; }

    const unseen = pool.filter((_, i) => !seen.includes(i));
    const source = unseen.length >= count ? unseen : pool;
    if (unseen.length < count) {
        try { sessionStorage.removeItem(seenKey); } catch { /* noop */ }
    }

    const shuffled = [...source].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // Marcar como vistas
    try {
        const newSeen = [...seen, ...selected.map(q => pool.indexOf(q))];
        sessionStorage.setItem(seenKey, JSON.stringify(newSeen));
    } catch { /* noop */ }

    // Normalizar formato (garantir campos que o renderQuestion espera)
    return selected.map(q => ({
        apiFormat: false,
        area: q.area,
        tag: q.tag,
        question: q.question,
        context: q.context || null,
        files: q.files || [],
        quote: q.quote || null,
        options: q.options,
        alternativeFiles: q.alternativeFiles || q.options.map(() => null),
        correct: q.correct,
        hint: q.hint || null,
        explanation: q.explanation || '',
    }));
}

function renderQuestion() {
    const q = quizState.questions[quizState.currentIndex];
    const total = quizState.questions.length;
    const idx = quizState.currentIndex;

    // Header: no modo ENEM exibe nome completo do caderno
    const areaLabel = document.getElementById('quiz-area-label');
    areaLabel.textContent = (quizState.isENEMMode && q.enemArea) ? q.enemArea : q.area;

    // Contador: no modo ENEM usa numeração oficial (01, 02…)
    const qCountEl = document.getElementById('quiz-q-count');
    if (quizState.isENEMMode && q.enemNumber != null) {
        const num = String(q.enemNumber).padStart(2, '0');
        qCountEl.textContent = `Questão ${num} de ${total}`;
    } else {
        qCountEl.textContent = `Questão ${idx + 1} de ${total}`;
    }
    document.getElementById('quiz-progress-bar').style.width = ((idx / total) * 100) + '%';

    // Banner de transição de caderno (ENEM mode)
    const cadernoBanner = document.getElementById('quiz-caderno-banner');
    const cadrLabel = document.getElementById('quiz-caderno-label');
    if (cadernoBanner && cadrLabel && quizState.isENEMMode && q.enemArea) {
        const prevArea = idx > 0 ? quizState.questions[idx - 1]?.enemArea : null;
        const isNewCaderno = idx === 0 || prevArea !== q.enemArea;
        if (isNewCaderno) {
            const cadrNum = idx === 0 ? 1 : 2;
            cadrLabel.textContent = `CADERNO ${cadrNum} · ${q.enemArea}`;
            cadernoBanner.style.display = 'flex';
        } else {
            cadernoBanner.style.display = 'none';
        }
    } else if (cadernoBanner) {
        cadernoBanner.style.display = 'none';
    }

    // Source badge
    const sourceBadge = document.getElementById('quiz-source-badge');
    if (sourceBadge) {
        if (q.apiFormat) {
            sourceBadge.textContent = q.tag || 'API ENEM';
            sourceBadge.className = 'quiz-source-badge';
            sourceBadge.style.display = 'inline';
        } else {
            sourceBadge.style.display = 'none';
        }
    }

    // Tag
    document.getElementById('quiz-tag').textContent = q.tag || q.area;

    // Context images (API questions)
    const imgsEl = document.getElementById('quiz-context-images');
    if (imgsEl) {
        imgsEl.innerHTML = '';
        if (q.files && q.files.length > 0) {
            q.files.forEach(src => {
                const img = document.createElement('img');
                img.className = 'quiz-context-img';
                img.src = src;
                img.alt = 'Imagem da questão';
                img.loading = 'lazy';
                img.onerror = () => { img.style.display = 'none'; };
                imgsEl.appendChild(img);
            });
        }
    }

    // Context text (API) or classic quote (local)
    const contextEl = document.getElementById('quiz-context');
    if (contextEl) {
        if (q.context) {
            contextEl.innerHTML = _safeHTML(renderMarkdown(q.context));
            contextEl.style.display = '';
        } else {
            contextEl.style.display = 'none';
            contextEl.innerHTML = '';
        }
    }

    // Question text
    document.getElementById('quiz-question').textContent = q.question;

    // Classic quote (local questions)
    const quoteEl = document.getElementById('quiz-quote');
    quoteEl.textContent = q.quote || '';

    // Options
    const optionsEl = document.getElementById('quiz-options');
    optionsEl.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E'];
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';

        // Usar DOM API em vez de innerHTML para evitar XSS em texto de alternativas
        const letterSpan = document.createElement('span');
        letterSpan.className = 'option-letter';
        letterSpan.textContent = letters[i];
        btn.appendChild(letterSpan);

        const textSpan = document.createElement('span');
        textSpan.className = 'option-text';
        textSpan.textContent = opt; // textContent = imune a XSS
        btn.appendChild(textSpan);

        // Alternative image (API) — src já validado com startsWith('http') em normalizeQuestion
        if (q.alternativeFiles && q.alternativeFiles[i]) {
            const altSrc = q.alternativeFiles[i];
            const altImg = document.createElement('img');
            altImg.className = 'option-img';
            altImg.src = altSrc;
            altImg.alt = `Alternativa ${letters[i]}`;
            altImg.loading = 'lazy';
            altImg.onerror = () => { altImg.style.display = 'none'; };
            btn.appendChild(altImg);
        }

        btn.onclick = () => selectOption(i);
        optionsEl.appendChild(btn);
    });

    // Reset state
    quizState.selectedOption = null;
    quizState.confirmed = false;
    document.getElementById('confirm-btn').textContent = 'Confirmar Resposta →';
    document.getElementById('confirm-btn').disabled = false;
    document.getElementById('quiz-footer-hint').textContent = 'SELECIONE UMA ALTERNATIVA';
    document.getElementById('hint-box').style.display = 'none';
    document.getElementById('hint-btn').style.display = '';
    const _gb = document.getElementById('gabarito-box');
    if (_gb) { _gb.style.display = 'none'; _gb.innerHTML = ''; }
}

// Markdown simples (bold, italic, quebras)
function renderMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

// Sanitiza HTML antes de atribuir via innerHTML — previne XSS
function _safeHTML(html) {
    if (typeof DOMPurify !== 'undefined') return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    // Fallback sem DOMPurify: escapa entidades perigosas e remove tags não permitidas
    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function selectOption(index) {
    if (quizState.confirmed) return;
    quizState.selectedOption = index;

    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
        btn.classList.toggle('selected', i === index);
    });
    document.getElementById('quiz-footer-hint').textContent = 'PRESSIONE PARA CONFIRMAR';
}

function confirmAnswer() {
    if (quizState.selectedOption === null) {
        document.getElementById('quiz-footer-hint').textContent = '⚠️ SELECIONE UMA ALTERNATIVA PRIMEIRO';
        return;
    }
    if (quizState.confirmed) {
        nextQuestion();
        return;
    }

    quizState.confirmed = true;
    const q = quizState.questions[quizState.currentIndex];
    const selected = quizState.selectedOption;
    const isCorrect = selected === q.correct;
    quizState.answers[quizState.currentIndex] = selected;

    // Mapear questão para chave de stats
    const _areaToDisc = {
        'CIÊNCIAS HUMANAS': 'humanas', 'CIÊNCIAS DA NATUREZA': 'natureza',
        'LINGUAGENS': 'linguagens', 'MATEMÁTICA': 'matematica',
    };
    const _discApiMap = {
        'ciencias-humanas': 'humanas', 'ciencias-natureza': 'natureza',
        'linguagens': 'linguagens', 'matematica': 'matematica',
    };
    const discKey = (q.discipline ? _discApiMap[q.discipline] : _areaToDisc[q.area]) || null;

    // Atualizar stats por disciplina (usado nos gráficos e nas conquistas)
    if (discKey && state.progress.stats?.[discKey]) {
        state.progress.stats[discKey].total++;
        if (isCorrect) state.progress.stats[discKey].correct++;
    }

    if (isCorrect) {
        quizState.correct++;
        quizState.combo++;
        if (quizState.combo > quizState.maxCombo) quizState.maxCombo = quizState.combo;

        // Bônus XP por combo (acertos consecutivos)
        let comboBonus = 0;
        if (quizState.combo >= 5) comboBonus = 5;       // +5 XP a partir do 5º acerto seguido
        else if (quizState.combo >= 3) comboBonus = 2;  // +2 XP a partir do 3º
        quizState.bonusXp += comboBonus;

        // XP é acumulado uma única vez em showResult(), junto com o total do simulado
        if (!state.progress.totalCorretas) state.progress.totalCorretas = 0;
        state.progress.totalCorretas++;
    } else {
        quizState.combo = 0; // quebra o combo
        quizState.wrong++;
        // Salvar erro para revisão posterior
        if (!state.wrongAnswers) state.wrongAnswers = [];
        state.wrongAnswers.push({
            question: q,
            userAnswer: selected,
            correctAnswer: q.correct,
            date: new Date().toISOString(),
        });
    }
    saveState();

    // Registrar resposta no backend via RPC segura (sem insert direto em question_attempts)
    if (typeof answerQuestionSecure !== 'undefined' && typeof getCurrentUser !== 'undefined') {
        const _qId = q.year ? `${q.year}-${q.index}` : null;
        getCurrentUser().then(user => {
            if (!user) return;
            answerQuestionSecure(user.id, _qId, isCorrect).then(res => {
                if (!res.success && res.errorCode === 'DAILY_LIMIT') {
                    // Limite atingido — impedir prosseguimento
                    stopTimer();
                    if (typeof showPaywall !== 'undefined' && typeof PAYWALL_MESSAGES !== 'undefined') {
                        showPaywall(PAYWALL_MESSAGES.dailyLimit.title, PAYWALL_MESSAGES.dailyLimit.body);
                    }
                }
            }).catch(() => {});
        }).catch(() => {});
    }

    // Visual feedback
    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
        if (i === q.correct) btn.classList.add('correct');
        else if (i === selected && !isCorrect) btn.classList.add('wrong');
    });

    // Esconder hint simples e mostrar gabarito comentado
    document.getElementById('hint-box').style.display = 'none';
    document.getElementById('hint-btn').style.display = 'none';
    _showGabarito(q, selected);

    const confirmBtn = document.getElementById('confirm-btn');
    const isLast = quizState.currentIndex === quizState.questions.length - 1;
    confirmBtn.textContent = isLast ? 'Ver Resultado →' : 'Próxima Questão →';

    // Feedback de combo no hint
    if (isCorrect && quizState.combo >= 3) {
        const comboMsgs = { 3: '🔥 COMBO x3!', 4: '⚡ COMBO x4!', 5: '💥 COMBO x5! +5 XP Bônus!' };
        const msg = comboMsgs[quizState.combo] || `🌟 COMBO x${quizState.combo}! +5 XP Bônus!`;
        document.getElementById('quiz-footer-hint').textContent = msg;
    } else {
        document.getElementById('quiz-footer-hint').textContent = isCorrect ? '🎉 MUITO BEM!' : '📖 REVISE O CONCEITO';
    }
}

function nextQuestion() {
    if (quizState.currentIndex < quizState.questions.length - 1) {
        quizState.currentIndex++;
        renderQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    stopTimer();
    _clearPausedQuiz(); // quiz concluído, não há nada para retomar
    const total = quizState.questions.length;
    const correct = quizState.correct;
    const pct = Math.round((correct / total) * 100);

    // Bônus XP de streak diário (1 XP por dia de ofensiva, máximo 50)
    const streakBonus = Math.min(state.user.streak || 0, 50);
    quizState.bonusXp += streakBonus;

    const xpGained = (correct * 10) + quizState.bonusXp;

    // Atualizar XP uma única vez aqui (fonte de verdade)
    state.user.xp += xpGained;

    // Registrar limite diário do plano gratuito (fonte de verdade para questoesHoje)
    registerQuestionsUsed(total);

    // Calcular nível: 1 level por 500 XP
    state.user.level = Math.max(1, Math.floor(state.user.xp / 500) + 1);

    // Salvar no histórico
    if (!state.quizHistory) state.quizHistory = [];
    state.quizHistory.push({
        date: new Date().toISOString(),
        discipline: quizState.discipline || 'misto',
        correct,
        total,
        pct,
        xp: xpGained,
        maxCombo: quizState.maxCombo,
        durationMinutes: quizState.startTime
            ? Math.max(1, Math.round((Date.now() - quizState.startTime) / 60000))
            : Math.round(total * 1.5),
    });

    // Atualizar streak (verificar se já estudou hoje)
    updateStreak();

    // Verificar conclusão do desafio diário
    _checkDailyChallengeCompletion();

    saveState();

    // Sincronizar progresso E perfil (XP, level, streak) com Supabase em background
    if (typeof getCurrentUser !== 'undefined') {
        getCurrentUser().then(user => {
            if (user) {
                // Salvar progresso do simulado
                saveProgress(user.id, quizState.discipline || 'misto', total, correct, {
                    xpGained: xpGained,
                    maxCombo: quizState.maxCombo,
                }).catch(() => {});
                // Salvar XP e level atualizados
                saveUserData(user.id).catch(() => {});
                // Rastrear evento analítico
                if (typeof trackEvent !== 'undefined') {
                    trackEvent('quiz_completed', {
                        discipline: quizState.discipline || 'misto',
                        correct,
                        total,
                        pct,
                        xp_gained: xpGained,
                    }).catch(() => {});
                }
            }
        }).catch(() => {});
    }

    // Renderizar tela de resultado
    document.getElementById('result-emoji').textContent = pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚';
    document.getElementById('result-title').textContent = pct >= 70 ? 'Excelente Resultado!' : pct >= 50 ? 'Bom Trabalho!' : 'Continue Praticando!';
    document.getElementById('result-sub').textContent = `Você acertou ${correct} de ${total} questões`;
    document.getElementById('result-pct').textContent = pct + '%';
    document.getElementById('res-correct').textContent = correct;
    document.getElementById('res-wrong').textContent = quizState.wrong;
    document.getElementById('res-xp').textContent = '+' + xpGained;

    // Detalhe de bonus XP na tela de resultado
    const bonusRow = document.getElementById('res-xp-bonus-row');
    const bonusEl = document.getElementById('res-xp-bonus');
    if (bonusEl && bonusRow) {
        if (quizState.bonusXp > 0) {
            const parts = [];
            if (quizState.maxCombo >= 3) parts.push(`Combo x${quizState.maxCombo}`);
            if (Math.min(state.user.streak || 0, 50) > 0) parts.push(`Streak ${state.user.streak}d`);
            bonusEl.textContent = `+${quizState.bonusXp} bônus (${parts.join(' + ')})`;
            bonusRow.style.display = '';
        } else {
            bonusRow.style.display = 'none';
        }
    }

    // Colorir o anel pelo desempenho
    const ring = document.getElementById('result-ring');
    ring.setAttribute('stroke', pct >= 70 ? '#00b4a6' : pct >= 50 ? '#f5c518' : '#ef4444');
    const circumference = 314;
    const offset = circumference - (circumference * pct / 100);
    ring.setAttribute('stroke-dashoffset', offset);

    // Análise por área + recomendações
    renderResultAnalysis(quizState.questions, quizState.correct);

    navigate('result');

    // Verificar conquistas DEPOIS de navegar
    setTimeout(() => checkBadges(), 800);
}

/* ---- Análise de desempenho pós-quiz ---- */
function renderResultAnalysis(questions, totalCorrect) {
    const analysisEl = document.getElementById('result-analysis');
    if (!analysisEl) return;

    // Agrupar acertos/erros por área
    const byArea = {};
    questions.forEach((q, i) => {
        const area = q.area || 'Geral';
        if (!byArea[area]) byArea[area] = { correct: 0, total: 0 };
        byArea[area].total++;
        // Obtemos o resultado de cada questão através do histórico do quizState
        if (quizState.answers && quizState.answers[i] !== undefined) {
            if (quizState.answers[i] === q.correct) byArea[area].correct++;
        }
    });

    const areas = Object.keys(byArea);

    // Só exibir breakdown se foi simulado misto (múltiplas áreas) ou se temos dados de acerto por questão
    const breakdownEl = document.getElementById('result-breakdown');
    if (breakdownEl && areas.length > 0) {
        breakdownEl.innerHTML = '';
        const areaIcons = {
            'CIÊNCIAS HUMANAS': '🌍',
            'CIÊNCIAS DA NATUREZA': '🔬',
            'LINGUAGENS': '📝',
            'MATEMÁTICA': '➗',
        };
        areas.forEach(area => {
            const d = byArea[area];
            const p = d.total > 0 ? Math.round((d.correct / d.total) * 100) : null;
            const known = p !== null;
            const color = !known ? '#4a6a80' : p >= 70 ? '#00b4a6' : p >= 50 ? '#f5c518' : '#ef4444';
            const icon = areaIcons[area] || '📚';
            breakdownEl.insertAdjacentHTML('beforeend', `
                <div class="result-area-row">
                    <span class="result-area-icon">${icon}</span>
                    <div class="result-area-info">
                        <span class="result-area-name">${area}</span>
                        <div class="result-area-bar-wrap">
                            <div class="result-area-bar" style="width:${known ? p : 0}%;background:${color}"></div>
                        </div>
                    </div>
                    <span class="result-area-pct" style="color:${color}">${known ? p + '%' : d.total + 'q'}</span>
                </div>`);
        });
    }

    // Estimativa TRI aprimorada com curva sigmoide e peso por dificuldade
    // Substitui a f\u00f3rmula quadr\u00e1tica simples por uma estimativa mais fiel ao ENEM
    const triEl = document.getElementById('result-tri-score');
    const triDescEl = document.getElementById('result-tri-desc');
    const triCardEl = document.getElementById('result-tri-card');
    if (triEl && questions.length >= 5) {
        const nota = _calcTRIScore(questions, quizState.answers);
        if (nota !== null) {
            const triMsg = nota >= 850 ? 'Excelente! Dentro da faixa de aprova\u00e7\u00e3o nas melhores federais.' :
                           nota >= 700 ? 'Bom! Na faixa de aprova\u00e7\u00e3o em muitos cursos.' :
                           nota >= 550 ? 'Regular. Foque nos pontos fracos para subir.' :
                                        'Abaixo da m\u00e9dia. Mais pr\u00e1tica far\u00e1 diferen\u00e7a!';
            triEl.textContent = nota.toLocaleString('pt-BR');
            triDescEl.textContent = triMsg;
            if (triCardEl) triCardEl.style.display = '';
        } else if (triCardEl) {
            triCardEl.style.display = 'none';
        }
    } else if (triCardEl) {
        triCardEl.style.display = 'none';
    }

    // Recomendações personalizadas via Agente de Recomendação
    const recsEl = document.getElementById('result-recommendations');
    if (recsEl) {
        recsEl.innerHTML = '';
        const totalQ = questions.length;
        const pctVal = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

        // Usar agente de recomendação para top 3 áreas fracas
        const agentRecs = _getRecommendationAgent();
        const recs = agentRecs.map(r => ({
            icon: r.icon,
            text: `${r.area}: ${r.topic}`,
            subtext: r.reason,
            disc: r.disc,
        }));

        // Adicionar recomendação contextual baseada no resultado desta sessão
        if (pctVal < 50) {
            recs.unshift({ icon: '📖', text: 'Revise o gabarito desta sessão', subtext: 'Entender o erro vale mais que refazer', disc: null, action: 'review' });
        } else if (pctVal >= 70) {
            recs.push({ icon: '🚀', text: 'Tente um simulado mais longo', subtext: 'Você está acima da média — avance!', disc: 'misto' });
        }

        // Botão "Refazer erros"
        const mistakeCount = quizState.questions
            ? quizState.questions.filter((q, i) => quizState.answers[i] !== undefined && quizState.answers[i] !== q.correct).length
            : 0;
        if (mistakeCount > 0) {
            recs.splice(1, 0, { icon: '🔁', text: `Refazer os ${mistakeCount} erros desta sessão`, subtext: 'Repetição espaçada reforça a memória', action: 'retry' });
        }

        // Renderizar cards via DOM API
        recs.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'result-rec-card';

            const iconEl = document.createElement('span');
            iconEl.className = 'rec-icon';
            iconEl.textContent = rec.icon;

            const bodyEl = document.createElement('div');
            bodyEl.style.flex = '1';

            const textEl = document.createElement('p');
            textEl.className = 'rec-text';
            textEl.textContent = rec.text;

            const subEl = document.createElement('p');
            subEl.className = 'rec-subtext';
            subEl.style.cssText = 'font-size:11px;color:var(--text-muted);margin:2px 0 0';
            subEl.textContent = rec.subtext || '';

            bodyEl.appendChild(textEl);
            if (rec.subtext) bodyEl.appendChild(subEl);

            const actionBtn = document.createElement('button');
            actionBtn.className = 'rec-action-btn';

            if (rec.action === 'retry') {
                actionBtn.textContent = 'Refazer →';
                actionBtn.addEventListener('click', retryMistakes);
            } else if (rec.action === 'review') {
                actionBtn.textContent = 'Ver erros →';
                actionBtn.addEventListener('click', () => navigate('review'));
            } else if (rec.disc) {
                actionBtn.textContent = 'Praticar →';
                actionBtn.addEventListener('click', () => navigate('quiz-setup'));
            } else {
                actionBtn.style.display = 'none';
            }

            card.appendChild(iconEl);
            card.appendChild(bodyEl);
            card.appendChild(actionBtn);
            recsEl.appendChild(card);
        });
    }

    // Mostrar botão "Refazer erros" se tiver erros na sessão
    const retryWrap = document.getElementById('retry-mistakes-wrap');
    if (retryWrap) {
        const hasErrors = quizState.questions
            ? quizState.questions.some((q, i) => quizState.answers[i] !== undefined && quizState.answers[i] !== q.correct)
            : false;
        retryWrap.style.display = hasErrors ? '' : 'none';
    }

    analysisEl.style.display = '';
}

/* ---- Refazer apenas os erros desta sessão ---- */
function retryMistakes() {
    if (!quizState.questions || quizState.questions.length === 0) return;
    const mistakeQs = quizState.questions.filter(
        (q, i) => quizState.answers[i] !== undefined && quizState.answers[i] !== q.correct
    );
    if (mistakeQs.length === 0) return;

    // Reset quizState mantendo as mesmas questões erradas
    quizState.questions    = mistakeQs;
    quizState.answers      = [];
    quizState.currentIndex = 0;
    quizState.correct      = 0;
    quizState.wrong        = 0;
    quizState.combo        = 0;
    quizState.maxCombo     = 0;
    quizState.bonusXp      = 0;
    quizState.selectedOption = null;
    quizState.confirmed    = false;
    quizState.timeLeft     = Math.max(3 * 60, mistakeQs.length * 75);
    quizState.totalTime    = quizState.timeLeft;

    navigate('quiz');
    renderQuestion();
    startTimer();
}

/* ---- Compartilhar resultado ---- */
function shareResult() {
    const pct = document.getElementById('result-pct').textContent;
    const correct = document.getElementById('res-correct').textContent;
    const wrong = document.getElementById('res-wrong').textContent;
    const total = parseInt(correct) + parseInt(wrong);
    const triScore = document.getElementById('result-tri-score')?.textContent;
    const triPart = triScore && triScore !== '—' ? `\n🎯 Estimativa ENEM: ${triScore} pts` : '';
    const text = `Acabei de fazer um simulado no ENEM Master! 🎓\n\n✅ ${correct}/${total} questões corretas (${pct})${triPart}\n\n📲 Baixe grátis: enemmaster.com.br`;

    if (navigator.share) {
        navigator.share({ title: 'Meu Resultado — ENEM Master', text }).catch(() => copyToClipboard(text));
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('result-share-btn');
        if (btn) {
            const orig = btn.innerHTML;
            btn.textContent = '✅ Copiado!';
            setTimeout(() => { btn.innerHTML = orig; }, 2500);
        }
    }).catch(() => {});
}

function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = state.user.lastStudyDate;

    if (lastDate === today) return; // já contou hoje

    if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
            state.user.streak = (state.user.streak || 0) + 1;
        } else {
            // Streak quebrada — notificar se tinha ofensiva ativa
            if ((state.user.streak || 0) >= 3) {
                _pushNotification({
                    type: 'red',
                    icon: '💔',
                    title: 'Ofensiva perdida',
                    body: `Sua sequência de ${state.user.streak} dias foi interrompida. Volte hoje para recomeçar!`,
                });
            }
            state.user.streak = 1; // quebrou a sequencia
        }
    } else {
        state.user.streak = 1;
    }
    state.user.lastStudyDate = today;

    // Notificar marcos de streak
    const streakMilestones = [3, 7, 14, 30, 50, 100];
    if (streakMilestones.includes(state.user.streak)) {
        _pushNotification({
            type: 'orange',
            icon: '🔥',
            title: `Ofensiva de ${state.user.streak} dias! 🔥`,
            body: `Incrível! Você está estudando há ${state.user.streak} dias seguidos. Continue assim!`,
        });
    }
}

// =====================================================
// GABARITO COMENTADO
// =====================================================
async function _showGabarito(q, selected) {
    const box = document.getElementById('gabarito-box');
    if (!box) return;
    const letters = ['A', 'B', 'C', 'D', 'E'];

    // ── Construção via DOM API (sem innerHTML com dados externos) ──────────────
    box.innerHTML = '';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'gabarito-header';
    const headerTitle = document.createElement('span');
    headerTitle.textContent = '📋 GABARITO COMENTADO';
    const aiBadge = document.createElement('span');
    aiBadge.id = 'gabarito-badge';
    aiBadge.className = 'gabarito-ai-badge';
    aiBadge.textContent = '✨ IA';
    aiBadge.style.display = 'none';
    headerDiv.appendChild(headerTitle);
    headerDiv.appendChild(aiBadge);
    box.appendChild(headerDiv);

    const altsContainer = document.createElement('div');
    altsContainer.className = 'gabarito-alts';

    q.options.forEach((opt, i) => {
        const isCorrect = i === q.correct;
        const isSelected = i === selected;

        const altDiv = document.createElement('div');
        altDiv.className = 'gabarito-alt' +
            (isCorrect ? ' gabarito-correct' : '') +
            (isSelected && !isCorrect ? ' gabarito-wrong' : '');

        const altHeader = document.createElement('div');
        altHeader.className = 'gabarito-alt-header';

        const letterEl = document.createElement('span');
        letterEl.className = 'gabarito-letter';
        letterEl.textContent = letters[i];

        const optText = document.createElement('span');
        optText.className = 'gabarito-opt-text';
        optText.textContent = opt; // textContent — seguro contra XSS

        const iconEl = document.createElement('span');
        iconEl.className = 'gabarito-icon';
        iconEl.textContent = isCorrect ? '✅' : (isSelected ? '❌' : '⬜');

        altHeader.appendChild(letterEl);
        altHeader.appendChild(optText);
        altHeader.appendChild(iconEl);
        altDiv.appendChild(altHeader);

        if (isCorrect && q.explanation) {
            const explP = document.createElement('p');
            explP.className = 'gabarito-explanation';
            explP.textContent = '📖 ' + q.explanation;
            altDiv.appendChild(explP);
        }

        const aiP = document.createElement('p');
        aiP.className = 'gabarito-ai-text';
        aiP.id = `gabarito-ai-${i}`;
        aiP.style.display = 'none';
        altDiv.appendChild(aiP);

        altsContainer.appendChild(altDiv);
    });

    box.appendChild(altsContainer);

    const loadingP = document.createElement('p');
    loadingP.className = 'gabarito-loading';
    loadingP.id = 'gabarito-loading';
    loadingP.textContent = '🤖 Gerando explicações com IA...';
    loadingP.style.display = 'none';
    box.appendChild(loadingP);
    // ── Fim da construção via DOM ──────────────────────────────────────────────

    box.style.display = '';
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Buscar explicações por alternativa com Groq (se tiver chave)
    const geminiKey = localStorage.getItem('groq_key');
    if (!geminiKey) return;

    const loadingEl = document.getElementById('gabarito-loading');
    if (loadingEl) loadingEl.style.display = '';

    try {
        const explanations = await _fetchAlternativeExplanations(q, geminiKey);
        if (!explanations) return;
        letters.forEach((l, i) => {
            const el = document.getElementById(`gabarito-ai-${i}`);
            const expl = explanations[l.toLowerCase()];
            if (el && expl) {
                el.textContent = expl;
                el.style.display = '';
            }
        });
        const badge = document.getElementById('gabarito-badge');
        if (badge) badge.style.display = '';
    } catch (e) {
        console.warn('⚠️ Gabarito IA falhou:', e);
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

async function _fetchAlternativeExplanations(q, apiKey) {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const optsText = q.options.map((opt, i) => `${letters[i]}) ${opt}`).join('\n');
    const correctLetter = letters[q.correct];

    const prompt = `Você é um professor especialista em ENEM. Para a questão abaixo, explique de forma didática em 1-2 frases por que cada alternativa está correta ou incorreta.

ÁREA: ${q.area || q.discipline || 'ENEM'}
QUESTÃO: ${q.question}
ALTERNATIVAS:
${optsText}
GABARITO: ${correctLetter}

Retorne APENAS um JSON válido sem markdown:
{"a":"explicação...","b":"explicação...","c":"explicação...","d":"explicação...","e":"explicação..."}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 800,
        }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON inválido');
    return JSON.parse(match[0]);
}

// =====================================================
// TIMER
// =====================================================
function startTimer() {
    stopTimer();
    // Usar Date.now() como referência real — resistente a app em segundo plano
    quizState._timerStartedAt = Date.now();
    quizState._timerSnapshot  = quizState.timeLeft; // segundos restantes ao iniciar

    quizState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - quizState._timerStartedAt) / 1000);
        quizState.timeLeft = Math.max(0, quizState._timerSnapshot - elapsed);
        updateTimerDisplay();
        if (quizState.timeLeft <= 0) {
            stopTimer();
            showResult();
        }
    }, 500); // tick mais frequente para exatidão ao voltar da aba
}

// Corrigir timer quando o app volta ao primeiro plano
// Auto-salvar simulado quando o app vai para segundo plano
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // App indo para segundo plano: salva o quiz automaticamente se ativo
        if (quizState.questions.length > 0 && quizState.timeLeft > 0) {
            // Atualiza timeLeft com o tempo real decorrido antes de salvar
            if (quizState._timerStartedAt) {
                const elapsed = Math.floor((Date.now() - quizState._timerStartedAt) / 1000);
                quizState.timeLeft = Math.max(0, quizState._timerSnapshot - elapsed);
            }
            _savePausedQuizSnapshot();
        }
    } else {
        if (!document.hidden && quizState.timerInterval) {
        // Recalcular imediatamente sem esperar o próximo tick
        const elapsed = Math.floor((Date.now() - quizState._timerStartedAt) / 1000);
        quizState.timeLeft = Math.max(0, quizState._timerSnapshot - elapsed);
        updateTimerDisplay();
        if (quizState.timeLeft <= 0) {
                stopTimer();
                showResult();
            }
        }
    }
});

function stopTimer() {
    if (quizState.timerInterval) {
        clearInterval(quizState.timerInterval);
        quizState.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const t = quizState.timeLeft;
    const mins = Math.floor(t / 60).toString().padStart(2, '0');
    const secs = (t % 60).toString().padStart(2, '0');
    const el = document.getElementById('quiz-timer');
    el.textContent = `⏱ ${mins}:${secs}`;

    const pct = t / quizState.totalTime;
    el.className = 'quiz-timer';
    if (pct < 0.2) el.classList.add('danger');
    else if (pct < 0.4) el.classList.add('warning');
}

// =====================================================
// HINT
// =====================================================
function showHint() {
    const q = quizState.questions[quizState.currentIndex];
    const hintBox = document.getElementById('hint-box');
    if (hintBox.style.display === 'none' || hintBox.style.display === '') {
        const hintText = q.hint
            ? '💡 ' + q.hint
            : '💡 Leia o enunciado com atenção e elimine as alternativas que contradizem o contexto. Analise cada opção antes de confirmar.';
        hintBox.innerHTML = _safeHTML(renderMarkdown(hintText));
        hintBox.style.display = 'block';
    } else {
        hintBox.style.display = 'none';
    }
}

