import { useState } from "react";
import { supabase } from "../../supabase.js";
import { SURFACE, BORDER, TEXT, MUTED, GOLD_TEXT, DANGER, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW_STRONG } from "../../theme.js";
import { primaryButton, disabledButton, segment, segmentGroup } from "../../styles/buttons.js";
import { card, eyebrow, secondary } from "../../styles/text.js";

const field = { width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: R.sm, padding: "13px 14px", fontSize: 16, color: TEXT };
const fieldLabel = { ...eyebrow, display: "block", marginBottom: 6 };

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError(""); setNotice("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    // Save name to profiles table
    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, name: name.trim() });
    }
    setLoading(false);
    onLogin({ name: name.trim(), email });
  };

  const handleSignIn = async () => {
    setError(""); setNotice("");
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    // Fetch name from profiles
    const { data: profile } = await supabase.from("profiles").select("name").eq("id", data.user.id).single();
    setLoading(false);
    onLogin({ name: profile?.name || email.split("@")[0], email });
  };

  const handleForgotPassword = async () => {
    setNotice("");
    if (!email.trim() || !email.includes("@")) {
      setError("Enter your email address first, then tap Forgot your password.");
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) { setError(resetError.message); return; }
    setError("");
    setNotice(`We sent a reset link to ${email}.`);
  };

  const isSignUp = mode === "signup";
  const submit = isSignUp ? handleSignUp : handleSignIn;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #EDE5D6 0%, #F6F1E7 50%, #E8DFC8 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 24px 40px", fontFamily: FONT_UI }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <picture>
          <source srcSet="/verbum-logo-256.webp" type="image/webp" />
          <img src="/verbum-logo-256.png" alt="" width="110" height="110" style={{ borderRadius: R.lg, marginBottom: 16, boxShadow: "0 4px 24px rgba(122,90,6,0.18)" }} />
        </picture>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: TEXT, fontWeight: 600, letterSpacing: "0.12em", marginBottom: 4 }}>VERBUM</h1>
        <div style={{ ...eyebrow, fontSize: 13, letterSpacing: "0.22em", fontWeight: 600 }}>The Word</div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate style={{ ...card, borderRadius: R.lg, padding: "28px 24px", width: "100%", maxWidth: 380, boxShadow: CARD_SHADOW_STRONG }}>
        <div style={{ ...segmentGroup, marginBottom: 22 }}>
          {[{ id: "signin", label: "Sign in" }, { id: "signup", label: "Create account" }].map((m) => (
            <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => { setMode(m.id); setError(""); setNotice(""); }} style={segment(mode === m.id)}>{m.label}</button>
          ))}
        </div>

        {isSignUp && (
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="v-name" style={fieldLabel}>Your name</label>
            <input id="v-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maria Santos" style={field} />
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="v-email" style={fieldLabel}>Email address</label>
          <input id="v-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={field} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="v-password" style={fieldLabel}>Password{isSignUp && <span style={{ fontFamily: FONT_UI, fontWeight: 400, letterSpacing: 0, textTransform: "none", color: MUTED }}> (at least 6 characters)</span>}</label>
          <input id="v-password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...field, borderColor: error ? DANGER : BORDER }} />
          {error && <div role="alert" style={{ fontSize: 14, color: DANGER, marginTop: 8, lineHeight: 1.5 }}>{error}</div>}
          {notice && <div role="status" style={{ fontSize: 14, color: GOLD_TEXT, marginTop: 8, lineHeight: 1.5 }}>{notice}</div>}
        </div>

        <button type="submit" disabled={loading} style={{ ...primaryButton, ...(loading ? disabledButton : null) }}>
          {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </button>

        {!isSignUp && (
          <button type="button" onClick={handleForgotPassword} style={{ width: "100%", minHeight: 44, marginTop: 8, background: "none", border: "none", color: MUTED, fontSize: 15, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Forgot your password?
          </button>
        )}
      </form>

      <p style={{ ...secondary, fontSize: 14, textAlign: "center", marginTop: 20 }}>A Catholic companion for daily prayer and Scripture.</p>
    </div>
  );
}
