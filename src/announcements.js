// A "what's new" notice. It appears once each time someone opens the app, for three days
// starting from the first time that person sees it, and then never again.
//
// To announce something else later: change `id` (a new id starts a fresh three days) and
// the text. To stop announcing, set ANNOUNCEMENT to null.
export const ANNOUNCEMENT = {
  id: "intentions-2026-11",
  title: "New: My Intentions",
  body: "Keep a private list of the people and needs you are praying for. Add an intention, come back to it in prayer, and mark it when it is answered. Only you can see your list.",
  where: "You'll find it under Prayers.",
  actionLabel: "Open My Intentions",
  actionPath: "/prayers/intentions",
};

const DAYS = 3;
const WINDOW_MS = DAYS * 24 * 60 * 60 * 1000;
const firstSeenKey = (id) => `verbum_announce_${id}`;
const sessionKey = (id) => `verbum_announce_shown_${id}`;

// localStore remembers across visits; sessionStore lasts for one visit to the app.
export function shouldAnnounce(now, localStore, sessionStore, announcement = ANNOUNCEMENT) {
  if (!announcement) return false;
  try {
    if (sessionStore.getItem(sessionKey(announcement.id))) return false; // already shown this visit
    const firstSeen = Number(localStore.getItem(firstSeenKey(announcement.id)));
    return !firstSeen || now - firstSeen < WINDOW_MS;
  } catch {
    return false; // storage blocked: better silent than shown on every screen
  }
}

// Call when the notice is shown.
export function markAnnounced(now, localStore, sessionStore, announcement = ANNOUNCEMENT) {
  if (!announcement) return;
  try {
    sessionStore.setItem(sessionKey(announcement.id), "1");
    if (!localStore.getItem(firstSeenKey(announcement.id))) localStore.setItem(firstSeenKey(announcement.id), String(now));
  } catch { /* storage unavailable */ }
}
