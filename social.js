// =====================================================
// COUNTDOWN ENEM 2026 + MOTIVAÇÃO
// =====================================================
let _countdownInterval = null;

// Mensagens motivacionais baseadas nos dias restantes
function _getCountdownMotivation(days) {
    if (days > 300) return { msg: 'Comece agora — cada dia conta! 💪', color: '#00b4a6' };
    if (days > 180) return { msg: 'Ainda há muito tempo — foco na base! 📚', color: '#00b4a6' };
    if (days > 90)  return { msg: 'Reta final chegando — intensifique os estudos! 🔥', color: '#fbbf24' };
    if (days > 30)  return { msg: 'Um mês! Revise os tópicos mais difíceis 📝', color: '#f97316' };
    if (days > 7)   return { msg: 'Na última semana! Priorize revisão e descanso 😴', color: '#f87171' };
    if (days > 0)   return { msg: `Faltam apenas ${days} dias — você chegou até aqui! 🚀`, color: '#f87171' };
    return { msg: 'Boa prova! Você se preparou — confie em você! 🌟', color: '#4ade80' };
}

function renderENEMCountdown() {
    const ENEM_DATE = new Date('2026-11-08T13:00:00'); // 1º dia ENEM 2026
    const widget    = document.getElementById('enem-countdown');
    if (!widget) return;

    function _tick() {
        const now  = new Date();
        const diff = ENEM_DATE - now;
        if (diff <= 0) {
            widget.style.display = 'none';
            if (_countdownInterval) clearInterval(_countdownInterval);
            return;
        }
        const days = Math.floor(diff / (1000*60*60*24));
        const h    = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
        const m    = Math.floor((diff % (1000*60*60)) / (1000*60));
        const s    = Math.floor((diff % (1000*60)) / 1000);

        const dEl = document.getElementById('countdown-days');
        const hEl = document.getElementById('cd-h');
        const mEl = document.getElementById('cd-m');
        const sEl = document.getElementById('cd-s');
        const motEl = document.getElementById('countdown-motivation');

        if (dEl) dEl.textContent = days;
        if (hEl) hEl.textContent = String(h).padStart(2,'0');
        if (mEl) mEl.textContent = String(m).padStart(2,'0');
        if (sEl) sEl.textContent = String(s).padStart(2,'0');

        if (motEl) {
            const { msg, color } = _getCountdownMotivation(days);
            motEl.textContent = msg;
            motEl.style.color = color;
        }
    }

    _tick();
    if (_countdownInterval) clearInterval(_countdownInterval);
    _countdownInterval = setInterval(_tick, 1000);
}

// =====================================================
// PUSH NOTIFICATIONS — lembretes diários de estudo
// =====================================================
async function requestPushPermission() {
    const btn      = document.getElementById('push-notif-btn');
    const statusEl = document.getElementById('push-notif-status');

    if (!('Notification' in window)) {
        if (statusEl) statusEl.textContent = 'Seu navegador não suporta notificações';
        return;
    }
    if (Notification.permission === 'granted') {
        if (statusEl) statusEl.textContent = '✅ Notificações já estão ativadas!';
        if (btn) { btn.textContent = 'Ativado ✓'; btn.disabled = true; }
        _scheduleDailyStudyReminder();
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        if (statusEl) statusEl.textContent = '✅ Lembretes de estudo ativados com sucesso!';
        if (btn) { btn.textContent = 'Ativado ✓'; btn.disabled = true; }
        state.user.pushEnabled = true;
        saveState();
        _showQuickToast('🔔 Notificações push ativadas!');
        _scheduleDailyStudyReminder();
    } else {
        if (statusEl) statusEl.textContent = 'Permissão negada — ative nas configurações do navegador';
    }
}

// Agenda um lembrete diário de estudo para às 20h
function _scheduleDailyStudyReminder() {
    if (Notification.permission !== 'granted') return;

    const todayKey = new Date().toDateString();
    const lastScheduled = localStorage.getItem('enem_push_scheduled');
    if (lastScheduled === todayKey) return; // já agendou hoje

    const now = new Date();
    const target = new Date();
    target.setHours(20, 0, 0, 0); // 20:00 local

    // Se já passou das 20h, agenda para a hora + 1min (lembrete imediato de conquista diária)
    let delay = target - now;
    if (delay < 0) delay = 60 * 1000;

    const msgs = [
        { title:'📚 Hora de estudar!',           body:'Você tem questões te esperando. Bora revisar antes de dormir?' },
        { title:'🔥 Mantenha seu streak!',        body:'Estude pelo menos 10 minutos hoje para não perder sua sequência!' },
        { title:'🎯 ENEM cada vez mais perto!',   body:'Que tal um simulado rápido agora? Cada questão conta!' },
        { title:'⚡ Revise um flashcard hoje!',   body:'5 minutinhos de revisão no ENEM Master — vá lá!' },
        { title:'🏆 Ranking espera por você!',    body:'Outros estudantes estão avançando. Jogue algumas questões!' },
    ];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    setTimeout(() => {
        if (Notification.permission === 'granted') {
            const n = new Notification(msg.title, {
                body: msg.body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'enem-daily-reminder',
            });
            n.onclick = () => { window.focus(); n.close(); };
        }
        localStorage.setItem('enem_push_scheduled', todayKey);
    }, delay);
}

function _renderPushNotifCard() {
    const btn      = document.getElementById('push-notif-btn');
    const statusEl = document.getElementById('push-notif-status');
    if (!btn || !statusEl || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
        statusEl.textContent = '✅ Lembretes de estudo ativados!';
        btn.textContent = 'Ativado ✓';
        btn.disabled = true;
        _scheduleDailyStudyReminder(); // reagenda ao abrir o app
    } else if (Notification.permission === 'denied') {
        statusEl.textContent = 'Bloqueado — ative nas configurações do navegador';
        btn.textContent = 'Bloqueado';
        btn.disabled = true;
        btn.style.background = '#6b7280';
    }
}

// =====================================================
// SOCIAL — CARDS VISUAIS PARA COMPARTILHAR
// =====================================================
let _shareData = {};

function shareResult() {
    const pct     = document.getElementById('result-pct')?.textContent || '—';
    const correct = document.getElementById('res-correct')?.textContent || '—';
    const wrong   = document.getElementById('res-wrong')?.textContent  || '—';
    const xp      = document.getElementById('res-xp')?.textContent     || '—';
    const tri     = document.getElementById('result-tri-score')?.textContent;

    const discLabels = {
        misto:'Todas as Áreas', humanas:'Ciências Humanas', natureza:'Ciências da Natureza',
        linguagens:'Linguagens', matematica:'Matemática', 'enem-dia1':'1º Dia ENEM', 'enem-dia2':'2º Dia ENEM',
    };

    _shareData = {
        pct,
        disc: discLabels[quizState.discipline] || 'Simulado',
        stats: `${correct} acertos · ${wrong} erros`,
        xp,
        tri: tri && tri !== '—' ? `Estimativa ENEM: ${tri}` : '',
        user: state.user.name || 'Estudante',
    };

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('sc-pct',   pct);
    set('sc-disc',  _shareData.disc);
    set('sc-stats', _shareData.stats);
    set('sc-xp',    xp);
    set('sc-tri',   _shareData.tri);
    set('sc-user',  _shareData.user);

    const overlay = document.getElementById('share-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function closeShareModal() {
    const overlay = document.getElementById('share-modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

function shareViaWhatsapp() {
    const d = _shareData;
    const canvas = _generateQuizStoryCanvas(d);
    _downloadCanvas(canvas, 'enem-resultado.png');
    const txt = encodeURIComponent(
        '🎓 Fiz um simulado no *ENEM Master* e tirei *' + d.pct + '* de acerto!\n' +
        '📲 Estude grátis também → enem.app'
    );
    setTimeout(() => window.open('https://wa.me/?text=' + txt, '_blank', 'noopener,noreferrer'), 380);
    _showQuickToast('📲 Arte salva! Anexe a imagem no WhatsApp');
    closeShareModal();
}

function copyShareText() {
    const d = _shareData;
    const text = `🎓 ENEM Master — ${d.disc}\n${d.pct} de acerto · ${d.stats}\n${d.xp} XP` +
        (d.tri ? `\n${d.tri}` : '') + `\nenem.app`;

    navigator.clipboard?.writeText(text).then(() => {
        _showQuickToast('📋 Texto copiado!');
        closeShareModal();
    }).catch(() => _showQuickToast('❌ Não foi possível copiar'));
}

// ── Helpers utilitários de Canvas ───────────────────────────────────────────

function _dataURLtoBlob(dataURL) {
    const parts = dataURL.split(',');
    const mime  = parts[0].match(/:(.*?);/)[1];
    const raw   = atob(parts[1]);
    const arr   = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return new Blob([arr], { type: mime });
}

function _downloadCanvas(canvas, filename) {
    try {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch { /* silently ignore */ }
}

function _drawSep(ctx, x1, y, x2, midColor) {
    const g = ctx.createLinearGradient(x1, 0, x2, 0);
    g.addColorStop(0, 'transparent');
    g.addColorStop(0.5, midColor);
    g.addColorStop(1, 'transparent');
    ctx.strokeStyle = g; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
}

// ── Geração de Story (1080×1920) — Resultado de Simulado ─────────────────────

function _generateQuizStoryCanvas(d) {
    const canvas = document.createElement('canvas');
    const W = 1080, H = 1920;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Fundo gradiente escuro premium
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,    '#060c18');
    bg.addColorStop(0.45, '#0a1628');
    bg.addColorStop(1,    '#07101f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Glow teal superior
    const gT = ctx.createRadialGradient(W/2, 80, 0, W/2, 80, 820);
    gT.addColorStop(0, 'rgba(0,180,166,0.30)'); gT.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gT; ctx.fillRect(0, 0, W, 900);

    // Glow violeta inferior
    const gB = ctx.createRadialGradient(W/2, H, 0, W/2, H, 680);
    gB.addColorStop(0, 'rgba(99,102,241,0.24)'); gB.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gB; ctx.fillRect(0, H - 720, W, 720);

    // Pontos decorativos
    ctx.fillStyle = 'rgba(0,180,166,0.055)';
    for (let x = 70; x < W; x += 90)
        for (let y = 70; y < H; y += 90) {
            ctx.beginPath(); ctx.arc(x, y, 2.8, 0, Math.PI * 2); ctx.fill();
        }

    // Borda gradiente
    const brd = ctx.createLinearGradient(0, 0, W, H);
    brd.addColorStop(0,   'rgba(0,229,212,0.85)');
    brd.addColorStop(0.5, 'rgba(99,102,241,0.35)');
    brd.addColorStop(1,   'rgba(0,229,212,0.85)');
    ctx.strokeStyle = brd; ctx.lineWidth = 3.5;
    _roundRect(ctx, 14, 14, W - 28, H - 28, 55); ctx.stroke();

    // Logo pill
    ctx.fillStyle = 'rgba(0,180,166,0.14)';
    _roundRect(ctx, W/2 - 218, 72, 436, 90, 45); ctx.fill();
    ctx.strokeStyle = 'rgba(0,180,166,0.48)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = 'bold 40px Inter, Arial, sans-serif';
    ctx.fillStyle = '#00e5d4'; ctx.textAlign = 'center';
    ctx.fillText('🎓 ENEM MASTER', W/2, 132);

    // Data
    ctx.font = '29px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.fillText(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), W/2, 207);

    // Título da seção
    ctx.font = 'bold 50px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.50)';
    ctx.fillText('RESULTADO DO SIMULADO', W/2, 295);

    _drawSep(ctx, 80, 330, W - 80, 'rgba(0,180,166,0.55)');

    // Percentual gigante com gradiente
    const pG = ctx.createLinearGradient(0, 380, 0, 760);
    pG.addColorStop(0, '#00e5d4'); pG.addColorStop(1, '#00a896');
    ctx.fillStyle = pG;
    ctx.font = 'bold 240px Inter, Arial, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(d.pct || '—', W/2, 745);

    ctx.font = 'bold 44px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.fillText('DE ACERTO', W/2, 803);

    // Disciplina (auto-resize para texto longo)
    const discText = d.disc || 'Simulado';
    ctx.font = 'bold 58px Inter, Arial, sans-serif';
    if (ctx.measureText(discText).width > 920) ctx.font = 'bold 46px Inter, Arial, sans-serif';
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    ctx.fillText(discText, W/2, 900);

    // Stats (acertos · erros)
    ctx.font = '42px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.60)';
    ctx.fillText(d.stats || '', W/2, 968);

    // TRI (condicional)
    let nextY = 1050;
    if (d.tri) {
        ctx.fillStyle = 'rgba(251,191,36,0.13)';
        _roundRect(ctx, W/2 - 340, nextY - 56, 680, 82, 41); ctx.fill();
        ctx.strokeStyle = 'rgba(251,191,36,0.44)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.font = 'bold 40px Inter, Arial, sans-serif'; ctx.fillStyle = '#fbbf24';
        ctx.fillText(d.tri, W/2, nextY + 5);
        nextY += 124;
    }

    // XP badge
    ctx.fillStyle = 'rgba(0,180,166,0.18)';
    _roundRect(ctx, W/2 - 210, nextY - 58, 420, 86, 43); ctx.fill();
    ctx.strokeStyle = 'rgba(0,180,166,0.55)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = 'bold 46px Inter, Arial, sans-serif'; ctx.fillStyle = '#00b4a6';
    ctx.fillText('⚡ +' + d.xp + ' XP', W/2, nextY + 5);

    // Nome do usuário
    ctx.font = 'bold 42px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.fillText(d.user || 'Estudante', W/2, nextY + 170);

    // Separador CTA
    const divY = 1598;
    _drawSep(ctx, 80, divY, W - 80, 'rgba(255,255,255,0.10)');

    // Bloco CTA com fundo
    ctx.fillStyle = 'rgba(0,180,166,0.09)';
    _roundRect(ctx, 55, divY + 22, W - 110, 280, 42); ctx.fill();
    ctx.strokeStyle = 'rgba(0,180,166,0.22)'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.font = 'bold 50px Inter, Arial, sans-serif'; ctx.fillStyle = '#ffffff';
    ctx.fillText('Você também consegue! 🚀', W/2, divY + 108);

    ctx.font = '38px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.fillText('Estude para o ENEM com IA — grátis', W/2, divY + 164);

    // Botão CTA
    const ctaG = ctx.createLinearGradient(W/2 - 275, 0, W/2 + 275, 0);
    ctaG.addColorStop(0, '#00b4a6'); ctaG.addColorStop(1, '#007d87');
    ctx.fillStyle = ctaG;
    _roundRect(ctx, W/2 - 275, divY + 193, 550, 90, 45); ctx.fill();
    ctx.font = 'bold 40px Inter, Arial, sans-serif'; ctx.fillStyle = '#ffffff';
    ctx.fillText('Começar GRÁTIS → enem.app', W/2, divY + 251);

    return canvas;
}

// ── Geração de Story (1080×1920) — Retrospectiva Mensal ──────────────────────

function _generateRetroStoryCanvas(retro, monthLabel, userName, streak) {
    const canvas = document.createElement('canvas');
    const W = 1080, H = 1920;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Fundo
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,    '#060c18');
    bg.addColorStop(0.45, '#0a1220');
    bg.addColorStop(1,    '#070d1c');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const gT = ctx.createRadialGradient(W/2, 60, 0, W/2, 60, 840);
    gT.addColorStop(0, 'rgba(0,180,166,0.30)'); gT.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gT; ctx.fillRect(0, 0, W, 920);

    const gB = ctx.createRadialGradient(W/2, H, 0, W/2, H, 680);
    gB.addColorStop(0, 'rgba(99,102,241,0.24)'); gB.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gB; ctx.fillRect(0, H - 720, W, 720);

    ctx.fillStyle = 'rgba(0,180,166,0.055)';
    for (let x = 70; x < W; x += 90)
        for (let y = 70; y < H; y += 90) {
            ctx.beginPath(); ctx.arc(x, y, 2.8, 0, Math.PI * 2); ctx.fill();
        }

    const brd = ctx.createLinearGradient(0, 0, W, H);
    brd.addColorStop(0, 'rgba(0,229,212,0.85)');
    brd.addColorStop(0.5, 'rgba(99,102,241,0.35)');
    brd.addColorStop(1, 'rgba(0,229,212,0.85)');
    ctx.strokeStyle = brd; ctx.lineWidth = 3.5;
    _roundRect(ctx, 14, 14, W - 28, H - 28, 55); ctx.stroke();

    // Logo
    ctx.fillStyle = 'rgba(0,180,166,0.14)';
    _roundRect(ctx, W/2 - 218, 72, 436, 90, 45); ctx.fill();
    ctx.strokeStyle = 'rgba(0,180,166,0.48)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = 'bold 40px Inter, Arial, sans-serif';
    ctx.fillStyle = '#00e5d4'; ctx.textAlign = 'center';
    ctx.fillText('🎓 ENEM MASTER', W/2, 132);

    // Título Wrapped
    ctx.font = 'bold 50px Inter, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ENEM Master Wrapped ✨', W/2, 225);

    // Mês/Ano
    ctx.font = 'bold 44px Inter, Arial, sans-serif';
    ctx.fillStyle = '#00e5d4';
    ctx.fillText(monthLabel, W/2, 285);

    _drawSep(ctx, 80, 320, W - 80, 'rgba(0,180,166,0.55)');

    // Grade 2×2 de stats principais
    const gX = 60, gY = 348, cW = (W - gX * 2 - 16) / 2, cH = 240;
    const cells = [
        { icon: '📚', value: retro.totalQuestoes.toLocaleString('pt-BR'), label: 'Questões'      },
        { icon: '🎯', value: retro.accuracy + '%',                         label: 'Taxa de Acerto' },
        { icon: '⚡', value: retro.totalXP.toLocaleString('pt-BR'),        label: 'XP Ganho'      },
        { icon: '📅', value: String(retro.uniqueDays),                     label: 'Dias Estudados' },
    ];

    cells.forEach((cell, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const cx = gX + col * (cW + 16);
        const cy = gY + row * (cH + 16);

        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        _roundRect(ctx, cx, cy, cW, cH, 28); ctx.fill();
        ctx.strokeStyle = 'rgba(0,180,166,0.22)'; ctx.lineWidth = 1.5; ctx.stroke();

        ctx.font = '54px Inter, Arial, sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff'; ctx.fillText(cell.icon, cx + cW / 2, cy + 72);

        ctx.font = (cell.value.length > 7 ? 'bold 50px' : 'bold 66px') + ' Inter, Arial, sans-serif';
        const vG = ctx.createLinearGradient(cx, cy + 90, cx, cy + 175);
        vG.addColorStop(0, '#00e5d4'); vG.addColorStop(1, '#00a896');
        ctx.fillStyle = vG;
        ctx.fillText(cell.value, cx + cW / 2, cy + 160);

        ctx.font = '30px Inter, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.48)';
        ctx.fillText(cell.label, cx + cW / 2, cy + 207);
    });

    // Separador pós-grade
    const hl1Y = gY + 2 * (cH + 16) + 28;
    _drawSep(ctx, 80, hl1Y, W - 80, 'rgba(255,255,255,0.12)');

    // Highlights (tempo, simulados, melhor, foco)
    const aN = retro.areaNames || { humanas:'Humanas', natureza:'Natureza', linguagens:'Linguagens', matematica:'Mat.', misto:'Misto' };
    const aI = retro.areaIcons || { humanas:'📚', natureza:'🔬', linguagens:'📝', matematica:'➗', misto:'🎯' };

    const highlights = [];
    if (retro.studyHours) highlights.push({ icon: '🕐', label: 'Tempo de estudo', value: retro.studyHours });
    if (retro.simulados)  highlights.push({ icon: '📋', label: 'Simulados feitos', value: retro.simulados + (retro.simulados !== 1 ? ' simulados' : ' simulado') });
    if (retro.bestArea)   highlights.push({ icon: '🏆', label: 'Melhor matéria',   value: aI[retro.bestArea.disc] + ' ' + aN[retro.bestArea.disc] + ' (' + retro.bestArea.pct + '%)' });
    if (retro.worstArea)  highlights.push({ icon: '⚔️',  label: 'Focar mais em',    value: aI[retro.worstArea.disc] + ' ' + aN[retro.worstArea.disc] });

    let hlY = hl1Y + 38;
    const hlH = 100;
    highlights.forEach(hl => {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        _roundRect(ctx, 60, hlY, W - 120, hlH - 12, 22); ctx.fill();

        ctx.font = '38px Inter, Arial, sans-serif'; ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff'; ctx.fillText(hl.icon, 100, hlY + 60);

        ctx.font = '32px Inter, Arial, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText(hl.label, 162, hlY + 53);

        ctx.font = 'bold 32px Inter, Arial, sans-serif'; ctx.fillStyle = '#00e5d4';
        ctx.textAlign = 'right'; ctx.fillText(hl.value, W - 100, hlY + 62);

        ctx.textAlign = 'center';
        hlY += hlH;
    });

    // Streak pill
    hlY += 8;
    ctx.fillStyle = 'rgba(251,113,133,0.13)';
    _roundRect(ctx, W/2 - 240, hlY, 480, 76, 38); ctx.fill();
    ctx.strokeStyle = 'rgba(251,113,133,0.38)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = 'bold 34px Inter, Arial, sans-serif'; ctx.fillStyle = '#fb7185';
    ctx.fillText('🔥 Sequência: ' + streak + ' dia' + (streak !== 1 ? 's' : ''), W/2, hlY + 46);

    // Nome
    ctx.font = 'bold 40px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(userName, W/2, hlY + 148);

    // Separador CTA
    const divY = 1598;
    _drawSep(ctx, 80, divY, W - 80, 'rgba(255,255,255,0.10)');

    // Bloco CTA
    ctx.fillStyle = 'rgba(0,180,166,0.09)';
    _roundRect(ctx, 55, divY + 22, W - 110, 280, 42); ctx.fill();
    ctx.strokeStyle = 'rgba(0,180,166,0.22)'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.font = 'bold 50px Inter, Arial, sans-serif'; ctx.fillStyle = '#ffffff';
    ctx.fillText('Seu progresso é real! 🚀', W/2, divY + 108);

    ctx.font = '38px Inter, Arial, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.fillText('Estude para o ENEM com IA — grátis', W/2, divY + 164);

    const ctaG = ctx.createLinearGradient(W/2 - 275, 0, W/2 + 275, 0);
    ctaG.addColorStop(0, '#00b4a6'); ctaG.addColorStop(1, '#007d87');
    ctx.fillStyle = ctaG;
    _roundRect(ctx, W/2 - 275, divY + 193, 550, 90, 45); ctx.fill();
    ctx.font = 'bold 40px Inter, Arial, sans-serif'; ctx.fillStyle = '#ffffff';
    ctx.fillText('Começar GRÁTIS → enem.app', W/2, divY + 251);

    return canvas;
}

// ── Download e Compartilhamento — Quiz Result ────────────────────────────────

function downloadShareCard() {
    const canvas = _generateQuizStoryCanvas(_shareData);
    _downloadCanvas(canvas, 'enem-resultado.png');
    _showQuickToast('🖼️ Arte salva! Compartilhe nos Stories');
    closeShareModal();
}

async function shareCardNative() {
    await document.fonts.ready;
    const canvas = _generateQuizStoryCanvas(_shareData);
    const dataURL = canvas.toDataURL('image/png');

    if (navigator.share) {
        try {
            const blob = _dataURLtoBlob(dataURL);
            const file = new File([blob], 'enem-resultado.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'ENEM Master — Resultado' });
            } else {
                await navigator.share({ title: 'ENEM Master', url: 'https://enem.app' });
            }
        } catch { /* usuário cancelou */ }
    } else {
        _downloadCanvas(canvas, 'enem-resultado.png');
        _showQuickToast('🖼️ Arte salva! Compartilhe nos Stories');
    }
    closeShareModal();
}

function shareToInstagram() {
    const canvas = _generateQuizStoryCanvas(_shareData);
    _downloadCanvas(canvas, 'enem-resultado.png');
    _showQuickToast('📸 Arte salva! Abra o Instagram e poste nos Stories');
    closeShareModal();
}

// ── Download e Compartilhamento — Retrospectiva ──────────────────────────────

function downloadRetroCard(retro, monthLabel, userName, streak) {
    const canvas = _generateRetroStoryCanvas(retro, monthLabel, userName, streak);
    _downloadCanvas(canvas, 'enem-wrapped-' + monthLabel.replace(' ', '-').toLowerCase() + '.png');
    _showQuickToast('🖼️ Arte do Wrapped salva! Compartilhe nos Stories');
}

async function shareRetroNative(retro, monthLabel, userName, streak) {
    await document.fonts.ready;
    const canvas = _generateRetroStoryCanvas(retro, monthLabel, userName, streak);
    const dataURL = canvas.toDataURL('image/png');

    if (navigator.share) {
        try {
            const blob = _dataURLtoBlob(dataURL);
            const file = new File([blob], 'enem-wrapped.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'ENEM Master Wrapped — ' + monthLabel });
            } else {
                _downloadCanvas(canvas, 'enem-wrapped.png');
                _showQuickToast('🖼️ Arte salva! Compartilhe nos Stories 🎉');
            }
        } catch { /* usuário cancelou */ }
    } else {
        _downloadCanvas(canvas, 'enem-wrapped.png');
        _showQuickToast('🖼️ Arte salva! Compartilhe no Instagram ou WhatsApp 🎉');
    }
}

// Compartilha stats do perfil (streak, XP, nível)
function shareProfile() {
    const { name, xp, level, streak } = state.user;
    _shareData = {
        pct:    `Nível ${level || 1}`,
        disc:   'Perfil de Estudante',
        stats:  `${xp || 0} XP · 🔥 ${streak || 0} dias seguidos`,
        xp:     xp || 0,
        tri:    '',
        user:   name || 'Estudante',
    };

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('sc-pct',   `LVL ${level || 1}`);
    set('sc-disc',  'Perfil de Estudante');
    set('sc-stats', `${xp || 0} XP · 🔥 ${streak || 0} dias`);
    set('sc-xp',    `+${xp || 0} XP acumulados`);
    set('sc-tri',   '');
    set('sc-user',  name || 'Estudante');

    const overlay = document.getElementById('share-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
}

// Helper: retângulo arredondado no canvas
function _roundRect(ctx, x, y, w, h, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y, x + w, y + radius, radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x, y + h, x, y + h - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}
