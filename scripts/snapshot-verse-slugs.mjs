// One-off: records every verse slug that existed when shared links were first protected.
// The fixture is committed and must never be regenerated (src/verses.test.js depends on it).
import { writeFileSync } from "node:fs";
import { VERSES, DAILY_VERSES, verseSlug } from "../src/verses.js";

const out = [...VERSES, ...DAILY_VERSES].map((v) => ({ slug: verseSlug(v.ref), ref: v.ref }));
writeFileSync(new URL("../src/__fixtures__/verse-slugs.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log(`${out.length} slugs written`);
