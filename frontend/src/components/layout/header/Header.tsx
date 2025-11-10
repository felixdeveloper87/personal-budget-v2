import {
  Box,
  Flex,
  Container,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'
import { GRADIENTS } from '../../../theme'
import { useAuth } from '../../../contexts/AuthContext'
import { getShimmerStyles } from '../../ui'
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

  // Modern post-it inspired colors with texture
  const bg = useColorModeValue('white', 'black')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // Texture pattern with lines - dark mode: white lines on black bg, light mode: black lines on white bg
  const texturePatternLight = 'data:image/svg+xml,%3Csvg width="6" height="6" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M 0 3 L 3 0 M 3 6 L 6 3 M 0 3 L 3 6" stroke="%23000" stroke-width="0.6" opacity="0.15"/%3E%3C/svg%3E'
  const texturePatternDark = 'data:image/svg+xml,%3Csvg width="6" height="6" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M 0 3 L 3 0 M 3 6 L 6 3 M 0 3 L 3 6" stroke="%23fff" stroke-width="0.6" opacity="0.15"/%3E%3C/svg%3E'
  
  const texturePattern = useColorModeValue(texturePatternLight, texturePatternDark)

  return (
    <>
      {/* Main Header */}
      <Box 
        as="header" 
        bg={bg}
        backgroundImage={texturePattern}
        backdropFilter="blur(10px)"
        position="sticky" 
        top={0} 
        zIndex={1000}
        borderBottom="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        w="100%"
        overflow="visible"
      >
        {/* Simple top border */}
        <Box
          height="3px"
          bg={useColorModeValue('blue.200', 'blue.500')}
        />
        <Container 
          maxW="100%"
          px={{ base: 4, md: 8, lg: 12 }}
          sx={{
            // Safe area support para iPhone 14 Pro
            paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
          }}
        >
          <Flex
            h={{ base: 20, md: 24, lg: 28, xl: 32 }}
            align="center"
            justify="space-between"
            gap={{ base: 3, md: 4, lg: 6 }}
            position="relative"
            zIndex={1}
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