import { SURFACE, BORDER, MUTED, FONT_UI } from "../theme.js";

// Small read-only tag (themes, patronages).
const Pill = ({ label }) => (
  <span style={{ display: "inline-block", fontFamily: FONT_UI, fontSize: 13, color: MUTED, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 10px", textTransform: "capitalize" }}>{label}</span>
);

export default Pill;
