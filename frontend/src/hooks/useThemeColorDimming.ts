import { useEffect } from 'react'

/** The brand purple, as the manifest and index.html declare it. */
export const THEME_COLOR = '#820ad1'
/** The purple seen through a sheet's dark overlay. */
const DIMMED_THEME_COLOR = '#46056f'

const OPEN_DIALOG = '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]'

/**
 * Android paints the status bar (installed app) and the address bar (Chrome)
 * with `theme-color`, which sits outside the page, so a sheet's overlay cannot
 * dim it. Follow open dialogs instead, the way native sheets dim the status bar.
 */
export function useThemeColorDimming() {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) return

    let frame = 0
    const sync = () => {
      frame = 0
      const color = document.querySelector(OPEN_DIALOG) ? DIMMED_THEME_COLOR : THEME_COLOR
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
    sync()
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
      meta.content = THEME_COLOR
    }
  }, [])
}
