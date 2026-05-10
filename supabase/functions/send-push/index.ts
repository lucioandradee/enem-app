// send-push — Edge Function
// Envia Web Push para todos os assinantes ativos.
// Chamada pelo pg_cron às 8h e 20h (horário de Brasília).
//
// Variáveis obrigatórias (Supabase Secrets):
//   VAPID_PUBLIC_KEY   — chave pública VAPID (base64url)
//   VAPID_PRIVATE_KEY  — chave privada VAPID (base64url)
//   SUPABASE_URL       — injetada automaticamente pelo Supabase
//   SUPABASE_SERVICE_ROLE_KEY — injetada automaticamente

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── VAPID signing (RFC 8292) usando Web Crypto ────────────────────────────
function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - s.length % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function makeVapidToken(
  audience: string,
  subject: string,
  privateKeyB64: string,
): Promise<string> {
  const header  = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'ES256', typ: 'JWT' })));
  const payload = b64url(new TextEncoder().encode(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: subject,
  })));
  const data = new TextEncoder().encode(`${header}.${payload}`);

  const rawKey = b64urlDecode(privateKeyB64);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', rawKey,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, cryptoKey, data);
  return `${header}.${payload}.${b64url(sig)}`;
}

// ── AES-128-GCM encryption (RFC 8291) ────────────────────────────────────
async function encryptPayload(
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  plaintext: string,
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const encoder       = new TextEncoder();
  const authSecret    = b64urlDecode(sub.keys.auth);       // 16 bytes
  const receiverPublic = b64urlDecode(sub.keys.p256dh);    // 65 bytes uncompressed

  // Ephemeral ECDH key pair
  const ecdh = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const senderPubRaw  = new Uint8Array(await crypto.subtle.exportKey('raw', ecdh.publicKey));

  // Import receiver public key
  const rcvKey = await crypto.subtle.importKey(
    'raw', receiverPublic,
    { name: 'ECDH', namedCurve: 'P-256' }, false, [],
  );
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: rcvKey }, ecdh.privateKey, 256,
  ));

  // Salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF helpers
  async function hkdfExtract(salt2: Uint8Array, ikm: Uint8Array): Promise<CryptoKey> {
    const prk = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveKey', 'deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: salt2, info: new Uint8Array() }, prk, 256,
    );
    return crypto.subtle.importKey('raw', bits, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  }
  async function hkdfExpand(prk: CryptoKey, info: Uint8Array, length: number): Promise<Uint8Array> {
    // Single T(1) block
    const input = new Uint8Array([...info, 0x01]);
    const t1 = new Uint8Array(await crypto.subtle.sign('HMAC', prk, input));
    return t1.slice(0, length);
  }

  // IKM = HKDF(auth, sharedSecret, "WebPush: info\0" + receiverPublic + senderPubRaw, 32)
  const infoLabel = encoder.encode('WebPush: info\0');
  const keyInfo = new Uint8Array(infoLabel.length + receiverPublic.length + senderPubRaw.length);
  keyInfo.set(infoLabel, 0);
  keyInfo.set(receiverPublic, infoLabel.length);
  keyInfo.set(senderPubRaw, infoLabel.length + receiverPublic.length);
  const prkKey  = await hkdfExtract(authSecret, sharedSecret);
  const ikm     = await hkdfExpand(prkKey, keyInfo, 32);

  // CEK = HKDF(salt, ikm, "Content-Encoding: aes128gcm\0", 16)
  const cekInfo = encoder.encode('Content-Encoding: aes128gcm\0');
  const prkIkm  = await hkdfExtract(salt, ikm);
  const cekRaw  = await hkdfExpand(prkIkm, cekInfo, 16);

  // NONCE = HKDF(salt, ikm, "Content-Encoding: nonce\0", 12)
  const nonceInfo = encoder.encode('Content-Encoding: nonce\0');
  const nonceRaw  = await hkdfExpand(prkIkm, nonceInfo, 12);

  // AES-128-GCM encrypt
  const cekKey = await crypto.subtle.importKey('raw', cekRaw, 'AES-GCM', false, ['encrypt']);
  // Padding: 2 bytes delimiter (0x00, 0x02) before content
  const padded = new Uint8Array([...encoder.encode(plaintext), 0x02]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonceRaw }, cekKey, padded,
  ));

  return { ciphertext, salt, serverPublicKey: senderPubRaw };
}

async function sendWebPush(
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublic: string,
  vapidPrivate: string,
): Promise<Response> {
  const url     = new URL(sub.endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const token   = await makeVapidToken(audience, 'mailto:contato@enemmaster.com.br', vapidPrivate);
  const { ciphertext, salt, serverPublicKey } = await encryptPayload(sub, payload);

  // Build aes128gcm content-encoding header (RFC 8188 §2.1)
  // record-size (4 bytes) + ID-len (1 byte) + key-id (serverPublicKey 65 bytes)
  const recordSize = 4096;
  const header = new Uint8Array(5 + serverPublicKey.length + ciphertext.length);
  const dv = new DataView(header.buffer);
  header.set(salt, 0);                                       // already embedded via encoding header
  // Build proper aes128gcm header
  const encHeader = new Uint8Array(21 + serverPublicKey.length);
  encHeader.set(salt, 0);                                    // 16 bytes salt
  new DataView(encHeader.buffer).setUint32(16, recordSize, false); // 4 bytes record size
  encHeader[20] = serverPublicKey.length;                    // 1 byte key id length
  encHeader.set(serverPublicKey, 21);                        // 65 bytes public key

  const body = new Uint8Array(encHeader.length + ciphertext.length);
  body.set(encHeader, 0);
  body.set(ciphertext, encHeader.length);

  return fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${token},k=${vapidPublic}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
    },
    body,
  });
}

// ── Messages ──────────────────────────────────────────────────────────────
const MORNING_MSGS = [
  { title: '🌅 Bom dia! Hora de estudar!', body: 'Comece o dia com 5 questões rápidas do ENEM. Leva menos de 10 minutos!' },
  { title: '☀️ Novo dia, nova chance!', body: 'Que tal resolver umas questões antes de começar o dia?' },
  { title: '🚀 Acorde seu cérebro!', body: 'Uma questão por dia mantém o ENEM na mira. Bora estudar!' },
];
const EVENING_MSGS = [
  { title: '📚 Hora de estudar!', body: 'Você tem questões te esperando. Bora revisar antes de dormir?' },
  { title: '🔥 Mantenha seu streak!', body: 'Estude pelo menos 10 minutos hoje para não perder sua sequência!' },
  { title: '🎯 ENEM cada vez mais perto!', body: 'Que tal um simulado rápido agora? Cada questão conta!' },
  { title: '⚡ Revise um flashcard hoje!', body: '5 minutinhos de revisão no ENEM Master — vá lá!' },
  { title: '🏆 Ranking espera por você!', body: 'Outros estudantes estão avançando. Jogue algumas questões!' },
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Main handler ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const auth = req.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!;
  const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;

  let body: { type?: string } = {};
  try { body = await req.json(); } catch { /* default */ }
  const type = body.type === 'morning' ? 'morning' : 'evening';
  const msg  = pick(type === 'morning' ? MORNING_MSGS : EVENING_MSGS);
  const payload = JSON.stringify({ title: msg.title, body: msg.body, icon: '/icon-192.png', tag: `enem-${type}`, url: '/app' });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('user_id, subscription')
    .eq('active', true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  let sent = 0;
  let failed = 0;
  const expired: string[] = [];

  for (const row of (subs || [])) {
    try {
      const sub = row.subscription as { endpoint: string; keys: { p256dh: string; auth: string } };
      const res = await sendWebPush(sub, payload, VAPID_PUBLIC, VAPID_PRIVATE);
      if (res.ok || res.status === 201) {
        sent++;
      } else if (res.status === 410 || res.status === 404) {
        expired.push(row.user_id);
        failed++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  // Limpar subscrições expiradas
  if (expired.length > 0) {
    await admin.from('push_subscriptions').delete().in('user_id', expired);
  }

  return new Response(JSON.stringify({ sent, failed, expired: expired.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
