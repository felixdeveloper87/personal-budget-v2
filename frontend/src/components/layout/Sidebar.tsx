import {
  Avatar,
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  CaretDoubleLeft,
  SidebarSimple,
  type LucideIcon,
} from '../ui/icons'
import type { AppPage, NavItem } from './header/navigation.config'

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

export const SIDEBAR_EXPANDED_W = 244
export const SIDEBAR_COLLAPSED_W = 72
const TRANSITION = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'

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

  /* ---- Surface tokens ---- */
  const surface = useColorModeValue(
    'rgba(255, 255, 255, 0.80)',
    'rgba(12, 12, 14, 0.82)',
  )
  const borderRight = useColorModeValue(
    'rgba(15, 23, 42, 0.06)',
    'rgba(255, 255, 255, 0.04)',
  )
  const sectionLabel = useColorModeValue('gray.400', 'gray.600')

  /* ---- Active-indicator position ---- */
  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicator, setIndicator] = useState({ top: 0, height: 0, ready: false })

  const measure = useCallback(() => {
    const el = itemRefs.current[currentPage]
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
      backdropFilter="saturate(180%) blur(20px)"
      borderRight="1px solid"
      borderRightColor={borderRight}
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
      <SidebarHeader isCollapsed={isCollapsed} onToggle={onToggleCollapse} />

      {/* ─── Navigation ─── */}
      <Box ref={containerRef} position="relative" px={2} pt={2} flex={1}>
        {/* Sliding active indicator */}
        <ActiveIndicator
          top={indicator.top}
          height={indicator.height}
          ready={indicator.ready}
          isCollapsed={isCollapsed}
        />

        {/* Section label */}
        {!isCollapsed && (
          <Text
            fontSize="2xs"
            fontWeight={700}
            color={sectionLabel}
            textTransform="uppercase"
            letterSpacing="0.08em"
            px={3}
            pt={1}
            pb={2}
            transition={TRANSITION}
          >
            Menu
          </Text>
        )}
        {isCollapsed && <Box h={4} />}

        <VStack spacing={0.5} align="stretch">
          {items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={currentPage === item.id}
              isCollapsed={isCollapsed}
              onSelect={onPageChange}
              assignRef={(el) => { itemRefs.current[item.id] = el }}
            />
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
}: {
  isCollapsed: boolean
  onToggle: () => void
}) {
  const textColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const brandAccent = useColorModeValue('#2563eb', '#60a5fa')
  const toggleBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const toggleHoverBg = useColorModeValue('gray.200', 'whiteAlpha.200')
  const toggleColor = useColorModeValue('gray.600', 'gray.400')
  const divider = useColorModeValue('gray.100', 'whiteAlpha.100')

  return (
    <Box
      px={isCollapsed ? 2 : 4}
      py={4}
      borderBottom="1px solid"
      borderBottomColor={divider}
      transition={TRANSITION}
    >
      <Flex align="center" justify={isCollapsed ? 'center' : 'space-between'}>
        {/* Mini brand mark */}
        <HStack spacing={3} overflow="hidden">
          <Flex
            w="36px"
            h="36px"
            align="center"
            justify="center"
            borderRadius="xl"
            bg={`linear-gradient(135deg, ${brandAccent}, #7c3aed)`}
            flexShrink={0}
            boxShadow={`0 4px 12px ${brandAccent}44`}
          >
            <Text fontSize="md" fontWeight={800} color="white" lineHeight={1}>
              £
            </Text>
          </Flex>
          {!isCollapsed && (
            <VStack spacing={0} align="start" minW={0}>
              <Text
                fontSize="sm"
                fontWeight={800}
                color={textColor}
                letterSpacing="-0.02em"
                lineHeight={1.1}
                whiteSpace="nowrap"
              >
                Personal Budget
              </Text>
              <Text
                fontSize="2xs"
                fontWeight={600}
                color={brandAccent}
                letterSpacing="0.02em"
                lineHeight={1.2}
              >
                Dashboard
              </Text>
            </VStack>
          )}
        </HStack>

        {/* Collapse/Expand toggle */}
        {!isCollapsed && (
          <Tooltip label="Collapse sidebar" hasArrow placement="right" openDelay={400}>
            <IconButton
              aria-label="Collapse sidebar"
              icon={<Icon as={CaretDoubleLeft} weight="bold" boxSize={4} />}
              size="sm"
              variant="ghost"
              color={toggleColor}
              bg={toggleBg}
              borderRadius="lg"
              h="32px"
              w="32px"
              minW="32px"
              _hover={{ bg: toggleHoverBg, color: textColor }}
              transition={TRANSITION}
              onClick={onToggle}
            />
          </Tooltip>
        )}
      </Flex>

      {/* Expand trigger when collapsed */}
      {isCollapsed && (
        <Flex justify="center" pt={3}>
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
  const indicatorBg = useColorModeValue(
    'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.06) 100%)',
    'linear-gradient(135deg, rgba(96, 165, 250, 0.12) 0%, rgba(167, 139, 250, 0.08) 100%)',
  )
  const accentBar = useColorModeValue(
    'linear-gradient(180deg, #2563eb, #7c3aed)',
    'linear-gradient(180deg, #60a5fa, #a78bfa)',
  )

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
  const inactiveColor = useColorModeValue('gray.600', 'gray.400')
  const hoverColor = useColorModeValue('gray.900', 'white')
  const activeColor = useColorModeValue('blue.700', 'blue.200')
  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50')

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
  const divider = useColorModeValue('gray.100', 'whiteAlpha.100')
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900')
  const subColor = useColorModeValue('gray.500', 'gray.500')
  const avatarRing = useColorModeValue(
    'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    'linear-gradient(135deg, #60a5fa, #a78bfa)',
  )
  const statusDotBg = useColorModeValue('green.400', 'green.300')
  const statusDotRing = useColorModeValue('white', 'gray.900')

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
            bg="blue.500"
            color="white"
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
