import {
  getPushConfig,
  removePushSubscription,
  removePushSubscriptionOnLogout,
  savePushSubscription,
} from '../api'

/**
 * Browser side of Web Push. The service worker (public/push-sw.js) shows the
 * notifications; this module asks for permission and keeps the backend's copy
 * of this device's subscription in sync with the signed-in user.
 */

export type PushState =
  | 'unsupported' // browser has no Push API
  | 'needs-install' // iPhone/iPad Safari: only works from the Home Screen app
  | 'unavailable' // server has no VAPID keys yet, or no service worker (dev)
  | 'denied' // the user blocked notifications for the site
  | 'off'
  | 'on'

const SW_TIMEOUT_MS = 4000

export function isPushSupported(): boolean {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
}

function isIos(): boolean {
  const ua = navigator.userAgent
  // iPadOS reports itself as a Mac with touch.
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

/** Resolves the active registration, or null when no service worker runs (e.g. Vite dev). */
async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  const existing = await navigator.serviceWorker.getRegistration()
  if (!existing) return null
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), SW_TIMEOUT_MS)),
  ])
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await registration()
  return reg ? reg.pushManager.getSubscription() : null
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function sameKey(subscription: PushSubscription, publicKey: string): boolean {
  const current = subscription.options?.applicationServerKey
  if (!current) return true
  const a = new Uint8Array(current)
  const b = base64UrlToBytes(publicKey)
  return a.length === b.length && a.every((byte, i) => byte === b[i])
}

export async function getPushState(): Promise<PushState> {
  if (!isPushSupported()) {
    return isIos() && !isStandalone() ? 'needs-install' : 'unsupported'
  }
  if (Notification.permission === 'denied') return 'denied'
  const [config, reg] = await Promise.all([getPushConfig().catch(() => null), registration()])
  if (!config?.enabled || !reg) return 'unavailable'
  const subscription = await reg.pushManager.getSubscription()
  return subscription && Notification.permission === 'granted' ? 'on' : 'off'
}

/** Asks for permission (must run from a click), subscribes and registers the device. */
export async function enablePush(): Promise<PushState> {
  if (!isPushSupported()) return getPushState()
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off'

  const [config, reg] = await Promise.all([getPushConfig(), registration()])
  if (!config.enabled || !config.publicKey || !reg) return 'unavailable'

  let subscription = await reg.pushManager.getSubscription()
  if (subscription && !sameKey(subscription, config.publicKey)) {
    await subscription.unsubscribe()
    subscription = null
  }
  subscription ??= await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(config.publicKey),
  })
  await savePushSubscription(subscription.toJSON())
  return 'on'
}

export async function disablePush(): Promise<PushState> {
  const subscription = await currentSubscription()
  if (subscription) {
    await removePushSubscription(subscription.endpoint).catch(() => undefined)
    await subscription.unsubscribe()
  }
  return 'off'
}

/**
 * Re-registers an existing subscription for whoever is signed in now. Browsers
 * can rotate subscriptions, and another account may have used this device.
 */
export async function syncPushSubscription(): Promise<void> {
  if (!isPushSupported() || Notification.permission !== 'granted') return
  const subscription = await currentSubscription()
  if (subscription) await savePushSubscription(subscription.toJSON())
}

/** Stops this device receiving the signed-out user's notifications. Best effort. */
export function detachPushOnLogout(token: string | undefined): void {
  if (!token || !isPushSupported()) return
  void currentSubscription()
    .then((subscription) => subscription && removePushSubscriptionOnLogout(subscription.endpoint, token))
    .catch(() => undefined)
}
