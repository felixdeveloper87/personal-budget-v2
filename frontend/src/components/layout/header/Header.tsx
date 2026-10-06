import { Box, Container, Flex, HStack, Text, useBreakpointValue, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'
import SpotlightSearch from '../../search/SpotlightSearch'
import HeaderActions from './HeaderActions'
import LandingNav from './LandingNav'
import Logo from './Logo'
import MobileNav from './MobileNav'
import NavBar from './NavBar'
import UserMenu from './UserMenu'
import { ON_BRAND, OnBrandContext } from './onBrand'
import SearchTrigger from './SearchTrigger'
import type { AppPage } from './navigation.config'
import { ADMIN_NAV_ITEM, NAV_ITEMS } from './navigation.config'

/** Chrome bar height — shared so the sidebar's brand block lines up with the
 * header's bottom edge (their dividers sit on the same baseline). */
export const HEADER_HEIGHT = { base: '72px', md: '64px' } as const
export const MOBILE_NAV_SAFE_HEIGHT = 'calc(70px + max(8px, env(safe-area-inset-bottom, 0px)))'

interface HeaderProps {
  onOpenProfile?: () => void
  onOpenSettings?: () => void
  onLogin?: () => void
  currentPage?: AppPage
  onPageChange?: (page: AppPage) => void
  /** When true the desktop NavBar is hidden (sidebar handles navigation). */
  hasSidebar?: boolean
}

export default function Header({
  onOpenProfile,
  onOpenSettings,
  onLogin,
  currentPage = 'dashboard',
  onPageChange,
  hasSidebar = false,
}: HeaderProps) {
  const { user, logout } = useAuth()
  const ed = useEd()
  const { t } = useI18n()
  const navItems = useMemo(
    () => (user?.admin ? [ADMIN_NAV_ITEM] : NAV_ITEMS),
    [user?.admin]
  )
  const isAdminOnly = Boolean(user?.admin)
  const { isOpen: isSearchOpen, onOpen: openSearch, onClose: closeSearch } = useDisclosure()
  const [isScrolled, setIsScrolled] = useState(false)

  // When the sidebar owns the brand, the header leads with the search bar on the
  // left instead of repeating the logo. Mobile/admin keep the logo + right search.
  const searchOnLeft = Boolean(user) && hasSidebar && !isAdminOnly
  const showExpandedSearch = useBreakpointValue({ base: false, lg: true }) ?? false

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cmd/Ctrl+K to open search (not for admin-only accounts)
  useEffect(() => {
    if (!user || isAdminOnly) return
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac')
      const mod = isMac ? e.metaKey : e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [user, isAdminOnly, openSearch])

  // On the landing page (no user), the header is transparent at the top so it
  // visually merges with the hero. Once scrolled it transitions to frosted glass.
  const isLanding = !user
  const showGlass = isScrolled || !isLanding
  // Align the desktop toolbar with the content column. Its matte surface stays
  // opaque while scrolling so text beneath it never competes with the controls.
  const pageIntegrated = Boolean(user && hasSidebar && ed)

  const bgBase = useColorModeValue(
    showGlass ? (isScrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.62)') : 'transparent',
    showGlass ? (isScrolled ? 'rgba(10,10,12,0.78)'    : 'rgba(10,10,12,0.55)')    : 'transparent',
  )
  // Logged-in shell: a solid purple app bar that flows into the dashboard hero.
  const onBrand = Boolean(user)
  const bg = onBrand ? ON_BRAND.bg : ed ? ed.header : bgBase
  const hour = new Date().getHours()
  const firstName = typeof user?.name === 'string' ? user.name.trim().split(/\s+/)[0] : ''
  const greeting = `${t(hour < 12 ? 'dashboard.goodMorning' : hour < 18 ? 'dashboard.goodAfternoon' : 'dashboard.goodEvening')}${firstName ? `, ${firstName}` : ''}`
  const bgOverlayVal = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)',
    'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)',
  )
  const bgOverlay = ed ? 'transparent' : (showGlass ? bgOverlayVal : 'transparent')
  const topHighlightVal = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0))',
    'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0))',
  )
  const topHighlight = ed ? 'transparent' : (showGlass ? topHighlightVal : 'transparent')
  const accentBorderBase = useColorModeValue(
    'linear-gradient(90deg, transparent 0%, rgba(37, 99, 235, 0.18) 30%, rgba(124, 58, 237, 0.18) 70%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, rgba(96, 165, 250, 0.28) 30%, rgba(167, 139, 250, 0.28) 70%, transparent 100%)',
  )
  const accentBorder = ed ? ed.lineStrong : accentBorderBase
  const shadowBase = useColorModeValue(
    isScrolled ? '0 10px 30px rgba(15, 23, 42, 0.08)' : 'none',
    isScrolled ? '0 14px 36px rgba(0, 0, 0, 0.5)' : 'none',
  )
  const shadow = ed ? (isScrolled ? 'var(--pb-shadow)' : 'none') : shadowBase
  const backdrop = ed ? 'none' : (showGlass ? 'saturate(180%) blur(20px)' : 'none')
  const contentPadding = pageIntegrated
    ? { base: 2, md: 4, lg: 6 }
    : { base: 3, md: 6, lg: 8 }

  return (
    <>
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={1000}
        bg={bg}
        borderBottom={ed && !onBrand ? `1px solid ${ed.line}` : undefined}
        boxShadow={onBrand ? 'none' : shadow}
        backdropFilter={backdrop}
        transition="background 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease"
        sx={{
          // Top inner highlight (1px) — premium glass top edge
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: bgOverlay,
            pointerEvents: 'none',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: topHighlight,
            pointerEvents: 'none',
            zIndex: 1,
          },
        }}
      >
        <OnBrandContext.Provider value={onBrand}>
        <Container
          maxW={pageIntegrated ? 'appContent' : '100%'}
          px={contentPadding}
          position="relative"
          zIndex={2}
          sx={{
            paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
          }}
        >
          {/* Top row: brand + (desktop nav) + actions */}
          <Flex
            align="center"
            justify="space-between"
            gap={{ base: 1, sm: 3, md: 4, lg: 6 }}
            h={HEADER_HEIGHT}
            minW={0}
          >
            {/* Left slot: search bar when the sidebar carries the brand,
                otherwise the logo (landing + mobile/admin shells). */}
            {searchOnLeft ? (
              <Box flexShrink={1} minW={0} maxW={{ base: '44px', lg: '300px' }}>
                <SearchTrigger
                  variant={showExpandedSearch ? 'expanded' : 'compact'}
                  onOpen={openSearch}
                />
              </Box>
            ) : onBrand ? (
              // Account badge + greeting lead the purple bar (Nubank-style).
              <HStack spacing={2.5} minW={0} flexShrink={1}>
                <UserMenu
                  user={user}
                  compact
                  placement="bottom-start"
                  onOpenProfile={onOpenProfile}
                  onOpenSettings={onOpenSettings}
                  onLogout={logout}
                />
                <Text color={ON_BRAND.ink} fontSize={{ base: 'md', sm: 'lg' }} fontWeight={700} letterSpacing="-0.01em" noOfLines={1}>
                  {greeting}
                </Text>
              </HStack>
            ) : (
              <Logo user={user} />
            )}

            {/* Desktop sidebar shell: greeting centered between search and actions. */}
            {user && hasSidebar && ed && (
              <Box display={{ base: 'none', lg: 'block' }} mx="auto" px={4} minW={0}>
                <Text as="span" color={ON_BRAND.ink} fontSize="lg" fontWeight={700} whiteSpace="nowrap">
                  {greeting}
                </Text>
              </Box>
            )}

            {/* Desktop primary nav (md+). Hidden when sidebar is active. */}
            {user && !hasSidebar && (
              <Box
                display={{ base: 'none', md: 'block' }}
                flexShrink={0}
                mx="auto"
              >
                <NavBar
                  variant="desktop"
                  items={navItems}
                  currentPage={currentPage}
                  onPageChange={onPageChange}
                />
              </Box>
            )}

            {/* Landing-page anchor nav (logged-out, md+). */}
            {!user && <LandingNav />}

            <Box ml="auto" flexShrink={0}>
              <HeaderActions
                user={user}
                hideSearch={isAdminOnly || searchOnLeft}
                hideUserControls={hasSidebar || onBrand}
                onSearchOpen={openSearch}
                onLogin={onLogin}
                onOpenProfile={onOpenProfile}
                onOpenSettings={onOpenSettings}
                onLogout={logout}
              />
            </Box>
          </Flex>

        </Container>
        </OnBrandContext.Provider>

        {/* Animated accent gradient bottom border */}
        <Box
          aria-hidden
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          h="1px"
          background={accentBorder}
          opacity={pageIntegrated || onBrand ? 0 : (showGlass ? (isScrolled ? 1 : 0.55) : 0)}
          transition="opacity 0.35s ease"
          pointerEvents="none"
          zIndex={3}
        />
      </Box>

      {/* Mobile-only app navigation: stable primary actions + complete menu sheet. */}
      {user && (
        <OnBrandContext.Provider value={onBrand}>
          <Box
            display={{ base: 'block', md: 'none' }}
            position="fixed"
            left={0}
            right={0}
            bottom={0}
            zIndex={1100}
            bg={ON_BRAND.bg}
            borderTop="1px solid"
            borderColor={ON_BRAND.line}
            boxShadow="0 -12px 34px rgba(40, 0, 70, 0.26)"
            px={2}
            pt={1.5}
            pb="max(8px, env(safe-area-inset-bottom, 0px))"
            sx={{
              paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
              paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
            }}
          >
            <MobileNav
              items={navItems}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />
          </Box>
        </OnBrandContext.Provider>
      )}

      {user && !isAdminOnly && (
        <SpotlightSearch isOpen={isSearchOpen} onClose={closeSearch} />
      )}
    </>
  )
}
