// =====================================================
// NOTIFICATIONS
// =====================================================
function renderNotifications() {
    const list = document.getElementById('notif-list');
    const tab = document.querySelector('.notif-tab.active');
    const showUnreadOnly = tab && tab.textContent.trim() === 'N├úo lidas';
    renderNotifList(showUnreadOnly);
}

// Normalizar campo `date` de notifica├º├úo para categoria de exibi├º├úo
function _notifDateGroup(n) {
    // Aceita 'today'/'yesterday' legados e ISO strings das notifica├º├Áes novas
    if (n.date === 'today') return 'today';
    if (n.date === 'yesterday') return 'yesterday';
    if (!n.date) return 'more';
    try {
        const d = new Date(n.date);
        const todayStr = new Date().toDateString();
        const yStr = new Date(Date.now() - 86400000).toDateString();
        if (d.toDateString() === todayStr) return 'today';
        if (d.toDateString() === yStr) return 'yesterday';
        return 'more';
    } catch { return 'more'; }
}

function renderNotifList(unreadOnly = false) {
    const list = document.getElementById('notif-list');
    list.innerHTML = '';

    const notifs = state.notifications || [];
    const filtered = unreadOnly ? notifs.filter(n => n.unread) : notifs;

    const groups = [
        { key: 'today',     label: 'HOJE' },
        { key: 'yesterday', label: 'ONTEM' },
        { key: 'more',      label: 'ANTERIORES' },
    ];

    groups.forEach(g => {
        const items = filtered.filter(n => _notifDateGroup(n) === g.key);
        if (items.length === 0) return;
        const header = document.createElement('div');
        header.className = 'notif-date-group';
        header.textContent = g.label;
        list.appendChild(header);
        items.forEach(n => list.appendChild(createNotifItem(n)));
    });

    if (list.children.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:40px 16px;color:var(--text-muted);font-size:14px;">Nenhuma notifica├º├úo n├úo lida ­ƒÄë</div>';
    }
}

// Telas permitidas em CTAs de notifica├º├úo (whitelist)
const _NOTIF_CTA_ALLOWED = new Set(Object.keys(screenMap));

function createNotifItem(n) {
    const el = document.createElement('div');
    el.className = 'notif-item' + (n.unread ? ' unread' : '');

    // type como classe CSS ÔÇö aceitar apenas valores conhecidos
    const safeType = ['blue','orange','purple','green','yellow','red'].includes(n.type) ? n.type : 'blue';
    const iconWrap = document.createElement('div');
    iconWrap.className = 'notif-icon-wrap ' + safeType;
    iconWrap.textContent = n.icon;  // emoji ÔÇö textContent ├® seguro

    const contentEl = document.createElement('div');
    contentEl.className = 'notif-content';

    const titleEl = document.createElement('div');
    titleEl.className = 'notif-title';
    titleEl.textContent = n.title;

    const bodyEl = document.createElement('div');
    bodyEl.className = 'notif-body';
    bodyEl.textContent = n.body;

    contentEl.appendChild(titleEl);
    contentEl.appendChild(bodyEl);

    // CTA ÔÇö nunca executar string din├ómica; usar rota validada
    if (n.cta && n.ctaScreen && _NOTIF_CTA_ALLOWED.has(n.ctaScreen)) {
        const ctaEl = document.createElement('span');
        ctaEl.className = 'notif-cta';
        ctaEl.textContent = n.cta;
        ctaEl.addEventListener('click', (e) => {
            e.stopPropagation();
            markNotifRead(n.id);
            navigate(n.ctaScreen);
        });
        contentEl.appendChild(ctaEl);
    }

    const rightEl = document.createElement('div');
    rightEl.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0';

    const timeEl = document.createElement('span');
    timeEl.className = 'notif-time';
    timeEl.textContent = n.time;
    rightEl.appendChild(timeEl);

    if (n.unread) {
        const dotEl = document.createElement('div');
        dotEl.className = 'notif-unread-dot';
        rightEl.appendChild(dotEl);
    }

    el.appendChild(iconWrap);
    el.appendChild(contentEl);
    el.appendChild(rightEl);
    el.addEventListener('click', () => markNotifRead(n.id));
    return el;
}

function markNotifRead(id) {
    const n = state.notifications.find(n => n.id === id);
    if (n) {
        n.unread = false;
        saveState();
        renderNotifications();
        // Update bell badge
        const unread = state.notifications.filter(n => n.unread).length;
        const badge = document.getElementById('notif-count');
        if (badge) {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }
    }
}

function markAllRead() {
    state.notifications.forEach(n => n.unread = false);
    saveState();
    renderNotifications();
    const badge = document.getElementById('notif-count');
    if (badge) badge.style.display = 'none';
}

function filterNotif(type, btn) {
    document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderNotifList(type === 'unread');
}

