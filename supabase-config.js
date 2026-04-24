/* =====================================================
   SUPABASE CONFIG
   ===================================================== */

// Substitua pelas suas chaves do Supabase
const SUPABASE_URL = 'https://nkuiwdolkluetsadauwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdWl3ZG9sa2x1ZXRzYWRhdXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjQ0OTgsImV4cCI6MjA4OTgwMDQ5OH0.xIkowv91_aL-v03HIPtg9Ni6M_rROs7VcZS2qa3PbV4';

// Cliente Supabase - guardamos refer�ncia da biblioteca antes de sobrescrever window.supabase
// Aten��o: N�O declarar 'let supabase' aqui - o CDN do Supabase usa 'var supabase' no scope global
// e uma declara��o 'let' com mesmo nome causaria SyntaxError.
let _supabaseLib = null; // refer�ncia ao SDK (createClient)

// Normaliza o valor do plano vindo do banco (aceita pt-BR, ingl�s e varia��es)
function _normalizePlan(val) {
    if (!val) return 'free';
    const v = String(val).toLowerCase().trim();
    if (v === 'premium') return 'premium';
    return 'free'; // 'free', 'gr�tis', 'gratis', 'gratuito' ? 'free'
}


// =====================================================
// FUN��ES DE AUTENTICA��O
// =====================================================

// Registrar novo usu�rio
async function signUpUser(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
        
        if (error) throw error;
        
        console.log('? Usu�rio registrado com sucesso');
        return { success: true, user: data.user };
    } catch (error) {
        console.error('? Erro ao registrar:', error.message);
        return { success: false, error: error.message };
    }
}

// Login
async function loginUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        console.log('✅ Login bem-sucedido');
        // onAuthStateChange(SIGNED_IN) cuida de: state, loadUserData, navigate('home'), sync
        return { success: true, user: data.user };
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error.message);
        return { success: false, error: error.message };
    }
}

// Logout
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        console.log('? Logout bem-sucedido');
        state = JSON.parse(JSON.stringify(defaultState));
        saveState();
        
        return { success: true };
    } catch (error) {
        console.error('? Erro ao fazer logout:', error.message);
        return { success: false, error: error.message };
    }
}

// Verificar usuário autenticado
// Usa getSession() primeiro (lê do localStorage, sem rede) — essencial para mobile/PWA
async function getCurrentUser() {
    try {
        // Caminho rápido: sessão local — sem requisição de rede, funciona offline
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) return session.user;
        // Sem sessão local: se estiver online, tenta validar com o servidor
        if (!navigator.onLine) return null;
        const { data, error } = await supabase.auth.getUser();
        if (error) return null;
        return data.user;
    } catch {
        return null;
    }
}

// =====================================================
// FUN��ES DE DADOS DO USU�RIO
// =====================================================

// Salvar dados do usu�rio no Supabase
async function saveUserData(userId) {
    try {
        const { error } = await supabase
            .from('users')
            .upsert({
                id: userId,
                name: state.user.name,
                email: state.user.email,
                school: state.user.school,
                level: state.user.level,
                xp: state.user.xp,
                streak: state.user.streak,
                goal: state.user.goal,
                plan: _normalizePlan(state.user.plan),
                updated_at: new Date().toISOString()
            });
        
        if (error) throw error;
        console.log('? Dados do usu�rio salvos');
        return { success: true };
    } catch (error) {
        console.error('? Erro ao salvar dados:', error.message);
        return { success: false, error: error.message };
    }
}

// Carregar dados do usu�rio do Supabase
async function loadUserData(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            // Normalizar plano antes de aplicar no state
            data.plan = _normalizePlan(data.plan);
            // Se o nome no banco for placeholder ('Alex' ou vazio), n�o sobrescrever o nome real do state
            const nameIsPlaceholder = !data.name || data.name === 'Alex';
            if (nameIsPlaceholder) {
                delete data.name;
            }
            state.user = { ...state.user, ...data };
            // Se o nome ainda � placeholder ap�s o merge, derivar do email
            if (!state.user.name || state.user.name === 'Alex') {
                if (typeof _nameFromEmail !== 'undefined') {
                    state.user.name = _nameFromEmail(state.user.email || '');
                }
            }
            saveState();
            console.log('? Dados do usu�rio carregados');
            // Atualizar nome real no banco se estava como placeholder
            if (nameIsPlaceholder && state.user.name && state.user.name !== 'Alex') {
                saveUserData(userId).catch(() => {});
            }
        } else {
            // Perfil n�o existe em public.users - criar agora (usu�rio registrou antes do trigger)
            // state.user.name j� foi preenchido pelo metadata do Google no onAuthStateChange
            console.log('?? Perfil n�o encontrado, criando...');
            await saveUserData(userId);
        }
        
        return { success: true, data: data };
    } catch (error) {
        console.error('? Erro ao carregar dados:', error.message);
        return { success: false, error: error.message };
    }
}

// Salvar progresso (simulados, quest�es respondidas)
async function saveProgress(userId, subject, questionsAnswered, correct, opts = {}) {
    try {
        const { error } = await supabase
            .from('progress')
            .insert({
                user_id: userId,
                subject: subject,
                questions_answered: questionsAnswered,
                correct: correct,
                percentage: questionsAnswered > 0 ? (correct / questionsAnswered) * 100 : 0,
                xp_gained: opts.xpGained || 0,
                max_combo: opts.maxCombo || 0,
                created_at: new Date().toISOString()
            });
        
        if (error) throw error;
        console.log('? Progresso salvo');
        return { success: true };
    } catch (error) {
        console.error('? Erro ao salvar progresso:', error.message);
        return { success: false, error: error.message };
    }
}

// Salvar conquista/badge desbloqueado (upsert - ignora se j� existir)
async function saveBadgeToSupabase(userId, badgeId, badgeName, category) {
    try {
        const { error } = await supabase
            .from('user_achievements')
            .upsert(
                { user_id: userId, badge_id: badgeId, badge_name: badgeName, category: category },
                { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
            );
        if (error) throw error;
        console.log('? Conquista salva:', badgeId);
        return { success: true };
    } catch (error) {
        console.error('? Erro ao salvar conquista:', error.message);
        return { success: false, error: error.message };
    }
}

// Carregar hist�rico de progresso
async function loadProgressHistory(userId) {
    try {
        const { data, error } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        console.log('? Hist�rico carregado:', data.length, 'registros');
        return { success: true, data: data };
    } catch (error) {
        console.error('? Erro ao carregar hist�rico:', error.message);
        return { success: false, error: error.message };
    }
}

// =====================================================
// FUN��ES DE RANKING
// =====================================================

// Obter ranking escolar
async function getSchoolRanking(school) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, level, xp, school')
            .eq('school', school)
            .order('xp', { ascending: false })
            .limit(20);
        
        if (error) throw error;
        console.log('? Ranking carregado:', data.length, 'usu�rios');
        return { success: true, data: data };
    } catch (error) {
        console.error('? Erro ao obter ranking:', error.message);
        return { success: false, error: error.message };
    }
}

// Obter top global
async function getGlobalTop() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, level, xp, school')
            .order('xp', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        console.log('? Top global carregado');
        return { success: true, data: data };
    } catch (error) {
        console.error('? Erro ao obter top global:', error.message);
        return { success: false, error: error.message };
    }
}

// =====================================================
// LISTENERS E SINCRONIZA��O
// =====================================================

function initializeSupabaseListeners() {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state mudou:', event);

        // ── INITIAL_SESSION ───────────────────────────────────────────────────
        // Dispara como microtask logo após o cliente Supabase ser criado,
        // ANTES de DOMContentLoaded e ANTES de init() rodar.
        // Regra: atualizar state mas NÃO navegar no contexto do app —
        // init() é o responsável pela tela inicial (via getCurrentUser).
        // No contexto da landing page (navigate indefinido), redireciona ao /app.
        if (event === 'INITIAL_SESSION') {
            if (!session) return; // sem sessão, init() tratará o caso de não autenticado

            const incomingId = session.user.id;
            if (state.user.id && state.user.id !== incomingId) {
                localStorage.removeItem('enem_state');
                state = JSON.parse(JSON.stringify(defaultState));
            }
            state.user.id    = incomingId;
            state.user.email = session.user.email;
            const _meta0 = session.user.user_metadata || {};
            const _gName0 = (_meta0.full_name || _meta0.name || _meta0.display_name || '').trim();
            if (_gName0 && _gName0 !== 'Alex') state.user.name = _gName0;
            state.onboardingDone = true;
            saveState();

            if (typeof navigate === 'undefined' && window.location.pathname !== '/app') {
                window.location.href = '/app';
                return;
            }
            // Contexto app: init() cuidará da tela via getCurrentUser()
            return;
        }

        // ── SIGNED_IN | TOKEN_REFRESHED ───────────────────────────────────────
        // SIGNED_IN  : disparado após login explícito (email/senha ou OAuth)
        // TOKEN_REFRESHED: disparado após renovação automática do access token
        // Ambos devem navegar para home se o usuário estiver em tela de auth.
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
            const incomingId = session.user.id;

            // Troca de conta: limpa state contaminado de outra sessão
            if (state.user.id && state.user.id !== incomingId) {
                console.log('Troca de conta detectada - limpando state anterior');
                localStorage.removeItem('enem_state');
                state = JSON.parse(JSON.stringify(defaultState));
            }

            state.user.id    = incomingId;
            state.user.email = session.user.email;

            const meta = session.user.user_metadata || {};
            const googleName = (meta.full_name || meta.name || meta.display_name || '').trim();
            if (googleName && googleName !== 'Alex') {
                state.user.name = googleName;
            }

            state.onboardingDone = true;
            loadUserData(incomingId)
                .then(() => checkExpiredPremium().catch(() => {}))
                .then(() => {
                    if (typeof loadUserPlan !== 'undefined') return loadUserPlan(incomingId);
                })
                .then(() => {
                    if (typeof renderDashboard !== 'undefined') renderDashboard();
                })
                .catch(() => {});
            saveState();

            if (typeof navigate === 'undefined' && window.location.pathname !== '/app') {
                // Contexto landing page: redireciona para o app
                window.location.href = '/app';
                return;
            }

            // Contexto app: navega para home assim que o DOM estiver pronto
            // (SIGNED_IN pode disparar antes de DOMContentLoaded quando há #access_token na URL)
            const _doNavigateHome = () => {
                if (typeof navigate === 'undefined') return; // app.js ainda não carregou
                // Limpa o ?code= da URL agora que o SDK já processou (não antes!)
                if (window.location.search.indexOf('code=') !== -1) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
                const _authScreens = ['login', 'onboarding'];
                const _homeEl = document.getElementById('screen-home');
                const _homeActive = _homeEl && _homeEl.classList.contains('active');
                if (_authScreens.includes(state.currentScreen) || !state.currentScreen || !_homeActive) {
                    navigate('home');
                }
                if (typeof startSyncLoop !== 'undefined') startSyncLoop(incomingId);
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', _doNavigateHome, { once: true });
            } else {
                _doNavigateHome();
            }
            return;
        }

        // ── SIGNED_OUT ────────────────────────────────────────────────────────
        if (event === 'SIGNED_OUT') {
            const _hadAccount = !!(state.user && state.user.id);
            state = JSON.parse(JSON.stringify(defaultState));
            if (_hadAccount) state.onboardingDone = true;
            saveState();
            if (typeof navigate !== 'undefined') {
                navigate('login');
            }
        }
    });
}

// Sincronizar estado local com Supabase periodicamente (bidirecional)
let _syncLoopUserId = null; // guard: apenas um loop por sessão
function startSyncLoop(userId, interval = 30000) {
    if (!userId) return;
    // Se já está rodando para este usuário, não cria outro intervalo
    if (_syncLoopUserId === userId) return;
    _syncLoopUserId = userId;
    // Salvar imediatamente ao iniciar
    saveUserData(userId).catch(() => {});

    setInterval(async () => {
        if (!userId || !navigator.onLine) return;
        const planBefore = state.user?.plan || 'free';

        // 1. Carregar do servidor - captura edi��es manuais e ativa��es via webhook
        await loadUserData(userId).catch(() => {});

        // 2. Verificar plano separadamente (dados cr�ticos de assinatura)
        if (typeof loadUserPlan !== 'undefined') {
            await loadUserPlan(userId).catch(() => {});
        }

        // 3. Detectar upgrade de plano via webhook/pagamento externo
        if (planBefore !== 'premium' && state.user?.plan === 'premium') {
            console.log('? Upgrade para Premium detectado no sync loop!');
            try { sessionStorage.removeItem('_pendingPayment'); } catch { /* noop */ }
            if (typeof _showPremiumSuccess !== 'undefined') {
                setTimeout(() => _showPremiumSuccess(), 400);
            }
        }

        // 4. Re-renderizar caso dados tenham mudado
        if (typeof renderDashboard !== 'undefined') renderDashboard();

        // 5. Salvar dados locais que o servidor n�o rastreia (questoesHoje, etc.)
        await saveUserData(userId).catch(() => {});
    }, interval);
}

// Recarregar dados do servidor quando o app volta ao foco (ex: ap�s editar no dashboard)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && typeof state !== 'undefined' && state.user && state.user.id) {
        // Renova sessão JWT ao voltar ao foco — essencial para mobile/PWA
        if (typeof supabase !== 'undefined' && supabase?.auth) {
            supabase.auth.refreshSession().catch(() => {});
        }
        const planBefore = state.user?.plan || 'free';
        Promise.all([
            loadUserData(state.user.id),
            typeof loadUserPlan !== 'undefined' ? loadUserPlan(state.user.id) : Promise.resolve(),
        ]).then(() => {
            if (typeof renderDashboard !== 'undefined') renderDashboard();
            // Detectar upgrade de plano entre sess�es (ex: webhook ativou premium)
            if (planBefore !== 'premium' && state.user?.plan === 'premium') {
                console.log('? Plano atualizado para Premium detectado no retorno de aba!');
                if (typeof _showPremiumSuccess !== 'undefined') {
                    setTimeout(() => _showPremiumSuccess(), 400);
                }
            }
        }).catch(() => {});
    }
});

// Carregar plano do usu�rio do Supabase e aplicar no state
async function loadUserPlan(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('plan, plan_expires_at')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
            // Verificar expira��o: se expirou, reverter para free
            let plan = _normalizePlan(data.plan);
            if (plan === 'premium' && data.plan_expires_at) {
                const expired = new Date(data.plan_expires_at) < new Date();
                if (expired) {
                    plan = 'free';
                    // Regredir no banco via RPC - evita update direto na tabela users
                    await supabase.rpc('auto_deactivate_expired_premium').catch(() => {});
                }
            }
            state.user.plan = plan;
            state.user.planExpiresAt = data.plan_expires_at || null;
            saveState();
            console.log('? Plano do usu�rio carregado:', plan);
            // Atualizar UI de forma centralizada sempre que o plano for carregado
            if (typeof _syncPlanUI !== 'undefined') _syncPlanUI();
        }
        return { success: true, plan: data?.plan || 'free' };
    } catch (error) {
        console.error('? Erro ao carregar plano:', error.message);
        return { success: false, plan: 'free' };
    }
}

// Verificar acesso premium do usu�rio atual
// Lan�a erro se o usu�rio n�o for premium ou o plano estiver expirado.
async function checkPremiumAccess(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('plan, plan_expires_at')
        .eq('id', userId)
        .single();

    if (error) throw new Error('Erro ao verificar plano: ' + error.message);

    const isPremium = data.plan === 'premium';
    const premiumUntil = data.plan_expires_at ? new Date(data.plan_expires_at) : null;
    const expired = premiumUntil !== null && premiumUntil < new Date();

    if (!isPremium || expired) {
        throw new Error('Acesso negado');
    }

    return { isPremium: true, premiumUntil };
}

// Resgatar c�digo de ativa��o Premium
async function redeemActivationCode(code, userId) {
    try {
        // Buscar c�digo v�lido e n�o utilizado
        const { data, error } = await supabase
            .from('activation_codes')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('used', false)
            .single();

        if (error || !data) {
            return { success: false, error: 'C�digo inv�lido ou j� utilizado.' };
        }

        // Marcar como utilizado
        const { error: updateErr } = await supabase
            .from('activation_codes')
            .update({
                used: true,
                used_by: userId,
                used_at: new Date().toISOString(),
            })
            .eq('id', data.id);

        if (updateErr) throw updateErr;

        // Atualizar plano do usu�rio
        const plan = data.plan || 'premium';
        const durationDays = data.duration_days || 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);
        const { error: planErr } = await supabase
            .from('users')
            .update({
                plan,
                plan_expires_at: expiresAt.toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (planErr) throw planErr;

        // Atualizar state local
        state.user.plan = plan;
        state.user.planExpiresAt = expiresAt.toISOString();
        saveState();

        console.log('? C�digo resgatado! Plano ativado:', plan);
        return { success: true, plan, durationDays: data.duration_days };
    } catch (err) {
        console.error('? Erro ao resgatar c�digo:', err.message);
        return { success: false, error: 'Erro ao validar c�digo. Tente novamente.' };
    }
}

// =====================================================
// ANALYTICS - rastrear eventos para analytics_events
// =====================================================

// Registrar evento anal�tico (quiz_completed, login, essay_submitted, etc.)
async function trackEvent(eventName, properties = {}) {
    try {
        if (!supabase) return;
        const { error } = await supabase
            .from('analytics_events')
            .insert({
                event_name: eventName,
                user_id: properties.user_id || null,
                properties: JSON.stringify(properties),
                created_at: new Date().toISOString(),
            });
        if (error && error.code !== '42P01') { // 42P01 = tabela n�o existe ainda
            console.warn('?? Analytics insert error:', error.message);
        }
    } catch (err) {
        // Falha silenciosa - analytics n�o deve bloquear a aplica��o
    }
}

// =====================================================
// INICIALIZA��O
// =====================================================

// Inicializar Supabase - tenta imediatamente e, como fallback, aguarda DOMContentLoaded
function _initSupabase() {
    // Se window.supabase j� � o cliente inicializado (tem .auth), n�o refaz
    if (window.supabase && window.supabase.auth) return;
    try {
        // Captura o SDK do CDN (tem createClient) antes de sobrescrever
        const lib = _supabaseLib || (window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase : null);
        if (!lib) { console.warn('?? Supabase SDK n�o encontrado.'); return; }
        _supabaseLib = lib; // salva para reutilizar
        // Sobrescreve window.supabase com o CLIENTE (inst�ncia criada)
        window.supabase = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storageKey: 'sb-nkuiwdolkluetsadauwb-auth-token',
                // PKCE: mais seguro, suportado pelo Google e recomendado pelo Supabase v2.
                // O code_verifier fica no sessionStorage do mesmo tab — sobrevive
                // a redirects de OAuth dentro da mesma aba do navegador.
                flowType: 'pkce',
            }
        });
        console.log('? Supabase conectado!');
        initializeSupabaseListeners();
        // Verificar assinaturas expiradas na inicializa��o do app
        setTimeout(() => checkExpiredPremium().catch(() => {}), 1500);
    } catch(e) {
        console.error('? _initSupabase:', e.message);
    }
}

_initSupabase();
document.addEventListener('DOMContentLoaded', _initSupabase);

// =====================================================
// EXPIRA��O DE PREMIUM - VERIFICA��O AUTOM�TICA
// =====================================================

/**
 * checkExpiredPremium()
 * Executa a fun��o SQL auto_deactivate_expired_premium() no banco,
 * que reverte para 'free' qualquer assinatura com data expirada.
 * Deve ser chamada na inicializa��o do app e a cada login.
 */
async function checkExpiredPremium() {
    try {
        const { error } = await supabase.rpc('auto_deactivate_expired_premium');

        if (error) {
            console.error('? checkExpiredPremium:', error.message);
            return;
        }

        console.log('? checkExpiredPremium: assinaturas expiradas verificadas.');

        // Re-sincronizar o plano local ap�s a RPC - o banco pode ter revertido para free
        const userId = state?.user?.id;
        if (userId && typeof loadUserPlan !== 'undefined') {
            await loadUserPlan(userId).catch(() => {});
        }
    } catch (e) {
        console.error('? checkExpiredPremium (catch):', e.message);
    }
}

// =====================================================
// INTEGRA��O PREMIUM - FUN��ES DE PRODU��O
// =====================================================

/**
 * checkPremium()
 * Chama a RPC get_my_premium e retorna { isPremium: boolean }.
 * Mant�m o state local sincronizado com o banco.
 */
async function checkPremium() {
    try {
        const { data, error } = await supabase.rpc('get_my_premium');

        if (error) {
            console.error('? checkPremium:', error.message);
            return { isPremium: false };
        }

        // A RPC pode retornar boolean direto ou um objeto { is_premium }
        const isPremiumValue = typeof data === 'boolean'
            ? data
            : !!(data?.is_premium ?? data);

        // Sincronizar state local se divergir
        const currentPlan = state?.user?.plan;
        if (isPremiumValue && currentPlan !== 'premium') {
            state.user.plan = 'premium';
            if (typeof saveState !== 'undefined') saveState();
            if (typeof _syncPlanUI !== 'undefined') _syncPlanUI();
        } else if (!isPremiumValue && currentPlan === 'premium') {
            state.user.plan = 'free';
            if (typeof saveState !== 'undefined') saveState();
            if (typeof _syncPlanUI !== 'undefined') _syncPlanUI();
        }

        return { isPremium: isPremiumValue };
    } catch (e) {
        console.error('? checkPremium (catch):', e.message);
        return { isPremium: false };
    }
}

/**
 * simulatePurchase(email)
 * Chama a RPC process_payment simulando uma compra aprovada via PIX.
 * Retorna { success: boolean, error?: string }.
 */
async function simulatePurchase(email) {
    if (!email || !email.includes('@')) {
        return { success: false, error: 'E-mail inv�lido.' };
    }

    try {
        const { error } = await supabase.rpc('process_payment', {
            p_email:  email,
            p_amount: 19.90,
            p_status: 'approved',
            p_method: 'pix',
        });

        if (error) {
            console.error('? simulatePurchase:', error.message);
            return { success: false, error: error.message };
        }

        // Atualizar state local imediatamente
        if (typeof state !== 'undefined') {
            state.user.plan = 'premium';
            if (typeof saveState !== 'undefined') saveState();
            if (typeof _syncPlanUI !== 'undefined') _syncPlanUI();
        }

        console.log('? simulatePurchase: premium ativado para', email);
        return { success: true };
    } catch (e) {
        console.error('? simulatePurchase (catch):', e.message);
        return { success: false, error: e.message };
    }
}

/**
 * requirePremium()
 * Middleware: verifica se o usu�rio autenticado possui plano premium.
 * Retorna { allowed: boolean }.
 * Se n�o permitido, exibe o paywall e registra aviso no console.
 */
async function requirePremium() {
    const { isPremium } = await checkPremium();

    if (!isPremium) {
        console.warn('? requirePremium: acesso bloqueado - usu�rio n�o � premium.');
        if (typeof showPaywall !== 'undefined') {
            showPaywall(
                'Recurso exclusivo Premium ??',
                'Assine o Premium para desbloquear este recurso e estudar sem limites!'
            );
        }
        return { allowed: false };
    }

    return { allowed: true };
}

/**
 * getUserData()
 * Busca os dados completos do usu�rio autenticado na tabela users.
 * Retorna { success: boolean, data?: object, error?: string }.
 */
async function getUserData() {
    try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
            return { success: false, error: 'Usu�rio n�o autenticado.' };
        }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (error) {
            console.error('? getUserData:', error.message);
            return { success: false, error: error.message };
        }

        // Normalizar plano antes de retornar
        if (data?.plan) data.plan = _normalizePlan(data.plan);

        return { success: true, data };
    } catch (e) {
        console.error('? getUserData (catch):', e.message);
        return { success: false, error: e.message };
    }
}

// =====================================================
// RESPOSTAS - RPC SEGURA
// =====================================================

/**
 * _handleBackendError(error)
 * Centraliza o tratamento de erros vindos do backend Supabase:
 * - "Limite di�rio atingido" ? exibe paywall de limite di�rio
 * - "Acesso negado: requer premium" ? exibe paywall de feature
 * Retorna o c�digo do erro: 'DAILY_LIMIT' | 'PREMIUM_REQUIRED' | 'UNKNOWN'
 */
function _handleBackendError(error) {
    const msg = (error?.message || error || '').toString();

    if (msg.includes('Limite di�rio atingido')) {
        console.warn('? _handleBackendError: limite di�rio atingido.');
        if (typeof showPaywall !== 'undefined' && typeof PAYWALL_MESSAGES !== 'undefined') {
            showPaywall(PAYWALL_MESSAGES.dailyLimit.title, PAYWALL_MESSAGES.dailyLimit.body);
        }
        return 'DAILY_LIMIT';
    }

    if (msg.includes('Acesso negado') || msg.includes('requer premium')) {
        console.warn('? _handleBackendError: acesso premium requerido.');
        if (typeof showFeaturePaywall !== 'undefined') showFeaturePaywall('enemMode');
        return 'PREMIUM_REQUIRED';
    }

    console.error('? _handleBackendError:', msg);
    return 'UNKNOWN';
}

/**
 * answerQuestionSecure(userId, questionId, isCorrect)
 * Registra a resposta do usu�rio via RPC "answer_question_secure".
 * Evita qualquer insert direto na tabela question_attempts.
 * Trata erros de limite di�rio e acesso premium retornados pelo backend.
 * Retorna { success: boolean, errorCode?: string, data?: any }
 */
async function answerQuestionSecure(userId, questionId, isCorrect) {
    if (!userId) return { success: false, error: 'Usu�rio n�o autenticado.' };

    try {
        const { data, error } = await supabase.rpc('answer_question_secure', {
            p_user_id:     userId,
            p_question_id: questionId || null,
            p_is_correct:  isCorrect,
        });

        if (error) {
            const errorCode = _handleBackendError(error);
            return { success: false, errorCode, error: error.message };
        }

        return { success: true, data };
    } catch (e) {
        console.error('? answerQuestionSecure (catch):', e.message);
        return { success: false, error: e.message };
    }
}

