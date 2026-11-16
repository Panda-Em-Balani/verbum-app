import { describe, it, expect } from "vitest";
import { computeStreak } from "./streak.js";

describe("computeStreak", () => {
  it("empty is 0", () => {
    expect(computeStreak([], "2026-11-16").current).toBe(0);
  });
  it("today and yesterday is 2", () => {
    expect(computeStreak(["2026-11-16", "2026-11-15"], "2026-11-16").current).toBe(2);
  });
  it("yesterday only is 1", () => {
    expect(computeStreak(["2026-11-15"], "2026-11-16").current).toBe(1);
  });
  it("a gap resets", () => {
    expect(computeStreak(["2026-11-16", "2026-11-14", "2026-11-13"], "2026-11-16").current).toBe(1);
    expect(computeStreak(["2026-11-13"], "2026-11-16").current).toBe(0);
  });
  it("last7 has 7 days ending today, oldest first", () => {
    const { last7 } = computeStreak(["2026-11-16", "2026-11-12"], "2026-11-16");
    expect(last7.map((d) => d.dateKey)).toEqual(["2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15", "2026-11-16"]);
    expect(last7.map((d) => d.prayed)).toEqual([false, false, true, false, false, false, true]);
  });
  it("crosses a month boundary", () => {
    expect(computeStreak(["2026-12-01", "2026-11-30", "2026-11-29"], "2026-12-01").current).toBe(3);
  });
});
