import {
  Box,
  Flex,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  type StackProps,
} from '@chakra-ui/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NAV_ITEMS, type AppPage, type NavItem } from './navigation.config'
import { List } from '../../ui/icons'
import { useEd } from '../../../editorial'

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
  const isMobile = variant === 'mobile'
  const visibleItems = isMobile && items.length > 4 ? items.slice(0, 4) : items
  const overflowItems = isMobile && items.length > 4 ? items.slice(4) : []
  const isOverflowActive = overflowItems.some((item) => item.id === currentPage)
  // Tablet range (md..lg, ~768–991px): collapse desktop nav to icon-only
  // so the top row never squeezes the Logo / Actions.
  const isTabletRange = useBreakpointValue({ base: false, md: true, lg: false }) ?? false
  const isIconOnly = !isMobile && isTabletRange

  const ed = useEd()
  const trackBgBase = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.04)')
  const trackBg = ed ? ed.controlBg : trackBgBase
  const trackBorderBase = useColorModeValue('rgba(226,232,240,0.8)', 'rgba(255,255,255,0.08)')
  const trackBorder = ed ? ed.line : trackBorderBase
  const trackShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 6px rgba(15,23,42,0.04)',
    'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 6px rgba(0,0,0,0.2)',
  )
  const inactiveColorBase = useColorModeValue('gray.600', 'gray.300')
  const inactiveColor = ed ? ed.muted : inactiveColorBase
  const hoverColorBase = useColorModeValue('gray.900', 'white')
  const hoverColor = ed ? ed.cream : hoverColorBase
  const activeColorBase = useColorModeValue('blue.700', 'blue.100')
  const activeColor = ed ? ed.jade : activeColorBase
  const indicatorBgBase = useColorModeValue('white', 'rgba(255,255,255,0.14)')
  const indicatorBg = ed ? ed.thumbBg : indicatorBgBase
  const indicatorShadow = useColorModeValue(
    '0 1px 4px rgba(15, 23, 42, 0.08), 0 6px 18px rgba(37, 99, 235, 0.20)',
    '0 1px 4px rgba(0,0,0,0.5), 0 6px 20px rgba(96, 165, 250, 0.25)',
  )
  const indicatorRingBase = useColorModeValue(
    'inset 0 0 0 1px rgba(37, 99, 235, 0.20)',
    'inset 0 0 0 1px rgba(96, 165, 250, 0.35)',
  )
  const indicatorRing = ed ? 'inset 0 0 0 1px rgba(127, 230, 179, 0.30)' : indicatorRingBase
  const accentBarBase = useColorModeValue(
    'linear-gradient(90deg, #2563eb, #7c3aed)',
    'linear-gradient(90deg, #60a5fa, #a78bfa)',
  )
  const accentBar = ed ? `linear-gradient(90deg, ${ed.jade}, ${ed.gold})` : accentBarBase

  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const moreRef = useRef<HTMLButtonElement | null>(null)

  const [indicator, setIndicator] = useState<IndicatorRect>({ left: 0, width: 0, ready: false })

  const measure = useCallback(() => {
    const el = itemRefs.current[currentPage] ?? (isOverflowActive ? moreRef.current : null)
    if (!el) return
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
    if (isMobile) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [currentPage, isMobile, isOverflowActive])

  useLayoutEffect(() => {
    measure()
  }, [measure, variant, isIconOnly])

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => measure())
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [measure])

  return (
    <HStack
      ref={containerRef}
      as="nav"
      role="tablist"
      aria-label="Primary"
      spacing={isMobile ? 0 : 1}
      p={1}
      borderRadius={isMobile ? '2xl' : 'xl'}
      bg={trackBg}
      border="1px solid"
      borderColor={trackBorder}
      backdropFilter="blur(12px)"
      boxShadow={trackShadow}
      flexShrink={0}
      w={isMobile ? 'full' : 'auto'}
      maxW={isMobile ? '380px' : 'none'}
      mx="auto"
      overflow="hidden"
      position="relative"
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
        borderRadius={isMobile ? 'xl' : 'lg'}
        bg={indicatorBg}
        boxShadow={`${indicatorShadow}, ${indicatorRing}`}
        opacity={indicator.ready ? 1 : 0}
        transition="left 0.35s cubic-bezier(0.32, 0.72, 0, 1), width 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease"
        zIndex={0}
        pointerEvents="none"
      />

      {/* Accent underline anchored to the indicator */}
      <Box
        aria-hidden
        position="absolute"
        bottom={isMobile ? '6px' : '5px'}
        left={`${indicator.left + indicator.width * 0.28}px`}
        width={`${indicator.width * 0.44}px`}
        h="2px"
        borderRadius="full"
        background={accentBar}
        opacity={indicator.ready ? 0.95 : 0}
        transition="left 0.35s cubic-bezier(0.32, 0.72, 0, 1), width 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease"
        zIndex={0}
        pointerEvents="none"
      />

      {visibleItems.map((item) => (
        <NavBarItem
          key={item.id}
          item={item}
          isActive={currentPage === item.id}
          isMobile={isMobile}
          isIconOnly={isIconOnly}
          onSelect={onPageChange}
          inactiveColor={inactiveColor}
          hoverColor={hoverColor}
          activeColor={activeColor}
          assignRef={(el) => {
            itemRefs.current[item.id] = el
          }}
        />
      ))}

      {overflowItems.length > 0 && (
        <Menu placement="bottom-end" isLazy>
          <MenuButton
            ref={moreRef}
            type="button"
            role="tab"
            aria-selected={isOverflowActive}
            aria-label="More pages"
            flex={1}
            px={1.5}
            py={2}
            minH="52px"
            minW={0}
            borderRadius="xl"
            bg="transparent"
            color={isOverflowActive ? activeColor : inactiveColor}
            fontWeight={isOverflowActive ? 700 : 600}
            fontSize="2xs"
            position="relative"
            zIndex={1}
            transition="color 0.2s ease, transform 0.15s ease"
            _hover={{ color: isOverflowActive ? activeColor : hoverColor }}
            _focusVisible={{
              outline: 'none',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)',
            }}
          >
            <Flex direction="column" align="center" justify="center" gap={1}>
              <List
                size={18}
                weight={isOverflowActive ? 'duotone' : 'regular'}
                aria-hidden
              />
              <Text as="span" lineHeight="1" whiteSpace="nowrap">More</Text>
            </Flex>
          </MenuButton>
          <Portal>
            <MenuList zIndex={2000} minW="220px" p={2} borderRadius="xl">
              {overflowItems.map((item) => {
                const ItemIcon = item.icon

                return (
                  <MenuItem
                    key={item.id}
                    icon={
                      <ItemIcon
                        size={18}
                        weight={currentPage === item.id ? 'duotone' : 'regular'}
                        aria-hidden
                      />
                    }
                    borderRadius="lg"
                    fontWeight={currentPage === item.id ? 700 : 500}
                    color={currentPage === item.id ? activeColor : undefined}
                    onClick={() => onPageChange?.(item.id)}
                  >
                    {item.label}
                  </MenuItem>
                )
              })}
            </MenuList>
          </Portal>
        </Menu>
      )}
    </HStack>
  )
}

interface NavBarItemProps {
  item: NavItem
  isActive: boolean
  isMobile: boolean
  isIconOnly: boolean
  onSelect?: (page: AppPage) => void
  inactiveColor: string
  hoverColor: string
  activeColor: string
  assignRef: (el: HTMLButtonElement | null) => void
}

function NavBarItem({
  item,
  isActive,
  isMobile,
  isIconOnly,
  onSelect,
  inactiveColor,
  hoverColor,
  activeColor,
  assignRef,
}: NavBarItemProps) {
  const showLabel = isMobile || !isIconOnly

  const button = (
    <Box
      as="button"
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={item.label}
      title={isIconOnly ? undefined : item.description}
      onClick={() => onSelect?.(item.id)}
      ref={assignRef as unknown as React.Ref<HTMLDivElement>}
      flex={isMobile ? 1 : undefined}
      flexShrink={isMobile ? 1 : undefined}
      px={isMobile ? 1.5 : isIconOnly ? 2.5 : 3.5}
      py={isMobile ? 2.5 : 2}
      minH={isMobile ? '52px' : '40px'}
      minW={0}
      borderRadius={isMobile ? 'xl' : 'lg'}
      bg="transparent"
      color={isActive ? activeColor : inactiveColor}
      fontWeight={isActive ? 700 : 600}
      fontSize={isMobile ? '2xs' : 'sm'}
      letterSpacing="0.005em"
      position="relative"
      zIndex={1}
      cursor="pointer"
      transition="color 0.2s ease, transform 0.15s ease"
      _hover={{
        color: isActive ? activeColor : hoverColor,
        transform: isActive ? 'none' : 'translateY(-1px)',
      }}
      _active={{ transform: 'translateY(0)' }}
      _focusVisible={{
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)',
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
          boxSize={4}
          transition="transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)"
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
