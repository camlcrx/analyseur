/* Analyseur de ventes : fonctionnement hors ligne (Camille Lacroix) */
const V = 'analyseur-v2';
const PRE = ['./', './index.html', './ipad.html',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&display=swap'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(PRE.map(u =>
    fetch(new Request(u, { mode: u.startsWith('http') ? 'no-cors' : 'same-origin' })).then(r => c.put(u, r)).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // pages de l'app : d'abord le réseau (pour avoir la dernière version), sinon la copie gardée
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  } else {
    // bibliothèque Excel et polices : d'abord la copie gardée, sinon le réseau
    e.respondWith(caches.match(req, { ignoreVary: true }).then(r => r || fetch(req).then(n => { const cp = n.clone(); caches.open(V).then(c => c.put(req, cp)); return n; })));
  }
});
