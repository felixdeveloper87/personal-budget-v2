import {
  Box,
  Flex,
  Container,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'
import { useAuth } from '../../../contexts/AuthContext'
import { getShimmerStyles } from '../../ui'
import { useSearch } from '../../../contexts/SearchContext'
import SearchModal from '../../search/SearchModal'
import { Logo, Navigation, UserMenu, HeaderControls, SearchButton } from './'

interface HeaderProps {
  onOpenSettings?: () => void
  onLogin?: () => void
  currentPage?: 'dashboard' | 'transactions'
  onPageChange?: (page: 'dashboard' | 'transactions') => void
}

export default function Header({ onOpenSettings, onLogin, currentPage = 'dashboard', onPageChange }: HeaderProps) {
  const { user, logout } = useAuth()
  const { runSearch } = useSearch()
  const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure()

  const bg = useColorModeValue(
    'linear-gradient(135deg, rgba(226, 232, 240, 0.95), rgba(203, 213, 225, 0.9))',
    'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))'
  )

  const borderColor = useColorModeValue(
    'rgba(59, 130, 246, 0.2)',
    'rgba(96, 165, 250, 0.3)'
  )

  return (
    <>
      {/* Main Header */}
      <Box 
        as="header" 
        bg={bg}
        backdropFilter="blur(24px)"
        position="sticky" 
        top={0} 
        zIndex={1000}
        borderBottom="2px solid"
        borderColor={borderColor}
        boxShadow={useColorModeValue(
          '0 20px 50px rgba(59, 130, 246, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)',
          '0 20px 50px rgba(96, 165, 250, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4)'
        )}
        w="100%"
        overflow="visible"
        sx={{
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            ...getShimmerStyles()
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: useColorModeValue(
              'linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(16, 185, 129, 0.02), rgba(139, 92, 246, 0.03))',
              'linear-gradient(135deg, rgba(96, 165, 250, 0.05), rgba(52, 211, 153, 0.03), rgba(167, 139, 250, 0.05))'
            ),
            pointerEvents: 'none'
          }
        }}
      >
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

            {/* Navigation */}
            <Navigation 
              user={user} 
              currentPage={currentPage} 
              onPageChange={onPageChange} 
            />

            {/* Search Button (desktop) */}
            <SearchButton user={user} onSearchOpen={onSearchOpen} />

            {/* Right Controls */}
            <HeaderControls 
              user={user} 
              onSearchOpen={onSearchOpen} 
              onLogin={onLogin} 
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