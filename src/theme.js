// Shared design tokens for Verbum. Every text/background pair used in the app is
// contrast-checked in theme.test.js.

// Surfaces
export const PAGE_BG = "#F6F1E7"; // page background (warm parchment)
export const SURFACE = "#EFE6D6"; // sunk areas, segmented controls, note blocks
export const CARD = "#FFFDF8"; // cards, sheets
export const BORDER = "#DCCFB8"; // all 1px borders

// Text
export const TEXT = "#2E1F0E"; // headings, primary text
export const TEXT_BODY = "#4A2F14"; // paragraphs
export const MUTED = "#6E5A3C"; // secondary text, inactive nav

// Gold: GOLD and GOLD_DEEP are for fills, borders and icons only; use GOLD_TEXT for text.
export const GOLD = "#DAA520";
export const GOLD_DEEP = "#B8860B";
export const GOLD_TEXT = "#7A5A06";
export const ON_GOLD = "#2E1F0E"; // text on GOLD fills

// Header
export const HEADER_BG = "#8B4513";
export const HEADER_TEXT = "#F5E6C8";
export const HEADER_H = 56; // fixed header height px

// States
export const SUCCESS = "#2E6B36";
export const SUCCESS_BG = "#EAF6EC";
export const DANGER = "#A33A2A";

// Three O'Clock / Divine Mercy blocks
export const MERCY = { bg: "#F5EEF8", border: "#9B59C0", text: "#4A2070", accent: "#6A3A98" };

// Fonts: display for titles and labels, scripture for verses and prayers, UI for the rest.
export const FONT_DISPLAY = "'Cinzel', Georgia, serif";
export const FONT_SCRIPTURE = "'EB Garamond', Georgia, serif";
export const FONT_UI = "'Lato', system-ui, -apple-system, sans-serif";

// Radii scale: 12 controls and small blocks, 16 cards, 20 hero cards, sheets and modals.
export const R = { sm: 12, md: 16, lg: 20 };

export const CARD_SHADOW = "0 1px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)";
export const CARD_SHADOW_STRONG = "0 4px 16px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.05)";
export const HEADER_SHADOW = "0 2px 20px rgba(0,0,0,0.30)";
export const NAV_SHADOW = "0 -2px 12px rgba(0,0,0,0.07)";
