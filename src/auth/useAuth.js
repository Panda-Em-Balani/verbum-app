import { useSyncExternalStore } from "react";
import { supabase, openedFromRecoveryLink } from "../supabase.js";

// The single source of truth for who is signed in.
//
// status: "loading"    session not known yet
//         "signedOut"
//         "needsName"  signed in, but we have no name for the greeting
//         "signedIn"
//         "recovery"   arrived from a password-reset link; must choose a new password
// user:   { id, email, name } or null

const INITIAL = { status: "loading", user: null };
let state = INITIAL;
// A password reset in progress is remembered for this browser tab, so reloading the
// "choose a new password" screen cannot skip it.
const RECOVERY_FLAG = "verbum_recovering";
const readRecoveryFlag = () => { try { return sessionStorage.getItem(RECOVERY_FLAG) === "1"; } catch { return false; } };
const setRecoveryFlag = (on) => { try { if (on) sessionStorage.setItem(RECOVERY_FLAG, "1"); else sessionStorage.removeItem(RECOVERY_FLAG); } catch { /* storage unavailable */ } };
let recovering = openedFromRecoveryLink || readRecoveryFlag();
let resolvingFor = null;
let unsubscribe = null;
const listeners = new Set();

const emit = (next) => { state = next; listeners.forEach((l) => l()); };
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const getAuth = () => state;
export const useAuth = () => useSyncExternalStore(subscribe, getAuth, getAuth);

const nameKey = (id) => `verbum_profile_name_${id}`;
const cachedName = (id) => { try { return localStorage.getItem(nameKey(id)) || ""; } catch { return ""; } };
const cacheName = (id, name) => { try { localStorage.setItem(nameKey(id), name); } catch { /* storage unavailable */ } };
const basic = (u, name = "") => ({ id: u.id, email: u.email || "", name });

// Finds the user's name: profile row, else the name given at sign-up (saved now), else ask.
// A failed request (offline) never asks for the name again; it uses the last known one.
async function resolveProfile(u) {
  if (resolvingFor === u.id) return;
  resolvingFor = u.id;
  let next;
  try {
    const { data, error } = await supabase.from("profiles").select("name").eq("id", u.id).maybeSingle();
    if (error) {
      next = { status: "signedIn", user: basic(u, cachedName(u.id)) };
    } else if (data?.name) {
      cacheName(u.id, data.name);
      next = { status: "signedIn", user: basic(u, data.name) };
    } else {
      const given = String(u.user_metadata?.name || u.user_metadata?.full_name || "").trim().slice(0, 80);
      if (given) {
        await supabase.from("profiles").upsert({ id: u.id, name: given });
        cacheName(u.id, given);
        next = { status: "signedIn", user: basic(u, given) };
      } else {
        next = { status: "needsName", user: basic(u) };
      }
    }
  } catch {
    next = { status: "signedIn", user: basic(u, cachedName(u.id)) };
  } finally {
    resolvingFor = null;
  }
  // Ignore the answer if the person signed out, switched account or opened a reset link meanwhile.
  if (recovering || state.status === "signedOut" || (state.user && state.user.id !== u.id)) return;
  emit(next);
}

// The session Supabase keeps on this device, if any.
function savedUser() {
  try {
    const raw = JSON.parse(localStorage.getItem(supabase.auth.storageKey) || "null");
    return raw?.user?.id ? raw.user : null;
  } catch { return null; }
}

function handle(event, session) {
  const u = session?.user;
  if (event === "PASSWORD_RECOVERY" && u) {
    recovering = true;
    setRecoveryFlag(true);
    emit({ status: "recovery", user: basic(u, cachedName(u.id)) });
    return;
  }
  if (event !== "SIGNED_OUT" && !u) {
    // Opened with no connection after the sign-in token expired: Supabase reports no session
    // although one is saved here. Keep the person in, so saved prayers work offline; when
    // the connection returns Supabase renews the session or signs out for real.
    const saved = typeof navigator !== "undefined" && navigator.onLine === false ? savedUser() : null;
    if (saved && !recovering) {
      emit({ status: "signedIn", user: basic(saved, cachedName(saved.id)) });
      return;
    }
  }
  if (event === "SIGNED_OUT" || !u) {
    recovering = false;
    setRecoveryFlag(false);
    emit({ status: "signedOut", user: null });
    return;
  }
  if (recovering) {
    setRecoveryFlag(true);
    emit({ status: "recovery", user: basic(u, cachedName(u.id)) });
    return;
  }
  const settled = state.status === "signedIn" || state.status === "needsName";
  if (settled && state.user?.id === u.id) return; // token refresh or duplicate event
  if (state.user?.id !== u.id) state = { status: "loading", user: basic(u) };
  resolveProfile(u);
}

// Starts listening for sign-in changes. Safe to call more than once.
export function startAuth() {
  if (unsubscribe) return unsubscribe;
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    // Supabase must not be called from inside this callback, so do the work just after it.
    setTimeout(() => handle(event, session), 0);
  });
  unsubscribe = () => { data.subscription.unsubscribe(); unsubscribe = null; };
  return unsubscribe;
}

// Saves the name asked for after the first sign-in.
export async function setProfileName(name) {
  const trimmed = String(name || "").trim().slice(0, 80);
  const u = state.user;
  if (!trimmed || !u) return { ok: false, error: "Please enter your name." };
  try {
    const { error } = await supabase.from("profiles").upsert({ id: u.id, name: trimmed });
    if (error) return { ok: false, error: "Couldn't save your name. Check your connection and try again." };
  } catch {
    return { ok: false, error: "Couldn't save your name. Check your connection and try again." };
  }
  cacheName(u.id, trimmed);
  emit({ status: "signedIn", user: { ...u, name: trimmed } });
  return { ok: true };
}

// Call after the new password is saved: the reset is over, carry on as a normal sign-in.
export function markRecovered() {
  recovering = false;
  setRecoveryFlag(false);
  const u = state.user;
  if (u) resolveProfile({ id: u.id, email: u.email, user_metadata: {} });
}

export async function signOut() {
  try { await supabase.auth.signOut(); } catch { /* sign out locally anyway */ }
  recovering = false;
  setRecoveryFlag(false);
  emit({ status: "signedOut", user: null });
}

// Tests only.
export function resetAuthStore({ keepRecovery = false } = {}) {
  if (unsubscribe) unsubscribe();
  state = INITIAL;
  if (!keepRecovery) setRecoveryFlag(false);
  recovering = readRecoveryFlag();
  resolvingFor = null;
}
