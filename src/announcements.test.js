import { describe, it, expect } from "vitest";
import { ANNOUNCEMENT, shouldAnnounce, markAnnounced } from "./announcements.js";

// Minimal stand-ins for localStorage (kept between visits) and sessionStorage (one visit).
const store = (initial = {}) => {
  const data = { ...initial };
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, data };
};
const DAY = 24 * 60 * 60 * 1000;
const t0 = new Date(2026, 10, 20, 9, 0).getTime();

describe("announcement", () => {
  it("shows on the first visit and starts the three-day window", () => {
    const local = store(), session = store();
    expect(shouldAnnounce(t0, local, session)).toBe(true);
    markAnnounced(t0, local, session);
    expect(Number(local.data[`verbum_announce_${ANNOUNCEMENT.id}`])).toBe(t0);
  });

  it("shows once per visit", () => {
    const local = store(), session = store();
    markAnnounced(t0, local, session);
    expect(shouldAnnounce(t0 + 60000, local, session)).toBe(false);
  });

  it("shows again on each new visit for three days", () => {
    const local = store();
    markAnnounced(t0, local, store());
    expect(shouldAnnounce(t0 + 1 * DAY, local, store())).toBe(true);
    expect(shouldAnnounce(t0 + 3 * DAY - 1000, local, store())).toBe(true);
  });

  it("stops after three days", () => {
    const local = store();
    markAnnounced(t0, local, store());
    expect(shouldAnnounce(t0 + 3 * DAY + 1000, local, store())).toBe(false);
    expect(shouldAnnounce(t0 + 30 * DAY, local, store())).toBe(false);
  });

  it("a later visit does not restart the window", () => {
    const local = store();
    markAnnounced(t0, local, store());
    markAnnounced(t0 + 2 * DAY, local, store());
    expect(Number(local.data[`verbum_announce_${ANNOUNCEMENT.id}`])).toBe(t0);
  });

  it("stays quiet when storage is unavailable", () => {
    const broken = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    expect(shouldAnnounce(t0, broken, broken)).toBe(false);
    expect(() => markAnnounced(t0, broken, broken)).not.toThrow();
  });
});
