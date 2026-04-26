import { Box, Container, Flex, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useSearch } from '../../../contexts/SearchContext'
import SearchModal from '../../search/SearchModal'
import HeaderActions from './HeaderActions'
import LandingNav from './LandingNav'
import Logo from './Logo'
import NavBar from './NavBar'
import type { AppPage } from './navigation.config'

interface HeaderProps {
  onOpenSettings?: () => void
  onLogin?: () => void
  currentPage?: AppPage
  onPageChange?: (page: AppPage) => void
}

export default function Header({
  onOpenSettings,
  onLogin,
  currentPage = 'dashboard',
  onPageChange,
}: HeaderProps) {
  const { user, logout } = useAuth()
  const { runSearch } = useSearch()
  const { isOpen: isSearchOpen, onOpen: openSearch, onClose: closeSearch } = useDisclosure()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cmd/Ctrl+K to open search
  useEffect(() => {
    if (!user) return
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
  }, [user, openSearch])

  const bg = useColorModeValue(
    isScrolled ? 'rgba(255, 255, 255, 0.78)' : 'rgba(255, 255, 255, 0.62)',
    isScrolled ? 'rgba(10, 10, 12, 0.78)' : 'rgba(10, 10, 12, 0.55)',
  )
  const bgOverlay = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)',
    'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)',
  )
  const topHighlight = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0))',
    'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0))',
  )
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
        backdropFilter="saturate(180%) blur(20px)"
        transition="background 0.3s ease, box-shadow 0.3s ease"
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
            paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
          }}
        >
          {/* Top row: brand + (desktop nav) + actions */}
          <Flex
            align="center"
            justify="space-between"
            gap={{ base: 2, md: 4, lg: 6 }}
            h={{ base: '60px', md: '68px' }}
            minW={0}
          >
            <Logo user={user} />

            {/* Desktop primary nav (md+). Mobile uses the second row below. */}
            {user && (
              <Box
                display={{ base: 'none', md: 'block' }}
                flexShrink={0}
                mx="auto"
              >
                <NavBar
                  variant="desktop"
                  currentPage={currentPage}
                  onPageChange={onPageChange}
                />
              </Box>
            )}

            {/* Landing-page anchor nav (logged-out, md+). */}
            {!user && <LandingNav />}

            <HeaderActions
              user={user}
              onSearchOpen={openSearch}
              onLogin={onLogin}
              onOpenSettings={onOpenSettings}
              onLogout={logout}
            />
          </Flex>

          {/* Mobile primary nav (base..md): second row, full-width segmented bar.
              Always visible — no hamburger, no hidden buttons. */}
          {user && (
            <Box display={{ base: 'block', md: 'none' }} pb={2.5} pt={0.5}>
              <NavBar
                variant="mobile"
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
          opacity={isScrolled ? 1 : 0.55}
          transition="opacity 0.3s ease"
          pointerEvents="none"
          zIndex={3}
        />
      </Box>

      {user && (
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
