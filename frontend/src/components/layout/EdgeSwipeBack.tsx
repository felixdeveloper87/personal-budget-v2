import { Box } from '@chakra-ui/react'
import { CaretLeftIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { haptic } from '../../utils/haptics'
import { isIos, isStandalone } from '../../utils/pwa'

/** A swipe must start this close to the left edge. */
const EDGE = 24
/** Horizontal travel that goes back on release. */
const TRIGGER = 80
const MAX_PULL = 110
/** Movement before the gesture decides whether it is horizontal. */
const SLOP = 10

/** React Router keeps the history position in `history.state.idx`. */
function canGoBack(): boolean {
  const idx = (window.history.state as { idx?: number } | null)?.idx
  return typeof idx === 'number' && idx > 0
}

/**
 * Installed app on iPhone/iPad: there is no browser back button and no system
 * back gesture, so swiping in from the left edge goes back, like native iOS
 * navigation. (Android has its own system back gesture; browsers have theirs.)
 */
export default function EdgeSwipeBack() {
  const navigate = useNavigate()
  const [enabled] = useState(() => isIos() && isStandalone())
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const gesture = useRef<{ startX: number; startY: number; horizontal: boolean; x: number } | null>(null)

  useEffect(() => {
    if (!enabled) return

    // The blocking (non-passive) move listener only exists while a touch that
    // began at the edge is in progress, so ordinary scrolling never waits on it.
    const reset = () => {
      window.removeEventListener('touchmove', onTouchMove)
      gesture.current = null
      setDrag(null)
    }

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (event.touches.length !== 1 || touch.clientX > EDGE || !canGoBack()) return
      // Open sheets and dialogs own their gestures.
      if (document.querySelector('[role="dialog"][aria-modal="true"], [role="alertdialog"]')) return
      gesture.current = { startX: touch.clientX, startY: touch.clientY, horizontal: false, x: 0 }
      window.addEventListener('touchmove', onTouchMove, { passive: false })
    }

    function onTouchMove(event: TouchEvent) {
      const g = gesture.current
      if (!g) return
      const touch = event.touches[0]
      const dx = touch.clientX - g.startX
      const dy = touch.clientY - g.startY
      if (!g.horizontal) {
        if (Math.abs(dy) > SLOP && Math.abs(dy) > dx) {
          reset()
          return
        }
        if (dx < SLOP) return
        g.horizontal = true
      }
      // Once it is a back swipe, the page must not scroll underneath it.
      event.preventDefault()
      g.x = Math.min(MAX_PULL, dx)
      setDrag({ x: g.x, y: touch.clientY })
    }

    const onTouchEnd = () => {
      const g = gesture.current
      if (g?.horizontal && g.x >= TRIGGER) {
        haptic()
        navigate(-1)
      }
      reset()
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', reset, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', reset)
    }
  }, [enabled, navigate])

  if (!drag) return null

  const progress = Math.min(1, drag.x / TRIGGER)
  const ready = progress >= 1

  return (
    <Box
      aria-hidden
      position="fixed"
      left={0}
      top={`${drag.y - 20}px`}
      zIndex={2000}
      pointerEvents="none"
      transform={`translateX(${drag.x * 0.6 - 40}px)`}
      opacity={Math.max(0.3, progress)}
    >
      <Box
        w="40px"
        h="40px"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={ready ? '#820ad1' : 'white'}
        color={ready ? 'white' : '#820ad1'}
        boxShadow="0 6px 18px -6px rgba(31, 10, 50, 0.45)"
        transition="background 0.15s ease, color 0.15s ease"
      >
        <CaretLeftIcon size={20} weight="bold" />
      </Box>
    </Box>
  )
}
