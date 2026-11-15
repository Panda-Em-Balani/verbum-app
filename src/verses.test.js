import { describe, it, expect } from "vitest";
import fixture from "./__fixtures__/verse-slugs.json";
import { VERSES, findVerse, verseSlug } from "./verses.js";

describe("verses", () => {
  it("every previously shared slug still resolves", () => {
    // Two verses may share a slug; findVerse returns the first, which is what shared links got.
    const first = new Map();
    for (const entry of fixture) if (!first.has(entry.slug)) first.set(entry.slug, entry.ref);
    expect(first.size).toBeGreaterThan(0);
    for (const [slug, ref] of first) {
      const hit = findVerse(slug);
      expect(hit, slug).not.toBeNull();
      expect(hit.ref).toBe(ref);
      expect(hit.text.length).toBeGreaterThan(0);
    }
  });

  it("VERSES ids are unique integers", () => {
    const ids = VERSES.map((v) => v.id);
    expect(ids.every(Number.isInteger)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("verseSlug('Psalm 23:1') === 'psalm-23-1'", () => {
    expect(verseSlug("Psalm 23:1")).toBe("psalm-23-1");
  });
});

import { DAILY_VERSES, LIBRARY } from "./verses.js";
import { CATEGORIES } from "./content/categories.js";

describe("verse library", () => {
  it("every category has at least 4 verses in LIBRARY", () => {
    for (const c of CATEGORIES) {
      expect(LIBRARY.filter((v) => v.category.includes(c.id)).length, c.id).toBeGreaterThanOrEqual(4);
    }
  });

  it("VERSES has at least 50 entries with unique refs and consecutive ids", () => {
    expect(VERSES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(VERSES.map((v) => v.ref)).size).toBe(VERSES.length);
    expect(VERSES.map((v) => v.id)).toEqual(VERSES.map((_, i) => i + 1));
    for (const v of VERSES) expect(v.text && v.explanation && v.example && v.book, v.ref).toBeTruthy();
  });

  it("LIBRARY has no duplicate ids", () => {
    expect(new Set(LIBRARY.map((v) => v.id)).size).toBe(LIBRARY.length);
  });

  it("quoted Scripture stays under 4,500 words (NABRE permission limit is 5,000)", () => {
    const seen = new Set();
    let words = 0;
    for (const v of [...VERSES, ...DAILY_VERSES]) {
      if (seen.has(v.ref)) continue;
      seen.add(v.ref);
      words += v.text.split(/\s+/).length;
    }
    expect(words).toBeLessThan(4500);
  });

  it("every VERSES category is a known theme", () => {
    const known = new Set([...CATEGORIES.map((c) => c.id), "courage", "purpose", "rest", "suffering", "prayer", "relationships", "virtue", "guidance"]);
    for (const v of VERSES) for (const c of v.category) expect(known.has(c), `${v.ref}: ${c}`).toBe(true);
  });
});
