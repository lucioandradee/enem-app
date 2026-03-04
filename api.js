/* =====================================================
   ENEM MASTER — API Module (api.js)
   Integração com api.enem.dev • Cache localStorage
   ===================================================== */

'use strict';

const ENEM_API = 'https://api.enem.dev/v1';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

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
    const keys = Object.keys(localStorage).filter(k => k.startsWith('enem_q_'));
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
    const cacheKey = `enem_q_${year}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    // Busca com paginação: 2 requests de 90 questões para cobrir as 180
    const [r1, r2] = await Promise.all([
        apiFetch(`/exams/${year}/questions?limit=90&offset=0`),
        apiFetch(`/exams/${year}/questions?limit=90&offset=90`),
    ]);
    const questions = [
        ...(r1.questions || []),
        ...(r2.questions || []),
    ];
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

        // Tenta ano mais recente, e se tiver poucas questões, pega o anterior também
        for (let i = 0; i < Math.min(3, years.length); i++) {
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
            if (pool.length >= count * 3) break; // Pool com margem suficiente
        }

        if (pool.length === 0) throw new Error('Pool vazio');

        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(normalizeQuestion);

    } catch (err) {
        console.warn('⚠️ API indisponível, usando banco local:', err.message);
        return null; // null = usar questões locais
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
    fetchAvailableYears,
    checkAPIStatus,
    DISC_MAP,
    DISC_LABELS,
};
