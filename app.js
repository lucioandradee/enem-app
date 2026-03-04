/* =====================================================
   ENEM MASTER — App Logic (app.js)
   SPA Router • Quiz Engine • Gamification • Data
   ===================================================== */

'use strict';

// =====================================================
// STATE
// =====================================================
const defaultState = {
    user: {
        name: 'Alex',
        email: 'alex@estudo.com',
        school: 'Escola Estadual Machado de Assis',
        level: 1,
        xp: 0,
        streak: 0,
        goal: 'Rumo à Federal 🚀',
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
    quizHistory: [],    // [{ date, discipline, correct, total, xp }]
    wrongAnswers: [],   // [{ question, userAnswer, correctAnswer, date }]
    onboardingDone: false,
    weakSubjects: [],   // disciplinas prioritárias do onboarding
    badges: {
        ofensiva: [],
        especialista: [],
        maratonista: [],
    },
    notifications: [
        { id: 1, type: 'blue', icon: '📝', title: 'Simulado disponível', body: 'Novo Simulado: Ciências da Natureza já está aberto para você. Prepare-se e comece agora!', time: '6h', unread: true, cta: 'Fazer Simulado', ctaAction: "navigate('quiz-setup')", date: 'today' },
        { id: 2, type: 'orange', icon: '📊', title: 'Ranking Semanal', body: 'Eita! João Silva ultrapassou você no Ranking. Volte aos estudos para recuperar sua posição!', time: '1h', unread: true, date: 'today' },
        { id: 3, type: 'purple', icon: '🏅', title: 'Nova Conquista', body: 'Parabéns! Você desbloqueou o badge "Mestre da Redação" por 5 notas acima de 900.', time: '3h', unread: true, date: 'today' },
        { id: 4, type: 'green', icon: '📅', title: 'Lembrete de Estudo', body: 'Hora do Estudo: Seguindo seu cronograma, agora é vez de Matemática (Funções).', time: '6h', unread: false, date: 'today' },
        { id: 5, type: 'yellow', icon: '🔥', title: 'Maratona 7 Dias', body: 'Incrível! Você manteve seu ritmo de estudos por uma semana inteira.', time: 'Ontem', unread: false, date: 'yesterday' },
    ],
    currentScreen: 'home',
};

let state;
try {
    const _saved = localStorage.getItem('enem_state');
    state = _saved ? JSON.parse(_saved) : null;
} catch (e) {
    console.warn('⚠️ Estado corrompido, resetando:', e);
    localStorage.removeItem('enem_state');
    state = null;
}
state = state || JSON.parse(JSON.stringify(defaultState));

function saveState() {
    localStorage.setItem('enem_state', JSON.stringify(state));
}

// =====================================================
// QUESTION BANK
// =====================================================
const questions = [
    // CIÊNCIAS HUMANAS
    {
        area: 'CIÊNCIAS HUMANAS', tag: 'HISTÓRIA GERAL',
        question: 'A Revolução Industrial alterou profundamente as relações de trabalho na Europa do século XVIII. Qual foi o principal impacto social desse processo inicial nas grandes metrópoles inglesas?',
        quote: '"O operário não é mais o dono dos seus meios de produção, tornando-se apenas uma peça na engrenagem fabril, submetido a longas jornadas e condições precárias." — Fragmento adaptado de Eric Hobsbawm.',
        options: [
            'A valorização imediata das corporações de ofício medievais como núcleos produtivos.',
            'A migração em massa do campo para as cidades, resultando em um crescimento urbano desordenado.',
            'O fortalecimento do regime de servidão no campo para suprir a demanda industrial.',
            'A proibição legal do trabalho feminino e infantil nas fábricas têxteis inglesas.',
            'O fim imediato das desigualdades socioeconômicas através da mecanização.',
        ],
        correct: 1,
        hint: 'Pense no processo de urbanização acelerada e êxodo rural que acompanhou a industrialização.',
        explanation: 'A industrialização provocou enorme êxodo rural, com trabalhadores migrando para as cidades em busca de emprego nas fábricas, criando bairros operários superlotados e condições precárias de vida.',
    },
    {
        area: 'CIÊNCIAS HUMANAS', tag: 'FILOSOFIA',
        question: 'Para Immanuel Kant, o imperativo categórico estabelece que devemos agir apenas segundo aquela máxima que possamos querer que se torne uma lei universal. Qual das alternativas melhor exemplifica esse princípio?',
        quote: '"Age apenas segundo uma máxima tal que possas ao mesmo tempo querer que ela se torne lei universal." — Kant, Fundamentação da Metafísica dos Costumes.',
        options: [
            'Mentir quando a mentira trouxer benefícios pessoais imediatos.',
            'Ajudar os outros apenas quando isso resultar em recompensa futura.',
            'Cumprir promessas mesmo quando isso for inconveniente, pois todos deveriam fazê-lo.',
            'Agir conforme as emoções do momento, pois elas refletem a natureza humana.',
            'Obedecer às leis apenas quando há fiscalização.',
        ],
        correct: 2,
        hint: 'O imperativo categórico pede que você universalize sua ação — imagine todos agindo da mesma forma.',
        explanation: 'Cumprir promessas é universalizável: se todos cumprissem suas promessas, a sociedade funcionaria melhor. Mentir ou agir por interesse próprio não pode ser universalizado sem contradição.',
    },
    {
        area: 'CIÊNCIAS HUMANAS', tag: 'GEOGRAFIA',
        question: 'O fenômeno da globalização intensificou os fluxos econômicos, culturais e migratórios entre os países. Entretanto, esse processo também gerou contradições. Qual das alternativas apresenta uma consequência negativa da globalização?',
        quote: null,
        options: [
            'O aumento da diversidade cultural nos países receptores de imigrantes.',
            'A ampliação do acesso a tecnologias de comunicação em países em desenvolvimento.',
            'A concentração de renda e o aumento das desigualdades entre países centrais e periféricos.',
            'A criação de blocos econômicos que facilitam o comércio entre nações.',
            'O crescimento do turismo internacional e intercâmbio cultural.',
        ],
        correct: 2,
        hint: 'Pense nas relações de poder entre países desenvolvidos e subdesenvolvidos no contexto global.',
        explanation: 'A globalização, apesar de seus benefícios, aprofundou as desigualdades entre países centrais (que controlam o capital e a tecnologia) e países periféricos (fornecedores de matéria-prima e mão de obra barata).',
    },
    // CIÊNCIAS DA NATUREZA
    {
        area: 'CIÊNCIAS DA NATUREZA', tag: 'BIOLOGIA',
        question: 'As Leis de Mendel são fundamentais para compreender a hereditariedade. Em um cruzamento entre dois indivíduos heterozigotos para uma característica (Aa × Aa), qual é a proporção esperada de indivíduos homozigotos recessivos na prole?',
        quote: null,
        options: [
            '1/2 (50%)',
            '3/4 (75%)',
            '1/4 (25%)',
            '0 (0%)',
            '2/4 (50%)',
        ],
        correct: 2,
        hint: 'Monte o quadro de Punnett: Aa × Aa gera AA, Aa, Aa, aa.',
        explanation: 'No cruzamento Aa × Aa, o quadro de Punnett resulta em: 1 AA : 2 Aa : 1 aa. Portanto, 1/4 (25%) dos descendentes serão homozigotos recessivos (aa).',
    },
    {
        area: 'CIÊNCIAS DA NATUREZA', tag: 'QUÍMICA',
        question: 'A reação de combustão completa do metano (CH₄) é amplamente utilizada como fonte de energia. Qual é o produto gasoso liberado nessa reação que contribui para o efeito estufa?',
        quote: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
        options: [
            'Monóxido de carbono (CO)',
            'Dióxido de carbono (CO₂)',
            'Dióxido de enxofre (SO₂)',
            'Óxido nítrico (NO)',
            'Vapor d\'água (H₂O)',
        ],
        correct: 1,
        hint: 'Na combustão completa, o carbono se oxida completamente. Qual é o produto dessa oxidação total?',
        explanation: 'Na combustão completa do metano, o carbono reage com o oxigênio formando CO₂ (dióxido de carbono), um dos principais gases responsáveis pelo efeito estufa e aquecimento global.',
    },
    {
        area: 'CIÊNCIAS DA NATUREZA', tag: 'FÍSICA',
        question: 'Um objeto é lançado verticalmente para cima com velocidade inicial de 20 m/s. Considerando g = 10 m/s², qual é a altura máxima atingida pelo objeto?',
        quote: 'Use: v² = v₀² - 2g·h, onde v = 0 no ponto mais alto.',
        options: [
            '10 metros',
            '40 metros',
            '20 metros',
            '5 metros',
            '2 metros',
        ],
        correct: 2,
        hint: 'No ponto mais alto, a velocidade é zero. Use a equação de Torricelli: v² = v₀² - 2gh.',
        explanation: 'Aplicando v² = v₀² - 2gh com v=0: 0 = 400 - 2×10×h → h = 400/20 = 20 metros.',
    },
    // LINGUAGENS
    {
        area: 'LINGUAGENS', tag: 'LITERATURA',
        question: 'O Modernismo brasileiro de 1922 representou uma ruptura com os padrões estéticos vigentes. Qual das características abaixo é marcante na primeira fase do Modernismo brasileiro?',
        quote: '"Tupi or not tupi, that is the question." — Oswald de Andrade, Manifesto Antropófago.',
        options: [
            'Valorização da linguagem culta e das formas fixas como o soneto.',
            'Idealização da natureza e do índio como símbolo de pureza nacional.',
            'Ruptura com a norma culta, humor, ironia e valorização da cultura popular brasileira.',
            'Introspecção psicológica e análise do comportamento humano em sociedades urbanas.',
            'Exaltação do progresso industrial e da tecnologia como salvação da humanidade.',
        ],
        correct: 2,
        hint: 'Pense na Semana de Arte Moderna de 1922 e nos manifestos de Oswald de Andrade.',
        explanation: 'A primeira fase do Modernismo (1922-1930) caracterizou-se pela ruptura com o passadismo, uso da linguagem coloquial, humor e ironia, e valorização da identidade cultural brasileira, como visto nos manifestos de Oswald de Andrade.',
    },
    {
        area: 'LINGUAGENS', tag: 'REDAÇÃO',
        question: 'Em uma redação dissertativa-argumentativa do ENEM, qual é a função do parágrafo de conclusão?',
        quote: null,
        options: [
            'Apresentar novos argumentos que não foram abordados no desenvolvimento.',
            'Repetir a tese e os argumentos de forma idêntica ao que foi dito.',
            'Retomar a tese, sintetizar os argumentos e apresentar uma proposta de intervenção detalhada.',
            'Introduzir o tema e contextualizar o leitor sobre o assunto.',
            'Apresentar dados estatísticos que comprovem os argumentos.',
        ],
        correct: 2,
        hint: 'A conclusão deve fechar o texto de forma coerente, retomando o que foi dito e propondo uma solução.',
        explanation: 'No ENEM, a conclusão deve: retomar a tese de forma sintética, resumir os argumentos desenvolvidos e apresentar uma proposta de intervenção social detalhada (com agente, ação, meio, finalidade e efeito).',
    },
    // MATEMÁTICA
    {
        area: 'MATEMÁTICA', tag: 'FUNÇÕES',
        question: 'Uma função do 2º grau é definida por f(x) = x² - 4x + 3. Quais são as raízes dessa função?',
        quote: 'Use a fórmula de Bhaskara: x = (-b ± √Δ) / 2a, onde Δ = b² - 4ac.',
        options: [
            'x = 1 e x = 3',
            'x = -1 e x = -3',
            'x = 2 e x = 4',
            'x = 0 e x = 4',
            'x = 1 e x = -3',
        ],
        correct: 0,
        hint: 'Calcule o discriminante: Δ = (-4)² - 4×1×3 = 16 - 12 = 4.',
        explanation: 'Com a=1, b=-4, c=3: Δ = 16-12 = 4. x = (4 ± 2)/2. Então x₁ = 3 e x₂ = 1. As raízes são x=1 e x=3.',
    },
    {
        area: 'MATEMÁTICA', tag: 'GEOMETRIA',
        question: 'Um terreno retangular tem 30 metros de comprimento e 20 metros de largura. Qual é a medida da diagonal desse terreno?',
        quote: 'Use o Teorema de Pitágoras: d² = a² + b²',
        options: [
            '25 metros',
            '50 metros',
            '36 metros',
            '10√13 metros',
            '600 metros',
        ],
        correct: 3,
        hint: 'A diagonal é a hipotenusa do triângulo retângulo formado pelos lados do retângulo.',
        explanation: 'd² = 30² + 20² = 900 + 400 = 1300. d = √1300 = √(100×13) = 10√13 metros.',
    },
];

// =====================================================
// QUIZ STATE
// =====================================================
let quizState = {
    questions: [],
    currentIndex: 0,
    selectedOption: null,
    confirmed: false,
    correct: 0,
    wrong: 0,
    timerInterval: null,
    timeLeft: 0,
    totalTime: 0,
    discipline: 'misto',
};

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
};

const screensWithNav = ['home', 'ranking', 'achievements', 'profile'];
const screensWithoutNav = ['quiz', 'quiz-setup', 'result', 'settings', 'support', 'notifications', 'review', 'onboarding'];

function navigate(screenName) {
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
}

function updateNavActive(screenName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navMap = { home: 'nav-home', ranking: 'nav-ranking', achievements: 'nav-achievements', profile: 'nav-profile' };
    const activeBtn = document.getElementById(navMap[screenName]);
    if (activeBtn) activeBtn.classList.add('active');
}

function renderScreen(screenName) {
    switch (screenName) {
        case 'home': renderDashboard(); break;
        case 'ranking': renderRanking(); break;
        case 'notifications': renderNotifications(); break;
        case 'profile': renderProfile(); break;
        case 'quiz-setup': renderQuizSetup(); break;
        case 'review': renderReview(); break;
        case 'achievements': renderAchievements(); break;
        default: break;
    }
}

// =====================================================
// DASHBOARD
// =====================================================
function renderDashboard() {
    const s = state.user;

    // Saudação baseada no horário
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const greetingEl = document.querySelector('.greeting');
    if (greetingEl) greetingEl.innerHTML = `${greeting}, <span id="dash-name">${s.name.split(' ')[0]}</span>! 👋`;

    const goalEl = document.querySelector('.goal-text');
    if (goalEl) goalEl.textContent = s.goal;

    document.getElementById('dash-level').textContent = s.level;
    document.getElementById('dash-xp').textContent = s.xp.toLocaleString('pt-BR');
    document.getElementById('dash-streak').textContent = s.streak + ' Dias';
    document.getElementById('dash-avatar').textContent = s.name[0].toUpperCase();

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
    const schedule = [];
    let pool = [...withPct, withPct[0], withPct[1]]; // fraquinhos aparecem 2x
    pool = pool.sort(() => Math.random() - 0.5).slice(0, 6);
    return pool;
}

function renderTodayCard() {
    const schedule = getDynamicSchedule();
    const dayIdx = new Date().getDay();
    const subj = schedule[dayIdx % schedule.length];

    const done = state.progress.questoesHoje;
    const total = state.progress.totalHoje;
    const pct = Math.round((done / total) * 100);

    document.getElementById('today-area').textContent = subj.area;
    document.getElementById('today-icon').textContent = subj.icon;
    document.getElementById('today-title').textContent = subj.title;
    document.getElementById('today-sub').textContent = subj.sub;
    document.getElementById('today-progress').textContent = `${done}/${total} Questões`;
    document.getElementById('today-bar').style.width = pct + '%';
}

// =====================================================
// QUIZ SETUP
// =====================================================
let quizSetup = { discipline: 'misto', count: 10 };

function renderQuizSetup() {
    // Restore selections
    document.querySelectorAll('.disc-card').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.disc === quizSetup.discipline);
    });
    document.querySelectorAll('.count-btn').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.count) === quizSetup.count);
    });
    // Check API status
    checkAPIAvailability();
}

function selectDisc(btn) {
    document.querySelectorAll('.disc-card').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    quizSetup.discipline = btn.dataset.disc;
}

function selectCount(btn) {
    document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    quizSetup.count = parseInt(btn.dataset.count);
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

async function initQuizFromSetup(forceLocal = false) {
    if (!quizSetup.discipline) {
        // Selecionar misto como padrão
        quizSetup.discipline = 'misto';
        document.querySelector('[data-disc="misto"]').classList.add('selected');
    }

    const btn = document.getElementById('start-quiz-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Carregando...';

    await startQuiz(quizSetup.discipline, quizSetup.count, forceLocal);

    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5,3 19,12 5,21" /></svg> INICIAR SIMULADO';
}

// =====================================================
// QUIZ ENGINE
// =====================================================
async function startQuiz(discipline = 'misto', count = 10, forceLocal = false) {
    navigate('quiz');
    showQuizLoading(true);

    let selectedQuestions = null;

    if (!forceLocal) {
        try {
            selectedQuestions = await window.enemAPI.getQuizQuestions(discipline, count);
        } catch (e) {
            console.warn('API error:', e);
        }
    }

    // Fallback: banco local
    if (!selectedQuestions || selectedQuestions.length === 0) {
        selectedQuestions = getLocalQuestions(discipline, count);
        console.log('📚 Usando banco local:', selectedQuestions.length, 'questões');
    } else {
        console.log('🌐 Questões API:', selectedQuestions.length);
    }

    quizState.questions = selectedQuestions;
    quizState.currentIndex = 0;
    quizState.correct = 0;
    quizState.wrong = 0;
    quizState.selectedOption = null;
    quizState.confirmed = false;
    quizState.discipline = discipline;
    quizState.timeLeft = Math.max(5 * 60, count * 75); // 75s por questão
    quizState.totalTime = quizState.timeLeft;

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
    let pool;
    const discToArea = {
        humanas: 'CIÊNCIAS HUMANAS',
        natureza: 'CIÊNCIAS DA NATUREZA',
        linguagens: 'LINGUAGENS',
        matematica: 'MATEMÁTICA',
    };

    if (discipline === 'misto') {
        pool = questions;
    } else {
        const area = discToArea[discipline];
        pool = questions.filter(q => q.area === area);
        if (pool.length < 3) pool = questions; // fallback
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function renderQuestion() {
    const q = quizState.questions[quizState.currentIndex];
    const total = quizState.questions.length;
    const idx = quizState.currentIndex;

    // Header
    document.getElementById('quiz-area-label').textContent = q.area;
    document.getElementById('quiz-q-count').textContent = `Questão ${idx + 1} de ${total}`;
    document.getElementById('quiz-progress-bar').style.width = ((idx / total) * 100) + '%';

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
                imgsEl.appendChild(img);
            });
        }
    }

    // Context text (API) or classic quote (local)
    const contextEl = document.getElementById('quiz-context');
    if (contextEl) {
        if (q.context) {
            contextEl.innerHTML = renderMarkdown(q.context);
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

        let innerHtml = `<span class="option-letter">${letters[i]}</span>`;
        innerHtml += `<span class="option-text">${opt}</span>`;

        // Alternative image (API)
        if (q.alternativeFiles && q.alternativeFiles[i]) {
            innerHtml += `<img class="option-img" src="${q.alternativeFiles[i]}" alt="Alternativa ${letters[i]}" loading="lazy" />`;
        }

        btn.innerHTML = innerHtml;
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

    if (isCorrect) {
        quizState.correct++;
        state.user.xp += 10;
        state.progress.totalCorretas++;
    } else {
        quizState.wrong++;
    }
    saveState();

    // Visual feedback
    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
        if (i === q.correct) btn.classList.add('correct');
        else if (i === selected && !isCorrect) btn.classList.add('wrong');
    });

    // Show explanation
    const hintBox = document.getElementById('hint-box');
    hintBox.textContent = (isCorrect ? '✅ Correto! ' : '❌ Errado! ') + q.explanation;
    hintBox.style.display = 'block';

    const confirmBtn = document.getElementById('confirm-btn');
    const isLast = quizState.currentIndex === quizState.questions.length - 1;
    confirmBtn.textContent = isLast ? 'Ver Resultado →' : 'Próxima Questão →';
    document.getElementById('quiz-footer-hint').textContent = isCorrect ? '🎉 MUITO BEM!' : '📖 REVISE O CONCEITO';
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
    const total = quizState.questions.length;
    const correct = quizState.correct;
    const pct = Math.round((correct / total) * 100);
    const xpGained = correct * 10;

    // Atualizar progresso do dia
    state.progress.questoesHoje = Math.min(state.progress.questoesHoje + total, state.progress.totalHoje);
    state.user.xp += xpGained;

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
    });

    // Atualizar streak (verificar se já estudou hoje)
    updateStreak();

    saveState();

    // Renderizar tela de resultado
    document.getElementById('result-emoji').textContent = pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚';
    document.getElementById('result-title').textContent = pct >= 70 ? 'Excelente Resultado!' : pct >= 50 ? 'Bom Trabalho!' : 'Continue Praticando!';
    document.getElementById('result-sub').textContent = `Você acertou ${correct} de ${total} questões`;
    document.getElementById('result-pct').textContent = pct + '%';
    document.getElementById('res-correct').textContent = correct;
    document.getElementById('res-wrong').textContent = quizState.wrong;
    document.getElementById('res-xp').textContent = '+' + xpGained;

    // Update ring
    const circumference = 314;
    const offset = circumference - (circumference * pct / 100);
    document.getElementById('result-ring').setAttribute('stroke-dashoffset', offset);

    navigate('result');

    // Verificar conquistas DEPOIS de navegar
    setTimeout(() => checkBadges(), 800);
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
            state.user.streak = 1; // quebrou a sequencia
        }
    } else {
        state.user.streak = 1;
    }
    state.user.lastStudyDate = today;
}

// =====================================================
// TIMER
// =====================================================
function startTimer() {
    stopTimer();
    quizState.timerInterval = setInterval(() => {
        quizState.timeLeft--;
        updateTimerDisplay();
        if (quizState.timeLeft <= 0) {
            stopTimer();
            showResult();
        }
    }, 1000);
}

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
        hintBox.innerHTML = renderMarkdown(hintText);
        hintBox.style.display = 'block';
    } else {
        hintBox.style.display = 'none';
    }
}

// =====================================================
// RANKING
// =====================================================
const rankingData = [
    { pos: 4, name: 'Juliana Mendes', class: '3º Ano B', pts: 942, avatar: 'J' },
    { pos: 5, name: 'Ricardo Oliveira', class: '3º Ano A', pts: 938, avatar: 'R' },
    { pos: 6, name: 'Beatriz Lima', class: '2º Ano C', pts: 921, avatar: 'B' },
    { pos: 7, name: 'Felipe Souza', class: '3º Ano B', pts: 915, avatar: 'F' },
    { pos: 8, name: 'Camila Torres', class: '1º Ano A', pts: 908, avatar: 'C' },
    { pos: 9, name: 'Thiago Alves', class: '2º Ano B', pts: 895, avatar: 'T' },
    { pos: 10, name: 'Larissa Costa', class: '3º Ano C', pts: 880, avatar: 'L' },
];

function renderRanking() {
    const list = document.getElementById('ranking-list');
    list.innerHTML = '';
    rankingData.forEach(item => {
        const el = document.createElement('div');
        el.className = 'ranking-item';
        el.innerHTML = `
      <span class="rank-pos">${item.pos}</span>
      <div class="avatar small">${item.avatar}</div>
      <div class="rank-info">
        <div class="rank-name">${item.name}</div>
        <div class="rank-class">${item.class}</div>
      </div>
      <span class="rank-pts">${item.pts} pts</span>
    `;
        list.appendChild(el);
    });
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

function renderNotifList(unreadOnly = false) {
    const list = document.getElementById('notif-list');
    list.innerHTML = '';

    const notifs = state.notifications || [];
    const todayItems = notifs.filter(n => n.date === 'today' && (!unreadOnly || n.unread));
    const yesterdayItems = notifs.filter(n => n.date === 'yesterday' && (!unreadOnly || n.unread));

    if (todayItems.length > 0) {
        const header = document.createElement('div');
        header.className = 'notif-date-group';
        header.textContent = 'HOJE';
        list.appendChild(header);
        todayItems.forEach(n => list.appendChild(createNotifItem(n)));
    }

    if (yesterdayItems.length > 0) {
        const header = document.createElement('div');
        header.className = 'notif-date-group';
        header.textContent = 'ONTEM';
        list.appendChild(header);
        yesterdayItems.forEach(n => list.appendChild(createNotifItem(n)));
    }

    if (list.children.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:40px 16px;color:var(--text-muted);font-size:14px;">Nenhuma notificação não lida 🎉</div>';
    }
}

function createNotifItem(n) {
    const el = document.createElement('div');
    el.className = 'notif-item' + (n.unread ? ' unread' : '');
    el.innerHTML = `
    <div class="notif-icon-wrap ${n.type}">${n.icon}</div>
    <div class="notif-content">
      <div class="notif-title">${n.title}</div>
      <div class="notif-body">${n.body}</div>
      ${n.cta ? `<span class="notif-cta" onclick="${n.ctaAction}">${n.cta}</span>` : ''}
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
      <span class="notif-time">${n.time}</span>
      ${n.unread ? '<div class="notif-unread-dot"></div>' : ''}
    </div>
  `;
    el.onclick = () => markNotifRead(n.id);
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
function saveSettings() {
    const name = document.getElementById('input-name').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const school = document.getElementById('input-school').value.trim();

    if (name) state.user.name = name;
    if (email) state.user.email = email;
    if (school) state.user.school = school;
    saveState();

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

function logout() {
    if (confirm('Tem certeza que deseja sair da conta?')) {
        localStorage.removeItem('enem_state');
        location.reload();
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
        { id: 'inicio_feroz',   icon: '🔥', name: 'Início Feroz',     check: () => (state.quizHistory||[]).length >= 1 },
        { id: 'semana_ouro',    icon: '⭐', name: 'Semana de Ouro',   check: () => (state.user.streak||0) >= 7 },
        { id: 'constante',      icon: '📅', name: 'Constante',        check: () => (state.quizHistory||[]).length >= 5 },
        { id: 'mes_imparavel',  icon: '💪', name: 'Mês Imparável',    check: () => (state.user.streak||0) >= 30 },
        { id: 'lendario',       icon: '👑', name: 'Lendário',         check: () => (state.user.streak||0) >= 100 },
    ],
    especialista: [
        { id: 'genio_redacao',       icon: '✍️', name: 'Gênio da Redação',      check: () => getAreaPct('linguagens') >= 70 },
        { id: 'rei_natureza',        icon: '🌿', name: 'Rei da Natureza',         check: () => getAreaPct('natureza') >= 70 },
        { id: 'calculadora_humana',  icon: '🔢', name: 'Calculadora Humana',      check: () => getAreaPct('matematica') >= 70 },
        { id: 'globalista',          icon: '🌍', name: 'Globalista',              check: () => getAreaPct('humanas') >= 70 },
    ],
    maratonista: [
        { id: '100_questoes',   icon: '💯', name: '100 Questões',    check: () => (state.progress.totalCorretas||0) >= 100 },
        { id: '500_questoes',   icon: '🏅', name: '500 Questões',    check: () => (state.progress.totalCorretas||0) >= 500 },
        { id: 'o_maratonista',  icon: '🏃', name: 'O Maratonista',   check: () => (state.progress.totalCorretas||0) >= 1000 },
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
        // Mostrar toasts em sequência
        newlyUnlocked.forEach((badge, i) => {
            setTimeout(() => showBadgeToast(badge), i * 2200);
        });
    }
}

function showBadgeToast(badge) {
    const toast = document.getElementById('badge-toast');
    document.getElementById('badge-toast-icon').textContent = badge.icon;
    document.getElementById('badge-toast-name').textContent = badge.name;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

function renderAchievements() {
    if (!state.badges) state.badges = { ofensiva: [], especialista: [], maratonista: [] };

    const categoryMap = {
        ofensiva:      { el: null, title: '🔥 Ofensiva' },
        especialista:  { el: null, title: '🎯 Especialista' },
        maratonista:   { el: null, title: '🏃 Maratonista' },
    };

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
            item.innerHTML = `<div class="badge-icon">${isUnlocked ? badge.icon : '🔒'}</div><span>${badge.name}</span>`;
            grid.appendChild(item);
        });
    });

    // Próxima grande conquista
    const allBadges = Object.entries(BADGE_DEFINITIONS).flatMap(([cat, defs]) =>
        defs.map(b => ({ ...b, cat }))
    );
    const nextBadge = allBadges.find(b => !state.badges[b.cat]?.includes(b.id));
    if (nextBadge) {
        document.querySelector('.na-title').textContent = nextBadge.name;
        document.querySelector('.na-icon').textContent = nextBadge.icon;
        // progress estimate
        const totalBadges = allBadges.length;
        const totalUnlocked = Object.values(state.badges).flat().length;
        const pct = Math.round((totalUnlocked / totalBadges) * 100);
        document.querySelector('.progress-count.teal').textContent = pct + '%';
        document.querySelector('.next-achievement-card .progress-bar').style.width = pct + '%';
        document.querySelector('.na-remaining').textContent = `${totalUnlocked} de ${totalBadges} desbloqueados`;
    }
}

// =====================================================
// PROFILE — STATS DINÂMICAS
// =====================================================
function renderProfile() {
    const s = state.user;
    document.getElementById('profile-avatar').textContent = s.name[0].toUpperCase();
    document.getElementById('profile-name').textContent = s.name;
    document.getElementById('profile-level').textContent = s.level;
    document.getElementById('profile-xp').textContent = s.xp.toLocaleString('pt-BR');

    // Área grid dinâmica
    renderAreaGrid();

    // Atividade recente (últimos badges)
    renderRecentActivity();
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
        item.innerHTML = `
            <div class="review-q-header">
                <span class="review-q-tag">${q.tag || q.area}</span>
                <span class="review-q-date">${dateStr}</span>
            </div>
            <p class="review-q-text">${q.question}</p>
            <div class="review-answers">
                <div class="review-ans user-wrong">
                    <span class="review-ans-label">SEU</span>
                    <span class="review-ans-text">${letters[w.userAnswer]}. ${q.options[w.userAnswer] || '—'}</span>
                </div>
                <div class="review-ans correct-ans">
                    <span class="review-ans-label">CERTA</span>
                    <span class="review-ans-text">${letters[q.correct]}. ${q.options[q.correct] || '—'}</span>
                </div>
            </div>
            <button class="review-practice-btn" onclick="practiceDisc('${disc}')">
                🎯 Praticar esta disciplina
            </button>
        `;
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

function onboardingNext() {
    if (obStep === 1) {
        const name = document.getElementById('ob-name').value.trim();
        if (!name) {
            document.getElementById('ob-name').focus();
            document.getElementById('ob-name').style.borderColor = 'var(--red)';
            setTimeout(() => { document.getElementById('ob-name').style.borderColor = ''; }, 2000);
            return;
        }
        state.user.name = name;
        goToObStep(2);
    } else if (obStep === 2) {
        if (!obGoal) { obGoal = 'Rumo à Federal 🚀'; }
        state.user.goal = obGoal;
        goToObStep(3);
    } else if (obStep === 3) {
        const selected = [...document.querySelectorAll('.ob-subj-btn.selected')].map(b => b.dataset.subj);
        state.weakSubjects = selected;
        finishOnboarding();
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
}

function toggleSubj(btn) {
    btn.classList.toggle('selected');
}

function skipOnboarding() {
    finishOnboarding();
}

function finishOnboarding() {
    state.onboardingDone = true;
    if (!state.user.name || state.user.name === 'Alex') {
        const inputName = document.getElementById('ob-name').value.trim();
        if (inputName) state.user.name = inputName;
    }
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

    // Onboarding primeiro acesso
    // Pular se usuário já tem dados (migração do estado antigo)
    const isReturningUser = state.user.xp > 0 || (state.quizHistory && state.quizHistory.length > 0);
    if (!state.onboardingDone && !isReturningUser) {
        // Marcar como feito se for usuário antigo sem onboarding flag
        document.getElementById('screen-onboarding').classList.add('active');
        nav.style.display = 'none';
        state.currentScreen = 'onboarding';
        return;
    }
    if (isReturningUser && !state.onboardingDone) {
        state.onboardingDone = true;
    }

    // Show home screen
    document.getElementById('screen-home').classList.add('active');
    state.currentScreen = 'home';
    nav.style.display = 'flex';
    updateNavActive('home');
    renderDashboard();
    saveState();
}

document.addEventListener('DOMContentLoaded', init);

