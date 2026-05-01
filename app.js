/* =====================================================
   ENEM MASTER — App Logic (app.js)
   SPA Router • Quiz Engine • Gamification • Data
   ===================================================== */

'use strict';

const _DEV = typeof location !== 'undefined' && location.hostname === 'localhost';

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
        title: 'Nota 1000 na redação é exclusivo Premium 👑',
        body:  'Veja sua nota nas 5 competências do ENEM e descubra exatamente o que corrigir para chegar mais perto de 1000.',
    },
    tutor: {
        title: 'Professor 24h é exclusivo Premium 👑',
        body:  'Tire dúvidas sobre qualquer assunto do ENEM a qualquer hora. Sem julgamentos, direto ao ponto.',
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

// =====================================================
// NOTIFICAÇÕES DE METAS PESSOAIS
// =====================================================
function checkGoalNotifications() {
    const today = new Date();
    const todayStr = today.toDateString();

    // --- Meta: Questões de Hoje ---
    const dailyGoal = state.user.dailyGoal || 10;
    const doneDiario = state.user.questoesHojeData === todayStr ? (state.user.questoesHoje || 0) : 0;
    if (doneDiario >= dailyGoal && state.user.goalNotifDateDaily !== todayStr) {
        state.user.goalNotifDateDaily = todayStr;
        _pushNotification({
            type: 'green',
            icon: '✅',
            title: 'Meta diária concluída! 🎯',
            body: `Você respondeu ${doneDiario} questões hoje. Parabéns, meta batida!`,
            ctaScreen: 'quiz',
            cta: 'Continuar praticando',
        });
    }

    // --- Meta: Simulados Semanais ---
    const weeklyGoal = state.user.weeklyGoal || 3;
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toDateString();
    const weeklyDone = (state.quizHistory || []).filter(h => h.date && new Date(h.date) >= weekStart).length;
    if (weeklyDone >= weeklyGoal && state.user.goalNotifWeekStart !== weekStartStr) {
        state.user.goalNotifWeekStart = weekStartStr;
        _pushNotification({
            type: 'blue',
            icon: '📋',
            title: 'Meta semanal de simulados! 🏆',
            body: `Você completou ${weeklyDone} simulados esta semana. Meta da semana atingida!`,
            ctaScreen: 'quiz',
            cta: 'Fazer mais simulados',
        });
    }

    // --- Alerta de Domingo: meta semanal não concluída ---
    if (today.getDay() === 0 && weeklyDone < weeklyGoal && state.user.goalNotifSundayDate !== todayStr) {
        state.user.goalNotifSundayDate = todayStr;
        const faltam = weeklyGoal - weeklyDone;
        _pushNotification({
            type: 'orange',
            icon: '⏰',
            title: 'Último dia para bater a meta! ⚠️',
            body: `Hoje é domingo! Falt${faltam === 1 ? 'a' : 'am'} ${faltam} simulado${faltam === 1 ? '' : 's'} para atingir sua meta semanal.`,
            ctaScreen: 'quiz',
            cta: 'Fazer simulado',
        });
    }
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
    _trackEvent('paywall_shown', { feature });
}

/** Retorna o número de dias até o ENEM 2026 (2ª semana de novembro) */
function _daysToENEM() {
    const enem = new Date('2026-11-03T08:00:00-03:00');
    const now  = new Date();
    const diff = Math.ceil((enem - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

/** Mostra o modal de oferta pós-onboarding (somente para não-premium) */
function showWelcomeOffer() {
    if (isPremium()) return;
    const modal = document.getElementById('welcome-offer-modal');
    if (modal) modal.classList.add('active');
    _trackEvent('welcome_offer_shown', {});
}

/** Fecha o modal de oferta pós-onboarding */
function closeWelcomeOffer() {
    const modal = document.getElementById('welcome-offer-modal');
    if (modal) modal.classList.remove('active');
}

/** Atualiza urgência do paywall com contagem regressiva do ENEM */
function _updatePaywallUrgency() {
    const el = document.getElementById('paywall-urgency');
    if (!el) return;
    const days = _daysToENEM();
    el.textContent = days > 0 ? `⏰ ENEM 2026 em ${days} dias — cada dia conta!` : '';
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
        goal: 'Rumo à Federal',
        plan: 'free',           // 'free' | 'premium'
        questoesHoje: 0,        // questões respondidas hoje (controle de limite)
        questoesHojeData: '',   // data do contador (ex: "Mon Mar 23 2026")
        lastStudyDate: '',      // data do último estudo, para cálculo de streak
        avatarColor: '',        // gradiente CSS escolhido pelo usuário
        goalNotifDateDaily: '', // última data em que notificou meta diária concluída
        goalNotifWeekStart: '', // segunda-feira da semana em que notificou meta semanal
        goalNotifSundayDate: '', // data do domingo em que enviou alerta de meta não concluída
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
    dailyChallenge:  null, // legado — substituído por dailyChallenges
    dailyChallenges: null, // [{ date, discipline, count, xp, done }] — 3 desafios
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
    if (saved.dailyChallenge  === undefined) saved.dailyChallenge  = null;
    if (saved.dailyChallenges === undefined) saved.dailyChallenges = null;

    saved._version = STATE_VERSION;
    return saved;
}

let state;
try {
    const _saved = localStorage.getItem('enem_state');
    state = _saved ? _migrateState(JSON.parse(_saved)) : null;
} catch (e) {
    _DEV && console.warn('⚠️ Estado corrompido, resetando:', e);
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
        _DEV && console.warn('⚠️ localStorage cheio, limpando cache da API...', e);
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
    isFinished: false, // true após showResult() — evita re-salvar como pausado
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
    if (!quizState.questions.length || quizState.timeLeft <= 0 || quizState.isFinished) return;
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
    quizState.isFinished    = false;

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
    'study-plan': 'screen-study-plan',
    teacher: 'screen-teacher',
};

const screensWithNav = ['home', 'ranking', 'achievements', 'profile', 'conteudo'];
const screensWithoutNav = ['quiz', 'quiz-setup', 'result', 'settings', 'support', 'notifications', 'review', 'onboarding', 'login', 'plans', 'checkout', 'privacy', 'terms', 'redacao', 'analise', 'study-plan', 'teacher'];

function navigate(screenName) {
    // Conteúdo é exclusivo para usuários Premium
    if (screenName === 'conteudo' && !isPremium()) {
        showPaywall('Conteúdo Premium 🔒', 'Flashcards, Resumos, Professor 24h e Progresso são exclusivos do plano Premium. Assine e domine o ENEM!');
        return;
    }

    const currentId = screenMap[state.currentScreen];
    const nextId = screenMap[screenName];
    if (!nextId) return;

    const currentEl = currentId ? document.getElementById(currentId) : null;
    const nextEl = document.getElementById(nextId);
    if (!nextEl) { _DEV && console.error('Screen element not found:', nextId); return; }

    // Skip only when state AND DOM both confirm we're already on this screen
    if (currentId === nextId && nextEl.classList.contains('active')) return;

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

    // Mostra badge 👑 no botão Conteúdo para usuários free
    const conteudoBadge = document.getElementById('nav-conteudo-badge');
    if (conteudoBadge) conteudoBadge.style.display = isPremium() ? 'none' : 'flex';
}

function renderScreen(screenName) {
    try {
        switch (screenName) {
            case 'home':
                renderDashboard();
                // Sync de plano em background (não sobrescreve XP/level/streak — loadUserData usa Math.max)
                if (typeof saveUserData !== 'undefined' && state.user && state.user.id && navigator.onLine) {
                    saveUserData(state.user.id).catch(() => {});
                }
                break;
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
            case 'study-plan': if (typeof renderStudyPlan !== 'undefined') renderStudyPlan(); break;
            case 'teacher': if (typeof renderTeacherDashboard !== 'undefined') renderTeacherDashboard(); break;
            default: break;
        }
    } catch (e) {
        _DEV && console.error('❌ renderScreen [' + screenName + ']:', e);
        _showQuickToast('Algo deu errado. Tente novamente.');
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
    if (goalEl) {
        // Normalizar texto da meta — remove emojis antigos e renderiza com ícone SVG
        const rawGoal = (s.goal || 'Rumo à Federal 🎯')
            .replace(/🚀/g, '').replace(/🎯/g, '').replace(/🌐/g, '').trim();
        goalEl.innerHTML = `${rawGoal} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00b4a6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="vertical-align:-3px;flex-shrink:0"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;
    }

    document.getElementById('dash-level').textContent = s.level;
    document.getElementById('dash-xp').textContent = s.xp.toLocaleString('pt-BR');
    document.getElementById('dash-streak').textContent = s.streak + ' Dias';

    // XP card — badge de nível + barra de progresso
    const lvlBadgeEl = document.getElementById('dash-lvl-badge');
    const xpBarEl    = document.getElementById('dash-xp-bar');
    const xpNextEl   = document.getElementById('dash-xp-next');
    if (lvlBadgeEl) lvlBadgeEl.textContent = `NV ${s.level}`;
    if (xpBarEl || xpNextEl) {
        const xpInLevel  = s.xp % 500;
        const pct        = Math.round((xpInLevel / 500) * 100);
        const nextLvl    = s.level + 1;
        if (xpBarEl) setTimeout(() => { xpBarEl.style.width = pct + '%'; }, 300);
        if (xpNextEl) xpNextEl.textContent = `${xpInLevel.toLocaleString('pt-BR')} / 500 p/ nível ${nextLvl}`;
    }
    document.getElementById('dash-avatar').textContent = safeName[0].toUpperCase();
    if (s.avatarColor) {
        document.querySelectorAll('.avatar, .podium-avatar').forEach(el => {
            el.style.background = s.avatarColor;
            el.style.borderColor = 'transparent';
        });
    }

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
    _renderScorePrediction();
    _renderWeakSpotAlert();
    _renderWrappedBanner();

    // Posição no ranking global (assíncrono, não bloqueia a UI)
    const rankEl  = document.getElementById('dash-ranking');
    const tierEl  = document.getElementById('dash-rank-tier');
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
                if (tierEl) tierEl.textContent = pct >= 90 ? '🥇 Pódio' : pct >= 75 ? 'Top 25%' : pct >= 50 ? 'Top 50%' : '—';
            } else {
                const pos   = myIdx + 1;
                const total = res.data.length;
                rankEl.textContent = pos <= 3 ? `${pos}º 🏆` : `${pos}º de ${total.toLocaleString('pt-BR')}`;
                if (tierEl) tierEl.textContent = pos === 1 ? '🥇 1º' : pos <= 3 ? '🥈 Pódio' : pos <= 10 ? 'Top 10' : pos <= 50 ? 'Top 50' : pos <= 100 ? 'Top 100' : '—';
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
            const pct = h.pct || Math.round(((h.correct || 0) / Math.max(h.total || 1, 1)) * 100);
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
                <span class="ws-sub">${subj.sub}</span>
            </div>
            <div class="ws-right">
                ${statusBadge}
                <button class="ws-start-btn" onclick="closeWeekSchedule();startQuiz('${subj.disc}',10)" title="Praticar este tópico">→</button>
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
    // ── Banco completo de tópicos mais cobrados no ENEM ────────────────────────
    const TOPIC_BANK = {
        humanas: [
            { title: 'Era Vargas e Estado Novo',           sub: 'Getúlio Vargas, trabalhismo e industrialização' },
            { title: 'Ditadura Militar (1964–1985)',        sub: 'Atos Institucionais, censura e abertura política' },
            { title: 'Proclamação e República Velha',      sub: 'Coronelismo, política café-com-leite e oligarquias' },
            { title: 'Segunda Guerra Mundial',             sub: 'Hitler, Holocausto, frentes de batalha e pós-guerra' },
            { title: 'Guerra Fria',                        sub: 'URSS × EUA, corrida armamentista e Cortina de Ferro' },
            { title: 'Sociologia: Marx e Capitalismo',     sub: 'Classes sociais, mais-valia e modo de produção' },
            { title: 'Sociologia: Durkheim e Weber',       sub: 'Fato social, anomia, ação social e burocracia' },
            { title: 'Filosofia: Iluminismo e Contrato',   sub: 'Locke, Rousseau, Montesquieu e direitos naturais' },
            { title: 'Filosofia: Ética e Cidadania',       sub: 'Kant, utilitarismo e direitos humanos no ENEM' },
            { title: 'Geopolítica e Blocos Econômicos',    sub: 'UE, MERCOSUL, BRICS e globalização' },
            { title: 'Biomas e Questão Ambiental',         sub: 'Amazônia, Cerrado, desmatamento e sustentabilidade' },
            { title: 'Urbanização e Questão Agrária',      sub: 'Êxodo rural, reforma agrária e MST' },
            { title: 'Colonização e Brasil Colônia',       sub: 'Capitanias hereditárias, escravidão e ciclos econômicos' },
            { title: 'Revolução Francesa e Liberalismo',   sub: 'Três estados, Declaração dos Direitos e burguesia' },
            { title: 'Racismo, Gênero e Direitos Humanos', sub: 'Temas transversais mais cobrados no ENEM recente' },
        ],
        natureza: [
            { title: 'Genética Mendeliana',                sub: 'Leis de Mendel, heredogramas e probabilidade' },
            { title: 'Ecologia e Relações Ecológicas',     sub: 'Cadeias alimentares, ciclos biogeoquímicos e biomas' },
            { title: 'Fisiologia Humana',                  sub: 'Digestão, circulação, respiração e excreção' },
            { title: 'Evolução e Origem da Vida',          sub: 'Darwin, seleção natural, lamarckismo e especiação' },
            { title: 'Biologia Celular e Molecular',       sub: 'DNA, RNA, proteínas, mitose e meiose' },
            { title: 'Leis de Newton e Cinemática',        sub: 'Movimento, força, aceleração e gráficos' },
            { title: 'Energia: Trabalho e Potência',       sub: 'Conservação de energia e máquinas simples' },
            { title: 'Termodinâmica e Calor',              sub: 'Temperatura, calor específico e leis da termodinâmica' },
            { title: 'Eletricidade e Circuitos',           sub: 'Resistência, corrente, tensão e lei de Ohm' },
            { title: 'Ondas, Som e Óptica',                sub: 'Reflexão, refração, espelhos e lentes' },
            { title: 'Química Orgânica: Funções e Reações',sub: 'Hidrocarbonetos, álcool, ácidos e ésteres' },
            { title: 'Estequiometria e Reações Químicas',  sub: 'Mol, balanceamento e cálculo estequiométrico' },
            { title: 'Ácidos, Bases e pH',                 sub: 'Teoria de Arrhenius, neutralização e indicadores' },
            { title: 'Tabela Periódica e Ligações',        sub: 'Propriedades, eletronegatividade e ligações iônicas/covalentes' },
            { title: 'Biotecnologia e Microbiologia',      sub: 'Vírus, bactérias, vacinas, DNA recombinante' },
        ],
        linguagens: [
            { title: 'Redação ENEM: Proposta de Intervenção', sub: 'Os 5 agentes e o respeito aos direitos humanos' },
            { title: 'Redação ENEM: Argumentação',         sub: 'Tese, argumentos e coesão textual' },
            { title: 'Interpretação de Texto',             sub: 'Inferência, intertextualidade e gêneros textuais' },
            { title: 'Modernismo Brasileiro',              sub: 'Semana de Arte Moderna, Oswald e Mário de Andrade' },
            { title: 'Realismo e Naturalismo',             sub: 'Machado de Assis, Eça de Queirós e o cientificismo' },
            { title: 'Literatura: Romantismo Brasileiro',  sub: 'Indianismo, ultrarromantismo e condoreirismo' },
            { title: 'Figuras de Linguagem',               sub: 'Metáfora, ironia, hipérbole, eufemismo e antítese' },
            { title: 'Variação Linguística e Norma Culta', sub: 'Preconceito linguístico, dialetos e registros' },
            { title: 'Gramática: Concordância e Regência', sub: 'Concordância verbal, nominal e regência verbal' },
            { title: 'Publicidade, Charges e Multimodal',  sub: 'Leitura de imagem, humor e argumentação visual' },
            { title: 'Inglês: Interpretação de Texto',     sub: 'Vocabulário em contexto e compreensão global' },
            { title: 'Semiótica e Linguagens não-verbais', sub: 'Música, cinema, fotografia e HQs como linguagem' },
        ],
        matematica: [
            { title: 'Funções do 1º e 2º Grau',           sub: 'Raízes, Bhaskara, vértice e gráfico da parábola' },
            { title: 'Porcentagem e Juros Compostos',      sub: 'Aumentos, descontos e fórmula do montante' },
            { title: 'Geometria Plana: Áreas e Perímetros',sub: 'Triângulo, quadriláteros, círculo e semelhança' },
            { title: 'Probabilidade e Estatística',        sub: 'Eventos, frequência, média, mediana e moda' },
            { title: 'Progressões Aritmética e Geométrica',sub: 'Termo geral, soma e aplicações no ENEM' },
            { title: 'Trigonometria',                      sub: 'Seno, cosseno, tangente e Lei dos Senos e Cossenos' },
            { title: 'Geometria Espacial',                 sub: 'Volume de prismas, pirâmides, cilindros e esferas' },
            { title: 'Equações e Sistemas Lineares',       sub: 'Sistemas 2×2, determinante e interpretação gráfica' },
            { title: 'Análise Combinatória',               sub: 'Permutação, combinação, arranjo e princípio fundamental' },
            { title: 'Razão, Proporção e Regra de Três',   sub: 'Grandezas proporcionais, mistura e escala' },
            { title: 'Matrizes e Determinantes',           sub: 'Operações, determinante e regra de Cramer' },
            { title: 'Logaritmo e Exponencial',            sub: 'Propriedades, equações logarítmicas e crescimento' },
        ],
    };

    const AREA_LABELS = {
        humanas:    'CIÊNCIAS HUMANAS',
        natureza:   'CIÊNCIAS DA NATUREZA',
        linguagens: 'LINGUAGENS',
        matematica: 'MATEMÁTICA',
    };
    const AREA_ICONS = {
        humanas: '🌍', natureza: '🧬', linguagens: '✍️', matematica: '➗',
    };

    // ── Calcular força de cada área (menor % = mais fraca = mais slots) ──────
    const stats = state.progress.stats;
    const weak  = state.weakSubjects || [];
    const discs = ['humanas', 'natureza', 'linguagens', 'matematica'];

    const strength = {};
    discs.forEach(d => {
        const st = stats[d];
        let pct = st && st.total >= 5 ? st.correct / st.total : 0.50;
        if (weak.includes(d)) pct -= 0.15; // penalidade se declarou fraqueza no onboarding
        strength[d] = pct;
    });

    // ── Montar distribuição dos 6 dias da semana ──────────────────────────────
    // Ordenar da mais fraca para mais forte
    const sorted = [...discs].sort((a, b) => strength[a] - strength[b]);
    // A mais fraca ganha 2 slots, a segunda mais fraca 2 slots, as outras 1 slot cada = 6 total
    const dayDiscs = [sorted[0], sorted[1], sorted[2], sorted[3], sorted[0], sorted[1]];

    // Embaralhar mantendo seed semanal (muda a cada segunda-feira)
    const today   = new Date();
    const mon     = new Date(today);
    const dow     = today.getDay();
    mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    const weekSeed = parseInt(mon.toISOString().slice(0, 10).replace(/-/g, ''), 10);
    const rand     = _seededRandom(weekSeed);

    // Para cada dia, escolher tópico diferente dentro da disciplina
    // Usar índice determinístico baseado no dia da semana para evitar repetição
    const usedPerDisc = {};
    return dayDiscs.map((disc, slotIdx) => {
        const bank    = TOPIC_BANK[disc];
        const used    = usedPerDisc[disc] || [];
        const available = bank.filter((_, i) => !used.includes(i));
        // Escolher índice via rand seeded + slot
        const pickArr = available.length > 0 ? available : bank;
        const idx     = Math.floor((rand() + slotIdx * 0.1371) % 1 * pickArr.length);
        const topic   = pickArr[Math.max(0, Math.min(idx, pickArr.length - 1))];
        const bankIdx = bank.indexOf(topic);
        if (!usedPerDisc[disc]) usedPerDisc[disc] = [];
        usedPerDisc[disc].push(bankIdx);

        return {
            disc,
            area:  AREA_LABELS[disc],
            icon:  AREA_ICONS[disc],
            title: topic.title,
            sub:   topic.sub,
        };
    });
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
const _CHALLENGE_DISCS  = ['humanas', 'natureza', 'linguagens', 'matematica', 'misto'];
const _CHALLENGE_COUNTS = [5, 5, 10, 10];          // quantidade de questões possíveis
const _CHALLENGE_XP     = { 5: 50, 10: 100, 15: 150 };

const _DISC_ICONS = { humanas:'🌍', natureza:'🔬', linguagens:'📝', matematica:'➗', misto:'🎯' };
const _DISC_COLORS = {
    humanas:    'rgba(139,92,246,0.18)',
    natureza:   'rgba(0,201,184,0.18)',
    linguagens: 'rgba(245,197,24,0.18)',
    matematica: 'rgba(249,115,22,0.18)',
    misto:      'rgba(96,165,250,0.18)',
};
const _CHALLENGE_TYPES = { 5: 'Relâmpago ⚡', 10: 'Treino 🎯', 15: 'Maratona 🏃' };
const _CHALLENGE_CONTEXT = {
    humanas:    '~22% da prova · História, Geo, Filosofia e Sociologia',
    natureza:   '45 questões no ENEM · Biologia, Física e Química',
    linguagens: 'Interpretação de texto + inglês ou espanhol',
    matematica: 'Álgebra, Funções, Geometria e Estatística',
    misto:      'Simula a prova real com questões das 4 grandes áreas',
};
const _CHALLENGE_NAMES = {
    humanas:    'Ciências Humanas',
    natureza:   'Ciências da Natureza',
    linguagens: 'Linguagens',
    matematica: 'Matemática',
    misto:      'Desafio Misto',
};

// ── Daily Challenge Carousel ──────────────────────────────────────────────────
let _dcCurrentIdx = 0;
let _dcAbortCtrl  = null;

function _generateDailyChallenges() {
    const today = new Date().toISOString().slice(0, 10);
    const seed  = parseInt(today.replace(/-/g, ''), 10);
    const rand  = _seededRandom(seed);

    // Embaralha disciplinas de forma determinística (Fisher-Yates seeded)
    const discs = [..._CHALLENGE_DISCS];
    for (let i = discs.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [discs[i], discs[j]] = [discs[j], discs[i]];
    }
    // 3 desafios fixos: Relâmpago (5q), Treino (10q), Maratona (15q)
    return [5, 10, 15].map((count, i) => ({
        date:       today,
        discipline: discs[i],
        count,
        xp:         _CHALLENGE_XP[count] || 50,
        done:       false,
    }));
}

function _ensureDailyChallenges() {
    const today = new Date().toISOString().slice(0, 10);
    if (!Array.isArray(state.dailyChallenges) || state.dailyChallenges[0]?.date !== today) {
        state.dailyChallenges = _generateDailyChallenges();
        saveState();
    }
    return state.dailyChallenges;
}

function _buildDcSlide(ch, idx) {
    const discName  = _CHALLENGE_NAMES[ch.discipline]  || ch.discipline;
    const diffClass = ch.count <= 5 ? 'easy' : ch.count <= 10 ? 'medium' : 'hard';
    const diffText  = ch.count <= 5 ? 'Fácil' : ch.count <= 10 ? 'Médio' : 'Difícil';
    const icon  = _DISC_ICONS[ch.discipline]  || '🎯';
    const color = _DISC_COLORS[ch.discipline] || 'rgba(0,201,184,0.18)';
    const type  = _CHALLENGE_TYPES[ch.count]  || 'Treino 🎯';
    const ctx   = _CHALLENGE_CONTEXT[ch.discipline] || '';
    const mins  = Math.round(ch.count * 1.3);

    const s = document.createElement('div');
    s.className   = 'dc-slide';
    s.dataset.idx = idx;
    s.innerHTML = `
        <div class="dc-header">
            <span class="dc-title">${ch.done ? '✅ Concluído!' : '🎯 Desafio do Dia'}</span>
            <span class="dc-xp">+${ch.xp} XP</span>
        </div>
        <div class="dc-disc-row">
            <span class="dc-disc-chip" style="background:${color}">${icon}</span>
            <div class="dc-disc-info">
                <span class="dc-disc-name">${discName}</span>
                <span class="dc-type">${type}</span>
            </div>
            <div class="dc-diff ${diffClass}"><span></span><span></span><span></span></div>
        </div>
        <div class="dc-meta-row">
            <span>📋 ${ch.count} questões</span>
            <span class="dc-meta-sep">·</span>
            <span>⏱ ~${mins} min</span>
            <span class="dc-meta-sep">·</span>
            <span>${diffText}</span>
        </div>
        <p class="dc-context">${ctx}</p>
        ${ch.done
            ? '<div class="dc-check">✅ Desafio concluído! Bom trabalho hoje.</div>'
            : `<button class="cta-btn dc-btn" onclick="startDailyChallenge(${idx})">⚔️ Aceitar Desafio · Ganhar +${ch.xp} XP</button>`
        }
    `;
    return s;
}

function _applyDcSlide() {
    const track = document.getElementById('dc-carousel-track');
    if (!track) return;
    track.style.transform = `translateX(-${_dcCurrentIdx * 100}%)`;
    const challenges = state.dailyChallenges || [];
    document.querySelectorAll('#dc-nav-dots .dc-nav-dot').forEach((d, i) => {
        d.className = 'dc-nav-dot' +
            (i === _dcCurrentIdx ? ' active' : '') +
            ((challenges[i] && challenges[i].done) ? ' done' : '');
    });
}

function goToDcSlide(idx) {
    const challenges = state.dailyChallenges || [];
    _dcCurrentIdx = Math.max(0, Math.min(idx, challenges.length - 1));
    _applyDcSlide();
}

function renderDailyChallenge() {
    const card   = document.getElementById('daily-challenge-card');
    const track  = document.getElementById('dc-carousel-track');
    const dotsEl = document.getElementById('dc-nav-dots');
    const weekEl = document.getElementById('dc-week');
    if (!card || !track || !dotsEl) return;

    const challenges = _ensureDailyChallenges();

    // Garante que o índice ativo é válido
    _dcCurrentIdx = Math.max(0, Math.min(_dcCurrentIdx, challenges.length - 1));

    // Render slides
    track.innerHTML = '';
    challenges.forEach((ch, i) => track.appendChild(_buildDcSlide(ch, i)));

    // Render dots de navegação
    dotsEl.innerHTML = '';
    challenges.forEach((ch, i) => {
        const dot = document.createElement('button');
        dot.className = 'dc-nav-dot' +
            (i === _dcCurrentIdx ? ' active' : '') +
            (ch.done ? ' done' : '');
        dot.setAttribute('aria-label', `Desafio ${i + 1}`);
        dot.onclick = () => goToDcSlide(i);
        dotsEl.appendChild(dot);
    });

    // Posiciona no slide atual
    _applyDcSlide();

    // Touch swipe (recria os listeners a cada render, cancela os anteriores)
    if (_dcAbortCtrl) _dcAbortCtrl.abort();
    _dcAbortCtrl = new AbortController();
    const sig = _dcAbortCtrl.signal;
    let _txStart = 0;
    track.addEventListener('touchstart', e => { _txStart = e.touches[0].clientX; }, { passive: true, signal: sig });
    track.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - _txStart;
        if (Math.abs(dx) > 40) goToDcSlide(_dcCurrentIdx + (dx < 0 ? 1 : -1));
    }, { passive: true, signal: sig });

    // Tracker semanal (abaixo do carousel, acima dos dots)
    if (weekEl) {
        const dayLabels = ['D','S','T','Q','Q','S','S'];
        const streak  = Math.max(0, state.user?.streak || 0);
        const anyDone = challenges.some(c => c.done);
        weekEl.innerHTML = '';
        for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
            const d = new Date(); d.setDate(d.getDate() - daysAgo);
            const isToday = daysAgo === 0;
            const done = isToday ? anyDone : daysAgo < streak;
            const dot = document.createElement('div');
            dot.className = 'dc-week-dot' + (done ? ' done' : '') + (isToday ? ' today' : '');
            dot.textContent = dayLabels[d.getDay()];
            weekEl.appendChild(dot);
        }
    }

    // Marca card como completado se todos os desafios foram feitos
    card.classList.toggle('completed', challenges.every(c => c.done));
}

function startDailyChallenge(idx) {
    const challenges = _ensureDailyChallenges();
    const slideIdx = (typeof idx === 'number') ? idx : _dcCurrentIdx;
    const ch = challenges[slideIdx];
    if (!ch || ch.done) return;
    quizState._isDailyChallenge      = true;
    quizState._dailyChallengeIdx     = slideIdx;
    quizState._dailyChallengeTarget  = ch.count;
    quizState._dailyChallengeDisc    = ch.discipline;
    navigate('quiz-setup');
    quizSetup.discipline = ch.discipline;
    quizSetup.count      = ch.count;
    renderQuizSetup();
}

/** Verifica e completa o desafio diário se o quiz atual bater as condições */
function _checkDailyChallengeCompletion() {
    if (!quizState._isDailyChallenge) return;
    const challenges = _ensureDailyChallenges();
    const idx = quizState._dailyChallengeIdx ?? 0;
    const ch  = challenges[idx];
    if (!ch || ch.done) return;

    const sameDisc  = quizState._dailyChallengeDisc === 'misto'
        || quizState.discipline === quizState._dailyChallengeDisc;
    const metTarget = quizState.questions.length >= quizState._dailyChallengeTarget;
    if (!sameDisc || !metTarget) return;

    state.dailyChallenges[idx].done = true;
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
        const isVirgin = filter === 'all' && (state.quizHistory || []).length === 0;
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-emoji">${isVirgin ? '📝' : filter === 'all' ? '🎉' : '✨'}</div>
                <div class="empty-state-title">${isVirgin ? 'Comece a praticar!' : 'Nenhum erro aqui!'}</div>
                <div class="empty-state-sub">${
                    isVirgin
                        ? 'Seus erros aparecerão aqui após seus primeiros simulados.<br>É a melhor forma de revisar e melhorar.'
                        : filter === 'all'
                            ? 'Incrível — nenhum erro registrado! Ou talvez você ainda não tenha praticado muito.<br>Continue respondendo questões para ver seu histórico aqui.'
                            : 'Sem erros nessa matéria — ótimo trabalho! ✨<br>Escolha outra disciplina para revisar.'
                }</div>
                ${isVirgin ? `<button class="empty-state-cta" onclick="navigate('quiz-setup')">Fazer primeiro simulado →</button>` : ''}
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
        _DEV && console.log('\u2705 Push permission granted. Configure VAPID key para ativar notifica\u00e7\u00f5es.');
    } catch (e) {
        _DEV && console.warn('\u26a0\ufe0f Push Notifications n\u00e3o dispon\u00edveis:', e.message);
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
                _DEV && console.warn('⚠️ Erro ao registrar:', result.error);
            }
        } catch (e) {
            _DEV && console.warn('⚠️ Registro Supabase não disponível:', e);
        } finally {
            _pendingPassword = ''; // limpar senha da memória imediatamente
        }
    }

    if (obBtn) { obBtn.disabled = false; obBtn.textContent = 'Começar a Estudar 🚀'; }
    saveState();
    _trackEvent('onboarding_completed', { goal: state.user.goal || '' });
    navigate('home');
    // Oferta de boas-vindas após 1.5s (quando o home já carregou)
    setTimeout(showWelcomeOffer, 1500);
}

// =====================================================
// INIT
// =====================================================

// Capturar erros globais para diagnóstico
window.onerror = (msg, src, line, col, err) => {
    _DEV && console.error('🔴 Erro global:', msg, 'em', src, 'linha', line);
    const appEl = document.getElementById('app');
    if (appEl && !document.querySelector('.screen.active')) {
        appEl.insertAdjacentHTML('afterbegin',
            `<div style="position:fixed;inset:0;background:#0a1929;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;z-index:9999;text-align:center">
            <p style="font-size:40px;margin-bottom:16px">😔</p>
            <b style="font-size:18px;color:#eaf4f9">Ops! Algo deu errado.</b>
            <p style="margin:12px 0 24px;color:#7a9ab5;font-size:14px;max-width:280px;line-height:1.6">Não foi possível carregar o app. Tente recarregar a página.</p>
            <button onclick="localStorage.clear();location.reload()" style="padding:12px 28px;background:linear-gradient(135deg,#00c9b8,#007a6e);color:white;border:none;border-radius:12px;cursor:pointer;font-size:15px;font-weight:700;font-family:inherit">Recarregar</button>
            </div>`);
    }
    return false;
};

function init() {
    // Garantir que apenas uma tela fique ativa (nenhuma fica visível durante verificação de sessão)
    document.querySelectorAll('.screen.active').forEach(s => s.classList.remove('active'));
    // Ocultar nav durante verificação: evita flash de tela errada antes do auth ser resolvido
    const _initNav = document.getElementById('bottom-nav');
    if (_initNav) _initNav.style.display = 'none';

    // ── OAuth callback: ?code= na URL → SDK está trocando o código por tokens agora ──
    // NÃO remove o ?code= da URL aqui. O SDK lê o ?code= de forma assíncrona DEPOIS
    // que init() roda. Se removermos agora (replaceState), o SDK não encontra o código
    // e a troca PKCE nunca acontece. A limpeza da URL acontece no handler SIGNED_IN.
    if (window.location.search.indexOf('code=') !== -1) {
        // Timeout de segurança: se SIGNED_IN não disparar em 20s, mostra login
        setTimeout(function () {
            if (!state.user.id) {
                document.getElementById('screen-login').classList.add('active');
                if (_initNav) _initNav.style.display = 'none';
                state.currentScreen = 'login';
            }
        }, 20000);
        return; // aguarda onAuthStateChange → SIGNED_IN → navigate('home')
    }

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

    // Não resetar state.currentScreen aqui — o valor correto é determinado por getCurrentUser()
    // abaixo. Resetar prematuramente para 'home' fazia navigate('home') ser no-op no SIGNED_IN
    // quando a home ainda não estava ativa no DOM (race condition).
    const nav = document.getElementById('bottom-nav');

    // Pular se usuário já tem dados (migração do estado antigo)
    const isReturningUser = state.user.xp > 0 || (state.quizHistory && state.quizHistory.length > 0);

    // Detectar entrada pelo funil (landing.html?ref=landing)
    const _urlParams    = new URLSearchParams(window.location.search);
    const _refSource    = (_urlParams.get('ref') || _urlParams.get('utm_source') || '').toLowerCase();
    const _forceFunnel  = _refSource === 'landing' || _refSource === 'landing_page';
    const _forceLogin    = _refSource === 'login';
    const _paymentReturn = _refSource === 'payment-success' || _refSource === 'cakto-return';
    // Limpar parâmetro da URL sem recarregar a página
    if ((_forceFunnel || _forceLogin || _paymentReturn) && window.history?.replaceState) {
        window.history.replaceState({}, '', window.location.pathname);
    }

    // ── Verificar sessão Supabase SEMPRE antes de decidir qual tela mostrar ──
    if (typeof getCurrentUser !== 'undefined') {
        getCurrentUser().then(user => {
            if (user) {
                // Sessão ativa: aplicar nome real do provider antes de carregar do banco
                const meta = user.user_metadata || {};
                const oauthName = meta.full_name || meta.name || meta.display_name || '';
                if (oauthName && oauthName.trim()) {
                    state.user.name = oauthName.trim();
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
                    _checkReengagementPush();
                    _checkStreakRecovery();
                    _checkWrappedNotification();
                });
            } else {
                // Sem sessão ativa segundo getCurrentUser().
                // PROTEÇÃO CONTRA RACE CONDITION: se o usuário fez login enquanto
                // aguardávamos getCurrentUser() (que pode demorar por rede lenta),
                // o handler SIGNED_IN já navegou para home. Não sobrescrever.
                const _homeAlreadyActive = document.getElementById('screen-home')?.classList.contains('active');
                if (state.user.id || _homeAlreadyActive) return;

                // Onboarding: usuário novo SEM dados locais, vindo de qualquer CTA
                // (exceto quando explicitamente quer fazer login com ?ref=login).
                if (!_forceLogin && (_forceFunnel || (!state.onboardingDone && !isReturningUser))) {
                    document.getElementById('screen-onboarding').classList.add('active');
                    nav.style.display = 'none';
                    state.currentScreen = 'onboarding';
                } else if (_paymentReturn) {
                    // Retorno do gateway: mostrar login com banner de sucesso
                    document.getElementById('screen-login').classList.add('active');
                    nav.style.display = 'none';
                    state.currentScreen = 'login';
                    // Pré-preencher e-mail pendente e exibir banner de confirmação
                    try {
                        const _pendingEmail = sessionStorage.getItem('_pendingEmail') || '';
                        if (_pendingEmail) {
                            const emailEl = document.getElementById('login-email');
                            if (emailEl) emailEl.value = _pendingEmail;
                        }
                    } catch { /* noop */ }
                    _showPaymentSuccessBanner();
                    // Iniciar polling para detectar ativação automática via webhook
                    _startPlanPolling('login', false);
                } else {
                    // Login: usuário existente (tem dados locais), novo dispositivo,
                    // ou acesso via ?ref=login (botão "Entrar" na landing page)
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
                _DEV && console.log(`🔄 Pré-carregando questões ENEM ${latest}...`);
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
                        _DEV && console.log(`✅ Cache aquecido: ${questions.length} questões ENEM ${latest}`);
                    } catch (e) {
                        // Silencioso — sem espaço no localStorage não afeta o app
                    }
                }
            } else {
                _DEV && console.log(`✅ Cache já existe para ENEM ${latest}`);
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
                const pct   = h.pct || Math.round(((h.correct||0)/Math.max(h.total||1,1))*100);
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
// SCORE PREDICTION — Nota ENEM estimada (TRI)
// =====================================================

function _getWeekStr() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(new Date(d).setDate(diff)).toDateString();
}

function _calcENEMScore() {
    const stats = state.progress && state.progress.stats;
    if (!stats) return null;
    const areas = ['humanas', 'natureza', 'linguagens', 'matematica'];
    const totalAnswered = areas.reduce((s, d) => s + (stats[d]?.total || 0), 0);
    if (totalAnswered < 10) return null;
    // Usa apenas áreas com dados suficientes para evitar distorção
    let sum = 0, count = 0;
    for (const d of areas) {
        const st = stats[d] || { correct: 0, total: 0 };
        if (st.total >= 5) { sum += st.correct / st.total; count++; }
    }
    if (count === 0) return null;
    const avgRatio = sum / count;
    const score = Math.round(1 / (1 + Math.exp(-9 * (avgRatio - 0.5))) * 700 + 300);
    return Math.max(300, Math.min(1000, score));
}

function _calcScoreTrend() {
    const hist = state.quizHistory || [];
    if (hist.length < 5) return null;
    const recent = hist.slice(-7);
    const older  = hist.slice(-14, -7);
    if (older.length === 0) return null;
    const avg = arr => arr.reduce((s, h) => s + (h.pct || 0), 0) / arr.length;
    return avg(recent) - avg(older);
}

function _getWeakSpot() {
    const stats = state.progress && state.progress.stats;
    if (!stats) return null;
    const areas = [
        { key: 'humanas',    name: 'Ciências Humanas' },
        { key: 'natureza',   name: 'Ciências da Natureza' },
        { key: 'linguagens', name: 'Linguagens' },
        { key: 'matematica', name: 'Matemática' },
    ];
    let weakest = null, worstPct = 101;
    for (const area of areas) {
        const st = stats[area.key] || { correct: 0, total: 0 };
        if (st.total < 5) continue;
        const pct = Math.round((st.correct / st.total) * 100);
        if (pct < worstPct) { worstPct = pct; weakest = { ...area, pct, total: st.total }; }
    }
    return weakest;
}

function _renderScorePrediction() {
    const card = document.getElementById('score-pred-card');
    if (!card) return;
    const score = _calcENEMScore();
    if (!score) { card.style.display = 'none'; return; }

    card.style.display = '';
    document.getElementById('sp-score').textContent = score.toLocaleString('pt-BR');

    // Trend
    const trend = _calcScoreTrend();
    const trendEl = document.getElementById('sp-trend');
    if (trendEl) {
        if (trend === null)   { trendEl.textContent = ''; }
        else if (trend >= 2)  { trendEl.textContent = '↑ Subindo'; trendEl.style.color = '#22c55e'; }
        else if (trend <= -2) { trendEl.textContent = '↓ Caindo';  trendEl.style.color = '#f97316'; }
        else                  { trendEl.textContent = '→ Estável'; trendEl.style.color = '#7a9ab5'; }
    }

    // Barra de progresso até a próxima meta
    const milestoneWrap = document.getElementById('sp-milestone-wrap');
    const milestoneFill = document.getElementById('sp-milestone-fill');
    const milestoneLabel = document.getElementById('sp-milestone-label');
    if (milestoneWrap && milestoneFill && milestoneLabel && score < 1000) {
        const target = score < 700 ? 700 : score < 800 ? 800 : score < 900 ? 900 : 1000;
        const base   = target === 700 ? 300 : target - 100;
        const pct    = Math.min(100, Math.round(((score - base) / (target - base)) * 100));
        milestoneFill.style.width = pct + '%';
        milestoneLabel.textContent = `${pct}% do caminho até ${target} pts`;
        milestoneWrap.style.display = '';
    } else if (milestoneWrap) {
        milestoneWrap.style.display = 'none';
    }

    // Breakdown por área
    const areasEl = document.getElementById('sp-areas');
    if (areasEl) {
        const stats = state.progress && state.progress.stats;
        const areasList = [
            { key: 'humanas',    name: 'Humanas',    icon: '🌍' },
            { key: 'natureza',   name: 'Natureza',   icon: '🔬' },
            { key: 'linguagens', name: 'Linguagens', icon: '📝' },
            { key: 'matematica', name: 'Matemática', icon: '🔢' },
        ];
        let html = '';
        for (const area of areasList) {
            const st = stats && stats[area.key] || { correct: 0, total: 0 };
            if (st.total < 5) continue;
            const pct   = Math.round((st.correct / st.total) * 100);
            const color = pct >= 65 ? '#22c55e' : pct >= 45 ? '#f5c518' : '#ef4444';
            html += `<div class="sp-area-row">` +
                `<span class="sp-area-icon">${area.icon}</span>` +
                `<span class="sp-area-name">${area.name}</span>` +
                `<div class="sp-area-bar-bg"><div class="sp-area-bar-fill" style="width:${pct}%;background:${color}"></div></div>` +
                `<span class="sp-area-pct" style="color:${color}">${pct}%</span>` +
            `</div>`;
        }
        areasEl.innerHTML = html;
        areasEl.style.display = html ? '' : 'none';
    }

    // Insight humanizado
    const insightEl = document.getElementById('sp-insight');
    if (insightEl) {
        const weak   = _getWeakSpot();
        const target = score < 700 ? 700 : score < 800 ? 800 : 900;
        let msg = '';

        if (score >= 900) {
            msg = 'Você está no top 5% dos candidatos — desempenho de aprovado. Continue assim! 🏆';
        } else if (!weak) {
            if (score >= 800) msg = `Nota muito boa! Falta ${target - score} pts para atingir ${target}. Mantenha o ritmo.`;
            else               msg = `Você está no caminho certo. Continue praticando para superar os ${target} pontos!`;
        } else {
            const gap = target - score;
            if (weak.pct < 30) {
                msg = `${weak.name} está puxando sua nota pra baixo (${weak.pct}% de acerto). Esse é seu maior ganho agora — focar aqui pode te levar aos ${target} pts.`;
            } else if (weak.pct < 50) {
                msg = `Para chegar nos ${target}, sua maior alavanca é ${weak.name} — você está acertando ${weak.pct}% das questões. Dá pra melhorar muito!`;
            } else {
                msg = `${weak.name} é seu ponto mais fraco (${weak.pct}% de acerto). Um foco extra aqui fecha a distância para ${target} pts.`;
            }
        }
        insightEl.textContent = msg;
        const ctaEl = document.getElementById('sp-cta');
        if (ctaEl && weak) ctaEl.onclick = () => { quizSetup.discipline = weak.key; navigate('quiz-setup'); };
    }
}

function _renderWeakSpotAlert() {
    const card = document.getElementById('weak-spot-card');
    if (!card) return;
    const weak = _getWeakSpot();
    if (!weak || weak.pct >= 70) { card.style.display = 'none'; return; }

    card.style.display = '';
    const titleEl = document.getElementById('ws-title');
    const subEl   = document.getElementById('ws-sub');
    const ctaEl   = document.getElementById('ws-cta');
    if (titleEl) titleEl.textContent = weak.name;
    if (subEl) {
        const questStr = weak.total === 1 ? '1 questão' : `${weak.total} questões`;
        if (weak.pct < 30)       subEl.textContent = `Só ${weak.pct}% de acerto em ${questStr} — aqui tá o maior potencial de melhora!`;
        else if (weak.pct < 50)  subEl.textContent = `${weak.pct}% de acerto em ${questStr} — ainda dá pra avançar bastante aqui.`;
        else                     subEl.textContent = `${weak.pct}% de acerto em ${questStr} — um pouco de foco faz diferença.`;
    }
    if (ctaEl)   ctaEl.onclick = () => { quizSetup.discipline = weak.key; navigate('quiz-setup'); };
}

// =====================================================
// STREAK RECOVERY — Escudo Semanal Anti-churn
// =====================================================

function _checkStreakRecovery() {
    const streak = state.user.streak || 0;
    const lastStudy = state.user.lastStudyDate;
    if (!lastStudy || streak < 3) return;

    const now = new Date();
    const daysDiff = Math.floor((now - new Date(lastStudy)) / (1000 * 60 * 60 * 24));
    if (daysDiff < 2) return;

    const weekStr = _getWeekStr();
    if (state.user.shieldUsedWeek === weekStr) return;

    const shownKey = 'enem_shield_shown_' + now.toDateString();
    if (localStorage.getItem(shownKey)) return;
    localStorage.setItem(shownKey, '1');

    const bodyEl = document.getElementById('shield-body');
    if (bodyEl) bodyEl.innerHTML = `Você ficou ${daysDiff} dias sem estudar e sua ofensiva de <strong style="color:#fb7185">${streak} dias</strong> foi perdida.<br>Use seu escudo semanal para recuperá-la!`;
    const modal = document.getElementById('streak-shield-modal');
    if (modal) modal.classList.add('active');
}

function activateStreakShield() {
    const weekStr = _getWeekStr();
    state.user.shieldUsedWeek = weekStr;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    state.user.lastStudyDate = yesterday.toDateString();
    saveState();
    closeStreakShieldModal();
    _showQuickToast('🛡️ Escudo ativado! Sua ofensiva está salva. Estude hoje para continuar!');
}

function closeStreakShieldModal() {
    const modal = document.getElementById('streak-shield-modal');
    if (modal) modal.classList.remove('active');
}

// =====================================================
// REENGAJAMENTO — Push notifications inteligentes
// =====================================================

function _checkReengagementPush() {
    const lastStudy = state.user.lastStudyDate;
    if (!lastStudy) return;

    const now = new Date();
    const daysDiff = Math.floor((now - new Date(lastStudy)) / (1000 * 60 * 60 * 24));
    const todayKey = 'enem_reeng_' + now.toDateString();
    if (localStorage.getItem(todayKey)) return;

    if (daysDiff >= 2) {
        localStorage.setItem(todayKey, '1');
        const streak = state.user.streak || 0;
        if (streak >= 3) {
            _pushNotification({
                type: 'orange', icon: '🔥',
                title: `Sua ofensiva de ${streak} dias está em risco!`,
                body: `Você ficou ${daysDiff} dias sem estudar. Faça pelo menos 1 questão agora!`,
                ctaScreen: 'quiz-setup', cta: 'Estudar agora',
            });
        } else {
            _pushNotification({
                type: 'blue', icon: '📚',
                title: 'Está sentindo falta do ENEM Master?',
                body: 'Volte agora e mantenha o ritmo rumo à sua nota!',
                ctaScreen: 'quiz-setup', cta: 'Continuar estudando',
            });
        }
    }

    // Resumo de segunda-feira
    if (now.getDay() === 1) {
        const weekStr = _getWeekStr();
        if (state.user.lastWeeklySummaryPush !== weekStr) {
            state.user.lastWeeklySummaryPush = weekStr;
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 7);
            const weekHist = (state.quizHistory || []).filter(h => h.date && new Date(h.date) >= weekStart);
            const weekQ = weekHist.reduce((s, h) => s + (h.total || 0), 0);
            const weekC = weekHist.reduce((s, h) => s + (h.correct || 0), 0);
            if (weekQ > 0) {
                _pushNotification({
                    type: 'teal', icon: '📊',
                    title: 'Resumo da sua semana!',
                    body: `Semana passada: ${weekQ} questões, ${Math.round((weekC / weekQ) * 100)}% de acerto. Bora superar essa semana!`,
                    ctaScreen: 'analise', cta: 'Ver análise',
                });
            }
            saveState();
        }
    }
}

// =====================================================
// WRAPPED MENSAL — Notificação + Banner no Dashboard
// =====================================================

function _checkWrappedNotification() {
    const now = new Date();
    if (now.getDate() !== 1) return;

    const monthKey = now.getFullYear() + '-' + now.getMonth();
    const notifKey = 'enem_wrapped_notif_' + monthKey;
    if (localStorage.getItem(notifKey)) return;
    localStorage.setItem(notifKey, '1');

    const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                         'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const label = MONTH_NAMES[prevMonth] + ' ' + prevYear;

    _pushNotification({
        type: 'teal', icon: '✨',
        title: 'Seu Wrapped de ' + label + ' está pronto!',
        body: 'Veja seu resumo mensal: questões, acertos, XP e muito mais.',
        ctaScreen: 'profile', cta: 'Ver Wrapped',
    });
}

function _renderWrappedBanner() {
    const card = document.getElementById('wrapped-banner-card');
    if (!card) return;

    const now = new Date();
    const isFirstWeek = now.getDate() <= 7;
    if (!isFirstWeek) { card.style.display = 'none'; return; }

    const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                         'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    if (typeof computeMonthlyRetro === 'undefined') { card.style.display = 'none'; return; }
    const retro = computeMonthlyRetro(prevMonth, prevYear);
    if (!retro) { card.style.display = 'none'; return; }

    const label = MONTH_NAMES[prevMonth] + ' ' + prevYear;
    const labelEl = document.getElementById('wrapped-banner-month');
    const questEl = document.getElementById('wrapped-banner-quest');
    const xpEl    = document.getElementById('wrapped-banner-xp');
    if (labelEl) labelEl.textContent = label;
    if (questEl) questEl.textContent = retro.totalQuestoes.toLocaleString('pt-BR') + ' questões';
    if (xpEl)    xpEl.textContent    = retro.totalXP.toLocaleString('pt-BR') + ' XP';

    card.style.display = '';
}

// =====================================================
