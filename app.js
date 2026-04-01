/* =====================================================
   ENEM MASTER — App Logic (app.js)
   SPA Router • Quiz Engine • Gamification • Data
   ===================================================== */

'use strict';

// =====================================================
// STATE
// =====================================================
// =====================================================
// PLANOS — configuração central
// =====================================================
const PLANS = {
    free: {
        name: 'Grátis',
        dailyLimit: 10,          // questões por dia
        maxQuizSize: 10,         // tamanho máximo do simulado
        features: {
            enemMode:  false,    // simulado ENEM completo (90q / 5h30min)
            redacaoIA: false,    // correção de redação por IA
            largeQuiz: false,    // simulados acima de 10 questões
        },
    },
    premium: {
        name: 'Premium 👑',
        dailyLimit: Infinity,
        maxQuizSize: 90,
        features: {
            enemMode:  true,
            redacaoIA: true,
            largeQuiz: true,
        },
    },
};

// ─── MENSAGENS DE PAYWALL — única fonte de verdade para cada bloqueio ───────
const PAYWALL_MESSAGES = {
    enemMode: {
        title: 'Modo ENEM é exclusivo Premium 👑',
        body:  '90 questões com o tempo real do ENEM (5h30min). Assine o Premium e simule a prova completa!',
    },
    redacaoIA: {
        title: 'Redação com IA é exclusivo Premium 👑',
        body:  'Corrija sua redação nas 5 competências com análise detalhada por IA. Assine o Premium para desbloquear!',
    },
    largeQuiz: {
        title: 'Simulados maiores são exclusivos Premium 👑',
        body:  'No plano Grátis o limite é 10 questões por simulado. Assine o Premium para simulados de até 90 questões!',
    },
    dailyLimit: {
        title: 'Limite diário atingido 🔒',
        body:  'Você usou todas as 10 questões grátis de hoje. Volte amanhã ou assine o Premium para estudar sem limites!',
    },
};

// Retorna o plano atual do usuário
function getUserPlan() {
    return (state.user && state.user.plan === 'premium') ? PLANS.premium : PLANS.free;
}

// Retorna quantas questões o usuário ainda pode responder hoje
function getRemainingQuestions() {
    const plan = getUserPlan();
    if (plan.dailyLimit === Infinity) return Infinity;
    const today = new Date().toDateString();
    const countToday = (state.user.questoesHojeData === today)
        ? (state.user.questoesHoje || 0)
        : 0;
    return Math.max(0, plan.dailyLimit - countToday);
}

// Registra N questões respondidas hoje
function registerQuestionsUsed(n) {
    const today = new Date().toDateString();
    if (state.user.questoesHojeData !== today) {
        state.user.questoesHoje = 0;
        state.user.questoesHojeData = today;
    }
    state.user.questoesHoje = (state.user.questoesHoje || 0) + n;
}

// ── HELPERS DE PLANO ──────────────────────────────────────────────────────────

/** Retorna true se o usuário tem plano Premium */
function isPremium() {
    return getUserPlan() === PLANS.premium;
}

/** Retorna true se o plano atual libera a feature indicada */
function planHas(feature) {
    return !!getUserPlan().features?.[feature];
}

/** Exibe o paywall para uma feature usando os textos centralizados em PAYWALL_MESSAGES */
function showFeaturePaywall(feature) {
    const msg = PAYWALL_MESSAGES[feature] || PAYWALL_MESSAGES.dailyLimit;
    showPaywall(msg.title, msg.body);
}

// ─────────────────────────────────────────────────────────────────────────────

const defaultState = {
    user: {
        name: 'Alex',
        email: 'alex@estudo.com',
        school: 'Escola Estadual Machado de Assis',
        level: 1,
        xp: 0,
        streak: 0,
        goal: 'Rumo à Federal 🚀',
        plan: 'free',           // 'free' | 'premium'
        questoesHoje: 0,        // questões respondidas hoje (controle de limite)
        questoesHojeData: '',   // data do contador (ex: "Mon Mar 23 2026")
        lastStudyDate: '',      // data do último estudo, para cálculo de streak
    },
    progress: {
        humanas: 0, natureza: 0, linguagens: 0, matematica: 0,
        questoesHoje: 0, totalHoje: 10,
        totalCorretas: 0,
        // Histograma por disicplina: { correct, total }
        stats: {
            humanas: { correct: 0, total: 0 },
            natureza: { correct: 0, total: 0 },
            linguagens: { correct: 0, total: 0 },
            matematica: { correct: 0, total: 0 },
        },
    },
    quizHistory: [],    // [{ date, discipline, correct, total, xp }] — cap: 200
    wrongAnswers: [],   // [{ question, userAnswer, correctAnswer, date }] — cap: 300
    onboardingDone: false,
    weakSubjects: [],   // disciplinas prioritárias do onboarding
    dailyChallenge: null, // { date, discipline, count, done, xp }
    badges: {
        ofensiva: [],
        especialista: [],
        maratonista: [],
    },
    notifications: [
        { id: 1, type: 'blue', icon: '📝', title: 'Simulado disponível', body: 'Novo Simulado: Ciências da Natureza já está aberto para você. Prepare-se e comece agora!', time: '6h', unread: true, cta: 'Fazer Simulado', ctaScreen: 'quiz-setup', date: 'today' },
        { id: 2, type: 'orange', icon: '📊', title: 'Ranking Semanal', body: 'Eita! João Silva ultrapassou você no Ranking. Volte aos estudos para recuperar sua posição!', time: '1h', unread: true, date: 'today' },
        { id: 3, type: 'purple', icon: '🏅', title: 'Nova Conquista', body: 'Parabéns! Você desbloqueou o badge "Mestre da Redação" por 5 notas acima de 900.', time: '3h', unread: true, date: 'today' },
        { id: 4, type: 'green', icon: '📅', title: 'Lembrete de Estudo', body: 'Hora do Estudo: Seguindo seu cronograma, agora é vez de Matemática (Funções).', time: '6h', unread: false, date: 'today' },
        { id: 5, type: 'yellow', icon: '🔥', title: 'Maratona 7 Dias', body: 'Incrível! Você manteve seu ritmo de estudos por uma semana inteira.', time: 'Ontem', unread: false, date: 'yesterday' },
    ],
    currentScreen: 'home',
};

// =====================================================
// SCHEMA MIGRATION
// =====================================================
// Preenche campos ausentes no state salvo sem apagar dados existentes.
// Incrementar STATE_VERSION sempre que adicionar campos obrigatórios.
const STATE_VERSION = 2;

function _migrateState(saved) {
    const def = JSON.parse(JSON.stringify(defaultState));

    // Garantir objetos de topo
    if (!saved.user)     saved.user     = def.user;
    if (!saved.progress) saved.progress = def.progress;
    if (!saved.badges)   saved.badges   = def.badges;
    if (!Array.isArray(saved.quizHistory))  saved.quizHistory  = [];
    if (!Array.isArray(saved.wrongAnswers)) saved.wrongAnswers = [];
    if (!Array.isArray(saved.weakSubjects)) saved.weakSubjects = [];
    if (!Array.isArray(saved.notifications)) saved.notifications = def.notifications;

    // Campos do user
    for (const [k, v] of Object.entries(def.user)) {
        if (saved.user[k] === undefined) saved.user[k] = v;
    }
    // Remover campo de senha caso tenha sido persistido acidentalmente
    delete saved.user._password;

    // Campos do progress
    for (const [k, v] of Object.entries(def.progress)) {
        if (saved.progress[k] === undefined) saved.progress[k] = v;
    }
    if (!saved.progress.stats) saved.progress.stats = def.progress.stats;
    for (const disc of ['humanas', 'natureza', 'linguagens', 'matematica']) {
        if (!saved.progress.stats[disc]) saved.progress.stats[disc] = { correct: 0, total: 0 };
    }

    // Campos dos badges
    for (const cat of ['ofensiva', 'especialista', 'maratonista']) {
        if (!Array.isArray(saved.badges[cat])) saved.badges[cat] = [];
    }

    // Campos de topo opcionais
    if (saved.onboardingDone === undefined) saved.onboardingDone = false;
    if (saved.currentScreen === undefined)  saved.currentScreen  = 'home';
    if (saved.dailyChallenge === undefined) saved.dailyChallenge = null;

    saved._version = STATE_VERSION;
    return saved;
}

let state;
try {
    const _saved = localStorage.getItem('enem_state');
    state = _saved ? _migrateState(JSON.parse(_saved)) : null;
} catch (e) {
    console.warn('⚠️ Estado corrompido, resetando:', e);
    localStorage.removeItem('enem_state');
    state = null;
}
state = state || JSON.parse(JSON.stringify(defaultState));

const QUIZ_HISTORY_LIMIT  = 200; // entradas mais recentes mantidas
const WRONG_ANSWERS_LIMIT = 300; // erros mais recentes mantidos

// =====================================================
// TRI — TEORIA DE RESPOSTA AO ITEM (estimativa)
// =====================================================
// Calcula estimativa de nota ENEM usando curva sigmoide ponderada por dificuldade.
// Questões com índice maior na prova recebem peso maior (itens mais difíceis).
function _calcTRIScore(questions, answers) {
    if (!questions || questions.length < 3) return null;

    let weightedCorrect = 0;
    let totalWeight = 0;

    questions.forEach((q, i) => {
        // Estimar dificuldade pelo índice da questão na prova ENEM
        // Questões 1-30 = mais fáceis (0.3), 31-60 = médias (0.5), 61-90 = mais difíceis (0.8)
        let difficulty = 0.5; // padrão = média
        if (q.apiFormat && q.index) {
            const pos = ((q.index - 1) % 90) / 89; // 0..1 dentro do caderno
            difficulty = 0.25 + pos * 0.55;         // 0.25..0.80
        }
        const weight = 0.5 + difficulty; // peso: 0.75 (fácil) a 1.30 (difícil)
        totalWeight += weight;
        if (answers && answers[i] === q.correct) weightedCorrect += weight;
    });

    const weightedPct = totalWeight > 0 ? weightedCorrect / totalWeight : 0;

    // Curva sigmoide: 0%→320  25%→450  50%→600  75%→760  100%→980
    const sigmoid = 1 / (1 + Math.exp(-9 * (weightedPct - 0.5)));
    const nota = Math.round((300 + sigmoid * 700) / 10) * 10;
    return Math.min(1000, Math.max(300, nota));
}

function saveState() {
    // Impedir crescimento ilimitado dos arrays antes de persistir
    if (state.quizHistory.length > QUIZ_HISTORY_LIMIT) {
        state.quizHistory = state.quizHistory.slice(-QUIZ_HISTORY_LIMIT);
    }
    if (state.wrongAnswers.length > WRONG_ANSWERS_LIMIT) {
        state.wrongAnswers = state.wrongAnswers.slice(-WRONG_ANSWERS_LIMIT);
    }
    try {
        localStorage.setItem('enem_state', JSON.stringify(state));
    } catch (e) {
        // localStorage cheio: remover cache da API e tentar novamente
        console.warn('⚠️ localStorage cheio, limpando cache da API...', e);
        Object.keys(localStorage)
            .filter(k => k.startsWith('enem_q_') || k.startsWith('enem_exams'))
            .forEach(k => localStorage.removeItem(k));
        try { localStorage.setItem('enem_state', JSON.stringify(state)); } catch { /* noop */ }
    }
}

// =====================================================
// QUESTION BANK (questões carregadas de questions.js)
// =====================================================
// O banco de questões fica em window.LOCAL_QUESTIONS (questions.js)
// que é carregado antes de app.js no index.html

// =====================================================
// AGENTE DE RECOMENDAÇÃO
// =====================================================
// Analisa stats por disciplina + weakSubjects do onboarding e gera
// recomendações priorizadas de tópicos a estudar.
const _REC_TOPICS = {
    humanas: [
        'Geopolítica e Globalização',
        'Era Vargas e Estado Novo',
        'Filosofia: Iluminismo e Contratualismo',
        'Ditadura Militar no Brasil',
        'Revolução Industrial e Neocolonialismo',
        'Direitos Humanos e Cidadania',
        'Segunda Guerra Mundial',
        'Guerra Fria e Mundo Bipolar',
    ],
    natureza: [
        'Genética e Heredograma',
        'Termodinâmica — 1ª e 2ª Lei',
        'Funções Orgânicas e Reações',
        'Ecologia: Cadeias e Biomas',
        'Eletrodinâmica e Circuitos',
        'Ácidos, Bases e pH',
        'Evolução e Seleção Natural',
        'Ondulatória e Óptica Geométrica',
    ],
    linguagens: [
        'Interpretação de Texto e Inferência',
        'Figuras de Linguagem',
        'Análise de Charge, Tirinha e Publicidade',
        'Regência Verbal e Nominal',
        'Concordância Verbal e Nominal',
        'Redação: Estrutura Dissertativo-Argumentativa',
        'Espanhol Básico — Interpretação',
        'Literatura: Modernismo Brasileiro',
    ],
    matematica: [
        'Funções do 1º e 2º Grau — Bhaskara',
        'Geometria Plana: Áreas e Perímetros',
        'Probabilidade e Contagem',
        'Porcentagem, Juros e Regra de Três',
        'Geometria Espacial: Volume e Planificação',
        'Trigonometria no Triângulo Retângulo',
        'Progressão Aritmética e Geométrica',
        'Estatística: Média e Desvio Padrão',
    ],
};

function _getRecommendationAgent() {
    const stats = state.progress.stats;
    const DISCS = ['humanas', 'natureza', 'linguagens', 'matematica'];
    const DISC_LABELS = { humanas: 'Humanas', natureza: 'Ciências da Natureza', linguagens: 'Linguagens', matematica: 'Matemática' };
    const DISC_ICONS  = { humanas: '🌍', natureza: '🔬', linguagens: '📝', matematica: '➗' };

    // Calcular performance por disciplina
    const perfData = DISCS.map(disc => {
        const st = stats[disc] || { correct: 0, total: 0 };
        const pct = st.total >= 3 ? st.correct / st.total : null; // null = dados insuficientes
        const weakFromOnboarding = (state.weakSubjects || []).includes(disc);
        return { disc, pct, total: st.total, weakFromOnboarding };
    });

    // Ordenar: piores primeiros; pior onboarding tem prioridade em empate
    const ranked = [...perfData].sort((a, b) => {
        if (a.pct === null && b.pct === null) return (b.weakFromOnboarding ? 1 : 0) - (a.weakFromOnboarding ? 1 : 0);
        if (a.pct === null) return b.weakFromOnboarding ? 1 : -1;
        if (b.pct === null) return a.weakFromOnboarding ? -1 : 1;
        return a.pct - b.pct;
    });

    // Gerar sugestões de tópico (rotação diária determinística)
    const dateSeed = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''), 10);

    return ranked.slice(0, 3).map((item, idx) => {
        const { disc, pct, weakFromOnboarding } = item;
        const topics = _REC_TOPICS[disc] || [];
        const topicIdx = (dateSeed + idx * 13) % topics.length;

        let reason;
        if (pct !== null) {
            const pctStr = Math.round(pct * 100) + '%';
            reason = pct < 0.4 ? `${pctStr} de acerto — revise este tópico` :
                     pct < 0.7 ? `${pctStr} de acerto — ainda dá para melhorar` :
                                 `${pctStr} de acerto — continue assim!`;
        } else if (weakFromOnboarding) {
            reason = 'Área indicada nas suas preferências';
        } else {
            reason = 'Nenhuma questão ainda — ótimo ponto de partida!';
        }

        return {
            disc,
            icon: DISC_ICONS[disc],
            area: DISC_LABELS[disc],
            topic: topics[topicIdx],
            reason,
            priority: idx + 1,
        };
    });
}
let quizState = {
    questions: [],
    answers: [],        // índice da alternativa escolhida por questão
    currentIndex: 0,
    selectedOption: null,
    confirmed: false,
    correct: 0,
    wrong: 0,
    combo: 0,           // acertos consecutivos na sessão atual
    maxCombo: 0,        // maior combo da sessão
    bonusXp: 0,         // XP extra ganho por combos e streak
    timerInterval: null,
    timeLeft: 0,
    totalTime: 0,
    discipline: 'misto',
    startTime: null,   // timestamp real de início da sessão
};

// =====================================================
// PAUSAR / RETOMAR SIMULADO
// =====================================================
const PAUSED_QUIZ_KEY = 'enem_paused_quiz';

function _getPausedQuiz() {
    try {
        const raw = localStorage.getItem(PAUSED_QUIZ_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function _clearPausedQuiz() {
    try { localStorage.removeItem(PAUSED_QUIZ_KEY); } catch { /* noop */ }
}

function _savePausedQuizSnapshot() {
    if (!quizState.questions.length || quizState.timeLeft <= 0) return;
    const snapshot = {
        questions:    quizState.questions,
        answers:      [...quizState.answers],
        currentIndex: quizState.currentIndex,
        correct:      quizState.correct,
        wrong:        quizState.wrong,
        combo:        quizState.combo,
        maxCombo:     quizState.maxCombo,
        bonusXp:      quizState.bonusXp,
        timeLeft:     quizState.timeLeft,
        totalTime:    quizState.totalTime,
        discipline:   quizState.discipline,
        isENEMMode:   quizState.isENEMMode,
        pausedAt:     new Date().toISOString(),
    };
    try { localStorage.setItem(PAUSED_QUIZ_KEY, JSON.stringify(snapshot)); } catch { /* noop */ }
}

function onPauseQuizRequest() {
    // Congela o timer enquanto o modal está aberto
    stopTimer();
    const overlay = document.getElementById('pause-quiz-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function closePauseModal() {
    const overlay = document.getElementById('pause-quiz-overlay');
    if (overlay) overlay.style.display = 'none';
    // Retoma o timer se o quiz ainda está ativo
    if (quizState.questions.length > 0 && quizState.timeLeft > 0) {
        startTimer();
    }
}

function pauseQuiz() {
    stopTimer();
    _savePausedQuizSnapshot();
    const overlay = document.getElementById('pause-quiz-overlay');
    if (overlay) overlay.style.display = 'none';
    navigate('home');
}

function abandonQuiz() {
    stopTimer();
    _clearPausedQuiz();
    quizState.questions = [];
    const overlay = document.getElementById('pause-quiz-overlay');
    if (overlay) overlay.style.display = 'none';
    navigate('home');
}

function exitQuiz() {
    onPauseQuizRequest();
}

async function resumeQuiz() {
    const snapshot = _getPausedQuiz();
    if (!snapshot) return;

    navigate('quiz');
    showQuizLoading(false);

    quizState.questions     = snapshot.questions;
    quizState.answers       = snapshot.answers || [];
    quizState.currentIndex  = snapshot.currentIndex || 0;
    quizState.correct       = snapshot.correct || 0;
    quizState.wrong         = snapshot.wrong || 0;
    quizState.combo         = snapshot.combo || 0;
    quizState.maxCombo      = snapshot.maxCombo || 0;
    quizState.bonusXp       = snapshot.bonusXp || 0;
    quizState.timeLeft      = snapshot.timeLeft || 300;
    quizState.totalTime     = snapshot.totalTime || snapshot.timeLeft || 300;
    quizState.discipline    = snapshot.discipline || 'misto';
    quizState.isENEMMode    = !!snapshot.isENEMMode;
    quizState.selectedOption = null;
    quizState.confirmed     = false;

    _clearPausedQuiz(); // limpa após restaurar para não reaparecer

    renderQuestion();
    startTimer();
}

function _renderPausedQuizBanner(target) {
    const bannerId = target === 'setup' ? 'paused-quiz-banner-setup' : 'paused-quiz-banner';
    const el = document.getElementById(bannerId);
    if (!el) return;

    const snapshot = _getPausedQuiz();
    if (!snapshot) { el.innerHTML = ''; el.style.display = 'none'; return; }

    const discLabels = {
        'misto':        'Todas as Áreas',
        'enem-dia1':    '1º Dia — ENEM',
        'enem-dia2':    '2º Dia — ENEM',
        'humanas':      'Ciências Humanas',
        'natureza':     'Ciências da Natureza',
        'linguagens':   'Linguagens',
        'matematica':   'Matemática',
    };
    const discLabel = discLabels[snapshot.discipline] || 'Simulado';
    const total     = snapshot.questions.length;
    const done      = snapshot.currentIndex;
    const pct       = total > 0 ? Math.round((done / total) * 100) : 0;
    const mins      = Math.floor(snapshot.timeLeft / 60).toString().padStart(2, '0');
    const secs      = (snapshot.timeLeft % 60).toString().padStart(2, '0');

    const diffMs    = Date.now() - new Date(snapshot.pausedAt).getTime();
    const diffMins  = Math.round(diffMs / 60000);
    const timeAgo   = diffMins < 1 ? 'agora mesmo' :
                      diffMins < 60 ? `há ${diffMins} min` :
                      `há ${Math.floor(diffMins / 60)}h`;

    el.style.display = '';
    el.innerHTML = `
        <div class="paused-quiz-card">
            <div class="pq-top">
                <span class="pq-icon">⏸️</span>
                <div class="pq-info">
                    <p class="pq-title">Simulado pausado</p>
                    <p class="pq-meta">${discLabel} · Q.${done + 1}/${total} · ${timeAgo}</p>
                </div>
                <span class="pq-timer">${mins}:${secs}</span>
            </div>
            <div class="pq-bar-wrap"><div class="pq-bar" style="width:${pct}%"></div></div>
            <button class="cta-btn pq-btn" onclick="resumeQuiz()">▶ Continuar de onde parei</button>
        </div>
    `;
}

// =====================================================
// SYNC DE UI — PLANO
// =====================================================
/**
 * Atualiza toda a UI dependente do plano em um único passo.
 * Deve ser chamada sempre que state.user.plan mudar — login, sync loop,
 * polling de pagamento ou resgate de código de ativação.
 */
function _syncPlanUI() {
    const prem = isPremium();
    const planLabel = prem ? 'Premium 👑' : 'Grátis';

    // 1. Badges declarativos no HTML (elementos com atributo data-plan-badge)
    document.querySelectorAll('[data-plan-badge]').forEach(el => {
        el.textContent = planLabel;
        el.classList.toggle('badge-premium', prem);
        el.classList.toggle('badge-free', !prem);
    });

    // 2. Botões ENEM Mode — exibe cadeado quando bloqueado
    const enemBtn = document.getElementById('enem-mode-btn');
    if (enemBtn && !enemBtn.disabled) {
        enemBtn.textContent = prem ? '🎯 Iniciar 1° Dia de Prova' : '🔒 Premium';
    }
    const enemBtn2 = document.getElementById('enem-mode-btn-2');
    if (enemBtn2 && !enemBtn2.disabled) {
        enemBtn2.textContent = prem ? '🎯 Iniciar 2° Dia de Prova' : '🔒 Premium';
    }

    // 3. Re-renderizar telas que dependem fortemente do plano
    switch (state.currentScreen) {
        case 'quiz-setup': renderQuizSetup(); break;
        case 'profile':    renderProfile();   break;
        case 'checkout':   renderCheckout();  break;
        default: break;
    }
}

// =====================================================
// NAVIGATION / ROUTER
// =====================================================
const screenMap = {
    home: 'screen-home',
    'quiz-setup': 'screen-quiz-setup',
    quiz: 'screen-quiz',
    result: 'screen-result',
    ranking: 'screen-ranking',
    achievements: 'screen-achievements',
    review: 'screen-review',
    profile: 'screen-profile',
    settings: 'screen-settings',
    support: 'screen-support',
    notifications: 'screen-notifications',
    onboarding: 'screen-onboarding',
    login: 'screen-login',
    plans: 'screen-plans',
    checkout: 'screen-checkout',
    privacy: 'screen-privacy',
    terms: 'screen-terms',
    redacao: 'screen-redacao',
    analise: 'screen-analise',
    conteudo: 'screen-conteudo',
};

const screensWithNav = ['home', 'ranking', 'achievements', 'profile', 'conteudo'];
const screensWithoutNav = ['quiz', 'quiz-setup', 'result', 'settings', 'support', 'notifications', 'review', 'onboarding', 'login', 'plans', 'checkout', 'privacy', 'terms', 'redacao', 'analise'];

function navigate(screenName) {
    console.log('🧭 navigate →', screenName, '| from:', state.currentScreen);
    const currentId = screenMap[state.currentScreen];
    const nextId = screenMap[screenName];
    if (!nextId || currentId === nextId) return;

    const currentEl = currentId ? document.getElementById(currentId) : null;
    const nextEl = document.getElementById(nextId);
    if (!nextEl) { console.error('Screen element not found:', nextId); return; }

    // Stop quiz timer if leaving quiz
    if (state.currentScreen === 'quiz') stopTimer();

    if (currentEl) {
        currentEl.classList.remove('active');
        currentEl.classList.add('slide-out');
        setTimeout(() => currentEl.classList.remove('slide-out'), 300);
    }

    nextEl.classList.add('active');

    state.currentScreen = screenName;
    saveState();

    // Show/hide bottom nav
    const nav = document.getElementById('bottom-nav');
    if (screensWithoutNav.includes(screenName)) {
        nav.style.display = 'none';
    } else {
        nav.style.display = 'flex';
        updateNavActive(screenName);
    }

    // Render screen data
    renderScreen(screenName);

    // Ao abrir a tela de ranking: sincronizar XP antes de buscar dados
    if (screenName === 'ranking' && state.user.id && typeof saveUserData !== 'undefined') {
        saveUserData(state.user.id).catch(() => {});
    }
}

function updateNavActive(screenName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navMap = { home: 'nav-home', ranking: 'nav-ranking', conteudo: 'nav-conteudo', profile: 'nav-profile' };
    const activeBtn = document.getElementById(navMap[screenName]);
    if (activeBtn) activeBtn.classList.add('active');
}

function renderScreen(screenName) {
    try {
        switch (screenName) {
            case 'home': renderDashboard(); break;
            case 'ranking': renderRanking(); break;
            case 'notifications': renderNotifications(); break;
            case 'profile': renderProfile(); break;
            case 'settings': renderSettings(); break;
            case 'quiz-setup': renderQuizSetup(); break;
            case 'review': renderReview(); break;
            case 'achievements': renderAchievements(); break;
            case 'redacao': renderRedacao(); break;
            case 'checkout': renderCheckout(); break;
            case 'analise': renderAnalise(); break;
            case 'conteudo': renderConteudo(); break;
            default: break;
        }
    } catch (e) {
        console.error('❌ renderScreen [' + screenName + ']:', e);
        _showQuickToast('Erro ao carregar tela: ' + e.message);
    }
}

// =====================================================
// DASHBOARD
// =====================================================
function renderDashboard() {
    _renderPausedQuizBanner('home');
    const s = state.user;
    const safeName = (s.name && s.name.trim()) ? s.name : 'Estudante';

    // Saudação baseada no horário
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const greetingEl = document.querySelector('.greeting');
    if (greetingEl) {
        greetingEl.textContent = '';
        const nameSpan = document.createElement('span');
        nameSpan.id = 'dash-name';
        nameSpan.textContent = safeName.split(' ')[0];
        greetingEl.appendChild(document.createTextNode(`${greeting}, `));
        greetingEl.appendChild(nameSpan);
        greetingEl.appendChild(document.createTextNode('! 👋'));
    }

    const goalEl = document.querySelector('.goal-text');
    if (goalEl) goalEl.textContent = s.goal;

    document.getElementById('dash-level').textContent = s.level;
    document.getElementById('dash-xp').textContent = s.xp.toLocaleString('pt-BR');
    document.getElementById('dash-streak').textContent = s.streak + ' Dias';
    document.getElementById('dash-avatar').textContent = safeName[0].toUpperCase();

    // Unread notifications count
    const notifs = state.notifications || [];
    const unread = notifs.filter(n => n.unread).length;
    const badge = document.getElementById('notif-count');
    if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }

    renderWeekRow();
    renderTodayCard();
    renderHistorySparkline();
    renderDailyChallenge();
    renderENEMCountdown();

    // Posição no ranking global (assíncrono, não bloqueia a UI)
    const rankEl = document.getElementById('dash-ranking');
    if (rankEl && typeof getGlobalTop !== 'undefined') {
        getGlobalTop().then(res => {
            if (!res.success || !res.data || res.data.length === 0) return;
            const myIdx = res.data.findIndex(i => state.user.id && i.id === state.user.id);
            if (myIdx === -1) {
                // Estimar posição pelo XP
                const above = res.data.filter(i => (i.xp || 0) > (state.user.xp || 0)).length;
                const total = res.data.length;
                const pct = Math.round(((total - above) / total) * 100);
                rankEl.textContent = pct >= 90 ? 'Top 10%' : pct >= 75 ? 'Top 25%' : pct >= 50 ? 'Top 50%' : `${above + 1}º`;
            } else {
                const pos = myIdx + 1;
                const total = res.data.length;
                rankEl.textContent = pos <= 3 ? `${pos}º 🏆` : `${pos}º de ${total}`;
            }
        }).catch(() => {});
    }
}

function renderWeekRow() {
    const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const container = document.getElementById('week-row');
    container.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const isToday = d.toDateString() === today.toDateString();
        const dateStr = d.toISOString().split('T')[0];
        const hasDot = state.quizHistory.some(h => h.date && h.date.startsWith(dateStr));

        const btn = document.createElement('button');
        btn.className = 'day-btn' + (isToday ? ' today' : '') + (hasDot ? ' has-dot' : '');
        btn.innerHTML = `<span class="day-name">${days[i]}</span><span class="day-num">${d.getDate()}</span>`;
        container.appendChild(btn);
    }
}

// Generar cronograma dinâmico baseado no desempenho
// Pseudo-random simples com seed (evita embaralhar com Math.random() a cada render)
function _seededRandom(seed) {
    let s = seed;
    return function () {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0x100000000;
    };
}

function showActivityHistory() {
    const overlay = document.getElementById('activity-sheet-overlay');
    const body = document.getElementById('activity-sheet-body');
    if (!overlay || !body) return;

    const history = (state.quizHistory || []).slice().reverse();
    const discIcons = { humanas: '🌍', natureza: '🔬', linguagens: '📝', matematica: '➗', misto: '🎯' };
    const discNames = { humanas: 'Humanas', natureza: 'Ciências da Natureza', linguagens: 'Linguagens', matematica: 'Matemática', misto: 'Misto' };
    const discColors = { humanas: 'var(--teal)', natureza: '#a78bfa', linguagens: 'var(--gold)', matematica: 'var(--teal)', misto: '#a78bfa' };

    if (history.length === 0) {
        body.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:32px 0">Nenhum simulado ainda. Comece a estudar! 🚀</p>';
    } else {
        body.innerHTML = history.map(h => {
            const date = h.date ? new Date(h.date) : null;
            const dateStr = date ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '') : '';
            const timeStr = date ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
            const pct = h.pct ?? Math.round(((h.correct || 0) / Math.max(h.total || 1, 1)) * 100);
            const color = pct >= 70 ? '#22c55e' : pct >= 50 ? 'var(--orange)' : 'var(--red)';
            const icon = discIcons[h.discipline] || '🎯';
            const name = discNames[h.discipline] || (h.discipline || '').toUpperCase();
            return `
            <div class="ws-row">
                <div class="ws-day-col" style="min-width:38px">
                    <span style="font-size:22px">${icon}</span>
                </div>
                <div class="ws-info">
                    <span class="ws-area" style="color:${discColors[h.discipline] || 'var(--teal)'}">${name.toUpperCase()}</span>
                    <span class="ws-topic">${h.count || h.total || '?'} questões · ${dateStr}${timeStr ? ' · ' + timeStr : ''}</span>
                </div>
                <span style="font-size:15px;font-weight:800;color:${color}">${pct}%</span>
            </div>`;
        }).join('');
    }

    overlay.classList.add('active');
}

function closeActivityHistory() {
    const overlay = document.getElementById('activity-sheet-overlay');
    if (overlay) overlay.classList.remove('active');
}

function showWeekSchedule() {
    const overlay = document.getElementById('week-sheet-overlay');
    const body = document.getElementById('week-sheet-body');
    if (!overlay || !body) return;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const schedule = getDynamicSchedule(); // 6 slots seg–sáb
    const DAY_NAMES = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

    let html = '';
    for (let i = 0; i < 6; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const isToday = d.toDateString() === today.toDateString();
        const isPast  = d < today && !isToday;
        const dateStr = d.toISOString().split('T')[0];
        const studied = state.quizHistory.some(h => h.date && h.date.startsWith(dateStr));
        const subj = schedule[i] || schedule[i % schedule.length];

        const statusBadge = studied
            ? `<span class="ws-badge ws-done">✓ Estudado</span>`
            : isToday
            ? `<span class="ws-badge ws-today">Hoje</span>`
            : isPast
            ? `<span class="ws-badge ws-missed">Não feito</span>`
            : '';

        html += `
        <div class="ws-row${isToday ? ' ws-row-today' : ''}">
            <div class="ws-day-col">
                <span class="ws-day-name">${DAY_NAMES[i]}</span>
                <span class="ws-day-num">${d.getDate()}</span>
            </div>
            <div class="ws-info">
                <span class="ws-area">${subj.area}</span>
                <span class="ws-topic">${subj.title}</span>
            </div>
            <div class="ws-right">
                ${statusBadge}
                <button class="ws-start-btn" onclick="closeWeekSchedule();navigate('quiz-setup')">→</button>
            </div>
        </div>`;
    }

    body.innerHTML = html;
    overlay.classList.add('active');
}

function closeWeekSchedule() {
    const overlay = document.getElementById('week-sheet-overlay');
    if (overlay) overlay.classList.remove('active');
}

function getDynamicSchedule() {
    const allSubjects = [
        { disc: 'humanas',    area: 'CIÊNCIAS HUMANAS',    icon: '🌍', title: 'Geopolítica Contemporânea', sub: 'Globalização e Blocos Econômicos' },
        { disc: 'natureza',   area: 'CIÊNCIAS DA NATUREZA', icon: '🧬', title: 'Biologia: Genética',          sub: 'Leis de Mendel e Heredogramas' },
        { disc: 'linguagens', area: 'LINGUAGENS',            icon: '✍️', title: 'Redação ENEM',               sub: 'Proposta de Intervenção' },
        { disc: 'matematica', area: 'MATEMÁTICA',            icon: '➗', title: 'Funções do 2º Grau',          sub: 'Bhaskara e Vértice da Parábola' },
    ];

    // Ordenar: áreas com pior desempenho primeiro (mais frequentes)
    const stats = state.progress.stats;
    const withPct = allSubjects.map(s => {
        const st = stats[s.disc];
        const pct = st && st.total > 0 ? st.correct / st.total : 0.5;
        return { ...s, pct };
    });

    // Se tem preferência do onboarding, priorizar essas
    const weak = state.weakSubjects || [];
    withPct.forEach(s => { if (weak.includes(s.disc)) s.pct -= 0.2; });

    // Montar semana: 6 slots, distribuindo mais os mais fracos
    withPct.sort((a, b) => a.pct - b.pct);
    let pool = [...withPct, withPct[0], withPct[1]]; // fraquinhos aparecem 2x

    // Seed baseada na data: mesmo resultado durante todo o dia, muda a cada dia
    const dateSeed = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''), 10);
    const rand = _seededRandom(dateSeed);
    pool = pool.sort(() => rand() - 0.5).slice(0, 6);
    return pool;
}

function renderTodayCard() {
    // Usar agente de recomendação para mostrar a área mais prioritária do dia
    const recs = _getRecommendationAgent();
    const topRec = recs[0]; // área mais fraca / prioritária

    // Fallback para schedule dinâmico se agente não tiver dados
    const schedule = getDynamicSchedule();
    const dayIdx = new Date().getDay();
    const scheduleSubj = schedule[dayIdx % schedule.length];

    // Usar recomendação do agente se disponível, senão usar cronograma
    const DISC_AREA_MAP = {
        humanas: 'CIÊNCIAS HUMANAS', natureza: 'CIÊNCIAS DA NATUREZA',
        linguagens: 'LINGUAGENS', matematica: 'MATEMÁTICA',
    };
    const DISC_ICON_MAP = { humanas: '🌍', natureza: '🔬', linguagens: '📝', matematica: '➗' };

    const area  = topRec ? DISC_AREA_MAP[topRec.disc] || scheduleSubj.area  : scheduleSubj.area;
    const icon  = topRec ? DISC_ICON_MAP[topRec.disc]  || scheduleSubj.icon  : scheduleSubj.icon;
    const title = topRec ? topRec.topic : scheduleSubj.title;
    const sub   = topRec ? topRec.reason : scheduleSubj.sub;

    // Usar state.user.questoesHoje como fonte de verdade (tem reset diário real)
    const today = new Date().toDateString();
    const done  = state.user.questoesHojeData === today ? (state.user.questoesHoje || 0) : 0;
    const total = state.progress.totalHoje;
    const pct   = Math.round((done / total) * 100);

    // Para usuários do plano Grátis, sinalizamos visualmente quando o limite está próximo
    const remaining = getRemainingQuestions();
    const planLimit = !isPremium() ? PLANS.free.dailyLimit : null;
    const nearLimit  = planLimit !== null && remaining <= 3 && remaining > 0;
    const atLimit    = planLimit !== null && remaining <= 0;

    document.getElementById('today-area').textContent = area;
    document.getElementById('today-icon').textContent = icon;
    document.getElementById('today-title').textContent = title;
    document.getElementById('today-sub').textContent = sub;
    document.getElementById('today-progress').textContent = `${done}/${total} Questões`;
    document.getElementById('today-bar').style.width = pct + '%';

    // Feedback visual de limite (aplica classe no card se existir)
    const todayCard = document.getElementById('today-card') || document.querySelector('.today-card');
    if (todayCard) {
        todayCard.classList.toggle('plan-limit-low',     nearLimit);
        todayCard.classList.toggle('plan-limit-reached', atLimit);
    }
}

// =====================================================
// DESAFIO DIÁRIO
// =====================================================
const _CHALLENGE_DISCS = ['humanas', 'natureza', 'linguagens', 'matematica', 'misto'];
const _CHALLENGE_COUNTS = [5, 5, 10, 10];          // quantidade de questões possíveis
const _CHALLENGE_XP    = { 5: 50, 10: 100, 15: 150 };
const _CHALLENGE_NAMES = {
    humanas:    'Ciências Humanas',
    natureza:   'Ciências da Natureza',
    linguagens: 'Linguagens',
    matematica: 'Matemática',
    misto:      'Desafio Misto',
};

function _generateDailyChallenge() {
    const today = new Date().toISOString().slice(0, 10);
    // Determinístico: seed pela data
    const seed  = parseInt(today.replace(/-/g, ''), 10);
    const rand  = _seededRandom(seed);

    const disc  = _CHALLENGE_DISCS[Math.floor(rand() * _CHALLENGE_DISCS.length)];
    const count = _CHALLENGE_COUNTS[Math.floor(rand() * _CHALLENGE_COUNTS.length)];
    const xp    = _CHALLENGE_XP[count] || 50;
    return { date: today, discipline: disc, count, xp, done: false };
}

function _ensureDailyChallenge() {
    const today = new Date().toISOString().slice(0, 10);
    if (!state.dailyChallenge || state.dailyChallenge.date !== today) {
        state.dailyChallenge = _generateDailyChallenge();
        saveState();
    }
    return state.dailyChallenge;
}

function renderDailyChallenge() {
    const el = document.getElementById('daily-challenge-card');
    if (!el) return;
    const ch = _ensureDailyChallenge();

    const discName = _CHALLENGE_NAMES[ch.discipline] || ch.discipline;
    const titleEl  = el.querySelector('.dc-title');
    const descEl   = el.querySelector('.dc-desc');
    const xpEl     = el.querySelector('.dc-xp');
    const btnEl    = el.querySelector('.dc-btn');
    const checkEl  = el.querySelector('.dc-check');

    if (titleEl) titleEl.textContent = ch.done ? '✅ Desafio Concluído!' : '🎯 Desafio do Dia';
    if (descEl)  descEl.textContent  = `${ch.count} questões de ${discName}`;
    if (xpEl)    xpEl.textContent    = `+${ch.xp} XP`;
    if (btnEl)   btnEl.style.display = ch.done ? 'none' : '';
    if (checkEl) checkEl.style.display = ch.done ? '' : 'none';
    el.classList.toggle('completed', ch.done);
}

function startDailyChallenge() {
    const ch = _ensureDailyChallenge();
    if (ch.done) return;
    // Guardar referência para detectar completion em showResult()
    quizState._isDailyChallenge = true;
    quizState._dailyChallengeTarget = ch.count;
    quizState._dailyChallengeDisc   = ch.discipline;
    navigate('quiz-setup');
    // Pré-selecionar a disciplina e quantidade do desafio
    quizSetup.discipline = ch.discipline;
    quizSetup.count      = ch.count;
    renderQuizSetup();
}

/** Verifica e completa o desafio diário se o quiz atual bater as condições */
function _checkDailyChallengeCompletion() {
    if (!quizState._isDailyChallenge) return;
    const ch = _ensureDailyChallenge();
    if (ch.done) return;

    const sameDisc = quizState._dailyChallengeDisc === 'misto'
        || quizState.discipline === quizState._dailyChallengeDisc;
    const metTarget = quizState.questions.length >= quizState._dailyChallengeTarget;
    if (!sameDisc || !metTarget) return;

    state.dailyChallenge.done = true;
    state.user.xp += ch.xp;
    state.user.level = Math.max(1, Math.floor(state.user.xp / 500) + 1);
    quizState._isDailyChallenge = false;
    saveState();

    _pushNotification({
        type: 'green',
        icon: '🎯',
        title: 'Desafio Diário Concluído!',
        body: `Parabéns! Você completou o desafio de hoje e ganhou +${ch.xp} XP bônus!`,
    });
}

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
    // Fallback sem DOMPurify: remove todas as tags (conservador)
    return String(html).replace(/<script[\s\S]*?<\/script>/gi, '')
                       .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
                       .replace(/on\w+\s*=/gi, '');
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

// =====================================================
// NOTIFICATIONS
// =====================================================
function renderNotifications() {
    const list = document.getElementById('notif-list');
    const tab = document.querySelector('.notif-tab.active');
    const showUnreadOnly = tab && tab.textContent.trim() === 'Não lidas';
    renderNotifList(showUnreadOnly);
}

// Normalizar campo `date` de notificação para categoria de exibição
function _notifDateGroup(n) {
    // Aceita 'today'/'yesterday' legados e ISO strings das notificações novas
    if (n.date === 'today') return 'today';
    if (n.date === 'yesterday') return 'yesterday';
    if (!n.date) return 'more';
    try {
        const d = new Date(n.date);
        const todayStr = new Date().toDateString();
        const yStr = new Date(Date.now() - 86400000).toDateString();
        if (d.toDateString() === todayStr) return 'today';
        if (d.toDateString() === yStr) return 'yesterday';
        return 'more';
    } catch { return 'more'; }
}

function renderNotifList(unreadOnly = false) {
    const list = document.getElementById('notif-list');
    list.innerHTML = '';

    const notifs = state.notifications || [];
    const filtered = unreadOnly ? notifs.filter(n => n.unread) : notifs;

    const groups = [
        { key: 'today',     label: 'HOJE' },
        { key: 'yesterday', label: 'ONTEM' },
        { key: 'more',      label: 'ANTERIORES' },
    ];

    groups.forEach(g => {
        const items = filtered.filter(n => _notifDateGroup(n) === g.key);
        if (items.length === 0) return;
        const header = document.createElement('div');
        header.className = 'notif-date-group';
        header.textContent = g.label;
        list.appendChild(header);
        items.forEach(n => list.appendChild(createNotifItem(n)));
    });

    if (list.children.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:40px 16px;color:var(--text-muted);font-size:14px;">Nenhuma notificação não lida 🎉</div>';
    }
}

// Telas permitidas em CTAs de notificação (whitelist)
const _NOTIF_CTA_ALLOWED = new Set(Object.keys(screenMap));

function createNotifItem(n) {
    const el = document.createElement('div');
    el.className = 'notif-item' + (n.unread ? ' unread' : '');

    // type como classe CSS — aceitar apenas valores conhecidos
    const safeType = ['blue','orange','purple','green','yellow','red'].includes(n.type) ? n.type : 'blue';
    const iconWrap = document.createElement('div');
    iconWrap.className = 'notif-icon-wrap ' + safeType;
    iconWrap.textContent = n.icon;  // emoji — textContent é seguro

    const contentEl = document.createElement('div');
    contentEl.className = 'notif-content';

    const titleEl = document.createElement('div');
    titleEl.className = 'notif-title';
    titleEl.textContent = n.title;

    const bodyEl = document.createElement('div');
    bodyEl.className = 'notif-body';
    bodyEl.textContent = n.body;

    contentEl.appendChild(titleEl);
    contentEl.appendChild(bodyEl);

    // CTA — nunca executar string dinâmica; usar rota validada
    if (n.cta && n.ctaScreen && _NOTIF_CTA_ALLOWED.has(n.ctaScreen)) {
        const ctaEl = document.createElement('span');
        ctaEl.className = 'notif-cta';
        ctaEl.textContent = n.cta;
        ctaEl.addEventListener('click', (e) => {
            e.stopPropagation();
            markNotifRead(n.id);
            navigate(n.ctaScreen);
        });
        contentEl.appendChild(ctaEl);
    }

    const rightEl = document.createElement('div');
    rightEl.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0';

    const timeEl = document.createElement('span');
    timeEl.className = 'notif-time';
    timeEl.textContent = n.time;
    rightEl.appendChild(timeEl);

    if (n.unread) {
        const dotEl = document.createElement('div');
        dotEl.className = 'notif-unread-dot';
        rightEl.appendChild(dotEl);
    }

    el.appendChild(iconWrap);
    el.appendChild(contentEl);
    el.appendChild(rightEl);
    el.addEventListener('click', () => markNotifRead(n.id));
    return el;
}

function markNotifRead(id) {
    const n = state.notifications.find(n => n.id === id);
    if (n) {
        n.unread = false;
        saveState();
        renderNotifications();
        // Update bell badge
        const unread = state.notifications.filter(n => n.unread).length;
        const badge = document.getElementById('notif-count');
        if (badge) {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }
    }
}

function markAllRead() {
    state.notifications.forEach(n => n.unread = false);
    saveState();
    renderNotifications();
    const badge = document.getElementById('notif-count');
    if (badge) badge.style.display = 'none';
}

function filterNotif(type, btn) {
    document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderNotifList(type === 'unread');
}

// =====================================================
// SETTINGS
// =====================================================
function renderSettings() {
    const s = state.user;
    const safeName = (s.name && s.name.trim()) ? s.name : 'Estudante';

    // Cabeçalho
    const avatarEl = document.getElementById('settings-avatar');
    const nameEl   = document.getElementById('settings-name');
    const goalEl   = document.getElementById('settings-goal');
    if (avatarEl) avatarEl.textContent = safeName[0].toUpperCase();
    if (nameEl)   nameEl.textContent   = safeName;
    if (goalEl)   goalEl.textContent   = s.goal ? `Meta: ${s.goal}` : '';

    // Campos editáveis
    const inputName   = document.getElementById('input-name');
    const inputEmail  = document.getElementById('input-email');
    const inputSchool = document.getElementById('input-school');
    if (inputName)   inputName.value   = s.name   || '';
    if (inputEmail)  inputEmail.value  = s.email  || '';
    if (inputSchool) inputSchool.value = s.school || '';

    // Push notification card
    _renderPushNotifCard();
}

function saveSettings() {
    const name = document.getElementById('input-name').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const school = document.getElementById('input-school').value.trim();

    if (name) state.user.name = name;
    if (email) state.user.email = email;
    if (school) state.user.school = school;
    saveState();

    // Sincronizar com Supabase em background
    if (typeof getCurrentUser !== 'undefined') {
        getCurrentUser().then(user => {
            if (user) saveUserData(user.id).catch(() => {});
        }).catch(() => {});
    }

    // Visual feedback
    const btn = document.getElementById('save-settings-btn');
    const original = btn.textContent;
    btn.textContent = '✅ Salvo com sucesso!';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
    }, 2000);
}

async function logout() {
    if (confirm('Tem certeza que deseja sair da conta?')) {
        // Apagar a sessão Supabase do localStorage (todas as chaves sb-*)
        Object.keys(localStorage)
            .filter(k => k.startsWith('sb-'))
            .forEach(k => localStorage.removeItem(k));
        localStorage.removeItem('enem_state');
        sessionStorage.clear();

        if (typeof logoutUser !== 'undefined') {
            await logoutUser();
        }
        state = JSON.parse(JSON.stringify(defaultState));
        saveState();
        navigate('login');
        const passEl = document.getElementById('login-password');
        if (passEl) passEl.value = '';
    }
}

// =====================================================
// LOGIN
// =====================================================

async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    errorEl.textContent = '';

    if (!email.includes('@')) {
        errorEl.textContent = 'Digite um e-mail válido.';
        document.getElementById('login-email').focus();
        return;
    }
    if (password.length < 6) {
        errorEl.textContent = 'A senha deve ter ao menos 6 caracteres.';
        document.getElementById('login-password').focus();
        return;
    }

    btn.textContent = 'Entrando...';
    btn.disabled = true;

    try {
        const result = await loginUser(email, password);
        if (result.success) {
            // Carregar dados do perfil e plano do servidor
            await Promise.all([
                loadUserData(result.user.id),
                typeof loadUserPlan !== 'undefined' ? loadUserPlan(result.user.id) : Promise.resolve(),
            ]).catch(() => {});
            state.user.id = result.user.id;
            state.user.email = email;
            state.onboardingDone = true;
            state.currentScreen = 'login'; // garante que navigate('home') não seja bloqueado
            saveState();
            // Persistir/atualizar registro do usuário no banco ao logar
            if (typeof saveUserData !== 'undefined') await saveUserData(result.user.id).catch(() => {});
            if (typeof startSyncLoop !== 'undefined') startSyncLoop(result.user.id);
            // Solicitar permissão de notificações push após login
            _requestPushPermission();
            // Rastrear login
            _trackEvent('login', { method: 'email' });
            navigate('home');
        } else {
            const msg = result.error || '';
            if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) {
                errorEl.textContent = 'E-mail ou senha incorretos.';
            } else if (msg.includes('Email not confirmed')) {
                errorEl.innerHTML = 'E-mail não confirmado. Verifique sua caixa de entrada ou <a href="#" onclick="handleForgotPassword();return false;" style="color:var(--accent);text-decoration:underline">reenviar confirmação</a>.';
            } else {
                errorEl.textContent = 'Erro ao entrar. Tente novamente.';
            }
        }
    } catch (e) {
        errorEl.textContent = 'Sem conexão. Verifique sua internet.';
    } finally {
        btn.textContent = 'Entrar →';
        btn.disabled = false;
    }
}

function openPayment() {
    navigate('checkout');
}

// =====================================================
// CHECKOUT — PAGAMENTO PREMIUM
// =====================================================
let _checkoutPlan = 'mensal';
let _checkoutMethod = 'pix';

// URLs de checkout externo (atualize com seus links reais de Hotmart/Kiwify)
const CHECKOUT_URLS = {
    mensal: 'https://pay.hotmart.com/XXXXXXX?checkoutMode=2',
    anual:  'https://pay.hotmart.com/XXXXXXX?checkoutMode=2&offerId=ANNUAL',
};
const PIX_KEY       = 'contato@enemmaster.com.br'; // Sua chave PIX real
const WHATSAPP_NUM  = '5511999999999';              // Seu número com DDI+DDD

// Dados de preço centralizados
const PLAN_PRICES = {
    mensal: { label: 'R$ 19,90', period: '/mês',  whatsapp: 'R%2419%2C90%20(mensal)', title: 'Premium Mensal',  sub: 'Acesso ilimitado · cancele quando quiser' },
    anual:  { label: 'R$ 149,00', period: '/ano', whatsapp: 'R%24149%2C00%20(anual)', title: 'Premium Anual 🏆', sub: 'Economize 37% · R$ 12,42/mês · melhor custo-benefício' },
};

function renderCheckout() {
    // Guard: se já é premium, exibir estado ativo e não o formulário de compra
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

    // Restaurar seleção
    selectCheckoutPlan(_checkoutPlan);
    selectPaymentMethod(_checkoutMethod);
    // Limpar feedback
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

    // Atualizar cartão de resumo
    const cpsTitle = document.getElementById('cps-title');
    const cpsSub   = document.getElementById('cps-sub');
    const cpsPrice = document.getElementById('cps-price');
    const cpsPriceSub = document.getElementById('cps-price-sub');
    if (cpsTitle) cpsTitle.textContent = prices.title;
    if (cpsSub)   cpsSub.textContent   = prices.sub;
    if (cpsPrice) cpsPrice.textContent = prices.label;
    if (cpsPriceSub) cpsPriceSub.textContent = prices.period;

    // Atualizar preço exibido no cartão PIX
    const pixPriceEl = document.getElementById('pix-price-display');
    if (pixPriceEl) pixPriceEl.textContent = prices.label;

    // Atualizar link WhatsApp
    const wa = document.getElementById('pix-whatsapp-btn');
    if (wa) wa.href = `https://wa.me/${WHATSAPP_NUM}?text=Ol%C3%A1!%20Realizei%20o%20pagamento%20do%20ENEM%20Master%20Premium%20${prices.whatsapp}%20via%20PIX.%20Segue%20o%20comprovante.`;
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

function copyPixKey() {
    const key = PIX_KEY;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(key).then(() => {
            const btn = document.querySelector('.pix-copy-btn');
            if (btn) { btn.textContent = '✅ Copiado!'; setTimeout(() => btn.textContent = '📋 Copiar', 2500); }
        });
    } else {
        // fallback para navegadores antigos
        const ta = document.createElement('textarea');
        ta.value = key;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        const btn = document.querySelector('.pix-copy-btn');
        if (btn) { btn.textContent = '✅ Copiado!'; setTimeout(() => btn.textContent = '📋 Copiar', 2500); }
    }
}

function goToCardCheckout() {
    const url = CHECKOUT_URLS[_checkoutPlan] || CHECKOUT_URLS.mensal;
    window.open(url, '_blank', 'noopener,noreferrer');
    // Persistir pagamento pendente — sobrevive a troca de aba e refresh
    try { sessionStorage.setItem('_pendingPayment', _checkoutPlan); } catch { /* noop */ }
    // Mostrar botão "Já paguei" após abrir link externo
    const verifyBtn = document.getElementById('card-verify-btn');
    if (verifyBtn) verifyBtn.style.display = '';
    // Iniciar polling automático silencioso (sem modal)
    _startPlanPolling('card', false);
}

function verifyCardPayment() {
    showPaymentWaiting('card');
}

function verifyPixPayment() {
    showPaymentWaiting('pix');
}

// ══════════════════════════════════════════════
//  TOGGLE DE PERÍODO NA TELA DE PLANOS
// ══════════════════════════════════════════════
let _plansPeriod = 'mensal';

function selectPlanPeriod(period) {
    _plansPeriod = period;
    document.getElementById('ppt-mensal')?.classList.toggle('active', period === 'mensal');
    document.getElementById('ppt-anual')?.classList.toggle('active', period === 'anual');
    document.getElementById('ppt-mensal')?.setAttribute('aria-pressed', period === 'mensal');
    document.getElementById('ppt-anual')?.setAttribute('aria-pressed', period === 'anual');

    const priceEl   = document.getElementById('plan-premium-price');
    const anualEl   = document.getElementById('plan-anual-destaque');
    const mensalSub = document.getElementById('plan-mensal-sub');
    const scroll    = document.getElementById('plans-scroll');

    if (period === 'anual') {
        if (priceEl) priceEl.innerHTML = 'R$ 149,00<span class="plan-period">/ano</span>';
        if (anualEl) anualEl.style.display = 'block';
        if (mensalSub) mensalSub.style.display = 'none';
        scroll?.classList.add('period-anual');
    } else {
        if (priceEl) priceEl.innerHTML = 'R$ 19,90<span class="plan-period">/mês</span>';
        if (anualEl) anualEl.style.display = 'none';
        if (mensalSub) mensalSub.style.display = 'block';
        scroll?.classList.remove('period-anual');
    }

    // Badge do plano grátis
    const freeBadge = document.getElementById('plan-free-badge');
    if (freeBadge) freeBadge.textContent = isPremium() ? 'INATIVO' : 'ATUAL';
}

function openCheckoutFromPlans() {
    // Propagar o período selecionado para o checkout
    _checkoutPlan = _plansPeriod;
    navigate('checkout');
}

// ══════════════════════════════════════════════
//  POLLING DE PLANO — AUTO-ATIVAÇÃO PREMIUM
// ══════════════════════════════════════════════

let _planPollingInterval = null;
let _planPollingTimeout  = null;
let _planPollingCount    = 0;

const POLL_INTERVAL_MS  = 8000;   // 8 segundos entre tentativas
const POLL_MAX_ATTEMPTS = 75;     // 10 minutos (~75 × 8s)

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
    // Evitar intervalos duplicados
    _stopPlanPolling(false);
    _planPollingCount = 0;

    // Guardar o plano atual para comparar
    const planBefore = state.user?.plan || 'free';

    const statusEl  = document.getElementById('pw-status-text');
    const hintEl    = document.getElementById('pw-hint-text');
    const progressEl= document.getElementById('pw-progress-bar');

    _planPollingInterval = setInterval(async () => {
        _planPollingCount++;

        const userId = state.user?.id;
        if (!userId) {
            // Sem login, cancelar
            _stopPlanPolling(false);
            return;
        }

        // Atualizar progresso visual
        if (progressEl) {
            const pct = Math.min((_planPollingCount / POLL_MAX_ATTEMPTS) * 100, 100);
            progressEl.style.width = pct + '%';
        }
        if (hintEl) {
            hintEl.textContent = `Verificando... (tentativa ${_planPollingCount} de ${POLL_MAX_ATTEMPTS})`;
        }

        try {
            const result = await loadUserPlan(userId);
            if (result.plan === 'premium' && planBefore !== 'premium') {
                // PLANO MUDOU → ativar premium!
                _stopPlanPolling(true);
                return;
            }
        } catch (e) {
            console.warn('Polling erro:', e);
        }

        // Timeout após máximo de tentativas
        if (_planPollingCount >= POLL_MAX_ATTEMPTS) {
            _stopPlanPolling(false);
            if (statusEl) statusEl.textContent = '⏱ Tempo esgotado. Se já pagou, use o código de ativação abaixo.';
            if (hintEl) hintEl.textContent = 'Entre em contato pelo WhatsApp se precisar de ajuda.';
        }
    }, POLL_INTERVAL_MS);
}

function _stopPlanPolling(success) {
    if (_planPollingInterval) {
        clearInterval(_planPollingInterval);
        _planPollingInterval = null;
    }
    if (_planPollingTimeout) {
        clearTimeout(_planPollingTimeout);
        _planPollingTimeout = null;
    }
    if (success) {
        // Limpar flag de pagamento pendente
        try { sessionStorage.removeItem('_pendingPayment'); } catch { /* noop */ }
        const waitModal = document.getElementById('payment-waiting-modal');
        if (waitModal) waitModal.classList.remove('active');
        _showPremiumSuccess();
    }
}

// Retomar polling de pagamento pendente entre sessões/abas
function _resumePendingPayment() {
    let pending;
    try { pending = sessionStorage.getItem('_pendingPayment'); } catch { return; }
    if (!pending) return;

    // Sem usuário logado — aguardar
    if (!state.user?.id) return;

    // Já é premium — limpar e celebrar
    if (isPremium()) {
        try { sessionStorage.removeItem('_pendingPayment'); } catch { /* noop */ }
        setTimeout(() => _showPremiumSuccess(), 600);
        return;
    }

    // Retomou com pagamento pendente — polling silencioso em background
    _checkoutPlan = pending;
    console.log('⏳ Retomando polling de pagamento:', pending);
    setTimeout(() => _startPlanPolling(pending, false), 1200);
}

function _showPremiumSuccess() {
    const modal = document.getElementById('premium-success-modal');
    if (!modal) return;
    modal.classList.add('active');
    _launchConfetti();
    // Atualizar badge de plano na UI se existir
    const badgeEls = document.querySelectorAll('.plan-badge, .user-plan-label');
    badgeEls.forEach(el => { el.textContent = 'Premium 👑'; el.classList.add('premium'); });
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
    const colors = ['#FFD700','#FF6B35','#4CAF50','#2196F3','#E91E63','#9C27B0'];
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

async function activateWithCode() {
    const input = document.getElementById('activation-code-input');
    const btn   = document.getElementById('activate-btn');
    const fb    = document.getElementById('code-feedback');
    const code  = (input?.value || '').trim().toUpperCase();

    if (!code || code.length < 6) {
        _showCodeFeedback('error', '⚠️ Digite um código válido.');
        return;
    }

    // Verificar login
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
            // Esconder feedback de texto e mostrar celebração premium
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

function showPaywall(title, body) {
    const el = document.getElementById('paywall-modal');
    if (!el) return;
    document.getElementById('paywall-title').textContent = title || 'Limite atingido 🔒';
    document.getElementById('paywall-body').textContent = body || 'Assine o Premium para estudar sem limites.';
    el.classList.add('active');
}

function closePaywall() {
    const el = document.getElementById('paywall-modal');
    if (el) el.classList.remove('active');
}

function goToRegister() {
    // Limpar state antes de ir para onboarding
    const obNameEl = document.getElementById('ob-name');
    const obEmailEl = document.getElementById('ob-email');
    const obPassEl = document.getElementById('ob-password');
    if (obNameEl) obNameEl.value = '';
    if (obEmailEl) obEmailEl.value = '';
    if (obPassEl) obPassEl.value = '';
    navigate('onboarding');
}

function toggleLoginPassword(btn) {
    const input = document.getElementById('login-password');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.style.color = isHidden ? 'var(--teal)' : 'var(--text-muted)';
}

async function changePassword() {
    const btn = document.getElementById('change-password-btn');
    const msgEl = document.getElementById('change-password-msg');
    const email = state.user.email || '';

    if (!email) {
        if (msgEl) { msgEl.textContent = '❌ Nenhum e-mail associado à conta.'; msgEl.style.color = 'var(--red, #ef4444)'; msgEl.style.display = ''; }
        return;
    }

    if (btn) { btn.disabled = true; }
    if (msgEl) { msgEl.textContent = 'Enviando...'; msgEl.style.color = 'var(--text-secondary)'; msgEl.style.display = ''; }

    try {
        const sb = window.supabase;
        if (!sb) throw new Error('Serviço indisponível.');
        const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname,
        });
        if (error) throw error;
        if (msgEl) { msgEl.textContent = `✅ E-mail enviado para ${email}. Verifique sua caixa de entrada.`; msgEl.style.color = 'var(--teal, #00b4a6)'; }
    } catch (e) {
        if (msgEl) { msgEl.textContent = '❌ ' + (e.message || 'Erro ao enviar. Tente novamente.'); msgEl.style.color = 'var(--red, #ef4444)'; }
    } finally {
        if (btn) { btn.disabled = false; }
    }
}

async function handleForgotPassword() {
    const emailEl = document.getElementById('login-email');
    const email = emailEl.value.trim();
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

// =====================================================
// SUPPORT / FAQ
// =====================================================
function toggleFAQ(btn) {
    const item = btn.closest('.faq-item');
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
        { id: '100_questoes',   icon: '💯', name: '100 Questões',    xp: 100, hint: 'Responda 100 questões corretamente',   check: () => (state.progress.totalCorretas||0) >= 100 },
        { id: '500_questoes',   icon: '🏅', name: '500 Questões',    xp: 200, hint: 'Responda 500 questões corretamente',   check: () => (state.progress.totalCorretas||0) >= 500 },
        { id: 'o_maratonista',  icon: '🏃', name: 'O Maratonista',   xp: 400, hint: 'Responda 1000 questões corretamente',  check: () => (state.progress.totalCorretas||0) >= 1000 },
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

        // Persistir conquistas no Supabase (usuário logado)
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

        // Mostrar toasts em sequência
        newlyUnlocked.forEach((badge, i) => {
            setTimeout(() => showBadgeToast(badge), i * 2200);
        });
        // Notificação real para a primeira conquista desbloqueada
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

// ──────────────────────────────────────────────────────────────────────────────
// NOTIFICAÇÕES REAIS
// ──────────────────────────────────────────────────────────────────────────────
const NOTIF_LIMIT = 50;

/**
 * Adiciona uma notificação à lista do usuário.
 * @param {{ type:string, icon:string, title:string, body:string, ctaScreen?:string, cta?:string }} opts
 */
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

    // Atualiza o badge sem re-renderizar a tela inteira
    const unread = state.notifications.filter(n => n.unread).length;
    const badge = document.getElementById('notif-count');
    if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// SPARKLINE DE PROGRESSO HISTÓRICO
// ──────────────────────────────────────────────────────────────────────────────
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
    const trendIcon = trend === 'up' ? '↑' : '↓';
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

    // Área preenchida sob a linha
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

    // Sub-texto com tendência
    const subEl = container.querySelector('.sparkline-sub');
    if (subEl) {
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

// Toast rápido de XP / feedback — criado dinamicamente, sem HTML template
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

    // Calcular totais
    const allBadges = Object.entries(BADGE_DEFINITIONS).flatMap(([cat, defs]) =>
        defs.map(b => ({ ...b, cat }))
    );
    const totalBadges = allBadges.length;
    const totalUnlocked = Object.values(state.badges).flat().length;
    const pct = Math.round((totalUnlocked / totalBadges) * 100);
    const totalXp = Object.entries(BADGE_DEFINITIONS).reduce((sum, [cat, defs]) => {
        return sum + defs.reduce((s, b) =>
            (state.badges[cat] || []).includes(b.id) ? s + (b.xp || 50) : s, 0);
    }, 0);

    // Atualizar stats strip
    const unlockedEl = document.getElementById('ach-total-unlocked');
    const xpEl      = document.getElementById('ach-total-xp');
    const compEl    = document.getElementById('ach-completion');
    if (unlockedEl) unlockedEl.textContent = `${totalUnlocked}/${totalBadges}`;
    if (xpEl)       xpEl.textContent       = `+${totalXp}`;
    if (compEl)     compEl.textContent     = pct + '%';

    // Atualizar badge-sections
    document.querySelectorAll('.badge-section').forEach((section, idx) => {
        const categories = ['ofensiva', 'especialista', 'maratonista'];
        const cat = categories[idx];
        if (!cat) return;
        const defs = BADGE_DEFINITIONS[cat];
        const unlocked = state.badges[cat] || [];

        // Header count
        const countEl = section.querySelector('.badge-count');
        if (countEl) countEl.textContent = `${unlocked.length}/${defs.length} Desbloqueados`;

        // Grid
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

    // Próxima grande conquista
    const nextBadge = allBadges.find(b => !state.badges[b.cat]?.includes(b.id));
    if (nextBadge) {
        document.querySelector('.na-title').textContent = nextBadge.name;
        document.querySelector('.na-icon').textContent = nextBadge.icon;
        const descEl = document.querySelector('.na-desc');
        if (descEl) descEl.textContent = nextBadge.hint || 'Continue estudando para desbloquear.';
        document.querySelector('.progress-count.teal').textContent = pct + '%';
        document.querySelector('.next-achievement-card .progress-bar').style.width = pct + '%';
        document.querySelector('.na-remaining').textContent = `${totalUnlocked} de ${totalBadges} desbloqueados`;
        const xpRewardEl = document.querySelector('.na-xp-el');
        if (xpRewardEl) xpRewardEl.textContent = `+${nextBadge.xp || 50} XP`;
    }
}

// =====================================================
// PROFILE — STATS DINÂMICAS
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
                    <span class="ppc-icon">👑</span>
                    <div class="ppc-info">
                        <span class="ppc-name">Plano Premium</span>
                        <span class="ppc-sub">Ativo · simulados e redação ilimitados${exp ? ` · até ${exp}` : ''}</span>
                    </div>
                    <span class="ppc-active">ATIVO</span>
                </div>`;
        } else {
            const remText = remaining <= 0
                ? 'Limite diário atingido 🔒'
                : remaining <= 3
                    ? `⚠️ Apenas ${remaining} ${remaining === 1 ? 'questão restante' : 'questões restantes'} hoje`
                    : `${remaining} questões restantes hoje`;
            planStatusEl.innerHTML = `
                <div class="profile-plan-card profile-plan-free">
                    <span class="ppc-icon">⚡</span>
                    <div class="ppc-info">
                        <span class="ppc-name">Plano Grátis</span>
                        <span class="ppc-sub">${remText}</span>
                    </div>
                    <button class="ppc-upgrade-btn" onclick="navigate('plans')">Upgrade 👑</button>
                </div>`;
        }
    }

    // Área grid dinâmica
    renderAreaGrid();

    // Metas pessoais dinâmicas
    renderGoals();

    // Atividade recente (últimos badges)
    renderRecentActivity();

    // Retrospectiva mensal
    renderMonthlyRetro();
}

function renderAreaGrid() {
    const grid = document.getElementById('area-grid');
    if (!grid) return;

    const areas = [
        { disc: 'humanas',    icon: '📚', name: 'HUMANAS' },
        { disc: 'natureza',   icon: '🔬', name: 'NATUREZA' },
        { disc: 'linguagens', icon: '📝', name: 'LINGUAGENS' },
        { disc: 'matematica', icon: '➗', name: 'MATEMÁTICA' },
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
            <span class="area-pct" style="color:${color}">${st.total > 0 ? pct + '%' : '—'}</span>
            <div class="progress-bar-wrap thin">
                <div class="progress-bar" style="width:${pct}%"></div>
            </div>
            <span class="area-questions">${st.total > 0 ? st.correct + '/' + st.total + ' acertos' : 'Nenhuma questão ainda'}</span>
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

    // --- Meta 2: Questões hoje ---
    const todayDone = state.user.questoesHojeData === todayStr ? (state.user.questoesHoje || 0) : 0;
    const todayTotal = state.user.dailyGoal || state.progress.totalHoje || 10;
    const topRec = _getRecommendationAgent()[0];
    const areaLabel = topRec ? topRec.area : 'Questões';
    const areaIcon  = topRec ? topRec.icon : '🎯';

    // --- Meta 3: Ofensiva ---
    const streak = state.user.streak || 0;
    const studiedToday = (state.quizHistory || []).some(h => h.date && new Date(h.date).toDateString() === todayStr);

    const goals = [
        {
            icon: '📋', iconBg: 'teal-bg-sm',
            title: 'Simulados Semanais',
            sub: weeklyDone >= weeklyGoal ? 'Meta da semana atingida! 🎉' : `Faltam ${weeklyGoal - weeklyDone} para a meta — até domingo`,
            done: weeklyDone >= weeklyGoal,
            badge: weeklyDone >= weeklyGoal ? null : `${weeklyDone}/${weeklyGoal}`,
        },
        {
            icon: areaIcon, iconBg: 'teal-bg-sm',
            title: `Questões de Hoje`,
            sub: todayDone >= todayTotal ? 'Meta diária concluída! 🔥' : `${todayTotal - todayDone} restantes · foco em ${areaLabel}`,
            done: todayDone >= todayTotal,
            badge: todayDone >= todayTotal ? null : `${todayDone}/${todayTotal}`,
        },
    ];

    if (streak >= 2 || studiedToday) {
        goals.push({
            icon: '🔥', iconBg: 'orange-bg-sm',
            title: streak > 0 ? `Ofensiva: ${streak} dia${streak > 1 ? 's' : ''}` : 'Manter Ofensiva',
            sub: studiedToday ? 'Já estudou hoje — sequência mantida!' : 'Estude hoje para não perder a sequência',
            done: studiedToday,
            badge: null,
        });
    }

    el.innerHTML = '';
    goals.forEach(g => {
        const right = g.done
            ? `<span class="goal-check">✅</span>`
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
// RETROSPECTIVA MENSAL — Wrapped
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

    // Tempo real de sessão (durationMinutes salvo desde v2; fallback 1.5 min/questão)
    const studyMinutes = entries.reduce((acc, h) =>
        acc + (h.durationMinutes != null ? h.durationMinutes : Math.round((h.total || 0) * 1.5)), 0);
    const studyHours = studyMinutes >= 60
        ? `${Math.floor(studyMinutes / 60)}h${studyMinutes % 60 > 0 ? (studyMinutes % 60) + 'min' : ''}`
        : `${studyMinutes}min`;

    const areaNames = { humanas: 'Humanas', natureza: 'Natureza', linguagens: 'Linguagens', matematica: 'Mat.', misto: 'Misto' };
    const areaIcons = { humanas: '📚', natureza: '🔬', linguagens: '📝', matematica: '➗', misto: '🎯' };

    // ── Erros reais do mês via wrongAnswers ──
    const AREA_TO_DISC = {
        'CIÊNCIAS HUMANAS': 'humanas', 'CIÊNCIAS DA NATUREZA': 'natureza',
        'LINGUAGENS': 'linguagens', 'MATEMÁTICA': 'matematica',
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

    // ── Acurácia por disciplina do mês (quizHistory de disciplina específica) ──
    const areaStats = {};
    entries.forEach(h => {
        const d = h.discipline || 'misto';
        if (d === 'misto') return; // misto não representa uma disciplina
        if (!areaStats[d]) areaStats[d] = { correct: 0, total: 0 };
        areaStats[d].correct += (h.correct || 0);
        areaStats[d].total   += (h.total || 0);
    });

    // Complementar com progress.stats (dados reais acumulados) se não houver
    // quizzes por disciplina no mês
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

    // Pior área: prioridade para a que tem mais erros reais no mês
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

    // Sem dados no mês atual → tentar mês anterior
    if (!retro) {
        month = month === 0 ? 11 : month - 1;
        year  = (month === 11 && now.getMonth() === 0) ? year - 1 : year;
        retro = computeMonthlyRetro(month, year);
    }

    const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                         'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    if (!retro) {
        wrap.innerHTML = `
            <div class="section-header"><span class="section-title">RETROSPECTIVA DO MÊS</span></div>
            <div class="retro-empty-card">
                <div style="font-size:32px;margin-bottom:8px">📊</div>
                <p>Responda alguns simulados para ver<br>sua retrospectiva mensal!</p>
            </div>`;
        return;
    }

    const monthLabel  = `${MONTH_NAMES[month]} ${year}`;

    // Melhor matéria: badge "(global)" se vier de progress.stats
    const bestLabel = retro.bestArea
        ? `${retro.areaIcons[retro.bestArea.disc]} ${retro.areaNames[retro.bestArea.disc]} (${retro.bestArea.pct}%${retro.bestArea.isGlobal ? ' geral' : ''})`
        : '—';

    // Pior matéria: prefere matéria com mais erros reais no mês
    let worstLabel = null;
    if (retro.worstArea) {
        const wa = retro.worstArea;
        const pctStr = wa.pct != null ? ` (${wa.pct}%)` : '';
        const errStr = wa.erros != null ? ` · ${wa.erros} erros` : '';
        worstLabel = `${retro.areaIcons[wa.disc]} ${retro.areaNames[wa.disc]}${pctStr}${errStr}`;
    }

    // Tempo: indicar se é real ou estimado
    const hasRealTime = (state.quizHistory || []).some(h => h.durationMinutes != null);
    const timePrefix  = hasRealTime ? '' : '~';

    const streakValue = state.user.streak || 0;

    // Erros por matéria no mês
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
            <span class="section-title">RETROSPECTIVA DO MÊS</span>
        </div>
        <div class="retro-card">
            <div class="retro-glow"></div>
            <div class="retro-header">
                <div class="retro-title-block">
                    <div class="retro-label">ENEM Master Wrapped ✨</div>
                    <div class="retro-month">${monthLabel}</div>
                </div>
                <button class="retro-share-btn" onclick="shareRetro()">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Compartilhar
                </button>
            </div>
            <div class="retro-big-stats">
                <div class="retro-stat">
                    <span class="retro-stat-icon">📚</span>
                    <span class="retro-stat-value">${retro.totalQuestoes.toLocaleString('pt-BR')}</span>
                    <span class="retro-stat-label">Questões</span>
                </div>
                <div class="retro-stat">
                    <span class="retro-stat-icon">🎯</span>
                    <span class="retro-stat-value">${retro.accuracy}%</span>
                    <span class="retro-stat-label">Taxa de acerto</span>
                </div>
                <div class="retro-stat">
                    <span class="retro-stat-icon">⚡</span>
                    <span class="retro-stat-value">${retro.totalXP.toLocaleString('pt-BR')}</span>
                    <span class="retro-stat-label">XP ganho</span>
                </div>
                <div class="retro-stat">
                    <span class="retro-stat-icon">📅</span>
                    <span class="retro-stat-value">${retro.uniqueDays}</span>
                    <span class="retro-stat-label">Dias estudados</span>
                </div>
            </div>
            <div class="retro-highlights">
                ${bestLabel !== '—' ? `
                <div class="retro-highlight-row">
                    <div class="retro-highlight-left"><span class="retro-hl-icon">🏆</span><span class="retro-hl-text">Melhor matéria</span></div>
                    <span class="retro-hl-value">${bestLabel}</span>
                </div>` : ''}
                ${worstLabel ? `
                <div class="retro-highlight-row">
                    <div class="retro-highlight-left"><span class="retro-hl-icon">⚔️</span><span class="retro-hl-text">Focar mais em</span></div>
                    <span class="retro-hl-value">${worstLabel}</span>
                </div>` : ''}
                <div class="retro-highlight-row">
                    <div class="retro-highlight-left"><span class="retro-hl-icon">🕐</span><span class="retro-hl-text">Tempo de estudo</span></div>
                    <span class="retro-hl-value">${timePrefix}${retro.studyHours}</span>
                </div>
                <div class="retro-highlight-row">
                    <div class="retro-highlight-left"><span class="retro-hl-icon">📋</span><span class="retro-hl-text">Simulados feitos</span></div>
                    <span class="retro-hl-value">${retro.simulados} ${retro.simulados === 1 ? 'simulado' : 'simulados'}</span>
                </div>
                ${wrongRowsHtml ? `<div class="retro-wrong-section">${wrongRowsHtml}</div>` : ''}
                <div class="retro-streak-pill">
                    🔥 Sequência atual: <strong>${streakValue} dia${streakValue !== 1 ? 's' : ''}</strong>
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

    const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                         'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const bestLabel = retro.bestArea
        ? `${retro.areaNames[retro.bestArea.disc]} (${retro.bestArea.pct}%)`
        : '—';

    const text = [
        `🎓 Meu ENEM Master Wrapped — ${MONTH_NAMES[month]} ${year}`,
        ``,
        `📚 ${retro.totalQuestoes} questões respondidas`,
        `🎯 ${retro.accuracy}% de taxa de acerto`,
        `⚡ ${retro.totalXP.toLocaleString('pt-BR')} XP ganho`,
        `📅 ${retro.uniqueDays} dias estudados`,
        `🕐 ~${retro.studyHours} de estudo estimado`,
        `🔥 Sequência atual: ${state.user.streak || 0} dias`,
        `🏆 Melhor em: ${bestLabel}`,
        ``,
        `📲 #ENEMMaster`,
    ].join('\n');

    if (navigator.share) {
        navigator.share({ title: 'ENEM Master Wrapped', text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text)
            .then(() => _showQuickToast('Copiado! Cole no WhatsApp ou Instagram 🎉'))
            .catch(() => _showQuickToast('Não foi possível copiar. Tente novamente.'));
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
    const discIcons = { humanas: '🌍', natureza: '🔬', linguagens: '📝', matematica: '➗', misto: '🎯' };
    const discNames = { humanas: 'HUMANAS', natureza: 'NATUREZA', linguagens: 'LINGUAGENS', matematica: 'MATEMÁTICA', misto: 'MISTO' };

    history.forEach(h => {
        const badge = document.createElement('div');
        badge.className = `recent-badge ${discColors[h.discipline] || 'teal-bg'}`;
        badge.innerHTML = `
            <div class="rb-icon">${discIcons[h.discipline] || '🎯'}</div>
            <span>${h.pct}% — ${discNames[h.discipline] || h.discipline.toUpperCase()}</span>
        `;
        scroll.appendChild(badge);
    });
}

// =====================================================
// REDAÇÃO ENEM — IA (5 competências)
// =====================================================

const ENEM_THEMES = [
    { year: 2024, theme: 'Desafios para a valorização da herança africana no Brasil' },
    { year: 2023, theme: 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil' },
    { year: 2022, theme: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil' },
    { year: 2021, theme: 'Invisibilidade e registro civil: ser "sem papel" no Brasil' },
    { year: 2020, theme: 'O estigma associado às doenças mentais na sociedade brasileira' },
    { year: 2019, theme: 'Democratização do acesso ao cinema no Brasil' },
    { year: 2018, theme: 'Manipulação do comportamento do usuário pelo controle de dados na internet' },
    { year: 2017, theme: 'Desafios para a formação educacional de surdos no Brasil' },
    { year: 2016, theme: 'Caminhos para combater a intolerância religiosa no Brasil' },
    { year: 2015, theme: 'A persistência da violência contra a mulher na sociedade brasileira' },
    { year: 2014, theme: 'Publicidade infantil em questão no Brasil' },
    { year: 2013, theme: 'Efeitos da implantação da Lei Seca no Brasil' },
    { year: 2012, theme: 'O movimento imigratório para o Brasil no século XXI' },
    { year: 2011, theme: 'Viver em rede no século XXI: os limites entre o público e o privado' },
    { year: 2010, theme: 'O indivíduo frente à ética nacional' },
    { year: 2009, theme: 'O indivíduo frente à ética nacional' },
    { year: 2008, theme: 'Como preservar a memória viva da cultura popular no Brasil?' },
    { year: 2007, theme: 'O desafio de se conviver com as diferenças' },
    { year: 2006, theme: 'O poder de transformação da leitura' },
];

const CURRENT_THEMES = [
    { label: 'Tecnologia', theme: 'Impactos da inteligência artificial no mercado de trabalho brasileiro' },
    { label: 'Democracia', theme: 'Fake news e o enfraquecimento da democracia no Brasil' },
    { label: 'Meio Ambiente', theme: 'A crise climática e a responsabilidade do Brasil na transição energética' },
    { label: 'Saúde Mental', theme: 'Saúde mental de jovens e adolescentes na era das redes sociais' },
    { label: 'Desigualdade', theme: 'Exclusão digital como barreira ao desenvolvimento social no Brasil' },
    { label: 'Política', theme: 'A polarização política e o papel das redes sociais no Brasil contemporâneo' },
    { label: 'Trabalho', theme: 'Uberização do trabalho e a precarização dos direitos trabalhistas no Brasil' },
    { label: 'Educação', theme: 'Evasão escolar no ensino médio e seus impactos sociais' },
    { label: 'Saúde Pública', theme: 'Obesidade infantil como problema de saúde pública no Brasil' },
    { label: 'Segurança', theme: 'Feminicídio e as falhas no sistema de proteção à mulher no Brasil' },
    { label: 'Meio Ambiente', theme: 'Desmatamento da Amazônia e soberania nacional frente à pressão internacional' },
    { label: 'Tecnologia', theme: 'Vício em smartphones e os impactos na saúde mental dos adolescentes' },
    { label: 'Habitação', theme: 'Crise habitacional nas grandes cidades e o crescimento das periferias no Brasil' },
    { label: 'Saúde', theme: 'Automedicação e os riscos da desinformação sobre saúde nas redes sociais' },
    { label: 'Educação', theme: 'Educação financeira como ferramenta de redução da desigualdade no Brasil' },
    { label: 'Racismo', theme: 'Racismo algorítmico e discriminação digital no Brasil' },
    { label: 'Segurança', theme: 'Violência nas escolas e o papel do Estado na segurança educacional' },
    { label: 'Economia', theme: 'Insegurança alimentar e o aumento da fome nas famílias brasileiras' },
    { label: 'Tecnologia', theme: 'Deepfakes e os riscos da manipulação digital para a sociedade brasileira' },
    { label: 'Direitos', theme: 'A superexposição de crianças nas redes sociais e o direito ao esquecimento' },
    { label: 'Saúde', theme: 'O negacionismo científico e seus efeitos na saúde pública brasileira' },
    { label: 'Trabalho', theme: 'Home office e os novos desafios para a saúde física e mental dos trabalhadores' },
    { label: 'Meio Ambiente', theme: 'Tragédias climáticas no Brasil e a urgência de políticas de adaptação urbana' },
    { label: 'Cidadania', theme: 'O dever cívico do voto e a crise de representatividade política no Brasil' },
];

const COMPETENCIAS = [
    { id: 'c1', label: 'Competência 1', desc: 'Domínio da norma culta da língua escrita' },
    { id: 'c2', label: 'Competência 2', desc: 'Compreensão da proposta e uso de repertório' },
    { id: 'c3', label: 'Competência 3', desc: 'Seleção, organização e interpretação de informações' },
    { id: 'c4', label: 'Competência 4', desc: 'Mecanismos linguísticos e coesão textual' },
    { id: 'c5', label: 'Competência 5', desc: 'Proposta de intervenção respeitando os direitos humanos' },
];

let currentThemeIdx = 0;
let currentActualThemeIdx = 0;
let currentThemeCategory = 'enem'; // 'enem' | 'atual'

function switchThemeTab(category) {
    currentThemeCategory = category;
    document.querySelectorAll('.rt-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === category);
    });
    _updateThemeDisplay();
    // Limpar textarea ao trocar aba
    const textarea = document.getElementById('redacao-text');
    if (textarea) { textarea.value = ''; _updateRedacaoCounter.call(textarea); }
    const resultEl = document.getElementById('redacao-result');
    if (resultEl) resultEl.style.display = 'none';
}

function renderRedacao() {
    // Gate Premium: correção por IA é exclusiva para assinantes
    if (!planHas('redacaoIA')) {
        navigate('quiz-setup');
        showFeaturePaywall('redacaoIA');
        return;
    }

    // Restaurar aba padrão
    currentThemeCategory = 'enem';
    document.querySelectorAll('.rt-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === 'enem');
    });

    // Mostrar tema atual
    _updateThemeDisplay();

    // Reset resultado
    const resultEl = document.getElementById('redacao-result');
    if (resultEl) resultEl.style.display = 'none';

    // Listener contador de palavras
    const textarea = document.getElementById('redacao-text');
    if (textarea) {
        textarea.addEventListener('input', _updateRedacaoCounter);
        _updateRedacaoCounter.call(textarea);
    }

    // Renderizar histórico de redações
    renderRedacaoHistory();
}

function _updateThemeDisplay() {
    const labelEl = document.getElementById('rt-label');
    const yearEl  = document.getElementById('rt-year');
    const themeEl = document.getElementById('rt-theme');
    if (currentThemeCategory === 'enem') {
        const t = ENEM_THEMES[currentThemeIdx];
        if (labelEl) labelEl.textContent = 'TEMA ENEM';
        if (yearEl)  yearEl.textContent = `ENEM ${t.year}`;
        if (themeEl) themeEl.textContent = t.theme;
    } else {
        const t = CURRENT_THEMES[currentActualThemeIdx];
        if (labelEl) labelEl.textContent = 'TEMA ATUAL';
        if (yearEl)  { yearEl.textContent = t.label; }
        if (themeEl) themeEl.textContent = t.theme;
    }
}

function _updateRedacaoCounter() {
    const text = this.value || document.getElementById('redacao-text').value;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const wEl = document.getElementById('redacao-word-count');
    const cEl = document.getElementById('redacao-char-count');
    if (wEl) {
        wEl.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
        wEl.style.color = words >= 250 ? 'var(--teal)' : words >= 150 ? 'var(--orange)' : 'var(--red)';
    }
    if (cEl) cEl.textContent = `${chars}/3000 caracteres`;
}



function _saveRedacaoKey() {
    const inp = document.getElementById('redacao-groq-key-input');
    const key = (inp?.value || '').trim();
    if (!key.startsWith('gsk_')) {
        _showQuickToast('❌ Chave inválida. Deve começar com gsk_');
        return;
    }
    localStorage.setItem('groq_key', key);
    const wrap = document.getElementById('redacao-groq-key-wrap');
    if (wrap) wrap.style.display = 'none';
    _showQuickToast('✅ Chave salva! Clique em Corrigir novamente.');
}

function drawNewTheme() {
    if (currentThemeCategory === 'enem') {
        currentThemeIdx = (currentThemeIdx + 1) % ENEM_THEMES.length;
    } else {
        currentActualThemeIdx = (currentActualThemeIdx + 1) % CURRENT_THEMES.length;
    }
    _updateThemeDisplay();
    // Limpar textarea e resultado ao trocar tema
    const textarea = document.getElementById('redacao-text');
    if (textarea) { textarea.value = ''; _updateRedacaoCounter.call(textarea); }
    const resultEl = document.getElementById('redacao-result');
    if (resultEl) resultEl.style.display = 'none';
}

async function submitEssay() {
    // Backstop de segurança: garantir que só Premium envia
    if (!planHas('redacaoIA')) {
        showFeaturePaywall('redacaoIA');
        return;
    }
    const text = (document.getElementById('redacao-text').value || '').trim();
    const theme = currentThemeCategory === 'enem'
        ? ENEM_THEMES[currentThemeIdx].theme
        : CURRENT_THEMES[currentActualThemeIdx].theme;

    if (text.length < 100) {
        alert('Escreva pelo menos 100 caracteres antes de enviar.');
        return;
    }

    const btn = document.getElementById('redacao-submit-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Corrigindo com IA...';

    try {
        const EDGE_URL = 'https://nkuiwdolkluetsadauwb.supabase.co/functions/v1/corrigir-redacao';
        const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdWl3ZG9sa2x1ZXRzYWRhdXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjQ0OTgsImV4cCI6MjA4OTgwMDQ5OH0.xIkowv91_aL-v03HIPtg9Ni6M_rROs7VcZS2qa3PbV4';

        let result = null;

        // 1ª tentativa: Edge Function do servidor (chave central)
        try {
            const res = await fetch(EDGE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ANON_KEY}`,
                },
                body: JSON.stringify({ theme, text }),
            });
            if (res.ok) {
                const body = await res.json().catch(() => null);
                if (body && body.c1) result = body;
            } else if (res.status !== 404 && res.status !== 503) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error || `Erro ${res.status} na correção por IA.`);
            }
            // 404/503 = função não deployada — cai para fallback silenciosamente
        } catch (edgeErr) {
            if (edgeErr.message && !edgeErr.message.includes('fetch')) throw edgeErr;
            // Erro de rede/CORS — função indisponível, usa fallback
        }

        // 2ª tentativa: Groq API diretamente com chave do usuário
        if (!result) {
            const apiKey = localStorage.getItem('groq_key') || '';
            if (!apiKey) {
                const stored = document.getElementById('redacao-groq-key-wrap');
                if (stored) stored.style.display = '';
                const inp = document.getElementById('redacao-groq-key-input');
                if (inp) inp.focus();
                throw new Error('A correção automática está indisponível. Insira sua chave Groq abaixo para continuar.');
            }

            const PROMPT = `Você é um avaliador oficial de redações do ENEM. Corrija a redação abaixo usando as 5 competências. Para cada uma, dê nota de 0 a 200 (múltiplos de 40) e feedback de 2-3 linhas.\n\nTEMA: "${theme}"\n\nREDAÇÃO:\n${text}\n\nRetorne APENAS JSON válido sem markdown:\n{"c1":{"nota":120,"feedback":"..."},"c2":{"nota":160,"feedback":"..."},"c3":{"nota":120,"feedback":"..."},"c4":{"nota":120,"feedback":"..."},"c5":{"nota":80,"feedback":"..."},"total":600,"comentario_geral":"..."}`;

            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: PROMPT }],
                    temperature: 0.3,
                    max_tokens: 1500,
                }),
            });
            if (groqRes.status === 401) throw new Error('Chave Groq inválida. Verifique e tente novamente.');
            if (groqRes.status === 429) throw new Error('Limite de requisições atingido. Aguarde um momento.');
            if (!groqRes.ok) throw new Error(`Erro ${groqRes.status} na API Groq.`);
            const groqData = await groqRes.json();
            const raw = groqData.choices?.[0]?.message?.content || '';
            const m = raw.match(/\{[\s\S]*\}/);
            if (!m) throw new Error('Resposta da IA em formato inesperado.');
            result = JSON.parse(m[0]);
        }

        if (!result || !result.c1) throw new Error('Resposta inesperada da IA.');
        // Esconder campo de chave se cônego com sucesso
        const keyWrap = document.getElementById('redacao-groq-key-wrap');
        if (keyWrap) keyWrap.style.display = 'none';

        _displayEssayResult(result);

        if (!state.redacaoHistory) state.redacaoHistory = [];
        state.redacaoHistory.push({
            date: new Date().toISOString(), theme, total: result.total,
            notas: { c1: result.c1.nota, c2: result.c2.nota, c3: result.c3.nota, c4: result.c4.nota, c5: result.c5.nota },
        });
        const xpRedacao = Math.round((result.total / 1000) * 200);
        state.user.xp += xpRedacao;
        state.user.level = Math.max(1, Math.floor(state.user.xp / 500) + 1);
        saveState();
        if (typeof getCurrentUser !== 'undefined') {
            getCurrentUser().then(user => {
                if (user) {
                    saveUserData(user.id).catch(() => {});
                    if (typeof trackEvent !== 'undefined') trackEvent('essay_submitted', { nota_total: result.total, theme }).catch(() => {});
                }
            }).catch(() => {});
        }
        if (xpRedacao > 0) _showQuickToast(`✍️ Redação corrigida! +${xpRedacao} XP`);

    } catch (err) {
        console.error('❌ Erro na correção:', err);
        alert(`❌ ${err.message}`);
    } finally {
        btn.disabled = false;
        btn.textContent = '🤖 Corrigir com IA';
    }
}

function _displayEssayResult(result) {
    const resultEl = document.getElementById('redacao-result');
    const compEl = document.getElementById('redacao-competencias');
    const totalEl = document.getElementById('redacao-total');
    const commentEl = document.getElementById('redacao-comment');

    // Competências
    compEl.innerHTML = '';
    COMPETENCIAS.forEach(c => {
        const item = result[c.id];
        if (!item) return;
        const nota = item.nota;
        const pct = (nota / 200) * 100;
        const color = nota >= 160 ? 'var(--teal)' : nota >= 120 ? 'var(--orange)' : nota >= 80 ? '#f5c518' : 'var(--red)';
        const card = document.createElement('div');
        card.className = 'comp-card';

        const cardHeader = document.createElement('div');
        cardHeader.className = 'comp-header';
        const cardInfo = document.createElement('div');
        const labelEl = document.createElement('p');
        labelEl.className = 'comp-label';
        labelEl.textContent = c.label;   // estático — confiável
        const descEl = document.createElement('p');
        descEl.className = 'comp-desc';
        descEl.textContent = c.desc;     // estático — confiável
        cardInfo.appendChild(labelEl);
        cardInfo.appendChild(descEl);
        const notaEl = document.createElement('span');
        notaEl.className = 'comp-nota';
        notaEl.style.color = color;      // color gerado internamente
        notaEl.textContent = nota;       // número — sem risco
        cardHeader.appendChild(cardInfo);
        cardHeader.appendChild(notaEl);

        const barWrap = document.createElement('div');
        barWrap.className = 'comp-bar-wrap';
        const bar = document.createElement('div');
        bar.className = 'comp-bar';
        bar.style.width = pct + '%';
        bar.style.background = color;
        barWrap.appendChild(bar);

        const feedbackEl = document.createElement('p');
        feedbackEl.className = 'comp-feedback';
        feedbackEl.textContent = item.feedback; // texto da IA — textContent é seguro

        card.appendChild(cardHeader);
        card.appendChild(barWrap);
        card.appendChild(feedbackEl);
        compEl.appendChild(card);
    });

    // Total
    const total = result.total || COMPETENCIAS.reduce((s, c) => s + (result[c.id]?.nota || 0), 0);
    const totalColor = total >= 800 ? 'var(--teal)' : total >= 600 ? 'var(--orange)' : total >= 400 ? '#f5c518' : 'var(--red)';
    if (totalEl) { totalEl.textContent = total; totalEl.style.color = totalColor; }

    // Comentário geral
    if (commentEl) commentEl.textContent = result.comentario_geral || '';

    resultEl.style.display = '';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =====================================================
// REVIEW SCREEN
// =====================================================
function renderReview() {
    const wrong = state.wrongAnswers || [];
    const tabs = document.getElementById('review-tabs');
    const list = document.getElementById('review-list');

    // Filtros por disciplina
    const disciplines = [...new Set(wrong.map(w => w.question.discipline || w.question.area))];
    tabs.innerHTML = '<button class="review-tab active" data-filter="all" onclick="filterReview(this)">Todos</button>';
    disciplines.forEach(d => {
        const label = d.length > 15 ? d.substring(0, 12) + '...' : d;
        tabs.innerHTML += `<button class="review-tab" data-filter="${d}" onclick="filterReview(this)">${label}</button>`;
    });

    renderReviewList('all');
}

function filterReview(btn) {
    document.querySelectorAll('.review-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderReviewList(btn.dataset.filter);
}

function renderReviewList(filter) {
    const list = document.getElementById('review-list');
    let wrong = (state.wrongAnswers || []).slice().reverse(); // mais recentes primeiro

    if (filter !== 'all') {
        wrong = wrong.filter(w => (w.question.discipline || w.question.area) === filter);
    }

    list.innerHTML = '';

    if (wrong.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-emoji">${filter === 'all' ? '🎉' : '✨'}</div>
                <div class="empty-state-title">Tudo certo por aqui!</div>
                <div class="empty-state-sub">Seus erros aparecerão aqui para você revisar.<br>Continue praticando!</div>
            </div>`;
        return;
    }

    const letters = ['A', 'B', 'C', 'D', 'E'];
    wrong.forEach((w, idx) => {
        const q = w.question;
        const dateStr = w.date ? new Date(w.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
        const disc = q.discipline || q.area;

        const item = document.createElement('div');
        item.className = 'review-item';

        const header = document.createElement('div');
        header.className = 'review-q-header';
        const tagEl = document.createElement('span');
        tagEl.className = 'review-q-tag';
        tagEl.textContent = q.tag || q.area;
        const dateEl = document.createElement('span');
        dateEl.className = 'review-q-date';
        dateEl.textContent = dateStr;
        header.appendChild(tagEl);
        header.appendChild(dateEl);

        const qText = document.createElement('p');
        qText.className = 'review-q-text';
        qText.textContent = q.question;

        const answersEl = document.createElement('div');
        answersEl.className = 'review-answers';

        const userAns = document.createElement('div');
        userAns.className = 'review-ans user-wrong';
        const userLabel = document.createElement('span');
        userLabel.className = 'review-ans-label';
        userLabel.textContent = 'SEU';
        const userText = document.createElement('span');
        userText.className = 'review-ans-text';
        userText.textContent = `${letters[w.userAnswer]}. ${q.options[w.userAnswer] || '—'}`;
        userAns.appendChild(userLabel);
        userAns.appendChild(userText);

        const correctAns = document.createElement('div');
        correctAns.className = 'review-ans correct-ans';
        const correctLabel = document.createElement('span');
        correctLabel.className = 'review-ans-label';
        correctLabel.textContent = 'CERTA';
        const correctText = document.createElement('span');
        correctText.className = 'review-ans-text';
        correctText.textContent = `${letters[q.correct]}. ${q.options[q.correct] || '—'}`;
        correctAns.appendChild(correctLabel);
        correctAns.appendChild(correctText);

        answersEl.appendChild(userAns);
        answersEl.appendChild(correctAns);

        const practiceBtn = document.createElement('button');
        practiceBtn.className = 'review-practice-btn';
        practiceBtn.textContent = '🎯 Praticar esta disciplina';
        practiceBtn.addEventListener('click', () => practiceDisc(disc)); // disc via closure, não interpolado

        item.appendChild(header);
        item.appendChild(qText);
        item.appendChild(answersEl);
        item.appendChild(practiceBtn);
        list.appendChild(item);
    });
}

function clearWrongAnswers() {
    if (!confirm('Limpar todo o histórico de erros?')) return;
    state.wrongAnswers = [];
    saveState();
    renderReview();
}

function practiceDisc(disc) {
    const discKey = {
        'CIÊNCIAS HUMANAS': 'humanas',
        'CIÊNCIAS DA NATUREZA': 'natureza',
        'LINGUAGENS': 'linguagens',
        'MATEMÁTICA': 'matematica',
    }[disc] || disc;
    quizSetup.discipline = discKey;
    navigate('quiz-setup');
}

// =====================================================
// ONBOARDING
// =====================================================
let obStep = 1;
let obGoal = '';
// =====================================================
// ONBOARDING — Helpers de validação em tempo real
// =====================================================

function _obClearFieldError(fieldId) {
    const el = document.getElementById(fieldId);
    if (el) el.style.borderColor = '';
    const icon = document.getElementById(fieldId + '-icon');
    if (icon) { icon.textContent = ''; icon.className = 'ob-field-icon'; }
    const errorEl = document.getElementById('ob-step1-error');
    if (errorEl) errorEl.textContent = '';
}

function _obSetFieldState(fieldId, ok, tooltip) {
    const el = document.getElementById(fieldId);
    const icon = document.getElementById(fieldId + '-icon');
    if (el) el.style.borderColor = ok ? 'var(--teal)' : 'var(--red, #ef4444)';
    if (icon) {
        icon.textContent = ok ? '✔' : '✖';
        icon.className = 'ob-field-icon ' + (ok ? 'ob-icon-ok' : 'ob-icon-err');
        icon.title = tooltip || '';
    }
}

function _obTogglePassword() {
    const el = document.getElementById('ob-password');
    if (el) el.type = el.type === 'password' ? 'text' : 'password';
}

function _obCheckPasswordStrength() {
    const password = document.getElementById('ob-password')?.value || '';
    const row  = document.getElementById('ob-strength-row');
    const fill = document.getElementById('ob-strength-fill');
    const lbl  = document.getElementById('ob-strength-label');
    if (!row) return;

    if (!password) { row.style.display = 'none'; return; }
    row.style.display = 'flex';

    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        { pct: '20%',  color: '#ef4444', text: 'Fraca' },
        { pct: '40%',  color: '#f97316', text: 'Razoável' },
        { pct: '60%',  color: '#eab308', text: 'Média' },
        { pct: '80%',  color: '#22c55e', text: 'Boa' },
        { pct: '100%', color: '#00b4a6', text: 'Excelente' },
    ];
    const lvl = levels[Math.min(score - 1, 4)] || levels[0];
    if (fill) { fill.style.width = lvl.pct; fill.style.background = lvl.color; }
    if (lbl)  { lbl.textContent = lvl.text; lbl.style.color = lvl.color; }

    _obClearFieldError('ob-password');
}

async function _obCheckEmailOnBlur() {
    const emailEl = document.getElementById('ob-email');
    const hintEl  = document.getElementById('ob-email-hint');
    if (!emailEl) return;
    const email = emailEl.value.trim().toLowerCase();
    if (!email) return;

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
        _obSetFieldState('ob-email', false, 'E-mail inválido');
        if (hintEl) { hintEl.textContent = 'E-mail inválido.'; hintEl.className = 'ob-field-hint ob-hint-err'; }
        return;
    }

    // Normalizar: sempre minúsculas
    emailEl.value = email;

    if (hintEl) { hintEl.textContent = 'Verificando...'; hintEl.className = 'ob-field-hint ob-hint-info'; }

    // Verifica se email já existe tentando uma busca na tabela public.users (sem expor dados)
    try {
        if (typeof supabase !== 'undefined' && supabase) {
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .maybeSingle();
            if (!error && data) {
                _obSetFieldState('ob-email', false, 'E-mail já cadastrado');
                if (hintEl) { hintEl.textContent = 'Este e-mail já tem conta. É você?'; hintEl.className = 'ob-field-hint ob-hint-err'; }
                // Link no hint para ir ao login
                if (hintEl) {
                    hintEl.innerHTML = 'Este e-mail já tem conta. <button class="link-inline" onclick="navigate(\'login\')" style="font-size:11px">Fazer login →</button>';
                }
                return;
            }
        }
    } catch { /* falha silenciosa — não bloqueia o fluxo */ }

    _obSetFieldState('ob-email', true, 'E-mail disponível');
    if (hintEl) { hintEl.textContent = '✔ E-mail disponível'; hintEl.className = 'ob-field-hint ob-hint-ok'; }
}

let _pendingPassword = ''; // senha temporária — nunca entra no state nem no localStorage

async function onboardingNext() {
    if (obStep === 1) {
        const nameEl     = document.getElementById('ob-name');
        const emailEl    = document.getElementById('ob-email');
        const passwordEl = document.getElementById('ob-password');
        const errorEl    = document.getElementById('ob-step1-error');
        const hintEl     = document.getElementById('ob-email-hint');

        const name     = nameEl?.value.trim() || '';
        const email    = emailEl?.value.trim().toLowerCase() || '';
        const password = passwordEl?.value || '';

        const showError = (msg, focusEl) => {
            if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
            if (focusEl) {
                focusEl.focus();
                focusEl.style.borderColor = 'var(--red, #ef4444)';
                setTimeout(() => { if (focusEl) focusEl.style.borderColor = ''; }, 2500);
            }
        };
        if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }

        // — Nome obrigatório (mínimo 3 caracteres) —
        if (!name || name.length < 3) {
            _obSetFieldState('ob-name', false, 'Nome muito curto');
            showError('Digite seu nome completo (mínimo 3 caracteres).', nameEl);
            return;
        }
        _obSetFieldState('ob-name', true);

        // — E-mail válido —
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) {
            _obSetFieldState('ob-email', false, 'E-mail inválido');
            showError('Digite um e-mail válido.', emailEl);
            return;
        }
        if (emailEl) emailEl.value = email; // normaliza minúsculas

        // — Senha: mínimo 8 caracteres + pelo menos 1 número —
        if (password.length < 8) {
            showError('A senha deve ter pelo menos 8 caracteres.', passwordEl);
            return;
        }
        if (!/[0-9]/.test(password)) {
            showError('A senha deve conter pelo menos 1 número.', passwordEl);
            return;
        }

        // — Verificar email duplicado no Supabase antes de avançar —
        const btn = document.getElementById('ob-btn');
        const origBtnText = btn?.textContent || 'Próximo';
        if (btn) { btn.disabled = true; btn.textContent = 'Verificando...'; }
        try {
            if (typeof supabase !== 'undefined' && supabase) {
                const { data } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();
                if (data) {
                    _obSetFieldState('ob-email', false, 'E-mail já cadastrado');
                    if (hintEl) {
                        hintEl.innerHTML = 'Este e-mail já tem conta. <button class="link-inline" onclick="navigate(\'login\')" style="font-size:11px">Fazer login →</button>';
                        hintEl.className = 'ob-field-hint ob-hint-err';
                    }
                    showError('Este e-mail já está cadastrado. Faça login.', emailEl);
                    if (btn) { btn.disabled = false; btn.textContent = origBtnText; }
                    return;
                }
            }
        } catch { /* offline — continua e o Supabase rejeitará no signUp */ }
        if (btn) { btn.disabled = false; btn.textContent = origBtnText; }

        _obSetFieldState('ob-email', true);
        state.user.name  = name;
        state.user.email = email;
        _pendingPassword = password;
        goToObStep(2);
    } else if (obStep === 2) {
        if (!obGoal) { obGoal = 'Rumo à Federal 🚀'; }
        if (obGoal === 'outro') {
            const customInput = document.getElementById('ob-outro-input');
            const customVal = customInput ? customInput.value.trim() : '';
            obGoal = customVal ? customVal : 'Rumo à Federal 🚀';
        }
        state.user.goal = obGoal;
        goToObStep(3);
    } else if (obStep === 3) {
        const selected = [...document.querySelectorAll('.ob-subj-btn.selected')].map(b => b.dataset.subj);
        state.weakSubjects = selected;
        await finishOnboarding();
    }
}

function goToObStep(step) {
    document.getElementById(`ob-step-${obStep}`).classList.remove('active');
    document.getElementById(`ob-step-${step}`).classList.add('active');

    // Update dots
    document.querySelectorAll('.ob-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === step - 1);
    });

    if (step === 3) {
        document.getElementById('ob-btn').textContent = 'Começar a Estudar 🚀';
    }
    obStep = step;
}

function selectGoal(btn) {
    document.querySelectorAll('.ob-goal-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    obGoal = btn.dataset.goal;
    const outroWrap = document.getElementById('ob-outro-wrap');
    if (outroWrap) {
        outroWrap.style.display = (obGoal === 'outro') ? 'block' : 'none';
        if (obGoal === 'outro') {
            const inp = document.getElementById('ob-outro-input');
            if (inp) inp.focus();
        }
    }
}

function toggleSubj(btn) {
    btn.classList.toggle('selected');
}

function skipOnboarding() {
    finishOnboarding();
}

// Handler para login com Google OAuth — redireciona para provedor
async function handleGoogleLogin() {
    console.log('🔑 handleGoogleLogin chamado');

    const btn = document.getElementById('google-login-btn') ||
                document.querySelector('.google-login-btn');
    const origText = btn ? btn.textContent.trim() : 'Entrar com Google';
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Redirecionando...'; }

    // Garantir que o Supabase esteja iniciado
    if (typeof _initSupabase !== 'undefined') _initSupabase();

    const _showError = (msg) => {
        console.error('❌ Google login:', msg);
        const errorEl = document.getElementById('login-error');
        if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = msg; }
        else { _showQuickToast('❌ ' + msg); }
        if (btn) { btn.disabled = false; btn.textContent = origText; }
    };

    try {
        const sb = window.supabase;
        if (!sb || !sb.auth) {
            _showError('Conexão com servidor falhou. Recarregue a página.');
            return;
        }
        console.log('🔑 Chamando signInWithOAuth...');
        const { data, error } = await sb.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: { prompt: 'select_account' },
            },
        });
        console.log('🔑 OAuth resultado:', { data, error });
        if (error) { _showError(error.message); return; }
        // Fallback manual: se o SDK não redirecionou automaticamente
        if (data && data.url) {
            window.location.href = data.url;
        }
    } catch (e) {
        _showError(e.message || 'Erro ao entrar com Google');
    }
}

// =====================================================
// PUSH NOTIFICATIONS
// =====================================================
async function _requestPushPermission() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) return; // j\u00e1 inscrito
        // Configure VAPID public key abaixo quando o backend estiver pronto:
        // const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY });
        console.log('\u2705 Push permission granted. Configure VAPID key para ativar notifica\u00e7\u00f5es.');
    } catch (e) {
        console.warn('\u26a0\ufe0f Push Notifications n\u00e3o dispon\u00edveis:', e.message);
    }
}

// =====================================================
// ANALYTICS (leve \u2014 envia eventos para Supabase)
// =====================================================
function _trackEvent(eventName, properties = {}) {
    if (typeof trackEvent !== 'undefined') {
        trackEvent(eventName, { ...properties, user_id: state.user.id || null })
            .catch(() => {});
    }
}

async function finishOnboarding() {
    state.onboardingDone = true;
    if (!state.user.name || state.user.name === 'Alex') {
        const inputName = document.getElementById('ob-name').value.trim();
        if (inputName) state.user.name = inputName;
    }

    const obBtn = document.getElementById('ob-btn');
    if (obBtn) { obBtn.disabled = true; obBtn.textContent = 'Criando conta...'; }

    // Registrar no Supabase com email e senha coletados no onboarding
    if (typeof signUpUser !== 'undefined' && state.user.email && _pendingPassword) {
        try {
            const result = await signUpUser(state.user.email, _pendingPassword, state.user.name);
            if (result.success) {
                state.user.id = result.user.id;
                state.user.plan = 'free';
                await saveUserData(result.user.id).catch(() => {});
                if (typeof startSyncLoop !== 'undefined') startSyncLoop(result.user.id);
            } else {
                const msg = result.error || '';
                const isAlreadyRegistered = msg.toLowerCase().includes('already') ||
                    msg.toLowerCase().includes('registered') ||
                    msg.toLowerCase().includes('exist') ||
                    msg.toLowerCase().includes('user already');
                if (isAlreadyRegistered) {
                    if (obBtn) { obBtn.disabled = false; obBtn.textContent = 'Começar a Estudar 🚀'; }
                    _pendingPassword = '';
                    saveState();
                    navigate('login');
                    const emailEl2 = document.getElementById('login-email');
                    if (emailEl2) emailEl2.value = state.user.email;
                    const errEl = document.getElementById('login-error');
                    if (errEl) { errEl.style.color = 'var(--orange, #f97316)'; errEl.textContent = 'E-mail já cadastrado. Faça login.'; }
                    return;
                }
                console.warn('⚠️ Erro ao registrar:', result.error);
            }
        } catch (e) {
            console.warn('⚠️ Registro Supabase não disponível:', e);
        } finally {
            _pendingPassword = ''; // limpar senha da memória imediatamente
        }
    }

    if (obBtn) { obBtn.disabled = false; obBtn.textContent = 'Começar a Estudar 🚀'; }
    saveState();
    navigate('home');
}

// =====================================================
// INIT
// =====================================================

// Capturar erros globais para diagnóstico
window.onerror = (msg, src, line, col, err) => {
    console.error('🔴 Erro global:', msg, 'em', src, 'linha', line);
    // Mostrar erro na tela se o app não carregou
    const appEl = document.getElementById('app');
    if (appEl && !document.querySelector('.screen.active')) {
        appEl.insertAdjacentHTML('afterbegin',
            `<div style="position:fixed;inset:0;background:#0a1929;color:#ef4444;padding:24px;font-family:monospace;z-index:9999;overflow:auto">
            <b>❌ Erro ao carregar o app:</b><br>${msg}<br><small>${src}:${line}</small>
            <br><br><button onclick="localStorage.clear();location.reload()" style="margin-top:16px;padding:10px 20px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer">Limpar dados e recarregar</button>
            </div>`);
    }
    return false;
};

function init() {
    // Garantir que apenas uma tela fique ativa
    document.querySelectorAll('.screen.active').forEach(s => s.classList.remove('active'));

    // Migrar state antigo se necessário
    if (!state.quizHistory) state.quizHistory = [];
    if (!state.wrongAnswers) state.wrongAnswers = [];
    if (!state.progress.stats) {
        state.progress.stats = {
            humanas: { correct: 0, total: 0 },
            natureza: { correct: 0, total: 0 },
            linguagens: { correct: 0, total: 0 },
            matematica: { correct: 0, total: 0 },
        };
        // Migrar progresso antigo
        ['humanas','natureza','linguagens','matematica'].forEach(d => {
            const pct = state.progress[d];
            if (pct > 0) {
                state.progress.stats[d] = { correct: pct, total: 100 };
            }
        });
    }
    if (!state.badges) state.badges = { ofensiva: [], especialista: [], maratonista: [] };
    if (!state.notifications || !Array.isArray(state.notifications)) {
        state.notifications = JSON.parse(JSON.stringify(defaultState.notifications));
    }
    if (!state.user.goal) state.user.goal = defaultState.user.goal;
    if (state.user.streak === undefined) state.user.streak = 0;
    if (state.user.xp === undefined) state.user.xp = 0;
    if (state.user.level === undefined) state.user.level = 1;

    // Reset para home se estava numa tela sem nav
    const nav = document.getElementById('bottom-nav');
    if (screensWithoutNav.includes(state.currentScreen)) {
        state.currentScreen = 'home';
    }

    // Pular se usuário já tem dados (migração do estado antigo)
    const isReturningUser = state.user.xp > 0 || (state.quizHistory && state.quizHistory.length > 0);

    // Detectar entrada pelo funil (landing.html?ref=landing)
    const _urlParams    = new URLSearchParams(window.location.search);
    const _refSource    = (_urlParams.get('ref') || _urlParams.get('utm_source') || '').toLowerCase();
    const _forceFunnel  = _refSource === 'landing' || _refSource === 'landing_page';
    // Limpar parâmetro da URL sem recarregar a página
    if (_forceFunnel && window.history?.replaceState) {
        window.history.replaceState({}, '', window.location.pathname);
    }

    // ── Verificar sessão Supabase SEMPRE antes de decidir qual tela mostrar ──
    if (typeof getCurrentUser !== 'undefined') {
        getCurrentUser().then(user => {
            if (user) {
                // Sessão ativa: aplicar nome real do Google antes de carregar do banco
                const meta = user.user_metadata || {};
                const googleName = meta.full_name || meta.name || meta.display_name || '';
                if (googleName && googleName.trim()) {
                    state.user.name = googleName.trim();
                }
                state.user.id    = user.id;
                state.user.email = user.email;
                state.onboardingDone = true;
                return Promise.all([
                    loadUserData(user.id),
                    typeof loadUserPlan !== 'undefined' ? loadUserPlan(user.id) : Promise.resolve(),
                ]).catch(() => {}).then(() => {
                    document.getElementById('screen-home').classList.add('active');
                    state.currentScreen = 'home';
                    nav.style.display = 'flex';
                    updateNavActive('home');
                    renderDashboard();
                    saveState();
                    if (typeof startSyncLoop !== 'undefined') startSyncLoop(user.id);
                    // Retomar polling se havia pagamento pendente
                    _resumePendingPayment();
                });
            } else {
                // Sem sessão: entrada pelo funil OU usuário novo → onboarding
                if (_forceFunnel || (!state.onboardingDone && !isReturningUser)) {
                    document.getElementById('screen-onboarding').classList.add('active');
                    nav.style.display = 'none';
                    state.currentScreen = 'onboarding';
                } else {
                    if (isReturningUser && !state.onboardingDone) state.onboardingDone = true;
                    document.getElementById('screen-login').classList.add('active');
                    nav.style.display = 'none';
                    state.currentScreen = 'login';
                    const emailEl = document.getElementById('login-email');
                    if (emailEl && state.user.email && state.user.email !== 'alex@estudo.com') {
                        emailEl.value = state.user.email;
                    }
                }
            }
        }).catch(() => {
            // Supabase indisponível: usar estado local como fallback
            if (!state.onboardingDone && !isReturningUser) {
                document.getElementById('screen-onboarding').classList.add('active');
                nav.style.display = 'none';
                state.currentScreen = 'onboarding';
            } else {
                state.currentScreen = 'home';
                document.getElementById('screen-home').classList.add('active');
                nav.style.display = 'flex';
                updateNavActive('home');
                renderDashboard();
                saveState();
            }
        });
        return;
    }

    // Fallback: Supabase não disponível — usar estado local
    if (!state.onboardingDone && !isReturningUser) {
        document.getElementById('screen-onboarding').classList.add('active');
        nav.style.display = 'none';
        state.currentScreen = 'onboarding';
        return;
    }
    state.currentScreen = 'home';
    document.getElementById('screen-home').classList.add('active');
    nav.style.display = 'flex';
    updateNavActive('home');
    renderDashboard();
    saveState();
}

document.addEventListener('DOMContentLoaded', init);

// =====================================================
// PRÉ-AQUECIMENTO DO CACHE DA API
// Roda em background após o app carregar, para que o
// primeiro simulado inicie instantaneamente (sem espera).
// =====================================================
(function _warmAPICache() {
    // Aguarda 4 s para não competir com o carregamento inicial
    setTimeout(async () => {
        if (!window.enemAPI) return;
        try {
            const years = await window.enemAPI.fetchAvailableYears();
            if (!years || years.length === 0) return;
            // Pré-carrega o ano mais recente — cobre os 4 cadernos
            const latest = years[0];
            const cacheKey = `enem_q3_${latest}`;
            const cached = localStorage.getItem(cacheKey);
            if (!cached) {
                console.log(`🔄 Pré-carregando questões ENEM ${latest}...`);
                // Importa a função interna via módulo exposto
                const pages = await Promise.all(
                    [0, 45, 90, 135].map(offset =>
                        fetch(`https://api.enem.dev/v1/exams/${latest}/questions?limit=45&offset=${offset}`)
                            .then(r => r.ok ? r.json() : { questions: [] })
                            .catch(() => ({ questions: [] }))
                    )
                );
                const questions = pages.flatMap(p => p.questions || []);
                if (questions.length > 0) {
                    try {
                        localStorage.setItem(cacheKey, JSON.stringify({
                            data: questions,
                            ts: Date.now()
                        }));
                        console.log(`✅ Cache aquecido: ${questions.length} questões ENEM ${latest}`);
                    } catch (e) {
                        console.warn('⚠️ Sem espaço para cache de questões');
                    }
                }
            } else {
                console.log(`✅ Cache já existe para ENEM ${latest}`);
            }
        } catch (e) {
            // Silencioso — falha no pré-aquecimento não afeta o app
        }
    }, 4000);
})();

// =====================================================
// FILTRO POR TÓPICO — QUIZ SETUP
// =====================================================
function renderTopicFilter() {
    const wrap = document.getElementById('topic-filter-wrap');
    const chipsEl = document.getElementById('topic-chips');
    if (!wrap || !chipsEl) return;

    const disc = quizSetup.discipline;
    if (disc === 'misto') {
        wrap.classList.remove('visible');
        quizSetup.topic = null;
        return;
    }

    const topics = _REC_TOPICS[disc] || [];
    chipsEl.innerHTML = '';

    const anyChip = document.createElement('button');
    anyChip.className = 'topic-chip any' + (quizSetup.topic === null ? ' selected' : '');
    anyChip.textContent = '🎲 Qualquer tópico';
    anyChip.onclick = () => _selectTopic(null, anyChip);
    chipsEl.appendChild(anyChip);

    topics.forEach(topic => {
        const chip = document.createElement('button');
        chip.className = 'topic-chip' + (quizSetup.topic === topic ? ' selected' : '');
        chip.textContent = topic;
        chip.onclick = () => _selectTopic(topic, chip);
        chipsEl.appendChild(chip);
    });

    wrap.classList.add('visible');
}

function _selectTopic(topic, btn) {
    quizSetup.topic = topic;
    document.querySelectorAll('#topic-chips .topic-chip').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
}

// =====================================================
// HISTÓRICO DE REDAÇÕES
// =====================================================
function renderRedacaoHistory() {
    const listEl = document.getElementById('redacao-hist-list');
    if (!listEl) return;

    const history = (state.redacaoHistory || []).slice().reverse().slice(0, 10);

    if (history.length === 0) {
        listEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:16px 0">Nenhuma redação enviada ainda. Escreva e corrija com IA acima! ✍️</p>';
        return;
    }

    listEl.innerHTML = '';
    history.forEach(h => {
        const date = h.date ? new Date(h.date) : null;
        const dateStr = date ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '') : '';
        const nota = h.total || 0;
        const notaColor = nota >= 800 ? '#22c55e' : nota >= 600 ? 'var(--orange)' : 'var(--red)';

        const card = document.createElement('div');
        card.className = 'redacao-hist-card';

        const notaEl = document.createElement('div');
        notaEl.className = 'redacao-hist-nota';
        notaEl.style.background = nota >= 800 ? 'linear-gradient(135deg,#22c55e,#16a34a)' :
                                  nota >= 600 ? 'linear-gradient(135deg,#f97316,#ea580c)' :
                                               'linear-gradient(135deg,#ef4444,#dc2626)';
        notaEl.textContent = nota;

        const info = document.createElement('div');
        info.className = 'redacao-hist-info';

        const themeEl = document.createElement('p');
        themeEl.className = 'redacao-hist-theme';
        themeEl.textContent = h.theme || 'Tema livre';

        const dateEl2 = document.createElement('p');
        dateEl2.className = 'redacao-hist-date';
        dateEl2.textContent = dateStr;

        const comps = document.createElement('div');
        comps.className = 'redacao-hist-competencias';
        if (h.notas) {
            Object.entries(h.notas).forEach(([k, v]) => {
                const span = document.createElement('span');
                span.className = 'redacao-hist-c';
                span.textContent = `${k.toUpperCase()}: ${v}`;
                comps.appendChild(span);
            });
        }

        info.appendChild(themeEl);
        info.appendChild(dateEl2);
        info.appendChild(comps);
        card.appendChild(notaEl);
        card.appendChild(info);
        listEl.appendChild(card);
    });
}

// =====================================================
// METAS CONFIGURÁVEIS
// =====================================================
function openGoalsModal() {
    const overlay = document.getElementById('goals-modal-overlay');
    if (!overlay) return;

    const dailyGoal  = state.user.dailyGoal  || state.progress.totalHoje || 10;
    const weeklyGoal = state.user.weeklyGoal || 3;

    const dailySlider  = document.getElementById('goal-daily-slider');
    const weeklySlider = document.getElementById('goal-weekly-slider');
    const dailyVal     = document.getElementById('goal-daily-val');
    const weeklyVal    = document.getElementById('goal-weekly-val');

    if (dailySlider)  dailySlider.value  = dailyGoal;
    if (weeklySlider) weeklySlider.value = weeklyGoal;
    if (dailyVal)     dailyVal.textContent  = dailyGoal;
    if (weeklyVal)    weeklyVal.textContent = weeklyGoal;

    overlay.style.display = 'flex';
}

function closeGoalsModal() {
    const overlay = document.getElementById('goals-modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

function saveGoals() {
    const daily  = parseInt(document.getElementById('goal-daily-slider')?.value  || '10');
    const weekly = parseInt(document.getElementById('goal-weekly-slider')?.value || '3');

    state.user.dailyGoal   = daily;
    state.user.weeklyGoal  = weekly;
    state.progress.totalHoje = daily;

    saveState();
    closeGoalsModal();
    renderGoals();
    _showQuickToast(`✅ Metas atualizadas: ${daily} questões/dia · ${weekly} simulados/semana`);
}

// =====================================================
// ANÁLISE — PAINEL CONSOLIDADO + GRÁFICOS
// =====================================================
function renderAnalise() {
    // Stats gerais
    const statsGrid = document.getElementById('analise-stats-grid');
    if (statsGrid) {
        const history       = state.quizHistory || [];
        const totalSimulados = history.length;
        const totalQuestoes  = history.reduce((s, h) => s + (h.total || 0), 0);
        const totalCorretas  = history.reduce((s, h) => s + (h.correct || 0), 0);
        const overallPct     = totalQuestoes > 0 ? Math.round((totalCorretas / totalQuestoes) * 100) : 0;
        const streak = state.user.streak || 0;
        const xp     = state.user.xp || 0;

        const items = [
            { label: 'Simulados', val: totalSimulados, sub: 'realizados', color: 'var(--teal)' },
            { label: 'Acertos',   val: overallPct + '%', sub: `${totalCorretas}/${totalQuestoes}`,
              color: overallPct >= 70 ? 'var(--teal)' : overallPct >= 50 ? 'var(--orange)' : 'var(--red)' },
            { label: 'Ofensiva',  val: streak, sub: streak > 0 ? `dias 🔥` : 'comece hoje!',
              color: streak > 7 ? 'var(--gold)' : 'var(--orange)' },
            { label: 'XP Total',  val: xp.toLocaleString('pt-BR'), sub: `Nível ${state.user.level}`, color: 'var(--gold)' },
        ];
        statsGrid.innerHTML = items.map(s => `
            <div class="analise-stat-card">
                <span class="analise-stat-label">${s.label}</span>
                <span class="analise-stat-value" style="color:${s.color}">${s.val}</span>
                <span class="analise-stat-sub">${s.sub}</span>
            </div>`).join('');
    }

    // Gráfico histórico — últimos 10 simulados
    const barsEl = document.getElementById('analise-bars');
    if (barsEl) {
        const recent = (state.quizHistory || []).slice(-10);
        if (recent.length === 0) {
            barsEl.innerHTML = '<p style="color:var(--text-muted);font-size:12px;text-align:center;width:100%;align-self:center">Faça simulados para ver o gráfico 📊</p>';
        } else {
            const discColors = { humanas:'#00b4a6', natureza:'#a78bfa', linguagens:'#f5c518', matematica:'#f97316', misto:'#3b82f6' };
            barsEl.innerHTML = recent.map(h => {
                const pct   = h.pct ?? Math.round(((h.correct||0)/Math.max(h.total||1,1))*100);
                const color = discColors[h.discipline] || 'var(--teal)';
                const date  = h.date ? new Date(h.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}) : '';
                return `<div class="analise-bar-wrap">
                    <span class="analise-bar-val">${pct}%</span>
                    <div class="analise-bar" style="height:${Math.max(4,pct)}%;background:${color}"></div>
                    <span class="analise-bar-label">${date}</span>
                </div>`;
            }).join('');
        }
    }

    // Desempenho por disciplina
    const discList = document.getElementById('analise-disc-list');
    if (discList) {
        const discs = [
            { disc:'humanas',    icon:'🌍', name:'Ciências Humanas',    color:'#00b4a6' },
            { disc:'natureza',   icon:'🔬', name:'Ciências da Natureza', color:'#a78bfa' },
            { disc:'linguagens', icon:'📝', name:'Linguagens',           color:'#f5c518' },
            { disc:'matematica', icon:'➗', name:'Matemática',           color:'#f97316' },
        ];
        discList.innerHTML = discs.map(d => {
            const st  = state.progress.stats?.[d.disc] || { correct:0, total:0 };
            const pct = st.total > 0 ? Math.round((st.correct/st.total)*100) : 0;
            return `<div class="analise-disc-row">
                <span class="analise-disc-icon">${d.icon}</span>
                <div class="analise-disc-info">
                    <span class="analise-disc-name">${d.name}</span>
                    <div class="analise-disc-bar-wrap">
                        <div class="analise-disc-bar" style="width:${pct}%;background:${d.color}"></div>
                    </div>
                </div>
                <span class="analise-disc-pct" style="color:${d.color}">${st.total > 0 ? pct+'%' : '—'}</span>
            </div>`;
        }).join('');
    }

    // Heatmap 35 dias (5 semanas)
    const heatmapEl = document.getElementById('analise-heatmap');
    if (heatmapEl) {
        const today = new Date();
        heatmapEl.innerHTML = '';
        for (let i = 34; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count   = (state.quizHistory||[]).filter(h => h.date && h.date.startsWith(dateStr)).length;
            const isToday = d.toDateString() === today.toDateString();
            const cell = document.createElement('div');
            cell.className = 'analise-heatmap-cell' +
                (count > 0 ? (count >= 2 ? ' has-data high' : ' has-data') : '') +
                (isToday ? ' today' : '');
            cell.title = dateStr + (count > 0 ? ` — ${count} simulado${count>1?'s':''}` : '');
            heatmapEl.appendChild(cell);
        }
    }

    // Foco recomendado
    const focusEl = document.getElementById('analise-focus-list');
    if (focusEl) {
        const recs = _getRecommendationAgent();
        focusEl.innerHTML = recs.map(r => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-subtle)">
                <span style="font-size:20px">${r.icon}</span>
                <div style="flex:1">
                    <p style="font-size:13px;font-weight:700;color:var(--text-primary)">${r.area}: ${r.topic}</p>
                    <p style="font-size:11px;color:var(--text-muted);margin-top:3px">${r.reason}</p>
                </div>
                <button style="background:var(--teal);color:#fff;border-radius:10px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;border:none" onclick="navigate('quiz-setup')">Praticar →</button>
            </div>`).join('');
    }
}

// =====================================================
// CONTEÚDO — FLASHCARDS, RESUMOS, TUTOR IA
// =====================================================

// ── Dados: Flashcards ────────────────────────────────────────────────────────
// lvl: 1=Fácil · 2=Médio · 3=Difícil
const FLASHCARDS = [
    // ── HUMANAS ────────────────────────────────────────────────────────────────
    { disc:'humanas', area:'🌍 HUMANAS', lvl:1, q:'O que é "Estado Laico"?',                                        a:'Estado que não adota religião oficial e garante a liberdade religiosa, separando as esferas pública (política) e privada (religião).' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:1, q:'O que foi a Revolução Industrial?',                               a:'Transformação econômica que substituiu o trabalho artesanal por fábricas com máquinas a vapor, iniciada na Inglaterra no séc. XVIII. Gerou o proletariado e o capitalismo industrial.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:1, q:'O que é democracia direta?',                                      a:'Sistema em que os cidadãos participam diretamente das decisões políticas, sem representantes. Origem na Grécia Antiga (Atenas, séc. V a.C.). Hoje praticada em referendos e plebiscitos.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'Qual foi o principal objetivo do Plano Marshall?',                a:'Reconstruir economicamente a Europa Ocidental após a 2ª Guerra Mundial (1948-52), contendo também a expansão do comunismo soviético. Os EUA investiram ~13 bilhões de dólares.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que é imperialismo?',                                           a:'Política de expansão territorial e econômica de países industrializados sobre regiões subdesenvolvidas, especialmente na África e Ásia no séc. XIX. Motivada por matéria-prima, mercados e poder.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'Qual foi a principal causa da 1ª Guerra Mundial?',                a:'Assassinato do arquiduque Franz Ferdinand em 1914, somado ao sistema de alianças (Tríplice Entente x Tríplice Aliança), nacionalismo exacerbado e disputa colonial imperial.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que foi a Revolução Francesa (1789)?',                          a:'Ruptura com o Absolutismo que instituiu os ideais de Liberdade, Igualdade e Fraternidade. Fases: Monarquia Constitucional → Convenção Nacional (Terror) → Diretório → Napoleão.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que foi o Estado Novo (1937-1945) no Brasil?',                  a:'Governo ditatorial de Getúlio Vargas, com centralização do poder, censura pelo DIP, suspensão da Constituição e repressão aos opositores. Coincidiu com industrialização e trabalhismo.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:2, q:'O que é globalização?',                                           a:'Processo de integração econômica, cultural e política entre países, impulsionado pelo avanço tecnológico, liberalização do comércio e fluxo de capitais. Intensificou-se após 1989.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:3, q:'Quais são as principais ideias do contrato social (Rousseau)?',   a:'Os homens nascem livres e iguais; cedem parte da liberdade ao Estado em troca de proteção coletiva. A soberania emana do povo ("vontade geral"). Base filosófica para a democracia moderna.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:3, q:'O que foram as "ondas" do feminismo?',                            a:'1ª onda (séc. XIX–XX): sufrágio. 2ª onda (anos 60-80): igualdade de direitos e sexualidade. 3ª onda (anos 90+): interseccionalidade, diversidade. 4ª onda (2010+): feminismo digital e MeToo.' },
    { disc:'humanas', area:'🌍 HUMANAS', lvl:3, q:'O que é "neoliberalismo"?',                                       a:'Corrente econômica que defende: Estado mínimo, privatizações, livre mercado, corte de gastos públicos e abertura comercial. Emergiu nos anos 1970 com Hayek/Friedman; aplicado por Thatcher e Reagan.' },

    // ── NATUREZA ───────────────────────────────────────────────────────────────
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'O que é DNA?',                                                  a:'Ácido desoxirribonucleico — molécula dupla-hélice que armazena informações genéticas em sequências de bases nitrogenadas (Adenina-Timina e Citosina-Guanina).' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'O que diferencia ácidos de bases (Arrhenius)?',                 a:'Ácidos liberam íons H⁺ em solução aquosa; bases liberam OH⁻. pH < 7 = ácido; pH = 7 = neutro; pH > 7 = básico (alkalino).' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:1, q:'O que é fotossíntese?',                                         a:'Processo pelo qual plantas e algas convertem luz solar, CO₂ e H₂O em glicose e O₂. Equação: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂. Ocorre nos cloroplastos.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'Qual é a 1ª Lei da Termodinâmica?',                             a:'A energia de um sistema isolado se conserva: ΔU = Q − W. O calor absorvido (Q) é igual à variação da energia interna mais o trabalho realizado (W). Princípio da conservação de energia.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é seleção natural (Darwin)?',                             a:'Mecanismo evolutivo em que organismos com características mais adaptadas sobrevivem e se reproduzem mais. Junto com mutação e deriva genética, explica a diversidade da vida.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é força elétrica (Lei de Coulomb)?',                      a:'F = kq₁q₂/d², onde k = 9×10⁹ N·m²/C². Cargas de mesmo sinal se repelem; sinais opostos se atraem. A força é proporcional ao produto das cargas e inversamente proporcional ao quadrado da distância.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é uma reação de oxirredução?',                            a:'Reação onde ocorre transferência de elétrons: a substância que perde elétrons é oxidada (agente redutor); a que ganha elétrons é reduzida (agente oxidante). Exemplo: ferrugem do ferro.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que é ligação iônica vs. covalente?',                         a:'Iônica: transferência de elétrons entre metal e não-metal; forma cristais sólidos (ex: NaCl). Covalente: compartilhamento de elétrons entre não-metais; pode ser apolar ou polar (ex: H₂O).' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:2, q:'O que são ondas eletromagnéticas?',                             a:'Ondas que se propagam sem meio material, na velocidade da luz (3×10⁸ m/s). Espectro: rádio → micro-ondas → infravermelho → visível → UV → raios X → gama. Energia ∝ frequência.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:3, q:'Explique as Leis de Mendel e suas exceções.',                   a:'1ª Lei: segregação — cada indivíduo porta 2 alelos que se separam nos gametas (Aa → 50%A + 50%a). 2ª Lei: segregação independente em genes não ligados. Exceções: codominância, epistase, ligação gênica.' },
    { disc:'natureza', area:'🔬 NATUREZA', lvl:3, q:'O que é radioatividade? Cite os tipos.',                        a:'Emissão espontânea de radiação por núcleos instáveis. Tipos: α (partícula He, menor penetração), β (elétron, penetração média), γ (onda EM de alta energia, maior penetração). Aplica-se em medicina e energia nuclear.' },

    // ── LINGUAGENS ─────────────────────────────────────────────────────────────
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:1, q:'O que é uma metáfora?',                                     a:'Figura de linguagem que aproxima dois conceitos por semelhança implícita, sem "como" ou "que nem". Ex: "a vida é um palco"; "ele é uma pedra" (= insensível).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:1, q:'O que é metonímia?',                                        a:'Substituição de uma palavra por outra com relação real de contiguidade. Ex: "Leio Machado" (autor pela obra); "Brasil venceu" (país pelo time); "o cálice" (continente pelo conteúdo).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:1, q:'O que é intertextualidade?',                                a:'Diálogo entre textos: citação, paródia, alusão ou paráfrase de um texto em outro. Frequente em charges, tirinhas e publicidade no ENEM — requer repertório cultural.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Qual é a estrutura da redação ENEM?',                       a:'Dissertativo-argumentativa: Introdução (contextualização + tese) → Duas vezes Desenvolvimento (argumento + exemplificação) → Conclusão (proposta de intervenção com 5 elementos).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Quais são os 5 elementos da proposta de intervenção do ENEM?', a:'1) Ação (o que fazer), 2) Agente responsável (quem executa), 3) Modo/meio (como), 4) Efeito esperado (qual o resultado), 5) Finalidade (por quê). Todos em 1-2 frases coesas.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'O que é coesão textual?',                                   a:'Encadeamento linguístico entre partes do texto por meio de pronomes, conjunções, advérbios e sinônimos. Sem coesão o texto fica fragmentado. Competência 4 da redação ENEM.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'Qual a diferença entre narrador onisciente e observador?',  a:'Onisciente: sabe os pensamentos e sentimentos dos personagens; voz em 3ª pessoa. Observador: relata apenas o que se vê externamente, sem acessar a mente dos personagens — como uma câmera.' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:2, q:'O que é eufemismo? Dê um exemplo.',                         a:'Figura que suaviza uma ideia desagradável ou agressiva. Ex: "ele passou para um lugar melhor" (= morreu); "colaborador" (= empregado); "conflito armado" (= guerra).' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:3, q:'Como usar repertório sociocultural legitimamente na redação?', a:'Citar dados, leis, filósofos, obras literárias, filmes ou pesquisas para embasar a tese — com autoria e pertinência. Valem na C2 (repertório). Evitar citações genéricas do tipo "como dizia um filósofo".' },
    { disc:'linguagens', area:'📝 LINGUAGENS', lvl:3, q:'O que é polifonia em Bakhtin?',                             a:'Conceito de que um texto é composto por múltiplas vozes/perspectivas que dialogam. No ENEM aparece em questões de análise do discurso: charges e reportagens têm vozes implícitas e explícitas.' },

    // ── MATEMÁTICA ─────────────────────────────────────────────────────────────
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:1, q:'Teorema de Pitágoras',                                       a:'Em triângulo retângulo: a² = b² + c², onde a é a hipotenusa (lado oposto ao ângulo reto) e b, c são os catetos. Exemplo: catetos 3 e 4 → hipotenusa = 5.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:1, q:'O que é probabilidade?',                                     a:'P(A) = casos favoráveis / casos possíveis. P ∈ [0, 1]. Ex: lançar dado → P(4) = 1/6. Evento impossível: P=0; Evento certo: P=1.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:1, q:'Fórmula do volume da esfera',                                a:'V = (4/3)πr³. Área da superfície: A = 4πr². Lembre: esfera, cubo (V=a³), cilindro (V=πr²h), cone (V=πr²h/3).' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'Fórmula de Bhaskara',                                        a:'Para ax²+bx+c=0: x = (−b ± √Δ) / 2a, onde Δ = b²−4ac. Se Δ>0: 2 raízes distintas; Δ=0: 1 raiz dupla; Δ<0: sem raízes reais.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'O que é função afim (1º grau)?',                             a:'f(x) = ax + b. Se a>0: crescente; a<0: decrescente; a=0: constante. Zero em x = −b/a. Gráfico: reta. Exemplo: velocidade constante v = v₀ + at.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'O que é uma progressão geométrica (PG)?',                    a:'Sequência em que cada termo é o anterior × razão q. Termo geral: aₙ = a₁ · qⁿ⁻¹. Soma dos n termos: Sₙ = a₁(qⁿ−1)/(q−1). Exemplo: 2, 4, 8, 16... (q=2).' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'Fórmula da área do triângulo com base e altura',             a:'A = (base × altura) / 2. Com os 3 lados (Heron): s = (a+b+c)/2, A = √(s(s-a)(s-b)(s-c)). Em triângulo equilátero: A = (l²√3)/4.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:2, q:'O que é combinação simples C(n,k)?',                         a:'Número de grupos de k elementos tirados de n sem considerar ordem: C(n,k) = n! / (k! · (n−k)!). Ex: C(5,2) = 10 pares possíveis de 5 pessoas.' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:3, q:'O que é logaritmo? Propriedades básicas.',                   a:'logₐb = x ↔ aˣ = b. Propriedades: log(AB) = logA + logB; log(A/B) = logA − logB; log(Aⁿ) = n·logA; logₐa = 1; logₐ1 = 0. Muito usado em escalas (pH, Richter, dB).' },
    { disc:'matematica', area:'➗ MATEMÁTICA', lvl:3, q:'O que é uma função exponencial?',                            a:'f(x) = a·bˣ (b>0, b≠1). Se b>1: crescente; 0<b<1: decrescente. Modela crescimento/decaimento: população, juros compostos, meia-vida radioativa. Inversa do logaritmo.' },
];

// ── Dados: Resumos ────────────────────────────────────────────────────────────
const RESUMOS = {
    humanas: { icon:'🌍', name:'Ciências Humanas', topics:[
        {
            title:'Era Vargas (1930–1945)',
            content:`<h4>Fases</h4><ul>
<li><strong>Gov. Provisório (1930–34):</strong> fim da República Velha (café-com-leite), criação do Ministério do Trabalho, Revolução de 1930</li>
<li><strong>Gov. Constitucional (1934–37):</strong> Constituição de 1934, 1º sufrágio feminino no Brasil</li>
<li><strong>Estado Novo (1937–45):</strong> ditadura inspirada no fascismo europeu, Constituição de 1937 ("Polaca"), censura pelo DIP, perseguição ao PCB</li>
</ul>
<h4>Legado econômico-social</h4>
<ul><li>CLT (1943): Consolidação das Leis do Trabalho</li>
<li>Salário mínimo (1940)</li>
<li>CSN — Companhia Siderúrgica Nacional (1941)</li>
<li>Petrobras (1953, no 2º governo Vargas)</li></ul>
<h4>Fim do Estado Novo</h4><p>Pressão popular e crise interna levaram à deposição em 1945. Vargas voltou eleito em 1950 e suicidou-se em 1954, deixando a "Carta Testamento" — "saio da vida para entrar na história".</p>`,
        },
        {
            title:'Segunda Guerra Mundial (1939–1945)',
            content:`<h4>Causas</h4><ul>
<li>Tratado de Versalhes (1919): humilhação alemã, reparações de guerra</li>
<li>Ascensão do totalitarismo: nazismo (Hitler), fascismo (Mussolini), militarismo japonês</li>
<li>Grande Depressão de 1929 e instabilidade política</li>
<li>Política de apaziguamento aliada (Conferência de Munique, 1938)</li></ul>
<h4>Frentes e marcos</h4><ul>
<li><strong>Europa:</strong> invasão da Polônia (set/1939), Batalha da França, Operação Barbarossa (URSS), Dia D (jun/1944)</li>
<li><strong>Pacífico:</strong> Pearl Harbor (dez/1941) → entrada dos EUA; Hiroshima e Nagasaki (ago/1945)</li>
<li><strong>Brasil:</strong> Forças Expedicionárias Brasileiras (FEB) na Itália (1944)</li></ul>
<h4>Consequências</h4><p>~65–80 milhões de mortos, Holocausto (6 mi de judeus), criação da ONU (1945), Plano Marshall, Estado de Israel (1948), início da Guerra Fria.</p>`,
        },
        {
            title:'Guerra Fria (1947–1991)',
            content:`<h4>Blocos</h4><ul>
<li><strong>Capitalista (EUA):</strong> OTAN, Plano Marshall, Doutrina Truman, capitalismo liberal</li>
<li><strong>Socialista (URSS):</strong> Pacto de Varsóvia, COMECON, expansão ao Leste Europeu e países subdesenvolvidos</li></ul>
<h4>Eventos-chave</h4><ul>
<li>Corrida espacial: Sputnik (1957), Neil Armstrong na Lua (1969)</li>
<li>Corrida nuclear: bomba atômica → bomba H → MAAD (destruição mútua assegurada)</li>
<li>Guerras proxy: Coreia (1950-53), Vietnã (1955-75), Afeganistão (1979-89)</li>
<li>Crise dos Mísseis em Cuba (1962): 13 dias mais próximos da guerra nuclear</li></ul>
<h4>Fim</h4><p>Queda do Muro de Berlim (nov/1989) → reunificação alemã · Dissolução da URSS (dez/1991) → 15 repúblicas independentes. Era pós-bipolar: EUA como hiperpotência e globalização acelerada.</p>`,
        },
        {
            title:'Revolução Francesa (1789) e Iluminismo',
            content:`<h4>Contexto</h4><p>Crise fiscal da monarquia absolutista de Luís XVI, desigualdade entre Estados (clero + nobreza x 3º Estado = 97% da pop.), influência iluminista e da Revolução Americana (1776).</p>
<h4>Fases</h4><ul>
<li><strong>Monarquia Constitucional (1789–92):</strong> Declaração dos Direitos do Homem, fim do feudalismo</li>
<li><strong>Convenção Nacional — Terror (1792–94):</strong> guilhotina, Robespierre, 40 mil executados</li>
<li><strong>Diretório (1795–99):</strong> instabilidade, golpe de Napoleão Bonaparte (18 Brumário)</li></ul>
<h4>Iluminismo</h4><ul>
<li><strong>Locke:</strong> direitos naturais, direito à revolução</li>
<li><strong>Montesquieu:</strong> separação dos três poderes</li>
<li><strong>Rousseau:</strong> soberania popular, contrato social</li>
<li><strong>Voltaire:</strong> crítica à Igreja, liberdade de expressão</li></ul>`,
        },
        {
            title:'Brasil República: Períodos e Constituições',
            content:`<h4>Linha do tempo</h4><ul>
<li><strong>República Velha (1889–1930):</strong> Oligarquias, política do café-com-leite (SP×MG), coronelismo, Revolta da Chibata (1910), Semana de Arte Moderna (1922)</li>
<li><strong>Era Vargas (1930–45):</strong> industrialização, trabalhismo, Estado Novo</li>
<li><strong>Democracia Populista (1945–64):</strong> JK (Brasília, 50 anos em 5), Jânio Quadros, João Goulart</li>
<li><strong>Ditadura Militar (1964–85):</strong> 5 AI, AI-5 (1968), milagre econômico, abertura gradual</li>
<li><strong>Nova República (1985–):</strong> Diretas Já, Constituição de 1988 (cidadã), Collor, FHC, Lula, Dilma, Temer, Bolsonaro, Lula</li></ul>
<h4>Constituições</h4><p>1824 (Imperial) · 1891 (1ª República) · 1934 · 1937 · 1946 · 1967/69 · <strong>1988</strong> (atual — redemocratização, direitos sociais amplos).</p>`,
        },
    ]},
    natureza: { icon:'🔬', name:'Ciências da Natureza', topics:[
        {
            title:'Leis de Mendel e Genética',
            content:`<h4>1ª Lei — Segregação dos Fatores</h4>
<p>Cada caráter é determinado por dois fatores (alelos) que se separam na formação dos gametas, cada gameta recebe um alelo. Ex: Aa → 50% gametas A + 50% gametas a.</p>
<h4>2ª Lei — Segregação Independente</h4>
<p>Genes de cromossomos diferentes se separam de modo independente. Proporção clássica F2 diíbrido: <strong>9:3:3:1</strong>.</p>
<h4>Exceções importantes</h4><ul>
<li><strong>Codominância:</strong> ambos os alelos se expressam (tipo sanguíneo AB)</li>
<li><strong>Dominância incompleta:</strong> fenótipo intermediário (flor rosa = V×B)</li>
<li><strong>Pleiotropia:</strong> 1 gene → múltiplos fenótipos (anemia falciforme)</li>
<li><strong>Epistase:</strong> gene mascara outro (albinismo)</li>
<li><strong>Ligação gênica:</strong> genes no mesmo cromossomo — violam 2ª Lei</li></ul>
<h4>Tipo sanguíneo ABO</h4><p>Iᴬ e Iᴮ são codominantes com i recessivo. Rh: Rr ou RR = Rh+; rr = Rh−.</p>`,
        },
        {
            title:'Funções Orgânicas (Química)',
            content:`<h4>Grupos funcionais principais</h4>
<ul>
<li><strong>Álcool:</strong> –OH ligado a C saturado · Ex: etanol (C₂H₅OH)</li>
<li><strong>Fenol:</strong> –OH ligado a anel benzênico · Ex: fenol, ácido salicílico</li>
<li><strong>Aldeído:</strong> –CHO na extremidade da cadeia · Ex: formaldeído, acetaldeído</li>
<li><strong>Cetona:</strong> C=O no interior da cadeia · Ex: acetona</li>
<li><strong>Ácido carboxílico:</strong> –COOH · Ex: ácido acético (vinagre), ácido cítrico</li>
<li><strong>Éster:</strong> R–COO–R' · responsável por aromas; formado por esterificação (ácido + álcool → éster + água)</li>
<li><strong>Amina:</strong> –NH₂ · Ex: metilamina, dopamina</li>
<li><strong>Amida:</strong> –CO–NH– · Ex: uréia, nylon</li>
<li><strong>Éter:</strong> R–O–R' · Ex: éter etílico (anestésico)</li></ul>
<h4>Dica ENEM</h4><p>Identificar o grupo funcional pelo sufixo: -ol (álcool), -al (aldeído), -ona (cetona), -oico (ácido), -ato (éster), -amina, -amida.</p>`,
        },
        {
            title:'Termodinâmica',
            content:`<h4>1ª Lei — Conservação de Energia</h4>
<p>ΔU = Q − W. Q>0: sistema absorve calor. W>0: sistema realiza trabalho sobre a vizinhança.</p>
<h4>2ª Lei — Entropia e Irreversibilidade</h4>
<p>O calor flui espontaneamente do corpo mais quente para o mais frio. A entropia (desordem) do universo sempre aumenta em processos reais. Impossível construir motor de 100% rendimento.</p>
<h4>Rendimento de máquinas térmicas</h4>
<p>η = W/Q₁ = 1 − Q₂/Q₁. Máquina de Carnot (ideal): η = 1 − Tf/Tq (em Kelvin). T(K) = T(°C) + 273.</p>
<h4>Processos termodinâmicos</h4><ul>
<li>Isotérmico: T constante → ΔU=0 → Q=W</li>
<li>Isobárico: P constante → W=PΔV</li>
<li>Isovolumétrico (isocórico): V constante → W=0 → ΔU=Q</li>
<li>Adiabático: Q=0 → ΔU=−W</li></ul>`,
        },
        {
            title:'Ecologia e Meio Ambiente',
            content:`<h4>Níveis de organização ecológica</h4>
<p>Indivíduo → População → Comunidade → Ecossistema → Biosfera.</p>
<h4>Cadeias e teias alimentares</h4>
<ul>
<li><strong>Produtores:</strong> plantas e algas (fotossíntese)</li>
<li><strong>Consumidores primários:</strong> herbívoros</li>
<li><strong>Consumidores secundários/terciários:</strong> carnívoros</li>
<li><strong>Decompositores:</strong> fungos e bactérias — reciclam nutrientes</li></ul>
<h4>Ciclos biogeoquímicos</h4>
<p>Carbono (fotossíntese/respiração), Nitrogênio (fixação → nitrificação → desnitrificação), Água (evaporação → precipitação → percolação).</p>
<h4>Biomas brasileiros (ENEM adora!)</h4>
<ul>
<li><strong>Amazônia:</strong> maior biodiversidade terrestre; ameaça: desmatamento</li>
<li><strong>Cerrado:</strong> savana tropical; 2ª maior biodiversidade brasileira; "berço das águas"</li>
<li><strong>Mata Atlântica:</strong> 12-13% remanescente; hotspot de biodiversidade</li>
<li><strong>Caatinga:</strong> único bioma exclusivamente brasileiro; semiárido</li>
<li><strong>Pampa e Pantanal:</strong> menor extensão; Pantanal = maior área úmida do mundo</li></ul>`,
        },
        {
            title:'Física Moderna — Relatividade e Quântica',
            content:`<h4>Relatividade Especial (Einstein, 1905)</h4>
<ul>
<li>A velocidade da luz c = 3×10⁸ m/s é constante para todos os observadores</li>
<li><strong>Dilatação do tempo</strong> e <strong>contração do espaço</strong> para corpos em alta velocidade</li>
<li>E = mc²: equivalência massa-energia — base da energia nuclear</li></ul>
<h4>Física Quântica</h4>
<ul>
<li><strong>Efeito fotoelétrico (Einstein, Nobel 1921):</strong> luz em fótons E=hf; elétrons são ejetados quando f ≥ frequência limiar</li>
<li><strong>Modelo atômico de Bohr:</strong> elétrons em órbitas estacionárias; emissão/absorção de luz ao mudar de nível</li>
<li><strong>Dualidade onda-partícula (De Broglie):</strong> matéria tem comportamento ondulatório λ=h/mv</li>
<li><strong>Princípio da Incerteza (Heisenberg):</strong> não é possível medir posição e velocidade simultaneamente com precisão ilimitada</li></ul>`,
        },
    ]},
    linguagens: { icon:'📝', name:'Linguagens', topics:[
        {
            title:'5 Competências da Redação ENEM',
            content:`<h4>Cada competência vale 0–200 pts (total: 1000)</h4>
<ul>
<li><strong>C1 — Norma culta:</strong> gramática, ortografia, pontuação, concordância. Erros graves zeram a nota!</li>
<li><strong>C2 — Compreensão do tema + repertório:</strong> entender o tema, não fugir, usar dados/citações/leis relevantes. Repertório deve ser pertinente e bem articulado.</li>
<li><strong>C3 — Argumentação:</strong> selecionar, organizar e interpretar informações. Tese clara, argumentos que a sustentam, exemplos e dados concretos.</li>
<li><strong>C4 — Coesão textual:</strong> articulação entre partes usando conectivos, pronomes e sinônimos. Sem repetição e sem incoerências.</li>
<li><strong>C5 — Proposta de intervenção:</strong> obrigatoriamente 5 elementos: ação + agente + modo/instrumento + efeito esperado + finalidade. Deve respeitar os direitos humanos.</li></ul>
<h4>Conectivos mais usados</h4>
<p>Causais: porque, pois, visto que · Concessivos: embora, ainda que, apesar de · Conclusivos: portanto, logo, assim · Adversativos: porém, contudo, entretanto · Aditivos: além disso, também, não só...mas também</p>`,
        },
        {
            title:'Figuras de Linguagem completo',
            content:`<ul>
<li><strong>Metáfora:</strong> comparação implícita — "meu coração é uma pedra"; "tempo é dinheiro"</li>
<li><strong>Metonímia:</strong> substituição por relação — "li Clarice" (autor/obra); "Brasil venceu" (país/time); "beber o cálice" (recipiente/conteúdo)</li>
<li><strong>Catacrese:</strong> metáfora cristalizada — "pé da mesa", "braço do rio", "asa da xícara"</li>
<li><strong>Ironia:</strong> dizer o oposto do que se pensa com intenção crítica — "Que bela ideia!"</li>
<li><strong>Hipérbole:</strong> exagero expressivo — "chorei um oceano"; "te liguei mil vezes"</li>
<li><strong>Eufemismo:</strong> suavizar ideia negativa — "partiu para um lugar melhor"; "colaborador" (empregado)</li>
<li><strong>Antítese:</strong> ideias opostas aproximadas — "era o melhor dos tempos, era o pior dos tempos"</li>
<li><strong>Paradoxo:</strong> contradição aparente mas verdadeira — "morro de tanto viver"; "claridade cega"</li>
<li><strong>Personificação/Prosopopeia:</strong> humanos atributos ao inanimado — "o vento gemeu"; "a esperança suspirou"</li>
<li><strong>Sinestesia:</strong> mistura de sentidos — "voz aveludada"; "cor quente"</li>
<li><strong>Aliteração:</strong> repetição de consoantes — "Peter Piper picked peppers"</li>
<li><strong>Anáfora:</strong> repetição de palavra no início dos versos/frases — discurso de M.L.King: "I have a dream"</li></ul>`,
        },
        {
            title:'Gêneros Textuais e Tipologias',
            content:`<h4>Tipos textuais (como está organizado o texto)</h4>
<ul>
<li><strong>Narrativo:</strong> conta um relato com personagens, enredo, tempo e espaço</li>
<li><strong>Descritivo:</strong> apresenta características de um ser, objeto ou lugar</li>
<li><strong>Dissertativo-argumentativo:</strong> defende tese com argumentos — gênero da redação ENEM</li>
<li><strong>Expositivo:</strong> informa e explica sem argumentar (artigo científico, enciclopédia)</li>
<li><strong>Injuntivo/Instrucional:</strong> orienta ações (receita, manual, bula)</li></ul>
<h4>Gêneros discursivos (como circula na sociedade)</h4>
<p>Cada gênero tem estrutura composicional, estilo e conteúdo temático. Ex: carta, reportagem, charge, tirinha, editorial, blog, post, discurso político, conto, crônica, poema.</p>
<h4>Dica ENEM</h4><p>A prova cobra: inferência, intertextualidade, ironia em charges/tirinhas, variação linguística (norma culta vs. variedades), funções da linguagem (referencial, emotiva, conativa, fática, poética, metalinguística).</p>`,
        },
        {
            title:'Literatura Brasileira — Escolas Literárias',
            content:`<h4>Pré-Modernismo e Modernismo</h4>
<ul>
<li><strong>Realismo (1881):</strong> Machado de Assis — narrativa psicológica, ironia, crítica social. Obras: Dom Casmurro, Quincas Borba</li>
<li><strong>Naturalismo:</strong> Aluísio Azevedo — determinismo, meio e raça. O Cortiço</li>
<li><strong>Pré-Modernismo:</strong> Euclides da Cunha (Os Sertões), Lima Barreto, Graça Aranha</li></ul>
<h4>1ª Fase Modernista (1922–30) — "Destruição"</h4>
<p>Semana de Arte Moderna (fev/1922): liberdade formal, valorização do popular e nacional. Oswald de Andrade (Manifesto Antropófago), Mário de Andrade (Macunaíma).</p>
<h4>2ª Fase Modernista (1930–45) — "Construção"</h4>
<p>Prosa regionalista e maior preocupação social. Carlos Drummond de Andrade (poesia social), Cecília Meireles, João Cabral de Melo Neto. Em prosa: Graciliano Ramos (Vidas Secas), Jorge Amado, José Lins do Rego.</p>
<h4>Literatura Contemporânea (pós-1945)</h4>
<p>Guimarães Rosa (Grande Sertão: Veredas — linguagem inventiva), Clarice Lispector (fluxo de consciência), João Guimarães Rosa, Rubem Fonseca (conto urbano violento). Poesia concreta: Décio Pignatari.</p>`,
        },
    ]},
    matematica: { icon:'➗', name:'Matemática', topics:[
        {
            title:'Funções de 1º e 2º Grau',
            content:`<h4>Função Afim — f(x) = ax + b</h4>
<p>Crescente se a>0; decrescente se a<0; constante se a=0. Zero (raiz): x = −b/a. Gráfico: reta.</p>
<h4>Função Quadrática — f(x) = ax² + bx + c</h4>
<p>Gráfico: parábola. Concavidade: ∪ se a>0; ∩ se a<0.<br>
Vértice: xᵥ = −b/2a · yᵥ = −Δ/4a.<br>
Δ = b²−4ac: se Δ>0 → 2 raízes; Δ=0 → 1 raiz dupla; Δ<0 → sem raízes reais.<br>
Bhaskara: x = (−b ± √Δ) / 2a.</p>
<h4>Dicas visuais</h4>
<ul><li>Se a pergunta envolve "maior valor" ou "menor valor" → busque o vértice</li>
<li>Se a parábola corta o eixo x → use Bhaskara ou fatoração</li>
<li>Função afim: velocidade, salário, taxa fixa + variável</li>
<li>Quadrática: trajetória de projéteis, área em função de medida</li></ul>`,
        },
        {
            title:'Geometria Plana — Áreas e Perímetros',
            content:`<h4>Fórmulas essenciais</h4>
<ul>
<li><strong>Quadrado:</strong> A = l² · P = 4l</li>
<li><strong>Retângulo:</strong> A = b × h · P = 2(b+h)</li>
<li><strong>Triângulo:</strong> A = b×h/2 · Equilátero: A = l²√3/4</li>
<li><strong>Círculo:</strong> A = πr² · Comprimento: C = 2πr · Arco: s = rθ (θ em rad)</li>
<li><strong>Trapézio:</strong> A = (B+b)×h/2</li>
<li><strong>Losango:</strong> A = d₁×d₂/2</li>
<li><strong>Paralelogramo:</strong> A = b×h</li></ul>
<h4>Geometria Espacial</h4>
<ul>
<li>Cubo: V = a³ · A = 6a²</li>
<li>Paralelepípedo: V = a×b×c</li>
<li>Cilindro: V = πr²h · Alateral = 2πrh</li>
<li>Cone: V = πr²h/3 · Alateral = πrl (l = geratriz)</li>
<li>Esfera: V = 4πr³/3 · A = 4πr²</li>
<li>Pirâmide: V = Ab×h/3 (Ab = área da base)</li></ul>`,
        },
        {
            title:'Probabilidade e Combinatória',
            content:`<h4>Probabilidade</h4>
<p>P(A) = nº casos favoráveis / nº casos totais. P ∈ [0,1]. P(A') = 1 − P(A).<br>
<strong>Adição:</strong> P(A∪B) = P(A) + P(B) − P(A∩B).<br>
<strong>Multiplicação (independentes):</strong> P(A∩B) = P(A)·P(B).<br>
<strong>Condicional:</strong> P(A|B) = P(A∩B)/P(B).</p>
<h4>Análise Combinatória</h4>
<ul>
<li><strong>Princípio Fundamental da Contagem:</strong> n₁ × n₂ × ... × nₖ</li>
<li><strong>Permutação simples:</strong> Pₙ = n!</li>
<li><strong>Arranjo:</strong> A(n,p) = n!/(n−p)!</li>
<li><strong>Combinação:</strong> C(n,p) = n!/(p!·(n−p)!)</li>
<li><strong>Permutação com repetição:</strong> n!/(n₁!·n₂!···)</li></ul>
<h4>Truque ENEM</h4>
<p>Se a ordem importa → Arranjo/Permutação. Se a ordem NÃO importa → Combinação. Senhas e filas pedem Arranjo; comissões e grupos pedem Combinação.</p>`,
        },
        {
            title:'Progressões Aritméticas e Geométricas',
            content:`<h4>PA — Progressão Aritmética (razão r)</h4>
<ul>
<li>Termo geral: aₙ = a₁ + (n−1)r</li>
<li>Soma dos n termos: Sₙ = n·(a₁+aₙ)/2</li>
<li>Exemplos: 2, 5, 8, 11… (r=3) · salários com aumento fixo</li></ul>
<h4>PG — Progressão Geométrica (razão q)</h4>
<ul>
<li>Termo geral: aₙ = a₁ · qⁿ⁻¹</li>
<li>Soma dos n termos: Sₙ = a₁·(qⁿ−1)/(q−1)</li>
<li>PG infinita (|q|<1): S∞ = a₁/(1−q)</li>
<li>Exemplos: 1, 2, 4, 8… (q=2) · juros compostos · crescimento populacional</li></ul>
<h4>Juros Compostos</h4>
<p>M = C·(1+i)ⁿ, onde C = capital, i = taxa, n = períodos. PG com q = (1+i). Aparecem em questões de investimento, dívida e inflação no ENEM.</p>`,
        },
        {
            title:'Trigonometria e Funções Trigonométricas',
            content:`<h4>Razões no triângulo retângulo</h4>
<p>sen θ = oposto/hipotenusa · cos θ = adjacente/hipotenusa · tg θ = oposto/adjacente</p>
<h4>Valores especiais</h4>
<table style="width:100%;border-collapse:collapse;font-size:12px">
<tr><th style="border:1px solid var(--border-subtle);padding:4px">θ</th><th style="border:1px solid var(--border-subtle);padding:4px">sen</th><th style="border:1px solid var(--border-subtle);padding:4px">cos</th><th style="border:1px solid var(--border-subtle);padding:4px">tg</th></tr>
<tr><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">30°</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">1/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√3/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√3/3</td></tr>
<tr><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">45°</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√2/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√2/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">1</td></tr>
<tr><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">60°</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√3/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">1/2</td><td style="border:1px solid var(--border-subtle);padding:4px;text-align:center">√3</td></tr>
</table>
<h4>Identidades fundamentais</h4>
<p>sen²θ + cos²θ = 1 · tg θ = senθ/cosθ · Lei dos cossenos: a²=b²+c²−2bc·cos A</p>`,
        },
    ]},
};

let _fcCards = [...FLASHCARDS];
let _fcIdx   = 0;
let _fcKnown = new Set();      // índices originais dominados
let _fcDifficult = new Set();  // índices originais confusos
let _fcDisc  = '';
let _fcLvl   = 0;
let _fcReviewMode = false;     // true = modo "Revisar confusos"
let _tutorMessages = [];

function renderConteudo() {
    // Inicializar flashcards na primeira vez
    if (_fcCards.length === 0) _fcCards = [...FLASHCARDS];
    renderCurrentFlashcard();
    renderResumosPanel();

    // Mensagem inicial do tutor — recupera histórico da sessão se houver
    if (_tutorMessages.length === 0) {
        try {
            const saved = sessionStorage.getItem('tutor_history');
            if (saved) _tutorMessages = JSON.parse(saved);
        } catch {}
    }
    if (_tutorMessages.length === 0) {
        _tutorMessages = [{
            role: 'ai',
            text: 'Olá! Sou o **Tutor IA** do ENEM Master 🎓\n\nPosso te explicar qualquer assunto do ENEM: *Matemática, Física, Química, Biologia, Humanas, Linguagens e Redação*.\n\nUse as sugestões acima ou faça sua pergunta! 👆',
        }];
    }
    _renderTutorMessages();
}

function switchConteudoTab(tab, btn) {
    document.querySelectorAll('.conteudo-tab').forEach(t => t.classList.remove('active'));
    // Oculta todos os painéis respeitando o display correto de cada um
    document.querySelectorAll('.conteudo-panel').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    btn.classList.add('active');
    const panel = document.getElementById(`conteudo-panel-${tab}`);
    if (panel) {
        panel.classList.add('active');
        // Tutor precisa de flex para funcionar corretamente
        panel.style.display = (tab === 'tutor') ? 'flex' : 'block';
    }
    if (tab === 'resumos') renderResumosPanel();
    if (tab === 'progresso') renderProgressoPanel();
}

// ── Progresso ─────────────────────────────────────────────────────────────────
function renderProgressoPanel() {
    // Streak
    const streak = (state.user && state.user.streak) || 0;
    const streakEl = document.getElementById('prog-streak-num');
    if (streakEl) streakEl.textContent = streak;

    // Barras por disciplina
    const discs = ['humanas', 'natureza', 'linguagens', 'matematica'];
    const discIcons  = { humanas: '🌍', natureza: '🔬', linguagens: '📝', matematica: '➗' };
    const discNames  = { humanas: 'Humanas', natureza: 'Natureza', linguagens: 'Linguagens', matematica: 'Matemática' };
    const discColors = { humanas: 'var(--teal)', natureza: '#a78bfa', linguagens: 'var(--gold)', matematica: '#f97316' };

    const barsEl = document.getElementById('prog-disc-bars');
    if (barsEl) {
        barsEl.innerHTML = discs.map(disc => {
            const indices = FLASHCARDS.reduce((acc, fc, i) => { if (fc.disc === disc) acc.push(i); return acc; }, []);
            const total = indices.length;
            const known = indices.filter(i => _fcKnown.has(i)).length;
            const pct   = total > 0 ? Math.round((known / total) * 100) : 0;
            return `<div class="prog-bar-row">
  <div class="prog-bar-label">
    <span>${discIcons[disc]} ${discNames[disc]}</span>
    <span class="prog-bar-pct">${pct}% <small>${known}/${total}</small></span>
  </div>
  <div class="prog-bar-track"><div class="prog-bar-fill" style="width:${pct}%;background:${discColors[disc]}"></div></div>
</div>`;
        }).join('');
    }

    // Top 3 tópicos com mais erros
    const errorMap = {};
    _fcDifficult.forEach(i => {
        const fc = FLASHCARDS[i];
        if (!fc) return;
        errorMap[fc.area] = (errorMap[fc.area] || 0) + 1;
    });
    const sorted = Object.entries(errorMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const errorsEl = document.getElementById('prog-top-errors');
    if (errorsEl) {
        if (sorted.length === 0) {
            errorsEl.innerHTML = '<li class="prog-no-errors">Nenhum cartão marcado como "confuso" ainda.</li>';
        } else {
            errorsEl.innerHTML = sorted.map(([area, count], idx) =>
                `<li class="prog-error-item">
  <span class="prog-error-rank">${idx + 1}</span>
  <span class="prog-error-area">${area}</span>
  <span class="prog-error-count">${count} ${count === 1 ? 'erro' : 'erros'}</span>
</li>`).join('');
        }
    }
}

// ── Flashcards ────────────────────────────────────────────────────────────────
function selectFlashcardDisc(btn, disc) {
    document.querySelectorAll('#conteudo-panel-flashcard .topic-chip, #conteudo-panel-flashcard .fc-disc-btn').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
    _fcIdx   = 0;
    _fcKnown = new Set();
    _fcDifficult = new Set();
    _fcReviewMode = false;
    _fcDisc  = disc;
    _applyFlashcardFilters();
}

function selectFlashcardLvl(btn, lvl) {
    document.querySelectorAll('.fc-lvl-chip').forEach(c => {
        c.style.fontWeight = '700';
        c.style.opacity = '0.7';
    });
    btn.style.opacity = '1';
    btn.style.fontWeight = '900';
    _fcIdx   = 0;
    _fcKnown = new Set();
    _fcDifficult = new Set();
    _fcReviewMode = false;
    _fcLvl   = lvl;
    _applyFlashcardFilters();
}

function _applyFlashcardFilters() {
    _fcCards = FLASHCARDS.filter(c => {
        const discOk = !_fcDisc || c.disc === _fcDisc;
        const lvlOk  = !_fcLvl  || c.lvl  === _fcLvl;
        return discOk && lvlOk;
    });
    if (!_fcCards.length) {
        _showQuickToast('Nenhum card com esses filtros 😅');
        _fcCards = FLASHCARDS;
    }
    _fcIdx = 0;
    renderCurrentFlashcard();
}

function renderCurrentFlashcard() {
    if (!_fcCards.length) return;
    const card = _fcCards[_fcIdx];

    const fcEl = document.getElementById('flashcard');
    if (fcEl) fcEl.classList.remove('flipped');

    const areaEl      = document.getElementById('fc-area');
    const qEl         = document.getElementById('fc-question');
    const aEl         = document.getElementById('fc-answer');
    const areaBackEl  = document.getElementById('fc-area-back');
    const counterEl   = document.getElementById('fc-counter');
    const knownLbl    = document.getElementById('fc-known-label');
    const difficultLbl= document.getElementById('fc-difficult-label');
    const lvlBadge    = document.getElementById('fc-lvl-badge');
    const reviewBtn   = document.getElementById('fc-review-btn');
    const segKnown    = document.getElementById('fc-seg-known');
    const segDifficult= document.getElementById('fc-seg-difficult');

    if (areaEl)     areaEl.textContent     = card.area;
    if (qEl)        qEl.textContent        = card.q;
    if (aEl)        aEl.textContent        = card.a;
    if (areaBackEl) areaBackEl.textContent = card.area;
    if (counterEl)  counterEl.textContent  = `${_fcIdx + 1} / ${_fcCards.length}`;

    // Barra segmentada: calcula % de dominados e confusos no deck atual
    const total = _fcCards.length;
    const knownPct     = total ? (_fcKnown.size     / total) * 100 : 0;
    const difficultPct = total ? (_fcDifficult.size / total) * 100 : 0;
    if (segKnown)     segKnown.style.width     = knownPct + '%';
    if (segDifficult) segDifficult.style.width = difficultPct + '%';

    // Legenda
    if (knownLbl)     knownLbl.textContent     = `${_fcKnown.size} dominados`;
    if (difficultLbl) difficultLbl.textContent = `${_fcDifficult.size} confusos`;

    // Mostrar botão Revisar confusos somente se houver confusos e não estiver no modo review
    if (reviewBtn) {
        if (_fcDifficult.size > 0 && !_fcReviewMode) {
            reviewBtn.style.display = 'inline-flex';
            reviewBtn.textContent   = `🔁 Revisar ${_fcDifficult.size} confuso${_fcDifficult.size > 1 ? 's' : ''}`;
        } else if (_fcReviewMode) {
            reviewBtn.style.display = 'inline-flex';
            reviewBtn.textContent   = '← Todos os cards';
        } else {
            reviewBtn.style.display = 'none';
        }
    }

    if (lvlBadge) {
        const lvlMap = {
            1: { label:'FÁCIL',   color:'#4ade80', bg:'rgba(74,222,128,0.15)' },
            2: { label:'MÉDIO',   color:'#fbbf24', bg:'rgba(251,191,36,0.15)' },
            3: { label:'DIFÍCIL', color:'#f87171', bg:'rgba(248,113,113,0.15)' },
        };
        const lvl = lvlMap[card.lvl] || lvlMap[1];
        lvlBadge.textContent        = lvl.label;
        lvlBadge.style.color        = lvl.color;
        lvlBadge.style.background   = lvl.bg;
        lvlBadge.style.border       = `1px solid ${lvl.color}55`;
    }
}

function flipFlashcard() {
    const el = document.getElementById('flashcard');
    if (el) el.classList.toggle('flipped');
}

function nextFlashcard() {
    if (_fcIdx < _fcCards.length - 1) {
        _fcIdx++;
    } else {
        _showQuickToast('🎉 Você revisou todos os flashcards!');
        _fcIdx = 0;
    }
    renderCurrentFlashcard();
}

function prevFlashcard() {
    if (_fcIdx > 0) { _fcIdx--; renderCurrentFlashcard(); }
}

function rateFlashcard(known) {
    const globalIdx = FLASHCARDS.indexOf(_fcCards[_fcIdx]);
    if (known) {
        _fcKnown.add(globalIdx);
        _fcDifficult.delete(globalIdx);
        _showQuickToast(`✅ Dominado! ${_fcKnown.size} de ${_fcCards.length}`);
    } else {
        _fcDifficult.add(globalIdx);
        _fcKnown.delete(globalIdx);
        _showQuickToast(`📖 Anotado para revisar`);
    }
    nextFlashcard();
}

function toggleReviewDifficult() {
    if (_fcReviewMode) {
        // Sair do modo revisar
        _fcReviewMode = false;
        _fcIdx = 0;
        _fcKnown     = new Set();
        _applyFlashcardFilters();
        _showQuickToast('📋 Voltando a todos os cards');
    } else {
        // Entrar no modo revisar: filtra apenas os confusos
        const difficultCards = [..._fcDifficult].map(i => FLASHCARDS[i]).filter(Boolean);
        if (!difficultCards.length) { _showQuickToast('Nenhum card marcado como confuso ainda!'); return; }
        _fcReviewMode = true;
        _fcCards = difficultCards;
        _fcIdx   = 0;
        _showQuickToast(`🔁 Revisando ${difficultCards.length} card${difficultCards.length > 1 ? 's' : ''} confuso${difficultCards.length > 1 ? 's' : ''}`);
        renderCurrentFlashcard();
    }
}

// ── Resumos ────────────────────────────────────────────────────────────────────
// Carrega IDs de tópicos estudados do localStorage
function _loadStudiedTopics() {
    try { return new Set(JSON.parse(localStorage.getItem('resumos_studied') || '[]')); }
    catch { return new Set(); }
}
function _saveStudiedTopics(set) {
    try { localStorage.setItem('resumos_studied', JSON.stringify([...set])); } catch {}
}

function renderResumosPanel() {
    const listEl = document.getElementById('resumos-list');
    if (!listEl || listEl.children.length > 0) return; // só renderiza uma vez

    const studied = _loadStudiedTopics();

    Object.entries(RESUMOS).forEach(([disc, data]) => {
        const discBtn = document.createElement('button');
        discBtn.className = 'resumo-disc-btn';

        // Conta tópicos estudados desta disciplina
        const studiedCount = data.topics.filter((_, i) => studied.has(`${disc}_${i}`)).length;
        const allStudied = studiedCount === data.topics.length;

        discBtn.innerHTML = `
            <span class="resumo-disc-icon">${data.icon}</span>
            <div style="flex:1">
                <p class="resumo-disc-name">${data.name}</p>
                <p class="resumo-disc-sub">${studiedCount > 0 ? `${studiedCount}/${data.topics.length} estudados` : `${data.topics.length} tópicos`}</p>
            </div>
            ${allStudied ? '<span style="font-size:11px;font-weight:700;color:#4ade80">&#10003; Completo</span>' : ''}
            <span class="resumo-disc-arrow">›</span>`;
        discBtn.onclick = () => _toggleResumoDisc(disc, discBtn);
        listEl.appendChild(discBtn);

        const contentEl = document.createElement('div');
        contentEl.className = 'resumo-content';
        contentEl.id = `resumo-content-${disc}`;

        data.topics.forEach((topic, i) => {
            const topicKey = `${disc}_${i}`;
            const isStudied = studied.has(topicKey);

            const topicDiv = document.createElement('div');
            topicDiv.className = 'resumo-topic-wrap';
            topicDiv.dataset.key = topicKey;

            const h4 = document.createElement('h4');
            h4.textContent = topic.title;
            topicDiv.appendChild(h4);

            const body = document.createElement('div');
            body.innerHTML = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(topic.content) : topic.content;
            topicDiv.appendChild(body);

            // Botão Marcar como estudado
            const markBtn = document.createElement('button');
            markBtn.className = `resumo-mark-btn${isStudied ? ' studied' : ''}`;
            markBtn.textContent = isStudied ? '✓ Estudado' : 'Marcar como estudado';
            markBtn.onclick = () => _toggleTopicStudied(topicKey, markBtn, disc);
            topicDiv.appendChild(markBtn);

            contentEl.appendChild(topicDiv);
        });

        listEl.appendChild(contentEl);
    });

    // Barra de leitura: atualiza ao rolar o painel
    const panel = document.getElementById('conteudo-panel-resumos');
    const bar   = document.getElementById('resumo-read-bar');
    if (panel && bar) {
        panel.addEventListener('scroll', () => {
            const max = panel.scrollHeight - panel.clientHeight;
            bar.style.width = max > 0 ? `${(panel.scrollTop / max) * 100}%` : '0%';
        }, { passive: true });
    }
}

function _toggleResumoDisc(disc, btn) {
    const content = document.getElementById(`resumo-content-${disc}`);
    if (!content) return;
    const isOpen = content.classList.contains('open');

    document.querySelectorAll('.resumo-content').forEach(c => c.classList.remove('open'));
    document.querySelectorAll('.resumo-disc-arrow').forEach(a => a.textContent = '›');

    if (!isOpen) {
        content.classList.add('open');
        const arrow = btn.querySelector('.resumo-disc-arrow');
        if (arrow) arrow.textContent = '˅';
    }
}

function _toggleTopicStudied(key, btn, disc) {
    const studied = _loadStudiedTopics();
    if (studied.has(key)) {
        studied.delete(key);
        btn.textContent = 'Marcar como estudado';
        btn.classList.remove('studied');
    } else {
        studied.add(key);
        btn.textContent = '✓ Estudado';
        btn.classList.add('studied');
        _showQuickToast('✅ Tópico marcado como estudado!');
    }
    _saveStudiedTopics(studied);

    // Atualiza contador na disciplina correspondente
    const data = RESUMOS[disc];
    if (!data) return;
    const discBtn = document.querySelector(`button.resumo-disc-btn[onclick*="'${disc}'"]`) ||
        [...document.querySelectorAll('.resumo-disc-btn')].find(b => b.onclick && b.onclick.toString().includes(`'${disc}'`));
    if (discBtn) {
        const studiedCount = data.topics.filter((_, i) => studied.has(`${disc}_${i}`)).length;
        const subEl = discBtn.querySelector('.resumo-disc-sub');
        if (subEl) subEl.textContent = studiedCount > 0 ? `${studiedCount}/${data.topics.length} estudados` : `${data.topics.length} tópicos`;
        const allStudied = studiedCount === data.topics.length;
        let completeTag = discBtn.querySelector('.resumo-complete-tag');
        if (allStudied && !completeTag) {
            completeTag = document.createElement('span');
            completeTag.className = 'resumo-complete-tag';
            completeTag.style.cssText = 'font-size:11px;font-weight:700;color:#4ade80';
            completeTag.textContent = '✓ Completo';
            discBtn.insertBefore(completeTag, discBtn.querySelector('.resumo-disc-arrow'));
        } else if (!allStudied && completeTag) {
            completeTag.remove();
        }
    }
}

// ── Tutor IA ──────────────────────────────────────────────────────────────────
const _TUTOR_KB = {
    // ── Matemática ───────────────────────────────────────────────────────────
    'pit[aá]goras|cat[eê]to|hipotenusa':
        'O **Teorema de Pitágoras**: em triângulo retângulo, **a² = b² + c²**, onde *a* = hipotenusa e *b, c* = catetos. Exemplo: catetos 3 e 4 → hipotenusa = √(9+16) = **5**.',
    'bhaskara|equa.*segundo grau|fun.*quadr':
        'A **Fórmula de Bhaskara** resolve ax²+bx+c=0: **x = (−b ± √Δ) / 2a**, onde **Δ = b²−4ac**. Δ>0: 2 raízes; Δ=0: 1 raiz dupla; Δ<0: sem raízes reais.',
    'probabilidade|combinat|fatorial|permuta':
        '**Probabilidade:** P(A) = favoráveis / possíveis. **Combinação:** C(n,k) = n! / (k!·(n-k)!). **Permutação:** Pₙ = n!. Se a ordem importa → Arranjo/Permutação. Se a ordem NÃO importa → Combinação.',
    'fun.*afim|fun.*primeiro grau|fun.*linear':
        '**Função Afim** f(x)=ax+b: a>0 → crescente; a<0 → decrescente. Zero (raiz): x=−b/a. O coeficiente angular *a* diz "quanto y varia para cada 1 unidade de x".',
    'logaritmo|log|exponenci':
        '**Logaritmo:** logₐb=x ↔ aˣ=b. Propriedades: log(AB)=logA+logB; log(A/B)=logA−logB; log(Aⁿ)=n·logA. **Exponencial:** f(x)=bˣ, inversão do log. Modela: crescimento populacional, juros compostos, meia-vida radioativa.',
    'trigon|seno|cosseno|tangente':
        '**Trigonometria:** sen θ = oposto/hipotenusa · cos θ = adjacente/hipotenusa · tg θ = oposto/adjacente. Valores: 30°→(1/2, √3/2, √3/3); 45°→(√2/2, √2/2, 1); 60°→(√3/2, 1/2, √3). Identidade: **sen²θ + cos²θ = 1**.',
    'juros.*compost|montante|capital':
        '**Juros Compostos:** M = C·(1+i)ⁿ — M=montante, C=capital, i=taxa, n=períodos. Cada período o juros incide sobre o montante anterior ("juros sobre juros"). No ENEM aparecem em questões de financiamento, poupança e dívida.',
    'geometria|[aá]rea|volume|peri[mí]metro':
        '**Geometria:** Triângulo A=bh/2; Círculo A=πr², C=2πr; Retângulo A=bh. Volumes: Esfera V=4πr³/3; Cilindro V=πr²h; Cone V=πr²h/3; Cubo V=a³. Pitágoras para diagonal: d=√(a²+b²+c²).',

    // ── Ciências da Natureza ─────────────────────────────────────────────────
    'dna|gen[eé]tica|alelo|mendel|here':
        '**Genética:** DNA armazena informações em bases A-T-C-G (dupla hélice). **1ª Lei de Mendel:** cada alelo se separa nos gametas (Aa → 50%A + 50%a). **2ª Lei:** genes em cromossomos diferentes segregam independentemente → proporção 9:3:3:1. Exceções: codominância, epistase, ligação gênica.',
    'termodin[aâ]mica|calor|entropia|carnot':
        '**1ª Lei:** ΔU = Q − W (energia se conserva). **2ª Lei:** calor flui do quente para o frio; entropia do universo sempre aumenta. Rendimento de Carnot: η = 1 − Tf/Tq (em Kelvin).',
    'ph|[aá]cido|base|neutraliz':
        '**pH:** < 7 = ácido (H⁺ livre); = 7 = neutro; > 7 = básico (OH⁻ livre). Neutralização: ácido + base → sal + água. Indicadores: tornassol fica vermelho em ácidos, azul em bases.',
    'elect|[eé]letricidade|corrente|ohm|tens[aã]o|resist[eê]ncia':
        '**Lei de Ohm:** V = R·I (Tensão = Resistência × Corrente). Potência: P = V·I = V²/R = I²R. Em paralelo: 1/Rt = 1/R₁+1/R₂. Em série: Rt = R₁+R₂. Coulomb: F=kq₁q₂/d².',
    'oxirredu|oxida|reduz|redu[çc][aã]o|agente':
        '**Oxirredução:** quem perde elétrons = **oxidado** (agente redutor); quem ganha elétrons = **reduzido** (agente oxidante). Mnemônico: **OILRIG** — Oxidation Is Loss, Reduction Is Gain.',
    'fotoss[ií]ntese|clorof|glic[oó]se|plant':
        '**Fotossíntese:** 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂. Fase clara (membranas tilacóides): fotólise da água + ATP/NADPH. Fase escura/Ciclo de Calvin (estroma): fixação do CO₂ em glicose.',
    'evolu|darwin|sele[çc][aã]o.*natural|espécie':
        '**Teoria da Evolução (Darwin):** Seleção Natural — organismos com características vantajosas sobrevivem e reproduzem mais. Junto com **mutação** e **deriva genética**, explica a diversidade da vida. Evidências: fósseis, anatomia comparada, biogeografia, genética.',
    'radioat|radioa[çc][aã]o|isótopo|nuclear|meia.*vida':
        '**Radioatividade:** emissão espontânea por núcleos instáveis. Tipos: α (partícula He²⁺, baixa penetração), β⁻ (elétron, média), γ (onda EM, alta penetração). **Meia-vida:** tempo para metade da amostra se desintegrar. Aplicações: datação C-14, medicina nuclear, energia nuclear.',

    // ── Ciências Humanas ─────────────────────────────────────────────────────
    'revolu.*industrial':
        'A **Revolução Industrial** (séc. XVIII, Inglaterra) substituiu o artesanato por fábricas a vapor, gerando urbanização, proletariado e capitalismo industrial. 1ª Revolução: carvão e ferro. 2ª Revolução: petróleo, eletricidade e aço (séc. XIX). 3ª Revolução: digital (séc. XX).',
    'plano marshall|guerra fria|urss|eua.*soci':
        'A **Guerra Fria** (1947-91): EUA (capitalismo) × URSS (socialismo). **Plano Marshall** → reconstruiu a Europa Ocidental contra o comunismo. OTAN × Pacto de Varsóvia. Corrida armamentista, espacial e guerras proxy (Coreia, Vietnã). Fim: queda do Muro de Berlim (1989) e dissolução da URSS (1991).',
    'revolu.*france|iluminismo|rousseau|montesquieu|locke|voltaire':
        'A **Revolução Francesa (1789)**: derrubou o absolutismo de Luís XVI. Ideais: Liberdade, Igualdade, Fraternidade. Fases: Monarquia Constitucional → Terror (Robespierre) → Diretório → Napoleão. **Iluminismo**: Locke (direitos naturais), Montesquieu (tripartição dos poderes), Rousseau (contrato social), Voltaire (tolerância e crítica à Igreja).',
    'fascismo|nazismo|totalitar|hitler|mussolini':
        '**Totalitarismo** (entre-guerras): partido único, culto ao líder, propaganda, repressão. **Fascismo italiano** (Mussolini, 1922): Estado forte, anticomunismo, expansionismo. **Nazismo alemão** (Hitler, 1933): racismo, antissemitismo, Holocausto (6 mi de judeus). Causas: sequelas de Versalhes e Grande Depressão de 1929.',
    'era vargas|estado novo|getúlio|trabalhismo|clt':
        'A **Era Vargas (1930-45)**: Revolução de 1930 → fim da República Velha. Legado trabalhista: **CLT** (1943), salário mínimo, Ministério do Trabalho. Estado Novo (1937-45): ditadura com censura pelo DIP. Industrialização pesada: CSN, Vale do Rio Doce, Petrobras (1953, 2º governo).',
    'globaliz|neoliberal|privatiz|fmi|banco mundial':
        '**Globalização**: integração econômica, cultural e política pós-1980, impulsionada pela tecnologia e queda do comunismo. **Neoliberalismo** (Thatcher/Reagan): livre mercado, Estado mínimo, privatizações, abertura financeira. No Brasil: Collor e FHC (1990s) privatizaram estatais e abriram o mercado.',
    'indigen|povo.*origin|coloniz|ameríndio':
        'Povos indígenas brasileiros: ~1 milhão de pessoas, 305 etnias, 274 línguas. Impacto da colonização: doenças, escravidão, violência, catequização. Demarcação de terras (Constituição 1988, Art. 231). Questão ENEM: direitos territoriais, diversidade cultural, Estatuto do Índio vs. Marco Temporal.',

    // ── Linguagens e Redação ─────────────────────────────────────────────────
    'reda.*|dissertativo|compet[eê]ncia|proposta.*interven':
        'A **Redação ENEM** é dissertativo-argumentativa: Introdução (contextualização + tese) → Desenvolvimento 1 (argumento + exemplo) → Desenvolvimento 2 (argumento + dados) → Conclusão (proposta com **5 elementos**: ação, agente, modo/instrumento, efeito esperado, finalidade). Nota máxima = 1000 pts. Nunca fuja do tema — risco de nota 0!',
    'met[aá]fora|metoním|figura.*ling|hip[eé]rbole|eufemismo|ironia':
        '**Figuras de Linguagem:** Metáfora (comparação implícita: "ele é uma pedra"), Metonímia (substituição por relação: "li Clarice"), Hipérbole (exagero: "chorei um rio"), Eufemismo (suavização: "foi para um lugar melhor"), Ironia (dizer o oposto), Antítese (opostos juntos), Paradoxo (contradição verdadeira), Personificação (humanos ao inanimado).',
    'intertextual|inter.*text|parodia|paráfrase':
        '**Intertextualidade**: quando um texto dialoga com outro por meio de citação, paródia (deforma com humor), paráfrase (reformula mantendo a ideia) ou alusão (referência implícita). No ENEM aparece em charges, tirinhas e publicidade — exige repertório cultural para identificar a referência.',
    'coes[aã]o|coes[aã]o|coer[eê]ncia|conect|articu':
        '**Coesão** (C4 da redação): uso de pronomes, sinônimos, conectivos e elipses para encadear o texto. **Coerência**: consistência lógica das ideias — não pode haver contradição. Conectivos essenciais: portanto/logo/assim (conclusão); porém/entretanto/contudo (oposição); porque/pois/visto que (causa); além disso/também (adição).',
    'g[eê]nero.*text|narrativ|descrit|expositiv|injuntiv':
        '**Tipos textuais**: Narrativo (conta eventos — conto, crônica), Descritivo (apresenta características), Dissertativo-argumentativo (defende tese — redação ENEM), Expositivo (informa sem argumentar), Injuntivo (instrui — manual, receita). **Gêneros discursivos**: como o texto circula na sociedade (artigo, carta, charge, tirinha, reportagem, blog etc.).',
};

function _renderTutorMessages() {
    const el = document.getElementById('tutor-messages');
    if (!el) return;
    el.innerHTML = _tutorMessages.map(m => {
        if (m.role === 'typing') return `<div class="tutor-msg ai"><div class="tutor-avatar">🤖</div><div class="tutor-bubble tutor-typing"><span></span><span></span><span></span></div></div>`;
        const bubble = m.text.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
        return m.role === 'ai'
            ? `<div class="tutor-msg ai"><div class="tutor-avatar">🤖</div><div class="tutor-bubble">${bubble}</div></div>`
            : `<div class="tutor-msg user"><div class="tutor-bubble">${bubble}</div></div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;

    // Oculta grid de sugestões após a primeira mensagem do usuário
    const grid = document.getElementById('tutor-suggestions');
    const hasUserMsg = _tutorMessages.some(m => m.role === 'user');
    if (grid) grid.style.display = hasUserMsg ? 'none' : 'grid';

    // Persiste histórico na sessionStorage
    try { sessionStorage.setItem('tutor_history', JSON.stringify(_tutorMessages.filter(m => m.role !== 'typing'))); } catch {}
}

function tutorNovaConversa() {
    _tutorMessages = [{
        role: 'ai',
        text: 'Olá! Sou o **Tutor IA** do ENEM Master 🎓\n\nPosso te explicar qualquer assunto do ENEM: *Matemática, Física, Química, Biologia, Humanas, Linguagens e Redação*.\n\nUse as sugestões acima ou faça sua pergunta! 👆',
    }];
    try { sessionStorage.removeItem('tutor_history'); } catch {}
    _renderTutorMessages();
    // Reexibe o grid
    const grid = document.getElementById('tutor-suggestions');
    if (grid) grid.style.display = 'grid';
    _showQuickToast('📣 Nova conversa iniciada');
}

async function sendTutorMessage() {
    const input = document.getElementById('tutor-input');
    const text  = (input?.value || '').trim();
    if (!text) return;
    input.value = '';
    await _processTutorText(text);
}

function sendTutorSuggestion(text) {
    const input = document.getElementById('tutor-input');
    if (input) { input.value = text; }
    // Limpa o input após um tick para o usuário ver o que foi enviado
    setTimeout(() => { if (input) input.value = ''; }, 80);
    _processTutorText(text);
}

async function _processTutorText(text) {
    _tutorMessages.push({ role:'user', text });
    _tutorMessages.push({ role:'typing' });
    _renderTutorMessages();

    let response = null;
    for (const [pattern, answer] of Object.entries(_TUTOR_KB)) {
        if (new RegExp(pattern, 'i').test(text)) { response = answer; break; }
    }

    if (!response) {
        const groqKey = localStorage.getItem('groq_key');
        if (groqKey) {
            try {
                const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${groqKey}` },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role:'system', content:'Você é um tutor especialista no ENEM. Responda em português, de forma didática e concisa (máx. 3 parágrafos). Use exemplos práticos das disciplinas: Humanas, Natureza, Linguagens, Matemática.' },
                            ..._tutorMessages.filter(m=>m.role!=='typing').slice(-8).map(m=>({ role: m.role==='ai'?'assistant':'user', content: m.text })),
                        ],
                        temperature: 0.5, max_tokens: 500,
                    }),
                });
                if (res.ok) { const d = await res.json(); response = d.choices?.[0]?.message?.content || null; }
            } catch { /* ignore */ }
        }
    }

    if (!response) response = 'Hmm, não encontrei uma resposta exata para isso! 🤔 Tente perguntar sobre: **genética, revolução industrial, bhaskara, redação ENEM, figuras de linguagem, probabilidade, pH, termodinâmica**, etc.';

    _tutorMessages = _tutorMessages.filter(m => m.role !== 'typing');
    _tutorMessages.push({ role:'ai', text: response });
    _renderTutorMessages();
}

// =====================================================
// COUNTDOWN ENEM 2026 + MOTIVAÇÃO
// =====================================================
let _countdownInterval = null;

// Mensagens motivacionais baseadas nos dias restantes
function _getCountdownMotivation(days) {
    if (days > 300) return { msg: 'Comece agora — cada dia conta! 💪', color: '#00b4a6' };
    if (days > 180) return { msg: 'Ainda há muito tempo — foco na base! 📚', color: '#00b4a6' };
    if (days > 90)  return { msg: 'Reta final chegando — intensifique os estudos! 🔥', color: '#fbbf24' };
    if (days > 30)  return { msg: 'Um mês! Revise os tópicos mais difíceis 📝', color: '#f97316' };
    if (days > 7)   return { msg: 'Na última semana! Priorize revisão e descanso 😴', color: '#f87171' };
    if (days > 0)   return { msg: `Faltam apenas ${days} dias — você chegou até aqui! 🚀`, color: '#f87171' };
    return { msg: 'Boa prova! Você se preparou — confie em você! 🌟', color: '#4ade80' };
}

function renderENEMCountdown() {
    const ENEM_DATE = new Date('2026-11-08T13:00:00'); // 1º dia ENEM 2026
    const widget    = document.getElementById('enem-countdown');
    if (!widget) return;

    function _tick() {
        const now  = new Date();
        const diff = ENEM_DATE - now;
        if (diff <= 0) {
            widget.style.display = 'none';
            if (_countdownInterval) clearInterval(_countdownInterval);
            return;
        }
        const days = Math.floor(diff / (1000*60*60*24));
        const h    = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
        const m    = Math.floor((diff % (1000*60*60)) / (1000*60));
        const s    = Math.floor((diff % (1000*60)) / 1000);

        const dEl = document.getElementById('countdown-days');
        const hEl = document.getElementById('cd-h');
        const mEl = document.getElementById('cd-m');
        const sEl = document.getElementById('cd-s');
        const motEl = document.getElementById('countdown-motivation');

        if (dEl) dEl.textContent = days;
        if (hEl) hEl.textContent = String(h).padStart(2,'0');
        if (mEl) mEl.textContent = String(m).padStart(2,'0');
        if (sEl) sEl.textContent = String(s).padStart(2,'0');

        if (motEl) {
            const { msg, color } = _getCountdownMotivation(days);
            motEl.textContent = msg;
            motEl.style.color = color;
        }
    }

    _tick();
    if (_countdownInterval) clearInterval(_countdownInterval);
    _countdownInterval = setInterval(_tick, 1000);
}

// =====================================================
// PUSH NOTIFICATIONS — lembretes diários de estudo
// =====================================================
async function requestPushPermission() {
    const btn      = document.getElementById('push-notif-btn');
    const statusEl = document.getElementById('push-notif-status');

    if (!('Notification' in window)) {
        if (statusEl) statusEl.textContent = 'Seu navegador não suporta notificações';
        return;
    }
    if (Notification.permission === 'granted') {
        if (statusEl) statusEl.textContent = '✅ Notificações já estão ativadas!';
        if (btn) { btn.textContent = 'Ativado ✓'; btn.disabled = true; }
        _scheduleDailyStudyReminder();
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        if (statusEl) statusEl.textContent = '✅ Lembretes de estudo ativados com sucesso!';
        if (btn) { btn.textContent = 'Ativado ✓'; btn.disabled = true; }
        state.user.pushEnabled = true;
        saveState();
        _showQuickToast('🔔 Notificações push ativadas!');
        _scheduleDailyStudyReminder();
    } else {
        if (statusEl) statusEl.textContent = 'Permissão negada — ative nas configurações do navegador';
    }
}

// Agenda um lembrete diário de estudo para às 20h
function _scheduleDailyStudyReminder() {
    if (Notification.permission !== 'granted') return;

    const todayKey = new Date().toDateString();
    const lastScheduled = localStorage.getItem('enem_push_scheduled');
    if (lastScheduled === todayKey) return; // já agendou hoje

    const now = new Date();
    const target = new Date();
    target.setHours(20, 0, 0, 0); // 20:00 local

    // Se já passou das 20h, agenda para a hora + 1min (lembrete imediato de conquista diária)
    let delay = target - now;
    if (delay < 0) delay = 60 * 1000;

    const msgs = [
        { title:'📚 Hora de estudar!',           body:'Você tem questões te esperando. Bora revisar antes de dormir?' },
        { title:'🔥 Mantenha seu streak!',        body:'Estude pelo menos 10 minutos hoje para não perder sua sequência!' },
        { title:'🎯 ENEM cada vez mais perto!',   body:'Que tal um simulado rápido agora? Cada questão conta!' },
        { title:'⚡ Revise um flashcard hoje!',   body:'5 minutinhos de revisão no ENEM Master — vá lá!' },
        { title:'🏆 Ranking espera por você!',    body:'Outros estudantes estão avançando. Jogue algumas questões!' },
    ];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    setTimeout(() => {
        if (Notification.permission === 'granted') {
            const n = new Notification(msg.title, {
                body: msg.body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'enem-daily-reminder',
            });
            n.onclick = () => { window.focus(); n.close(); };
        }
        localStorage.setItem('enem_push_scheduled', todayKey);
    }, delay);
}

function _renderPushNotifCard() {
    const btn      = document.getElementById('push-notif-btn');
    const statusEl = document.getElementById('push-notif-status');
    if (!btn || !statusEl || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
        statusEl.textContent = '✅ Lembretes de estudo ativados!';
        btn.textContent = 'Ativado ✓';
        btn.disabled = true;
        _scheduleDailyStudyReminder(); // reagenda ao abrir o app
    } else if (Notification.permission === 'denied') {
        statusEl.textContent = 'Bloqueado — ative nas configurações do navegador';
        btn.textContent = 'Bloqueado';
        btn.disabled = true;
        btn.style.background = '#6b7280';
    }
}

// =====================================================
// SOCIAL — CARDS VISUAIS PARA COMPARTILHAR
// =====================================================
let _shareData = {};

function shareResult() {
    const pct     = document.getElementById('result-pct')?.textContent || '—';
    const correct = document.getElementById('res-correct')?.textContent || '—';
    const wrong   = document.getElementById('res-wrong')?.textContent  || '—';
    const xp      = document.getElementById('res-xp')?.textContent     || '—';
    const tri     = document.getElementById('result-tri-score')?.textContent;

    const discLabels = {
        misto:'Todas as Áreas', humanas:'Ciências Humanas', natureza:'Ciências da Natureza',
        linguagens:'Linguagens', matematica:'Matemática', 'enem-dia1':'1º Dia ENEM', 'enem-dia2':'2º Dia ENEM',
    };

    _shareData = {
        pct,
        disc: discLabels[quizState.discipline] || 'Simulado',
        stats: `${correct} acertos · ${wrong} erros`,
        xp,
        tri: tri && tri !== '—' ? `Estimativa ENEM: ${tri}` : '',
        user: state.user.name || 'Estudante',
    };

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('sc-pct',   pct);
    set('sc-disc',  _shareData.disc);
    set('sc-stats', _shareData.stats);
    set('sc-xp',    xp);
    set('sc-tri',   _shareData.tri);
    set('sc-user',  _shareData.user);

    const overlay = document.getElementById('share-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function closeShareModal() {
    const overlay = document.getElementById('share-modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

function shareViaWhatsapp() {
    const d = _shareData;
    const text = `🎓 *ENEM Master* — Resultado do Simulado\n\n` +
        `📊 *${d.pct}* de acerto em ${d.disc}\n` +
        `✅ ${d.stats}\n` +
        `⚡ ${d.xp} XP ganhos\n` +
        (d.tri ? `🎯 ${d.tri}\n` : '') +
        `\nEstudando no ENEM Master 🚀 — enem.app`;

    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
    closeShareModal();
}

function copyShareText() {
    const d = _shareData;
    const text = `🎓 ENEM Master — ${d.disc}\n${d.pct} de acerto · ${d.stats}\n${d.xp} XP` +
        (d.tri ? `\n${d.tri}` : '') + `\nenem.app`;

    navigator.clipboard?.writeText(text).then(() => {
        _showQuickToast('📋 Texto copiado!');
        closeShareModal();
    }).catch(() => _showQuickToast('❌ Não foi possível copiar'));
}

// ── Geração de card visual via Canvas ────────────────────────────────────────
function downloadShareCard() {
    const d = _shareData;
    const canvas = document.createElement('canvas');
    const W = 1080, H = 1080;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Fundo gradiente
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0b0e1a');
    grad.addColorStop(1, '#0d2333');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Grid sutil de pontos
    ctx.fillStyle = 'rgba(0,180,166,0.06)';
    for (let x = 40; x < W; x += 60) {
        for (let y = 40; y < H; y += 60) {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Borda teal arredondada
    const r = 40;
    ctx.strokeStyle = 'rgba(0,180,166,0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(r, 2); ctx.lineTo(W-r, 2);
    ctx.arcTo(W-2, 2, W-2, r, r);
    ctx.lineTo(W-2, H-r);
    ctx.arcTo(W-2, H-2, W-r, H-2, r);
    ctx.lineTo(r, H-2);
    ctx.arcTo(2, H-2, 2, H-r, r);
    ctx.lineTo(2, r);
    ctx.arcTo(2, 2, r, 2, r);
    ctx.stroke();

    // Logo
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.fillStyle = '#00b4a6';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 ENEM MASTER', W/2, 100);

    // Linha separadora
    ctx.strokeStyle = 'rgba(0,180,166,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(120, 125); ctx.lineTo(W-120, 125); ctx.stroke();

    // Percentual de acerto
    ctx.font = 'bold 200px Inter, Arial, sans-serif';
    ctx.fillStyle = '#00e5d4';
    ctx.textAlign = 'center';
    ctx.fillText(d.pct || '—', W/2, 380);

    // DE ACERTO
    ctx.font = 'bold 32px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('DE ACERTO', W/2, 430);

    // Disciplina
    ctx.font = 'bold 48px Inter, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(d.disc || 'Simulado', W/2, 510);

    // Stats
    ctx.font = '34px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(d.stats || '', W/2, 570);

    // TRI se existir
    if (d.tri) {
        ctx.font = 'bold 34px Inter, Arial, sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(d.tri, W/2, 626);
    }

    // XP Badge
    const xpY = d.tri ? 700 : 660;
    ctx.fillStyle = 'rgba(0,180,166,0.2)';
    _roundRect(ctx, W/2 - 130, xpY - 44, 260, 58, 30);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,180,166,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = 'bold 32px Inter, Arial, sans-serif';
    ctx.fillStyle = '#00b4a6';
    ctx.fillText(`⚡ +${d.xp} XP`, W/2, xpY);

    // Linha separadora inferior
    const lineY = xpY + 80;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(120, lineY); ctx.lineTo(W-120, lineY); ctx.stroke();

    // Nome do usuário
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textAlign = 'left';
    ctx.fillText(d.user || 'Estudante', 120, lineY + 60);

    // URL
    ctx.font = '28px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(0,180,166,0.8)';
    ctx.textAlign = 'right';
    ctx.fillText('enem.app', W - 120, lineY + 60);

    // Data
    ctx.font = '24px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText(new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }), W/2, lineY + 115);

    // Download
    try {
        const link = document.createElement('a');
        link.download = 'enem-master-resultado.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        _showQuickToast('🖼️ Card salvo como imagem!');
        closeShareModal();
    } catch {
        _showQuickToast('❌ Não foi possível salvar a imagem');
    }
}

// Compartilhar card via Web Share API (mobile)
async function shareCardNative() {
    if (!navigator.share) {
        downloadShareCard();
        return;
    }
    const d = _shareData;
    try {
        await navigator.share({
            title: 'ENEM Master — Resultado',
            text:  `🎓 ${d.pct} de acerto em ${d.disc}! ${d.stats} · +${d.xp} XP\nenem.app`,
            url:   'https://enem.app',
        });
        closeShareModal();
    } catch {
        // usuário cancelou — sem toast
    }
}

// Compartilhar para o Instagram (stories): salva como imagem
function shareToInstagram() {
    downloadShareCard();
    _showQuickToast('📸 Salve a imagem e abra o Instagram para postar nos Stories!');
}

// Compartilha stats do perfil (streak, XP, nível)
function shareProfile() {
    const { name, xp, level, streak } = state.user;
    _shareData = {
        pct:    `Nível ${level || 1}`,
        disc:   'Perfil de Estudante',
        stats:  `${xp || 0} XP · 🔥 ${streak || 0} dias seguidos`,
        xp:     xp || 0,
        tri:    '',
        user:   name || 'Estudante',
    };

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('sc-pct',   `LVL ${level || 1}`);
    set('sc-disc',  'Perfil de Estudante');
    set('sc-stats', `${xp || 0} XP · 🔥 ${streak || 0} dias`);
    set('sc-xp',    `+${xp || 0} XP acumulados`);
    set('sc-tri',   '');
    set('sc-user',  name || 'Estudante');

    const overlay = document.getElementById('share-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
}

// Helper: retângulo arredondado no canvas
function _roundRect(ctx, x, y, w, h, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y, x + w, y + radius, radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x, y + h, x, y + h - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}