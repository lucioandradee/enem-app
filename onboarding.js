// =====================================================
// ONBOARDING
// =====================================================
let obStep = 1;
let obGoal = '';
// =====================================================
// ONBOARDING ÔÇö Helpers de valida├º├úo em tempo real
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
        icon.textContent = ok ? 'Ô£ö' : 'Ô£û';
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
        { pct: '40%',  color: '#f97316', text: 'Razo├ível' },
        { pct: '60%',  color: '#eab308', text: 'M├®dia' },
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
        _obSetFieldState('ob-email', false, 'E-mail inv├ílido');
        if (hintEl) { hintEl.textContent = 'E-mail inv├ílido.'; hintEl.className = 'ob-field-hint ob-hint-err'; }
        return;
    }

    // Normalizar: sempre min├║sculas
    emailEl.value = email;

    if (hintEl) { hintEl.textContent = 'Verificando...'; hintEl.className = 'ob-field-hint ob-hint-info'; }

    // Verifica se email j├í existe tentando uma busca na tabela public.users (sem expor dados)
    try {
        if (typeof supabase !== 'undefined' && supabase) {
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .maybeSingle();
            if (!error && data) {
                _obSetFieldState('ob-email', false, 'E-mail j├í cadastrado');
                if (hintEl) { hintEl.textContent = 'Este e-mail j├í tem conta. ├ë voc├¬?'; hintEl.className = 'ob-field-hint ob-hint-err'; }
                // Link no hint para ir ao login
                if (hintEl) {
                    hintEl.innerHTML = 'Este e-mail j├í tem conta. <button class="link-inline" onclick="navigate(\'login\')" style="font-size:11px">Fazer login ÔåÆ</button>';
                }
                return;
            }
        }
    } catch { /* falha silenciosa ÔÇö n├úo bloqueia o fluxo */ }

    _obSetFieldState('ob-email', true, 'E-mail dispon├¡vel');
    if (hintEl) { hintEl.textContent = 'Ô£ö E-mail dispon├¡vel'; hintEl.className = 'ob-field-hint ob-hint-ok'; }
}

let _pendingPassword = ''; // senha tempor├íria ÔÇö nunca entra no state nem no localStorage

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

        // ÔÇö Nome obrigat├│rio (m├¡nimo 3 caracteres) ÔÇö
        if (!name || name.length < 3) {
            _obSetFieldState('ob-name', false, 'Nome muito curto');
            showError('Digite seu nome completo (m├¡nimo 3 caracteres).', nameEl);
            return;
        }
        _obSetFieldState('ob-name', true);

        // ÔÇö E-mail v├ílido ÔÇö
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) {
            _obSetFieldState('ob-email', false, 'E-mail inv├ílido');
            showError('Digite um e-mail v├ílido.', emailEl);
            return;
        }
        if (emailEl) emailEl.value = email; // normaliza min├║sculas

        // ÔÇö Senha: m├¡nimo 8 caracteres + pelo menos 1 n├║mero ÔÇö
        if (password.length < 8) {
            showError('A senha deve ter pelo menos 8 caracteres.', passwordEl);
            return;
        }
        if (!/[0-9]/.test(password)) {
            showError('A senha deve conter pelo menos 1 n├║mero.', passwordEl);
            return;
        }

        // ÔÇö Verificar email duplicado no Supabase antes de avan├ºar ÔÇö
        const btn = document.getElementById('ob-btn');
        const origBtnText = btn?.textContent || 'Pr├│ximo';
        if (btn) { btn.disabled = true; btn.textContent = 'Verificando...'; }
        try {
            if (typeof supabase !== 'undefined' && supabase) {
                const { data } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();
                if (data) {
                    _obSetFieldState('ob-email', false, 'E-mail j├í cadastrado');
                    if (hintEl) {
                        hintEl.innerHTML = 'Este e-mail j├í tem conta. <button class="link-inline" onclick="navigate(\'login\')" style="font-size:11px">Fazer login ÔåÆ</button>';
                        hintEl.className = 'ob-field-hint ob-hint-err';
                    }
                    showError('Este e-mail j├í est├í cadastrado. Fa├ºa login.', emailEl);
                    if (btn) { btn.disabled = false; btn.textContent = origBtnText; }
                    return;
                }
            }
        } catch { /* offline ÔÇö continua e o Supabase rejeitar├í no signUp */ }
        if (btn) { btn.disabled = false; btn.textContent = origBtnText; }

        _obSetFieldState('ob-email', true);
        state.user.name  = name;
        state.user.email = email;
        _pendingPassword = password;
        goToObStep(2);
    } else if (obStep === 2) {
        if (!obGoal) { obGoal = 'Rumo ├á Federal ­ƒÜÇ'; }
        if (obGoal === 'outro') {
            const customInput = document.getElementById('ob-outro-input');
            const customVal = customInput ? customInput.value.trim() : '';
            obGoal = customVal ? customVal : 'Rumo ├á Federal ­ƒÜÇ';
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
        document.getElementById('ob-btn').textContent = 'Come├ºar a Estudar ­ƒÜÇ';
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

// Handler para login com Google OAuth ÔÇö redireciona para provedor
async function handleGoogleLogin() {


    const btn = document.getElementById('google-login-btn') ||
                document.querySelector('.google-login-btn');
    const origText = btn ? btn.textContent.trim() : 'Entrar com Google';
    if (btn) { btn.disabled = true; btn.textContent = 'ÔÅ│ Redirecionando...'; }

    // Garantir que o Supabase esteja iniciado
    if (typeof _initSupabase !== 'undefined') _initSupabase();

    const _showError = (msg) => {
        console.error('ÔØî Google login:', msg);
        const errorEl = document.getElementById('login-error');
        if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = msg; }
        else { _showQuickToast('ÔØî ' + msg); }
        if (btn) { btn.disabled = false; btn.textContent = origText; }
    };

    try {
        const sb = window.supabase;
        if (!sb || !sb.auth) {
            _showError('Conex├úo com servidor falhou. Recarregue a p├ígina.');
            return;
        }

        const { data, error } = await sb.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: { prompt: 'select_account' },
            },
        });

        if (error) { _showError(error.message); return; }
        // Fallback manual: se o SDK n├úo redirecionou automaticamente
        if (data && data.url) {
            window.location.href = data.url;
        }
    } catch (e) {
        _showError(e.message || 'Erro ao entrar com Google');
    }
}

