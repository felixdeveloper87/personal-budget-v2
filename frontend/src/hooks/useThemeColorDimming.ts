import { useEffect } from 'react'
import { ACCENTS, DEFAULT_ACCENT, currentAccent } from '../accent'

/** The brand purple, as the manifest, index.html and the launch splash declare it. */
export const THEME_COLOR = ACCENTS[DEFAULT_ACCENT].main

const OPEN_DIALOG = '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]'

/**
 * Android paints the status bar (installed app) and the address bar (Chrome)
 * with `theme-color`, which sits outside the page, so a sheet's overlay cannot
 * dim it. Follow open dialogs instead, the way native sheets dim the status bar.
 * The colour follows the user's accent (accent.ts).
 */
export function useThemeColorDimming() {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) return

    let frame = 0
    const sync = () => {
      frame = 0
      const accent = ACCENTS[currentAccent()]
      const color = document.querySelector(OPEN_DIALOG) ? accent.dimmed : accent.main
      if (meta.content !== color) meta.content = color
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(sync)
    }

    const observer = new MutationObserver(schedule)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-modal'],
    })
    window.addEventListener('pb-accent-change', schedule)
    sync()
    return () => {
      observer.disconnect()
      window.removeEventListener('pb-accent-change', schedule)
      window.cancelAnimationFrame(frame)
      meta.content = ACCENTS[currentAccent()].main
    }
  }, [])
}
