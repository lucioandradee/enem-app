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
            ${msg.role === 'assistant' ? '<span class="tutor-msg-avatar">🤖</span>' : ''}
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
    const sug  = _getTutorSuggestions();
    return `
        <div class="tutor-welcome">
            <div class="tutor-welcome-icon">🤖</div>
            <h3 class="tutor-welcome-title">Olá, ${name}! Sou seu Professor IA</h3>
            <p class="tutor-welcome-sub">Especialista em todas as disciplinas do ENEM. Tire suas dúvidas, peça explicações ou peça resumos — estou aqui 24h.</p>
            <div class="tutor-suggestions" id="tutor-suggestions">
                ${sug.map(s => `<button class="tutor-sug-btn" onclick="sendTutorMessage(${JSON.stringify(s)})">${s}</button>`).join('')}
            </div>
        </div>
    `;
}

function _getTutorSuggestions() {
    // Personaliza sugestões baseado nas matérias fracas do onboarding
    const weak = state.weakSubjects || [];
    const seed = new Date().getDay();
    const shuffled = [...TUTOR_SUGGESTIONS].sort((_, b) => (seed * b.length) % 3 - 1);
    return shuffled.slice(0, 4);
}

function _setupTutorInput() {
    const input = document.getElementById('tutor-input');
    if (!input) return;

    // Enter para enviar (Shift+Enter = nova linha)
    input.addEventListener('keydown', function handler(e) {
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
    _renderTutorMessages();

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
        <span class="tutor-msg-avatar">🤖</span>
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
