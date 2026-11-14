import { useState } from "react";
import AuthShell from "./AuthShell.jsx";
import { field, fieldLabel, labelHint } from "./authStyles.js";
import { updatePassword } from "../../auth/authActions.js";
import { markRecovered } from "../../auth/useAuth.js";
import { navigate } from "../../router.js";
import { DANGER } from "../../theme.js";
import { primaryButton, secondaryButton, disabledButton } from "../../styles/buttons.js";
import { cardTitle, body } from "../../styles/text.js";

// Opened from a password-reset email. `recovering` is true while that link's session is
// active; otherwise the link was already used or has expired.
export default function ResetPasswordScreen({ recovering }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!recovering) {
    return (
      <AuthShell>
        <h2 style={{ ...cardTitle, fontSize: 19, marginBottom: 10, textAlign: "center" }}>This link can't be used</h2>
        <p style={{ ...body, textAlign: "center", marginBottom: 20 }}>This reset link has expired or was already used. Ask for a new one from the sign-in screen.</p>
        <button type="button" onClick={() => navigate("/", { replace: true })} style={secondaryButton}>Back to sign in</button>
      </AuthShell>
    );
  }

  const submit = async () => {
    if (saving) return;
    if (password.length < 6) { setError("Your password needs at least 6 characters."); return; }
    if (password !== confirm) { setError("The passwords don't match."); return; }
    setError("");
    setSaving(true);
    const result = await updatePassword(password);
    setSaving(false);
    if (!result.ok) { setError(result.error); return; }
    markRecovered();
    navigate("/", { replace: true });
  };

  return (
    <AuthShell>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
        <h2 style={{ ...cardTitle, fontSize: 19, marginBottom: 16, textAlign: "center" }}>Choose a new password</h2>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="v-new-password" style={fieldLabel}>New password<span style={labelHint}> (at least 6 characters)</span></label>
          <input id="v-new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} style={field} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="v-confirm-password" style={fieldLabel}>Type it again</label>
          <input id="v-confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={field} />
        </div>
        {error && <div role="alert" style={{ fontSize: 14, color: DANGER, marginBottom: 12, lineHeight: 1.5 }}>{error}</div>}
        <button type="submit" disabled={saving} style={{ ...primaryButton, marginTop: 8, ...(saving ? disabledButton : null) }}>{saving ? "Saving…" : "Save new password"}</button>
      </form>
    </AuthShell>
  );
}
