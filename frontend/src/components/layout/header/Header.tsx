import { Box, Container, Flex, Text, useBreakpointValue, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'
import SpotlightSearch from '../../search/SpotlightSearch'
import HeaderActions from './HeaderActions'
import LandingNav from './LandingNav'
import Logo from './Logo'
import NavBar from './NavBar'
import SearchTrigger from './SearchTrigger'
import type { AppPage } from './navigation.config'
import { ADMIN_NAV_ITEM, NAV_ITEMS } from './navigation.config'

/** Chrome bar height — shared so the sidebar's brand block lines up with the
 * header's bottom edge (their dividers sit on the same baseline). */
export const HEADER_HEIGHT = { base: '72px', md: '64px' } as const

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
  const { formatDate } = useI18n()
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
  // In the desktop app shell, the header belongs to the page canvas rather than
  // reading as a second chrome layer. It gains its protective surface only once
  // content scrolls beneath it.
  const pageIntegrated = Boolean(user && hasSidebar && ed)

  const bgBase = useColorModeValue(
    showGlass ? (isScrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.62)') : 'transparent',
    showGlass ? (isScrolled ? 'rgba(10,10,12,0.78)'    : 'rgba(10,10,12,0.55)')    : 'transparent',
  )
  const bg = ed ? ed.glass : bgBase
  const bgOverlayVal = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)',
    'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)',
  )
  const editorialOverlay = useColorModeValue(
    // A restrained porcelain sheen helps the scrolled glass separate from paper.
    'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 68%)',
    'linear-gradient(180deg, rgba(239,244,241,0.035) 0%, rgba(239,244,241,0) 68%)',
  )
  const bgOverlay = ed ? editorialOverlay : (showGlass ? bgOverlayVal : 'transparent')
  const topHighlightVal = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0))',
    'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0))',
  )
  const editorialTopHighlight = useColorModeValue(
    // Hairline highlight shared by both editorial variants.
    'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0))',
    'linear-gradient(180deg, rgba(239,244,241,0.07), rgba(239,244,241,0))',
  )
  const topHighlight = ed
    ? editorialTopHighlight
    : (showGlass ? topHighlightVal : 'transparent')
  const accentBorderBase = useColorModeValue(
    'linear-gradient(90deg, transparent 0%, rgba(37, 99, 235, 0.18) 30%, rgba(124, 58, 237, 0.18) 70%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, rgba(96, 165, 250, 0.28) 30%, rgba(167, 139, 250, 0.28) 70%, transparent 100%)',
  )
  const editorialAccentBorder = useColorModeValue(
    'linear-gradient(90deg, transparent 0%, rgba(38,115,90,0.40) 30%, rgba(124,100,39,0.30) 70%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, rgba(95,208,181,0.36) 30%, rgba(208,183,111,0.24) 70%, transparent 100%)',
  )
  const accentBorder = ed
    ? editorialAccentBorder
    : accentBorderBase
  const shadowBase = useColorModeValue(
    isScrolled ? '0 10px 30px rgba(15, 23, 42, 0.08)' : 'none',
    isScrolled ? '0 14px 36px rgba(0, 0, 0, 0.5)' : 'none',
  )
  const editorialShadow = useColorModeValue(
    isScrolled
      ? '0 14px 40px rgba(18,45,36,0.08), inset 0 -1px 0 rgba(255,255,255,0.72)'
      : 'none',
    isScrolled ? '0 14px 36px rgba(0,0,0,0.5)' : 'none',
  )
  const shadow = ed ? editorialShadow : shadowBase
  const integratedBg = pageIntegrated && !isScrolled ? 'transparent' : bg
  const integratedOverlay = pageIntegrated && !isScrolled ? 'transparent' : bgOverlay
  const integratedTopHighlight = pageIntegrated && !isScrolled ? 'transparent' : topHighlight
  const integratedBackdrop = pageIntegrated && !isScrolled
    ? 'none'
    : (showGlass ? 'saturate(180%) blur(20px)' : 'none')
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
        bg={integratedBg}
        boxShadow={shadow}
        backdropFilter={integratedBackdrop}
        transition="background 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease"
        sx={{
          // Top inner highlight (1px) — premium glass top edge
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: integratedOverlay,
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
            background: integratedTopHighlight,
            pointerEvents: 'none',
            zIndex: 1,
          },
        }}
      >
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
            gap={{ base: 3, md: 4, lg: 6 }}
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
            ) : (
              <Logo user={user} />
            )}

            {/* Editorial masthead: today's date in the mono ledger voice,
                centered between search and actions (desktop, sidebar shell). */}
            {user && hasSidebar && ed && (
              <Box display={{ base: 'none', lg: 'block' }} mx="auto" px={4} minW={0}>
                <Text
                  as="span"
                  fontFamily="var(--pb-mono)"
                  fontSize="10.5px"
                  letterSpacing="0.22em"
                  textTransform="uppercase"
                  color="var(--pb-ink-faint)"
                  whiteSpace="nowrap"
                >
                  {formatDate(new Date(), { weekday: 'long' })}
                  {' · '}
                  {formatDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric' })}
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
                hideUserControls={hasSidebar}
                onSearchOpen={openSearch}
                onHouseholdOpen={
                  isAdminOnly ? undefined : () => onPageChange?.('household')
                }
                householdActive={currentPage === 'household'}
                onLogin={onLogin}
                onOpenProfile={onOpenProfile}
                onOpenSettings={onOpenSettings}
                onLogout={logout}
              />
            </Box>
          </Flex>

          {/* Mobile primary nav: four frequent destinations plus a More menu. */}
          {user && (
            <Box display={{ base: 'block', md: 'none' }} pb={3} pt={1}>
              <NavBar
                variant="mobile"
                items={navItems}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            </Box>
          )}
        </Container>

        {/* Animated accent gradient bottom border */}
        <Box
          aria-hidden
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          h="1px"
          background={accentBorder}
          opacity={pageIntegrated ? 0 : (showGlass ? (isScrolled ? 1 : 0.55) : 0)}
          transition="opacity 0.35s ease"
          pointerEvents="none"
          zIndex={3}
        />
      </Box>

      {user && !isAdminOnly && (
        <SpotlightSearch isOpen={isSearchOpen} onClose={closeSearch} />
      )}
    </>
  )
}
