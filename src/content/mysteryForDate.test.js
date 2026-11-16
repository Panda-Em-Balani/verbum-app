import { describe, it, expect } from "vitest";
import { mysteryForDate } from "./mysteryForDate.js";

describe("mysteryForDate", () => {
  it("covers all seven weekdays", () => {
    // 13-19 November 2026 is Friday to Thursday.
    const got = [13, 14, 15, 16, 17, 18, 19].map((d) => mysteryForDate(new Date(2026, 10, d)));
    expect(got).toEqual(["Sorrowful", "Joyful", "Glorious", "Joyful", "Sorrowful", "Glorious", "Luminous"]);
  });
});
