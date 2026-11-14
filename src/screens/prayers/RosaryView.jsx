import { useState, useEffect, useRef } from "react";
import { ChevIco } from "../../components/Icons.jsx";
import { ROSARY } from "../../content/rosary.js";
import { saveRosary, getSnapshot } from "../../progress.js";
import { SURFACE, CARD, BORDER, TEXT, TEXT_BODY, MUTED, GOLD, GOLD_DEEP, GOLD_TEXT, FONT_DISPLAY, FONT_UI, R } from "../../theme.js";

// The rosary guide: mystery picker, decade meditation and bead counter.
export default function RosaryView() {
  const [saved]=useState(()=>getSnapshot().rosary); const [mysteryType,setMysteryType]=useState(saved?.mystery||"Joyful"); const [decade,setDecade]=useState(saved?.decade||0); const [beads,setBeads]=useState(saved?.beads||0);
  // Remember the rosary in progress (cleared when finished or reset).
  const rosaryReady=useRef(false);
  const pending=useRef(null);
  useEffect(()=>{
    if(!rosaryReady.current){rosaryReady.current=true;return;}
    const done=decade===4&&beads===10; const fresh=decade===0&&beads===0;
    const value=done||fresh?null:{mystery:mysteryType,decade,beads};
    pending.current={value};
    const t=setTimeout(()=>{pending.current=null;saveRosary(value);},700);
    return()=>clearTimeout(t);
  },[mysteryType,decade,beads]);
  // Leaving the screen before the delay ends still saves the latest position.
  useEffect(()=>()=>{ if(pending.current){ saveRosary(pending.current.value); pending.current=null; } },[]);
  const myst=ROSARY[mysteryType]; const curDecade=myst.decades[decade]; const MYSTERY_TYPES=["Joyful","Sorrowful","Glorious","Luminous"];
  return (
      <>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>{MYSTERY_TYPES.map(t=>{const m=ROSARY[t];const on=mysteryType===t;return<button key={t} onClick={()=>{setMysteryType(t);setDecade(0);setBeads(0);}} style={{background:on?m.color:CARD,border:`1px solid ${on?m.border:BORDER}`,borderRadius:R.sm,padding:"13px 12px",cursor:"pointer",transition:"all 0.2s",textAlign:"left"}}><div style={{fontFamily:FONT_DISPLAY,fontSize:15,color:on?TEXT:MUTED,fontWeight:on?600:400,letterSpacing:"0.05em",marginBottom:2}}>{t}</div><div style={{fontSize:12,color:MUTED,fontFamily:FONT_UI}}>{m.day}</div></button>;})}
        </div>
        <div style={{background:myst.color,border:`1px solid ${myst.border}`,borderRadius:R.lg,padding:22,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:12,color:MUTED,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:FONT_DISPLAY}}>Decade {decade+1} of 5</div><div style={{display:"flex"}}>{myst.decades.map((_,i)=><button type="button" key={i} aria-label={`Decade ${i+1}`} aria-current={i===decade?"step":undefined} onClick={()=>{setDecade(i);setBeads(0);}} style={{width:24,height:44,margin:"-19px 0",background:"none",border:"none",padding:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><span style={{width:8,height:8,borderRadius:"50%",background:i===decade?GOLD_DEEP:BORDER,display:"block"}}/></button>)}</div></div>
          <div style={{fontFamily:FONT_DISPLAY,fontSize:18,color:TEXT,fontWeight:600,letterSpacing:"0.06em",marginBottom:4}}>{curDecade.name}</div>
          <div style={{fontSize:13,color:GOLD_TEXT,marginBottom:14,fontFamily:FONT_DISPLAY,letterSpacing:"0.12em",fontWeight:700}}>{curDecade.ref}</div>
          <p style={{fontSize:15,color:TEXT_BODY,lineHeight:1.85,fontFamily:FONT_UI}}>{curDecade.med}</p>
        </div>
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:R.md,padding:18,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:13,color:MUTED,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:FONT_DISPLAY}}>Hail Mary</div><div style={{fontFamily:FONT_DISPLAY,fontSize:15,color:beads===10?GOLD_TEXT:MUTED,fontWeight:600}}>{beads}/10</div></div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center",padding:"7px 0",marginBottom:beads===10?12:0}}>{Array.from({length:10},(_,i)=><button type="button" key={i} aria-label={`Hail Mary ${i+1}`} aria-pressed={i<beads} onClick={()=>setBeads(beads===i+1?i:i+1)} style={{width:44,height:44,margin:-7,padding:0,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{width:30,height:30,borderRadius:"50%",background:i<beads?GOLD:SURFACE,border:`1.5px solid ${i<beads?GOLD_DEEP:BORDER}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",fontSize:12,color:i<beads?"#3B1E08":MUTED,fontWeight:700,fontFamily:FONT_DISPLAY}}>{i+1}</span></button>)}</div>
          {beads===10&&<div style={{textAlign:"center",paddingTop:4}}><div style={{fontSize:14,color:GOLD_TEXT,fontFamily:FONT_DISPLAY,letterSpacing:"0.08em"}}>Glory be to the Father, and to the Son, and to the Holy Spirit.</div></div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{if(decade>0){setDecade(decade-1);setBeads(0);}}} disabled={decade===0} style={{flex:1,background:CARD,border:`1px solid ${decade===0?BORDER:GOLD+"40"}`,borderRadius:R.sm,padding:"12px 0",minHeight:44,cursor:decade===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:decade===0?.35:1}}><ChevIco dir="left"/><span style={{fontSize:15,color:MUTED,fontFamily:FONT_UI,fontWeight:500}}>Previous</span></button>
          <button onClick={()=>{if(decade<4){setDecade(decade+1);setBeads(0);}}} disabled={decade===4} style={{flex:1,background:decade===4?CARD:SURFACE,border:`1px solid ${decade===4?BORDER:GOLD+"55"}`,borderRadius:R.sm,padding:"12px 0",minHeight:44,cursor:decade===4?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:decade===4?.35:1}}><span style={{fontSize:15,color:decade===4?MUTED:GOLD_TEXT,fontFamily:FONT_UI}}>{decade===4?"Complete":"Next Decade"}</span>{decade<4&&<ChevIco/>}</button>
        </div>
        {decade===4&&beads===10&&<div style={{background:"#E8F5EA",border:`1px solid #4A9A5A50`,borderRadius:R.md,padding:20,marginTop:14,textAlign:"center"}}><div style={{fontFamily:FONT_DISPLAY,fontSize:17,color:TEXT,fontWeight:600,letterSpacing:"0.08em",marginBottom:8}}>Mystery Complete</div><p style={{fontSize:15,color:"#2A7A30",lineHeight:1.75,fontFamily:FONT_UI}}>You have completed the {mysteryType} Mysteries. May Our Lady carry your intentions before the throne of God. Amen.</p></div>}
      </>
  );
}
