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

        // Remover active de TODAS as telas antes de resetar o state
        document.querySelectorAll('.screen.active').forEach(s => s.classList.remove('active'));

        state = JSON.parse(JSON.stringify(defaultState));
        state.currentScreen = 'login';
        saveState();

        const loginEl = document.getElementById('screen-login');
        if (loginEl) loginEl.classList.add('active');

        const nav = document.getElementById('bottom-nav');
        if (nav) nav.style.display = 'none';

        const passEl = document.getElementById('login-password');
        if (passEl) { passEl.value = ''; }
        const emailEl = document.getElementById('login-email');
        if (emailEl) { emailEl.value = ''; }
        const errEl = document.getElementById('login-error');
        if (errEl) { errEl.textContent = ''; }
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
            saveState();
            // Persistir/atualizar registro do usuário no banco ao logar
            if (typeof saveUserData !== 'undefined') await saveUserData(result.user.id).catch(() => {});
            if (typeof startSyncLoop !== 'undefined') startSyncLoop(result.user.id);
            // Solicitar permissão de notificações push após login
            _requestPushPermission();
            // Rastrear login
            _trackEvent('login', { method: 'email' });
            // Navegar para home.
            // O handler onAuthStateChange(SIGNED_IN) já fez isso, mas navigate() tem
            // guarda interna (currentId === nextId → return), então chamar aqui é seguro
            // como fallback caso o evento tenha disparado antes do DOM estar pronto.
            if (typeof navigate !== 'undefined') {
                if (state.currentScreen !== 'home') {
                    navigate('home');
                } else {
                    if (typeof renderDashboard !== 'undefined') renderDashboard();
                }
            }
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
        btn.textContent = 'Entrar na conta';
        btn.disabled = false;
    }
}

function openPayment() {
    navigate('checkout');
}

