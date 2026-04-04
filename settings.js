// =====================================================
// SETTINGS
// =====================================================
function renderSettings() {
    const s = state.user;
    const safeName = (s.name && s.name.trim()) ? s.name : 'Estudante';

    // Cabe├ºalho
    const avatarEl = document.getElementById('settings-avatar');
    const nameEl   = document.getElementById('settings-name');
    const goalEl   = document.getElementById('settings-goal');
    if (avatarEl) avatarEl.textContent = safeName[0].toUpperCase();
    if (nameEl)   nameEl.textContent   = safeName;
    if (goalEl)   goalEl.textContent   = s.goal ? `Meta: ${s.goal}` : '';

    // Campos edit├íveis
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
    btn.textContent = 'Ô£à Salvo com sucesso!';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
    }, 2000);
}

async function logout() {
    if (confirm('Tem certeza que deseja sair da conta?')) {
        // Apagar a sess├úo Supabase do localStorage (todas as chaves sb-*)
        Object.keys(localStorage)
            .filter(k => k.startsWith('sb-'))
            .forEach(k => localStorage.removeItem(k));
        localStorage.removeItem('enem_state');
        sessionStorage.clear();

        if (typeof logoutUser !== 'undefined') {
            await logoutUser();
        }
        state = JSON.parse(JSON.stringify(defaultState));
        saveState();
        navigate('login');
        const passEl = document.getElementById('login-password');
        if (passEl) passEl.value = '';
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
        errorEl.textContent = 'Digite um e-mail v├ílido.';
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
            state.currentScreen = 'login'; // garante que navigate('home') n├úo seja bloqueado
            saveState();
            // Persistir/atualizar registro do usu├írio no banco ao logar
            if (typeof saveUserData !== 'undefined') await saveUserData(result.user.id).catch(() => {});
            if (typeof startSyncLoop !== 'undefined') startSyncLoop(result.user.id);
            // Solicitar permiss├úo de notifica├º├Áes push ap├│s login
            _requestPushPermission();
            // Rastrear login
            _trackEvent('login', { method: 'email' });
            navigate('home');
        } else {
            const msg = result.error || '';
            if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) {
                errorEl.textContent = 'E-mail ou senha incorretos.';
            } else if (msg.includes('Email not confirmed')) {
                errorEl.innerHTML = 'E-mail n├úo confirmado. Verifique sua caixa de entrada ou <a href="#" onclick="handleForgotPassword();return false;" style="color:var(--accent);text-decoration:underline">reenviar confirma├º├úo</a>.';
            } else {
                errorEl.textContent = 'Erro ao entrar. Tente novamente.';
            }
        }
    } catch (e) {
        errorEl.textContent = 'Sem conex├úo. Verifique sua internet.';
    } finally {
        btn.textContent = 'Entrar ÔåÆ';
        btn.disabled = false;
    }
}

function openPayment() {
    navigate('checkout');
}

