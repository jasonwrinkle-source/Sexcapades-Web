/* Sexcapades service worker — offline PWA support.
 * The cache name is stamped by the packaging scripts with the app build
 * (sexcapades-v<BUILD>) so every deploy ships a byte-different worker:
 * the browser sees a real update, installs it, and the activate handler
 * purges the previous build's caches. The __SX_CACHE__ token below is
 * the stamp point; if this file is ever served unstamped, the literal
 * token still yields a stable, unique cache name and the worker works.
 */
var CACHE = 'sexcapades-v__SX_CACHE__';

var CORE_URLS = [
  '/',
  '/hosted/gate.html',
  '/hosted/app.html',
  '/hosted/quickstart.html',
  '/hosted/guide.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// API / analytics endpoints: network-first, fail silently offline.
function isApiRequest(url) {
  return url.pathname === '/hosted/counter.php' ||
         url.pathname === '/counter.php' ||
         url.pathname.indexOf('/hosted/api/') === 0;
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(CORE_URLS);
    }).then(function () {
      // Best-effort manifest precache: the production manifest lists the
      // app's stamped bundles + images. Each file caches under its own
      // catch and the whole step resolves silently, so a missing manifest
      // (or any bad entry) never fails install — CORE_URLS alone still
      // installs and skipWaiting still runs below.
      return caches.open(CACHE).then(function (cache) {
        return fetch('/hosted/app-assets/version-manifest.json').then(function (res) {
          if (!res || res.status !== 200) return;
          return res.json();
        }).then(function (manifest) {
          if (!manifest || !manifest.files || !manifest.files.length) return;
          var jobs = manifest.files.map(function (entry) {
            var url = entry && entry.url;
            if (!url) return Promise.resolve();
            return cache.add(url).catch(function () { /* one bad file must not fail the rest */ });
          });
          return Promise.all(jobs);
        }).catch(function () { /* manifest step is best-effort only */ });
      }).catch(function () { /* manifest step is best-effort only */ });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE && key.indexOf('sexcapades-') === 0) {
          return caches.delete(key);
        }
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function offlineApiResponse() {
  // Silent no-op: counter/analytics callers already treat failures as "—".
  return new Response(JSON.stringify({ ok: false, offline: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }
  if (url.origin !== self.location.origin) return; // never cache third-party
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    event.respondWith(fetch(req));
    return;
  }

  if (isApiRequest(url)) {
    // Network-first for counters/APIs; offline → silent empty response.
    event.respondWith(
      fetch(req).then(function (res) {
        return res;
      }).catch(function () {
        return offlineApiResponse();
      })
    );
    return;
  }

  if (req.mode === 'navigate' || req.destination === 'document') {
    // Documents: network-first. A fresh deploy's shell must reach the
    // browser even when a previous worker cached the old shell; the
    // cache is only the offline fallback, refreshed on every good load.
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(req, copy);
          });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (cached) {
          if (cached) return cached;
          // Offline and this page was never cached: fall back to the gate.
          return caches.match('/hosted/gate.html');
        });
      })
    );
    return;
  }

  // Assets (JS/CSS/images/...): cache-first on the EXACT URL, query
  // string included. The optimizer stamps asset URLs ?v=<build>, so an
  // exact match means one build's cached file can never be served in
  // answer to another build's request (no cross-build mixes).
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(req, copy);
          });
        }
        return res;
      }).catch(function () {
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});

// Scene Sentinel check-in notifications: tapping opens/focuses the app at Sentinel.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = '/hosted/app.html#sentinel';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url.indexOf('/hosted/app.html') !== -1 || c.url.indexOf('/hosted/') !== -1) {
          c.focus();
          c.postMessage({ type: 'sexcapades-open-sentinel' });
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});
