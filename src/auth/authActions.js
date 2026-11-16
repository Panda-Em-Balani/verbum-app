import { supabase } from "../supabase.js";

// Sign-in actions. Each one resolves to { ok: true, ... } or { ok: false, error } and never
// throws, so screens can show the message directly.

const origin = () => window.location.origin;

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(String(email || "").trim());
}

// Turns a Supabase error into a sentence a person can act on.
export function friendlyAuthError(error) {
  if (!error) return "Something went wrong. Please try again.";
  const message = String(error.message || "");
  const text = message.toLowerCase();
  const status = error.status;
  if (text.includes("invalid login credentials")) return "That email and password don't match. Try again or reset your password.";
  if (text.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link.";
  if (text.includes("user already registered")) return "An account with this email already exists. Sign in instead.";
  if (text.includes("signups not allowed for otp") || text.includes("user not found")) return "No account uses this email yet. Create one first.";
  if (status === 429 || text.includes("rate limit")) return "Too many attempts. Wait a minute and try again.";
  if (error instanceof TypeError || status === 0 || text.includes("failed to fetch") || text.includes("networkerror")) return "Can't reach Verbum. Check your connection and try again.";
  return message || "Something went wrong. Please try again.";
}

// Sign-in links that fail come back as "#error=...&error_code=...&error_description=...".
export function readAuthError(hash) {
  const params = new URLSearchParams(String(hash || "").replace(/^#/, ""));
  if (!params.has("error") && !params.has("error_code")) return null;
  if (params.get("error_code") === "otp_expired") return "This link has expired. Request a new one.";
  return params.get("error_description") || "That link didn't work. Request a new one.";
}

async function run(call, onSuccess = () => ({})) {
  try {
    const { data, error } = await call();
    if (error) return { ok: false, error: friendlyAuthError(error) };
    return { ok: true, ...onSuccess(data) };
  } catch (e) {
    return { ok: false, error: friendlyAuthError(e) };
  }
}

// The name travels with the account; the profile row is created at first sign-in (see
// useAuth.js), which also works when the email must be confirmed first.
export function signUp({ name, email, password }) {
  return run(
    () => supabase.auth.signUp({ email, password, options: { data: { name: String(name || "").trim() }, emailRedirectTo: origin() + "/" } }),
    (data) => ({ needsConfirmation: !data?.session }),
  );
}

export function signIn({ email, password }) {
  return run(() => supabase.auth.signInWithPassword({ email, password }));
}

export function sendMagicLink(email) {
  return run(() => supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: origin() + "/", shouldCreateUser: false } }));
}

export function sendPasswordReset(email) {
  return run(() => supabase.auth.resetPasswordForEmail(email, { redirectTo: origin() + "/reset-password" }));
}

export function updatePassword(password) {
  return run(() => supabase.auth.updateUser({ password }));
}

export function signInWithGoogle() {
  return run(() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: origin() + "/" } }));
}
