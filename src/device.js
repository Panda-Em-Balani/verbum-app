// Device detection for the install guide.

const IN_APP_RE = /Instagram|FBAN|FBAV|FB_IAB|FB4A|MicroMessenger|Line\/|TikTok|musical_ly|Snapchat|Twitter|LinkedInApp/i;

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true
  );
}

export function isIOS(ua = navigator.userAgent) {
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    // iPadOS reports as a Mac but has touch
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  );
}

export function isIPad(ua = navigator.userAgent) {
  return /iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

export function isAndroid(ua = navigator.userAgent) {
  return /Android/i.test(ua);
}

export function isInAppBrowser(ua = navigator.userAgent) {
  return IN_APP_RE.test(ua);
}

// "installed" | "inapp" | "ios" | "android" | "desktop"
export function detectPlatform() {
  if (isStandalone()) return "installed";
  if (isInAppBrowser()) return "inapp";
  if (isIOS()) return "ios";
  if (isAndroid()) return "android";
  return "desktop";
}
