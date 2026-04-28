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

/* Offset fixo de cada disciplina no exame ENEM (Q.1-45, Q.46-90, ...) */
const DISC_OFFSET = {
    'linguagens':        0,
    'ciencias-humanas':  45,
    'ciencias-natureza': 90,
    'matematica':        135,
};

/* ---- Cache helpers ---- */
// Dois níveis: memória (instântaneo, sem JSON.parse) + localStorage (persistência)
const _memCache = new Map();

function cacheGet(key) {
    if (_memCache.has(key)) return _memCache.get(key); // hit: sem JSON.parse
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw); // parse só 1x por chave por sessão
        if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
        _memCache.set(key, data); // promove para memória
        return data;
    } catch { return null; }
}

function cacheSet(key, data) {
    _memCache.set(key, data); // memória imediata
    try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {
        console.warn('Cache cheio, limpando itens antigos...');
        clearOldCache();
        try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch { /* noop */ }
    }
}

function clearOldCache() {
    const keys = Object.keys(localStorage).filter(k => /^enem_q[234c]/.test(k));
    keys.sort();
    keys.slice(0, Math.max(1, keys.length - 2)).forEach(k => localStorage.removeItem(k));
}

/* ---- Fetch com timeout ---- */
async function apiFetch(path, timeout = 5000) {
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

/* ---- Buscar 1 caderno de 1 ano (1 request, cache leve por disciplina) ---- */
async function fetchDisciplineQuestions(year, disc) {
    const cacheKey = `enem_qc_${year}_${disc}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
    const offset = DISC_OFFSET[disc] • 0;
    // Timeout de 4s por request individual (antes era 5s global)
    const data = await apiFetch(`/exams/${year}/questions?limit=45&offset=${offset}`, 4000);
    const questions = (data.questions || []).filter(q => q.discipline === disc);
    if (questions.length > 0) cacheSet(cacheKey, questions);
    return questions;
}

/* ---- Pré-aquecer cache silenciosamente (fire-and-forget) ---- */
async function prewarmENEM(yearsCount = 2) {
    try {
        const years = await fetchAvailableYears();
        if (!years || !years.length) return;
        const off = _getYearOffset ? _getYearOffset(years) : 0;
        const rotated = [...years.slice(off), ...years.slice(0, off)];
        const top = rotated.slice(0, Math.min(yearsCount, rotated.length));
        // Todos os cadernos dos primeiros N anos em paralelo — cache fica pronto antes do clique
        await Promise.all(
            top.flatMap(y => Object.keys(DISC_OFFSET).map(d => fetchDisciplineQuestions(y, d).catch(() => {})))
        );
    } catch { /* noop */ }
}

/* ---- Normalizar questão da API → formato app ---- */
function normalizeQuestion(q) {
    const letterToIdx = { A: 0, B: 1, C: 2, D: 3, E: 4 };
    const alts = q.alternatives || [];
    const correctIdx = letterToIdx[q.correctAlternative] • 0;

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

/* ---- Leitura de cache apenas (sem rede, 0ms) ---- */
// Usado no caminho crítico do startQuiz para eliminar qualquer espera
function getQuizQuestionsIfCached(discipline, count) {
    try {
        const years = cacheGet('enem_exams_v2');
        if (!years || years.length === 0) return null;

        const off = _getYearOffset(years);
        const rotated = [...years.slice(off), ...years.slice(0, off)];

        const discs = discipline === 'misto'
            ? Object.keys(DISC_OFFSET)
            : [DISC_MAP[discipline]].filter(Boolean);

        let pool = [];
        for (const year of rotated.slice(0, 4)) {
            for (const disc of discs) {
                const qs = cacheGet(`enem_qc_${year}_${disc}`);
                if (!qs) continue;
                const valid = qs.filter(q =>
                    q.alternatives && q.alternatives.length >= 2 &&
                    q.alternatives.some(a => a.text && a.text.trim().length > 5)
                );
                pool = [...pool, ...valid];
            }
        }

        if (pool.length < count) return null;

        const seen = getSeenIds();
        const unseen = pool.filter(q => !seen.has(`${q.year}-${q.index}`));
        const source = unseen.length >= count ? unseen : pool;
        if (unseen.length < count) clearSeen();

        const selected = [...source].sort(() => Math.random() - 0.5).slice(0, count);
        markSeen(selected);
        return selected.map(normalizeQuestion);
    } catch { return null; }
}

function getENEMDayQuestionsIfCached(day) {
    try {
        const years = cacheGet('enem_exams_v2');
        if (!years || years.length === 0) return null;

        const config = ENEM_DAY_CONFIG[day];
        if (!config) return null;

        const off = _getYearOffset(years);
        const rotated = [...years.slice(off), ...years.slice(0, off)];

        const results = [];
        for (const caderno of config) {
            const pool = [];
            for (const year of rotated.slice(0, 4)) {
                const qs = cacheGet(`enem_qc_${year}_${caderno.disc}`);
                if (!qs) continue;
                pool.push(...qs.filter(q =>
                    q.alternatives && q.alternatives.length >= 2 &&
                    q.alternatives.some(a => a.text && a.text.trim().length > 5)
                ));
            }
            if (pool.length < 45) return null; // caderno incompleto → fallback
            const selected = [...pool].sort(() => Math.random() - 0.5).slice(0, 45);
            selected.forEach((q, i) => results.push({
                ...normalizeQuestion(q),
                enemNumber: caderno.start + i,
                enemArea: caderno.label,
            }));
        }
        return results.length > 0 ? results : null;
    } catch { return null; }
}

/* ---- Rotação de anos por sessão (garante variedade de questões) ---- */
function _getYearOffset(years) {
    const key = 'enem_yr_off';
    let off = parseInt(sessionStorage.getItem(key) || '-1');
    if (off < 0 || off >= years.length) {
        off = Math.floor(Math.random() * Math.min(years.length, 6));
        try { sessionStorage.setItem(key, String(off)); } catch {}
    }
    return off;
}

/* ---- Função principal: pegar questões para o quiz ---- */
async function getQuizQuestions(discipline, count = 10) {
    try {
        const years = await fetchAvailableYears();
        if (!years || years.length === 0) throw new Error('Nenhum ano disponível');

        const off = _getYearOffset(years);
        const rotated = [...years.slice(off), ...years.slice(0, off)];
        const batch = rotated.slice(0, Math.min(3, rotated.length));

        let pool = [];
        const apiDisc = DISC_MAP[discipline];

        if (discipline !== 'misto' && apiDisc && DISC_OFFSET[apiDisc] !== undefined) {
            // Disciplina específica: busca só o offset certo (1 request por ano, 3 em paralelo)
            const pages = await Promise.all(batch.map(y => fetchDisciplineQuestions(y, apiDisc).catch(() => [])));
            for (const qs of pages) {
                const filtered = qs.filter(q =>
                    q.alternatives && q.alternatives.length >= 2 &&
                    q.alternatives.some(a => a.text && a.text.trim().length > 5)
                );
                pool = [...pool, ...filtered];
            }
        } else {
            // Misto: busca as 4 disciplinas individualmente em paralelo (requests menores)
            const allPages = await Promise.all(
                batch.flatMap(y => Object.keys(DISC_OFFSET).map(d => fetchDisciplineQuestions(y, d).catch(() => [])))
            );
            for (const qs of allPages) {
                const filtered = qs.filter(q =>
                    q.alternatives && q.alternatives.length >= 2 &&
                    q.alternatives.some(a => a.text && a.text.trim().length > 5)
                );
                pool = [...pool, ...filtered];
            }
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

/* ---- ENEM Dia completo: fetch direto por disciplina, cache quente = instantâneo ---- */
async function getENEMDayQuestions(day = 1) {
    // Busca 45 questões de UM caderno usando o offset fixo da disciplina (1 req/ano)
    async function _fetchCaderno(caderno, rotatedYears) {
        const seen = new Set();
        const acc  = [];
        for (const year of rotatedYears.slice(0, 3)) {
            if (acc.length >= 45) break;
            const qs = await fetchDisciplineQuestions(year, caderno.disc).catch(() => []);
            const valid = qs.filter(q =>
                q.alternatives && q.alternatives.length >= 2 &&
                q.alternatives.some(a => a.text && a.text.trim().length > 5)
            );
            for (const q of [...valid].sort(() => Math.random() - 0.5)) {
                const k = `${q.year}-${q.index}`;
                if (seen.has(k)) continue;
                seen.add(k); acc.push(q);
                if (acc.length === 45) break;
            }
        }
        if (acc.length === 0) throw new Error(`Pool vazio para ${caderno.disc}`);
        return acc;
    }

    try {
        const config = ENEM_DAY_CONFIG[day];
        if (!config) throw new Error(`Dia inválido: ${day}`);

        const years = await fetchAvailableYears();
        if (!years || years.length === 0) throw new Error('Nenhum ano disponível');

        const off = _getYearOffset(years);
        const rotated = [...years.slice(off), ...years.slice(0, off)];

        // Ambos cadernos em paralelo — se cache estiver quente = ~0ms
        const [c1, c2] = await Promise.all(config.map(c => _fetchCaderno(c, rotated)));

        const result = [];
        [c1, c2].forEach((qs, ci) => {
            qs.slice(0, 45).forEach((q, i) => {
                result.push({
                    ...normalizeQuestion(q),
                    enemNumber: config[ci].start + i,
                    enemArea: config[ci].label,
                });
            });
        });
        return result;

    } catch (err) {
        console.warn('⚠️ getENEMDayQuestions falhou:', err.message);
        return null;
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
    getQuizQuestionsIfCached,
    getENEMDayQuestionsIfCached,
    fetchAvailableYears,
    checkAPIStatus,
    prewarmENEM,
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
