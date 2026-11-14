import { useState, useEffect } from "react";
import { ChevIco } from "../../components/Icons.jsx";
import { PRAYERS } from "../../content/prayers.js";
import { isThreeOClockHour } from "../../liturgy/legacy.js";
import NovenaView from "./NovenaView.jsx";
import RosaryView from "./RosaryView.jsx";
import ThreeOClockView from "./ThreeOClockView.jsx";
import { SURFACE, CARD, BORDER, TEXT, TEXT_BODY, MUTED, GOLD, GOLD_TEXT, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW, CARD_SHADOW_STRONG } from "../../theme.js";

export default function PrayersTab() {
  const [deep]=useState(()=>localStorage.getItem("verbum_deep_section"));
  const [section,setSection]=useState(deep==="rosary"?"rosary":"prayers"); const [subSection,setSubSection]=useState(deep==="three-oclock"||deep==="novenas"?deep:null);
  useEffect(()=>{ localStorage.removeItem("verbum_deep_section"); },[]); const [expandedPrayer,setExpandedPrayer]=useState(null);
  if (subSection==="novenas") return <div style={{padding:"0 20px 20px"}}><NovenaView onBack={()=>setSubSection(null)}/></div>;
  if (subSection==="three-oclock") return <div style={{padding:"0 20px 20px"}}><ThreeOClockView onBack={()=>setSubSection(null)}/></div>;
  return (
    <div style={{padding:"0 20px 20px"}}>
      <div style={{padding:"24px 0 16px",marginTop:"calc(56px + env(safe-area-inset-top))"}}><div style={{fontFamily:FONT_DISPLAY,fontSize:22,color:TEXT,marginBottom:4,letterSpacing:"0.07em",fontWeight:600}}>{section==="prayers"?"Catholic Prayers":"The Holy Rosary"}</div><div style={{fontSize:15,color:MUTED,fontFamily:FONT_UI,fontWeight:500}}>{section==="prayers"?"Traditional prayers of the faith":"A decade-by-decade guide"}</div></div>
      <div style={{display:"flex",background:SURFACE,borderRadius:R.sm,padding:3,marginBottom:18,border:`1px solid ${BORDER}`}}>
        {[{id:"prayers",label:"Prayers"},{id:"rosary",label:"Rosary"}].map(t=><button key={t.id} onClick={()=>setSection(t.id)} style={{flex:1,background:section===t.id?CARD:"none",border:section===t.id?`1px solid ${GOLD}40`:"1px solid transparent",borderRadius:10,padding:"12px 0",color:section===t.id?GOLD_TEXT:MUTED,fontSize:15,cursor:"pointer",fontFamily:FONT_UI,transition:"all 0.2s"}}>{t.label}</button>)}
      </div>
      {section==="prayers"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%"}}>
          <button onClick={()=>setSubSection("three-oclock")} style={{background:"#F5EEF8",border:"1px solid #9B59C0",borderRadius:R.md,padding:18,cursor:"pointer",textAlign:"left",width:"100%"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:36,height:36,borderRadius:"50%",background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>🕒</div><div><div style={{fontFamily:FONT_DISPLAY,fontSize:17,color:"#4A2070",fontWeight:600,letterSpacing:"0.06em",marginBottom:2}}>Three O'Clock Prayer</div><div style={{fontSize:13,color:"#7040A0",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:FONT_DISPLAY}}>Hour of Mercy · Divine Mercy Chaplet</div></div></div><ChevIco/></div>{isThreeOClockHour()&&<div style={{marginTop:10,background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.25)",borderRadius:8,padding:"6px 12px",display:"inline-block"}}><span style={{fontSize:13,color:"#7040A0",fontFamily:FONT_DISPLAY}}>It is the Hour of Mercy now</span></div>}</button>
          <button onClick={()=>setSubSection("novenas")} style={{background:"#F0EAF8",border:`1px solid #8060C0`,borderRadius:R.md,padding:18,cursor:"pointer",textAlign:"left",width:"100%"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:36,height:36,borderRadius:"50%",background:"rgba(100,60,180,0.12)",border:"1px solid rgba(100,60,180,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>📿</div><div><div style={{fontFamily:FONT_DISPLAY,fontSize:17,color:"#3A1860",fontWeight:600,letterSpacing:"0.06em",marginBottom:2}}>Novenas</div><div style={{fontSize:13,color:"#6040A0",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:FONT_DISPLAY}}>Nine Days of Prayer · 4 Novenas</div></div></div><ChevIco/></div></button>
          {PRAYERS.map((p,i)=><div key={i} onClick={()=>setExpandedPrayer(expandedPrayer===i?null:i)} style={{background:CARD,border:`1px solid ${expandedPrayer===i?GOLD+"88":BORDER}`,borderRadius:R.md,padding:20,cursor:"pointer",boxShadow:expandedPrayer===i?CARD_SHADOW_STRONG:CARD_SHADOW,transition:"all 0.2s"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontFamily:FONT_DISPLAY,fontSize:18,color:TEXT,marginBottom:4,letterSpacing:"0.06em",fontWeight:600}}>{p.t}</div><div style={{fontSize:13,color:GOLD_TEXT,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:FONT_DISPLAY}}>{p.s}</div></div><span style={{color:MUTED,fontSize:15}}>{expandedPrayer===i?"\u2212":"+"}</span></div>{expandedPrayer===i&&<div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${BORDER}`}}><div style={{fontFamily:FONT_DISPLAY,fontSize:14,color:TEXT_BODY,lineHeight:2.1,marginBottom:14,letterSpacing:"0.04em",whiteSpace:"pre-line"}}>{p.text}</div><div style={{background:SURFACE,borderLeft:`3px solid ${GOLD}`,borderRadius:"0 12px 12px 0",padding:"10px 14px"}}><div style={{fontSize:12,color:GOLD_TEXT,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:FONT_DISPLAY,marginBottom:5}}>Note & CCC</div><p style={{fontSize:14,color:MUTED,lineHeight:1.75,fontFamily:FONT_UI}}>{p.note}</p></div></div>}</div>)}
        </div>
      )}
      {section==="rosary"&&<RosaryView/>}
    </div>
  );
}
