import { useState } from "react";
import { THREE_OCLOCK_PRAYER } from "../../content/threeOclock.js";
import { MUTED, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW_STRONG } from "../../theme.js";

export default function ThreeOClockBanner() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{background:"linear-gradient(135deg,#F5EEF8,#EDE0F5)",border:`1px solid #9B59C0`,borderRadius:R.md,padding:18,marginBottom:16,position:"relative",overflow:"hidden",boxShadow:CARD_SHADOW_STRONG}}>
      <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"rgba(155,89,192,0.05)"}}/>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:19}}>🕒</span></div>
        <div>
          <div style={{fontFamily:FONT_DISPLAY,fontSize:16,color:"#4A2070",fontWeight:600,letterSpacing:"0.06em"}}>The Three O'Clock Hour</div>
          <div style={{fontSize:13,color:"#7040A0",letterSpacing:"0.14em",fontFamily:FONT_DISPLAY,textTransform:"uppercase"}}>Hour of Mercy</div>
        </div>
      </div>
      <p style={{fontSize:15,color:"#6A4080",lineHeight:1.78,fontFamily:FONT_UI,marginBottom:12}}>This is the Hour of Mercy, the hour of Christ's death on the Cross. Pause for a moment of prayer.</p>
      <div style={{fontFamily:FONT_DISPLAY,fontSize:14,color:"#4A2870",lineHeight:2.0,letterSpacing:"0.04em",marginBottom:12,fontStyle:"italic"}}>"{THREE_OCLOCK_PRAYER.shortPrayer}"</div>
      {!expanded&&<button onClick={()=>setExpanded(true)} style={{background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.3)",borderRadius:10,padding:"8px 14px",color:"#7040A0",fontSize:14,cursor:"pointer",fontFamily:FONT_DISPLAY,letterSpacing:"0.07em"}}>+ Full Chaplet of Mercy</button>}
      {expanded&&(
        <div style={{background:"rgba(155,89,192,0.06)",borderRadius:R.sm,padding:14,marginTop:4,border:"1px solid rgba(155,89,192,0.15)"}}>
          <div style={{fontFamily:FONT_DISPLAY,fontSize:13,color:"#7040A0",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Divine Mercy Chaplet</div>
          <div style={{fontFamily:FONT_DISPLAY,fontSize:14,color:"#4A2870",lineHeight:2.1,letterSpacing:"0.03em",whiteSpace:"pre-line"}}>{THREE_OCLOCK_PRAYER.chaplet}</div>
          <button onClick={()=>setExpanded(false)} style={{marginTop:12,background:"none",border:"none",color:MUTED,fontSize:14,cursor:"pointer",fontFamily:FONT_UI}}> Close</button>
        </div>
      )}
    </div>
  );
}
