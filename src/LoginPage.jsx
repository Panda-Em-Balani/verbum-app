// ─── VERBUM LOGIN PAGE ───────────────────────────────────────────────────────
// Simple invite-code gate for the church community test rollout.
// Users enter their name, email, and the community access code.
// Data is stored in localStorage — no backend required for this phase.
//
// TO CHANGE THE ACCESS CODE: update ACCESS_CODE below and share the new code
// with your community. Old sessions will still be valid until localStorage is cleared.

const ACCESS_CODE = "VERBUM2025"; // ← Change this to whatever you share with your community

const GOLD = "#9A6B1F";
const GOLD_BRIGHT = "#7A5218";
const DARK = "#EDE4D0";
const SURFACE = "#E4D9C4";
const CARD = "#FDFAF4";
const BORDER = "#C8BAA0";
const CREAM = "#3D2A10";
const MUTED = "#7A6A54";
const WHITE = "#1E1208";
const CINZEL = "'Cinzel', serif";
const EMBOSS = "0 1px 0 rgba(255,255,255,0.8), 0 -1px 0 rgba(0,0,0,0.08)";

import { useState } from "react";

export function saveUser(name, email) {
  localStorage.setItem("verbum_user", JSON.stringify({ name, email, loginAt: Date.now() }));
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("verbum_user") || "null");
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem("verbum_user");
}

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (code.trim().toUpperCase() !== ACCESS_CODE) {
      setError("Incorrect access code. Please contact your parish administrator.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      saveUser(name.trim(), email.trim().toLowerCase());
      onLogin({ name: name.trim(), email: email.trim().toLowerCase() });
    }, 600);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #EDE5D6 0%, #F5EFE4 50%, #E8DFC8 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 24px 40px",
      fontFamily: "'Lato', -apple-system, sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Lato:wght@300;400;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <img
          src="/verbum-logo-clean.png"
          alt="Verbum — The Word"
          style={{ width: 120, height: 120, borderRadius: 24, marginBottom: 16, boxShadow: "0 4px 24px rgba(154,107,31,0.18)" }}
        />
        <div style={{ fontFamily: CINZEL, fontSize: 26, color: WHITE, fontWeight: 600, letterSpacing: "0.12em", textShadow: EMBOSS, marginBottom: 4 }}>
          VERBUM
        </div>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: CINZEL }}>
          The Word
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 24,
        padding: "28px 24px",
        width: "100%",
        maxWidth: 380,
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative top line */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 120, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

        <div style={{ fontFamily: CINZEL, fontSize: 15, color: WHITE, fontWeight: 600, letterSpacing: "0.08em", textShadow: EMBOSS, marginBottom: 4 }}>
          Welcome
        </div>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.7, marginBottom: 22 }}>
          Enter your details and your community access code to continue.
        </p>

        {/* Name */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: GOLD, fontFamily: CINZEL, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Your Name</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Maria Santos"
            style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: WHITE, outline: "none", fontFamily: "'Lato', sans-serif" }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: GOLD, fontFamily: CINZEL, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Email Address</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: WHITE, outline: "none", fontFamily: "'Lato', sans-serif" }}
          />
        </div>

        {/* Access Code */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: GOLD, fontFamily: CINZEL, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Access Code</div>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="Enter code from your parish"
            style={{ width: "100%", background: SURFACE, border: `1px solid ${error ? "#D04040" : BORDER}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: WHITE, outline: "none", fontFamily: "'Lato', sans-serif", letterSpacing: "0.08em" }}
          />
          {error && (
            <div style={{ fontSize: 11, color: "#C05050", marginTop: 6, fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>{error}</div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? SURFACE : `linear-gradient(135deg, ${GOLD}, #B8923C)`,
            border: "none",
            borderRadius: 14,
            padding: "13px",
            color: loading ? MUTED : "#FFFFFF",
            fontSize: 13,
            fontFamily: CINZEL,
            fontWeight: 600,
            letterSpacing: "0.1em",
            cursor: loading ? "default" : "pointer",
            boxShadow: loading ? "none" : `0 4px 20px ${GOLD}30`,
            transition: "all 0.2s",
          }}
        >
          {loading ? "Entering..." : "Enter Verbum ✝"}
        </button>
      </div>

      {/* Footer */}
      <p style={{ fontSize: 11, color: MUTED, textAlign: "center", marginTop: 20, lineHeight: 1.7 }}>
        Don't have an access code?<br />
        Contact your parish administrator to receive one.
      </p>
    </div>
  );
}
