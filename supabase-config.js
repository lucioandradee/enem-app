/* =====================================================
   SUPABASE CONFIG
   ===================================================== */

// Substitua pelas suas chaves do Supabase
const SUPABASE_URL = 'https://nkuiwdolkluetsadauwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdWl3ZG9sa2x1ZXRzYWRhdXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjQ0OTgsImV4cCI6MjA4OTgwMDQ5OH0.xIkowv91_aL-v03HIPtg9Ni6M_rROs7VcZS2qa3PbV4';

// Cliente Supabase — guardamos referência da biblioteca antes de sobrescrever window.supabase
// Atenção: NÃO declarar 'let supabase' aqui — o CDN do Supabase usa 'var supabase' no scope global
// e uma declaração 'let' com mesmo nome causaria SyntaxError.
let _supabaseLib = null; // referência ao SDK (createClient)

// Normaliza o valor do plano vindo do banco (aceita pt-BR, inglês e variações)
function _normalizePlan(val) {
    if (!val) return 'free';
    const v = String(val).toLowerCase().trim();
    if (v === 'premium') return 'premium';
    return 'free'; // 'free', 'grátis', 'gratis', 'gratuito' → 'free'
}


// =====================================================
// FUNÇÕES DE AUTENTICAÇÃO
// =====================================================

// Registrar novo usuário
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
        
        console.log('✅ Usuário registrado:', data.user.email);
        return { success: true, user: data.user };
    } catch (error) {
        console.error('❌ Erro ao registrar:', error.message);
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
        
        console.log('✅ Login bem-sucedido:', data.user.email);
        // Salvar dados do usuário no state
        state.user.email = data.user.email;
        state.user.id = data.user.id;
        saveState();
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error.message);
        return { success: false, error: error.message };
    }
}

// Login com Google OAuth
async function loginWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname,
                queryParams: { prompt: 'select_account' },
            },
        });
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('\u274c Erro ao fazer login com Google:', error.message);
        return { success: false, error: error.message };
    }
}

// Logout
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        console.log('✅ Logout bem-sucedido');
        state = JSON.parse(JSON.stringify(defaultState));
        saveState();
        
        return { success: true };
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error.message);
        return { success: false, error: error.message };
    }
}

// Verificar usuário autenticado
async function getCurrentUser() {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data.user;
    } catch (error) {
        console.error('❌ Erro ao obter usuário:', error.message);
        return null;
    }
}

// =====================================================
// FUNÇÕES DE DADOS DO USUÁRIO
// =====================================================

// Salvar dados do usuário no Supabase
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
        console.log('✅ Dados do usuário salvos');
        return { success: true };
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error.message);
        return { success: false, error: error.message };
    }
}

// Carregar dados do usuário do Supabase
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
            // Se o nome no banco for o placeholder padrão, não sobrescrever o nome real
            // que foi carregado do metadata do Google no onAuthStateChange
            const nameWasPlaceholder = data.name === 'Alex' || !data.name;
            if (nameWasPlaceholder) delete data.name;
            state.user = { ...state.user, ...data };
            saveState();
            console.log('✅ Dados do usuário carregados:', data.email, '| plano:', data.plan);
            // Corrigir nome placeholder no banco com o nome real do Google
            if (nameWasPlaceholder && state.user.name && state.user.name !== 'Alex') {
                saveUserData(userId).catch(() => {});
            }
        } else {
            // Perfil não existe em public.users — criar agora (usuário registrou antes do trigger)
            // state.user.name já foi preenchido pelo metadata do Google no onAuthStateChange
            console.log('ℹ️ Perfil não encontrado, criando para:', state.user.name);
            await saveUserData(userId);
        }
        
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error.message);
        return { success: false, error: error.message };
    }
}

// Salvar progresso (simulados, questões respondidas)
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
        console.log('✅ Progresso salvo');
        return { success: true };
    } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error.message);
        return { success: false, error: error.message };
    }
}

// Salvar conquista/badge desbloqueado (upsert — ignora se já existir)
async function saveBadgeToSupabase(userId, badgeId, badgeName, category) {
    try {
        const { error } = await supabase
            .from('user_achievements')
            .upsert(
                { user_id: userId, badge_id: badgeId, badge_name: badgeName, category: category },
                { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
            );
        if (error) throw error;
        console.log('✅ Conquista salva:', badgeId);
        return { success: true };
    } catch (error) {
        console.error('❌ Erro ao salvar conquista:', error.message);
        return { success: false, error: error.message };
    }
}

// Carregar histórico de progresso
async function loadProgressHistory(userId) {
    try {
        const { data, error } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Histórico carregado:', data.length, 'registros');
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error.message);
        return { success: false, error: error.message };
    }
}

// =====================================================
// FUNÇÕES DE RANKING
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
        console.log('✅ Ranking carregado:', data.length, 'usuários');
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Erro ao obter ranking:', error.message);
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
        console.log('✅ Top global carregado');
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Erro ao obter top global:', error.message);
        return { success: false, error: error.message };
    }
}

// =====================================================
// LISTENERS E SINCRONIZAÇÃO
// =====================================================

function initializeSupabaseListeners() {
    // Listener de autenticação
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth state mudou:', event);

        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
            const incomingId = session.user.id;

            // Se o usuário logado é DIFERENTE do que estava em localStorage,
            // apaga o state antigo para não contaminar a sessão com dados de outra conta.
            if (state.user.id && state.user.id !== incomingId) {
                console.log('🔄 Troca de conta detectada — limpando state anterior');
                localStorage.removeItem('enem_state');
                state = JSON.parse(JSON.stringify(defaultState));
            }

            state.user.id = incomingId;
            state.user.email = session.user.email;

            // Usar o nome real vindo do provedor OAuth (Google, etc.)
            const meta = session.user.user_metadata || {};
            const googleName = meta.full_name || meta.name || meta.display_name || '';
            if (googleName && googleName.trim()) {
                state.user.name = googleName.trim();
            }

            state.onboardingDone = true;
            loadUserData(incomingId)
                .then(() => {
                    // Verificar plano após carregar dados (garante plano correto no state)
                    if (typeof loadUserPlan !== 'undefined') {
                        return loadUserPlan(incomingId);
                    }
                })
                .then(() => {
                    if (typeof renderDashboard !== 'undefined') renderDashboard();
                })
                .catch(() => {});
            saveState();
            // Se ainda estiver na tela de login (ex: retorno do OAuth), redireciona para home
            if (state.currentScreen === 'login' && typeof navigate !== 'undefined') {
                state.currentScreen = 'login'; // garante que navigate não seja bloqueado
                navigate('home');
            }
        } else if (event === 'SIGNED_OUT') {
            state = JSON.parse(JSON.stringify(defaultState));
            saveState();
        }
    });
}

// Sincronizar estado local com Supabase periodicamente (bidirecional)
function startSyncLoop(userId, interval = 30000) {
    // Salvar imediatamente ao iniciar
    saveUserData(userId).catch(() => {});

    setInterval(async () => {
        if (!userId || !navigator.onLine) return;
        const planBefore = state.user?.plan || 'free';

        // 1. Carregar do servidor — captura edições manuais e ativações via webhook
        await loadUserData(userId).catch(() => {});

        // 2. Verificar plano separadamente (dados críticos de assinatura)
        if (typeof loadUserPlan !== 'undefined') {
            await loadUserPlan(userId).catch(() => {});
        }

        // 3. Detectar upgrade de plano via webhook/pagamento externo
        if (planBefore !== 'premium' && state.user?.plan === 'premium') {
            console.log('✨ Upgrade para Premium detectado no sync loop!');
            try { sessionStorage.removeItem('_pendingPayment'); } catch { /* noop */ }
            if (typeof _showPremiumSuccess !== 'undefined') {
                setTimeout(() => _showPremiumSuccess(), 400);
            }
        }

        // 4. Re-renderizar caso dados tenham mudado
        if (typeof renderDashboard !== 'undefined') renderDashboard();

        // 5. Salvar dados locais que o servidor não rastreia (questoesHoje, etc.)
        await saveUserData(userId).catch(() => {});
    }, interval);
}

// Recarregar dados do servidor quando o app volta ao foco (ex: após editar no dashboard)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && typeof state !== 'undefined' && state.user && state.user.id) {
        const planBefore = state.user?.plan || 'free';
        Promise.all([
            loadUserData(state.user.id),
            typeof loadUserPlan !== 'undefined' ? loadUserPlan(state.user.id) : Promise.resolve(),
        ]).then(() => {
            if (typeof renderDashboard !== 'undefined') renderDashboard();
            // Detectar upgrade de plano entre sessões (ex: webhook ativou premium)
            if (planBefore !== 'premium' && state.user?.plan === 'premium') {
                console.log('✨ Plano atualizado para Premium detectado no retorno de aba!');
                if (typeof _showPremiumSuccess !== 'undefined') {
                    setTimeout(() => _showPremiumSuccess(), 400);
                }
            }
        }).catch(() => {});
    }
});

// Carregar plano do usuário do Supabase e aplicar no state
async function loadUserPlan(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('plan, plan_expires_at')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
            // Verificar expiração: se expirou, reverter para free
            let plan = _normalizePlan(data.plan);
            if (plan === 'premium' && data.plan_expires_at) {
                const expired = new Date(data.plan_expires_at) < new Date();
                if (expired) {
                    plan = 'free';
                    // Regredir no banco também
                    await supabase.from('users').update({ plan: 'free' }).eq('id', userId);
                }
            }
            state.user.plan = plan;
            state.user.planExpiresAt = data.plan_expires_at || null;
            saveState();
            console.log('✅ Plano do usuário carregado:', plan);
            // Atualizar UI de forma centralizada sempre que o plano for carregado
            if (typeof _syncPlanUI !== 'undefined') _syncPlanUI();
        }
        return { success: true, plan: data?.plan || 'free' };
    } catch (error) {
        console.error('❌ Erro ao carregar plano:', error.message);
        return { success: false, plan: 'free' };
    }
}

// Resgatar código de ativação Premium
async function redeemActivationCode(code, userId) {
    try {
        // Buscar código válido e não utilizado
        const { data, error } = await supabase
            .from('activation_codes')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('used', false)
            .single();

        if (error || !data) {
            return { success: false, error: 'Código inválido ou já utilizado.' };
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

        // Atualizar plano do usuário
        const plan = data.plan || 'premium';
        const { error: planErr } = await supabase
            .from('users')
            .update({ plan })
            .eq('id', userId);

        if (planErr) throw planErr;

        // Atualizar state local
        state.user.plan = plan;
        saveState();

        console.log('✅ Código resgatado! Plano ativado:', plan);
        return { success: true, plan, durationDays: data.duration_days };
    } catch (err) {
        console.error('❌ Erro ao resgatar código:', err.message);
        return { success: false, error: 'Erro ao validar código. Tente novamente.' };
    }
}

// =====================================================
// ANALYTICS — rastrear eventos para analytics_events
// =====================================================

// Registrar evento analítico (quiz_completed, login, essay_submitted, etc.)
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
        if (error && error.code !== '42P01') { // 42P01 = tabela não existe ainda
            console.warn('⚠️ Analytics insert error:', error.message);
        }
    } catch (err) {
        // Falha silenciosa — analytics não deve bloquear a aplicação
    }
}

// =====================================================
// INICIALIZAÇÃO
// =====================================================

// Inicializar Supabase — tenta imediatamente e, como fallback, aguarda DOMContentLoaded
function _initSupabase() {
    // Se window.supabase já é o cliente inicializado (tem .auth), não refaz
    if (window.supabase && window.supabase.auth) return;
    try {
        // Captura o SDK do CDN (tem createClient) antes de sobrescrever
        const lib = _supabaseLib || (window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase : null);
        if (!lib) { console.warn('⚠️ Supabase SDK não encontrado.'); return; }
        _supabaseLib = lib; // salva para reutilizar
        // Sobrescreve window.supabase com o CLIENTE (instância criada)
        window.supabase = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase conectado!');
        initializeSupabaseListeners();
    } catch(e) {
        console.error('❌ _initSupabase:', e.message);
    }
}

_initSupabase();
document.addEventListener('DOMContentLoaded', _initSupabase);

