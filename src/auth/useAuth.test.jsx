// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const h = vi.hoisted(() => ({ cb: null, profile: { data: null, error: null }, upsert: { error: null }, upserts: [] }));

vi.mock("../supabase.js", () => {
  const from = () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => h.profile }) }),
    upsert: async (row) => { h.upserts.push(row); return h.upsert; },
  });
  const auth = {
    onAuthStateChange: (cb) => { h.cb = cb; return { data: { subscription: { unsubscribe: () => { h.cb = null; } } } }; },
    signOut: vi.fn(async () => ({ error: null })),
  };
  auth.storageKey = "sb-test-auth-token";
  return { supabase: { auth, from }, openedFromRecoveryLink: false };
});

import { startAuth, getAuth, setProfileName, markRecovered, resetAuthStore } from "./useAuth.js";

const user = (extra = {}) => ({ id: "u1", email: "ana@example.com", user_metadata: {}, ...extra });
const fire = async (event, session) => { h.cb(event, session); await vi.runAllTimersAsync(); };

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  sessionStorage.clear();
  h.profile = { data: null, error: null };
  h.upsert = { error: null };
  h.upserts = [];
  resetAuthStore();
  startAuth();
});
afterEach(() => { vi.useRealTimers(); });

describe("auth store", () => {
  it("starts loading, then signedOut for an empty INITIAL_SESSION", async () => {
    expect(getAuth()).toEqual({ status: "loading", user: null });
    await fire("INITIAL_SESSION", null);
    expect(getAuth()).toEqual({ status: "signedOut", user: null });
  });

  it("SIGNED_IN with a profile name is signedIn with that name", async () => {
    h.profile = { data: { name: "Ana" }, error: null };
    await fire("SIGNED_IN", { user: user() });
    expect(getAuth()).toEqual({ status: "signedIn", user: { id: "u1", email: "ana@example.com", name: "Ana" } });
    expect(h.upserts).toEqual([]);
  });

  it("SIGNED_IN with metadata name and no profile upserts and is signedIn", async () => {
    await fire("SIGNED_IN", { user: user({ user_metadata: { name: "Ana Maria" } }) });
    expect(h.upserts).toEqual([{ id: "u1", name: "Ana Maria" }]);
    expect(getAuth().status).toBe("signedIn");
    expect(getAuth().user.name).toBe("Ana Maria");
  });

  it("SIGNED_IN with neither is needsName, and setProfileName finishes sign-in", async () => {
    await fire("SIGNED_IN", { user: user() });
    expect(getAuth().status).toBe("needsName");
    const result = await setProfileName("  Ana ");
    expect(result).toEqual({ ok: true });
    expect(h.upserts).toEqual([{ id: "u1", name: "Ana" }]);
    expect(getAuth()).toEqual({ status: "signedIn", user: { id: "u1", email: "ana@example.com", name: "Ana" } });
  });

  it("profile request error uses the cached name and stays signedIn", async () => {
    h.profile = { data: { name: "Ana" }, error: null };
    await fire("SIGNED_IN", { user: user() });
    resetAuthStore();
    startAuth();
    h.profile = { data: null, error: { message: "Failed to fetch" } };
    await fire("INITIAL_SESSION", { user: user() });
    expect(getAuth().status).toBe("signedIn");
    expect(getAuth().user.name).toBe("Ana");
  });

  it("profile request error with nothing cached is signedIn, never needsName", async () => {
    h.profile = { data: null, error: { message: "Failed to fetch" } };
    await fire("INITIAL_SESSION", { user: user() });
    expect(getAuth().status).toBe("signedIn");
    expect(getAuth().user.name).toBe("");
  });

  it("PASSWORD_RECOVERY shows the reset screen", async () => {
    h.profile = { data: { name: "Ana" }, error: null };
    await fire("SIGNED_IN", { user: user() });
    await fire("PASSWORD_RECOVERY", { user: user() });
    expect(getAuth().status).toBe("recovery");
    await fire("SIGNED_IN", { user: user() });
    await fire("USER_UPDATED", { user: user() });
    expect(getAuth().status).toBe("recovery");
    markRecovered();
    await vi.runAllTimersAsync();
    expect(getAuth().status).toBe("signedIn");
    expect(getAuth().user.name).toBe("Ana");
  });

  it("TOKEN_REFRESHED for the same user changes nothing", async () => {
    h.profile = { data: { name: "Ana" }, error: null };
    await fire("SIGNED_IN", { user: user() });
    const before = getAuth();
    h.profile = { data: { name: "Changed" }, error: null };
    await fire("TOKEN_REFRESHED", { user: user() });
    expect(getAuth()).toBe(before);
  });

  it("SIGNED_OUT clears the user", async () => {
    h.profile = { data: { name: "Ana" }, error: null };
    await fire("SIGNED_IN", { user: user() });
    await fire("SIGNED_OUT", null);
    expect(getAuth()).toEqual({ status: "signedOut", user: null });
  });
});

describe("offline start", () => {
  const stored = { user: { id: "u1", email: "ana@example.com", user_metadata: {} }, refresh_token: "r" };
  const setOnline = (v) => Object.defineProperty(navigator, "onLine", { configurable: true, get: () => v });

  it("stays signed in when offline and a session is saved on the device", async () => {
    localStorage.setItem("verbum_profile_name_u1", "Ana");
    localStorage.setItem("sb-test-auth-token", JSON.stringify(stored));
    setOnline(false);
    await fire("INITIAL_SESSION", null);
    setOnline(true);
    expect(getAuth()).toEqual({ status: "signedIn", user: { id: "u1", email: "ana@example.com", name: "Ana" } });
  });

  it("signs out when online and there is no session", async () => {
    localStorage.setItem("sb-test-auth-token", JSON.stringify(stored));
    setOnline(true);
    await fire("INITIAL_SESSION", null);
    expect(getAuth().status).toBe("signedOut");
  });

  it("a real SIGNED_OUT always signs out, even offline", async () => {
    localStorage.setItem("sb-test-auth-token", JSON.stringify(stored));
    setOnline(false);
    await fire("SIGNED_OUT", null);
    setOnline(true);
    expect(getAuth().status).toBe("signedOut");
  });
});

describe("password reset survives a reload", () => {
  it("remembers the reset for this visit and forgets it once done", async () => {
    h.profile = { data: { name: "Ana" }, error: null };
    await fire("PASSWORD_RECOVERY", { user: user() });
    expect(sessionStorage.getItem("verbum_recovering")).toBe("1");
    // Reload: a fresh store in the same tab.
    resetAuthStore({ keepRecovery: true });
    startAuth();
    await fire("INITIAL_SESSION", { user: user() });
    expect(getAuth().status).toBe("recovery");
    markRecovered();
    await vi.runAllTimersAsync();
    expect(sessionStorage.getItem("verbum_recovering")).toBeNull();
    expect(getAuth().status).toBe("signedIn");
  });
});
