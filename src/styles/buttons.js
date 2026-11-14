import { GOLD, GOLD_DEEP, GOLD_TEXT, ON_GOLD, CARD, SURFACE, BORDER, TEXT, MUTED, DANGER, FONT_DISPLAY, FONT_UI, R } from "../theme.js";

// Shared button styles. Spread and override where a screen needs a variation.

const base = { display: "block", width: "100%", textAlign: "center", textDecoration: "none", cursor: "pointer", borderRadius: R.sm };

export const primaryButton = {
  ...base, minHeight: 48, padding: "13px 16px", background: GOLD, color: ON_GOLD, border: "none",
  fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, letterSpacing: "0.06em",
};

export const secondaryButton = {
  ...base, minHeight: 44, padding: "11px 16px", background: "none", color: TEXT, border: `1px solid ${BORDER}`,
  fontFamily: FONT_UI, fontWeight: 700, fontSize: 15,
};

export const dangerButton = { ...primaryButton, background: DANGER, color: "#FFFFFF" };

export const disabledButton = { background: SURFACE, color: MUTED, cursor: "default" };

// Small outlined pill (Share buttons).
export const pillButton = {
  display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, padding: "0 14px", background: "none",
  border: `1px solid ${GOLD_DEEP}`, borderRadius: 22, cursor: "pointer", color: GOLD_TEXT,
  fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
};

// Filter chip (themes, feelings).
export const chip = (on) => ({
  minHeight: 44, padding: "0 16px", borderRadius: 22, cursor: "pointer", fontFamily: FONT_UI, fontSize: 14,
  background: on ? GOLD : CARD, border: `1px solid ${on ? GOLD : BORDER}`,
  color: on ? ON_GOLD : MUTED, fontWeight: on ? 700 : 400,
});

// Two- or three-way switch.
export const segmentGroup = { display: "flex", gap: 2, background: SURFACE, borderRadius: R.sm, padding: 3, border: `1px solid ${BORDER}` };

export const segment = (on) => ({
  flex: 1, minHeight: 44, padding: "0 8px", borderRadius: 10, cursor: "pointer", fontFamily: FONT_UI, fontSize: 15,
  background: on ? CARD : "none", border: `1px solid ${on ? GOLD_DEEP : "transparent"}`,
  color: on ? GOLD_TEXT : MUTED, fontWeight: on ? 700 : 400,
});

// Text-only back link at the top of a sub-screen.
export const backLink = {
  display: "flex", alignItems: "center", gap: 6, minHeight: 44, padding: 0, marginBottom: 12, background: "none",
  border: "none", cursor: "pointer", color: MUTED, fontFamily: FONT_UI, fontSize: 15,
};
