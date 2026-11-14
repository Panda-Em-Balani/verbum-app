// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../supabase.js", () => {
  const auth = {
    signUp: vi.fn(), signInWithPassword: vi.fn(), signInWithOtp: vi.fn(),
    resetPasswordForEmail: vi.fn(), updateUser: vi.fn(), signInWithOAuth: vi.fn(),
  };
  return { supabase: { auth, from: vi.fn() } };
});

import { supabase } from "../supabase.js";
import { signUp, signIn, sendMagicLink, sendPasswordReset, updatePassword, friendlyAuthError, readAuthError, isValidEmail } from "./authActions.js";

const origin = window.location.origin;

beforeEach(() => { vi.clearAllMocks(); });

describe("signUp", () => {
  it("passes the name as metadata and the origin as redirect", async () => {
    supabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u1" }, session: null }, error: null });
    await signUp({ name: " Ana ", email: "ana@example.com", password: "secret1" });
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "ana@example.com", password: "secret1",
      options: { data: { name: "Ana" }, emailRedirectTo: origin + "/" },
    });
  });

  it("reports needsConfirmation when no session comes back", async () => {
    supabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u1" }, session: null }, error: null });
    expect(await signUp({ name: "Ana", email: "a@b.co", password: "secret1" })).toEqual({ ok: true, needsConfirmation: true });
    supabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u1" }, session: { access_token: "t" } }, error: null });
    expect(await signUp({ name: "Ana", email: "a@b.co", password: "secret1" })).toEqual({ ok: true, needsConfirmation: false });
  });

  it("never inserts into profiles", async () => {
    supabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u1" }, session: null }, error: null });
    await signUp({ name: "Ana", email: "a@b.co", password: "secret1" });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("returns a friendly error and never rejects", async () => {
    supabase.auth.signUp.mockResolvedValue({ data: {}, error: { message: "User already registered", status: 422 } });
    expect(await signUp({ name: "Ana", email: "a@b.co", password: "secret1" })).toEqual({ ok: false, error: "An account with this email already exists. Sign in instead." });
    supabase.auth.signUp.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await signUp({ name: "Ana", email: "a@b.co", password: "secret1" })).toEqual({ ok: false, error: "Can't reach Verbum. Check your connection and try again." });
  });
});

describe("other actions", () => {
  it("signIn maps bad credentials", async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: { message: "Invalid login credentials", status: 400 } });
    expect(await signIn({ email: "a@b.co", password: "x" })).toEqual({ ok: false, error: "That email and password don't match. Try again or reset your password." });
  });

  it("sendMagicLink never creates accounts and returns to the app", async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({ data: {}, error: null });
    expect(await sendMagicLink("a@b.co")).toEqual({ ok: true });
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({ email: "a@b.co", options: { emailRedirectTo: origin + "/", shouldCreateUser: false } });
  });

  it("sendPasswordReset returns to the reset screen", async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    expect(await sendPasswordReset("a@b.co")).toEqual({ ok: true });
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("a@b.co", { redirectTo: origin + "/reset-password" });
  });

  it("updatePassword updates the user", async () => {
    supabase.auth.updateUser.mockResolvedValue({ data: {}, error: null });
    expect(await updatePassword("newsecret")).toEqual({ ok: true });
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "newsecret" });
  });
});

describe("friendlyAuthError", () => {
  it("maps each known case", () => {
    const m = (message, status) => friendlyAuthError({ message, status });
    expect(m("Invalid login credentials", 400)).toBe("That email and password don't match. Try again or reset your password.");
    expect(m("Email not confirmed", 400)).toBe("Please confirm your email first. Check your inbox for the link.");
    expect(m("User already registered", 422)).toBe("An account with this email already exists. Sign in instead.");
    expect(m("Signups not allowed for otp", 422)).toBe("No account uses this email yet. Create one first.");
    expect(m("User not found", 404)).toBe("No account uses this email yet. Create one first.");
    expect(m("anything", 429)).toBe("Too many attempts. Wait a minute and try again.");
    expect(m("Email rate limit exceeded", 400)).toBe("Too many attempts. Wait a minute and try again.");
    expect(m("Failed to fetch")).toBe("Can't reach Verbum. Check your connection and try again.");
    expect(friendlyAuthError(new TypeError("NetworkError when attempting to fetch resource."))).toBe("Can't reach Verbum. Check your connection and try again.");
    expect(m("Password should be at least 6 characters", 422)).toBe("Password should be at least 6 characters");
    expect(friendlyAuthError(null)).toBe("Something went wrong. Please try again.");
  });
});

describe("readAuthError", () => {
  it("reads an expired-link hash", () => {
    expect(readAuthError("#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired")).toBe("This link has expired. Request a new one.");
    expect(readAuthError("#error=server_error&error_description=Something+odd")).toBe("Something odd");
  });
  it("returns null for a token hash or no hash", () => {
    expect(readAuthError("#access_token=abc&type=recovery")).toBeNull();
    expect(readAuthError("")).toBeNull();
  });
});

describe("isValidEmail", () => {
  it("accepts and rejects", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail(" a@b.co ")).toBe(true);
    for (const bad of ["a@b", "a b@c.d", "@b.co", "a@.co", "", "a@b.co@c.d"]) expect(isValidEmail(bad), bad).toBe(false);
  });
});
