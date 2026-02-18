/* =====================================================
   SUPABASE CONFIG
   ===================================================== */

// Substitua pelas suas chaves do Supabase
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui';

// Importar biblioteca do Supabase
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
document.head.appendChild(supabaseScript);

// Inicializar cliente Supabase após o script carregar
let supabase;

supabaseScript.onload = function() {
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase conectado!');
    initializeSupabaseListeners();
};

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
            state.user = { ...state.user, ...data };
            saveState();
            console.log('✅ Dados do usuário carregados');
        }
        
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error.message);
        return { success: false, error: error.message };
    }
}

// Salvar progresso (simulados, questões respondidas)
async function saveProgress(userId, subject, questionsAnswered, correct) {
    try {
        const { error } = await supabase
            .from('progress')
            .insert({
                user_id: userId,
                subject: subject,
                questions_answered: questionsAnswered,
                correct: correct,
                percentage: (correct / questionsAnswered) * 100,
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
        
        if (event === 'SIGNED_IN' && session) {
            state.user.id = session.user.id;
            state.user.email = session.user.email;
            loadUserData(session.user.id);
            saveState();
        } else if (event === 'SIGNED_OUT') {
            state = JSON.parse(JSON.stringify(defaultState));
            saveState();
        }
    });
}

// Sincronizar estado local com Supabase periodicamente
function startSyncLoop(userId, interval = 30000) {
    setInterval(async () => {
        if (userId && navigator.onLine) {
            await saveUserData(userId);
        }
    }, interval);
}
