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
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useEd } from '../../editorial'
import { guilloche } from '../../features/dashboard/components/guilloche'
import {
  CaretDoubleLeft,
  SidebarSimple,
} from '../ui/icons'
import { navItemIdFor, type AppPage, type NavItem } from './header/navigation.config'
import { HEADER_HEIGHT } from './header/Header'

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

  /* ---- Surface tokens (glass stays tied to the editorial palette so the
         rail sits flush with the page in light mode) ---- */
  const surfaceBase = useColorModeValue(
    'rgba(255, 255, 255, 0.80)',
    'rgba(12, 12, 14, 0.82)',
  )
  const surface = ed ? ed.glass : surfaceBase
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
      borderRight="1px solid var(--pb-hair)"
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
                  bg="var(--pb-hair)"
                  transition={TRANSITION}
                />
              )}
              {!isCollapsed && (
                <Text
                  fontFamily="var(--pb-mono)"
                  fontSize="9.5px"
                  fontWeight={500}
                  color="var(--pb-ink-faint)"
                  textTransform="uppercase"
                  letterSpacing="0.2em"
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

/** Editorial brand lockup: engraved mini seal + serif wordmark + mono tagline. */
function SidebarBrand({ onClick }: { onClick?: () => void }) {
  const ring1 = useMemo(() => guilloche(58, 19, 62), [])
  const ring2 = useMemo(() => guilloche(58, 27, 44), [])

  return (
    <Flex
      as="button"
      type="button"
      aria-label="Personal Budget — go to dashboard"
      onClick={onClick}
      align="center"
      gap={2.5}
      minW={0}
      cursor="pointer"
      role="group"
      textAlign="left"
      _focusVisible={{ outline: 'none', boxShadow: '0 0 0 2px var(--pb-forest)', borderRadius: '10px' }}
    >
      <Box
        as="svg"
        viewBox="-108 -108 216 216"
        w="38px"
        h="38px"
        flexShrink={0}
        aria-hidden
        transition="transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)"
        _groupHover={{ transform: 'rotate(18deg)' }}
      >
        <circle r="102" fill="none" stroke="var(--pb-hair-2)" strokeWidth="4" />
        <path d={ring1} fill="none" stroke="var(--pb-forest)" strokeWidth="1.6" strokeOpacity="0.6" />
        <path d={ring2} fill="none" stroke="var(--pb-gold-2)" strokeWidth="1.6" strokeOpacity="0.55" />
      </Box>

      <VStack align="flex-start" spacing="1px" minW={0}>
        <Text
          fontFamily="var(--pb-serif)"
          fontSize="md"
          fontWeight={500}
          letterSpacing="-0.01em"
          color="var(--pb-ink)"
          lineHeight={1.1}
          noOfLines={1}
        >
          Personal{' '}
          <Text as="em" color="var(--pb-forest)" fontWeight={500}>
            Budget
          </Text>
        </Text>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="8px"
          letterSpacing="0.26em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
          noOfLines={1}
        >
          Clarity for money
        </Text>
      </VStack>
    </Flex>
  )
}

function SidebarHeader({
  isCollapsed,
  onToggle,
  onPageChange,
}: {
  isCollapsed: boolean
  onToggle: () => void
  onPageChange?: (page: AppPage) => void
}) {
  const toggleStyles = {
    color: 'var(--pb-ink-faint)',
    bg: 'transparent',
    border: '1px solid var(--pb-hair)',
    _hover: { bg: 'var(--pb-tint-green)', color: 'var(--pb-ink)', borderColor: 'var(--pb-hair-2)' },
  } as const

  return (
    <Box
      px={isCollapsed ? 2 : 4}
      h={HEADER_HEIGHT}
      flexShrink={0}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      borderBottom="1px solid var(--pb-hair)"
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
              borderRadius="full"
              h="36px"
              w="36px"
              minW="36px"
              transition={TRANSITION}
              onClick={onToggle}
              {...toggleStyles}
            />
          </Tooltip>
        </Flex>
      ) : (
        <Flex align="center" justify="space-between" gap={2}>
          <Box minW={0}>
            <SidebarBrand onClick={() => onPageChange?.('dashboard')} />
          </Box>

          <Tooltip label="Collapse sidebar" hasArrow placement="right" openDelay={400}>
            <IconButton
              aria-label="Collapse sidebar"
              icon={<Icon as={CaretDoubleLeft} weight="bold" boxSize={3.5} />}
              size="xs"
              variant="ghost"
              borderRadius="full"
              h="26px"
              w="26px"
              minW="26px"
              flexShrink={0}
              transition={TRANSITION}
              onClick={onToggle}
              {...toggleStyles}
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
        borderRadius="12px"
        bg="var(--pb-tint-green)"
        border="1px solid var(--pb-hair)"
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
        top={`${top + height * 0.22}px`}
        h={`${height * 0.56}px`}
        w="3px"
        borderRadius="full"
        background="linear-gradient(180deg, var(--pb-forest), var(--pb-gold-2))"
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
      borderRadius="12px"
      bg="transparent"
      color={isActive ? 'var(--pb-forest)' : 'var(--pb-ink-soft)'}
      fontFamily="var(--pb-serif)"
      fontWeight={isActive ? 600 : 400}
      fontSize="0.95rem"
      letterSpacing="0.01em"
      cursor="pointer"
      position="relative"
      zIndex={1}
      justifyContent={isCollapsed ? 'center' : 'flex-start'}
      transition="color 0.2s ease, transform 0.15s ease"
      _hover={{
        color: isActive ? 'var(--pb-forest)' : 'var(--pb-ink)',
        bg: isActive ? 'transparent' : 'var(--pb-tint-green)',
        transform: isActive ? 'none' : 'translateX(2px)',
      }}
      _active={{ transform: 'translateX(0)' }}
      _focusVisible={{
        outline: 'none',
        boxShadow: '0 0 0 2px var(--pb-forest)',
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
  const displayName = user?.name || 'User'
  const displayEmail = user?.email || ''

  return (
    <Box
      px={isCollapsed ? 2 : 4}
      py={4}
      borderTop="1px solid var(--pb-hair)"
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
          border="1px solid var(--pb-hair-2)"
          flexShrink={0}
        >
          <Avatar
            size="sm"
            name={displayName}
            bg="var(--pb-tint-green)"
            color="var(--pb-forest)"
            fontWeight={600}
            fontFamily="var(--pb-serif)"
          />
          <Box
            aria-hidden
            position="absolute"
            bottom="0px"
            right="0px"
            w="9px"
            h="9px"
            borderRadius="full"
            bg="var(--pb-income-2)"
            border="2px solid var(--pb-paper)"
          />
        </Box>

        {!isCollapsed && (
          <VStack spacing="1px" align="start" minW={0} flex={1}>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="sm"
              fontWeight={600}
              color="var(--pb-ink)"
              letterSpacing="-0.01em"
              noOfLines={1}
              w="full"
            >
              {displayName.split(' ')[0]}
            </Text>
            {displayEmail && (
              <Text
                fontFamily="var(--pb-mono)"
                fontSize="9px"
                letterSpacing="0.03em"
                color="var(--pb-ink-faint)"
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
