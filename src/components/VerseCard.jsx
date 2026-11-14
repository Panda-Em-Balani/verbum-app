import VerseShareButton from "../VerseShareButton.jsx";
import { HeartIco } from "./Icons.jsx";
import Pill from "./Pill.jsx";
import { SURFACE, CARD, BORDER, TEXT, TEXT_BODY, MUTED, GOLD, GOLD_TEXT, FONT_DISPLAY, R, CARD_SHADOW, CARD_SHADOW_STRONG } from "../theme.js";

export default function VerseCard({verse,expanded,onToggle,isFav,onFav}) {
  return (
    <div onClick={onToggle} style={{background:CARD,border:`1px solid ${expanded?GOLD+"88":BORDER}`,borderRadius:R.md,padding:20,cursor:"pointer",transition:"all 0.2s",boxShadow:expanded?CARD_SHADOW_STRONG:CARD_SHADOW}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:FONT_DISPLAY,fontSize:17,color:TEXT,lineHeight:1.9,marginBottom:12,letterSpacing:"0.04em",fontWeight:600}}>"{verse.text}"</div>
          <div style={{fontSize:14,color:GOLD_TEXT,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:FONT_DISPLAY}}>{verse.ref}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,flexShrink:0}}>
          <span aria-hidden="true" style={{fontSize:14,color:MUTED}}>{expanded?"\u2212":"+"}</span>
          <button onClick={e=>{e.stopPropagation();onFav(verse.id);}} type="button" aria-pressed={isFav} aria-label={isFav?"Remove verse from saved":"Save verse"} style={{background:"none",border:"none",padding:0,margin:-13,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><HeartIco filled={isFav}/></button>
        </div>
      </div>
      {expanded&&(
        <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${BORDER}`}}>
          <p style={{fontSize:16,color:TEXT_BODY,lineHeight:1.85,marginBottom:14}}>{verse.explanation}</p>
          {verse.example&&(
            <div style={{background:SURFACE,borderLeft:`3px solid ${GOLD}`,borderRadius:"0 12px 12px 0",padding:"12px 14px",marginBottom:12}}>
              <div style={{fontSize:13,color:GOLD_TEXT,fontWeight:700,letterSpacing:"0.14em",marginBottom:6,textTransform:"uppercase",fontFamily:FONT_DISPLAY}}>In Practice</div>
              <p style={{fontSize:15,color:MUTED,lineHeight:1.78}}>{verse.example}</p>
            </div>
          )}
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{verse.category.map(c=><Pill key={c} label={c}/>)}</div>
          <div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap"}}><VerseShareButton text={verse.text} verseRef={verse.ref} source="verse"/></div>
        </div>
      )}
    </div>
  );
}
