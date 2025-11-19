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

  const bg = useColorModeValue('white', 'black')
  const borderColor = useColorModeValue('gray.400', 'gray.600')

  return (
    <>
      {/* Main Header */}
      <Box
        as="header"
        bg={bg}
        backdropFilter="blur(10px)"
        position="sticky"
        top={0}
        zIndex={1000}
        borderBottom="1px solid"
        borderColor={borderColor}
        w="100%"
      >
        <Container
          maxW="100%"
          px={{ base: 2, sm: 3, md: 6, lg: 8 }}
          sx={{
            // Safe area support para iPhone 14 Pro
            paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
          }}
        >
          <Flex
            h={{ base: 20, md: 24, lg: 28, xl: 32 }}
            align="center"
            justify="space-between"
            gap={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }}
            position="relative"
            flexWrap="nowrap"
          >
            {/* Logo + Title */}
            <Logo user={user} />

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
              <UserMenu
                user={user}
                currentPage={currentPage}
                onPageChange={onPageChange}
                onOpenSettings={onOpenSettings}
                onLogout={logout}
              />
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