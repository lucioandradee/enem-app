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
            subEl.textContent = `${status.totalYears} anos de provas oficiais · gabarito comentado incluído`;
            statusEl.textContent = '✅';
            // Pré-aquecer cache silenciosamente para que o ENEM inicie sem espera
            if (window.enemAPI.prewarmENEM) window.enemAPI.prewarmENEM(2).catch(() => {});
        } else {
            subEl.textContent = '3.000+ questões oficiais · gabarito comentado incluído';
            statusEl.textContent = '✅';
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
    const btn = document.getElementById('enem-toggle-btn');
    if (!body) return;
    const isOpen = body.classList.toggle('open');
    if (chevron) chevron.classList.toggle('open', isOpen);
    if (header) header.setAttribute('aria-expanded', isOpen);
    if (btn) btn.textContent = isOpen ? '✕ Fechar' : '📋 Ver Cadernos';
    // Iniciar pré-aquecimento quando usuário expande o banner ENEM
    if (isOpen && window.enemAPI && window.enemAPI.prewarmENEM) {
        window.enemAPI.prewarmENEM(2).catch(() => {});
    }
}

async function startENEMMode(day = 1) {
    const btnId = day === 2 ? 'enem-mode-btn-2' : 'enem-mode-btn';
    const lockedLabel = '🔒 Premium';
    const btnLabel = day === 2 ? '🎯 Iniciar 2° Dia de Prova' : '🎯 Iniciar 1° Dia de Prova';
    const btn = document.getElementById(btnId);
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Verificando...'; }

    if (state.user.id && typeof loadUserPlan !== 'undefined') {
        await loadUserPlan(state.user.id).catch(() => {});
    }

    if (!planHas('enemMode')) {
        if (btn) { btn.disabled = false; btn.textContent = lockedLabel; }
        showFeaturePaywall('enemMode');
        return;
    }

    if (btn) { btn.disabled = false; btn.textContent = btnLabel; }

    const ENEM_TIME = 5 * 60 * 60 + 30 * 60;
    const discipline = day === 2 ? 'enem-dia2' : 'enem-dia1';
    await startQuiz(discipline, 90, false, ENEM_TIME);
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
        // 1ª tentativa: cache em memória/localStorage — 0ms, sem rede
        if (isENEMDay) {
            selectedQuestions = window.enemAPI.getENEMDayQuestionsIfCached(enemDay);
        } else {
            selectedQuestions = window.enemAPI.getQuizQuestionsIfCached(discipline, count);
        }

        // Se cache não tinha questões suficientes, agenda prewarm em background
        // (próxima vez que o usuário abrir um quiz, cache estará quente)
        if (!selectedQuestions) {
            setTimeout(() => window.enemAPI.prewarmENEM(3).catch(() => {}), 800);
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

    // Chip de caderno (ENEM mode): indica visualmente o número do caderno atual
    const cadrChip = document.getElementById('quiz-caderno-chip');
    if (cadrChip) {
        if (quizState.isENEMMode && q.enemNumber != null) {
            const dayConfig = window.enemAPI && window.enemAPI.ENEM_DAY_CONFIG;
            const day = quizState.discipline === 'enem-dia2' ? 2 : 1;
            const config = dayConfig ? dayConfig[day] : null;
            const cadrNum = (config && config.length > 1 && q.enemNumber >= config[1].start) ? 2 : 1;
            cadrChip.textContent = `📋 CADERNO ${cadrNum}/2`;
            cadrChip.style.display = '';
        } else {
            cadrChip.style.display = 'none';
        }
    }

    // Tipo de simulado no header
    const quizTypeEl = document.getElementById('quiz-type-label');
    if (quizTypeEl) {
        quizTypeEl.textContent = quizState.isENEMMode ? 'ENEM Oficial' : 'Simulado ENEM';
    }

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
    // Oculta dica no Modo ENEM (prova oficial não tem dica)
    document.getElementById('hint-btn').style.display = quizState.isENEMMode ? 'none' : '';
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

    // Verificar metas pessoais e emitir notificações
    if (typeof checkGoalNotifications === 'function') checkGoalNotifications();

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
    if (quizState.isENEMMode) {
        document.getElementById('result-emoji').textContent = pct >= 70 ? '🏛️' : pct >= 50 ? '📋' : '📚';
        document.getElementById('result-title').textContent = 'Simulado ENEM Concluído!';
        document.getElementById('result-sub').textContent = `Você acertou ${correct} de ${total} questões do ENEM`;
        // Destacar label da nota TRI como nota ENEM para modo oficial
        const triTitleEl = document.getElementById('result-tri-title');
        if (triTitleEl) triTitleEl.textContent = '🎯 Nota Estimada ENEM';
        const triDescEl = document.getElementById('result-tri-desc');
        // triDescEl será sobrescrito em renderResultAnalysis; apenas garantir que exibe
    } else {
        document.getElementById('result-emoji').textContent = pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚';
        document.getElementById('result-title').textContent = pct >= 70 ? 'Excelente Resultado!' : pct >= 50 ? 'Bom Trabalho!' : 'Continue Praticando!';
        document.getElementById('result-sub').textContent = `Você acertou ${correct} de ${total} questões`;
    }
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

    // Rótulo da seção muda no Modo ENEM
    const labelEl = document.getElementById('result-breakdown-label');
    if (labelEl && quizState.isENEMMode) labelEl.textContent = '📊 DESEMPENHO POR CADERNO';

    // ── Análise por caderno (Modo ENEM) ──────────────────────────────────────
    const breakdownEl = document.getElementById('result-breakdown');
    if (breakdownEl) {
        breakdownEl.innerHTML = '';
        if (quizState.isENEMMode) {
            // Agrupar por enemArea (caderno oficial)
            const byCaderno = {};
            const cadrOrder = [];
            questions.forEach((q, i) => {
                const key = q.enemArea || q.area || 'Geral';
                if (!byCaderno[key]) { byCaderno[key] = { correct: 0, total: 0 }; cadrOrder.push(key); }
                byCaderno[key].total++;
                if (quizState.answers && quizState.answers[i] === q.correct) byCaderno[key].correct++;
            });
            const areaIcons = {
                'LINGUAGENS, CÓDIGOS E SUAS TECNOLOGIAS': '📝',
                'CIÊNCIAS HUMANAS E SUAS TECNOLOGIAS': '🌍',
                'CIÊNCIAS DA NATUREZA E SUAS TECNOLOGIAS': '🔬',
                'MATEMÁTICA E SUAS TECNOLOGIAS': '➗',
            };
            cadrOrder.forEach((cadrName, ci) => {
                const d = byCaderno[cadrName];
                const p = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
                const color = p >= 70 ? '#00b4a6' : p >= 50 ? '#f5c518' : '#ef4444';
                const icon = areaIcons[cadrName] || '📚';
                const shortName = cadrName.replace(' E SUAS TECNOLOGIAS', '').replace('LINGUAGENS, CÓDIGOS', 'LINGUAGENS');
                breakdownEl.insertAdjacentHTML('beforeend', `
                    <div class="result-caderno-row">
                        <div class="result-caderno-header">
                            <span class="result-caderno-badge">CADERNO ${ci + 1}</span>
                            <span class="result-caderno-name">${icon} ${shortName}</span>
                            <span class="result-caderno-score" style="color:${color}">${d.correct}/${d.total}</span>
                        </div>
                        <div class="result-area-bar-wrap">
                            <div class="result-area-bar" style="width:${p}%;background:${color}"></div>
                        </div>
                        <span class="result-caderno-pct" style="color:${color}">${p}%</span>
                    </div>`);
            });
        } else {
            // Modo normal: agrupar por área
            const byArea = {};
            questions.forEach((q, i) => {
                const area = q.area || 'Geral';
                if (!byArea[area]) byArea[area] = { correct: 0, total: 0 };
                byArea[area].total++;
                if (quizState.answers && quizState.answers[i] !== undefined) {
                    if (quizState.answers[i] === q.correct) byArea[area].correct++;
                }
            });
            const areaIcons = {
                'CIÊNCIAS HUMANAS': '🌍', 'CIÊNCIAS DA NATUREZA': '🔬',
                'LINGUAGENS': '📝', 'MATEMÁTICA': '➗',
            };
            Object.keys(byArea).forEach(area => {
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
    }

    // Agrupar acertos/erros por área (para TRI e recomendações)
    const byArea = {};
    questions.forEach((q, i) => {
        const area = q.area || 'Geral';
        if (!byArea[area]) byArea[area] = { correct: 0, total: 0 };
        byArea[area].total++;
        if (quizState.answers && quizState.answers[i] !== undefined) {
            if (quizState.answers[i] === q.correct) byArea[area].correct++;
        }
    });

    // Estimativa TRI aprimorada com curva sigmoide e peso por dificuldade
    // Substitui a fórmula quadrática simples por uma estimativa mais fiel ao ENEM
    const triEl = document.getElementById('result-tri-score');
    const triDescEl = document.getElementById('result-tri-desc');
    const triCardEl = document.getElementById('result-tri-card');
    if (triEl && questions.length >= 5) {
        const nota = _calcTRIScore(questions, quizState.answers);
        if (nota !== null) {
            let triMsg;
            if (quizState.isENEMMode) {
                triMsg = nota >= 850 ? 'Top 5% — aprovação nas melhores universidades do país.' :
                         nota >= 700 ? 'Acima da média — aprovação em muitos cursos federais.' :
                         nota >= 550 ? 'Na média nacional. Foque nas áreas com menor %.' :
                                      'Abaixo da média. Consistência e revisão farão a diferença.';
            } else {
                triMsg = nota >= 850 ? 'Excelente! Dentro da faixa de aprovação nas melhores federais.' :
                         nota >= 700 ? 'Bom! Na faixa de aprovação em muitos cursos.' :
                         nota >= 550 ? 'Regular. Foque nos pontos fracos para subir.' :
                                      'Abaixo da média. Mais prática fará diferença!';
            }
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
        // Primeira vez que o usuário estuda — iniciar ofensiva
        _pushNotification({
            type: 'orange',
            icon: '🔥',
            title: 'Ofensiva iniciada! 🔥',
            body: 'Você começou sua sequência de estudos! Estude amanhã para manter a ofensiva.',
        });
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
    let timeStr;
    if (t >= 3600) {
        // Formato HH:MM:SS para provas longas (ENEM = 5h30min)
        const hrs  = Math.floor(t / 3600).toString().padStart(2, '0');
        const mins = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
        const secs = (t % 60).toString().padStart(2, '0');
        timeStr = `${hrs}:${mins}:${secs}`;
    } else {
        const mins = Math.floor(t / 60).toString().padStart(2, '0');
        const secs = (t % 60).toString().padStart(2, '0');
        timeStr = `${mins}:${secs}`;
    }
    const el = document.getElementById('quiz-timer');
    el.textContent = `⏱ ${timeStr}`;

    const pct = t / quizState.totalTime;
    el.className = 'quiz-timer';
    if (quizState.isENEMMode) el.classList.add('enem-timer');
    if (pct < 0.2) el.classList.add('danger');
    else if (pct < 0.4) el.classList.add('warning');
}

// =====================================================
// HINT
// =====================================================
// Dicas por área/disciplina para questões da API que chegam sem hint
const _AREA_HINTS = {
    'CIÊNCIAS HUMANAS': [
        'Relacione o contexto histórico com as causas e consequências apresentadas no enunciado.',
        'Em questões de filosofia, identifique o filósofo ou corrente filosófica antes de avaliar as alternativas.',
        'Para sociologia: verifique se as alternativas usam os conceitos de Durkheim, Weber ou Marx corretamente.',
        'Em história, associe o período histórico às suas características políticas, econômicas e sociais.',
        'Leia a charge ou imagem com atenção — o símbolo central costuma ser a chave da resposta.',
        'Questões de geografia: relacione o fenômeno com o bioma, região ou processo econômico citado.',
        'Para questões sobre direitos humanos, pense na perspectiva de quem foi historicamente excluído.',
    ],
    'CIÊNCIAS DA NATUREZA': [
        'Identifique qual lei ou princípio científico é cobrado antes de analisar as alternativas.',
        'Em química orgânica, atenção ao grupo funcional — ele define as propriedades da substância.',
        'Para física: isole a variável pedida e aplique a fórmula correta com as unidades corretas.',
        'Em biologia celular, relacione a organela com sua função específica no metabolismo.',
        'Questões ambientais: relacione o problema com o ciclo biogeoquímico ou o bioma afetado.',
        'Em termodinâmica, observe se o sistema absorve ou cede calor — sinal de Q faz diferença.',
        'Para genética: monte o quadro de Punnett se a questão envolver cruzamentos monibridistas.',
    ],
    'LINGUAGENS': [
        'Em questões de literatura, identifique o período literário pelos recursos estilísticos do texto.',
        'Para gramática: releia a frase substituindo a opção pelo elemento original para testar a coerência.',
        'Em interpretação textual, a resposta correta está sempre sustentada por algum trecho do texto.',
        'Textos publicitários e charges: o humor ou ironia geralmente carregam a crítica social cobrada.',
        'Para questões de variação linguística, lembre que todas as variedades são igualmente válidas.',
        'Em poesia, atenção ao tom (irônico, lírico, épico) e às figuras de linguagem presentes.',
        'Questões de língua estrangeira: use o contexto para inferir o significado, mesmo sem saber todas as palavras.',
    ],
    'MATEMÁTICA': [
        'Represente o problema graficamente ou com variáveis antes de calcular.',
        'Em porcentagem e juros, cuidado com a base de cálculo — porcentagem sobre porcentagem acumula.',
        'Para geometria: identifique os triângulos retângulos escondidos no problema (Pitágoras e trigonometria).',
        'Em funções, substitua valores extremos para identificar o comportamento da curva.',
        'Questões de probabilidade: liste o espaço amostral antes de montar a fração.',
        'Para PA/PG, escreva os 3 primeiros termos com a fórmula geral e veja o padrão.',
        'Em estatística, verifique se a questão pede média, mediana ou moda — não são a mesma coisa.',
    ],
};

function _getSmartHint(q) {
    if (q.hint) return q.hint;
    // Tenta gerar dica específica a partir do enunciado
    const txt = (q.question || '').toLowerCase();
    // Alguns padrões comuns no ENEM
    if (/fotoss[íi]ntese|cloroplasto|clorofila/.test(txt))   return 'A fotossíntese ocorre em 2 etapas: fase fotoquímica (luz → ATP/NADPH) e ciclo de Calvin (CO₂ → glicose).';
    if (/meiose|gameta|fert[ií]l/.test(txt))                  return 'A meiose reduz o número de cromossomos à metade — essencial para que a fecundação restaure o número diploide.';
    if (/dna|rna|prote[íi]na|transcri|tradu/.test(txt))       return 'Fluxo: DNA → (transcrição) → RNA → (tradução) → Proteína. Cada códon do RNAm corresponde a um aminoácido.';
    if (/newton|for[çc]a|acelera[çc][ãa]o/.test(txt))         return 'F = m·a (2ª Lei). Identifique todas as forças, faça o diagrama de corpo livre e aplique ΣF = m·a.';
    if (/energia cin[ée]|pot[êe]ncial|trabalho/.test(txt))    return 'Energia mecânica = Ec + Ep. Se não há atrito, ela se conserva. Trabalho = variação de energia cinética.';
    if (/ph|[áa]cido|base|neutro|h\+/.test(txt))              return 'pH < 7 → ácido; pH = 7 → neutro; pH > 7 → base. pH = -log[H⁺]. Memorize a escala.';
    if (/lei de mendel|dominante|recessiv/.test(txt))         return 'Monte o quadro de Punnett! Dominant (A) × recessivo (a): Aa × Aa → 1 AA : 2 Aa : 1 aa (1/4 recessivo fenotipicamente).';
    if (/revolução fran|bastilha|ancien r[ée]gime/.test(txt)) return 'A Revolução Francesa (1789) destruiu os privilégios do Antigo Regime — clero e nobreza perderam seus direitos feudais.';
    if (/ditadura|ai-5|militar|censura/.test(txt))            return 'O AI-5 (1968) foi o ato mais duro da ditadura: fechou o Congresso, instaurou censura e suspendeu o habeas corpus.';
    if (/escravid[ãa]o|lei [áa]urea|abolição/.test(txt))      return 'A abolição formal (1888) não foi acompanhada de reforma agrária ou inclusão social — perpetuando a desigualdade racial.';
    if (/imperativo categ|kant/.test(txt))                    return 'Kant: age só conforme uma máxima que possas querer que se torne lei universal (imperativo categórico).';
    if (/marx|mais-valia|prolet[áa]rio|burgu/.test(txt))      return 'Para Marx: burguesia (donos dos meios de produção) × proletariado (força de trabalho). A mais-valia é o lucro não pago ao trabalhador.';
    if (/durkheim|fato social|anomia/.test(txt))              return 'Fatos sociais (Durkheim) são externos, coercitivos e gerais — existem independentemente do indivíduo.';
    if (/fun[çc][ãa]o afim|fun[çc][ãa]o 1.*grau/.test(txt))  return 'f(x) = ax + b. Raiz: x = -b/a. Crescente se a > 0; decrescente se a < 0. Verifique o sinal de a primeiro.';
    if (/fun[çc][ãa]o quadr[áa]tica|par[áa]bola/.test(txt))   return 'f(x) = ax²+bx+c. Vértice: x = -b/2a. Δ = b²-4ac. Se Δ < 0, não há raízes reais.';
    if (/logaritmo|log/.test(txt))                            return 'logₐ(b) = x ↔ aˣ = b. Propriedades: log(A·B) = logA + logB; log(A/B) = logA - logB; log(Aⁿ) = n·logA.';
    if (/juros compost|montante/.test(txt))                   return 'M = C·(1+i)ⁿ. Juros compostos incidem sobre o montante acumulado — crescimento exponencial, não linear.';
    if (/probabilidade|espa[çc]o amostral/.test(txt))         return 'P(A) = casos favoráveis ÷ total de casos. Liste o espaço amostral completo antes de calcular.';
    if (/trigon|seno|coseno|tangente/.test(txt))              return 'No triângulo retângulo: seno = CO/H, cosseno = CA/H, tangente = CO/CA. Memorize: SOH-CAH-TOA.';
    // Fallback inteligente por área
    const areaHints = _AREA_HINTS[q.area] || _AREA_HINTS['CIÊNCIAS HUMANAS'];
    // Usa o índice da questão para variar a dica (não repete sempre a mesma)
    const idx = (quizState.currentIndex || 0) % areaHints.length;
    return areaHints[idx];
}

function showHint() {
    if (quizState.isENEMMode) return; // sem dica no modo ENEM
    const q = quizState.questions[quizState.currentIndex];
    const hintBox = document.getElementById('hint-box');
    if (hintBox.style.display === 'none' || hintBox.style.display === '') {
        const hintText = '💡 ' + _getSmartHint(q);
        hintBox.innerHTML = _safeHTML(renderMarkdown(hintText));
        hintBox.style.display = 'block';
    } else {
        hintBox.style.display = 'none';
    }
}

