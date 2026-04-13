/* =====================================================
   ENEM MASTER — redacao.js
   Redação ENEM com correção por IA (5 competências)
   Depende de: state, saveState, navigate,
               planHas, showFeaturePaywall,
               getCurrentUser, saveUserData, trackEvent,
               _showQuickToast, renderRedacaoHistory
   ===================================================== */

'use strict';

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
    { label: 'Tecnologia',    theme: 'Impactos da inteligência artificial no mercado de trabalho brasileiro' },
    { label: 'Democracia',    theme: 'Fake news e o enfraquecimento da democracia no Brasil' },
    { label: 'Meio Ambiente', theme: 'A crise climática e a responsabilidade do Brasil na transição energética' },
    { label: 'Saúde Mental',  theme: 'Saúde mental de jovens e adolescentes na era das redes sociais' },
    { label: 'Desigualdade',  theme: 'Exclusão digital como barreira ao desenvolvimento social no Brasil' },
    { label: 'Política',      theme: 'A polarização política e o papel das redes sociais no Brasil contemporâneo' },
    { label: 'Trabalho',      theme: 'Uberização do trabalho e a precarização dos direitos trabalhistas no Brasil' },
    { label: 'Educação',      theme: 'Evasão escolar no ensino médio e seus impactos sociais' },
    { label: 'Saúde Pública', theme: 'Obesidade infantil como problema de saúde pública no Brasil' },
    { label: 'Segurança',     theme: 'Feminicídio e as falhas no sistema de proteção à mulher no Brasil' },
    { label: 'Meio Ambiente', theme: 'Desmatamento da Amazônia e soberania nacional frente à pressão internacional' },
    { label: 'Tecnologia',    theme: 'Vício em smartphones e os impactos na saúde mental dos adolescentes' },
    { label: 'Habitação',     theme: 'Crise habitacional nas grandes cidades e o crescimento das periferias no Brasil' },
    { label: 'Saúde',         theme: 'Automedicação e os riscos da desinformação sobre saúde nas redes sociais' },
    { label: 'Educação',      theme: 'Educação financeira como ferramenta de redução da desigualdade no Brasil' },
    { label: 'Racismo',       theme: 'Racismo algorítmico e discriminação digital no Brasil' },
    { label: 'Segurança',     theme: 'Violência nas escolas e o papel do Estado na segurança educacional' },
    { label: 'Economia',      theme: 'Insegurança alimentar e o aumento da fome nas famílias brasileiras' },
    { label: 'Tecnologia',    theme: 'Deepfakes e os riscos da manipulação digital para a sociedade brasileira' },
    { label: 'Direitos',      theme: 'A superexposição de crianças nas redes sociais e o direito ao esquecimento' },
    { label: 'Saúde',         theme: 'O negacionismo científico e seus efeitos na saúde pública brasileira' },
    { label: 'Trabalho',      theme: 'Home office e os novos desafios para a saúde física e mental dos trabalhadores' },
    { label: 'Meio Ambiente', theme: 'Tragédias climáticas no Brasil e a urgência de políticas de adaptação urbana' },
    { label: 'Cidadania',     theme: 'O dever cívico do voto e a crise de representatividade política no Brasil' },
];

const COMPETENCIAS = [
    { id: 'c1', label: 'Competência 1', desc: 'Domínio da norma culta da língua escrita' },
    { id: 'c2', label: 'Competência 2', desc: 'Compreensão da proposta e uso de repertório' },
    { id: 'c3', label: 'Competência 3', desc: 'Seleção, organização e interpretação de informações' },
    { id: 'c4', label: 'Competência 4', desc: 'Mecanismos linguísticos e coesão textual' },
    { id: 'c5', label: 'Competência 5', desc: 'Proposta de intervenção respeitando os direitos humanos' },
];

let currentThemeIdx       = 0;
let currentActualThemeIdx = 0;
let currentThemeCategory  = 'enem'; // 'enem' | 'atual'

function switchThemeTab(category) {
    currentThemeCategory = category;
    document.querySelectorAll('.rt-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === category);
    });
    _updateThemeDisplay();
    const textarea = document.getElementById('redacao-text');
    if (textarea) { textarea.value = ''; _updateRedacaoCounter.call(textarea); }
    const resultEl = document.getElementById('redacao-result');
    if (resultEl) resultEl.style.display = 'none';
}

function renderRedacao() {
    if (!planHas('redacaoIA')) {
        navigate('quiz-setup');
        showFeaturePaywall('redacaoIA');
        return;
    }

    currentThemeCategory = 'enem';
    document.querySelectorAll('.rt-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === 'enem');
    });

    _updateThemeDisplay();

    const resultEl = document.getElementById('redacao-result');
    if (resultEl) resultEl.style.display = 'none';

    const textarea = document.getElementById('redacao-text');
    if (textarea) {
        textarea.addEventListener('input', _updateRedacaoCounter);
        _updateRedacaoCounter.call(textarea);
    }

    renderRedacaoHistory();
}

function _updateThemeDisplay() {
    const labelEl = document.getElementById('rt-label');
    const yearEl  = document.getElementById('rt-year');
    const themeEl = document.getElementById('rt-theme');
    if (currentThemeCategory === 'enem') {
        const t = ENEM_THEMES[currentThemeIdx];
        if (labelEl) labelEl.textContent = 'TEMA ENEM';
        if (yearEl)  yearEl.textContent  = `ENEM ${t.year}`;
        if (themeEl) themeEl.textContent = t.theme;
    } else {
        const t = CURRENT_THEMES[currentActualThemeIdx];
        if (labelEl) labelEl.textContent = 'TEMA ATUAL';
        if (yearEl)  yearEl.textContent  = t.label;
        if (themeEl) themeEl.textContent = t.theme;
    }
}

function _updateRedacaoCounter() {
    const text  = this.value || document.getElementById('redacao-text').value;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const wEl   = document.getElementById('redacao-word-count');
    const cEl   = document.getElementById('redacao-char-count');
    if (wEl) {
        wEl.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
        wEl.style.color = words >= 250 ? 'var(--teal)' : words >= 150 ? 'var(--orange)' : 'var(--red)';
    }
    if (cEl) cEl.textContent = `${chars}/3000 caracteres`;
}

function drawNewTheme() {
    if (currentThemeCategory === 'enem') {
        currentThemeIdx = (currentThemeIdx + 1) % ENEM_THEMES.length;
    } else {
        currentActualThemeIdx = (currentActualThemeIdx + 1) % CURRENT_THEMES.length;
    }
    _updateThemeDisplay();
    const textarea = document.getElementById('redacao-text');
    if (textarea) { textarea.value = ''; _updateRedacaoCounter.call(textarea); }
    const resultEl = document.getElementById('redacao-result');
    if (resultEl) resultEl.style.display = 'none';
}

// ── Obtém userId do state ou do localStorage como fallback ──────────────────
function _getRedacaoUserId() {
    // 1. state em memória (caminho normal)
    if (state?.user?.id && state.user.id.length >= 30) return state.user.id;

    // 2. Fallback: lê direto do localStorage (mobile PWA pode resetar state em memória)
    try {
        const raw = localStorage.getItem('enem_state');
        if (raw) {
            const saved = JSON.parse(raw);
            const id = saved?.user?.id;
            if (id && id.length >= 30) return id;
        }
    } catch { /* noop */ }

    // 3. Fallback Supabase: lê sessão salva no localStorage pelo SDK
    try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') && k.includes('auth-token'));
        for (const key of keys) {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const parsed = JSON.parse(raw);
            const id =
                parsed?.user?.id ||
                parsed?.currentSession?.user?.id ||
                parsed?.session?.user?.id;
            if (id && id.length >= 30) return id;
        }
    } catch { /* noop */ }

    return null;
}

async function _callCorrigirEdge(userId, theme, text, attempt) {
    attempt = attempt || 1;
    const EDGE_URL = 'https://nkuiwdolkluetsadauwb.supabase.co/functions/v1/corrigir-redacao';
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 35000);
    let res;
    try {
        const anonKey = (typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY) ? SUPABASE_ANON_KEY : '';
        res = await fetch(EDGE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(anonKey ? { apikey: anonKey } : {}),
            },
            body: JSON.stringify({ theme, text, userId }),
            signal: ctrl.signal,
        });
    } catch (netErr) {
        clearTimeout(timer);
        if (netErr.name === 'AbortError') {
            if (attempt < 2) return _callCorrigirEdge(userId, theme, text, 2);
            throw new Error('Tempo limite esgotado. Verifique sua conexão e tente novamente.');
        }
        throw new Error('Sem conexão com a internet. Verifique sua rede e tente novamente.');
    }
    clearTimeout(timer);

    if (res.ok) {
        const body = await res.json().catch(() => null);
        if (body?.c1) return body;
        throw new Error('Resposta inesperada da IA. Tente novamente.');
    }

    // 401 → perfil não encontrado (userId inválido ou não logado)
    if (res.status === 401) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Sessão expirada. Saia e entre novamente na sua conta.');
    }

    // 403 → paywall
    if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        const err  = new Error(body?.error || 'Recurso exclusivo do plano Premium.');
        err._gate  = true;
        throw err;
    }

    // 429 → rate limit
    if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Limite diário de correções atingido. Volte amanhã!');
    }

    // 5xx → retenta uma vez
    if (res.status >= 500 && attempt < 2) {
        await new Promise(r => setTimeout(r, 1500));
        return _callCorrigirEdge(userId, theme, text, 2);
    }

    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Erro ${res.status}. Tente novamente.`);
}

async function submitEssay() {
    if (!planHas('redacaoIA')) {
        showFeaturePaywall('redacaoIA');
        return;
    }
    const text  = (document.getElementById('redacao-text').value || '').trim();
    const theme = currentThemeCategory === 'enem'
        ? ENEM_THEMES[currentThemeIdx].theme
        : CURRENT_THEMES[currentActualThemeIdx].theme;

    if (text.length < 100) {
        alert('Escreva pelo menos 100 caracteres antes de enviar.');
        return;
    }

    const btn = document.getElementById('redacao-submit-btn');
    btn.disabled    = true;
    btn.textContent = '⏳ Corrigindo com IA...';

    try {
        // Obtém userId do state ou localStorage (funciona mesmo com JWT expirado no mobile)
        const userId = _getRedacaoUserId();
        if (!userId) {
            throw new Error('Você precisa estar logado para corrigir redações. Faça login e tente novamente.');
        }

        const result = await _callCorrigirEdge(userId, theme, text);

        _displayEssayResult(result);

        if (!state.redacaoHistory) state.redacaoHistory = [];
        state.redacaoHistory.push({
            date: new Date().toISOString(), theme, total: result.total,
            notas: { c1: result.c1.nota, c2: result.c2.nota, c3: result.c3.nota, c4: result.c4.nota, c5: result.c5.nota },
        });
        const xpRedacao = Math.round((result.total / 1000) * 200);
        state.user.xp   += xpRedacao;
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
        // 403 Premium gate → abre paywall
        if (err._gate) {
            showFeaturePaywall('redacaoIA');
            return;
        }
        const msg = err.message || 'Ocorreu um erro inesperado. Tente novamente.';
        // Mostra o erro na área de resultado (sem alert bloqueante)
        const resultEl = document.getElementById('redacao-result');
        if (resultEl) {
            resultEl.style.display = 'flex';
            resultEl.innerHTML = `<div style="color:#ef4444;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:20px;text-align:center;font-size:15px;font-weight:600;line-height:1.5">❌ ${msg}</div>`;
            resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (typeof _showQuickToast === 'function') {
            _showQuickToast(`❌ ${msg}`);
        } else {
            alert(`❌ ${msg}`);
        }
    } finally {
        btn.disabled    = false;
        btn.textContent = '🤖 Corrigir com IA';
    }
}

function _displayEssayResult(result) {
    const resultEl  = document.getElementById('redacao-result');
    const compEl    = document.getElementById('redacao-competencias');
    const totalEl   = document.getElementById('redacao-total');
    const commentEl = document.getElementById('redacao-comment');

    if (!resultEl || !compEl) return;

    compEl.innerHTML = '';
    COMPETENCIAS.forEach(c => {
        const item = result[c.id];
        if (!item) return;
        const nota  = item.nota;
        const pct   = (nota / 200) * 100;
        const color = nota >= 160 ? 'var(--teal)' : nota >= 120 ? 'var(--orange)' : nota >= 80 ? '#f5c518' : 'var(--red)';
        const card  = document.createElement('div');
        card.className = 'comp-card';

        const cardHeader = document.createElement('div');
        cardHeader.className = 'comp-header';
        const cardInfo = document.createElement('div');
        const labelEl = document.createElement('p');
        labelEl.className   = 'comp-label';
        labelEl.textContent = c.label;
        const descEl = document.createElement('p');
        descEl.className   = 'comp-desc';
        descEl.textContent = c.desc;
        cardInfo.appendChild(labelEl);
        cardInfo.appendChild(descEl);
        const notaEl = document.createElement('span');
        notaEl.className   = 'comp-nota';
        notaEl.style.color = color;
        notaEl.textContent = nota;
        cardHeader.appendChild(cardInfo);
        cardHeader.appendChild(notaEl);

        const barWrap = document.createElement('div');
        barWrap.className = 'comp-bar-wrap';
        const bar = document.createElement('div');
        bar.className        = 'comp-bar';
        bar.style.width      = pct + '%';
        bar.style.background = color;
        barWrap.appendChild(bar);

        const feedbackEl = document.createElement('p');
        feedbackEl.className   = 'comp-feedback';
        feedbackEl.textContent = item.feedback;

        card.appendChild(cardHeader);
        card.appendChild(barWrap);
        card.appendChild(feedbackEl);
        compEl.appendChild(card);
    });

    const total      = result.total || COMPETENCIAS.reduce((s, c) => s + (result[c.id]?.nota || 0), 0);
    const totalColor = total >= 800 ? 'var(--teal)' : total >= 600 ? 'var(--orange)' : total >= 400 ? '#f5c518' : 'var(--red)';
    if (totalEl)   { totalEl.textContent = total; totalEl.style.color = totalColor; }
    if (commentEl) commentEl.textContent = result.comentario_geral || '';

    resultEl.style.display = 'flex';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
