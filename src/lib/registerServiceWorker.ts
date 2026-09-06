/** Registers the PWA shell service worker (see public/sw.js) — production only, so a dev
 * session never serves stale cached assets. Call once from main.tsx. */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}
