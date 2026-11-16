import { useState, useEffect, lazy, Suspense } from "react";
import { track } from "./analytics.js";
import AppHeader from "./components/AppHeader.jsx";
import BottomNav from "./components/BottomNav.jsx";
import InstallBanner from "./components/InstallBanner.jsx";
import NotificationBanner from "./components/NotificationBanner.jsx";
import OfflineBanner from "./components/OfflineBanner.jsx";
import UpdateBanner from "./components/UpdateBanner.jsx";
import { useUpdate, clearUpdate } from "./pwa/updateStore.js";
import { INSTALL_PATH } from "./config.js";
import { getDailyVerseStatic } from "./dailyVerse.js";
import { isStandalone, isIOS, isInAppBrowser } from "./device.js";
import { initNotifications, getNotificationPermission } from "./notifications.js";
import { useProgress, initProgress, resetProgress, toggleFavorite } from "./progress.js";
import LoginPage from "./screens/auth/LoginPage.jsx";
import NamePrompt from "./screens/auth/NamePrompt.jsx";
import ResetPasswordScreen from "./screens/auth/ResetPasswordScreen.jsx";
import { useAuth, signOut } from "./auth/useAuth.js";
import HomeTab from "./screens/home/HomeScreen.jsx";
import { useRoute, navigate, tabOf, resolveLegacy } from "./router.js";
import { findVerse } from "./verses.js";
import { Cross } from "./components/Icons.jsx";
import { useLiturgicalDay } from "./liturgy/useLiturgicalDay.js";
import { seasonTheme } from "./liturgy/seasonTheme.js";
import { PAGE_BG, TEXT, MUTED, HEADER_BG, FONT_UI } from "./theme.js";

// Screens other than Home load when first opened.
const InstallPage = lazy(() => import("./InstallPage.jsx"));
const SoulCheckTab = lazy(() => import("./screens/SoulScreen.jsx"));
const ExploreTab = lazy(() => import("./screens/ExploreScreen.jsx"));
const PrayersTab = lazy(() => import("./screens/prayers/PrayersScreen.jsx"));
const MassTab = lazy(() => import("./screens/MassScreen.jsx"));

// Full-page placeholder while the session is checked.
function Splash() {
  return (
    <div role="status" style={{ minHeight: "100vh", background: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <Cross size={32} />
      <div style={{ fontFamily: FONT_UI, fontSize: 14, color: MUTED }}>Loading…</div>
    </div>
  );
}

// In-page placeholder while a screen's code loads; sits where screen titles sit.
function ScreenLoading() {
  return (
    <div role="status" aria-label="Loading" style={{ display: "flex", justifyContent: "center", padding: "24px 0", marginTop: "calc(56px + env(safe-area-inset-top))" }}>
      <Cross size={28} />
    </div>
  );
}

// Re-show the install banner a week after "Later" instead of hiding it forever.
const INSTALL_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000
function installDismissedRecently() {
  try {
    const at = Number(localStorage.getItem("verbum_install_dismissed"))
    return at > 0 && Date.now() - at < INSTALL_SNOOZE_MS
  } catch { return false }
}
// iPhone has no install prompt event, so offer the guide banner up front.
function shouldShowIosBanner() {
  return isIOS() && !isStandalone() && !isInAppBrowser() && !installDismissedRecently()
}

export default function BibleApp() {
  const { status, user } = useAuth()
  const route = useRoute()
  const update = useUpdate()
  const day = useLiturgicalDay()
  const headerColor = day ? seasonTheme(day.color).header : HEADER_BG

  // The browser's own top bar follows the header colour while signed in.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute("content", status === "signedIn" ? headerColor : HEADER_BG)
  }, [headerColor, status])
  const tab = tabOf(route.name) || "home"
  const { favorites, prayerLog } = useProgress()
  const [hasNewFavorites, setHasNewFavorites] = useState(false)
  const [showNotifBanner, setShowNotifBanner] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(shouldShowIosBanner)
  const [installed, setInstalled] = useState(isStandalone)
  // Keep the shared verse key from first load.
  const [sharedSlug] = useState(() => new URLSearchParams(window.location.search).get("v"))

  //  Load saved progress for the signed-in user, clear it on sign out 
  const signedIn = status === "signedIn"
  const userId = user?.id
  useEffect(() => {
    if (signedIn && userId) initProgress(userId)
    else if (status === "signedOut") resetProgress()
  }, [signedIn, userId, status])

  //  PWA Install prompt 
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      if (!installDismissedRecently() && !isStandalone()) setShowInstallBanner(true)
    }
    const onInstalled = () => {
      track("app_installed")
      setInstalled(true)
      setInstallPrompt(null)
      setShowInstallBanner(false)
    }
    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  //  Notification setup 
  useEffect(() => {
    if (!signedIn || !userId) return
    const permission = getNotificationPermission()
    if (permission === "granted") {
      initNotifications(userId)
    } else if (permission === "default" && !localStorage.getItem("verbum_notif_dismissed")) {
      const t = setTimeout(() => setShowNotifBanner(true), 2000)
      return () => clearTimeout(t)
    }
  }, [signedIn, userId])

  // A notification tapped while the app is open: the service worker tells us where to go.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    const onMessage = (e) => {
      if (e.data?.type !== "NAVIGATE" || !e.data.url) return
      try {
        const url = new URL(e.data.url, window.location.origin)
        navigate(resolveLegacy(url.href) ?? url.pathname + url.search)
      } catch { /* ignore malformed urls */ }
    }
    navigator.serviceWorker.addEventListener("message", onMessage)
    return () => navigator.serviceWorker.removeEventListener("message", onMessage)
  }, [])

  // Unknown address: go Home (keeping any sign-in token in the hash).
  useEffect(() => {
    if (route.notFound) navigate("/" + window.location.hash, { replace: true })
    // The reset screen has no place once someone is signed in normally.
    else if (route.name === "resetPassword" && status === "signedIn") navigate("/", { replace: true })
  }, [route.notFound, route.name, status])

  // Opening Explore clears the "new saved verse" dot.
  if (tab === "explore" && hasNewFavorites) setHasNewFavorites(false)

  const onFav = (id) => { if (toggleFavorite(id) && tab !== "explore") setHasNewFavorites(true) }

  // Fires the native install prompt when the browser offers one. Resolves to the outcome.
  const installViaPrompt = async () => {
    if (!installPrompt) return "unavailable"
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === "accepted") { setInstallPrompt(null); setShowInstallBanner(false) }
    return outcome
  }

  // Banner button: native prompt where available, otherwise the guided install page (iPhone).
  const handleInstall = async () => {
    track("install_click", { from: "banner" })
    if (installPrompt) { await installViaPrompt(); return }
    window.location.assign(`${INSTALL_PATH}?ref=banner`)
  }

  //  Public install page (no login needed) 
  if (route.name === "install") {
    const sharedVerse = findVerse(sharedSlug)
    return (
      <Suspense fallback={<Splash />}>
        <InstallPage verse={sharedVerse || getDailyVerseStatic()} sharedVerse={!!sharedVerse} installPrompt={installPrompt} onInstall={installViaPrompt} installed={installed} />
      </Suspense>
    )
  }

  //  Signed-out and in-between states 
  if (status === "loading") return <Splash />
  // A password-reset link: choose a new password before anything else.
  if (status === "recovery") return <ResetPasswordScreen recovering />
  if (route.name === "resetPassword" && status === "signedOut") return <ResetPasswordScreen recovering={false} />
  if (status === "signedOut") return <LoginPage />
  if (status === "needsName") return <NamePrompt email={user.email} />

  return (
    <div style={{ background: PAGE_BG, minHeight: "100vh", width: "100%", maxWidth: 430, margin: "0 auto", fontFamily: FONT_UI, color: TEXT, position: "relative" }}>
      <AppHeader user={user} onSignOut={signOut} background={headerColor} />
      <OfflineBanner />
      <main style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}>
        {showInstallBanner && tab === "home" && (
          <InstallBanner
            onInstall={handleInstall}
            onDismiss={() => { setShowInstallBanner(false); localStorage.setItem("verbum_install_dismissed", String(Date.now())) }}
          />
        )}
        {showNotifBanner && tab === "home" && (
          <NotificationBanner
            onGranted={() => {
              setShowNotifBanner(false)
              initNotifications(userId)
            }}
            onDismiss={() => { setShowNotifBanner(false); localStorage.setItem("verbum_notif_dismissed", "1") }}
          />
        )}

        <div key={route.name === "exploreSaved" ? "explore" : route.name} style={{ animation: "verbum-fade 150ms ease-out" }}>
        {tab === "home" && <HomeTab favorites={favorites} onFav={onFav} user={user} day={day} prayerLog={prayerLog} />}
        <Suspense fallback={<ScreenLoading />}>
          {tab === "soul" && <SoulCheckTab favorites={favorites} onFav={onFav} />}
          {tab === "explore" && <ExploreTab route={route} favorites={favorites} onFav={onFav} />}
          {tab === "prayers" && <PrayersTab route={route} />}
          {tab === "mass" && <MassTab />}
        </Suspense>
        </div>
      </main>
      {update && <UpdateBanner apply={update} onDismiss={clearUpdate} />}
      <BottomNav tab={tab} hasNewFavorites={hasNewFavorites} />
    </div>
  )
}
