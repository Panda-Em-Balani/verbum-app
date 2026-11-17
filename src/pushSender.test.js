import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { DAILY_VERSES } from "./verses.js";
import { getDailyVerseStatic } from "./dailyVerse.js";
import { applyVerses } from "../scripts/sync-push-verses.mjs";

const source = readFileSync(new URL("../supabase/functions/push-sender/index.ts", import.meta.url), "utf8");

describe("push sender", () => {
  it("carries the same daily verses as the app (run `npm run push-verses` if this fails)", () => {
    expect(applyVerses(source)).toBe(source);
    expect(source).toContain(JSON.stringify(DAILY_VERSES[0].text));
  });

  it("picks the same verse for a day as the Home screen", () => {
    // The sender's formula, as written in the function.
    const senderIndex = (date) => {
      const startOfYear = new Date(date.getFullYear(), 0, 0).getTime();
      return Math.floor((date.getTime() - startOfYear) / 86400000) % DAILY_VERSES.length;
    };
    for (const d of [new Date(2026, 0, 1, 7), new Date(2026, 10, 17, 7), new Date(2026, 11, 31, 7), new Date(2028, 1, 29, 7)]) {
      expect(DAILY_VERSES[senderIndex(d)].ref, d.toDateString()).toBe(getDailyVerseStatic(d).ref);
    }
  });

  it("uses links the app understands", () => {
    for (const url of source.match(/url:\s+'[^']+'/g)) expect(url).toMatch(/'\/\?tab=(home|prayers)(&section=three-oclock)?'/);
  });
});
