// send-push — Edge Function
// Envia Web Push para todos os assinantes ativos.
// Chamada pelo pg_cron às 8h e 20h (horário de Brasília).

// @deno-types="npm:@types/web-push"
import webpush from 'npm:web-push';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MORNING_MSGS = [
  { title: '☀️ Bom dia, {nome}!', body: 'Que tal começar o dia com 5 questõezinhas? Seu cérebro agradece 🧠' },
  { title: 'Oi, {nome}! Tá acordad@? 👀', body: 'Um exercício rápido agora vale mais que horas na véspera. Bora lá?' },
  { title: '🌅 Novo dia, nova chance!', body: 'Hoje pode ser o dia que você bate seu recorde no simulado. Tenta!' },
  { title: '{nome}, o ENEM não espera ⏰', body: 'Separa 10 minutinhos agora. Amanhã você vai se agradecer.' },
  { title: '🔥 Sequência em risco!', body: 'Não deixa seu streak quebrar hoje. Responde só 3 questões e já conta!' },
];

const EVENING_MSGS = [
  { title: 'Ei {nome}, como foi seu dia? 💬', body: 'Antes de dormir, que tal revisar um topicozinho? Fica mais fácil memorizar à noite.' },
  { title: '🌙 Hora de fechar o dia com chave de ouro', body: 'Um simuladinho rápido antes de dormir e você já tá na frente de 90% dos candidatos.' },
  { title: '{nome}, você estudou hoje? 📚', body: 'Ainda dá tempo! 10 minutinhos de ENEM Master e sua consciência fica tranquila 😄' },
  { title: '🏆 Veja onde você está no ranking', body: 'Outros estudantes estão avançando agora. Não fica pra trás!' },
  { title: '💡 Uma dica rápida antes de dormir', body: 'Estudar antes de dormir melhora a fixação. Que tal um flashcard rápido?' },
  { title: 'Saudade de você por aqui 🥹', body: 'Faz tempo que você não aparece. Volta lá, tem novidades no ENEM Master!' },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const auth = req.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401 });

  const SUPABASE_URL  = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY');
  const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY');

  webpush.setVapidDetails('mailto:contato@enemmaster.com.br', VAPID_PUBLIC, VAPID_PRIVATE);

  let body = {};
  try { body = await req.json(); } catch {}
  const type = body.type === 'morning' ? 'morning' : 'evening';

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: subs, error } = await admin.from('push_subscriptions').select('user_id, subscription').eq('active', true);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  const userIds = (subs || []).map((r) => r.user_id);
  const { data: users } = userIds.length ? await admin.from('users').select('id, name').in('id', userIds) : { data: [] };
  const nameMap = Object.fromEntries((users || []).map((u) => [u.id, (u.name || 'estudante').split(' ')[0]]));

  let sent = 0, failed = 0;
  const expired = [], errors = [];

  for (const row of (subs || [])) {
    const msg = pick(type === 'morning' ? MORNING_MSGS : EVENING_MSGS);
    const title = msg.title.replace('{nome}', nameMap[row.user_id] || 'estudante');
    const payload = JSON.stringify({ title, body: msg.body, icon: '/icon-192.png', tag: 'enem-' + type, url: '/app' });
    try {
      await webpush.sendNotification(row.subscription, payload);
      sent++;
    } catch (err) {
      if (err?.statusCode === 410 || err?.statusCode === 404) expired.push(row.user_id);
      failed++;
      errors.push((String(err?.statusCode || '') + ' ' + String(err?.message || err)).trim().slice(0, 200));
    }
  }

  if (expired.length > 0) await admin.from('push_subscriptions').delete().in('user_id', expired);
  return new Response(JSON.stringify({ sent, failed, expired: expired.length, errors }), { headers: { 'Content-Type': 'application/json' } });
});