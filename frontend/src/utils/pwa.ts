/** True when running as the installed app (Home Screen / standalone window). */
export function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

/** True while a modal/dialog is open or the user is typing, so a refresh would lose work. */
export function isUserBusy(): boolean {
  if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return true
  const active = document.activeElement as HTMLElement | null
  return Boolean(active?.closest('input, textarea, select, [contenteditable="true"]'))
}

/**
 * Full reload that also picks up a newly deployed version: ask the service
 * worker to check for updates first (bounded, so a slow network never blocks).
 */
export async function reloadApp(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker?.getRegistration()
    if (registration) {
      await Promise.race([
        registration.update(),
        new Promise((resolve) => window.setTimeout(resolve, 2000)),
      ])
    }
  } catch {
    // Offline or no service worker: a plain reload is still the right call.
  }
  window.location.reload()
}

/**
 * Makes a new deploy show up without the user doing anything.
 *
 * The service worker serves the cached version first and installs the new one
 * in the background; it then takes control (skipWaiting + clientsClaim), but
 * the open page keeps running the old code. iOS also tends to resume the
 * installed app instead of relaunching it. So: check for updates whenever the
 * app returns to the foreground, and reload once a new version takes over —
 * straight away, or as soon as the app is backgrounded if the user is busy.
 */
export function reloadWhenNewVersionTakesOver(): void {
  if (!('serviceWorker' in navigator)) return
  // The very first install also fires controllerchange; only a replacement counts.
  let hadController = Boolean(navigator.serviceWorker.controller)
  let reloading = false
  const reload = () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) {
      hadController = true
      return
    }
    if (!isUserBusy()) {
      reload()
      return
    }
    const reloadWhenHidden = () => {
      if (document.visibilityState !== 'hidden') return
      document.removeEventListener('visibilitychange', reloadWhenHidden)
      reload()
    }
    document.addEventListener('visibilitychange', reloadWhenHidden)
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    void navigator.serviceWorker.getRegistration()
      .then((registration) => registration?.update())
      .catch(() => undefined)
  })
}
