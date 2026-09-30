import { useSyncExternalStore } from "react";
import { supabase } from "./supabase.js";

// Saved progress: favourite verses, prayed novena days, and the rosary in progress.
//
// Offline-first. Every change updates the UI and a local copy right away, then is sent to the
// public.user_progress table (see supabase/user_progress.sql). Changes that could not be sent
// wait in a queue and are retried. On login the server copy is loaded and the queued changes
// are applied on top, so nothing done offline is lost and removals are not resurrected.

const TABLE = "user_progress";
const cacheKey = (uid) => `verbum_progress_v1_${uid}`;

const EMPTY = { ready: false, favorites: new Set(), novena: new Set(), rosary: null };
let state = EMPTY;
let userId = null;
let queue = []; // [{ kind, key, action: "put" | "del", value }]
let flushing = false;
const listeners = new Set();

const emit = (next) => { state = next; listeners.forEach((l) => l()); };
export const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const getSnapshot = () => state;
export const useProgress = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

// Favourites use numeric ids (Explore) and reference strings (daily verses); store both as text.
const favToDb = (k) => (typeof k === "number" ? `id:${k}` : `ref:${k}`);
const dbToFav = (s) => (s.startsWith("id:") ? Number(s.slice(3)) : s.slice(4));

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function saveLocal() {
  if (!userId) return;
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify({
      favorites: [...state.favorites].map(favToDb),
      novena: [...state.novena],
      rosary: state.rosary,
      queue,
    }));
  } catch { /* storage unavailable */ }
}

function loadLocal(uid) {
  try {
    const raw = JSON.parse(localStorage.getItem(cacheKey(uid)) || "null");
    if (raw) return raw;
  } catch { /* ignore corrupt cache */ }
  return { favorites: [], novena: [], rosary: null, queue: [] };
}

function enqueue(op) {
  queue = queue.filter((q) => !(q.kind === op.kind && q.key === op.key)).concat(op);
  saveLocal();
  flush();
}

async function send(op) {
  if (op.action === "put") {
    const { error } = await supabase.from(TABLE).upsert(
      { user_id: userId, kind: op.kind, item_key: op.key, value: op.value ?? null, updated_at: new Date().toISOString() },
      { onConflict: "user_id,kind,item_key" },
    );
    return !error;
  }
  const { error } = await supabase.from(TABLE).delete().eq("kind", op.kind).eq("item_key", op.key);
  return !error;
}

// Sends queued changes in order; stops at the first failure and retries later.
export async function flush() {
  if (flushing || !userId) return;
  flushing = true;
  try {
    while (queue.length) {
      const op = queue[0];
      let ok = false;
      try { ok = await send(op); } catch { ok = false; }
      if (!ok) break;
      queue = queue.filter((q) => q !== op);
      saveLocal();
    }
  } finally {
    flushing = false;
  }
}

if (typeof window !== "undefined") window.addEventListener("online", () => { flush(); });

// Call when a user signs in (or the session is restored).
export async function initProgress(uid) {
  if (!uid || uid === userId) return;
  userId = uid;
  const local = loadLocal(uid);
  queue = local.queue || [];
  emit({
    ready: false,
    favorites: new Set((local.favorites || []).map(dbToFav)),
    novena: new Set(local.novena || []),
    rosary: local.rosary || null,
  });

  let rows = null;
  try {
    const { data, error } = await supabase.from(TABLE).select("kind,item_key,value,updated_at");
    if (!error && data) rows = data;
  } catch { /* offline: keep the local copy */ }
  if (userId !== uid) return; // signed out or switched user meanwhile

  if (!rows) { emit({ ...state, ready: true }); return; }

  const favs = new Set(rows.filter((r) => r.kind === "favorite").map((r) => dbToFav(r.item_key)));
  const novena = new Set(rows.filter((r) => r.kind === "novena_day").map((r) => r.item_key));
  let rosary = rows.find((r) => r.kind === "rosary")?.value || null;
  // Apply changes made on this device that have not reached the server yet.
  for (const op of queue) {
    if (op.kind === "favorite") (op.action === "put" ? favs.add(dbToFav(op.key)) : favs.delete(dbToFav(op.key)));
    else if (op.kind === "novena_day") (op.action === "put" ? novena.add(op.key) : novena.delete(op.key));
    else if (op.kind === "rosary") rosary = op.action === "put" ? op.value : null;
  }
  if (rosary && rosary.date !== today()) rosary = null; // only resume a rosary started today
  emit({ ready: true, favorites: favs, novena, rosary });
  saveLocal();
  flush();
}

// Call on sign out.
export function resetProgress() {
  userId = null;
  queue = [];
  emit(EMPTY);
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

export function toggleNovenaDay(key) {
  if (!userId) return;
  const next = new Set(state.novena);
  const adding = !next.has(key);
  if (adding) next.add(key); else next.delete(key);
  emit({ ...state, novena: next });
  enqueue({ kind: "novena_day", key, action: adding ? "put" : "del" });
}

// value: { mystery, decade, beads } to remember the rosary in progress, or null to clear it.
export function saveRosary(value) {
  if (!userId) return;
  const stored = value ? { ...value, date: today() } : null;
  emit({ ...state, rosary: stored });
  enqueue({ kind: "rosary", key: "current", action: stored ? "put" : "del", value: stored });
}
