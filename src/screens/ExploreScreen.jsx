import { useState } from "react";
import { BookIco, HeartIco } from "../components/Icons.jsx";
import Pill from "../components/Pill.jsx";
import VerseCard from "../components/VerseCard.jsx";
import { CATEGORIES } from "../content/categories.js";
import { GOLD, GOLD_TEXT, SURFACE, CARD, BORDER, CREAM, MUTED, WHITE, CINZEL, R, EMBOSS, CARD_SHADOW_STRONG } from "../theme.js";
import { VERSES, DAILY_VERSES } from "../verses.js";

function BibleSearchView() {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.lg, padding: 32, textAlign: "center", boxShadow: CARD_SHADOW_STRONG }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${GOLD}15`, border: `1.5px solid ${GOLD}50`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <BookIco on={true} />
      </div>
      <div style={{ fontFamily: CINZEL, fontSize: 20, color: WHITE, fontWeight: 700, letterSpacing: "0.08em", textShadow: EMBOSS, marginBottom: 8 }}>Bible Search</div>
      <div style={{ fontSize: 13, color: GOLD_TEXT, fontFamily: CINZEL, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18, fontWeight: 600 }}>Coming in Premium</div>
      <p style={{ fontSize: 15, color: CREAM, lineHeight: 1.85, fontFamily: "'Lato',sans-serif", fontWeight: 500, marginBottom: 20 }}>
        Full Bible Search across all 73 books of the Catholic Bible, with verse text, Catholic reflection, and Catechism connection, is being prepared for Verbum Premium.
      </p>
      <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.78, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>
        In the meantime, browse the verse library below or explore the Prayers tab for Scripture embedded in our prayer guides.
      </p>
    </div>
  );
}

export default function ExploreTab({favorites,onFav}) {
  const [view,setView]=useState("browse"); const [selectedCat,setSelectedCat]=useState(null); const [expandedId,setExpandedId]=useState(null);
  const filtered=selectedCat?VERSES.filter(v=>v.category.includes(selectedCat)):VERSES;
  // Combine VERSES favorites (by ID) and DAILY_VERSES favorites (by ref)
  const favVerses=VERSES.filter(v=>favorites.has(v.id));
  const favDailyVerses=DAILY_VERSES.filter(v=>favorites.has(v.ref)).map(v=>({...v,id:v.ref,category:v.category||[]}));
  const allFavVerses=[...favVerses,...favDailyVerses];
  return (
    <div style={{padding:"0 20px 20px"}}>
      <div style={{padding:"24px 0 16px",marginTop:"calc(56px + env(safe-area-inset-top))"}}><div style={{fontFamily:CINZEL,fontSize:22,color:WHITE,marginBottom:4,letterSpacing:"0.07em",fontWeight:600,textShadow:EMBOSS}}>{view==="browse"?"Verse Library":view==="search"?"Bible Search":"My Favorites"}</div><div style={{fontSize:15,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500}}>{view==="browse"?"Browse by theme or feeling":view==="search"?"All 73 books of the Catholic Bible":"Your personal collection"}</div></div>
      <div style={{display:"flex",background:SURFACE,borderRadius:R.sm,padding:3,marginBottom:18,border:`1px solid ${BORDER}`,gap:2}}>
        {[{id:"browse",label:"Browse"},{id:"search",label:"Bible"},{id:"favorites",label:`Saved${allFavVerses.length?" ("+allFavVerses.length+")":""}`}].map(t=><button key={t.id} onClick={()=>{setView(t.id);setExpandedId(null);}} style={{flex:1,background:view===t.id?CARD:"none",border:view===t.id?`1px solid ${GOLD}40`:"1px solid transparent",borderRadius:10,padding:"12px 0",color:view===t.id?GOLD_TEXT:MUTED,fontSize:14,cursor:"pointer",fontFamily:"'Lato',sans-serif",transition:"all 0.2s"}}>{t.label}</button>)}
      </div>
      {view==="browse"&&(<><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}><button onClick={()=>setSelectedCat(null)} style={{background:!selectedCat?GOLD:CARD,border:`1px solid ${!selectedCat?GOLD:BORDER}`,borderRadius:R.lg,padding:"11px 16px",color:!selectedCat?"#1A1000":MUTED,fontSize:13,cursor:"pointer",fontFamily:"'Lato',sans-serif",fontWeight:!selectedCat?700:400}}>All</button>{CATEGORIES.map(c=>{const on=selectedCat===c.id;return<button key={c.id} onClick={()=>setSelectedCat(on?null:c.id)} style={{background:on?GOLD:CARD,border:`1px solid ${on?GOLD:BORDER}`,borderRadius:R.lg,padding:"11px 14px",color:on?"#1A1000":MUTED,fontSize:13,cursor:"pointer",fontFamily:"'Lato',sans-serif",fontWeight:on?700:400}}>{c.sym} {c.label}</button>;})}</div><div style={{display:"flex",flexDirection:"column",gap:12}}>{filtered.map(v=><VerseCard key={v.id} verse={v} expanded={expandedId===v.id} onToggle={()=>setExpandedId(expandedId===v.id?null:v.id)} isFav={favorites.has(v.id)} onFav={onFav}/>)}</div></>)}
      {view==="search"&&<BibleSearchView favorites={favorites} onFav={onFav}/>}
      {view==="favorites"&&(allFavVerses.length===0?<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{marginBottom:14,opacity:0.4,display:"flex",justifyContent:"center"}}><HeartIco filled/></div><div style={{fontFamily:CINZEL,fontSize:16,color:MUTED,letterSpacing:"0.07em",marginBottom:8,textShadow:EMBOSS}}>No favorites yet</div><p style={{fontSize:15,color:MUTED,lineHeight:1.7,fontFamily:"'Lato',sans-serif"}}>Tap the heart on any verse to save it here.</p></div>:<div style={{display:"flex",flexDirection:"column",gap:12}}>{allFavVerses.map(v=><div key={v.id} style={{background:CARD,border:`1px solid ${GOLD}30`,borderRadius:R.md,overflow:"hidden"}}><div onClick={()=>setExpandedId(expandedId===v.id?null:v.id)} style={{padding:"18px 18px 0",cursor:"pointer"}}><div style={{fontFamily:CINZEL,fontSize:16,color:CREAM,lineHeight:1.88,marginBottom:10,textShadow:EMBOSS}}>"{v.text}"</div><div style={{fontFamily:CINZEL,fontSize:13,color:GOLD_TEXT,fontWeight:700,letterSpacing:"0.16em",marginBottom:14}}>— {v.ref}</div></div>{expandedId===v.id&&<div style={{padding:"0 18px",marginBottom:14}}><p style={{fontSize:15,color:CREAM,lineHeight:1.82,marginBottom:12,fontFamily:"'Lato',sans-serif"}}>{v.explanation}</p><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{v.category.map(c=><Pill key={c} label={c}/>)}</div></div>}<div style={{borderTop:`1px solid ${BORDER}`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:13,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500}}>Saved</div><button onClick={()=>onFav(v.id)} style={{background:"none",border:`1px solid #C08080`,borderRadius:8,padding:"10px 14px",color:"#8A4848",fontSize:14,cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>Remove</button></div></div>)}</div>)}
    </div>
  );
}
