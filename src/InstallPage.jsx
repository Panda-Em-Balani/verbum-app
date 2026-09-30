import { useEffect, useState } from "react";
import qrcode from "qrcode-generator";
import { SITE_URL, INSTALL_PATH } from "./config.js";
import { detectPlatform, isAndroid, isIPad } from "./device.js";
import { copyText } from "./share.js";
import { track } from "./analytics.js";

const GOLD = "#DAA520";
const GOLD_BRIGHT = "#B8860B";
const GOLD_TEXT = "#8A6508";
const CARD = "#FFFFFF";
const BORDER = "#C0C0C0";
const TEXT = "#3B1E08";
const CREAM = "#5D3A1A";
const MUTED = "#75603F";
const CINZEL = "'Cinzel', serif";
const LATO = "'Lato',sans-serif";

const primaryBtn = { display: "block", width: "100%", textAlign: "center", textDecoration: "none", background: `linear-gradient(135deg,${GOLD},${GOLD_BRIGHT})`, border: "none", borderRadius: 16, padding: "16px", color: "#FFFFFF", fontSize: 17, fontFamily: CINZEL, fontWeight: 700, letterSpacing: "0.07em", cursor: "pointer" };
const secondaryBtn = { display: "block", width: "100%", textAlign: "center", textDecoration: "none", background: "none", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "13px", color: MUTED, fontSize: 14, fontFamily: LATO, fontWeight: 700, cursor: "pointer" };

function Step({ n, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${GOLD}22`, border: `1.5px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: CINZEL, fontWeight: 700, color: GOLD_TEXT, flexShrink: 0 }}>{n}</div>
      <div style={{ fontFamily: LATO, fontSize: 16, color: CREAM, fontWeight: 500, lineHeight: 1.5, textAlign: "left", flex: 1 }}>{children}</div>
    </div>
  );
}

function ShareGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-3px" }} aria-label="Share">
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v14" />
    </svg>
  );
}

function QrCode({ url }) {
  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  const svg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  return <div style={{ width: 180, height: 180, margin: "0 auto", background: "#fff", padding: 8, borderRadius: 12, border: `1px solid ${BORDER}` }} role="img" aria-label="QR code to install Verbum" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function InstallPage({ verse, installPrompt, onInstall, installed }) {
  const [platform] = useState(detectPlatform);
  const [copied, setCopied] = useState(false);
  const [declined, setDeclined] = useState(false);
  const linkUrl = `${SITE_URL}${INSTALL_PATH}?ref=qr`;
  const kind = installed ? "installed" : platform;

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref") || "direct";
    track("install_page_view", { ref, platform });
  }, [platform]);

  const doInstall = async () => {
    track("install_click", { platform });
    const outcome = await onInstall();
    if (outcome === "dismissed") setDeclined(true);
  };

  const copyLink = async () => {
    if (await copyText(`${SITE_URL}${INSTALL_PATH}?ref=copy`)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const host = SITE_URL.replace(/^https?:\/\//, "");
  const intentUrl = `intent://${host}${INSTALL_PATH}?ref=inapp#Intent;scheme=https;end`;

  return (
    <div style={{ background: "#F5F5F5", minHeight: "100vh", fontFamily: LATO, color: TEXT, display: "flex", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@400;500;700&display=swap');*{box-sizing:border-box}body{margin:0}@keyframes vbounce{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}`}</style>
      <main style={{ width: "100%", maxWidth: 430, padding: "calc(28px + env(safe-area-inset-top)) 20px calc(80px + env(safe-area-inset-bottom))" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <img src="/icon-192.png" alt="Verbum" width="72" height="72" style={{ borderRadius: 18, marginBottom: 12 }} />
          <h1 style={{ margin: 0, fontFamily: CINZEL, fontSize: 26, letterSpacing: "0.2em", color: TEXT }}>VERBUM</h1>
          <p style={{ margin: "6px 0 0", fontSize: 15, color: MUTED, fontWeight: 500 }}>A Catholic companion for daily Scripture and prayer</p>
        </div>

        {verse && (
          <div style={{ background: "linear-gradient(135deg,#FFFCF5,#FFF3D6)", border: `1px solid ${GOLD}60`, borderRadius: 20, padding: 22, marginBottom: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.09)" }}>
            <div style={{ fontSize: 12, color: GOLD_TEXT, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10, fontFamily: CINZEL }}>Today's Verse</div>
            <div style={{ fontFamily: CINZEL, fontSize: 17, lineHeight: 1.9, fontWeight: 600, marginBottom: 10 }}>"{verse.text}"</div>
            <div style={{ fontFamily: CINZEL, fontSize: 13, color: GOLD_TEXT, fontWeight: 700, letterSpacing: "0.14em" }}>— {verse.ref}</div>
          </div>
        )}

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 22, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
          {kind === "installed" && (
            <>
              <h2 style={h2}>Verbum is installed</h2>
              <a href="/" style={primaryBtn}>Open Verbum</a>
            </>
          )}

          {kind === "android" && (
            <>
              <h2 style={h2}>Get Verbum on your phone</h2>
              {installPrompt ? (
                <>
                  <button onClick={doInstall} style={primaryBtn}>Install Verbum</button>
                  <p style={hint}>{declined ? "No problem. Tap the button any time to install." : "Tap Install, then confirm. That's it."}</p>
                </>
              ) : (
                <>
                  <Step n="1">Tap the <b>⋮ menu</b> at the top right of your browser</Step>
                  <Step n="2">Tap <b>Install app</b> or <b>Add to Home screen</b></Step>
                  <Step n="3">Tap <b>Install</b></Step>
                </>
              )}
            </>
          )}

          {kind === "ios" && (
            <>
              <h2 style={h2}>Get Verbum on your iPhone</h2>
              <Step n="1">Tap the Share button <ShareGlyph /> {isIPad() ? "at the top of Safari" : "at the bottom of Safari"}</Step>
              <Step n="2">Scroll and tap <b>Add to Home Screen</b></Step>
              <Step n="3">Tap <b>Add</b> at the top right</Step>
              <p style={hint}>Open Verbum from your Home Screen to turn on daily notifications.</p>
              {!isIPad() && (
                <div aria-hidden="true" style={{ position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "#007AFF", color: "#fff", borderRadius: 20, padding: "8px 18px", fontSize: 14, fontWeight: 700, animation: "vbounce 1.2s infinite", pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>Tap Share below ↓</div>
              )}
            </>
          )}

          {kind === "inapp" && (
            <>
              <h2 style={h2}>Open in your browser to install</h2>
              <p style={{ ...hint, marginTop: 0, marginBottom: 14, textAlign: "left" }}>Apps like Instagram and Facebook can't install Verbum from inside their built-in browser.</p>
              {isAndroid() ? (
                <a href={intentUrl} style={primaryBtn}>Open in Chrome</a>
              ) : (
                <Step n="1">Tap the <b>⋯</b> menu, then <b>Open in Safari</b></Step>
              )}
              <div style={{ height: 10 }} />
              <button onClick={copyLink} style={secondaryBtn}>{copied ? "Link copied!" : "Or copy the link"}</button>
            </>
          )}

          {kind === "desktop" && (
            <>
              <h2 style={h2}>Scan to get Verbum on your phone</h2>
              <QrCode url={linkUrl} />
              <p style={hint}>Point your phone camera at the code, then follow the steps.</p>
              <div style={{ height: 8 }} />
              <button onClick={copyLink} style={secondaryBtn}>{copied ? "Link copied!" : "Copy link"}</button>
              {installPrompt && (
                <>
                  <div style={{ height: 10 }} />
                  <button onClick={doInstall} style={secondaryBtn}>Install on this computer</button>
                </>
              )}
            </>
          )}
        </div>

        {kind !== "installed" && (
          <p style={{ textAlign: "center", marginTop: 22, fontSize: 14, color: MUTED }}>
            Just want a look? <a href="/" style={{ color: GOLD_TEXT, fontWeight: 700 }}>Continue in the browser</a>
          </p>
        )}
      </main>
    </div>
  );
}

const h2 = { margin: "0 0 12px", fontFamily: CINZEL, fontSize: 18, fontWeight: 700, letterSpacing: "0.04em" };
const hint = { margin: "12px 0 0", fontSize: 13, color: MUTED, textAlign: "center", lineHeight: 1.6 };
