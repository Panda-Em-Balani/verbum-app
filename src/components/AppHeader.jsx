import { useState } from "react";
import { StarIco, UserIco } from "./Icons.jsx";
import { GOLD, GOLD_TEXT, CARD, BORDER, CREAM, WHITE, CINZEL, R, EMBOSS, CARD_SHADOW_STRONG, HEADER_SHADOW, HEADER_BG, HEADER_H } from "../theme.js";

export default function AppHeader({ tab, user, onSignOut }) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const firstName = user?.name?.split(' ')[0] || '';
  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: HEADER_BG, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 16, paddingTop: 'env(safe-area-inset-top)', minHeight: HEADER_H, boxShadow: HEADER_SHADOW }}>
        <div style={{ width: 105 }}>
          {tab === 'home' && (
            <button onClick={() => setShowPremiumModal(true)} aria-label="Verbum Premium" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 22, padding: '0 12px', minHeight: 44, cursor: 'pointer' }}>
              <StarIco />
              <span style={{ fontSize: 13, color: '#F5E6C8', fontFamily: CINZEL, letterSpacing: '0.07em', fontWeight: 600 }}>Premium</span>
            </button>
          )}
        </div>
        <div style={{ fontFamily: CINZEL, fontSize: 17, color: '#F5E6C8', fontWeight: 600, letterSpacing: '0.2em', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>VERBUM</div>
        <div style={{ width: 105, display: 'flex', justifyContent: 'flex-end' }}>
          {tab === 'home' ? (
            <button onClick={onSignOut} aria-label={firstName ? `Sign out ${firstName}` : 'Sign out'} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 22, padding: '0 12px', minHeight: 44, cursor: 'pointer' }}>
              <UserIco />
              <span style={{ fontSize: 13, color: '#F5E6C8', fontFamily: CINZEL, letterSpacing: '0.06em', fontWeight: 600 }}>{firstName}</span>
            </button>
          ) : (
            <button onClick={onSignOut} aria-label="Sign out" style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 22, padding: '0 14px', minHeight: 44, cursor: 'pointer' }}>
              <span style={{ fontSize: 13, color: '#F5E6C8', fontFamily: CINZEL, letterSpacing: '0.06em', fontWeight: 600 }}>Sign out</span>
            </button>
          )}
        </div>
      </div>
      {showPremiumModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
          <div role="dialog" aria-modal="true" aria-label="Verbum Premium" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.lg, padding: 32, maxWidth: 340, width: '100%', boxShadow: CARD_SHADOW_STRONG, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 100, height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${GOLD}18`, border: `1.5px solid ${GOLD}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><StarIco /></div>
              <div style={{ fontFamily: CINZEL, fontSize: 20, color: WHITE, fontWeight: 700, letterSpacing: '0.08em', textShadow: EMBOSS, marginBottom: 6 }}>Verbum Premium</div>
              <div style={{ fontSize: 13, color: GOLD_TEXT, fontFamily: CINZEL, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Coming Soon</div>
              <p style={{ fontSize: 15, color: CREAM, lineHeight: 1.85, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>Verbum Premium is currently in development. We will keep you updated once it is ready to launch. Thank you for your patience and support.</p>
            </div>
            <button onClick={() => setShowPremiumModal(false)} style={{ width: '100%', background: HEADER_BG, border: 'none', borderRadius: R.sm, padding: '14px', color: '#F5E6C8', fontSize: 15, fontFamily: CINZEL, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
