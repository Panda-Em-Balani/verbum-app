// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({ select: { data: null, error: { message: "offline" } } }));

vi.mock("./supabase.js", () => ({
  supabase: {
    from: () => ({
      select: async () => h.select,
      upsert: async () => ({ error: null, status: 201 }),
      delete: () => ({ eq: () => ({ eq: () => ({ eq: async () => ({ error: null, status: 204 }) }) }) }),
    }),
  },
}));

import { initProgress, resetProgress, getSnapshot } from "./progress.js";
import { localDateKey } from "./utils/date.js";

const KEY = "verbum_progress_v1_u1";
const seed = (value) => localStorage.setItem(KEY, JSON.stringify(value));

beforeEach(() => {
  localStorage.clear();
  resetProgress();
  h.select = { data: null, error: { message: "offline" } };
});

describe("progress: rosary resume", () => {
  it("drops a local rosary from another day", async () => {
    seed({ favorites: [], novena: [], rosary: { mystery: "Joyful", decade: 2, beads: 4, date: "2020-01-01" }, queue: [] });
    await initProgress("u1");
    expect(getSnapshot().rosary).toBeNull();
  });

  it("keeps a local rosary from today", async () => {
    const rosary = { mystery: "Joyful", decade: 2, beads: 4, date: localDateKey(new Date()) };
    seed({ favorites: [], novena: [], rosary, queue: [] });
    await initProgress("u1");
    expect(getSnapshot().rosary).toEqual(rosary);
  });
});
