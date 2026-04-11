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
    const textarea = document.getElementById('redacao-text');
    if (textarea) { textarea.value = ''; _updateRedacaoCounter.call(textarea); }
    const resultEl = document.getElementById('redacao-result');
    if (resultEl) resultEl.style.display = 'none';
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
        const EDGE_URL = 'https://nkuiwdolkluetsadauwb.supabase.co/functions/v1/corrigir-redacao';

        let result = null;

        // 1ª tentativa: Edge Function do servidor (chave central)
        try {
            // Garante sessão válida — no mobile ela pode expirar silenciosamente
            let { data: sessionData } = await supabase.auth.getSession().catch(() => ({ data: null }));
            if (!sessionData?.session?.access_token) {
                const { data: refreshed } = await supabase.auth.refreshSession().catch(() => ({ data: null }));
                sessionData = refreshed;
            }
            const authToken = sessionData?.session?.access_token ?? '';

            if (authToken) {
                // Timeout de 28s — evita requisição pendurada no mobile
                const edgeCtrl  = new AbortController();
                const edgeTimer = setTimeout(() => edgeCtrl.abort(), 28000);
                let res;
                try {
                    res = await fetch(EDGE_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                        body: JSON.stringify({ theme, text }),
                        signal: edgeCtrl.signal,
                    });
                } finally {
                    clearTimeout(edgeTimer);
                }

                if (res.ok) {
                    const body = await res.json().catch(() => null);
                    if (body?.c1) result = body;
                } else if (res.status === 403) {
                    // 403 = usuário não é premium — ÚNICO status que interrompe o fluxo
                    const body = await res.json().catch(() => ({}));
                    const gateErr = new Error(body?.error || 'Recurso exclusivo do plano Premium.');
                    gateErr._gate = true;
                    throw gateErr;
                }
                // 401, 429, 500, 502, 503, 404, timeout → cai no fallback Groq silenciosamente
            }
        } catch (edgeErr) {
            if (edgeErr._gate) throw edgeErr; // re-lança só o paywall
            console.warn('[redacao] Edge Function indisponível:', edgeErr.message, '— usando fallback Groq');
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

            const PROMPT = `Você é um corretor oficial credenciado do ENEM com 10 anos de experiência. Leia ATENTAMENTE a redação abaixo e corrija com rigor real — as notas devem refletir o texto específico enviado.

TEMA: "${theme}"

REDAÇÃO DO ALUNO:
${text}

INSTRUÇÕES por competência (notas em múltiplos de 40: 0, 40, 80, 120, 160 ou 200):
- C1 (Norma culta): identifique erros gramaticais, ortográficos ou de pontuação que aparecem no texto. Se houver erros graves ou frequentes, limite a nota a no máximo 120.
- C2 (Repertório e tema): o aluno fugiu do tema, tangenciou ou desenvolveu bem? Comente a qualidade e pertinência do repertório sociocultural usado.
- C3 (Argumentação): os argumentos são coerentes e progressivos? A tese está clara? Há contradições ou argumentos superficiais?
- C4 (Coesão): identifique os conectivos usados. O texto tem boa articulação entre parágrafos? Há repetições excessivas de palavras?
- C5 (Proposta de intervenção): a proposta contém os 5 elementos obrigatórios (ação + agente + modo/instrumento + efeito esperado + finalidade)? Respeita os direitos humanos?

Seja HONESTO e RIGOROSO. Redações diferentes devem receber notas diferentes — nunca repita automaticamente os mesmos valores. Mencione aspectos concretos do texto fornecido nos feedbacks.

Retorne APENAS JSON válido sem markdown:
{"c1":{"nota":NUMERO,"feedback":"feedback específico sobre esta redação"},"c2":{"nota":NUMERO,"feedback":"..."},"c3":{"nota":NUMERO,"feedback":"..."},"c4":{"nota":NUMERO,"feedback":"..."},"c5":{"nota":NUMERO,"feedback":"..."},"total":SOMA_DAS_5_NOTAS,"comentario_geral":"Análise geral desta redação específica, citando pontos fortes e fracos concretos encontrados no texto."}`;

            // Timeout de 28s — evita requisição pendurada no mobile
            const groqCtrl  = new AbortController();
            const groqTimer = setTimeout(() => groqCtrl.abort(), 28000);
            let groqRes;
            try {
                groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'user', content: PROMPT }],
                        temperature: 0.6,
                        max_tokens: 2000,
                    }),
                    signal: groqCtrl.signal,
                });
            } catch (netErr) {
                if (netErr.name === 'AbortError')
                    throw new Error('Tempo limite esgotado. Verifique sua conexão e tente novamente.');
                throw new Error('Sem conexão com a internet. Verifique sua rede e tente novamente.');
            } finally {
                clearTimeout(groqTimer);
            }

            if (groqRes.status === 401) throw new Error('Chave Groq inválida. Verifique e tente novamente.');
            if (groqRes.status === 429) throw new Error('Serviço de IA sobrecarregado. Aguarde 30 segundos e tente novamente.');
            if (groqRes.status >= 500) throw new Error('O serviço de IA está temporariamente fora do ar. Tente novamente em alguns minutos.');
            if (!groqRes.ok)           throw new Error(`Erro ${groqRes.status} na API de IA. Tente novamente.`);

            const groqData = await groqRes.json().catch(() => null);
            if (!groqData) throw new Error('Resposta da IA em formato inesperado. Tente novamente.');
            const raw = groqData.choices?.[0]?.message?.content || '';
            const m   = raw.match(/\{[\s\S]*\}/);
            if (!m) throw new Error('A IA retornou um formato inesperado. Tente novamente.');
            try {
                result = JSON.parse(m[0]);
            } catch {
                throw new Error('Não foi possível interpretar a resposta da IA. Tente novamente.');
            }
        }

        if (!result || !result.c1) throw new Error('Resposta inesperada da IA.');
        const keyWrap = document.getElementById('redacao-groq-key-wrap');
        if (keyWrap) keyWrap.style.display = 'none';

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
        const msg = err.message || 'Ocorreu um erro inesperado. Tente novamente.';
        // Mostra o erro na área de resultado (sem alert bloqueante)
        const resultEl = document.getElementById('redacao-result');
        if (resultEl) {
            resultEl.style.display = '';
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

    resultEl.style.display = '';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
