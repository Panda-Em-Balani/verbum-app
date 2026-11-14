import { SURFACE, BORDER, GOLD_TEXT, FONT_UI, R } from "../theme.js";

const Pill=({label})=><span style={{fontSize:13,background:SURFACE,color:GOLD_TEXT,padding:"3px 10px",borderRadius:R.lg,letterSpacing:"0.04em",fontFamily:FONT_UI,display:"inline-block",border:`1px solid ${BORDER}`}}>{label}</span>;

export default Pill;
