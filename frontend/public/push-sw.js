/* Web Push handlers, loaded into the Workbox service worker via importScripts.
   Payload from the backend: { title, body, url, tag? }. */

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (error) {
    data = { body: event.data ? event.data.text() : '' }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Personal Budget', {
      body: data.body || '',
      icon: '/pwa-192x192.png',
      badge: '/badge-96x96.png',
      tag: data.tag || undefined,
      // A newer update for the same expense or week replaces the old one but still alerts.
      renotify: Boolean(data.tag),
      data: { url: data.url || '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin)
      if (open) {
        await open.focus()
        if (open.url !== target && 'navigate' in open) {
          await open.navigate(target).catch(() => undefined)
        }
        return
      }
      await self.clients.openWindow(target)
    })(),
  )
})
