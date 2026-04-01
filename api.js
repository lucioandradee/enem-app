/* =====================================================
   ENEM MASTER — API Module (api.js)
   Integração com api.enem.dev • Cache localStorage
   ===================================================== */

'use strict';

const ENEM_API = 'https://api.enem.dev/v1';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

/* ---- Controle de questões já vistas na sessão ---- */
const SEEN_KEY = 'enem_seen_q';

function getSeenIds() {
    try { return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) || '[]')); }
    catch { return new Set(); }
}

function markSeen(questions) {
    try {
        const seen = getSeenIds();
        questions.forEach(q => seen.add(`${q.year}-${q.index}`));
        sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
    } catch { /* storage cheio: ignora */ }
}

function clearSeen() {
    try { sessionStorage.removeItem(SEEN_KEY); } catch { /* noop */ }
}

/* ---- Mapa de disciplinas ---- */
const DISC_MAP = {
    humanas: 'ciencias-humanas',
    natureza: 'ciencias-natureza',
    linguagens: 'linguagens',
    matematica: 'matematica',
};

const DISC_LABELS = {
    'ciencias-humanas': 'CIÊNCIAS HUMANAS',
    'ciencias-natureza': 'CIÊNCIAS DA NATUREZA',
    'linguagens': 'LINGUAGENS',
    'matematica': 'MATEMÁTICA',
};

/* ---- Estrutura oficial do ENEM por dia ---- */
// Dia 1: Linguagens (Q.1–45)  + Humanas (Q.46–90)   — 5h30min
// Dia 2: Natureza  (Q.91–135) + Matemática (Q.136–180) — 5h30min
const ENEM_DAY_CONFIG = {
    1: [
        { disc: 'linguagens',        label: 'LINGUAGENS, CÓDIGOS E SUAS TECNOLOGIAS',    start: 1  },
        { disc: 'ciencias-humanas',  label: 'CIÊNCIAS HUMANAS E SUAS TECNOLOGIAS',       start: 46 },
    ],
    2: [
        { disc: 'ciencias-natureza', label: 'CIÊNCIAS DA NATUREZA E SUAS TECNOLOGIAS',   start: 91  },
        { disc: 'matematica',        label: 'MATEMÁTICA E SUAS TECNOLOGIAS',              start: 136 },
    ],
};

/* ---- Cache helpers ---- */
function cacheGet(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
        return data;
    } catch { return null; }
}

function cacheSet(key, data) {
    try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch (e) {
        console.warn('Cache cheio, limpando itens antigos...');
        clearOldCache();
    }
}

function clearOldCache() {
    const keys = Object.keys(localStorage).filter(k => /^enem_q[23]?_/.test(k));
    keys.sort();
    keys.slice(0, Math.max(1, keys.length - 2)).forEach(k => localStorage.removeItem(k));
}

/* ---- Fetch com timeout ---- */
async function apiFetch(path, timeout = 10000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);
    try {
        const res = await fetch(`${ENEM_API}${path}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(id);
    }
}

/* ---- Buscar anos disponíveis ---- */
async function fetchAvailableYears() {
    const cacheKey = 'enem_exams_v2';
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
    const data = await apiFetch('/exams');
    const years = data.map(e => e.year).filter(y => y >= 2010).sort((a, b) => b - a);
    cacheSet(cacheKey, years);
    return years;
}

/* ---- Buscar todas questões de um ano ---- */
async function fetchAllQuestionsForYear(year) {
    // Chave v3 para invalidar cache antigo gerado com limit=90 (retornava 400)
    const cacheKey = `enem_q3_${year}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    // API aceita no máximo limit=45 por requesição; ENEM tem até 180 questões
    // 4 páginas paralelas — erros individuais retornam vazio (não quebram o fetch)
    const pages = await Promise.all(
        [0, 45, 90, 135].map(offset =>
            apiFetch(`/exams/${year}/questions?limit=45&offset=${offset}`)
                .catch(() => ({ questions: [] }))
        )
    );
    const questions = pages.flatMap(p => p.questions || []);
    if (questions.length === 0) throw new Error(`Sem dados para ${year}`);
    cacheSet(cacheKey, questions);
    return questions;
}

/* ---- Normalizar questão da API → formato app ---- */
function normalizeQuestion(q) {
    const letterToIdx = { A: 0, B: 1, C: 2, D: 3, E: 4 };
    const alts = q.alternatives || [];
    const correctIdx = letterToIdx[q.correctAlternative] ?? 0;

    // A "question" real é o enunciado + o que se pede
    // context = trecho/texto base | alternativesIntroduction = comando da questão
    const questionText = q.alternativesIntroduction
        ? q.alternativesIntroduction
        : (q.context ? q.context.substring(0, 300) : 'Analise e responda.');

    return {
        apiFormat: true,
        area: DISC_LABELS[q.discipline] || 'ENEM',
        tag: `ENEM ${q.year}`,
        question: questionText,
        context: q.context || null,
        files: (q.files || []).filter(f => f && f.startsWith('http')),
        quote: null,
        options: alts.map(a => a.text || '[Ver imagem acima]'),
        alternativeFiles: alts.map(a => (a.file && a.file.startsWith('http') ? a.file : null)),
        correct: correctIdx,
        hint: null,
        explanation: `A alternativa correta é a letra **${q.correctAlternative}**.`,
        year: q.year,
        index: q.index,
        discipline: q.discipline,
    };
}

/* ---- Função principal: pegar questões para o quiz ---- */
async function getQuizQuestions(discipline, count = 10) {
    try {
        const years = await fetchAvailableYears();
        if (!years || years.length === 0) throw new Error('Nenhum ano disponível');

        let pool = [];

        // Busca até 5 anos para ter pool grande o suficiente
        for (let i = 0; i < Math.min(5, years.length); i++) {
            const all = await fetchAllQuestionsForYear(years[i]);
            let filtered;

            if (discipline === 'misto') {
                filtered = all;
            } else {
                const apiDisc = DISC_MAP[discipline];
                filtered = apiDisc ? all.filter(q => q.discipline === apiDisc) : all;
            }

            // Apenas questões com alternativas de texto válidas
            filtered = filtered.filter(q =>
                q.alternatives &&
                q.alternatives.length >= 2 &&
                q.alternatives.some(a => a.text && a.text.trim().length > 5)
            );

            pool = [...pool, ...filtered];
            if (pool.length >= count * 8) break; // Pool com margem ampla
        }

        if (pool.length === 0) throw new Error('Pool vazio');

        // Deduplicação por sessão: preferir questões não vistas
        const seen = getSeenIds();
        const unseen = pool.filter(q => !seen.has(`${q.year}-${q.index}`));
        const source = unseen.length >= count ? unseen : pool;

        // Se usamos todo o pool sem questões novas, resetar o histórico
        if (unseen.length < count) clearSeen();

        const shuffled = [...source].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);
        const normalized = selected.map(normalizeQuestion);

        markSeen(selected);
        return normalized;

    } catch (err) {
        console.warn('⚠️ API indisponível, usando banco local:', err.message);
        return null; // null = usar questões locais
    }
}

/* ---- ENEM Dia completo: 45 questões por caderno em ordem real ---- */
async function getENEMDayQuestions(day = 1) {
    try {
        const config = ENEM_DAY_CONFIG[day];
        if (!config) throw new Error(`Dia inválido: ${day}`);

        const years = await fetchAvailableYears();
        if (!years || years.length === 0) throw new Error('Nenhum ano disponível');

        const result = [];

        for (const caderno of config) {
            // Acumula questões de anos diferentes até ter pelo menos 45 válidas
            const globalSeen = new Set();
            const accumulated = [];

            for (let i = 0; i < Math.min(8, years.length) && accumulated.length < 45; i++) {
                let all;
                try {
                    all = await fetchAllQuestionsForYear(years[i]);
                } catch {
                    continue; // ano indisponível, tenta o próximo
                }

                const filtered = all.filter(q =>
                    q.discipline === caderno.disc &&
                    q.alternatives &&
                    q.alternatives.length >= 2 &&
                    q.alternatives.some(a => a.text && a.text.trim().length > 5)
                ).sort((a, b) => (a.index || 0) - (b.index || 0));

                for (const q of filtered) {
                    const key = `${q.year}-${q.index}`;
                    if (globalSeen.has(key)) continue;
                    globalSeen.add(key);
                    accumulated.push(q);
                    if (accumulated.length === 45) break;
                }
            }

            if (accumulated.length === 0) throw new Error(`Pool vazio para ${caderno.disc}`);

            const normalized = accumulated.map((q, i) => ({
                ...normalizeQuestion(q),
                enemNumber: caderno.start + i,  // número real na prova (1–45 ou 46–90)
                enemArea: caderno.label,         // nome completo do caderno
            }));

            result.push(...normalized);
        }

        return result;

    } catch (err) {
        console.warn('⚠️ getENEMDayQuestions falhou:', err.message);
        return null; // null → startQuiz usa banco local
    }
}

/* ---- Verificar status da API ---- */
async function checkAPIStatus() {
    try {
        const years = await fetchAvailableYears();
        return { ok: true, latestYear: years[0], totalYears: years.length };
    } catch {
        return { ok: false };
    }
}

/* ---- Exposição global ---- */
window.enemAPI = {
    getQuizQuestions,
    getENEMDayQuestions,
    fetchAvailableYears,
    checkAPIStatus,
    DISC_MAP,
    DISC_LABELS,
    ENEM_DAY_CONFIG,
};

/* ---- Limpar cache de chaves geradas com limit=90 (formato antigo) ---- */
(function purgeOldCache() {
    try {
        Object.keys(localStorage)
            .filter(k => /^enem_q_/.test(k) || /^enem_q2_/.test(k))
            .forEach(k => localStorage.removeItem(k));
    } catch { /* noop */ }
})();
