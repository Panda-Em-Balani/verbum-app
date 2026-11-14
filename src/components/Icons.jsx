import { GOLD, GOLD_DEEP, MUTED } from "../theme.js";

// Line icons, 1.5px stroke. Decorative: buttons that use them carry their own labels.
const NAV_OFF = MUTED;
const nav = (on) => (on ? GOLD_DEEP : NAV_OFF);

export const Cross = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="8.5" y="2" width="3" height="16" rx="1" fill={GOLD} />
    <rect x="2" y="7.5" width="16" height="3" rx="1" fill={GOLD} />
  </svg>
);
export const HomeIco = ({ on }) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 2L3 9v11h5v-6h6v6h5V9L11 2z" stroke={nav(on)} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
export const ChatIco = ({ on }) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M3 5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H8l-5 4V5z" stroke={nav(on)} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
export const BookIco = ({ on }) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M4 4a2 2 0 012-2h10a2 2 0 012 2v14l-7-3-7 3V4z" stroke={nav(on)} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
export const PrayIco = ({ on }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" stroke={nav(on)} strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" /><circle cx="11" cy="11" r="3" />
    <line x1="11" y1="3" x2="11" y2="8" /><line x1="11" y1="14" x2="11" y2="19" /><line x1="3" y1="11" x2="8" y2="11" /><line x1="14" y1="11" x2="19" y2="11" />
  </svg>
);
export const MassIco = ({ on }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <rect x="2" y="5" width="18" height="13" rx="2" stroke={nav(on)} strokeWidth="1.5" />
    <path d="M9 9l5 2.5L9 14V9z" fill={nav(on)} />
    <line x1="7" y1="2" x2="7" y2="5" stroke={nav(on)} strokeWidth="1.5" strokeLinecap="round" /><line x1="15" y1="2" x2="15" y2="5" stroke={nav(on)} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
export const HeartIco = ({ filled }) => <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 15S2 10.5 2 5.5A3.5 3.5 0 019 3.7 3.5 3.5 0 0116 5.5C16 10.5 9 15 9 15z" stroke={filled ? GOLD_DEEP : MUTED} strokeWidth="1.5" fill={filled ? GOLD : "none"} /></svg>;
export const ChevIco = ({ dir = "right" }) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, transform: dir === "left" ? "rotate(180deg)" : dir === "down" ? "rotate(90deg)" : dir === "up" ? "rotate(-90deg)" : "none" }}><path d="M5 3l4 4-4 4" stroke={GOLD_DEEP} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
export const BellIco = ({ size = 22 }) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true" stroke={GOLD_DEEP} strokeWidth="1.5"><path d="M9 2a5 5 0 00-5 5v4l-1.5 2h13L14 11V7a5 5 0 00-5-5z" /><path d="M7 15a2 2 0 004 0" /></svg>;
export const CalendarIco = () => <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true" stroke={GOLD_DEEP} strokeWidth="1.5"><rect x="2" y="3" width="14" height="13" rx="2" /><line x1="2" y1="7" x2="16" y2="7" /><line x1="6" y1="1" x2="6" y2="5" strokeLinecap="round" /><line x1="12" y1="1" x2="12" y2="5" strokeLinecap="round" /></svg>;
export const UserIco = ({ color = "currentColor" }) => <svg width="16" height="16" viewBox="0 0 15 15" fill="none" aria-hidden="true" stroke={color} strokeWidth="1.3"><circle cx="7.5" cy="5" r="3" /><path d="M2 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" /></svg>;
export const ClockIco = ({ color = GOLD_DEEP }) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" stroke={color} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="M11 6.5V11h4" strokeLinejoin="round" /></svg>;
export const BeadsIco = ({ color = GOLD_DEEP }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="11" cy="8.5" r="6" strokeDasharray="0.1 3.05" strokeWidth="2.6" />
    <line x1="11" y1="14.5" x2="11" y2="20" /><line x1="8.8" y1="17" x2="13.2" y2="17" />
  </svg>
);
export const BroadcastIco = ({ color = GOLD_DEEP }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="1.6" fill={color} stroke="none" />
    <path d="M7.5 7.5a5 5 0 000 7M14.5 7.5a5 5 0 010 7M4.8 4.8a8.8 8.8 0 000 12.4M17.2 4.8a8.8 8.8 0 010 12.4" />
  </svg>
);
