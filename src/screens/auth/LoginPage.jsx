import { useEffect, useState } from "react";
import AuthShell from "./AuthShell.jsx";
import { field, fieldLabel, labelHint, textLink } from "./authStyles.js";
import { signUp, signIn, sendMagicLink, sendPasswordReset, signInWithGoogle, readAuthError, isValidEmail } from "../../auth/authActions.js";
import { AUTH_PROVIDERS } from "../../config.js";
import { BORDER, MUTED, DANGER, FONT_UI } from "../../theme.js";
import { primaryButton, secondaryButton, disabledButton, segment, segmentGroup } from "../../styles/buttons.js";
import { cardTitle, body } from "../../styles/text.js";

// Sign in, create an account, or ask for a sign-in link. When an action succeeds with a
// session, the auth store moves the app on by itself; this screen only handles the forms.
export default function LoginPage() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "magic"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => readAuthError(window.location.hash) || "");
  const [sentTo, setSentTo] = useState(""); // set after an email was sent
  const [loading, setLoading] = useState(false);

  // A failed sign-in link leaves its error in the address; show it once, then tidy up.
  useEffect(() => {
    if (readAuthError(window.location.hash)) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
  }, []);

  const switchMode = (next) => { setMode(next); setError(""); };
  const cleanEmail = email.trim();

  const run = async (action, { emailSent = false } = {}) => {
    setError("");
    setLoading(true);
    const result = await action();
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    if (emailSent || result.needsConfirmation) setSentTo(cleanEmail);
  };

  const submit = () => {
    if (loading) return;
    if (mode === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    if (!isValidEmail(cleanEmail)) { setError("Please enter a valid email address."); return; }
    if (mode === "signup" && password.length < 6) { setError("Your password needs at least 6 characters."); return; }
    if (mode === "signin" && !password) { setError("Please enter your password."); return; }
    if (mode === "signup") return run(() => signUp({ name: name.trim(), email: cleanEmail, password }));
    if (mode === "magic") return run(() => sendMagicLink(cleanEmail), { emailSent: true });
    return run(() => signIn({ email: cleanEmail, password }));
  };

  const forgotPassword = () => {
    if (loading) return;
    if (!isValidEmail(cleanEmail)) { setError("Enter your email address first, then tap Forgot your password."); return; }
    run(() => sendPasswordReset(cleanEmail), { emailSent: true });
  };

  if (sentTo) {
    return (
      <AuthShell>
        <div role="status">
          <h2 style={{ ...cardTitle, fontSize: 19, marginBottom: 10, textAlign: "center" }}>Check your email</h2>
          <p style={{ ...body, textAlign: "center", marginBottom: 20, overflowWrap: "anywhere" }}>We sent a link to {sentTo}. Open it on this device to continue.</p>
        </div>
        <button type="button" onClick={() => { setSentTo(""); setPassword(""); switchMode("signin"); }} style={secondaryButton}>Back to sign in</button>
      </AuthShell>
    );
  }

  const submitLabel = mode === "signup" ? "Create account" : mode === "magic" ? "Send sign-in link" : "Sign in";

  return (
    <AuthShell>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
        <div style={{ ...segmentGroup, marginBottom: 22 }}>
          <button type="button" aria-pressed={mode !== "signup"} onClick={() => switchMode("signin")} style={segment(mode !== "signup")}>Sign in</button>
          <button type="button" aria-pressed={mode === "signup"} onClick={() => switchMode("signup")} style={segment(mode === "signup")}>Create account</button>
        </div>

        {AUTH_PROVIDERS.google && (
          <>
            <button type="button" onClick={() => run(signInWithGoogle)} style={secondaryButton}>Continue with Google</button>
            <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0", color: MUTED, fontFamily: FONT_UI, fontSize: 13 }}>
              <span style={{ flex: 1, height: 1, background: BORDER }} />or<span style={{ flex: 1, height: 1, background: BORDER }} />
            </div>
          </>
        )}

        {mode === "signup" && (
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="v-name" style={fieldLabel}>Your name</label>
            <input id="v-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maria Santos" maxLength={80} style={field} />
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="v-email" style={fieldLabel}>Email address</label>
          <input id="v-email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={field} />
        </div>

        {mode !== "magic" && (
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="v-password" style={fieldLabel}>Password{mode === "signup" && <span style={labelHint}> (at least 6 characters)</span>}</label>
            <input id="v-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} style={field} />
          </div>
        )}
        {mode === "magic" && <p style={{ ...body, fontSize: 15, color: MUTED, marginBottom: 12 }}>We'll email you a link that signs you in. No password needed.</p>}

        {error && <div role="alert" style={{ fontSize: 14, color: DANGER, marginBottom: 12, lineHeight: 1.5 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ ...primaryButton, marginTop: 8, ...(loading ? disabledButton : null) }}>{loading ? "Please wait…" : submitLabel}</button>

        {mode === "signin" && (
          <>
            <button type="button" onClick={forgotPassword} style={textLink}>Forgot your password?</button>
            <button type="button" onClick={() => switchMode("magic")} style={{ ...textLink, marginTop: 0 }}>Email me a sign-in link instead</button>
          </>
        )}
        {mode === "magic" && <button type="button" onClick={() => switchMode("signin")} style={textLink}>Use a password instead</button>}
      </form>
    </AuthShell>
  );
}
