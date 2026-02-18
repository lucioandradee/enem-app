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
        level: 15,
        xp: 2450,
        streak: 15,
        goal: 'Rumo à Federal 🚀',
    },
    progress: {
        humanas: 75, natureza: 60, linguagens: 85, matematica: 50,
        questoesHoje: 4, totalHoje: 10,
        totalCorretas: 850,
    },
    badges: {
        ofensiva: ['inicio_feroz', 'semana_ouro', 'constante'],
        especialista: ['genio_redacao', 'rei_natureza'],
        maratonista: ['100_questoes'],
    },
    notifications: [
        { id: 1, type: 'blue', icon: '📝', title: 'Simulado disponível', body: 'Novo Simulado: Ciências da Natureza já está aberto para você. Prepare-se e comece agora!', time: '6h', unread: true, cta: 'Fazer Simulado', ctaAction: 'startQuiz', date: 'today' },
        { id: 2, type: 'orange', icon: '📊', title: 'Ranking Semanal', body: 'Eita! João Silva ultrapassou você no Ranking. Volte aos estudos para recuperar sua posição!', time: '1h', unread: true, date: 'today' },
        { id: 3, type: 'purple', icon: '🏅', title: 'Nova Conquista', body: 'Parabéns! Você desbloqueou o badge "Mestre da Redação" por 5 notas acima de 900.', time: '3h', unread: true, date: 'today' },
        { id: 4, type: 'green', icon: '📅', title: 'Lembrete de Estudo', body: 'Hora do Estudo: Seguindo seu cronograma, agora é vez de Matemática (Funções).', time: '6h', unread: false, date: 'today' },
        { id: 5, type: 'yellow', icon: '🔥', title: 'Maratona 7 Dias', body: 'Incrível! Você manteve seu ritmo de estudos por uma semana inteira.', time: 'Ontem', unread: false, date: 'yesterday' },
    ],
    currentScreen: 'home',
};

let state = JSON.parse(localStorage.getItem('enem_state') || 'null') || JSON.parse(JSON.stringify(defaultState));

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
};

// =====================================================
// NAVIGATION / ROUTER
// =====================================================
const screenMap = {
    home: 'screen-home',
    quiz: 'screen-quiz',
    result: 'screen-result',
    ranking: 'screen-ranking',
    achievements: 'screen-achievements',
    profile: 'screen-profile',
    settings: 'screen-settings',
    support: 'screen-support',
    notifications: 'screen-notifications',
};

const screensWithNav = ['home', 'ranking', 'achievements', 'profile'];
const screensWithoutNav = ['quiz', 'result', 'settings', 'support', 'notifications'];

function navigate(screenName) {
    const currentId = screenMap[state.currentScreen];
    const nextId = screenMap[screenName];
    if (!nextId || currentId === nextId) return;

    const currentEl = document.getElementById(currentId);
    const nextEl = document.getElementById(nextId);

    // Stop quiz timer if leaving quiz
    if (state.currentScreen === 'quiz') stopTimer();

    currentEl.classList.remove('active');
    currentEl.classList.add('slide-out');
    setTimeout(() => currentEl.classList.remove('slide-out'), 300);

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
        default: break;
    }
}

// =====================================================
// DASHBOARD
// =====================================================
function renderDashboard() {
    const s = state.user;
    document.getElementById('dash-name').textContent = s.name.split(' ')[0];
    document.getElementById('dash-level').textContent = s.level;
    document.getElementById('dash-xp').textContent = s.xp.toLocaleString('pt-BR');
    document.getElementById('dash-streak').textContent = s.streak + ' Dias';
    document.getElementById('dash-avatar').textContent = s.name[0].toUpperCase();

    // Unread notifications count
    const unread = state.notifications.filter(n => n.unread).length;
    const badge = document.getElementById('notif-count');
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';

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
        const hasDot = i < 3; // mock: first 3 days have activity

        const btn = document.createElement('button');
        btn.className = 'day-btn' + (isToday ? ' today' : '') + (hasDot ? ' has-dot' : '');
        btn.innerHTML = `<span class="day-name">${days[i]}</span><span class="day-num">${d.getDate()}</span>`;
        container.appendChild(btn);
    }
}

const todaySubjects = [
    { area: 'CIÊNCIAS DA NATUREZA', icon: '🧬', title: 'Biologia: Genética', sub: 'Leis de Mendel e Heredogramas' },
    { area: 'MATEMÁTICA', icon: '➗', title: 'Funções do 2º Grau', sub: 'Bhaskara e Vértice da Parábola' },
    { area: 'LINGUAGENS', icon: '✍️', title: 'Redação ENEM', sub: 'Proposta de Intervenção' },
    { area: 'CIÊNCIAS HUMANAS', icon: '🌍', title: 'Geopolítica Contemporânea', sub: 'Globalização e Blocos Econômicos' },
];

function renderTodayCard() {
    const dayIdx = new Date().getDay() % todaySubjects.length;
    const subj = todaySubjects[dayIdx];
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
// QUIZ ENGINE
// =====================================================
function startQuiz() {
    // Pick 10 random questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    quizState.questions = shuffled.slice(0, 10);
    quizState.currentIndex = 0;
    quizState.correct = 0;
    quizState.wrong = 0;
    quizState.selectedOption = null;
    quizState.confirmed = false;
    quizState.timeLeft = 12 * 60 + 45; // 12:45
    quizState.totalTime = quizState.timeLeft;

    navigate('quiz');
    renderQuestion();
    startTimer();
}

function renderQuestion() {
    const q = quizState.questions[quizState.currentIndex];
    const total = quizState.questions.length;
    const idx = quizState.currentIndex;

    // Header
    document.getElementById('quiz-area-label').textContent = q.area;
    document.getElementById('quiz-q-count').textContent = `Questão ${idx + 1} de ${total}`;
    document.getElementById('quiz-progress-bar').style.width = ((idx / total) * 100) + '%';

    // Content
    document.getElementById('quiz-tag').textContent = q.tag;
    document.getElementById('quiz-question').textContent = q.question;

    const quoteEl = document.getElementById('quiz-quote');
    quoteEl.textContent = q.quote || '';

    // Options
    const optionsEl = document.getElementById('quiz-options');
    optionsEl.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E'];
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span class="option-text">${opt}</span>`;
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

    // Update today's progress
    state.progress.questoesHoje = Math.min(state.progress.questoesHoje + total, state.progress.totalHoje);
    state.user.xp += xpGained;
    saveState();

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
        hintBox.textContent = '💡 ' + q.hint;
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

    const todayItems = state.notifications.filter(n => n.date === 'today' && (!unreadOnly || n.unread));
    const yesterdayItems = state.notifications.filter(n => n.date === 'yesterday' && (!unreadOnly || n.unread));

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
      ${n.cta ? `<span class="notif-cta" onclick="${n.ctaAction}()">${n.cta}</span>` : ''}
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
// INIT
// =====================================================
function init() {
    // Set initial screen
    const nav = document.getElementById('bottom-nav');
    if (screensWithoutNav.includes(state.currentScreen)) {
        nav.style.display = 'none';
        state.currentScreen = 'home'; // Reset to home on reload
    }

    // Show home screen
    document.getElementById('screen-home').classList.add('active');
    state.currentScreen = 'home';
    updateNavActive('home');
    renderDashboard();
}

document.addEventListener('DOMContentLoaded', init);
