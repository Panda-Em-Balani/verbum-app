import { DAILY_VERSES } from "./verses.js";

export function getDailyVerseStatic(date = new Date()) {
  const now = date;
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}
