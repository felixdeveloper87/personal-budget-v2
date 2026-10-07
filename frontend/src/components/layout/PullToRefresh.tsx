import { useEffect, useRef, useState } from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import { ArrowClockwiseIcon } from '@phosphor-icons/react'
import { isStandalone, reloadApp } from '../../utils/pwa'
import { useI18n } from '../../i18n'

/** Visible pull distance (after resistance) that triggers a reload. */
const THRESHOLD = 64
const MAX_PULL = 96
/** Finger travel ignored before the gesture counts as a pull. */
const SLOP = 8
const RESISTANCE = 0.5

/** Pulls that start inside these never refresh: dialogs, menus, or opted-out areas. */
const BLOCKING_SELECTOR = '[role="dialog"], [role="alertdialog"], [role="menu"], [data-no-pull-refresh]'

function startsInsideScrolledArea(target: EventTarget | null): boolean {
  let node = target instanceof Element ? target : null
  while (node && node !== document.body) {
    if (node.matches(BLOCKING_SELECTOR)) return true
    const { overflowY } = window.getComputedStyle(node)
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollTop > 0) return true
    node = node.parentElement
  }
  return false
}

/**
 * Installed app only (browsers already have their own pull-to-refresh, and
 * standalone mode removes it): pull down from the top of the page to reload,
 * which also picks up a newly deployed version.
 */
export default function PullToRefresh() {
  const { t } = useI18n()
  const [enabled] = useState(isStandalone)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const start = useRef<{ x: number; y: number } | null>(null)
  const pulling = useRef(false)
  const distance = useRef(0)
  const busy = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const reset = () => {
      start.current = null
      pulling.current = false
      distance.current = 0
      setPull(0)
    }

    const onTouchStart = (event: TouchEvent) => {
      if (busy.current || event.touches.length !== 1) return
      if (window.scrollY > 0 || startsInsideScrolledArea(event.target)) {
        start.current = null
        return
      }
      start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      pulling.current = false
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!start.current) return
      const dx = event.touches[0].clientX - start.current.x
      const dy = event.touches[0].clientY - start.current.y
      if (!pulling.current) {
        // Horizontal swipes (period navigator, carousels) and upward scrolls are not pulls.
        if (Math.abs(dx) > SLOP || dy < -SLOP) {
          start.current = null
          return
        }
        if (dy <= SLOP || Math.abs(dx) > dy) return
        pulling.current = true
      }
      const next = Math.max(0, Math.min(MAX_PULL, (dy - SLOP) * RESISTANCE))
      distance.current = next
      setPull(next)
    }

    const onTouchEnd = () => {
      if (pulling.current && distance.current >= THRESHOLD) {
        busy.current = true
        setRefreshing(true)
        setPull(THRESHOLD)
        void reloadApp()
        return
      }
      reset()
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', reset, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', reset)
    }
  }, [enabled])

  if (!enabled || (pull === 0 && !refreshing)) return null

  const progress = Math.min(1, pull / THRESHOLD)
  const ready = progress >= 1

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label={refreshing ? t('pullToRefresh.refreshing') : t('pullToRefresh.pull')}
      position="fixed"
      top="calc(env(safe-area-inset-top, 0px) + 8px)"
      left="50%"
      zIndex={2000}
      pointerEvents="none"
      transform={`translate(-50%, ${pull - 44}px)`}
      transition={pulling.current ? undefined : 'transform 0.2s ease'}
      opacity={Math.max(0.25, progress)}
    >
      <Box
        w="40px"
        h="40px"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={ready || refreshing ? '#820ad1' : 'white'}
        color={ready || refreshing ? 'white' : '#820ad1'}
        boxShadow="0 6px 18px -6px rgba(31, 10, 50, 0.45)"
        transition="background 0.15s ease, color 0.15s ease"
      >
        {refreshing ? (
          <Spinner size="sm" thickness="2.5px" speed="0.7s" />
        ) : (
          <ArrowClockwiseIcon
            size={20}
            weight="bold"
            style={{ transform: `rotate(${progress * 300}deg)` }}
            aria-hidden="true"
          />
        )}
      </Box>
    </Box>
  )
}
