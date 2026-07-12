// ─── VERBUM NOTIFICATIONS ────────────────────────────────────────────────────
// Schedules three types of daily notifications using the Web Notifications API.
// Notifications fire via setTimeout — they work while the app is open or
// running as an installed PWA (background). For true push delivery when the
// app is fully closed, a push server would be required (future upgrade path).

// ─── CATHOLIC CALENDAR (fixed feasts) ───────────────────────────────────────
const CATHOLIC_CALENDAR = [
  { month: 1,  day: 1,  name: "Solemnity of Mary",            body: "Today is the Solemnity of Mary, Mother of God. Begin the new year under her mantle." },
  { month: 1,  day: 6,  name: "Epiphany of the Lord",         body: "The Magi present their gifts to Christ. Open your heart as an offering today." },
  { month: 2,  day: 2,  name: "Presentation of the Lord",     body: "Today Simeon holds the Light of the World. 'Now, Lord, let your servant go in peace.'" },
  { month: 3,  day: 19, name: "Feast of Saint Joseph",        body: "Glorious Saint Joseph, patron of the Universal Church. Ask for his powerful intercession today." },
  { month: 3,  day: 25, name: "The Annunciation",             body: "The Angel Gabriel announces to Mary. The Word became flesh. Pray an Ave Maria." },
  { month: 4,  day: 23, name: "Feast of Saint George",        body: "Saint George, martyr and patron of courage. Pray for strength in your battles today." },
  { month: 6,  day: 13, name: "Feast of Saint Anthony",       body: "Saint Anthony of Padua, patron of lost things. Trust in God's providence today." },
  { month: 6,  day: 24, name: "Birth of John the Baptist",    body: "The voice crying in the wilderness. Prepare the way of the Lord in your heart." },
  { month: 6,  day: 29, name: "Saints Peter and Paul",        body: "Solemnity of the Apostles Peter and Paul. Pillars of the Church — pray for her today." },
  { month: 7,  day: 22, name: "Feast of Saint Mary Magdalene",body: "Apostle to the Apostles. She stood at the Cross when others fled. Be faithful." },
  { month: 7,  day: 31, name: "Feast of Saint Ignatius",      body: "Founder of the Jesuits. 'Go forth and set the world on fire.' What sets you ablaze for God?" },
  { month: 8,  day: 15, name: "Assumption of Mary",           body: "Solemnity of the Assumption. Mary is taken up body and soul — first fruits of the resurrection that awaits us all." },
  { month: 8,  day: 28, name: "Feast of Saint Augustine",     body: "'Our heart is restless until it rests in Thee.' Rest in God today, Augustine reminds us." },
  { month: 9,  day: 29, name: "Feast of the Archangels",      body: "Michael, Gabriel, and Raphael. 'Who is like God?' Ask the Archangels to guard you today." },
  { month: 10, day: 1,  name: "Feast of Saint Thérèse",       body: "The Little Flower. Her little way of trust and love is for everyone. Miss no small sacrifice today." },
  { month: 10, day: 4,  name: "Feast of Saint Francis",       body: "Francis of Assisi reminds us: start by doing what is necessary, then what is possible." },
  { month: 10, day: 7,  name: "Our Lady of the Rosary",       body: "Today the Church honors Our Lady of the Rosary. Pray a decade in her honor." },
  { month: 10, day: 15, name: "Feast of Saint Teresa of Ávila", body: "'Let nothing disturb you.' Saint Teresa of Ávila calls us to interior stillness today." },
  { month: 11, day: 1,  name: "All Saints Day",               body: "Solemnity of All Saints. The Church Triumphant surrounds us. Heaven is very near today." },
  { month: 11, day: 2,  name: "All Souls Day",                body: "We pray for the faithful departed. Eternal rest grant unto them, O Lord." },
  { month: 12, day: 8,  name: "Immaculate Conception",        body: "Solemnity of the Immaculate Conception. Mary, conceived without sin, pray for us who have recourse to thee." },
  { month: 12, day: 12, name: "Our Lady of Guadalupe",        body: "'Am I not here, who am your mother?' Our Lady of Guadalupe comforts all who are discouraged." },
  { month: 12, day: 25, name: "Christmas — Nativity of the Lord", body: "The Word was made flesh and dwelt among us. Glory to God in the highest! Blessed Christmas." },
  { month: 12, day: 26, name: "Feast of Saint Stephen",       body: "First martyr of the faith. Stephen prayed for those who stoned him. Forgiveness is our witness." },
];

// ─── MOVEABLE FEASTS (calculated from Easter) ────────────────────────────────
function getEaster(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100,
        d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451),
        mo = Math.floor((h + l - 7 * m + 114) / 31),
        dy = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, mo - 1, dy);
}

function getMoveableFeasts(year) {
  const easter = getEaster(year);
  const offset = (days) => {
    const d = new Date(easter);
    d.setDate(d.getDate() + days);
    return d;
  };
  return [
    { date: offset(-46), name: "Ash Wednesday",          body: "Ash Wednesday begins Lent. 'Remember you are dust, and to dust you shall return.' Fast, pray, give." },
    { date: offset(-7),  name: "Palm Sunday",            body: "Palm Sunday — Jesus enters Jerusalem. The crowd cries Hosanna. Holy Week has begun." },
    { date: offset(-3),  name: "Holy Thursday",          body: "The Last Supper. Jesus gives us the Eucharist and washes the disciples' feet. Serve with love today." },
    { date: offset(-2),  name: "Good Friday",            body: "The Lord's Passion. Fast and abstain today. Venerate the Cross at 3 PM with the whole Church." },
    { date: easter,      name: "Easter Sunday",          body: "He is risen! Alleluia! This is the day the Lord has made — the foundation of our entire faith." },
    { date: offset(39),  name: "Ascension of the Lord",  body: "Jesus ascends to the Father. 'I go to prepare a place for you.' Our citizenship is in heaven." },
    { date: offset(49),  name: "Pentecost Sunday",       body: "Come, Holy Spirit! The Church is born today. Ask the Spirit to set your heart on fire." },
  ];
}

// ─── DAILY VERSES for notifications ─────────────────────────────────────────
const DAILY_VERSE_NOTIFICATIONS = [
  { ref: "Psalm 23:1",          text: "The Lord is my shepherd; I shall not want." },
  { ref: "John 3:16",           text: "God so loved the world that he gave his only Son." },
  { ref: "Philippians 4:13",    text: "I have the strength for everything through him who empowers me." },
  { ref: "Jeremiah 29:11",      text: "I know the plans I have for you, says the Lord — plans for your welfare, not for evil." },
  { ref: "Matthew 11:28",       text: "Come to me, all you who labor and are burdened, and I will give you rest." },
  { ref: "Romans 8:28",         text: "All things work for good for those who love God." },
  { ref: "Isaiah 40:31",        text: "Those who hope in the Lord will renew their strength." },
  { ref: "Psalm 46:10",         text: "Be still and know that I am God!" },
  { ref: "Proverbs 3:5-6",      text: "Trust in the Lord with all your heart; on your own intelligence do not rely." },
  { ref: "John 14:27",          text: "Peace I leave with you; my peace I give to you." },
  { ref: "Lamentations 3:22-23",text: "The Lord's mercies are renewed each morning — great is your faithfulness!" },
  { ref: "Luke 1:37",           text: "Nothing will be impossible for God." },
  { ref: "Psalm 34:18",         text: "The Lord is close to the brokenhearted." },
  { ref: "Matthew 5:4",         text: "Blessed are they who mourn, for they will be comforted." },
];

// ─── CORE FUNCTIONS ──────────────────────────────────────────────────────────
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function msUntil(hour, minute = 0) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1); // next day if already passed
  return target.getTime() - now.getTime();
}

function showNotification(title, body, icon = '/icon-192.png') {
  if (Notification.permission !== 'granted') return;
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        icon,
      });
    } else {
      new Notification(title, { body, icon });
    }
  } catch (e) {
    // Fallback: try direct Notification
    try { new Notification(title, { body, icon }); } catch {}
  }
}

function todayKey() {
  const d = new Date();
  return `verbum-notif-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function alreadySentToday(type) {
  const data = JSON.parse(localStorage.getItem(todayKey()) || '{}');
  return !!data[type];
}

function markSentToday(type) {
  const key = todayKey();
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  data[type] = true;
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── SCHEDULE: VERSE OF THE DAY (7:00 AM) ───────────────────────────────────
export function scheduleVerseOfDay() {
  if (Notification.permission !== 'granted') return;
  if (alreadySentToday('verse')) return;

  const delay = msUntil(20, 4);
  setTimeout(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const verse = DAILY_VERSE_NOTIFICATIONS[dayOfYear % DAILY_VERSE_NOTIFICATIONS.length];
    showNotification(
      `✦ Verbum — Verse of the Day`,
      `${verse.text} — ${verse.ref}`
    );
    markSentToday('verse');
  }, delay);
}

// ─── SCHEDULE: THREE O'CLOCK PRAYER (3:00 PM) ───────────────────────────────
export function scheduleThreeOClock() {
  if (Notification.permission !== 'granted') return;
  if (alreadySentToday('three-oclock')) return;

  const delay = msUntil(15, 0);
  setTimeout(() => {
    showNotification(
      `🕒 The Three O'Clock Hour — Hour of Mercy`,
      `"You expired, Jesus, but the source of life gushed forth for souls." Pause and pray the Chaplet of Divine Mercy.`
    );
    markSentToday('three-oclock');
  }, delay);
}

// ─── SCHEDULE: CATHOLIC CALENDAR (8:00 AM, if a feast day today) ─────────────
export function scheduleCatholicCalendar() {
  if (Notification.permission !== 'granted') return;
  if (alreadySentToday('calendar')) return;

  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = now.getFullYear();

  // Check fixed feasts
  const fixedFeast = CATHOLIC_CALENDAR.find(f => f.month === month && f.day === day);

  // Check moveable feasts
  const moveableFeasts = getMoveableFeasts(year);
  const moveableFeast = moveableFeasts.find(f => {
    return f.date.getMonth() + 1 === month && f.date.getDate() === day;
  });

  const feast = fixedFeast || moveableFeast;
  if (!feast) return; // No feast today, skip

  const delay = msUntil(8, 0);
  setTimeout(() => {
    showNotification(
      `✝ ${feast.name}`,
      feast.body
    );
    markSentToday('calendar');
  }, delay);
}

// ─── INIT: Call once on app load ─────────────────────────────────────────────
export function initNotifications() {
  if (Notification.permission !== 'granted') return;
  scheduleVerseOfDay();
  scheduleThreeOClock();
  scheduleCatholicCalendar();
}
