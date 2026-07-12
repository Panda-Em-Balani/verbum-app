// ─── VERBUM PUSH NOTIFICATIONS ───────────────────────────────────────────────
// Registers the service worker, subscribes the device to Web Push,
// and saves the subscription to Supabase so the Edge Function can send to it.

import { supabase } from './supabase.js';

const VAPID_PUBLIC_KEY = 'OubPmNh3arIs3u9EHsgJ7qSdQ4x___VOKKYgd5ZIcOaJ-CP22Hd6jk8ggsiSacN0F7Ip6EvU1BmPi7Cq-JRJSg';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function initNotifications(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    // Register service worker
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Check if already subscribed
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      // Subscribe to push
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const json = sub.toJSON();

    // Save to Supabase — upsert so we don't duplicate
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      }, { onConflict: 'endpoint' });

    if (error) {
      console.warn('[Verbum] Failed to save push subscription:', error.message);
    } else {
      console.log('[Verbum] Push subscription saved successfully');
    }

    // Listen for deep link navigation messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NAVIGATE') {
        const url = event.data.url;
        const params = new URLSearchParams(url.split('?')[1] || '');
        const tab = params.get('tab');
        const section = params.get('section');
        window.dispatchEvent(new CustomEvent('verbum-navigate', { detail: { tab, section } }));
      }
    });

  } catch (err) {
    console.warn('[Verbum] Push notification setup failed:', err.message);
  }
}
