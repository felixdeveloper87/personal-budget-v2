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
