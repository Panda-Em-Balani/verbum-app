// Colours for the liturgical colour of the day: the header, an accent for borders, and a
// pale tint for the Today card. "white" days (Christmas, Easter, feasts) keep Verbum's own
// brown and gold. Contrast is checked in seasonTheme.test.js.
const THEMES = {
  green: { header: "#2F5D3A", accent: "#3E7A4C", tint: "#EAF3EC" },
  purple: { header: "#4B2E6B", accent: "#6A4A92", tint: "#F0EAF6" },
  rose: { header: "#8C3F63", accent: "#A8577B", tint: "#F8EAF1" },
  red: { header: "#8E2A2A", accent: "#A83B3B", tint: "#F8EAEA" },
  white: { header: "#8B4513", accent: "#B8860B", tint: "#FFF6E0" },
};

export function seasonTheme(color) {
  return THEMES[color] || THEMES.white;
}
