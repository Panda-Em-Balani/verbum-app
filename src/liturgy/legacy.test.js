import { describe, it, expect } from "vitest";
import { getEaster, getLiturgicalSeason, isThreeOClockHour } from "./legacy.js";

const ymd = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

describe("legacy liturgy helpers", () => {
  it("computes Easter", () => {
    expect(ymd(getEaster(2026))).toEqual([2026, 4, 5]);
    expect(ymd(getEaster(2027))).toEqual([2027, 3, 28]);
  });

  it("finds the season for a date", () => {
    expect(getLiturgicalSeason(new Date(2026, 10, 13)).name).toBe("Ordinary Time");
    expect(getLiturgicalSeason(new Date(2026, 11, 1)).name).toBe("Advent");
  });

  it("knows the three o'clock hour", () => {
    expect(isThreeOClockHour(new Date(2026, 0, 1, 15, 30))).toBe(true);
    expect(isThreeOClockHour(new Date(2026, 0, 1, 16, 0))).toBe(false);
  });
});
