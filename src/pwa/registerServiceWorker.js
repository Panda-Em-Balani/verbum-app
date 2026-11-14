// Registers the service worker for every visitor (offline support does not depend on
// allowing notifications) and reports when a new version is ready.
//
// onUpdateReady(apply): called when a new version has been downloaded and is waiting.
// Calling apply() switches to it and reloads the page once. Nothing reloads until then.
export function registerServiceWorker({ onUpdateReady }) {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  let applying = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // Only reload when the user asked for the update, and only once.
    if (!applying) return;
    applying = false;
    window.location.reload();
  });

  const announce = (registration) => {
    if (!registration.waiting || !navigator.serviceWorker.controller) return;
    onUpdateReady(() => {
      const waiting = registration.waiting;
      if (!waiting) { window.location.reload(); return; }
      applying = true;
      waiting.postMessage({ type: "SKIP_WAITING" });
    });
  };

  const start = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      announce(registration);
      registration.addEventListener("updatefound", () => {
        const incoming = registration.installing;
        if (!incoming) return;
        incoming.addEventListener("statechange", () => {
          if (incoming.state === "installed") announce(registration);
        });
      });
    } catch (err) {
      console.warn("[Verbum] Service worker registration failed:", err?.message);
    }
  };

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}
