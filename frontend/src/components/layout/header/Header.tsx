import {
  Box,
  Flex,
  Container,
  HStack,
  Button,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useSearch } from '../../../contexts/SearchContext'
import SearchModal from '../../search/SearchModal'
import { Logo, Navigation, UserMenu, HeaderControls, SearchButton } from './'

interface HeaderProps {
  onOpenSettings?: () => void
  onLogin?: () => void
  currentPage?: 'dashboard' | 'transactions' | 'charts'
  onPageChange?: (page: 'dashboard' | 'transactions' | 'charts') => void
}

export default function Header({ onOpenSettings, onLogin, currentPage = 'dashboard', onPageChange }: HeaderProps) {
  const { user, logout } = useAuth()
  const { runSearch } = useSearch()
  const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const bg = useColorModeValue(
    user
      ? 'rgba(255, 255, 255, 0.96)'
      : isScrolled
        ? 'rgba(255, 255, 255, 0.92)'
        : 'rgba(255, 255, 255, 0.8)',
    user
      ? 'rgba(12, 12, 14, 0.94)'
      : isScrolled
        ? 'rgba(10, 10, 10, 0.86)'
        : 'rgba(0, 0, 0, 0.6)'
  )
  const borderColor = useColorModeValue(
    user ? 'gray.200' : 'whiteAlpha.300',
    user ? 'whiteAlpha.200' : 'whiteAlpha.100'
  )
  const shadow = useColorModeValue(
    user
      ? '0 6px 24px rgba(15, 23, 42, 0.08)'
      : isScrolled
        ? '0 8px 30px rgba(0, 0, 0, 0.1)'
        : '0 4px 30px rgba(0, 0, 0, 0.05)',
    user
      ? '0 8px 28px rgba(0, 0, 0, 0.35)'
      : isScrolled
        ? '0 10px 30px rgba(0, 0, 0, 0.35)'
        : '0 4px 30px rgba(0, 0, 0, 0.2)'
  )
  const headerHeight = isScrolled ? 20 : 24
  const landingNavColor = useColorModeValue('gray.700', 'gray.200')
  const landingNavHoverBg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const landingNavHoverColor = useColorModeValue('blue.600', 'blue.300')
  const landingSections = [
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'faq', label: 'FAQ' },
  ] as const

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (!section) return
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* Main Header */}
      <Box
        as="header"
        bg={bg}
        backdropFilter={user ? 'blur(14px)' : 'blur(20px)'}
        position="sticky"
        top={0}
        zIndex={1000}
        borderBottom="1px solid"
        borderColor={borderColor}
        boxShadow={shadow}
        w="100%"
        transition="all 0.3s ease"
      >
        <Container
          maxW="100%"
          px={{ base: 1.5, sm: 2, md: 4, lg: 6, xl: 8 }}
          sx={{
            // Safe area support para iPhone 14 Pro
            paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
          }}
        >
          <Flex
            h={headerHeight}
            align="center"
            justify="space-between"
            gap={{ base: 0.5, sm: 1, md: 2, lg: 3, xl: 4 }}
            position="relative"
            flexWrap="nowrap"
            minW={0}
          >
            {/* Logo + Title */}
            <Box flexShrink={1} minW={0} maxW={{ base: '40%', sm: '50%', md: 'none' }}>
              <Logo user={user} />
            </Box>

            {/* Navigation (desktop) */}
            <Navigation
              user={user}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />

            {/* Landing navigation (desktop) */}
            {!user && (
              <HStack
                spacing={2}
                display={{ base: 'none', md: 'flex' }}
                ml={{ md: 2, lg: 4 }}
              >
                {landingSections.map((section) => (
                  <Button
                    key={section.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => scrollToSection(section.id)}
                    color={landingNavColor}
                    fontWeight="600"
                    _hover={{
                      bg: landingNavHoverBg,
                      color: landingNavHoverColor,
                    }}
                  >
                    {section.label}
                  </Button>
                ))}
              </HStack>
            )}

            {/* Search Button (desktop) */}
            <SearchButton user={user} onSearchOpen={onSearchOpen} />

            {/* Right Controls (includes mobile navigation) */}
            <HeaderControls
              user={user}
              onSearchOpen={onSearchOpen}
              onLogin={onLogin}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />

            {/* User Menu */}
            {user && (
              <Box flexShrink={0}>
                <UserMenu
                  user={user}
                  currentPage={currentPage}
                  onPageChange={onPageChange}
                  onOpenSettings={onOpenSettings}
                  onLogout={logout}
                />
              </Box>
            )}
          </Flex>
        </Container>
      </Box>

      {/* Modal de busca */}
      {user && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={onSearchClose}
          onSearch={async (filters: any) => {
            await runSearch({
              ...filters,
              type: filters.type === null ? undefined : filters.type,
            })
            onSearchClose()
          }}
        />
      )}
    </>
  )
}