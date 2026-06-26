import {
  Avatar,
  Box,
  Flex,
  Icon,
  IconButton,
  Text,
  Tooltip,
  VStack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useEd } from '../../editorial'
import {
  CaretDoubleLeft,
  SidebarSimple,
} from '../ui/icons'
import { navItemIdFor, type AppPage, type NavItem } from './header/navigation.config'
import Logo from './header/Logo'

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

export const SIDEBAR_EXPANDED_W = 244
export const SIDEBAR_COLLAPSED_W = 72
const TRANSITION = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'

const NAVIGATION_GROUPS: ReadonlyArray<{
  label: string
  itemIds: ReadonlyArray<AppPage>
}> = [
  {
    label: 'General view',
    itemIds: ['dashboard', 'behaviour', 'payments', 'accounts', 'cards', 'all-transactions'],
  },
  {
    label: 'Planning',
    itemIds: ['planning', 'commitments', 'transfers', 'goals'],
  },
  {
    label: 'Reports',
    itemIds: ['reports'],
  },
]

function groupNavigationItems(items: ReadonlyArray<NavItem>) {
  const groupedIds = new Set(NAVIGATION_GROUPS.flatMap((group) => group.itemIds))
  const groups = NAVIGATION_GROUPS
    .map((group) => ({
      label: group.label,
      items: group.itemIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is NavItem => Boolean(item)),
    }))
    .filter((group) => group.items.length > 0)

  const ungroupedItems = items.filter((item) => !groupedIds.has(item.id))
  return ungroupedItems.length > 0
    ? [...groups, { label: 'Administration', items: ungroupedItems }]
    : groups
}

/* -------------------------------------------------------------------------- */
/* Sidebar component                                                           */
/* -------------------------------------------------------------------------- */

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  currentPage: AppPage
  onPageChange?: (page: AppPage) => void
  items: ReadonlyArray<NavItem>
}

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  currentPage,
  onPageChange,
  items,
}: SidebarProps) {
  const { user } = useAuth()
  const ed = useEd()
  const { colorMode } = useColorMode()
  // In editorial light the sidebar shares the page colour (opaque glass), so it
  // must read as one continuous surface: no raised-panel shadow, no backdrop blur.
  const isEdLight = !!ed && colorMode === 'light'
  const navigationGroups = groupNavigationItems(items)

  /* ---- Surface tokens ---- */
  const surfaceBase = useColorModeValue(
    'rgba(255, 255, 255, 0.80)',
    'rgba(12, 12, 14, 0.82)',
  )
  const surface = ed ? ed.glass : surfaceBase
  const borderRightBase = useColorModeValue(
    'rgba(15, 23, 42, 0.06)',
    'rgba(255, 255, 255, 0.04)',
  )
  const borderRight = ed ? ed.line : borderRightBase
  const surfaceShadowBase = useColorModeValue(
    '8px 0 32px -24px rgba(15,23,42,0.18)',
    '8px 0 32px -24px rgba(0,0,0,0.65)',
  )
  const editorialSurfaceShadow = useColorModeValue(
    // Light: flush with the page — no shadow so the sidebar isn't a raised panel.
    'none',
    '10px 0 38px -24px rgba(0,0,0,0.72)',
  )
  const surfaceShadow = ed ? editorialSurfaceShadow : surfaceShadowBase
  const sectionLabelBase = useColorModeValue('gray.400', 'gray.600')
  const sectionLabel = ed ? ed.muted : sectionLabelBase
  const sectionDividerBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const sectionDivider = ed ? ed.line : sectionDividerBase
  const sidebarWash = ed
    ? `linear-gradient(180deg, ${ed.glass} 0%, ${ed.bg} 100%)`
    : undefined

  /* ---- Active-indicator position ---- */
  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicator, setIndicator] = useState({ top: 0, height: 0, ready: false })

  const measure = useCallback(() => {
    const el = itemRefs.current[navItemIdFor(currentPage)]
    const container = containerRef.current
    if (!el || !container) return
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    setIndicator({
      top: eRect.top - cRect.top,
      height: eRect.height,
      ready: true,
    })
  }, [currentPage])

  useLayoutEffect(() => {
    measure()
  }, [measure, isCollapsed])

  // Re-measure on window resize
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => measure())
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [measure])

  const width = isCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W

  return (
    <Box
      as="aside"
      aria-label="Sidebar navigation"
      position="fixed"
      top={0}
      left={0}
      bottom={0}
      w={`${width}px`}
      bg={surface}
      backgroundImage={isEdLight ? undefined : sidebarWash}
      backdropFilter={isEdLight ? 'none' : 'saturate(180%) blur(20px)'}
      borderRight="1px solid"
      borderRightColor={borderRight}
      boxShadow={surfaceShadow}
      zIndex={1100}
      display="flex"
      flexDirection="column"
      transition={TRANSITION}
      overflowX="hidden"
      overflowY="auto"
      sx={{
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      {/* ─── Top: Branding + collapse toggle ─── */}
      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggle={onToggleCollapse}
        onPageChange={onPageChange}
      />

      {/* ─── Navigation ─── */}
      <Box ref={containerRef} position="relative" px={2} pt={4} pb={3} flex={1}>
        {/* Sliding active indicator */}
        <ActiveIndicator
          top={indicator.top}
          height={indicator.height}
          ready={indicator.ready}
          isCollapsed={isCollapsed}
        />

        <VStack spacing={0} align="stretch">
          {navigationGroups.map((group, groupIndex) => (
            <Box key={group.label} w="full">
              {groupIndex > 0 && (
                <Box
                  h="1px"
                  mx={isCollapsed ? 2 : 3}
                  my={isCollapsed ? 3 : 4}
                  bg={sectionDivider}
                  transition={TRANSITION}
                />
              )}
              {!isCollapsed && (
                <Text
                  fontSize="2xs"
                  fontWeight={700}
                  color={sectionLabel}
                  textTransform="uppercase"
                  letterSpacing="0.1em"
                  px={3}
                  pb={2}
                  transition={TRANSITION}
                >
                  {group.label}
                </Text>
              )}
              <VStack spacing={0.5} align="stretch">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    isActive={navItemIdFor(currentPage) === item.id}
                    isCollapsed={isCollapsed}
                    onSelect={onPageChange}
                    assignRef={(el) => { itemRefs.current[item.id] = el }}
                  />
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* ─── Bottom: User card ─── */}
      <SidebarFooter isCollapsed={isCollapsed} user={user} />
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

function SidebarHeader({
  isCollapsed,
  onToggle,
  onPageChange,
}: {
  isCollapsed: boolean
  onToggle: () => void
  onPageChange?: (page: AppPage) => void
}) {
  const ed = useEd()
  const textColorBase = useColorModeValue('gray.900', 'whiteAlpha.900')
  const textColor = ed ? ed.cream : textColorBase
  const toggleBgBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const toggleBg = ed ? ed.line : toggleBgBase
  const toggleHoverBgBase = useColorModeValue('gray.200', 'whiteAlpha.200')
  const toggleHoverBg = ed ? ed.lineStrong : toggleHoverBgBase
  const toggleColorBase = useColorModeValue('gray.600', 'gray.400')
  const toggleColor = ed ? ed.muted : toggleColorBase
  const dividerBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const divider = ed ? ed.line : dividerBase

  return (
    <Box
      px={isCollapsed ? 2 : 4}
      py={4}
      borderBottom="1px solid"
      borderBottomColor={divider}
      transition={TRANSITION}
    >
      {isCollapsed ? (
        <Flex justify="center">
          <Tooltip label="Expand sidebar" hasArrow placement="right" openDelay={200}>
            <IconButton
              aria-label="Expand sidebar"
              icon={<Icon as={SidebarSimple} weight="duotone" boxSize={5} />}
              size="sm"
              variant="ghost"
              color={toggleColor}
              bg={toggleBg}
              borderRadius="lg"
              h="36px"
              w="36px"
              minW="36px"
              _hover={{ bg: toggleHoverBg, color: textColor }}
              transition={TRANSITION}
              onClick={onToggle}
            />
          </Tooltip>
        </Flex>
      ) : (
        <Flex align="center" justify="space-between" gap={2}>
          {/* Brand lockup — same logo as the marketing header, sized for the rail */}
          <Box minW={0}>
            <Logo compact onClick={() => onPageChange?.('dashboard')} />
          </Box>

          <Tooltip label="Collapse sidebar" hasArrow placement="right" openDelay={400}>
            <IconButton
              aria-label="Collapse sidebar"
              icon={<Icon as={CaretDoubleLeft} weight="bold" boxSize={3.5} />}
              size="xs"
              variant="ghost"
              color={toggleColor}
              bg={toggleBg}
              borderRadius="md"
              h="26px"
              w="26px"
              minW="26px"
              flexShrink={0}
              _hover={{ bg: toggleHoverBg, color: textColor }}
              transition={TRANSITION}
              onClick={onToggle}
            />
          </Tooltip>
        </Flex>
      )}
    </Box>
  )
}

/* ---- Active-indicator pill ---- */

function ActiveIndicator({
  top,
  height,
  ready,
  isCollapsed,
}: {
  top: number
  height: number
  ready: boolean
  isCollapsed: boolean
}) {
  const ed = useEd()
  const indicatorBgBase = useColorModeValue(
    'rgba(37, 99, 235, 0.08)',
    'rgba(125, 211, 252, 0.12)',
  )
  const indicatorBg = ed ? ed.jadeSoft : indicatorBgBase
  const accentBarBase = useColorModeValue(
    'linear-gradient(180deg, #2563eb, #c18b35)',
    'linear-gradient(180deg, #7dd3fc, #e8c477)',
  )
  const accentBar = ed
    ? `linear-gradient(180deg, ${ed.jade}, ${ed.gold})`
    : accentBarBase

  return (
    <>
      {/* Background pill */}
      <Box
        aria-hidden
        position="absolute"
        left="8px"
        right="8px"
        top={`${top}px`}
        h={`${height}px`}
        borderRadius="xl"
        bg={indicatorBg}
        opacity={ready ? 1 : 0}
        transition={`top 0.35s cubic-bezier(0.32, 0.72, 0, 1), height 0.25s ease, opacity 0.2s ease`}
        pointerEvents="none"
        zIndex={0}
      />
      {/* Left accent bar */}
      <Box
        aria-hidden
        position="absolute"
        left={isCollapsed ? '6px' : '8px'}
        top={`${top + height * 0.2}px`}
        h={`${height * 0.6}px`}
        w="3px"
        borderRadius="full"
        background={accentBar}
        opacity={ready ? 1 : 0}
        transition={`top 0.35s cubic-bezier(0.32, 0.72, 0, 1), height 0.25s ease, opacity 0.2s ease`}
        pointerEvents="none"
        zIndex={2}
      />
    </>
  )
}

/* ---- Single nav item ---- */

interface SidebarItemProps {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
  onSelect?: (page: AppPage) => void
  assignRef: (el: HTMLButtonElement | null) => void
}

function SidebarItem({
  item,
  isActive,
  isCollapsed,
  onSelect,
  assignRef,
}: SidebarItemProps) {
  const ed = useEd()
  const inactiveColorBase = useColorModeValue('gray.600', 'gray.400')
  const inactiveColor = ed ? ed.muted : inactiveColorBase
  const hoverColorBase = useColorModeValue('gray.900', 'white')
  const hoverColor = ed ? ed.cream : hoverColorBase
  const activeColorBase = useColorModeValue('blue.700', 'blue.200')
  const activeColor = ed ? ed.jade : activeColorBase
  const hoverBgBase = useColorModeValue('blackAlpha.50', 'whiteAlpha.50')
  const hoverBg = ed ? ed.panelRaised : hoverBgBase

  const button = (
    <Box
      as="button"
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={item.label}
      ref={assignRef as unknown as React.Ref<HTMLDivElement>}
      onClick={() => onSelect?.(item.id)}
      display="flex"
      alignItems="center"
      gap={3}
      w="full"
      px={isCollapsed ? 0 : 3}
      py={2.5}
      minH="44px"
      borderRadius="xl"
      bg="transparent"
      color={isActive ? activeColor : inactiveColor}
      fontWeight={isActive ? 700 : 500}
      fontSize="sm"
      cursor="pointer"
      position="relative"
      zIndex={1}
      justifyContent={isCollapsed ? 'center' : 'flex-start'}
      transition="color 0.2s ease, transform 0.15s ease"
      _hover={{
        color: isActive ? activeColor : hoverColor,
        bg: isActive ? 'transparent' : hoverBg,
        transform: isActive ? 'none' : 'translateX(2px)',
      }}
      _active={{ transform: 'translateX(0)' }}
      _focusVisible={{
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)',
      }}
    >
      <Icon
        as={item.icon}
        boxSize={5}
        flexShrink={0}
        weight={isActive ? 'duotone' : 'regular'}
        transition="transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)"
        transform={isActive ? 'scale(1.08)' : 'scale(1)'}
      />
      {!isCollapsed && (
        <Text
          as="span"
          lineHeight={1}
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          opacity={1}
          transition="opacity 0.2s ease"
        >
          {item.label}
        </Text>
      )}
    </Box>
  )

  if (isCollapsed) {
    return (
      <Tooltip label={item.label} hasArrow placement="right" openDelay={200}>
        {button}
      </Tooltip>
    )
  }
  return button
}

/* ---- Footer: minimal user info ---- */

function SidebarFooter({
  isCollapsed,
  user,
}: {
  isCollapsed: boolean
  user: any
}) {
  const ed = useEd()
  const dividerBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const divider = ed ? ed.line : dividerBase
  const textColorBase = useColorModeValue('gray.800', 'whiteAlpha.900')
  const textColor = ed ? ed.cream : textColorBase
  const subColorBase = useColorModeValue('gray.500', 'gray.500')
  const subColor = ed ? ed.muted : subColorBase
  const avatarRingBase = useColorModeValue(
    'linear-gradient(135deg, #2563eb, #c18b35)',
    'linear-gradient(135deg, #7dd3fc, #e8c477)',
  )
  const avatarRing = ed
    ? `linear-gradient(135deg, ${ed.jade}, ${ed.gold})`
    : avatarRingBase
  const statusDotBgBase = useColorModeValue('green.400', 'green.300')
  const statusDotBg = ed ? ed.jade : statusDotBgBase
  const statusDotRingBase = useColorModeValue('white', 'gray.900')
  const statusDotRing = ed ? ed.bg : statusDotRingBase

  const displayName = user?.name || 'User'
  const displayEmail = user?.email || ''

  return (
    <Box
      px={isCollapsed ? 2 : 4}
      py={4}
      borderTop="1px solid"
      borderTopColor={divider}
      transition={TRANSITION}
    >
      <Flex
        align="center"
        justify={isCollapsed ? 'center' : 'flex-start'}
        gap={3}
        overflow="hidden"
      >
        <Box
          position="relative"
          p="2px"
          borderRadius="full"
          background={avatarRing}
          flexShrink={0}
        >
          <Avatar
            size="sm"
            name={displayName}
            bg={ed ? ed.bg2 : 'blue.500'}
            color={ed ? ed.jade : 'white'}
            fontWeight={700}
          />
          <Box
            aria-hidden
            position="absolute"
            bottom="0px"
            right="0px"
            w="10px"
            h="10px"
            borderRadius="full"
            bg={statusDotBg}
            border="2px solid"
            borderColor={statusDotRing}
          />
        </Box>

        {!isCollapsed && (
          <VStack spacing={0} align="start" minW={0} flex={1}>
            <Text
              fontSize="sm"
              fontWeight={700}
              color={textColor}
              letterSpacing="-0.01em"
              noOfLines={1}
              w="full"
            >
              {displayName.split(' ')[0]}
            </Text>
            {displayEmail && (
              <Text
                fontSize="2xs"
                color={subColor}
                noOfLines={1}
                w="full"
              >
                {displayEmail}
              </Text>
            )}
          </VStack>
        )}
      </Flex>
    </Box>
  )
}
