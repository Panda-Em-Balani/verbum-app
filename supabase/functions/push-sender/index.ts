// Verbum push-notification sender (Supabase Edge Function, Deno).
//
// Called on a schedule (every few minutes). Depending on the time in the UAE (UTC+4) it sends:
//   7:00 AM  the verse of the day (the same verse the app shows on Home)
//   8:00 AM  a feast-day note, on the feast days listed below
//   3:00 PM  the Three O'Clock Hour reminder
// Each is sent once per day (see notification_log) to every device in push_subscriptions.
//
// This file is the copy kept in the repository. It only takes effect when it is pasted
// into (or deployed to) the Supabase project. Secrets it reads from the function's
// settings: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID_SUBJECT, VAPID_PUBLIC_KEY,
// VAPID_PRIVATE_KEY.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT')!;
const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

// ── Utilities ─────────────────────────────────────────────────────────────────
const enc = new TextEncoder();

function b64d(s: string): Uint8Array {
  const pad = '='.repeat((4 - s.length % 4) % 4);
  return Uint8Array.from(atob((s + pad).replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
}

function b64e(buf: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(arrays.reduce((n, a) => n + a.length, 0));
  let i = 0; for (const a of arrays) { out.set(a, i); i += a.length; }
  return out;
}

// ── VAPID JWT (ES256) ─────────────────────────────────────────────────────────
async function makeVapidJWT(endpoint: string): Promise<string> {
  const { origin } = new URL(endpoint);
  const header  = b64e(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64e(enc.encode(JSON.stringify({
    aud: origin,
    exp: Math.floor(Date.now() / 1000) + 43200,
    sub: VAPID_SUBJECT,
  })));
  const sigInput = enc.encode(`${header}.${payload}`);

  const pub  = b64d(VAPID_PUBLIC_KEY);
  const priv = b64d(VAPID_PRIVATE_KEY);

  const signingKey = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC', crv: 'P-256', ext: true,
      x: b64e(pub.slice(1, 33)),
      y: b64e(pub.slice(33, 65)),
      d: b64e(priv),
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  );

  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, signingKey, sigInput)
  );

  return `${header}.${payload}.${b64e(sig)}`;
}

// ── Web Push payload encryption (RFC 8291 aes128gcm) ─────────────────────────
async function encryptPayload(message: string, p256dh: string, auth: string): Promise<Uint8Array> {
  const receiverPub = b64d(p256dh);
  const authSecret  = b64d(auth);
  const salt        = crypto.getRandomValues(new Uint8Array(16));

  const ephemeral = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  );
  const senderPub = new Uint8Array(await crypto.subtle.exportKey('raw', ephemeral.publicKey));

  const receiverKey = await crypto.subtle.importKey(
    'raw', receiverPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  );

  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: receiverKey }, ephemeral.privateKey, 256)
  );

  const sharedKey = await crypto.subtle.importKey('raw', sharedSecret, 'HKDF', false, ['deriveBits']);
  const keyInfo   = concat(enc.encode('WebPush: info\0'), receiverPub, senderPub);
  const ikm       = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: keyInfo }, sharedKey, 256
  ));

  const ikmKey1 = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const cek     = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: enc.encode('Content-Encoding: aes128gcm\0') }, ikmKey1, 128
  );
  const ikmKey2 = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const nonce   = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: enc.encode('Content-Encoding: nonce\0') }, ikmKey2, 96
  );

  const cekKey    = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const plaintext = concat(enc.encode(message), new Uint8Array([2]));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: new Uint8Array(nonce), tagLength: 128 }, cekKey, plaintext
  ));

  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  return concat(salt, rs, new Uint8Array([senderPub.length]), senderPub, ciphertext);
}

// ── Send one push ─────────────────────────────────────────────────────────────
async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  title: string, body: string, tag: string, url: string
) {
  try {
    const jwt       = await makeVapidJWT(sub.endpoint);
    const encBody   = await encryptPayload(JSON.stringify({ title, body, tag, url }), sub.p256dh, sub.auth);

    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Authorization':    `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
        'Content-Type':     'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL':              '86400',
      },
      body: encBody,
    });

    if (res.ok || res.status === 201) {
      console.log(`[Push] Sent "${title}" → ...${sub.endpoint.slice(-20)}`);
    } else {
      const text = await res.text().catch(() => '');
      console.warn(`[Push] HTTP ${res.status}: ${text} → ...${sub.endpoint.slice(-20)}`);
      if (res.status === 410 || res.status === 404) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        console.log('[Push] Removed stale subscription');
      }
    }
  } catch (e: any) {
    console.warn('[Push] Error:', e.message);
  }
}

// ── Catholic Calendar ─────────────────────────────────────────────────────────
function getEaster(year: number) {
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,
        f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,
        i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,
        m=Math.floor((a+11*h+22*l)/451),
        mo=Math.floor((h+l-7*m+114)/31),dy=((h+l-7*m+114)%31)+1;
  return new Date(year, mo-1, dy);
}

function getTodayFeasts(now: Date) {
  const month = now.getMonth()+1, day = now.getDate(), year = now.getFullYear();
  const easter = getEaster(year);
  const off = (d: number) => { const dt = new Date(easter); dt.setDate(dt.getDate()+d); return dt; };
  const fixed = [
    { month:1,  day:1,  name:'Solemnity of Mary',              body:'Today is the Solemnity of Mary, Mother of God. Begin this day under her mantle.' },
    { month:1,  day:6,  name:'Epiphany of the Lord',           body:'The Magi present their gifts to Christ. Open your heart as an offering today.' },
    { month:2,  day:2,  name:'Presentation of the Lord',       body:'Simeon holds the Light of the World. Now, Lord, let your servant go in peace.' },
    { month:3,  day:19, name:'Feast of Saint Joseph',          body:'Saint Joseph, patron of the Universal Church. Ask for his powerful intercession today.' },
    { month:3,  day:25, name:'The Annunciation',               body:'The Word became flesh. Pray an Ave Maria in honor of Mary\'s yes to God.' },
    { month:6,  day:13, name:'Feast of Saint Anthony',         body:'Saint Anthony of Padua, pray for us. Trust in God\'s providence today.' },
    { month:6,  day:29, name:'Saints Peter and Paul',          body:'Solemnity of the Apostles Peter and Paul. Pray for the Church and her leaders today.' },
    { month:7,  day:22, name:'Feast of Saint Mary Magdalene',  body:'Apostle to the Apostles. She stood at the Cross when others fled. Be faithful.' },
    { month:7,  day:31, name:'Feast of Saint Ignatius',        body:'Go forth and set the world on fire. What sets you ablaze for God today?' },
    { month:8,  day:15, name:'Assumption of Mary',             body:'Mary is taken up body and soul into glory, the first fruits of the resurrection.' },
    { month:8,  day:28, name:'Feast of Saint Augustine',       body:'Our heart is restless until it rests in Thee. Rest in God today.' },
    { month:9,  day:29, name:'Feast of the Archangels',        body:'Michael, Gabriel, and Raphael watch over us. Ask the Archangels to guard you today.' },
    { month:10, day:1,  name:'Feast of Saint Therese',         body:'The Little Flower: do small things with great love. Miss no small sacrifice today.' },
    { month:10, day:4,  name:'Feast of Saint Francis',         body:'Start with what is necessary, then what is possible, and suddenly the impossible.' },
    { month:10, day:7,  name:'Our Lady of the Rosary',         body:'The Church honors Our Lady of the Rosary today. Pray a decade in her honor.' },
    { month:10, day:15, name:'Feast of Saint Teresa of Avila', body:'Let nothing disturb you. Saint Teresa calls us to interior stillness today.' },
    { month:11, day:1,  name:'All Saints Day',                 body:'The Church Triumphant surrounds us. Heaven is very near today.' },
    { month:11, day:2,  name:'All Souls Day',                  body:'Eternal rest grant unto them, O Lord. Pray for the faithful departed today.' },
    { month:12, day:8,  name:'Immaculate Conception',          body:'Mary, conceived without sin, pray for us who have recourse to thee.' },
    { month:12, day:12, name:'Our Lady of Guadalupe',          body:'Am I not here, who am your Mother? Our Lady comforts all who are discouraged.' },
    { month:12, day:25, name:'Christmas',                      body:'The Word was made flesh and dwelt among us. Glory to God in the highest!' },
    { month:12, day:26, name:'Feast of Saint Stephen',         body:'First martyr of the faith. Stephen prayed for those who stoned him. Forgive today.' },
  ];
  const moveable = [
    { date: off(-46), name:'Ash Wednesday', body:'Remember you are dust, and to dust you shall return. Fast, pray, give.' },
    { date: off(-7),  name:'Palm Sunday',   body:'Jesus enters Jerusalem. The crowd cries Hosanna. Holy Week has begun.' },
    { date: off(-3),  name:'Holy Thursday', body:'The Last Supper. Jesus gives us the Eucharist. Serve with love today.' },
    { date: off(-2),  name:'Good Friday',   body:'The Lord\'s Passion. Fast and abstain. Venerate the Cross at 3 PM.' },
    { date: easter,   name:'Easter Sunday', body:'He is risen! Alleluia! This is the day the Lord has made.' },
    { date: off(39),  name:'Ascension',     body:'Jesus ascends to the Father. I go to prepare a place for you.' },
    { date: off(49),  name:'Pentecost',     body:'Come, Holy Spirit! The Church is born today. Ask the Spirit to set your heart on fire.' },
  ];
  const feasts = [];
  for (const f of fixed)    if (f.month === month && f.day === day)                              feasts.push(f);
  for (const f of moveable) if (f.date.getMonth()+1 === month && f.date.getDate() === day)       feasts.push(f);
  return feasts;
}

// ── Daily Verses ──────────────────────────────────────────────────────────────
// Generated from DAILY_VERSES in src/verses.js by `npm run push-verses`. Do not edit by
// hand: a test (src/pushSender.test.js) fails if this list differs from the app's.
// `ref` is the reference to show (the NABRE verse number). The app picks the verse with
// day-of-year % length, and so does this function, so the notification matches Home.
// <verses:start>
const DAILY_VERSES: { ref: string; text: string }[] = [
  { ref: "Psalm 23:1", text: "The Lord is my shepherd; there is nothing I lack." },
  { ref: "John 3:16", text: "For God so loved the world that he gave his only Son, so that everyone who believes in him might not perish but might have eternal life." },
  { ref: "Philippians 4:13", text: "I have the strength for everything through him who empowers me." },
  { ref: "Jeremiah 29:11", text: "For I know well the plans I have in mind for you—oracle of the Lord—plans for your welfare and not for woe, so as to give you a future of hope." },
  { ref: "Matthew 11:28", text: "Come to me, all you who labor and are burdened, and I will give you rest." },
  { ref: "Romans 8:28", text: "We know that all things work for good for those who love God, who are called according to his purpose." },
  { ref: "Isaiah 40:31", text: "They that hope in the Lord will renew their strength, they will soar on eagles' wings; They will run and not grow weary, walk and not grow faint." },
  { ref: "Psalm 46:11", text: "Be still and know that I am God!" },
  { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, on your own intelligence do not rely. In all your ways be mindful of him, and he will make straight your paths." },
  { ref: "John 14:27", text: "Peace I leave with you; my peace I give to you. Not as the world gives do I give it to you." },
  { ref: "Lamentations 3:22-23", text: "The Lord's acts of mercy are not exhausted, his compassion is not spent; they are renewed each morning — great is your faithfulness!" },
  { ref: "Luke 1:37", text: "For nothing will be impossible for God." },
  { ref: "Psalm 34:19", text: "The Lord is close to the brokenhearted, saves those whose spirit is crushed." },
  { ref: "Romans 8:38-39", text: "For I am convinced that neither death, nor life, nor angels, nor principalities, nor present things, nor future things, nor powers, nor height, nor depth, nor any other creature will be able to separate us from the love of God in Christ Jesus our Lord." },
  { ref: "Isaiah 41:10", text: "Do not fear: I am with you; do not be anxious: I am your God. I will strengthen you, I will help you, I will uphold you with my victorious right hand." },
  { ref: "Psalm 121:1-2", text: "I raise my eyes toward the mountains. From whence shall come my help? My help comes from the Lord, the maker of heaven and earth." },
  { ref: "Matthew 6:33", text: "Seek first the kingdom of God and his righteousness, and all these things will be given you besides." },
  { ref: "1 Corinthians 13:4-5", text: "Love is patient, love is kind. It is not jealous, [love] is not pompous, it is not inflated, it is not rude, it does not seek its own interests, it is not quick-tempered, it does not brood over injury." },
  { ref: "Hebrews 11:1", text: "Faith is the realization of what is hoped for and evidence of things not seen." },
  { ref: "1 Peter 5:7", text: "Cast all your worries upon him because he cares for you." },
  { ref: "Psalm 27:1", text: "The Lord is my light and my salvation; whom should I fear? The Lord is my life's refuge; of whom should I be afraid?" },
  { ref: "John 15:5", text: "I am the vine, you are the branches. Whoever remains in me and I in him will bear much fruit, because without me you can do nothing." },
  { ref: "Micah 6:8", text: "You have been told, O mortal, what is good, and what the Lord requires of you: only to do justice and to love goodness, and to walk humbly with your God." },
  { ref: "Zephaniah 3:17", text: "The Lord, your God, is in your midst, a mighty savior, Who will rejoice over you with gladness, and renew you in his love, Who will sing joyfully because of you." },
  { ref: "Sirach 2:6", text: "Trust in God, and he will help you; make your ways straight and hope in him." },
  { ref: "Wisdom 3:1", text: "The souls of the righteous are in the hand of God, and no torment shall touch them." },
  { ref: "Psalm 139:14", text: "I praise you, because I am wonderfully made; wonderful are your works! My very self you know." },
  { ref: "Isaiah 43:1", text: "Do not fear, for I have redeemed you; I have called you by name: you are mine." },
  { ref: "Colossians 3:23", text: "Whatever you do, do from the heart, as for the Lord and not for others." },
  { ref: "Galatians 5:22-23", text: "The fruit of the Spirit is love, joy, peace, patience, kindness, generosity, faithfulness, gentleness, self-control." },
  { ref: "Ephesians 2:10", text: "For we are his handiwork, created in Christ Jesus for the good works that God has prepared in advance, that we should live in them." },
  { ref: "Psalm 103:8", text: "Merciful and gracious is the Lord, slow to anger, abounding in mercy." },
  { ref: "2 Corinthians 12:9", text: "My grace is sufficient for you, for power is made perfect in weakness." },
  { ref: "Psalm 16:8", text: "I keep the Lord always before me; with him at my right hand, I shall never be shaken." },
  { ref: "Romans 15:13", text: "May the God of hope fill you with all joy and peace in believing, so that you may abound in hope by the power of the Holy Spirit." },
  { ref: "2 Maccabees 12:46", text: "Thus he made atonement for the dead that they might be absolved from their sin." },
  { ref: "Matthew 18:20", text: "For where two or three are gathered together in my name, there am I in the midst of them." },
  { ref: "Psalm 118:24", text: "This is the day the Lord has made; let us rejoice in it and be glad." },
  { ref: "Tobit 4:15-16", text: "Do to no one what you yourself hate. … Give to the hungry some of your food, and to the naked some of your clothing." },
  { ref: "Isaiah 55:8-9", text: "For my thoughts are not your thoughts, nor are your ways my ways—oracle of the Lord. For as the heavens are higher than the earth, so are my ways higher than your ways, my thoughts higher than your thoughts." },
  { ref: "Revelation 21:4", text: "He will wipe every tear from their eyes, and there shall be no more death or mourning, wailing or pain, for the old order has passed away." },
  { ref: "Psalm 91:1-2", text: "You who dwell in the shelter of the Most High, who abide in the shade of the Almighty, say to the Lord: my refuge and fortress, my God in whom I trust." },
  { ref: "John 8:12", text: "I am the light of the world. Whoever follows me will not walk in darkness, but will have the light of life." },
  { ref: "Acts 1:8", text: "You will receive power when the Holy Spirit comes upon you, and you will be my witnesses." },
  { ref: "1 John 4:18", text: "There is no fear in love, but perfect love drives out fear." },
  { ref: "Deuteronomy 31:6", text: "Be strong and steadfast; have no fear or dread of them, for it is the Lord, your God, who marches with you; he will never fail you or forsake you." },
  { ref: "James 1:17", text: "All good giving and every perfect gift is from above, coming down from the Father of lights, with whom there is no alteration or shadow caused by change." },
  { ref: "Psalm 62:2-3", text: "My soul rests in God alone, from whom comes my salvation. God alone is my rock and salvation, my fortress; I shall never fall." },
  { ref: "Sirach 3:17", text: "My son, conduct your affairs with humility, and you will be loved more than a giver of gifts." },
  { ref: "Matthew 5:9", text: "Blessed are the peacemakers, for they will be called children of God." },
];
// <verses:end>

// ── Dedup check ───────────────────────────────────────────────────────────────
async function alreadySent(tag: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase.from('notification_log').select('id')
    .eq('tag', tag)
    .gte('sent_at', `${today}T00:00:00.000Z`)
    .lte('sent_at', `${today}T23:59:59.999Z`)
    .limit(1);
  return !!(data && data.length > 0);
}
async function markSent(tag: string) {
  await supabase.from('notification_log').insert({ tag, sent_at: new Date().toISOString() });
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  const body   = await _req.json().catch(() => ({}));
  const isTest = body?.test === true;

  const nowUTC  = new Date();
  const nowGST  = new Date(nowUTC.getTime() + 4 * 60 * 60 * 1000);
  const hourGST = nowGST.getHours();
  const minGST  = nowGST.getMinutes();
  const today   = nowGST.toISOString().slice(0, 10);

  console.log(`[Verbum] GST ${hourGST}:${String(minGST).padStart(2,'0')} | test=${isTest}`);

  const { data: subs, error } = await supabase.from('push_subscriptions').select('*');
  if (error) return new Response(`DB error: ${error.message}`, { status: 500 });
  if (!subs?.length) return new Response('No subscriptions', { status: 200 });
  console.log(`[Verbum] ${subs.length} subscription(s)`);

  const notifications: { title: string; body: string; tag: string; url: string }[] = [];

  // ── Verse of the Day: 7:00 AM GST
  // Uses same day-of-year formula as getDailyVerseStatic() in src/dailyVerse.js
  // so notification verse always matches what's shown in the Home tab.
  // Hour window is 7:00–7:29 AM GST (wider window to survive pg_cron drift).
  // Dedup log prevents double-sending within the same day.
  if (isTest || (hourGST === 7 && minGST < 30)) {
    const tag = `verse-${today}`;
    if (isTest || !(await alreadySent(tag))) {
      const startOfYear = new Date(nowGST.getFullYear(), 0, 0).getTime();
      const dayOfYear   = Math.floor((nowGST.getTime() - startOfYear) / 86400000);
      const verse       = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
      notifications.push({
        title: 'Verbum — Verse of the Day',
        body:  `${verse.text} — ${verse.ref}`,
        tag,
        url:   '/?tab=home',
      });
      if (!isTest) await markSent(tag);
    }
  }

  // ── Three O'Clock Prayer: 3:00 PM GST (window: 3:00–3:29 PM)
  if (!isTest && hourGST === 15 && minGST < 30) {
    const tag = `three-oclock-${today}`;
    if (!(await alreadySent(tag))) {
      notifications.push({
        title: "The Three O'Clock Hour",
        body:  "This is the hour of Christ's death. Pause and pray the Chaplet of Divine Mercy.",
        tag,
        url:   '/?tab=prayers&section=three-oclock',
      });
      await markSent(tag);
    }
  }

  // ── Feast days: 8:00 AM GST (window: 8:00–8:29 AM)
  if (!isTest && hourGST === 8 && minGST < 30) {
    for (const feast of getTodayFeasts(nowGST)) {
      const tag = `feast-${feast.name.replace(/\s+/g,'-').toLowerCase()}-${today}`;
      if (!(await alreadySent(tag))) {
        notifications.push({ title: feast.name, body: feast.body, tag, url: '/?tab=home' });
        await markSent(tag);
      }
    }
  }

  if (!notifications.length) return new Response('Nothing to send right now', { status: 200 });

  for (const sub of subs) {
    for (const notif of notifications) {
      await sendPush(sub, notif.title, notif.body, notif.tag, notif.url);
    }
  }

  return new Response(`Sent ${notifications.length} notification(s) to ${subs.length} device(s)`, { status: 200 });
});
