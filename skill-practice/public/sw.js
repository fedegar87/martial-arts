// Bump della versione a ogni release significativa: l'handler `activate` elimina
// le cache con nome diverso, quindi cambiare versione purga gli asset dei deploy
// precedenti (mitiga la crescita illimitata di /_next/static).
const CACHE_NAME = "kung-fu-practice-v3";
const OFFLINE_URL = "/offline.html";
const STATIC_ASSETS = [OFFLINE_URL, "/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkOnlyWithOffline(request));
  }
});

self.addEventListener("push", (event) => {
  const payload = readPushPayload(event);
  if (!payload) return;

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      data: {
        url: payload.url || "/today",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || "/today", self.location.origin);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === targetUrl.origin) {
            return client.focus().then(() => client.navigate(targetUrl.href));
          }
        }
        return self.clients.openWindow(targetUrl.href);
      }),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  // Solo le risposte valide vanno in cache: un 404/500 transitorio su un chunk
  // hashato resterebbe servito cache-first all'infinito (ChunkLoadError ricorrente).
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkOnlyWithOffline(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(OFFLINE_URL)) ?? Response.error();
  }
}

function readPushPayload(event) {
  if (!event.data) return null;

  try {
    const payload = event.data.json();
    if (!payload || typeof payload.title !== "string" || typeof payload.body !== "string") {
      return null;
    }
    return {
      title: payload.title,
      body: payload.body,
      url: typeof payload.url === "string" ? payload.url : "/today",
      tag: typeof payload.tag === "string" ? payload.tag : "training-reminder",
    };
  } catch {
    return null;
  }
}
