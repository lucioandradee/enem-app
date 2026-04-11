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
    const text = `🎓 *ENEM Master* — Resultado do Simulado\n\n` +
        `📊 *${d.pct}* de acerto em ${d.disc}\n` +
        `✅ ${d.stats}\n` +
        `⚡ ${d.xp} XP ganhos\n` +
        (d.tri ? `🎯 ${d.tri}\n` : '') +
        `\nEstudando no ENEM Master 🚀 — enem.app`;

    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
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

// ── Geração de card visual via Canvas ────────────────────────────────────────
function downloadShareCard() {
    const d = _shareData;
    const canvas = document.createElement('canvas');
    const W = 1080, H = 1080;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Fundo gradiente
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0b0e1a');
    grad.addColorStop(1, '#0d2333');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Grid sutil de pontos
    ctx.fillStyle = 'rgba(0,180,166,0.06)';
    for (let x = 40; x < W; x += 60) {
        for (let y = 40; y < H; y += 60) {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Borda teal arredondada
    const r = 40;
    ctx.strokeStyle = 'rgba(0,180,166,0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(r, 2); ctx.lineTo(W-r, 2);
    ctx.arcTo(W-2, 2, W-2, r, r);
    ctx.lineTo(W-2, H-r);
    ctx.arcTo(W-2, H-2, W-r, H-2, r);
    ctx.lineTo(r, H-2);
    ctx.arcTo(2, H-2, 2, H-r, r);
    ctx.lineTo(2, r);
    ctx.arcTo(2, 2, r, 2, r);
    ctx.stroke();

    // Logo
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.fillStyle = '#00b4a6';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 ENEM MASTER', W/2, 100);

    // Linha separadora
    ctx.strokeStyle = 'rgba(0,180,166,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(120, 125); ctx.lineTo(W-120, 125); ctx.stroke();

    // Percentual de acerto
    ctx.font = 'bold 200px Inter, Arial, sans-serif';
    ctx.fillStyle = '#00e5d4';
    ctx.textAlign = 'center';
    ctx.fillText(d.pct || '—', W/2, 380);

    // DE ACERTO
    ctx.font = 'bold 32px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('DE ACERTO', W/2, 430);

    // Disciplina
    ctx.font = 'bold 48px Inter, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(d.disc || 'Simulado', W/2, 510);

    // Stats
    ctx.font = '34px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(d.stats || '', W/2, 570);

    // TRI se existir
    if (d.tri) {
        ctx.font = 'bold 34px Inter, Arial, sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(d.tri, W/2, 626);
    }

    // XP Badge
    const xpY = d.tri ? 700 : 660;
    ctx.fillStyle = 'rgba(0,180,166,0.2)';
    _roundRect(ctx, W/2 - 130, xpY - 44, 260, 58, 30);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,180,166,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = 'bold 32px Inter, Arial, sans-serif';
    ctx.fillStyle = '#00b4a6';
    ctx.fillText(`⚡ +${d.xp} XP`, W/2, xpY);

    // Linha separadora inferior
    const lineY = xpY + 80;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(120, lineY); ctx.lineTo(W-120, lineY); ctx.stroke();

    // Nome do usuário
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textAlign = 'left';
    ctx.fillText(d.user || 'Estudante', 120, lineY + 60);

    // URL
    ctx.font = '28px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(0,180,166,0.8)';
    ctx.textAlign = 'right';
    ctx.fillText('enem.app', W - 120, lineY + 60);

    // Data
    ctx.font = '24px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText(new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }), W/2, lineY + 115);

    // Download
    try {
        const link = document.createElement('a');
        link.download = 'enem-master-resultado.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        _showQuickToast('🖼️ Card salvo como imagem!');
        closeShareModal();
    } catch {
        _showQuickToast('❌ Não foi possível salvar a imagem');
    }
}

// Compartilhar card via Web Share API (mobile)
async function shareCardNative() {
    if (!navigator.share) {
        downloadShareCard();
        return;
    }
    const d = _shareData;
    try {
        await navigator.share({
            title: 'ENEM Master — Resultado',
            text:  `🎓 ${d.pct} de acerto em ${d.disc}! ${d.stats} · +${d.xp} XP\nenem.app`,
            url:   'https://enem.app',
        });
        closeShareModal();
    } catch {
        // usuário cancelou — sem toast
    }
}

// Compartilhar para o Instagram (stories): salva como imagem
function shareToInstagram() {
    downloadShareCard();
    _showQuickToast('📸 Salve a imagem e abra o Instagram para postar nos Stories!');
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
