// Service worker de Kopeet: muestra los recordatorios (notificaciones push) aunque la app esté cerrada.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { cuerpo: e.data ? e.data.text() : "" }; }
  const titulo = d.titulo || "Kopeet";
  e.waitUntil(self.registration.showNotification(titulo, {
    body: d.cuerpo || "",
    icon: "/marca/isotipo-kopeet-180.png",
    badge: "/marca/isotipo-kopeet-180.png",
    tag: d.tag || "kopeet",
    data: { url: d.url || "/inicio" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/inicio", self.location.origin).href;
  e.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const v of ventanas) {
      if (v.url.startsWith(self.location.origin) && "focus" in v) { await v.navigate(url).catch(() => {}); return v.focus(); }
    }
    return self.clients.openWindow(url);
  })());
});
