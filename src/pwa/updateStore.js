import { useSyncExternalStore } from "react";

// Holds the "new version ready" action between the service worker registration (main.jsx)
// and the banner that offers it (App.jsx).
let pending = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const subscribeUpdate = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const getUpdate = () => pending;
export function setUpdate(apply) { pending = apply; emit(); }
export function clearUpdate() { pending = null; emit(); }

// The function that applies the waiting update, or null when there is none.
export const useUpdate = () => useSyncExternalStore(subscribeUpdate, getUpdate, getUpdate);
