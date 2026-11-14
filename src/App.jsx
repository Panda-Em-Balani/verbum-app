import { useState, useEffect } from "react";
import InstallPage from "./InstallPage.jsx";
import { track } from "./analytics.js";
import AppHeader from "./components/AppHeader.jsx";
import BottomNav from "./components/BottomNav.jsx";
import InstallBanner from "./components/InstallBanner.jsx";
import NotificationBanner from "./components/NotificationBanner.jsx";
import { INSTALL_PATH } from "./config.js";
import { getDailyVerseStatic } from "./dailyVerse.js";
import { isStandalone, isIOS, isInAppBrowser } from "./device.js";
import { initNotifications, getNotificationPermission } from "./notifications.js";
import { useProgress, initProgress, resetProgress, toggleFavorite } from "./progress.js";
import ExploreTab from "./screens/ExploreScreen.jsx";
import MassTab from "./screens/MassScreen.jsx";
import SoulCheckTab from "./screens/SoulScreen.jsx";
import LoginPage from "./screens/auth/LoginPage.jsx";
import NamePrompt from "./screens/auth/NamePrompt.jsx";
import HomeTab from "./screens/home/HomeScreen.jsx";
import PrayersTab from "./screens/prayers/PrayersScreen.jsx";
import { GLOBAL_CSS } from "./styles/globalCss.js";
import { supabase } from "./supabase.js";
import { DARK, WHITE } from "./theme.js";
import { findVerse } from "./verses.js";

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
  const [user, setUser] = useState(null)
  const [userChecked, setUserChecked] = useState(false)
  const [needsName, setNeedsName] = useState(false)
  const [tab, setTab] = useState("home")
  const favorites = useProgress().favorites
  const [hasNewFavorites, setHasNewFavorites] = useState(false)
  const [showNotifBanner, setShowNotifBanner] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(shouldShowIosBanner)
  const [installed, setInstalled] = useState(isStandalone)
  // The cold-start handler below clears the query string, so keep the shared verse key from first load.
  const [sharedSlug] = useState(() => new URLSearchParams(window.location.search).get("v"))

  //  Check Supabase session on load 
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", session.user.id)
            .single()
          if (profile?.name) {
            setUser({ name: profile.name, email: session.user.email })
          } else {
            setUser({ name: "", email: session.user.email })
            setNeedsName(true)
          }
        } catch {
          setUser({ name: "", email: session.user.email })
          setNeedsName(true)
        }
      }
      setUserChecked(true)
    }).catch(() => {
      setUserChecked(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  //  Load saved progress for the signed-in user, clear it on sign out 
  const signedIn = !!user
  useEffect(() => {
    if (!signedIn) { resetProgress(); return }
    supabase.auth.getSession().then(({ data }) => { if (data?.session?.user?.id) initProgress(data.session.user.id) }).catch(() => {})
  }, [signedIn])

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
    if (!user) return
    const permission = getNotificationPermission()
    if (permission === "granted") {
      supabase.auth.getUser().then(({ data }) => {
        initNotifications(data?.user?.id)
      }).catch(() => initNotifications())
    } else if (permission === "default" && !localStorage.getItem("verbum_notif_dismissed")) {
      const t = setTimeout(() => setShowNotifBanner(true), 2000)
      return () => clearTimeout(t)
    }
  }, [user])

  // Deep link navigation from notification tap
  useEffect(() => {
    const applyDeepLink = (tabId, section) => {
      if (section) localStorage.setItem("verbum_deep_section", section)
      if (tabId) setTab(tabId)
    }
    const parseUrl = (url) => {
      try {
        const u = new URL(url, window.location.origin)
        applyDeepLink(u.searchParams.get("tab"), u.searchParams.get("section"))
      } catch { /* ignore malformed urls */ }
    }

    // 1) Custom event (from anywhere in the app)
    const customHandler = (e) => {
      const { tab: tabId, section } = e.detail || {}
      applyDeepLink(tabId, section)
    }
    window.addEventListener("verbum-navigate", customHandler)

    // 2) Message from the service worker (notification tapped while app is open)
    const swHandler = (e) => {
      if (e.data?.type === "NAVIGATE" && e.data.url) parseUrl(e.data.url)
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", swHandler)
    }

    // 3) Cold start from a notification (app opened with ?tab=...&section=...)
    if (window.location.search) {
      parseUrl(window.location.href)
      window.history.replaceState({}, "", window.location.pathname)
    }

    return () => {
      window.removeEventListener("verbum-navigate", customHandler)
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", swHandler)
      }
    }
  }, [])

  const onFav = (id) => { if (toggleFavorite(id)) setHasNewFavorites(true) }

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

  const handleSignOut = async () => {
    if (window.confirm("Sign out of Verbum?")) {
      await supabase.auth.signOut()
      setUser(null)
    }
  }

  const handleTabChange = (id) => {
    setTab(id);
    if (id === "explore") setHasNewFavorites(false);
  }

  //  Public install page (no login needed) 
  if (window.location.pathname.replace(/\/+$/, "") === INSTALL_PATH) {
    const sharedVerse = findVerse(sharedSlug)
    return <InstallPage verse={sharedVerse || getDailyVerseStatic()} sharedVerse={!!sharedVerse} installPrompt={installPrompt} onInstall={installViaPrompt} installed={installed} />
  }

  //  Wait for session check 
  if (!userChecked) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&display=swap')`}</style>
        <div style={{ textAlign: "center" }}>
          <svg width="32" height="32" viewBox="0 0 20 20" fill="none" style={{ marginBottom: 16 }}>
            <rect x="8.5" y="2" width="3" height="16" rx="1" fill="#DAA520"/>
            <rect x="2" y="7.5" width="16" height="3" rx="1" fill="#DAA520"/>
          </svg>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: "#8B7355", letterSpacing: "0.1em" }}>Loading...</div>
        </div>
      </div>
    )
  }

  //  Show login if not authenticated 
  if (!user) {
    return <LoginPage onLogin={(u) => setUser(u)} />
  }

  //  Show name prompt if profile has no name 
  if (needsName) {
    return (
      <NamePrompt
        email={user.email}
        onComplete={(name) => {
          setUser(prev => ({ ...prev, name }))
          setNeedsName(false)
        }}
      />
    )
  }

  return (
    <div style={{ background: DARK, minHeight: "100vh", width: "100%", fontFamily: "'Lato',-apple-system,sans-serif", color: WHITE, position: "relative" }}>
      <style>{GLOBAL_CSS}</style>

      <AppHeader tab={tab} user={user} onSignOut={handleSignOut} />
      <div style={{ overflowY: "auto", paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}>
        {showInstallBanner && tab === "home" && (
          <InstallBanner
            onInstall={handleInstall}
            onDismiss={() => { setShowInstallBanner(false); localStorage.setItem("verbum_install_dismissed", String(Date.now())) }}
          />
        )}
        {showNotifBanner && tab === "home" && (
          <NotificationBanner
            onGranted={async () => {
              setShowNotifBanner(false)
              const { data } = await supabase.auth.getUser()
              if (data?.user?.id) initNotifications(data.user.id)
            }}
            onDismiss={() => { setShowNotifBanner(false); localStorage.setItem("verbum_notif_dismissed", "1") }}
          />
        )}

        {tab === "home"    && <HomeTab favorites={favorites} onFav={onFav} user={user} />}
        {tab === "soul"    && <SoulCheckTab favorites={favorites} onFav={onFav} />}
        {tab === "explore" && <ExploreTab favorites={favorites} onFav={onFav} />}
        {tab === "prayers" && <PrayersTab />}
        {tab === "mass"    && <MassTab />}
      </div>

      <BottomNav tab={tab} onChange={handleTabChange} hasNewFavorites={hasNewFavorites} />


    </div>
  )
}
