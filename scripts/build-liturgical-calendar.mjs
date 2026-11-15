// Generates src/liturgy/data/<year>.json from romcal (General Roman Calendar, English).
// romcal is a dev dependency only: the app ships these small files, not the library.
// Run with `npm run calendar` to add more years.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";

const romcal = createRequire(import.meta.url)("romcal");
const FROM = 2025;
const TO = 2036;
const outDir = new URL("../src/liturgy/data/", import.meta.url);
mkdirSync(outDir, { recursive: true });

for (let year = FROM; year <= TO; year++) {
  const days = {};
  for (const c of romcal.calendarFor({ year, country: "general", locale: "en" })) {
    const key = c.moment.slice(5, 10); // "MM-DD"
    if (days[key]) continue; // one celebration per date
    days[key] = [c.key, c.name, c.type, c.data.season.key, c.data.meta.liturgicalColor.key];
  }
  const expected = new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
  if (Object.keys(days).length !== expected) {
    console.error(`${year}: expected ${expected} days, got ${Object.keys(days).length}`);
    process.exit(1);
  }
  writeFileSync(new URL(`${year}.json`, outDir), JSON.stringify(days) + "\n");
}
console.log(`Calendar written for ${FROM}-${TO}`);
