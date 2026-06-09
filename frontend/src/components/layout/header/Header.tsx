import { Box, Container, Flex, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useSearch } from '../../../contexts/SearchContext'
import SearchModal from '../../search/SearchModal'
import HeaderActions from './HeaderActions'
import LandingNav from './LandingNav'
import Logo from './Logo'
import NavBar from './NavBar'
import type { AppPage } from './navigation.config'
import { ADMIN_NAV_ITEM, NAV_ITEMS } from './navigation.config'

interface HeaderProps {
  onOpenProfile?: () => void
  onOpenSettings?: () => void
  onOpenAllTransactions?: () => void
  onLogin?: () => void
  currentPage?: AppPage
  onPageChange?: (page: AppPage) => void
  /** When true the desktop NavBar is hidden (sidebar handles navigation). */
  hasSidebar?: boolean
}

export default function Header({
  onOpenProfile,
  onOpenSettings,
  onOpenAllTransactions,
  onLogin,
  currentPage = 'dashboard',
  onPageChange,
  hasSidebar = false,
}: HeaderProps) {
  const { user, logout } = useAuth()
  const { runSearch } = useSearch()
  const navItems = useMemo(
    () => (user?.admin ? [ADMIN_NAV_ITEM] : NAV_ITEMS),
    [user?.admin]
  )
  const isAdminOnly = Boolean(user?.admin)
  const { isOpen: isSearchOpen, onOpen: openSearch, onClose: closeSearch } = useDisclosure()
  const [isScrolled, setIsScrolled] = useState(false)

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

  const bg = useColorModeValue(
    showGlass ? (isScrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.62)') : 'transparent',
    showGlass ? (isScrolled ? 'rgba(10,10,12,0.78)'    : 'rgba(10,10,12,0.55)')    : 'transparent',
  )
  const bgOverlayVal = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)',
    'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)',
  )
  const bgOverlay = showGlass ? bgOverlayVal : 'transparent'
  const topHighlightVal = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0))',
    'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0))',
  )
  const topHighlight = showGlass ? topHighlightVal : 'transparent'
  const accentBorder = useColorModeValue(
    'linear-gradient(90deg, transparent 0%, rgba(37, 99, 235, 0.18) 30%, rgba(124, 58, 237, 0.18) 70%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, rgba(96, 165, 250, 0.28) 30%, rgba(167, 139, 250, 0.28) 70%, transparent 100%)',
  )
  const shadow = useColorModeValue(
    isScrolled ? '0 10px 30px rgba(15, 23, 42, 0.08)' : 'none',
    isScrolled ? '0 14px 36px rgba(0, 0, 0, 0.5)' : 'none',
  )

  return (
    <>
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={1000}
        bg={bg}
        boxShadow={shadow}
        backdropFilter={showGlass ? 'saturate(180%) blur(20px)' : 'none'}
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
        <Container
          maxW="100%"
          px={{ base: 3, md: 6, lg: 8 }}
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
            h={{ base: '72px', md: '80px' }}
            minW={0}
          >
            <Logo user={user} />

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

            <HeaderActions
              user={user}
              hideSearch={isAdminOnly}
              onSearchOpen={openSearch}
              onLogin={onLogin}
              onOpenProfile={onOpenProfile}
              onOpenSettings={onOpenSettings}
              onOpenAllTransactions={onOpenAllTransactions}
              onLogout={logout}
            />
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
          opacity={showGlass ? (isScrolled ? 1 : 0.55) : 0}
          transition="opacity 0.35s ease"
          pointerEvents="none"
          zIndex={3}
        />
      </Box>

      {user && !isAdminOnly && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={closeSearch}
          onSearch={async (filters: any) => {
            await runSearch({
              ...filters,
              type: filters.type === null ? undefined : filters.type,
            })
            closeSearch()
          }}
        />
      )}
    </>
  )
}
