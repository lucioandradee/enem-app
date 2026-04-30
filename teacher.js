// =====================================================
// DASHBOARD DO PROFESSOR — B2B2C
// =====================================================

function renderTeacherDashboard() {
    const body = document.getElementById('teacher-dashboard-body');
    if (!body) return;

    const code = _getOrCreateClassCode();
    const students = _loadClassStudents();

    body.innerHTML = `
        <!-- Código de convite -->
        <div class="teacher-invite-card">
            <div class="teacher-invite-left">
                <p class="teacher-invite-label">CÓDIGO DA TURMA</p>
                <p class="teacher-invite-code" id="teacher-class-code">${code}</p>
                <p class="teacher-invite-hint">Compartilhe com seus alunos para conectar a turma</p>
            </div>
            <button class="teacher-copy-btn" onclick="copyClassCode()">Copiar</button>
        </div>

        <!-- Stats da turma -->
        <div class="teacher-stats-row" id="teacher-stats-row">
            ${_renderTeacherStats(students)}
        </div>

        <!-- Lista de alunos -->
        <div class="settings-section" style="margin-top:4px">
            <div class="settings-section-title">• Alunos da Turma (${students.length})</div>
            ${students.length === 0
                ? `<div class="teacher-empty">
                    <p>Nenhum aluno conectado ainda.</p>
                    <p style="font-size:11px;margin-top:4px">Peça aos alunos que entrem em Configurações → Código de Turma e digitem <strong>${code}</strong></p>
                   </div>`
                : `<div class="teacher-student-list">${students.map(_renderStudentRow).join('')}</div>`
            }
        </div>

        <!-- At-risk -->
        ${_renderAtRiskSection(students)}

        <!-- Join as student -->
        <div class="settings-section">
            <div class="settings-section-title">• Sou aluno — entrar em uma turma</div>
            <div class="settings-field">
                <label for="input-class-code">CÓDIGO DA TURMA DO PROFESSOR</label>
                <input type="text" id="input-class-code" placeholder="Ex: MAT2024" style="text-transform:uppercase" maxlength="10" />
            </div>
            <button class="cta-btn" style="margin-top:10px" onclick="joinClass()">Entrar na Turma</button>
            <p id="join-class-msg" style="font-size:12px;margin-top:6px;color:var(--accent)"></p>
        </div>
    `;
}

function _getOrCreateClassCode() {
    if (state.user.classCode) return state.user.classCode;
    const uid = state.user.id || state.user.email || 'user';
    const code = (uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4) + Math.floor(1000 + Math.random() * 9000)).toUpperCase();
    state.user.classCode = code;
    saveState();
    return code;
}

function _loadClassStudents() {
    return state.user.classStudents || [];
}

function _renderTeacherStats(students) {
    if (students.length === 0) {
        return `<div class="teacher-stat-card"><span class="ts-num">0</span><span class="ts-label">Alunos</span></div>
                <div class="teacher-stat-card"><span class="ts-num">—</span><span class="ts-label">Acerto Médio</span></div>
                <div class="teacher-stat-card"><span class="ts-num">—</span><span class="ts-label">Ativos Hoje</span></div>`;
    }
    const avgAcc = students.length > 0
        ? Math.round(students.reduce((s, st) => s + (st.accuracy || 0), 0) / students.length)
        : 0;
    const today = new Date().toDateString();
    const activeToday = students.filter(st => st.lastActive && new Date(st.lastActive).toDateString() === today).length;
    return `
        <div class="teacher-stat-card"><span class="ts-num">${students.length}</span><span class="ts-label">Alunos</span></div>
        <div class="teacher-stat-card"><span class="ts-num">${avgAcc}%</span><span class="ts-label">Acerto Médio</span></div>
        <div class="teacher-stat-card"><span class="ts-num">${activeToday}</span><span class="ts-label">Ativos Hoje</span></div>`;
}

function _renderStudentRow(st) {
    const now = new Date();
    const last = st.lastActive ? new Date(st.lastActive) : null;
    const daysSince = last ? Math.floor((now - last) / (1000 * 60 * 60 * 24)) : 999;
    const risk = daysSince >= 3;
    const statusColor = risk ? '#ef4444' : '#22c55e';
    const statusText  = risk ? `${daysSince}d sem estudar` : 'Ativo';
    return `
    <div class="teacher-student-row">
        <div class="ts-avatar">${(st.name || '?')[0].toUpperCase()}</div>
        <div class="ts-info">
            <p class="ts-name">${st.name || 'Aluno'}</p>
            <p class="ts-sub">${st.questoes || 0} questões · ${st.accuracy || 0}% acerto</p>
        </div>
        <span class="ts-status" style="color:${statusColor}">${statusText}</span>
    </div>`;
}

function _renderAtRiskSection(students) {
    const atRisk = students.filter(st => {
        const daysSince = st.lastActive
            ? Math.floor((new Date() - new Date(st.lastActive)) / (1000 * 60 * 60 * 24))
            : 999;
        return daysSince >= 3;
    });
    if (atRisk.length === 0) return '';
    return `
    <div class="settings-section" style="margin-top:4px;border-color:rgba(239,68,68,.2)">
        <div class="settings-section-title" style="color:#ef4444">⚠️ Alunos em Risco (${atRisk.length})</div>
        <p class="settings-section-sub">Esses alunos estão há 3+ dias sem estudar.</p>
        <div class="teacher-student-list">${atRisk.map(_renderStudentRow).join('')}</div>
    </div>`;
}

function copyClassCode() {
    const code = state.user.classCode || _getOrCreateClassCode();
    const text = `Entre no ENEM Master e use o código de turma: ${code}\nBaixe grátis em enem.app`;
    navigator.clipboard?.writeText(text).then(() => {
        _showQuickToast('📋 Código copiado! Envie para seus alunos.');
    }).catch(() => {
        _showQuickToast('Código: ' + code);
    });
}

function joinClass() {
    const input = document.getElementById('input-class-code');
    const msg   = document.getElementById('join-class-msg');
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();
    if (!code || code.length < 4) {
        msg.style.color = '#ef4444';
        msg.textContent = 'Digite um código válido.';
        return;
    }

    state.user.enrolledClassCode = code;
    saveState();

    if (typeof saveUserData !== 'undefined' && state.user.id) {
        saveUserData(state.user.id).catch(() => {});
    }

    msg.style.color = 'var(--accent)';
    msg.textContent = '✅ Você entrou na turma! Seu progresso será visível para o professor.';
    input.value = '';
}

function subscribeWhatsApp() {
    const input    = document.getElementById('input-wa-phone');
    const statusEl = document.getElementById('wa-status');
    const btn      = document.getElementById('wa-subscribe-btn');
    if (!input || !statusEl) return;

    const raw   = input.value.replace(/\D/g, '');
    const phone = raw.startsWith('55') ? raw : '55' + raw;

    if (phone.length < 12) {
        statusEl.style.color = '#ef4444';
        statusEl.textContent = 'Digite um número válido com DDD.';
        return;
    }

    state.user.whatsappPhone = phone;
    state.user.whatsappActive = true;
    saveState();

    if (typeof saveUserData !== 'undefined' && state.user.id) {
        saveUserData(state.user.id).catch(() => {});
    }

    statusEl.style.color = 'var(--accent)';
    statusEl.textContent = '✅ Inscrito! Você receberá a primeira questão amanhã.';
    if (btn) { btn.textContent = 'Inscrito ✓'; btn.disabled = true; }

    _trackEvent('whatsapp_subscribe', { phone: phone.slice(0, -4) + '****' });
}
