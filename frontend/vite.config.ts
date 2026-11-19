import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// The production build (docker-compose.yml, nginx) and the dev server
// (docker-compose.dev.yml, Vite) both run on localhost:3000, so the build's
// service worker stays registered and keeps serving its cached app shell to the
// dev server: the page looks stale or broken until a hard refresh. The browser
// re-checks /sw.js on every navigation; in dev it gets this kill switch, which
// clears the caches, unregisters itself and reloads the open tabs.
const DEV_SW_KILL_SWITCH = `
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) await caches.delete(key)
    await self.registration.unregister()
    for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url)
  })())
})
`

function devServiceWorkerKillSwitch(): Plugin {
  return {
    name: 'dev-service-worker-kill-switch',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/sw.js', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(DEV_SW_KILL_SWITCH)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      devServiceWorkerKillSwitch(),
      react(),
      VitePWA({
        // New deploys activate on the next load; no prompt needed.
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        // workbox.globPatterns already precaches every icon; avoid duplicate entries.
        includeManifestIcons: false,
        manifest: {
          id: '/',
          name: 'Personal Budget',
          short_name: 'Budget',
          description: 'Accounts, spending, commitments and household costs in one calm financial view.',
          lang: 'en-GB',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          // Phone app: portrait, like the native finance apps it sits beside.
          orientation: 'portrait',
          categories: ['finance', 'productivity'],
          // Purple splash with the mark — the same picture as the iOS launch
          // images, the boot screen in index.html and AppSplash.tsx.
          theme_color: '#820ad1',
          background_color: '#820ad1',
          // Long-press the home-screen icon (Android) to jump straight in.
          shortcuts: [
            { name: 'Transactions', short_name: 'Transactions', url: '/transactions', icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }] },
            { name: 'Household', short_name: 'Household', url: '/household', icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }] },
            { name: 'Accounts', short_name: 'Accounts', url: '/accounts', icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }] },
            { name: 'Payments', short_name: 'Payments', url: '/payments', icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }] },
          ],
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // App shell only. Financial data from the API is never cached.
          globPatterns: [
            '**/*.{js,css,html,svg,webp,woff2}',
            'pwa-*.png',
            'maskable-icon-*.png',
            'apple-touch-icon-*.png',
            'badge-*.png',
          ],
          // Push and notification-click handlers live in public/push-sw.js.
          importScripts: ['push-sw.js'],
          // The main bundle is ~2.2 MB, above Workbox's 2 MiB default.
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
        },
      }),
    ],
    server: {
      port: 5173,
      host: '0.0.0.0',
      watch: {
        usePolling: true, // Necessário para Docker no Windows
        interval: 1000,   // Verifica mudanças a cada 1 segundo
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://backend:8080',
          changeOrigin: true
        }
      }
    }
  }
})

