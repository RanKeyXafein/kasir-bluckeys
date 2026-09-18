const CACHE_NAME = "kasir-bluckeys-v4";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

// Naikkan angka di CACHE_NAME (v1 -> v2, dst) tiap kali kamu upload
// index.html versi baru, supaya HP langsung ambil versi terbaru.

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Untuk navigasi (buka halaman): coba internet dulu supaya selalu dapat versi
  // terbaru, kalau offline baru pakai salinan tersimpan.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Untuk file lain (ikon, manifest, font, dll): pakai cache dulu, baru internet.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
