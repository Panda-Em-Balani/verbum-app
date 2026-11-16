import { GOLD, GOLD_TEXT, SURFACE, CARD, BORDER, TEXT, TEXT_BODY, MUTED, FONT_DISPLAY, FONT_SCRIPTURE, FONT_UI, R, CARD_SHADOW, CARD_SHADOW_STRONG } from "../theme.js";

// Shared text and block styles.
// Display (Cinzel): titles, labels, verse references. Scripture (EB Garamond): verses and
// prayers, in sentence case. UI (Lato): everything else.

export const eyebrow = { fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_TEXT };
export const screenTitle = { fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, letterSpacing: "0.07em", color: TEXT, marginBottom: 4 };
export const screenSub = { fontFamily: FONT_UI, fontSize: 15, color: MUTED };
export const cardTitle = { fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, letterSpacing: "0.05em", lineHeight: 1.35, color: TEXT };
export const verseRef = { fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD_TEXT };

export const body = { fontFamily: FONT_UI, fontSize: 16, lineHeight: 1.65, color: TEXT_BODY, margin: 0 };
export const secondary = { fontFamily: FONT_UI, fontSize: 15, lineHeight: 1.6, color: MUTED, margin: 0 };

export const scripture = (size = 19) => ({ fontFamily: FONT_SCRIPTURE, fontWeight: 500, fontSize: size, lineHeight: size >= 21 ? 1.5 : 1.55, color: TEXT });
export const prayerText = { fontFamily: FONT_SCRIPTURE, fontWeight: 500, fontSize: 18, lineHeight: 1.7, color: TEXT_BODY, whiteSpace: "pre-line" };

// Blocks
export const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.md, padding: 20, boxShadow: CARD_SHADOW };
export const goldCard = { background: "linear-gradient(135deg,#FFFCF5,#FFF3D6)", border: `1px solid ${GOLD}`, borderRadius: R.md, padding: 20, boxShadow: CARD_SHADOW_STRONG };
export const noteBlock = { background: SURFACE, borderLeft: `3px solid ${GOLD}`, borderRadius: "0 12px 12px 0", padding: "12px 14px" };

// Screen layout: content sits below the fixed header.
export const screenWrap = { padding: "0 20px 20px" };
export const screenHeader = { padding: "24px 0 16px", marginTop: "calc(56px + env(safe-area-inset-top))" };
export const subScreenTop = { paddingTop: "calc(56px + env(safe-area-inset-top) + 12px)" };
