// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

// A programmable stand-in for the Supabase table.
const h = vi.hoisted(() => ({
  select: { data: null, error: { message: "offline" }, status: 0 },
  respond: () => ({ error: null, status: 201 }),
  sent: [],
}));

vi.mock("./supabase.js", () => {
  const reply = (op) => {
    h.sent.push(op);
    const r = h.respond(op);
    if (r instanceof Error) throw r;
    return r;
  };
  return {
    supabase: {
      from: () => ({
        select: async () => h.select,
        upsert: async (row) => reply({ action: "put", kind: row.kind, key: row.item_key, value: row.value }),
        delete: () => {
          const f = {};
          const chain = { eq: (col, val) => { f[col] = val; return chain; }, then: (ok, bad) => Promise.resolve().then(() => reply({ action: "del", kind: f.kind, key: f.item_key, user: f.user_id })).then(ok, bad) };
          return chain;
        },
      }),
    },
  };
});
vi.mock("./analytics.js", () => ({ track: vi.fn() }));

import { initProgress, resetProgress, getSnapshot, flush, toggleFavorite, toggleNovenaDay, logPrayer, addIntention, toggleIntentionAnswered, deleteIntention, clearPrivateCache } from "./progress.js";
import { track } from "./analytics.js";
import { localDateKey } from "./utils/date.js";

const KEY = "verbum_progress_v1_u1";
const seed = (value) => localStorage.setItem(KEY, JSON.stringify(value));
const stored = () => JSON.parse(localStorage.getItem(KEY));
const today = localDateKey(new Date());
const offline = { data: null, error: { message: "offline" }, status: 0 };
const server = (rows) => ({ data: rows, error: null, status: 200 });

beforeEach(() => {
  localStorage.clear();
  resetProgress();
  h.select = offline;
  h.respond = () => ({ error: null, status: 201 });
  h.sent = [];
  vi.clearAllMocks();
});

describe("local cache", () => {
  it("loads a v1 cache unchanged", async () => {
    seed({ favorites: ["id:3", "ref:Matthew 5:9"], novena: ["divine-mercy-0"], rosary: null, queue: [] });
    await initProgress("u1");
    const s = getSnapshot();
    expect(s.favorites.has(3)).toBe(true);
    expect(s.favorites.has("Matthew 5:9")).toBe(true);
    expect(s.novena.has("divine-mercy-0")).toBe(true);
    expect(s.ready).toBe(true);
  });

  it("a v1 cache with novena as an array loads as a Map with null dates", async () => {
    seed({ favorites: [], novena: ["divine-mercy-0", "sacred-heart-2"], rosary: null, queue: [] });
    await initProgress("u1");
    expect(getSnapshot().novena.get("divine-mercy-0")).toBeNull();
    expect(getSnapshot().prayerLog.size).toBe(0);
    expect(getSnapshot().intentions.size).toBe(0);
  });

  it("drops a local rosary from another day and keeps one from today", async () => {
    seed({ favorites: [], novena: [], rosary: { mystery: "Joyful", decade: 2, beads: 4, date: "2020-01-01" }, queue: [] });
    await initProgress("u1");
    expect(getSnapshot().rosary).toBeNull();
    resetProgress();
    const rosary = { mystery: "Joyful", decade: 2, beads: 4, date: today };
    seed({ favorites: [], novena: [], rosary, queue: [] });
    await initProgress("u1");
    expect(getSnapshot().rosary).toEqual(rosary);
  });
});

describe("sync queue", () => {
  it("drops an op the server rejects with 4xx and continues", async () => {
    seed({ favorites: [], novena: [], rosary: null, queue: [
      { kind: "favorite", key: "id:1", action: "put" },
      { kind: "favorite", key: "id:2", action: "put" },
    ] });
    h.respond = (op) => (op.key === "id:1" ? { error: { message: "violates check constraint" }, status: 400 } : { error: null, status: 201 });
    h.select = server([]);
    await initProgress("u1");
    await flush();
    expect(h.sent.map((o) => o.key)).toEqual(["id:1", "id:2"]);
    expect(stored().queue).toEqual([]);
    expect(track).toHaveBeenCalledWith("sync_drop", { kind: "favorite", status: 400 });
  });

  it("keeps an op on network failure", async () => {
    await initProgress("u1");
    h.respond = () => new TypeError("Failed to fetch");
    toggleFavorite(1);
    toggleFavorite(2);
    await flush();
    // Each pass stops at the failing change; the one behind it is never sent out of order.
    expect(h.sent.length).toBeGreaterThan(0);
    expect(h.sent.every((o) => o.key === "id:1")).toBe(true);
    expect(stored().queue.map((o) => o.key)).toEqual(["id:1", "id:2"]);
  });

  it("retries on 401 and 503", async () => {
    await initProgress("u1");
    for (const status of [401, 503, 429, 0]) {
      h.respond = () => ({ error: { message: "x" }, status });
      toggleFavorite(7);
      await flush();
      expect(stored().queue.length, String(status)).toBe(1);
      h.respond = () => ({ error: null, status: 201 });
      await flush();
      expect(stored().queue.length).toBe(0);
      toggleFavorite(7); // remove again for the next round
      await flush();
    }
  });

  it("deletes are limited to the signed-in user", async () => {
    seed({ favorites: ["id:5"], novena: [], rosary: null, queue: [] });
    await initProgress("u1");
    toggleFavorite(5);
    await flush();
    expect(h.sent.at(-1)).toMatchObject({ action: "del", kind: "favorite", key: "id:5", user: "u1" });
  });
});

describe("prayer log and novena dates", () => {
  it("logPrayer adds an act once", async () => {
    await initProgress("u1");
    logPrayer("rosary");
    logPrayer("rosary");
    logPrayer("chaplet");
    await flush();
    expect(getSnapshot().prayerLog.get(today)).toEqual(["rosary", "chaplet"]);
    expect(h.sent.filter((o) => o.kind === "prayer_log").at(-1)).toMatchObject({ key: today, value: { acts: ["rosary", "chaplet"] } });
  });

  it("toggleNovenaDay stores today's date and counts as prayer", async () => {
    await initProgress("u1");
    toggleNovenaDay("divine-mercy-0");
    await flush();
    expect(getSnapshot().novena.get("divine-mercy-0")).toBe(today);
    expect(h.sent.find((o) => o.kind === "novena_day")).toMatchObject({ action: "put", key: "divine-mercy-0", value: { date: today } });
    expect(getSnapshot().prayerLog.get(today)).toEqual(["novena"]);
    toggleNovenaDay("divine-mercy-0");
    expect(getSnapshot().novena.has("divine-mercy-0")).toBe(false);
  });

  it("loads novena dates and prayer days from the server", async () => {
    h.select = server([
      { kind: "novena_day", item_key: "sacred-heart-1", value: { date: "2026-11-01" } },
      { kind: "novena_day", item_key: "sacred-heart-0", value: null },
      { kind: "prayer_log", item_key: "2026-11-01", value: { acts: ["novena"] } },
    ]);
    await initProgress("u1");
    expect(getSnapshot().novena.get("sacred-heart-1")).toBe("2026-11-01");
    expect(getSnapshot().novena.get("sacred-heart-0")).toBeNull();
    expect(getSnapshot().prayerLog.get("2026-11-01")).toEqual(["novena"]);
  });
});

describe("intentions", () => {
  it("adds, marks answered and deletes", async () => {
    await initProgress("u1");
    expect(addIntention("   ")).toBeNull();
    expect(addIntention("x".repeat(501))).toBeNull();
    const id = addIntention("  For my mother's health ");
    expect(getSnapshot().intentions.get(id)).toMatchObject({ text: "For my mother's health", answeredAt: null });
    toggleIntentionAnswered(id);
    expect(getSnapshot().intentions.get(id).answeredAt).toBeTruthy();
    toggleIntentionAnswered(id);
    expect(getSnapshot().intentions.get(id).answeredAt).toBeNull();
    await flush();
    expect(h.sent.find((o) => o.kind === "intention")).toMatchObject({ action: "put", key: id });
    deleteIntention(id);
    await flush();
    expect(getSnapshot().intentions.has(id)).toBe(false);
    expect(h.sent.at(-1)).toMatchObject({ action: "del", kind: "intention", key: id });
  });

  it("keeps new kinds on the device when the server does not accept them yet, and uploads later", async () => {
    // Before the database update is run, the server rejects the new kinds.
    h.select = server([]);
    h.respond = (op) => (op.kind === "intention" || op.kind === "prayer_log" ? { error: { message: "check constraint" }, status: 400 } : { error: null, status: 201 });
    await initProgress("u1");
    const id = addIntention("Peace");
    logPrayer("rosary");
    await flush();
    expect(stored().queue).toEqual([]);

    // Reload: the server still has nothing, but the device keeps them.
    resetProgress();
    await initProgress("u1");
    await flush();
    expect(getSnapshot().intentions.has(id)).toBe(true);
    expect(getSnapshot().prayerLog.get(today)).toEqual(["rosary"]);

    // After the database update, the next load uploads them.
    resetProgress();
    h.sent = [];
    h.respond = () => ({ error: null, status: 201 });
    await initProgress("u1");
    await flush();
    expect(h.sent.some((o) => o.kind === "intention" && o.key === id)).toBe(true);
    expect(h.sent.some((o) => o.kind === "prayer_log" && o.key === today)).toBe(true);
    expect(stored().localOnly).toEqual([]);
  });
});

describe("device-only kinds are offered to the server with one probe", () => {
  it("sends a single probe per kind while the server refuses, then uploads everything", async () => {
    h.select = server([]);
    const refuse = (op) => (op.kind === "intention" || op.kind === "prayer_log" ? { error: { message: "check constraint" }, status: 400 } : { error: null, status: 201 });
    h.respond = refuse;
    await initProgress("u1");
    const ids = [addIntention("One"), addIntention("Two"), addIntention("Three")];
    await flush();

    // Next launch, server still refusing: one request for the kind, not one per item.
    resetProgress();
    h.sent = [];
    await initProgress("u1");
    await flush();
    expect(h.sent.filter((o) => o.kind === "intention").length).toBe(1);
    expect(stored().queue).toEqual([]);
    expect(getSnapshot().intentions.size).toBe(3);

    // Database updated: the probe succeeds and the rest follow, each once.
    resetProgress();
    h.sent = [];
    h.respond = () => ({ error: null, status: 201 });
    await initProgress("u1");
    await flush();
    const uploaded = h.sent.filter((o) => o.kind === "intention").map((o) => o.key).sort();
    expect(uploaded).toEqual([...ids].sort());
    expect(stored().localOnly).toEqual([]);
  });

  it("forgets intentions kept on the device at sign-out once they are safely on the server", async () => {
    await initProgress("u1");
    addIntention("Private thing");
    await flush();
    clearPrivateCache();
    expect(JSON.stringify(stored())).not.toContain("Private thing");
  });

  it("keeps unsent intentions on the device at sign-out", async () => {
    await initProgress("u1");
    h.respond = () => new TypeError("Failed to fetch");
    addIntention("Not sent yet");
    await flush();
    clearPrivateCache();
    expect(JSON.stringify(stored())).toContain("Not sent yet");
  });
});
