import type { UiTranslator } from "@/lib/i18n/config";
import type { BrowserPushSubscription } from "@/lib/push-notifications";

export type PushSupportState =
  | "supported"
  | "ios_install_required"
  | "unsupported"
  | "permission_denied"
  | "missing_key";

export function getPushSupportState(publicVapidKey: string): PushSupportState {
  if (!publicVapidKey) return "missing_key";
  if (typeof window === "undefined") return "unsupported";
  if (isIosDevice() && !isStandaloneDisplayMode()) {
    return "ios_install_required";
  }
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return "unsupported";
  }
  if (Notification.permission === "denied") return "permission_denied";
  return "supported";
}

export function pushSupportErrorMessage(
  state: Exclude<PushSupportState, "supported">,
  tr?: UiTranslator,
): string {
  switch (state) {
    case "missing_key":
      return tr
        ? tr("pushNotConfigured")
        : "Promemoria non configurati sul server.";
    case "ios_install_required":
      return tr
        ? tr("iosInstallRequired")
        : "Su iPhone e iPad installa prima l'app: tocca Condividi, scegli «Aggiungi alla schermata Home» e riaprila dalla Home.";
    case "permission_denied":
      return tr
        ? tr("notificationsBlocked")
        : "Notifiche bloccate. Riattivale dalle impostazioni del dispositivo o del browser.";
    case "unsupported":
      return tr
        ? tr("pushUnsupported")
        : "Questo browser non supporta le notifiche push per questa app.";
  }
}

function isIosDevice(): boolean {
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function isStandaloneDisplayMode(): boolean {
  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) {
    return true;
  }
  return window.matchMedia?.("(display-mode: standalone)").matches === true;
}

export async function subscribeToPushNotifications(
  publicVapidKey: string,
  tr?: UiTranslator,
): Promise<BrowserPushSubscription> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      tr
        ? tr("notificationPermissionDenied")
        : "Permesso notifiche non concesso.",
    );
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

export async function unsubscribeFromPushNotifications(): Promise<
  string | undefined
> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator))
    return undefined;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  const endpoint = subscription?.endpoint;
  await subscription?.unsubscribe();
  return endpoint;
}

function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker
    .register("/sw.js")
    .then((registration) =>
      navigator.serviceWorker.ready.then(() => registration),
    );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return buffer;
}
