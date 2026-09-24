/* Avanti Vessel AI — service worker (rede primeiro; cache só como reserva offline). */
const CACHE = 'avanti-site-v1.1.0';
const CORE = [
  './', './index.html', './Main.dc.html', './H2-Home-Mobile.dc.html', './S2-SOS-Mobile.dc.html', './S1-SOS-Web.dc.html',
  './login.html', './support.js', './avanti-auth.js', './avanti-app.js', './avanti-theme.js', './avanti-brain.js', './manifest.webmanifest',
  './assets/logo_white.png', './assets/icon-192.png', './assets/favicon_64.png',
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js'
];
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(new Request(u, u.startsWith('http') ? { mode: 'cors' } : {})).catch(() => null)))));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const cdn = /(^|\.)unpkg\.com$|^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!same && !cdn) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: same }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
