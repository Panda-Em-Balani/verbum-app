import { SAINTS } from "../content/saints.js";

export function getSaintOfDay(date = new Date()) {
  const now = date; const m=now.getMonth()+1, d=now.getDate();
  // First: exact feast day match for today
  const exact = SAINTS.find(s=>s.feast.m===m&&s.feast.d===d);
  if (exact) return exact;
  // Second: find the most recent feast day in the past 7 days
  for (let i=1; i<=7; i++) {
    const past = new Date(now); past.setDate(past.getDate()-i);
    const pm=past.getMonth()+1, pd=past.getDate();
    const recent = SAINTS.find(s=>s.feast.m===pm&&s.feast.d===pd);
    if (recent) return recent;
  }
  // Fallback: rotation by day of year
  const day = Math.floor((now.getTime()-new Date(now.getFullYear(),0,0))/86400000);
  return SAINTS[day%SAINTS.length];
}
export function getEaster(y) {
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),dy=((h+l-7*m+114)%31)+1;
  return new Date(y,mo-1,dy);
}
export function getLiturgicalSeason(date = new Date()) {
  const now=date,y=now.getFullYear();
  const easter=getEaster(y);
  const ashWed=new Date(easter); ashWed.setDate(ashWed.getDate()-46);
  const pentecost=new Date(easter); pentecost.setDate(pentecost.getDate()+49);
  const christmas=new Date(y,11,25);
  const advent=new Date(y,11,25); const dow=advent.getDay(); advent.setDate(advent.getDate()-(dow===0?21:dow+21));
  const n=now.getTime();
  if(n>=advent.getTime()&&n<christmas.getTime()) return {name:"Advent",bg:"#F0EAF8",border:"#8A60C0",light:"#6A40A0",desc:"A time of hopeful waiting and preparation for the coming of Christ.",cats:["hope","faith","trust"]};
  if((now.getMonth()===11&&now.getDate()>=25)||(now.getMonth()===0&&now.getDate()<13)) return {name:"Christmas",bg:"#EAF0FA",border:"#5A80C0",light:"#3A60A8",desc:"We celebrate the Incarnation, God becoming man for our salvation.",cats:["love","hope","faith"]};
  if(n>=ashWed.getTime()&&n<easter.getTime()) return {name:"Lent",bg:"#F5F0E8",border:"#9A8058",light:"#7A6040",desc:"Forty days of prayer, fasting, and almsgiving as we journey toward Easter.",cats:["grief","trust","renewal"]};
  if(n>=easter.getTime()&&n<pentecost.getTime()) return {name:"Easter",bg:"#EAF6EC",border:"#4A9A5A",light:"#2E7A3E",desc:"Fifty days of rejoicing in the Resurrection of Our Lord Jesus Christ.",cats:["hope","renewal","faith"]};
  return {name:"Ordinary Time",bg:"#EAF4EE",border:"#5A9A6A",light:"#3A7A4A",desc:"The Church invites us to grow in faith, hope, and love through the teachings of Christ.",cats:["wisdom","trust","love"]};
}
export function isThreeOClockHour(date = new Date()) { return date.getHours() === 15; }

// A season-only liturgical day, computed without calendar data. Used for years the
// generated calendar does not cover.
const FALLBACK = {
  "Advent": { season: "advent", color: "purple" },
  "Christmas": { season: "christmas", color: "white" },
  "Lent": { season: "lent", color: "purple" },
  "Easter": { season: "easter", color: "white" },
  "Ordinary Time": { season: "ordinary", color: "green" },
};
export function fallbackDay(date = new Date()) {
  const name = getLiturgicalSeason(date).name;
  const pad = (n) => String(n).padStart(2, "0");
  const dateKey = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return { dateKey, key: null, name, rank: "FERIA", ...FALLBACK[name], source: "fallback" };
}
