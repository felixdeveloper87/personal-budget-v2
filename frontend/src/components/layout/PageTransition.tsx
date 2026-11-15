import { Box } from '@chakra-ui/react'
import { motion, useAnimationControls, useReducedMotion, type TargetAndTransition } from 'framer-motion'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { pageFromPath } from '../../routes'

const MotionBox = motion.create(Box)

const EASE = [0.32, 0.72, 0, 1] as const

/** Where a page starts its entrance from, given how it was reached. */
function entranceFor(previous: string, next: string, isPop: boolean): TargetAndTransition | null {
  const prevPage = pageFromPath(previous)
  const nextPage = pageFromPath(next)
  // Back (or forward) through history: the screen comes in from the left.
  if (isPop) return { opacity: 0.6, x: -28 }
  // Same area, deeper path (`/cards` → `/cards/12`): a detail screen pushes in from the right.
  if (prevPage === nextPage) {
    return next.startsWith(`${previous.replace(/\/+$/, '')}/`) ? { opacity: 0.6, x: 28 } : null
  }
  // Another tab or area: a quick fade-and-rise, like switching native tabs.
  return { opacity: 0, y: 10 }
}

/**
 * Animates each page in as the route changes. Only the entrance is animated
 * (no exit), so the page underneath is never held back or rendered twice, and
 * the page is not remounted — the same component keeps its state.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const reduceMotion = useReducedMotion()
  const controls = useAnimationControls()
  const previous = useRef(pathname)

  useLayoutEffect(() => {
    const from = previous.current
    previous.current = pathname
    if (from === pathname || reduceMotion || navigationType === 'REPLACE') return
    const entrance = entranceFor(from, pathname, navigationType === 'POP')
    if (!entrance) return
    controls.set(entrance)
    void controls.start({ opacity: 1, x: 0, y: 0, transition: { duration: 0.28, ease: EASE } })
  }, [pathname, navigationType, reduceMotion, controls])

  return (
    <MotionBox animate={controls} initial={false}>
      {children}
    </MotionBox>
  )
}
