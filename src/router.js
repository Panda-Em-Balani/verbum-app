import { useSyncExternalStore } from "react";

// A small history router: real URLs, a working Back button, and scroll handling.
// It never reads or changes location.hash, because sign-in links carry their tokens there.

export const ROUTES = [
  { name: "home", pattern: "/" },
  { name: "soul", pattern: "/soul" },
  { name: "explore", pattern: "/explore" },
  { name: "exploreSaved", pattern: "/explore/saved" },
  { name: "prayers", pattern: "/prayers" },
  { name: "rosary", pattern: "/prayers/rosary" },
  { name: "novenas", pattern: "/prayers/novenas" },
  { name: "intentions", pattern: "/prayers/intentions" },
  { name: "novena", pattern: "/prayers/novenas/:id" },
  { name: "threeOclock", pattern: "/prayers/three-oclock" },
  { name: "mass", pattern: "/mass" },
  { name: "install", pattern: "/install" },
  { name: "resetPassword", pattern: "/reset-password" },
];

const TAB_OF = {
  home: "home", soul: "soul", explore: "explore", exploreSaved: "explore",
  prayers: "prayers", rosary: "prayers", novenas: "prayers", novena: "prayers", threeOclock: "prayers", intentions: "prayers",
  mass: "mass",
};

const split = (path) => path.split("/").filter(Boolean);
// A badly encoded address is used as written instead of throwing.
const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

export function matchRoute(pathname) {
  const parts = split(pathname || "/");
  for (const { name, pattern } of ROUTES) {
    const want = split(pattern);
    if (want.length !== parts.length) continue;
    const params = {};
    const ok = want.every((seg, i) => {
      if (seg.startsWith(":")) { params[seg.slice(1)] = safeDecode(parts[i]); return true; }
      return seg === parts[i];
    });
    if (ok) return { name, params, notFound: false };
  }
  return { name: "home", params: {}, notFound: true };
}

export function tabOf(name) {
  return TAB_OF[name] || null;
}

// Notifications sent before routes existed link to "/?tab=<tab>&section=<section>".
const LEGACY_TABS = { home: "/", soul: "/soul", explore: "/explore", prayers: "/prayers", mass: "/mass" };
const LEGACY_SECTIONS = { rosary: "/prayers/rosary", novenas: "/prayers/novenas", "three-oclock": "/prayers/three-oclock" };

export function resolveLegacy(href) {
  let url;
  try { url = new URL(href, "http://localhost"); } catch { return null; }
  const q = url.searchParams;
  if (!q.has("tab") && !q.has("section")) return null;
  const path = LEGACY_SECTIONS[q.get("section")] || LEGACY_TABS[q.get("tab")] || "/";
  q.delete("tab");
  q.delete("section");
  const rest = q.toString();
  return rest ? `${path}?${rest}` : path;
}

const listeners = new Set();
const notify = () => listeners.forEach((l) => l());
const current = () => window.location.pathname + window.location.search;
const idx = () => window.history.state?.idx ?? 0;

// Call once before the first render.
export function initRouter() {
  if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  const canonical = resolveLegacy(window.location.href);
  if (canonical !== null) {
    window.history.replaceState({ idx: 0, scrollY: 0 }, "", canonical + window.location.hash);
  } else if (window.history.state?.idx === undefined) {
    window.history.replaceState({ idx: 0, scrollY: 0 }, "", window.location.href);
  }
  notify();
}

export function navigate(to, { replace = false } = {}) {
  if (to === current()) {
    window.scrollTo(0, 0);
    return;
  }
  const here = idx();
  if (replace) {
    window.history.replaceState({ idx: here, scrollY: 0 }, "", to);
  } else {
    // Remember where this screen was scrolled so Back can return to it.
    window.history.replaceState({ idx: here, scrollY: window.scrollY }, "", window.location.href);
    window.history.pushState({ idx: here + 1, scrollY: 0 }, "", to);
  }
  window.scrollTo(0, 0);
  notify();
}

// Goes back one screen, or to `fallback` when the app was opened directly on this screen.
export function goBack(fallback) {
  if (idx() > 0) window.history.back();
  else navigate(fallback, { replace: true });
}

function onPopState() {
  notify();
  const y = window.history.state?.scrollY ?? 0;
  requestAnimationFrame(() => window.scrollTo(0, y));
}

function subscribe(listener) {
  if (listeners.size === 0) window.addEventListener("popstate", onPopState);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("popstate", onPopState);
  };
}

let cached = null;
function getSnapshot() {
  const path = window.location.pathname;
  const search = window.location.search;
  if (!cached || cached.path !== path || cached.search !== search) {
    cached = { ...matchRoute(path), path, search };
  }
  return cached;
}

// { name, params, notFound, path, search }
export function useRoute() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
