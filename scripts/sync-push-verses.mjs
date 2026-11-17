// Rewrites the daily-verse list inside the push sender from src/verses.js, so the morning
// notification always carries the same verse and wording as the app's Home screen.
// Run with `npm run push-verses`, then paste the file into the Supabase Edge Function.
import { readFileSync, writeFileSync } from "node:fs";
import { DAILY_VERSES } from "../src/verses.js";

const file = new URL("../supabase/functions/push-sender/index.ts", import.meta.url);
const START = "// <verses:start>";
const END = "// <verses:end>";

export function renderVerses(verses = DAILY_VERSES) {
  const rows = verses.map((v) => `  { ref: ${JSON.stringify(v.displayRef || v.ref)}, text: ${JSON.stringify(v.text)} },`);
  return `const DAILY_VERSES: { ref: string; text: string }[] = [\n${rows.join("\n")}\n];`;
}

export function applyVerses(source, verses = DAILY_VERSES) {
  const a = source.indexOf(START);
  const b = source.indexOf(END);
  if (a === -1 || b === -1 || b < a) throw new Error("verse markers not found in the push sender");
  return `${source.slice(0, a + START.length)}\n${renderVerses(verses)}\n${source.slice(b)}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(file, applyVerses(readFileSync(file, "utf8")));
  console.log(`Push sender updated with ${DAILY_VERSES.length} verses`);
}
