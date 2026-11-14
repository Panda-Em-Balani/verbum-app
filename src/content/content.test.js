import { describe, it, expect } from "vitest";
import { ROSARY } from "./rosary.js";
import { NOVENAS } from "./novenas.js";
import { SAINTS } from "./saints.js";
import { HAPPENINGS } from "./happenings.js";

const filled = (s) => typeof s === "string" && s.trim().length > 0;

describe("content", () => {
  it("rosary has 4 mystery sets of 5 decades", () => {
    expect(Object.keys(ROSARY)).toEqual(["Joyful", "Sorrowful", "Glorious", "Luminous"]);
    for (const set of Object.values(ROSARY)) {
      expect(set.decades).toHaveLength(5);
      for (const d of set.decades) expect(filled(d.name) && filled(d.ref) && filled(d.med)).toBe(true);
    }
  });

  it("every novena has 9 days numbered 1..9 with intention and prayer", () => {
    expect(NOVENAS.length).toBeGreaterThan(0);
    for (const n of NOVENAS) {
      expect(n.days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (const d of n.days) expect(filled(d.intention) && filled(d.prayer)).toBe(true);
    }
  });

  it("saints have name, feast {m 1-12, d 1-31}, bio, quote", () => {
    expect(SAINTS.length).toBeGreaterThan(0);
    for (const s of SAINTS) {
      expect(filled(s.name) && filled(s.bio) && filled(s.quote), s.name).toBe(true);
      expect(s.feast.m >= 1 && s.feast.m <= 12 && s.feast.d >= 1 && s.feast.d <= 31, s.name).toBe(true);
    }
  });

  it("happenings have month, day, title, body", () => {
    expect(HAPPENINGS.length).toBeGreaterThan(0);
    for (const h of HAPPENINGS) {
      expect(Number.isInteger(h.month) && Number.isInteger(h.day), h.title).toBe(true);
      expect(filled(h.title) && filled(h.body)).toBe(true);
    }
  });
});
