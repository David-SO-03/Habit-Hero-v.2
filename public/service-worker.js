// Service Worker para Habit Hero Weekly
// Versión: 1.1

const CACHE_NAME = "habit-hero-v1";
const ASSETS_TO_CACHE = [
  "/", // index.html
  "/index.html",
  "/icons/web-app-manifest-192x192.png",
  "/icons/web-app-manifest-512x512.png",
  // Nota: Los JS y CSS compilados por Vite se agregarán automáticamente en producción
];

// Instalar Service Worker y cachear assets
self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker activado");
  event.waitUntil(self.clients.claim());
});

// Interceptar requests para servir desde cache primero
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Escuchar mensajes desde la app para notificaciones
self.addEventListener("message", (event) => {
  if (event.data?.type === "SCHEDULE_NOTIFICATION") {
    const { title, body, delay } = event.data;

    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        vibrate: [200, 100, 200],
        tag: "habit-hero-reminder",
        requireInteraction: false,
        data: { url: "/" },
      });
    }, delay);
  }
});

self.addEventListener("push", (event) => {
  let data = { title: "Habit Hero", body: "Notificación", url: "/" };
  if (event.data) data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      tag: "habit-hero-push",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList)
          if ("focus" in client) return client.focus();
        if (clients.openWindow) return clients.openWindow("/");
      })
  );
});
