import { useState } from "react"
import { supabase } from "./supabase.js"

const GOLD = "#9A6B1F"
const DARK = "#F5EFE4"
const SURFACE = "#EDE5D6"
const CARD = "#FFFFFF"
const BORDER = "#D9CEBC"
const CREAM = "#5A3E1B"
const MUTED = "#A0907A"
const WHITE = "#2E1F0E"
const CINZEL = "'Cinzel', serif"
const EMBOSS = "0 1px 0 rgba(255,255,255,0.8), 0 -1px 0 rgba(0,0,0,0.08)"

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("signin") // "signin" | "signup"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setError("")
    if (!name.trim()) { setError("Please enter your name."); return }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }

    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Save name to profiles table
    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, name: name.trim() })
    }

    setLoading(false)
    onLogin({ name: name.trim(), email })
  }

  const handleSignIn = async () => {
    setError("")
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return }
    if (!password) { setError("Please enter your password."); return }

    setLoading(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Fetch name from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", data.user.id)
      .single()

    setLoading(false)
    onLogin({ name: profile?.name || email.split("@")[0], email })
  }

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Enter your email address first, then click Forgot Password.")
      return
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
    if (resetError) { setError(resetError.message); return }
    setError("")
    alert("Password reset email sent. Check your inbox.")
  }

  const isSignUp = mode === "signup"

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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Lato:wght@300;400;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0} input{font-family:'Lato',sans-serif}`}</style>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <img
          src="/verbum-logo-clean.png"
          alt="Verbum"
          style={{ width: 110, height: 110, borderRadius: 24, marginBottom: 16, boxShadow: "0 4px 24px rgba(154,107,31,0.18)" }}
        />
        <div style={{ fontFamily: CINZEL, fontSize: 26, color: WHITE, fontWeight: 600, letterSpacing: "0.12em", textShadow: EMBOSS, marginBottom: 4 }}>VERBUM</div>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: CINZEL }}>The Word</div>
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
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 120, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

        {/* Mode toggle */}
        <div style={{ display: "flex", background: SURFACE, borderRadius: 12, padding: 3, marginBottom: 22, border: `1px solid ${BORDER}` }}>
          {[{ id: "signin", label: "Sign In" }, { id: "signup", label: "Create Account" }].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setError("") }} style={{ flex: 1, background: mode === m.id ? CARD : "none", border: mode === m.id ? `1px solid ${GOLD}40` : "1px solid transparent", borderRadius: 10, padding: "8px 0", color: mode === m.id ? GOLD : MUTED, fontSize: 11, cursor: "pointer", fontFamily: CINZEL, letterSpacing: "0.06em", transition: "all 0.2s" }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Name — only on signup */}
        {isSignUp && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: GOLD, fontFamily: CINZEL, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Your Name</div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Maria Santos"
              style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: WHITE, outline: "none" }}
            />
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: GOLD, fontFamily: CINZEL, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Email Address</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: WHITE, outline: "none" }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: GOLD, fontFamily: CINZEL, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Password {isSignUp && <span style={{ color: MUTED, textTransform: "none", fontFamily: "'Lato',sans-serif", letterSpacing: 0 }}>(min. 6 characters)</span>}</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") isSignUp ? handleSignUp() : handleSignIn() }}
            placeholder="••••••••"
            style={{ width: "100%", background: SURFACE, border: `1px solid ${error ? "#D04040" : BORDER}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: WHITE, outline: "none" }}
          />
          {error && <div style={{ fontSize: 11, color: "#C05050", marginTop: 6, lineHeight: 1.5 }}>{error}</div>}
        </div>

        {/* Submit */}
        <button
          onClick={isSignUp ? handleSignUp : handleSignIn}
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
            marginBottom: 12,
          }}
        >
          {loading ? "Please wait..." : isSignUp ? "Create Account ✝" : "Sign In ✝"}
        </button>

        {/* Forgot password — only on sign in */}
        {!isSignUp && (
          <button onClick={handleForgotPassword} style={{ width: "100%", background: "none", border: "none", color: MUTED, fontSize: 11, cursor: "pointer", fontFamily: "'Lato',sans-serif", textAlign: "center", padding: "4px 0" }}>
            Forgot your password?
          </button>
        )}
      </div>

      <p style={{ fontSize: 11, color: MUTED, textAlign: "center", marginTop: 20, lineHeight: 1.7 }}>
        A Catholic companion for daily prayer and Scripture.
      </p>
    </div>
  )
}
