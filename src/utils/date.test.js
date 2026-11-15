import { describe, it, expect } from "vitest";
import { localDateKey, addDays, msUntilMidnight } from "./date.js";

describe("date utils", () => {
  it("localDateKey uses local fields near midnight", () => {
    expect(localDateKey(new Date(2026, 10, 13, 23, 59))).toBe("2026-11-13");
    expect(localDateKey(new Date(2026, 0, 5, 0, 0))).toBe("2026-01-05");
  });
  it("addDays crosses month and year", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-11-15", 0)).toBe("2026-11-15");
  });
  it("msUntilMidnight", () => {
    expect(msUntilMidnight(new Date(2026, 0, 1, 23, 0))).toBe(3600000);
    expect(msUntilMidnight(new Date(2026, 0, 1, 0, 0))).toBe(86400000);
  });
});
