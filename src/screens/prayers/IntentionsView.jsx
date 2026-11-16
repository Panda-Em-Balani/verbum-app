import { useState } from "react";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { ChevIco } from "../../components/Icons.jsx";
import { useProgress, addIntention, toggleIntentionAnswered, deleteIntention, INTENTION_MAX } from "../../progress.js";
import { goBack } from "../../router.js";
import { SURFACE, BORDER, TEXT, MUTED, SUCCESS, DANGER, FONT_UI, R } from "../../theme.js";
import { backLink, primaryButton, disabledButton } from "../../styles/buttons.js";
import { card, eyebrow, body, secondary, screenTitle } from "../../styles/text.js";

const shortDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");
const rowButton = { minHeight: 44, padding: "0 4px", background: "none", border: "none", cursor: "pointer", fontFamily: FONT_UI, fontSize: 14, fontWeight: 700 };

// A private list of what the person is praying for.
export default function IntentionsView() {
  const intentions = useProgress().intentions;
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(null);
  const ready = text.trim().length > 0;
  const list = [...intentions].map(([id, v]) => ({ id, ...v })).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  const add = () => {
    if (!ready) return;
    if (addIntention(text.trim())) setText("");
  };

  return (
    <div>
      <button type="button" onClick={() => goBack("/prayers")} style={backLink}><ChevIco dir="left" /> Back to Prayers</button>
      <h1 style={{ ...screenTitle, margin: "0 0 4px" }}>My Intentions</h1>
      <p style={{ ...secondary, marginBottom: 18 }}>Write down what you are praying for. Only you can see these.</p>

      <form onSubmit={(e) => { e.preventDefault(); add(); }} style={{ ...card, marginBottom: 18 }}>
        <label htmlFor="v-intention" style={{ ...eyebrow, display: "block", marginBottom: 8 }}>New intention</label>
        <textarea id="v-intention" value={text} onChange={(e) => setText(e.target.value)} maxLength={INTENTION_MAX} rows={3} placeholder="For example: for my mother's health" style={{ display: "block", width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: R.sm, padding: "12px 14px", color: TEXT, lineHeight: 1.5, resize: "vertical" }} />
        <div style={{ ...secondary, fontSize: 13, textAlign: "right", margin: "6px 0 12px" }}>{text.length}/{INTENTION_MAX}</div>
        <button type="submit" disabled={!ready} style={{ ...primaryButton, ...(ready ? null : disabledButton) }}>Add intention</button>
      </form>

      {list.length > 0 && (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {list.map((item) => (
            <li key={item.id} style={{ ...card, padding: "16px 18px 8px" }}>
              <p style={{ ...body, whiteSpace: "pre-wrap", overflowWrap: "anywhere", ...(item.answeredAt ? { color: MUTED } : null) }}>{item.text}</p>
              <div style={{ ...secondary, fontSize: 13, marginTop: 6 }}>
                Added {shortDate(item.createdAt)}{item.answeredAt ? ` · Answered ${shortDate(item.answeredAt)}` : ""}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <button type="button" aria-pressed={!!item.answeredAt} onClick={() => toggleIntentionAnswered(item.id)} style={{ ...rowButton, color: SUCCESS }}>{item.answeredAt ? "✓ Answered" : "Mark answered"}</button>
                <button type="button" onClick={() => setDeleting(item.id)} style={{ ...rowButton, color: DANGER }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this intention?"
        confirmLabel="Delete"
        destructive
        onConfirm={() => { deleteIntention(deleting); setDeleting(null); }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
