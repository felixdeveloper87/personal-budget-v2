import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/** Last scroll position of every path visited this session. */
const positions = new Map<string, number>()

/** Location state set by the tab bar (see `PageChangeOptions.fromTab`). */
export interface TabNavigationState {
  tab?: boolean
}

/**
 * Scroll on navigation, the way native apps do it:
 * - a new page opens at the top;
 * - switching tabs returns to where that tab was left;
 * - back/forward (POP) keeps the browser's own scroll handling.
 *
 * Content can still be arriving when we restore (cached queries render at
 * once, fresh ones a moment later), so the restore retries briefly until the
 * page is tall enough — and stops as soon as the user scrolls themselves.
 */
export function useTabScrollRestoration() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const currentPath = useRef(location.pathname)

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        positions.set(currentPath.current, window.scrollY)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  useLayoutEffect(() => {
    currentPath.current = location.pathname
    if (navigationType === 'POP') return

    const fromTab = (location.state as TabNavigationState | null)?.tab === true
    const target = fromTab ? positions.get(location.pathname) ?? 0 : 0
    return scrollWhenReady(target)
    // Only a new path moves the scroll; query-string changes (filters, open statement) do not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navigationType])
}

/** Scrolls to `top`, retrying for a moment while the page grows. Returns a cancel function. */
function scrollWhenReady(top: number): () => void {
  window.scrollTo({ top: 0 })
  if (top <= 0) return () => undefined

  const deadline = performance.now() + 900
  let frame = 0
  const cancel = () => {
    window.cancelAnimationFrame(frame)
    window.removeEventListener('touchstart', cancel)
    window.removeEventListener('wheel', cancel)
  }
  const attempt = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: Math.min(top, Math.max(0, max)) })
    if (max < top && performance.now() < deadline) frame = window.requestAnimationFrame(attempt)
    else cancel()
  }
  window.addEventListener('touchstart', cancel, { passive: true })
  window.addEventListener('wheel', cancel, { passive: true })
  attempt()
  return cancel
}
