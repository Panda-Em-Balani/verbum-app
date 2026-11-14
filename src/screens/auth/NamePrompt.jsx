import { useState } from "react";
import { Cross } from "../../components/Icons.jsx";
import { supabase } from "../../supabase.js";
import { GOLD, GOLD_BRIGHT, DARK, SURFACE, CARD, BORDER, MUTED, WHITE, CINZEL, R, EMBOSS, CARD_SHADOW_STRONG } from "../../theme.js";

export default function NamePrompt({ email, onComplete }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({ id: user.id, name: trimmed }, { onConflict: "id" });
      }
    } catch (e) { console.warn("[Verbum] Profile save error:", e.message); }
    onComplete(trimmed);
  };
  return (
    <div style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Lato',-apple-system,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#F5F5F5}input::placeholder{color:#A09080}input{font-size:16px !important}`}</style>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <Cross size={36} />
        <div style={{ fontFamily: CINZEL, fontSize: 24, color: WHITE, fontWeight: 700, letterSpacing: "0.12em", marginTop: 20, marginBottom: 6, textShadow: EMBOSS }}>Welcome to Verbum</div>
        <p style={{ fontSize: 15, color: MUTED, marginBottom: 32, lineHeight: 1.7 }}>One more thing before we begin.</p>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.lg, padding: 28, boxShadow: CARD_SHADOW_STRONG }}>
          <div style={{ fontFamily: CINZEL, fontSize: 18, color: WHITE, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 6, textShadow: EMBOSS }}>What should we call you?</div>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>This is how Verbum will greet you.</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            placeholder="Your first name"
            autoFocus
            style={{ width: "100%", background: SURFACE, border: `1.5px solid ${name.trim() ? GOLD : BORDER}`, borderRadius: R.sm, padding: "14px 18px", fontSize: 17, color: WHITE, fontFamily: CINZEL, fontWeight: 600, letterSpacing: "0.05em", outline: "none", textAlign: "center", transition: "border-color 0.2s" }}
          />
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            style={{ width: "100%", marginTop: 16, background: name.trim() ? `linear-gradient(135deg,${GOLD},${GOLD_BRIGHT})` : SURFACE, border: "none", borderRadius: R.sm, padding: "14px", color: name.trim() ? "#FFFFFF" : MUTED, fontSize: 16, fontFamily: CINZEL, fontWeight: 600, letterSpacing: "0.08em", cursor: name.trim() ? "pointer" : "default", transition: "all 0.2s" }}
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
        <p style={{ fontSize: 12, color: MUTED, marginTop: 16, opacity: 0.7 }}>Signed in as {email}</p>
      </div>
    </div>
  );
}
