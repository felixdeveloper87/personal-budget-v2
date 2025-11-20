import {
  Box,
  Flex,
  Container,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'
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

  const bg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(0, 0, 0, 0.6)')
  const borderColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.100')
  const shadow = useColorModeValue(
    '0 4px 30px rgba(0, 0, 0, 0.05)',
    '0 4px 30px rgba(0, 0, 0, 0.2)'
  )

  return (
    <>
      {/* Main Header */}
      <Box
        as="header"
        bg={bg}
        backdropFilter="blur(20px)"
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
            h={{ base: 16, sm: 24, md: 24, lg: 28, xl: 32 }}
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