// Chooses which saint or feast entry belongs to a liturgical day.

// Lower-ranked days can share the date with an entry that has no calendar key.
const ALLOWS_DATE_MATCH = new Set(["FERIA", "OPT_MEMORIAL", "COMMEMORATION"]);

// Returns { item, by: "key" | "date" } or null.
// An entry whose romcalKey equals the day's celebration always wins. Otherwise an entry
// without a key may match by fixed date, but only on weekdays, optional memorials and
// commemorations, so it never appears on a Sunday or a higher feast.
export function pickForDay(day, items) {
  if (!day) return null;
  if (day.key) {
    const byKey = items.find((x) => x.romcalKey && x.romcalKey === day.key);
    if (byKey) return { item: byKey, by: "key" };
  }
  if (!ALLOWS_DATE_MATCH.has(day.rank)) return null;
  const month = Number(day.dateKey.slice(5, 7));
  const date = Number(day.dateKey.slice(8, 10));
  const byDate = items.find((x) => !x.romcalKey && (x.feast ? x.feast.m === month && x.feast.d === date : x.month === month && x.day === date));
  return byDate ? { item: byDate, by: "date" } : null;
}

export const RANK_LABEL = {
  SOLEMNITY: "Solemnity", FEAST: "Feast", MEMORIAL: "Memorial", OPT_MEMORIAL: "Optional memorial",
  COMMEMORATION: "Commemoration", SUNDAY: "Sunday", FERIA: "Weekday", HOLY_WEEK: "Holy Week", TRIDUUM: "Easter Triduum",
};

export const SEASON_TEXT = {
  advent: { name: "Advent", desc: "A time of hopeful waiting and preparation for the coming of Christ." },
  christmas: { name: "Christmas", desc: "We celebrate the Incarnation, God becoming man for our salvation." },
  lent: { name: "Lent", desc: "Forty days of prayer, fasting, and almsgiving as we journey toward Easter." },
  holyWeek: { name: "Holy Week", desc: "The holiest week of the year, from Palm Sunday through the Easter Triduum." },
  easter: { name: "Easter", desc: "Fifty days of rejoicing in the Resurrection of Our Lord Jesus Christ." },
  ordinary: { name: "Ordinary Time", desc: "The Church invites us to grow in faith, hope, and love through the teachings of Christ." },
};
