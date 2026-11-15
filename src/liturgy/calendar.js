import { localDateKey } from "../utils/date.js";
import { fallbackDay } from "./legacy.js";

// The liturgical day for a date, from data generated per year by
// scripts/build-liturgical-calendar.mjs. Each year's file loads only when needed.
//
// LiturgicalDay: { dateKey, key, name, rank, season, color, source }
//   rank:   SOLEMNITY | FEAST | MEMORIAL | OPT_MEMORIAL | COMMEMORATION | SUNDAY | FERIA | HOLY_WEEK | TRIDUUM
//   season: advent | christmas | lent | holyWeek | easter | ordinary
//   color:  green | purple | white | red | rose
//   source: "romcal", or "fallback" for years without data (season only, no celebration)

const loaders = import.meta.glob("./data/*.json", { import: "default" });
const cache = new Map();

const SEASONS = {
  "Advent": "advent", "Christmastide": "christmas", "Lent": "lent", "Holy Week": "holyWeek",
  "Easter": "easter", "Early Ordinary Time": "ordinary", "Later Ordinary Time": "ordinary",
};
const COLORS = new Set(["green", "purple", "white", "red", "rose"]);

function loadYear(year) {
  if (!cache.has(year)) {
    const load = loaders[`./data/${year}.json`];
    cache.set(year, load ? load().catch(() => null) : Promise.resolve(null));
  }
  return cache.get(year);
}

export async function getLiturgicalDay(date) {
  const dateKey = localDateKey(date);
  const data = await loadYear(date.getFullYear());
  const row = data?.[dateKey.slice(5)];
  if (!row) return fallbackDay(date);
  const [key, name, rank, seasonKey, colorKey] = row;
  const color = String(colorKey || "").toLowerCase();
  return { dateKey, key, name, rank, season: SEASONS[seasonKey] || "ordinary", color: COLORS.has(color) ? color : "green", source: "romcal" };
}
