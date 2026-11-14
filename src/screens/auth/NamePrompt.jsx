import { useState } from "react";
import { Cross } from "../../components/Icons.jsx";
import { setProfileName } from "../../auth/useAuth.js";
import { GOLD_DEEP, PAGE_BG, SURFACE, BORDER, TEXT, DANGER, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW_STRONG } from "../../theme.js";
import { primaryButton, disabledButton } from "../../styles/buttons.js";
import { card, cardTitle, secondary } from "../../styles/text.js";

// Shown once after the first sign-in when we have no name for the greeting.
export default function NamePrompt({ email }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ready = name.trim().length > 0;
  const handleSave = async () => {
    if (!ready || saving) return;
    setError("");
    setSaving(true);
    const result = await setProfileName(name);
    // On success the auth store moves the app on and this screen goes away.
    if (!result.ok) { setSaving(false); setError(result.error); }
  };
  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT_UI }}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <Cross size={36} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: TEXT, fontWeight: 700, letterSpacing: "0.1em", margin: "20px 0 6px" }}>Welcome to Verbum</h1>
        <p style={{ ...secondary, marginBottom: 28 }}>One more thing before we begin.</p>
        <div style={{ ...card, borderRadius: R.lg, padding: 28, boxShadow: CARD_SHADOW_STRONG }}>
          <label htmlFor="v-first-name" style={{ ...cardTitle, fontSize: 18, display: "block", marginBottom: 6 }}>What should we call you?</label>
          <p style={{ ...secondary, fontSize: 14, marginBottom: 20 }}>This is how Verbum will greet you.</p>
          <input
            id="v-first-name"
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            placeholder="Your first name"
            maxLength={80}
            autoFocus
            style={{ width: "100%", background: SURFACE, border: `1.5px solid ${ready ? GOLD_DEEP : BORDER}`, borderRadius: R.sm, padding: "14px 18px", fontSize: 17, color: TEXT, fontFamily: FONT_UI, textAlign: "center" }}
          />
          {error && <div role="alert" style={{ fontSize: 14, color: DANGER, marginTop: 12, lineHeight: 1.5 }}>{error}</div>}
          <button type="button" onClick={handleSave} disabled={!ready || saving} style={{ ...primaryButton, marginTop: 16, ...(ready ? null : disabledButton) }}>
            {saving ? "Saving…" : "Continue"}
          </button>
        </div>
        <p style={{ ...secondary, fontSize: 13, marginTop: 16, overflowWrap: "anywhere" }}>Signed in as {email}</p>
      </div>
    </div>
  );
}
