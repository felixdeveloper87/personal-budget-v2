import { Box, useModalContext, type BoxProps } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import { haptic } from '../../utils/haptics'
import { MOBILE_QUERY, sheetGrabberProps } from './modalLayout'

/** Drag past this share of the sheet's height (or a fast flick) to close it. */
const DISMISS_RATIO = 0.25
const DISMISS_MAX_PX = 160
/** px per ms — a flick faster than this closes even on a short drag. */
const FLICK_VELOCITY = 0.55
const FLICK_MIN_PX = 24
const SETTLE_MS = 240
const SETTLE = `transform ${SETTLE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`

const chakraContainer = (zone: HTMLElement) =>
  zone.closest<HTMLElement>('.chakra-modal__content-container')

interface SheetDragHandleProps extends BoxProps {
  onClose: () => void
  /** false: the sheet follows the finger but always springs back (e.g. while saving). */
  dismissible?: boolean
  /** The element that moves with the finger. Default: the Chakra modal's container. */
  resolveTarget?: (zone: HTMLElement) => HTMLElement | null
  /** Gesture is live only while this media query matches (the sheet layout). */
  mediaQuery?: string
}

/**
 * The grabber bar at the top of a mobile sheet, working like a native one:
 * drag it down and the sheet follows the finger; let go far enough (or flick)
 * and it closes, otherwise it springs back. Other props style the visible bar.
 */
export function SheetDragHandle({
  onClose,
  dismissible = true,
  resolveTarget = chakraContainer,
  mediaQuery = MOBILE_QUERY,
  ...barProps
}: SheetDragHandleProps) {
  const zoneRef = useRef<HTMLDivElement | null>(null)
  const latest = useRef({ onClose, resolveTarget })
  latest.current = { onClose, resolveTarget }

  useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return

    let target: HTMLElement | null = null
    let pointerId: number | null = null
    let startY = 0
    let startTime = 0
    let offset = 0

    const release = (el: HTMLElement, delay: number) => {
      window.setTimeout(() => {
        if (!el.isConnected) return
        el.style.transform = ''
        el.style.transition = ''
      }, delay)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!window.matchMedia(mediaQuery).matches) return
      if (event.pointerType === 'mouse' && event.button !== 0) return
      target = latest.current.resolveTarget(zone)
      if (!target) return
      pointerId = event.pointerId
      startY = event.clientY
      startTime = event.timeStamp
      offset = 0
      zone.setPointerCapture(event.pointerId)
      target.style.transition = 'none'
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId || !target) return
      const delta = event.clientY - startY
      // Upward drags meet growing resistance instead of lifting the sheet away.
      offset = delta >= 0 ? delta : -Math.sqrt(-delta) * 2
      target.style.transform = `translateY(${offset}px)`
    }

    const finish = (event: PointerEvent) => {
      if (event.pointerId !== pointerId || !target) return
      pointerId = null
      const el = target
      const sheetHeight = zone.parentElement?.getBoundingClientRect().height ?? window.innerHeight
      const velocity = offset / Math.max(1, event.timeStamp - startTime)
      const shouldClose = dismissible && event.type === 'pointerup' && (
        offset > Math.min(DISMISS_MAX_PX, sheetHeight * DISMISS_RATIO)
        || (velocity > FLICK_VELOCITY && offset > FLICK_MIN_PX)
      )

      el.style.transition = SETTLE
      if (!shouldClose) {
        el.style.transform = 'translateY(0)'
        release(el, SETTLE_MS)
        return
      }

      haptic()
      el.style.transform = 'translateY(100%)'
      window.setTimeout(() => {
        latest.current.onClose()
        // Hand the transform back once the close has run — or, if the owner
        // refused to close (e.g. while saving), bring the sheet back.
        release(el, 400)
      }, SETTLE_MS - 40)
    }

    zone.addEventListener('pointerdown', onPointerDown)
    zone.addEventListener('pointermove', onPointerMove)
    zone.addEventListener('pointerup', finish)
    zone.addEventListener('pointercancel', finish)
    return () => {
      zone.removeEventListener('pointerdown', onPointerDown)
      zone.removeEventListener('pointermove', onPointerMove)
      zone.removeEventListener('pointerup', finish)
      zone.removeEventListener('pointercancel', finish)
    }
  }, [dismissible, mediaQuery])

  const { display, zIndex, ...bar } = sheetGrabberProps
  return (
    // A touch target wider and taller than the 5px bar, centred so it never
    // covers a header's close or back button at the edges.
    <Box
      ref={zoneRef}
      aria-hidden
      display={barProps.display ?? display}
      position="absolute"
      top={0}
      left="25%"
      right="25%"
      h="28px"
      zIndex={barProps.zIndex ?? zIndex}
      cursor="grab"
      sx={{ touchAction: 'none' }}
    >
      <Box {...bar} {...barProps} display="block" zIndex={undefined} />
    </Box>
  )
}

/**
 * `SheetDragHandle` for Chakra modals and drawers: reads `onClose` from the
 * modal context, so it must render inside `ModalContent` / `DrawerContent`.
 */
export default function SheetGrabber(props: Omit<SheetDragHandleProps, 'onClose' | 'resolveTarget'>) {
  const { onClose } = useModalContext()
  return <SheetDragHandle onClose={onClose} {...props} />
}
