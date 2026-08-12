import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Box, Flex, Icon, useColorModeValue } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from '../../ui/icons'
import { useI18n } from '../../../i18n'

/**
 * Horizontal, snap-scrolling row of chips. On wider screens it adds left/right
 * chevrons (shown only when there's more to scroll in that direction) so a mouse
 * user can page through the carousel; touch users just swipe.
 */
export default function ChipCarousel({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: false, end: false })

  const update = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const start = el.scrollLeft > 1
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
  }, [])

  useEffect(() => {
    update()
    const el = scrollerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update])

  const nudge = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' })
  }

  const chevBg = useColorModeValue('white', 'gray.700')
  const chevColor = useColorModeValue('gray.700', 'gray.100')
  const chevBorder = useColorModeValue('gray.200', 'whiteAlpha.300')
  const chevHoverBg = useColorModeValue('gray.50', 'gray.600')

  const chevronProps = (visible: boolean) => ({
    display: { base: 'none', md: 'flex' },
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    alignItems: 'center',
    justifyContent: 'center',
    boxSize: '30px',
    borderRadius: 'full',
    bg: chevBg,
    color: chevColor,
    border: '1px solid',
    borderColor: chevBorder,
    boxShadow: 'md',
    opacity: visible ? 1 : 0,
    pointerEvents: (visible ? 'auto' : 'none') as 'auto' | 'none',
    transition: 'opacity 0.2s ease, background 0.2s ease',
    zIndex: 2,
    _hover: { bg: chevHoverBg },
  })

  return (
    <Box position="relative" w="full" minW={0}>
      <Flex
        ref={scrollerRef}
        onScroll={update}
        direction="row"
        gap={2.5}
        overflowX="auto"
        w="full"
        minW={0}
        maxW="100%"
        py={0.5}
        px={1}
        sx={{
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          '::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {children}
      </Flex>

      <Flex
        as="button"
        type="button"
        aria-label={t('form.scrollLeft')}
        onClick={() => nudge(-1)}
        left="-2px"
        {...chevronProps(edges.start)}
      >
        <Icon as={ChevronLeft} boxSize="18px" />
      </Flex>
      <Flex
        as="button"
        type="button"
        aria-label={t('form.scrollRight')}
        onClick={() => nudge(1)}
        right="-2px"
        {...chevronProps(edges.end)}
      >
        <Icon as={ChevronRight} boxSize="18px" />
      </Flex>
    </Box>
  )
}
