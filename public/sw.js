// Service worker mínimo: só deixa o app instalável e melhora a abertura em
// conexão ruim. NÃO cacheia nada dinâmico (dados vindos do Supabase, ou o
// mock em memória) — isso tem que sempre vir da rede, senão o usuário vê
// dado desatualizado. Só assets estáticos do build (JS/CSS/ícones) entram
// em cache. Ver src/lib/registerServiceWorker.ts para onde isso é registrado.

const CACHE = 'praxis-shell-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    url.pathname === '/favicon.png' ||
    url.pathname === '/pwa-192.png' ||
    url.pathname === '/pwa-512.png' ||
    url.pathname === '/pwa-maskable-512.png' ||
    url.pathname === '/manifest.webmanifest'
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (!isStaticAsset(url)) return

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request)
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        })
        .catch(() => cached)
      return cached || fetchPromise
    }),
  )
})
