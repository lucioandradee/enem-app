// send-push — Edge Function
// Envia Web Push para assinantes. Chamada pelo pg_cron e pelo admin.
// Suporta: type = 'morning' | 'evening' | 'custom'
// Suporta: audience = 'all' | 'free' | 'premium'
// Suporta: campaign_id para registrar resultado em notification_campaigns

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

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const auth = req.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401 });

  const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!;
  const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;

  webpush.setVapidDetails('mailto:contato@enemmaster.com.br', VAPID_PUBLIC, VAPID_PRIVATE);

  let body: Record<string, any> = {};
  try { body = await req.json(); } catch {}

  const type       = (body.type as string)     || 'evening'; // 'morning' | 'evening' | 'custom'
  const audience   = (body.audience as string) || 'all';     // 'all' | 'free' | 'premium'
  const customTitle = (body.title as string)   || '';
  const customBody  = (body.body  as string)   || '';
  const campaignId  = (body.campaign_id as string) || null;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Busca todas as subscriptions ativas
  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('user_id, subscription')
    .eq('active', true);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  const userIds = (subs || []).map((r: any) => r.user_id);
  if (!userIds.length) {
    if (campaignId) await admin.from('notification_campaigns').update({ status: 'sent', sent_count: 0, sent_at: new Date().toISOString() }).eq('id', campaignId).catch(() => {});
    return new Response(JSON.stringify({ sent: 0, failed: 0, expired: 0, errors: [] }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Busca dados do usuário (nome + plano) para filtrar por audiência
  const { data: users } = await admin.from('users').select('id, name, plan, plan_expires_at').in('id', userIds);
  const userMap: Record<string, any> = Object.fromEntries((users || []).map((u: any) => [u.id, u]));

  const now = new Date().toISOString();
  const filteredSubs = (subs || []).filter((row: any) => {
    const u = userMap[row.user_id];
    if (!u) return audience === 'all';
    const isPremium = u.plan === 'premium' && (!u.plan_expires_at || u.plan_expires_at > now);
    if (audience === 'premium') return isPremium;
    if (audience === 'free')    return !isPremium;
    return true;
  });

  let sent = 0, failed = 0;
  const expired: string[] = [];
  const errors:  string[] = [];

  for (const row of filteredSubs) {
    const u    = userMap[row.user_id];
    const nome = ((u?.name || 'estudante') as string).split(' ')[0];

    let title: string, msgBody: string;
    if (type === 'custom') {
      title   = customTitle.replace('{nome}', nome);
      msgBody = customBody.replace('{nome}', nome);
    } else {
      const msg = pick(type === 'morning' ? MORNING_MSGS : EVENING_MSGS);
      title   = msg.title.replace('{nome}', nome);
      msgBody = msg.body;
    }

    const payload = JSON.stringify({ title, body: msgBody, icon: '/icon-192.png', tag: 'enem-' + type, url: '/app' });
    try {
      await webpush.sendNotification(row.subscription, payload);
      sent++;
    } catch (err: any) {
      if (err?.statusCode === 410 || err?.statusCode === 404) expired.push(row.user_id);
      failed++;
      errors.push((String(err?.statusCode || '') + ' ' + String(err?.message || err)).trim().slice(0, 200));
    }
  }

  if (expired.length > 0) await admin.from('push_subscriptions').delete().in('user_id', expired);

  // Atualiza campanha se fornecida
  if (campaignId) {
    await admin.from('notification_campaigns')
      .update({ status: 'sent', sent_count: sent, sent_at: new Date().toISOString() })
      .eq('id', campaignId)
      .catch(() => {});
  }

  return new Response(JSON.stringify({ sent, failed, expired: expired.length, errors }), { headers: { 'Content-Type': 'application/json' } });
});