import {
  Box,
  Flex,
  Icon,
  HStack,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  usePrefersReducedMotion,
  type StackProps,
} from '@chakra-ui/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import {
  NAV_ITEMS,
  localizeNavigationItems,
  navItemIdFor,
  type AppPage,
  type NavItem,
} from './navigation.config'
import { ChevronLeft, ChevronRight } from '../../ui/icons'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'

interface NavBarProps extends Omit<StackProps, 'onChange'> {
  currentPage: AppPage
  onPageChange?: (page: AppPage) => void
  items?: ReadonlyArray<NavItem>
  /**
   * `desktop` — pill container, icon + full label, content-sized items.
   * `mobile`  — full-width segmented bar, icon + short label, equal columns.
   */
  variant?: 'desktop' | 'mobile'
}

interface IndicatorRect {
  left: number
  width: number
  ready: boolean
}

export default function NavBar({
  currentPage,
  onPageChange,
  items = NAV_ITEMS,
  variant = 'desktop',
  ...stackProps
}: NavBarProps) {
  const { t } = useI18n()
  const localizedItems = useMemo(
    () => localizeNavigationItems(items, (key, fallback) => t(key, undefined, fallback)),
    [items, t],
  )
  const isMobile = variant === 'mobile'
  const reducedMotion = usePrefersReducedMotion()
  // Mobile shows every destination in a horizontally scrollable carousel
  // (no "More" overflow menu); desktop lays them out inline.
  const activeNavId = navItemIdFor(currentPage)
  // Tablet range (md..lg, ~768–991px): collapse desktop nav to icon-only
  // so the top row never squeezes the Logo / Actions.
  const isTabletRange = useBreakpointValue({ base: false, md: true, lg: false }) ?? false
  const isIconOnly = !isMobile && isTabletRange

  const ed = useEd()
  const trackBgBase = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.04)')
  const trackBg = ed ? ed.controlBg : trackBgBase
  const trackBorderBase = useColorModeValue('rgba(226,232,240,0.8)', 'rgba(255,255,255,0.08)')
  const trackBorder = ed ? ed.line : trackBorderBase
  const trackShadowBase = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 6px rgba(15,23,42,0.04)',
    'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 6px rgba(0,0,0,0.2)',
  )
  const editorialTrackShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.74), 0 6px 18px rgba(18,45,36,0.055)',
    'inset 0 1px 0 rgba(255,255,255,0.035), 0 6px 18px rgba(0,0,0,0.20)',
  )
  const trackShadow = ed ? editorialTrackShadow : trackShadowBase
  const inactiveColorBase = useColorModeValue('gray.600', 'gray.300')
  const inactiveColor = ed ? ed.muted : inactiveColorBase
  const hoverColorBase = useColorModeValue('gray.900', 'white')
  const hoverColor = ed ? ed.cream : hoverColorBase
  const activeColorBase = useColorModeValue('blue.700', 'blue.100')
  const activeColor = ed ? ed.jade : activeColorBase
  const indicatorBgBase = useColorModeValue('white', 'rgba(255,255,255,0.14)')
  const indicatorBg = ed ? ed.thumbBg : indicatorBgBase
  const indicatorShadowBase = useColorModeValue(
    '0 1px 4px rgba(15, 23, 42, 0.08), 0 6px 18px rgba(37, 99, 235, 0.20)',
    '0 1px 4px rgba(0,0,0,0.5), 0 6px 20px rgba(96, 165, 250, 0.25)',
  )
  const editorialIndicatorShadow = useColorModeValue(
    '0 1px 3px rgba(18,45,36,0.09), 0 8px 20px rgba(24,81,62,0.10)',
    '0 1px 4px rgba(0,0,0,0.48), 0 8px 20px rgba(0,0,0,0.32)',
  )
  const indicatorShadow = ed ? editorialIndicatorShadow : indicatorShadowBase
  const indicatorRingBase = useColorModeValue(
    'inset 0 0 0 1px rgba(37, 99, 235, 0.20)',
    'inset 0 0 0 1px rgba(96, 165, 250, 0.35)',
  )
  const indicatorRing = ed ? `inset 0 0 0 1px ${ed.lineStrong}` : indicatorRingBase
  // Mobile gets a crisper frame, a jade-tinted active pill and solid chevrons so
  // the carousel reads sharply against the header glass.
  const trackBgMobileBase = useColorModeValue('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.07)')
  const trackBgMobile = ed ? ed.controlBg : trackBgMobileBase
  const trackBorderMobileBase = useColorModeValue('rgba(203,213,225,0.95)', 'rgba(255,255,255,0.16)')
  const trackBorderMobile = ed ? ed.lineStrong : trackBorderMobileBase
  const indicatorBgMobileBase = useColorModeValue('white', 'rgba(255,255,255,0.22)')
  const indicatorBgMobile = ed ? ed.header : indicatorBgMobileBase
  const chevronBgBase = useColorModeValue('rgba(255,255,255,0.96)', 'rgba(18,20,26,0.94)')
  const chevronBg = ed ? ed.glass : chevronBgBase
  const accentBarBase = useColorModeValue(
    'linear-gradient(90deg, #2563eb, #7c3aed)',
    'linear-gradient(90deg, #60a5fa, #a78bfa)',
  )
  const accentBar = ed ? ed.jade : accentBarBase
  const focusShadow = ed
    ? `0 0 0 2px ${ed.bg}, 0 0 0 5px ${ed.jade}`
    : '0 0 0 3px rgba(59, 130, 246, 0.35)'

  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const [indicator, setIndicator] = useState<IndicatorRect>({ left: 0, width: 0, ready: false })
  const indicatorTransition = reducedMotion
    ? 'none'
    : 'left 0.4s cubic-bezier(0.65, 0, 0.35, 1), width 0.4s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.2s ease'
  // Whether the carousel can still scroll further in each direction — drives the
  // edge chevrons that hint there are more pages off-screen.
  const [edges, setEdges] = useState({ start: false, end: false })
  // The chevrons only surface while the user is actively touching/scrolling.
  const [interacting, setInteracting] = useState(false)
  const idleTimer = useRef<number | null>(null)

  const flagInteracting = useCallback(() => {
    setInteracting(true)
    if (idleTimer.current) window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setInteracting(false), 1100)
  }, [])

  useEffect(() => () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current)
  }, [])

  const updateEdges = useCallback(() => {
    const el = containerRef.current
    if (!el || !isMobile) {
      setEdges((prev) => (prev.start || prev.end ? { start: false, end: false } : prev))
      return
    }
    const start = el.scrollLeft > 1
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
  }, [isMobile])

  const measure = useCallback(() => {
    const el = itemRefs.current[activeNavId]
    if (!el) return
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
    if (isMobile) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeNavId, isMobile, reducedMotion])

  const selectTab = useCallback((page: AppPage, button: HTMLButtonElement) => {
    // Measure the clicked button in the scroll track's own coordinate space.
    setIndicator({ left: button.offsetLeft, width: button.offsetWidth, ready: true })
    onPageChange?.(page)
  }, [onPageChange])

  useLayoutEffect(() => {
    measure()
    updateEdges()
  }, [measure, updateEdges, variant, isIconOnly, localizedItems])

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      measure()
      updateEdges()
    })
    ro.observe(containerRef.current)
    Object.values(itemRefs.current).forEach((button) => {
      if (button) ro.observe(button)
    })
    return () => ro.disconnect()
  }, [measure, updateEdges, localizedItems])


  const nudge = (dir: 1 | -1) => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: reducedMotion ? 'auto' : 'smooth' })
    flagInteracting()
  }

  const track = (
    <HStack
      ref={containerRef}
      as="nav"
      role="tablist"
      aria-orientation="horizontal"
      aria-label={t('header.nav.primary')}
      spacing={1}
      p={1}
      borderRadius={isMobile ? '2xl' : 'xl'}
      bg={isMobile ? trackBgMobile : trackBg}
      border="1px solid"
      borderColor={isMobile ? trackBorderMobile : trackBorder}
      backdropFilter={isMobile ? 'blur(16px) saturate(150%)' : 'blur(12px)'}
      boxShadow={trackShadow}
      flexShrink={0}
      w={isMobile ? 'full' : 'auto'}
      maxW="none"
      mx="auto"
      overflowX={isMobile ? 'auto' : 'hidden'}
      overflowY="hidden"
      position="relative"
      onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
        const buttons = localizedItems.map((item) => itemRefs.current[item.id]).filter((button): button is HTMLButtonElement => !!button)
        const index = buttons.indexOf(event.target as HTMLButtonElement)
        if (index < 0 || !buttons.length) return
        event.preventDefault()
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length
        buttons[nextIndex].focus({ preventScroll: true })
        buttons[nextIndex].click()
      }}
      onScroll={
        isMobile
          ? () => {
              updateEdges()
              flagInteracting()
            }
          : undefined
      }
      onPointerDown={isMobile ? flagInteracting : undefined}
      sx={
        isMobile
          ? {
              scrollSnapType: 'x proximity',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              '::-webkit-scrollbar': { display: 'none' },
            }
          : undefined
      }
      {...stackProps}
    >
      {/* Sliding active indicator */}
      <Box
        aria-hidden
        position="absolute"
        top="4px"
        bottom="4px"
        left={`${indicator.left}px`}
        width={`${indicator.width}px`}
        borderRadius={isMobile ? 'full' : 'lg'}
        bg={isMobile ? indicatorBgMobile : indicatorBg}
        boxShadow={`${indicatorShadow}, ${indicatorRing}`}
        opacity={indicator.ready ? 1 : 0}
        transition={indicatorTransition}
        data-nav-indicator="true"
        zIndex={0}
        pointerEvents="none"
      />

      {/* Accent underline anchored to the indicator */}
      <Box
        aria-hidden
        display={isMobile ? 'none' : undefined}
        position="absolute"
        bottom={isMobile ? '6px' : '5px'}
        left={`${indicator.left + indicator.width * 0.28}px`}
        width={`${indicator.width * 0.44}px`}
        h="2px"
        borderRadius="full"
        background={accentBar}
        opacity={indicator.ready ? 0.95 : 0}
        transition={indicatorTransition}
        zIndex={0}
        pointerEvents="none"
      />

      {localizedItems.map((item) => (
        <NavBarItem
          key={item.id}
          item={item}
          isActive={activeNavId === item.id}
          isMobile={isMobile}
          isIconOnly={isIconOnly}
          onSelect={selectTab}
          reducedMotion={!!reducedMotion}
          inactiveColor={inactiveColor}
          hoverColor={hoverColor}
          activeColor={activeColor}
          focusShadow={focusShadow}
          assignRef={(el) => {
            itemRefs.current[item.id] = el
          }}
        />
      ))}
    </HStack>
  )

  if (!isMobile) return track

  return (
    <Box position="relative" w="full">
      {track}

      {/* Edge chevrons — surface only while the user is browsing the carousel
          and only on the side that still has pages to scroll toward. */}
      <Box
        as="button"
        type="button"
        aria-label={t('header.nav.previous')}
        tabIndex={interacting && edges.start ? 0 : -1}
        onClick={() => nudge(-1)}
        position="absolute"
        top="50%"
        left="6px"
        transform={`translateY(-50%) translateX(${interacting && edges.start ? '0' : '-6px'})`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxSize="28px"
        borderRadius="full"
        bg={chevronBg}
        color={hoverColor}
        border="1px solid"
        borderColor={trackBorderMobile}
        boxShadow={indicatorShadow}
        opacity={interacting && edges.start ? 1 : 0}
        transition="opacity 0.2s ease, transform 0.2s ease"
        pointerEvents={interacting && edges.start ? 'auto' : 'none'}
        cursor="pointer"
        zIndex={3}
      >
        <Icon as={ChevronLeft} boxSize="16px" />
      </Box>
      <Box
        as="button"
        type="button"
        aria-label={t('header.nav.more')}
        tabIndex={interacting && edges.end ? 0 : -1}
        onClick={() => nudge(1)}
        position="absolute"
        top="50%"
        right="6px"
        transform={`translateY(-50%) translateX(${interacting && edges.end ? '0' : '6px'})`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxSize="28px"
        borderRadius="full"
        bg={chevronBg}
        color={hoverColor}
        border="1px solid"
        borderColor={trackBorderMobile}
        boxShadow={indicatorShadow}
        opacity={interacting && edges.end ? 1 : 0}
        transition="opacity 0.2s ease, transform 0.2s ease"
        pointerEvents={interacting && edges.end ? 'auto' : 'none'}
        cursor="pointer"
        zIndex={3}
      >
        <Icon as={ChevronRight} boxSize="16px" />
      </Box>
    </Box>
  )
}

interface NavBarItemProps {
  item: NavItem
  isActive: boolean
  isMobile: boolean
  isIconOnly: boolean
  onSelect?: (page: AppPage, button: HTMLButtonElement) => void
  reducedMotion: boolean
  inactiveColor: string
  hoverColor: string
  activeColor: string
  focusShadow: string
  assignRef: (el: HTMLButtonElement | null) => void
}

function NavBarItem({
  item,
  isActive,
  isMobile,
  isIconOnly,
  onSelect,
  reducedMotion,
  inactiveColor,
  hoverColor,
  activeColor,
  focusShadow,
  assignRef,
}: NavBarItemProps) {
  const showLabel = isMobile || !isIconOnly

  const button = (
    <Box
      as="button"
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      aria-label={item.label}
      title={isIconOnly ? undefined : item.description}
      onClick={(event: MouseEvent<HTMLButtonElement>) => onSelect?.(item.id, event.currentTarget)}
      ref={assignRef}
      flex={isMobile ? '0 0 auto' : undefined}
      flexShrink={isMobile ? 0 : undefined}
      px={isMobile ? 3.5 : isIconOnly ? 2.5 : 3.5}
      py={isMobile ? 2.5 : 2}
      minH={isMobile ? '52px' : '40px'}
      minW={isMobile ? '64px' : 0}
      sx={{
        ...(isMobile ? { scrollSnapAlign: 'center' } : {}),
        '--pb-control-transition': `color ${isActive ? '0.28s cubic-bezier(0.65, 0, 0.35, 1) 0.8s' : '0.2s ease'}, transform 0.15s ease`,
      }}
      borderRadius={isMobile ? 'xl' : 'lg'}
      bg="transparent"
      color={isActive ? activeColor : inactiveColor}
      fontWeight={600}
      fontSize={isMobile ? 'xs' : 'sm'}
      letterSpacing={isMobile ? '0.01em' : '0.005em'}
      position="relative"
      zIndex={1}
      cursor="pointer"
      transition={reducedMotion ? 'none' : `color ${isActive ? '0.28s cubic-bezier(0.65, 0, 0.35, 1) 0.8s' : '0.2s ease'}, transform 0.15s ease`}
      _hover={{
        color: isActive ? activeColor : hoverColor,
        transform: isActive ? 'none' : 'translateY(-1px)',
      }}
      _active={{ transform: 'translateY(0)' }}
      _focusVisible={{
        outline: 'none',
        boxShadow: focusShadow,
      }}
    >
      <Flex
        direction={isMobile ? 'column' : 'row'}
        gap={showLabel ? (isMobile ? 1 : 2) : 0}
        justify="center"
        align="center"
        h="full"
      >
        <Icon
          as={item.icon}
          boxSize={isMobile ? 5 : 4}
          transition={reducedMotion ? 'none' : 'transform 0.4s cubic-bezier(0.65, 0, 0.35, 1)'}
          transform={isActive ? 'scale(1.05)' : 'scale(1)'}
          weight={isActive ? 'duotone' : 'regular'}
        />
        {showLabel && (
          <Text as="span" lineHeight="1" whiteSpace="nowrap">
            {isMobile ? item.shortLabel : item.label}
          </Text>
        )}
      </Flex>
    </Box>
  )

  if (isIconOnly) {
    return (
      <Tooltip label={item.label} hasArrow openDelay={250} placement="bottom">
        {button}
      </Tooltip>
    )
  }

  return button
}
