import { SURFACE, BORDER, TEXT, MUTED, FONT_UI, R } from "../../theme.js";
import { eyebrow } from "../../styles/text.js";

export const field = { width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: R.sm, padding: "13px 14px", fontSize: 16, color: TEXT };
export const fieldLabel = { ...eyebrow, display: "block", marginBottom: 6 };
export const labelHint = { fontFamily: FONT_UI, fontWeight: 400, letterSpacing: 0, textTransform: "none", color: MUTED };
export const textLink = { width: "100%", minHeight: 44, marginTop: 6, background: "none", border: "none", color: MUTED, fontSize: 15, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 };
