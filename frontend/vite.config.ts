import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      VitePWA({
        // New deploys activate on the next load; no prompt needed.
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
        manifest: {
          id: '/',
          name: 'Personal Budget',
          short_name: 'Budget',
          description: 'Accounts, spending, commitments and household costs in one calm financial view.',
          lang: 'en-GB',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'any',
          theme_color: '#820ad1',
          background_color: '#820ad1',
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
          ],
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

