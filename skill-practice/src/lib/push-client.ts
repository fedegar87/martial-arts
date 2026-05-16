import type { BrowserPushSubscription } from "@/lib/push-notifications";

export type PushSupportState =
  | "supported"
  | "unsupported"
  | "permission_denied"
  | "missing_key";

export function getPushSupportState(publicVapidKey: string): PushSupportState {
  if (!publicVapidKey) return "missing_key";
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "denied") return "permission_denied";
  return "supported";
}

export async function subscribeToTrainingReminders(
  publicVapidKey: string,
): Promise<BrowserPushSubscription> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permesso notifiche non concesso.");
  }

  const registration = await getServiceWorkerRegistration();
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing.toJSON() as BrowserPushSubscription;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  });

  return subscription.toJSON() as BrowserPushSubscription;
}

export async function unsubscribeFromTrainingReminders(): Promise<string | undefined> {
  if (!("serviceWorker" in navigator)) return undefined;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  const endpoint = subscription?.endpoint;
  await subscription?.unsubscribe();
  return endpoint;
}

function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => navigator.serviceWorker.ready.then(() => registration));
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return buffer;
}
