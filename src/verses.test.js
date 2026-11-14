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
