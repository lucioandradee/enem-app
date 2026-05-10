/* =====================================================
   ENEM MASTER — tutor-ia.js
   Chat com Tutor IA (Groq Llama 3.3 70B)
   Depende de: state, isPremium, navigate, SUPABASE_URL,
               SUPABASE_ANON_KEY, supabase, getCurrentUser
   ===================================================== */

'use strict';

const TUTOR_EDGE_URL = 'https://nkuiwdolkluetsadauwb.supabase.co/functions/v1/tutor-ia';

// ── Estado do chat ───────────────────────────────────────────────────────────
let _tutorHistory = [];          // [{ role:'user'|'assistant', content }]
let _tutorLoading = false;
let _tutorInputBound = false;    // evita registrar listeners duplicados

const TUTOR_HISTORY_KEY = 'enem_tutor_history';
const TUTOR_HISTORY_MAX = 40;    // mensagens máximas persistidas

function _loadTutorHistory() {
    try {
        const raw = localStorage.getItem(TUTOR_HISTORY_KEY);
        if (raw) _tutorHistory = JSON.parse(raw);
    } catch { _tutorHistory = []; }
}

function _saveTutorHistory() {
    try {
        const trimmed = _tutorHistory.slice(-TUTOR_HISTORY_MAX);
        localStorage.setItem(TUTOR_HISTORY_KEY, JSON.stringify(trimmed));
    } catch { /* storage cheio: ignora */ }
}

function clearTutorHistory() {
    _tutorHistory = [];
    try { localStorage.removeItem(TUTOR_HISTORY_KEY); } catch { /* noop */ }
    _renderTutorMessages();
}

// ── Sugestões de abertura por disciplina ─────────────────────────────────────
const TUTOR_SUGGESTIONS = [
    'Como resolver equações de 2º grau no ENEM?',
    'Explica a Lei de Mendel de forma simples',
    'Quais são as competências da redação ENEM?',
    'O que cai em Geopolítica no ENEM?',
    'Como calcular probabilidade?',
    'Resumo da Segunda Guerra Mundial para o ENEM',
    'Dicas para interpretar charges e tirinhas',
    'Como funciona o Princípio da Incerteza de Heisenberg?',
];

// ── Render principal ─────────────────────────────────────────────────────────
function renderTutorIA() {
    if (!isPremium()) {
        showFeaturePaywall('tutor');
        navigate('home');
        return;
    }
    if (_tutorHistory.length === 0) _loadTutorHistory();
    _renderTutorMessages();
    _setupTutorInput();
    _focusTutorInput();
}

function _renderTutorMessages() {
    const container = document.getElementById('tutor-messages');
    if (!container) return;

    if (_tutorHistory.length === 0) {
        container.innerHTML = _renderTutorWelcome();
        return;
    }

    container.innerHTML = _tutorHistory.map(msg => `
        <div class="tutor-msg tutor-msg-${msg.role}">
            ${msg.role === 'assistant' ? '<span class="tutor-msg-avatar">IA</span>' : ''}
            <div class="tutor-msg-bubble">${_tutorFormatText(msg.content)}</div>
        </div>
    `).join('');

    // Scroll para o fim
    requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
    });
}

function _renderTutorWelcome() {
    const name = (state.user.name || 'Estudante').split(' ')[0];
    return `
        <div class="tutor-empty-state">
            <div class="tutor-empty-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
            </div>
            <p class="tutor-empty-greeting">Olá, <strong>${name}</strong></p>
            <p class="tutor-empty-sub">Qual assunto quer dominar hoje?<br>Escolha uma matéria acima ou escreva sua dúvida.</p>
        </div>
    `;
}

function _getTutorSuggestions() {
    // Personaliza sugestões baseado nas matérias fracas do onboarding
    const weak = state.weakSubjects || [];
    // Embaralhar com Fisher-Yates usando semente baseada na data do dia
    const arr = [...TUTOR_SUGGESTIONS];
    const seed = new Date().toDateString(); // muda por dia
    let h = 0;
    for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
    let rng = Math.abs(h);
    for (let i = arr.length - 1; i > 0; i--) {
        rng = (rng * 1664525 + 1013904223) >>> 0;
        const j = rng % (i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 4);
}

function _setupTutorInput() {
    const input = document.getElementById('tutor-input');
    if (!input) return;

    // Evita listeners duplicados ao revisitar a tela
    if (_tutorInputBound) return;
    _tutorInputBound = true;

    // Enter para enviar (Shift+Enter = nova linha)
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitTutorMessage();
        }
    });

    // Auto-resize
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

function _focusTutorInput() {
    setTimeout(() => {
        const input = document.getElementById('tutor-input');
        if (input) input.focus();
    }, 300);
}

// ── Envio de mensagem ─────────────────────────────────────────────────────────
function submitTutorMessage() {
    const input = document.getElementById('tutor-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    sendTutorMessage(text);
}

async function sendTutorMessage(text) {
    if (_tutorLoading) return;
    if (!text || text.length > 1000) return;

    if (!isPremium()) {
        showFeaturePaywall('tutor');
        return;
    }

    // Esconde sugestões na 1ª mensagem
    const sugEl = document.getElementById('tutor-suggestions');
    if (sugEl) sugEl.style.display = 'none';

    // Adiciona mensagem do usuário
    _tutorHistory.push({ role: 'user', content: text });
        _saveTutorHistory();
    // Mostra loading
    _tutorLoading = true;
    _showTutorLoading();
    _updateTutorSendBtn(true);

    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const resp = await fetch(TUTOR_EDGE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                userId: user.id,
                messages: _tutorHistory.slice(-20), // últimas 20 msgs
            }),
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${resp.status}`);
        }

        const json = await resp.json();
        const reply = json.reply || json.content || json.message || '';
        if (!reply) throw new Error('Resposta vazia do tutor');

        _tutorHistory.push({ role: 'assistant', content: reply });
        _saveTutorHistory();
        _renderTutorMessages();

        // Track evento
        _trackTutorEvent('tutor_message_sent', { msgCount: _tutorHistory.length });

    } catch (e) {
        console.error('❌ Tutor IA:', e.message);
        _tutorHistory.push({
            role: 'assistant',
            content: e.message.includes('autenticado')
                ? 'Você precisa estar logado para usar o Tutor IA.'
                : 'Desculpe, houve um erro ao processar sua pergunta. Tente novamente em instantes.',
        });
        _saveTutorHistory();
        _renderTutorMessages();
    } finally {
        _tutorLoading = false;
        _hideTutorLoading();
        _updateTutorSendBtn(false);
        _focusTutorInput();
    }
}

function _showTutorLoading() {
    const container = document.getElementById('tutor-messages');
    if (!container) return;
    const loader = document.createElement('div');
    loader.id = 'tutor-loading-msg';
    loader.className = 'tutor-msg tutor-msg-assistant';
    loader.innerHTML = `
        <span class="tutor-msg-avatar">IA</span>
        <div class="tutor-msg-bubble tutor-msg-loading">
            <span class="tutor-dot"></span>
            <span class="tutor-dot"></span>
            <span class="tutor-dot"></span>
        </div>
    `;
    container.appendChild(loader);
    container.scrollTop = container.scrollHeight;
}

function _hideTutorLoading() {
    document.getElementById('tutor-loading-msg')?.remove();
}

function _updateTutorSendBtn(loading) {
    const btn = document.getElementById('tutor-send-btn');
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
}

// ── Limpar histórico ──────────────────────────────────────────────────────────
function clearTutorHistory() {
    _tutorHistory = [];
    _renderTutorMessages();
}

// ── Formatar texto (markdown simples) ─────────────────────────────────────────
function _tutorFormatText(text) {
    // Escapa HTML primeiro
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return escaped
        // Negrito: **texto**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Itálico: *texto*
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Código inline: `code`
        .replace(/`([^`]+)`/g, '<code style="background:rgba(0,180,166,.15);padding:2px 6px;border-radius:4px;font-size:.9em">$1</code>')
        // Quebras de linha
        .replace(/\n/g, '<br>')
        // Listas simples (- item)
        .replace(/^- (.+)$/gm, '• $1');
}

// ── Analytics ─────────────────────────────────────────────────────────────────
function _trackTutorEvent(event, props) {
    if (typeof trackEvent === 'function') {
        trackEvent(event, props).catch(() => {});
    }
}
