import { DAILY_VERSES } from "./verses.js";

// The verse for a date: one per calendar day, cycling through the list. Counted in whole
// local days, so it changes at midnight all year (daylight-saving changes included).
export function getDailyVerseStatic(date = new Date()) {
  const dayOfYear = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}
