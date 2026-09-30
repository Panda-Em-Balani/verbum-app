import { supabase } from "./supabase.js";

// Anonymous, fire-and-forget event counts (no user id, no personal data).
// Rows go to the public.events table (see supabase/events.sql). Failures are ignored
// so analytics can never break the app.
export function track(event, props = {}) {
  try {
    supabase
      .from("events")
      .insert({ event, props })
      .then(() => {}, () => {});
  } catch {
    // ignore
  }
}
