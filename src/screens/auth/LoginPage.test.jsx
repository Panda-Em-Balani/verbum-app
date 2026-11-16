// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

vi.mock("../../auth/authActions.js", async () => {
  const actual = await vi.importActual("../../auth/authActions.js");
  return {
    ...actual,
    signUp: vi.fn(), signIn: vi.fn(), sendMagicLink: vi.fn(), sendPasswordReset: vi.fn(), signInWithGoogle: vi.fn(),
  };
});
vi.mock("../../supabase.js", () => ({ supabase: {}, openedFromRecoveryLink: false }));

import * as actions from "../../auth/authActions.js";
import LoginPage from "./LoginPage.jsx";

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => { vi.clearAllMocks(); history.replaceState(null, "", "/"); });
afterEach(cleanup);

describe("LoginPage", () => {
  it("sign-up needing confirmation shows Check your email", async () => {
    actions.signUp.mockResolvedValue({ ok: true, needsConfirmation: true });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    type(/your name/i, "Ana");
    type(/email address/i, "ana@example.com");
    type(/password/i, "secret1");
    fireEvent.click(screen.getAllByRole("button", { name: "Create account" }).find((b) => b.type === "submit"));
    await screen.findByText("Check your email");
    expect(screen.getByText(/ana@example\.com/)).toBeTruthy();
    expect(actions.signUp).toHaveBeenCalledWith({ name: "Ana", email: "ana@example.com", password: "secret1" });
  });

  it("invalid email shows an error and calls nothing", async () => {
    render(<LoginPage />);
    type(/email address/i, "not-an-email");
    type(/password/i, "secret1");
    fireEvent.click(screen.getAllByRole("button", { name: "Sign in" }).find((b) => b.type === "submit"));
    expect((await screen.findByRole("alert")).textContent).toBe("Please enter a valid email address.");
    expect(actions.signIn).not.toHaveBeenCalled();
  });

  it("a failed sign-in shows the friendly error", async () => {
    actions.signIn.mockResolvedValue({ ok: false, error: "That email and password don't match. Try again or reset your password." });
    render(<LoginPage />);
    type(/email address/i, "ana@example.com");
    type(/password/i, "wrong");
    fireEvent.click(screen.getAllByRole("button", { name: "Sign in" }).find((b) => b.type === "submit"));
    expect((await screen.findByRole("alert")).textContent).toMatch(/don't match/);
  });

  it("magic link mode sends a link and shows Check your email", async () => {
    actions.sendMagicLink.mockResolvedValue({ ok: true });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Email me a sign-in link instead" }));
    expect(screen.queryByLabelText(/password/i)).toBeNull();
    type(/email address/i, "ana@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Send sign-in link" }));
    await screen.findByText("Check your email");
    expect(actions.sendMagicLink).toHaveBeenCalledWith("ana@example.com");
  });

  it("forgot password sends a reset link", async () => {
    actions.sendPasswordReset.mockResolvedValue({ ok: true });
    render(<LoginPage />);
    type(/email address/i, "ana@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Forgot your password?" }));
    await screen.findByText("Check your email");
    expect(actions.sendPasswordReset).toHaveBeenCalledWith("ana@example.com");
  });

  it("Google button is hidden while the flag is off", () => {
    render(<LoginPage />);
    expect(screen.queryByRole("button", { name: /google/i })).toBeNull();
  });

  it("an expired-link hash shows the expired message and is removed from the address", async () => {
    history.replaceState(null, "", "/#error=access_denied&error_code=otp_expired&error_description=expired");
    render(<LoginPage />);
    expect((await screen.findByRole("alert")).textContent).toBe("This link has expired. Request a new one.");
    await waitFor(() => expect(location.hash).toBe(""));
  });
});
