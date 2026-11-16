import { useSyncExternalStore } from "react";
import { track } from "./analytics.js";
import { supabase } from "./supabase.js";
import { localDateKey } from "./utils/date.js";

// Saved progress: favourite verses, prayed novena days, the rosary in progress, the days
// prayed (for the streak) and private intentions.
//
// Offline-first. Every change updates the UI and a local copy right away, then is sent to the
// public.user_progress table (see supabase/). Changes that could not be sent wait in a queue
// and are retried. On login the server copy is loaded and the queued changes are applied on
// top, so nothing done offline is lost and removals are not resurrected.
//
// State:
//   favorites  Set of verse ids (numbers) and references (strings)
//   novena     Map "<novenaId>-<dayIndex>" -> date prayed ("YYYY-MM-DD"), or null if unknown
//   rosary     { mystery, decade, beads, date } or null
//   prayerLog  Map "YYYY-MM-DD" -> ["rosary" | "novena" | "chaplet", ...]
//   intentions Map id -> { text, createdAt, answeredAt }

const TABLE = "user_progress";
const cacheKey = (uid) => `verbum_progress_v1_${uid}`;

const empty = () => ({ ready: false, favorites: new Set(), novena: new Map(), rosary: null, prayerLog: new Map(), intentions: new Map() });
let state = empty();
let userId = null;
let queue = []; // [{ kind, key, action: "put" | "del", value }]
// Kinds the server refused (database not updated yet). Their data stays on this device and
// is offered to the server again on the next start.
let localOnly = new Set();
let flushing = null;
const listeners = new Set();

const emit = (next) => { state = next; listeners.forEach((l) => l()); };
export const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const getSnapshot = () => state;
export const useProgress = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

// Favourites use numeric ids (Explore) and reference strings (daily verses); store both as text.
const favToDb = (k) => (typeof k === "number" ? `id:${k}` : `ref:${k}`);
const dbToFav = (s) => (s.startsWith("id:") ? Number(s.slice(3)) : s.slice(4));

const today = () => localDateKey(new Date());

// The local copy keeps the original v1 fields (favorites, novena as a list, rosary, queue)
// and adds the newer ones beside them.
function saveLocal() {
  if (!userId) return;
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify({
      favorites: [...state.favorites].map(favToDb),
      novena: [...state.novena.keys()],
      novenaDates: Object.fromEntries([...state.novena].filter(([, date]) => date)),
      rosary: state.rosary,
      prayerLog: Object.fromEntries(state.prayerLog),
      intentions: Object.fromEntries(state.intentions),
      localOnly: [...localOnly],
      queue,
    }));
  } catch { /* storage unavailable */ }
}

function loadLocal(uid) {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(cacheKey(uid)) || "null"); } catch { /* ignore corrupt cache */ }
  raw = raw && typeof raw === "object" ? raw : {};
  const dates = raw.novenaDates || {};
  return {
    favorites: new Set((raw.favorites || []).map(dbToFav)),
    novena: new Map((raw.novena || []).map((k) => [k, dates[k] || null])),
    rosary: raw.rosary || null,
    prayerLog: new Map(Object.entries(raw.prayerLog || {})),
    intentions: new Map(Object.entries(raw.intentions || {})),
    localOnly: new Set(raw.localOnly || []),
    queue: Array.isArray(raw.queue) ? raw.queue : [],
  };
}

// Adds a change to the queue, replacing any earlier change to the same item.
function queueOp(op) {
  queue = queue.filter((q) => !(q.kind === op.kind && q.key === op.key)).concat(op);
}

function enqueue(op) {
  queueOp(op);
  saveLocal();
  flush();
}

// Everything of a device-only kind, as queue changes, newest last.
function localEntries(kind) {
  if (kind === "intention") return [...state.intentions].map(([key, value]) => ({ kind, key, action: "put", value }));
  if (kind === "prayer_log") return [...state.prayerLog].sort().map(([key, list]) => ({ kind, key, action: "put", value: { acts: list } }));
  return [];
}

// Sends one change. Resolves to { result: "ok" | "retry" | "drop", status }.
//   retry: no connection, signed-out token, rate limit or server trouble; try again later.
//   drop:  the server refused this change for good (for example a kind the database does not
//          accept yet). Keeping it would block every change behind it.
async function send(op) {
  let response;
  try {
    if (op.action === "put") {
      response = await supabase.from(TABLE).upsert(
        { user_id: userId, kind: op.kind, item_key: op.key, value: op.value ?? null, updated_at: new Date().toISOString() },
        { onConflict: "user_id,kind,item_key" },
      );
    } else {
      response = await supabase.from(TABLE).delete().eq("user_id", userId).eq("kind", op.kind).eq("item_key", op.key);
    }
  } catch {
    return { result: "retry", status: 0 };
  }
  if (!response?.error) return { result: "ok", status: response?.status ?? 200 };
  const status = response.status ?? 0;
  const retry = status === 0 || status === 401 || status === 408 || status === 429 || status >= 500;
  return { result: retry ? "retry" : "drop", status };
}

// One pass over the queue, in order. Stops at the first change that must be retried.
async function drain() {
  while (queue.length && userId) {
    const op = queue[0];
    const { result, status } = await send(op);
    if (result === "retry") return;
    if (result === "drop") {
      console.warn("[Verbum] sync dropped", op.kind, status);
      track("sync_drop", { kind: op.kind, status });
      if (op.action === "put") localOnly.add(op.kind);
    } else if (op.action === "put" && localOnly.has(op.kind)) {
      // The server now accepts this kind: send everything that was waiting on the device.
      localOnly.delete(op.kind);
      for (const entry of localEntries(op.kind)) if (entry.key !== op.key) queueOp(entry);
    }
    queue = queue.filter((q) => q !== op);
    saveLocal();
  }
}

// Sends queued changes. Every call runs its own pass after any pass already under way, so a
// change made just as a pass ends is never left waiting. Resolves when that pass is done.
export function flush() {
  if (!userId) return Promise.resolve();
  const pass = (flushing || Promise.resolve()).then(drain, drain);
  flushing = pass;
  pass.then(() => { if (flushing === pass) flushing = null; });
  return pass;
}

if (typeof window !== "undefined") window.addEventListener("online", () => { flush(); });

const novenaDate = (value) => (value && typeof value.date === "string" ? value.date : null);
const acts = (value) => (value && Array.isArray(value.acts) ? value.acts.filter((a) => typeof a === "string") : []);
const intention = (value) => ({ text: String(value?.text || ""), createdAt: value?.createdAt || null, answeredAt: value?.answeredAt || null });

// Call when a user signs in (or the session is restored).
export async function initProgress(uid) {
  if (!uid || uid === userId) return;
  userId = uid;
  const local = loadLocal(uid);
  queue = local.queue;
  localOnly = local.localOnly;
  emit({
    ready: false,
    favorites: local.favorites,
    novena: local.novena,
    // Only a rosary started today is resumed.
    rosary: local.rosary && local.rosary.date === today() ? local.rosary : null,
    prayerLog: local.prayerLog,
    intentions: local.intentions,
  });

  let rows = null;
  try {
    const { data, error } = await supabase.from(TABLE).select("kind,item_key,value,updated_at");
    if (!error && data) rows = data;
  } catch { /* offline: keep the local copy */ }
  if (userId !== uid) return; // signed out or switched user meanwhile

  if (!rows) { emit({ ...state, ready: true }); return; }

  const of = (kind) => rows.filter((r) => r.kind === kind);
  const favorites = new Set(of("favorite").map((r) => dbToFav(r.item_key)));
  const novena = new Map(of("novena_day").map((r) => [r.item_key, novenaDate(r.value)]));
  let rosary = of("rosary")[0]?.value || null;
  // Kinds the server has not accepted yet live on this device: keep the local copy.
  const prayerLog = localOnly.has("prayer_log") ? new Map(state.prayerLog) : new Map(of("prayer_log").map((r) => [r.item_key, acts(r.value)]));
  const intentions = localOnly.has("intention") ? new Map(state.intentions) : new Map(of("intention").map((r) => [r.item_key, intention(r.value)]));

  // Apply changes made on this device that have not reached the server yet.
  for (const op of queue) {
    const put = op.action === "put";
    if (op.kind === "favorite") (put ? favorites.add(dbToFav(op.key)) : favorites.delete(dbToFav(op.key)));
    else if (op.kind === "novena_day") (put ? novena.set(op.key, novenaDate(op.value)) : novena.delete(op.key));
    else if (op.kind === "rosary") rosary = put ? op.value : null;
    else if (op.kind === "prayer_log") (put ? prayerLog.set(op.key, acts(op.value)) : prayerLog.delete(op.key));
    else if (op.kind === "intention") (put ? intentions.set(op.key, intention(op.value)) : intentions.delete(op.key));
  }
  if (rosary && rosary.date !== today()) rosary = null; // only resume a rosary started today
  emit({ ready: true, favorites, novena, rosary, prayerLog, intentions });

  // Ask the server once per kind whether it accepts device-only data yet (the newest item
  // is the probe). If it does, the rest follow; if not, nothing else is sent this time.
  for (const kind of localOnly) {
    const probe = localEntries(kind).pop();
    if (probe && !queue.some((q) => q.kind === kind)) queueOp(probe);
  }
  saveLocal();
  flush();
}

// Call on sign out.
export function resetProgress() {
  userId = null;
  queue = [];
  localOnly = new Set();
  emit(empty());
}

// Call just before signing out: removes private intentions from this device's saved copy,
// unless some have not reached the server yet (those must not be lost). They come back from
// the server at the next sign-in.
export function clearPrivateCache() {
  if (!userId) return;
  if (localOnly.has("intention") || queue.some((q) => q.kind === "intention")) return;
  state = { ...state, intentions: new Map() };
  saveLocal();
}

export function toggleFavorite(key) {
  if (!userId) return false;
  const next = new Set(state.favorites);
  const adding = !next.has(key);
  if (adding) next.add(key); else next.delete(key);
  emit({ ...state, favorites: next });
  enqueue({ kind: "favorite", key: favToDb(key), action: adding ? "put" : "del" });
  return adding;
}

// Records that something was prayed today (once per kind per day). Feeds the streak.
export function logPrayer(act) {
  if (!userId) return;
  const dateKey = today();
  const current = state.prayerLog.get(dateKey) || [];
  if (current.includes(act)) return;
  const list = [...current, act];
  const next = new Map(state.prayerLog);
  next.set(dateKey, list);
  emit({ ...state, prayerLog: next });
  enqueue({ kind: "prayer_log", key: dateKey, action: "put", value: { acts: list } });
}

// key: "<novenaId>-<dayIndex>". Marking a day stores today's date.
export function toggleNovenaDay(key) {
  if (!userId) return;
  const next = new Map(state.novena);
  const adding = !next.has(key);
  const date = today();
  if (adding) next.set(key, date); else next.delete(key);
  emit({ ...state, novena: next });
  enqueue(adding ? { kind: "novena_day", key, action: "put", value: { date } } : { kind: "novena_day", key, action: "del" });
  if (adding) logPrayer("novena");
}

// value: { mystery, decade, beads } to remember the rosary in progress, or null to clear it.
export function saveRosary(value) {
  if (!userId) return;
  const stored = value ? { ...value, date: today() } : null;
  emit({ ...state, rosary: stored });
  enqueue({ kind: "rosary", key: "current", action: stored ? "put" : "del", value: stored });
}

export const INTENTION_MAX = 500;

// Adds a private intention. Returns its id, or null when the text is empty or too long.
export function addIntention(text) {
  const trimmed = String(text || "").trim();
  if (!userId || !trimmed || trimmed.length > INTENTION_MAX) return null;
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `i${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  const value = { text: trimmed, createdAt: new Date().toISOString(), answeredAt: null };
  const next = new Map(state.intentions);
  next.set(id, value);
  emit({ ...state, intentions: next });
  enqueue({ kind: "intention", key: id, action: "put", value });
  return id;
}

export function toggleIntentionAnswered(id) {
  const current = state.intentions.get(id);
  if (!userId || !current) return;
  const value = { ...current, answeredAt: current.answeredAt ? null : new Date().toISOString() };
  const next = new Map(state.intentions);
  next.set(id, value);
  emit({ ...state, intentions: next });
  enqueue({ kind: "intention", key: id, action: "put", value });
}

export function deleteIntention(id) {
  if (!userId || !state.intentions.has(id)) return;
  const next = new Map(state.intentions);
  next.delete(id);
  emit({ ...state, intentions: next });
  enqueue({ kind: "intention", key: id, action: "del" });
}
