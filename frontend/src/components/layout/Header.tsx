import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Container,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react'
import { SunIcon, MoonIcon, SearchIcon } from '@chakra-ui/icons'
import { SettingsIcon, InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import { useSearch } from '../../contexts/SearchContext'
import SearchModal from '../ui/SearchModal'

interface HeaderProps {
  onOpenSettings?: () => void
  onLogin?: () => void
}

export default function Header({ onOpenSettings, onLogin }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const { user, logout } = useAuth()
  const { filters, setFilters } = useSearch()

  const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure()

  const bg = useColorModeValue(
    'linear-gradient(135deg, #095b81ff 0%, #316dccff 50%, #4b698cff 100%)',
    'linear-gradient(135deg, #131313ff 0%, #212121ff 50%, #373737ff 100%)'
  )

  const textColor = 'white'
  const secondaryTextColor = 'rgba(255,255,255,0.8)'

  return (
    <>
      {/* Main Header */}
      <Box as="header" bg={bg} position="sticky" top={0} zIndex={1000}>
        <Container maxW="100%" px={{ base: 4, md: 6, lg: 10 }}>
          <Flex
            h={{ base: 20, sm: 24, md: 28, lg: 32 }}
            align="center"
            justify="space-between"
            gap={3}
          >
            {/* Logo + Title */}
            <HStack spacing={{ base: 4, sm: 6, md: 8 }} flex="1" minW={0} ml={{ base: 2, sm: 4, md: 8 }}>
              <Box
                as="button"
                w={{ base: 12, sm: 14, md: 18 }}
                h={{ base: 12, sm: 14, md: 18 }}
                flexShrink={0}
                borderRadius="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.3s ease"
                _hover={{ transform: 'scale(1.1) rotate(2deg)', cursor: 'pointer' }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Text
                  fontSize={{ base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' }}
                  fontWeight="extrabold"
                  color={useColorModeValue('white', 'black')}
                  textShadow={useColorModeValue(
                    '0 0 12px rgba(255,255,255,0.8)',
                    '0 0 12px rgba(255,255,255,0.3)'
                  )}
                  sx={{
                    animation: 'logoPulse 4s infinite ease-in-out',
                    '@keyframes logoPulse': {
                      '0%, 100%': {
                        transform: 'scale(1)',
                        textShadow: '0 0 10px rgba(255,255,255,0.5)',
                      },
                      '50%': {
                        transform: 'scale(1.08)',
                        textShadow: '0 0 20px rgba(255,255,255,0.9)',
                      },
                    },
                  }}
                >
                  £
                </Text>
              </Box>

              <VStack
                spacing={0}
                align="start"
                minW={0}
                display={{ base: 'none', sm: 'flex' }}
              >
                <Text
                  fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }}
                  fontWeight="bold"
                  color={textColor}
                  noOfLines={1}
                >
                  Personal Budget
                </Text>
                <Text
                  fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                  color={secondaryTextColor}
                  noOfLines={1}
                >
                  Smart Financial Management
                </Text>
              </VStack>

              {/* Navegação extra - só desktop */}
              <HStack
                spacing={6}
                ml={10}
                display={{ base: 'none', md: 'flex' }}
                fontWeight="500"
                color="white"
              >
                <Button variant="ghost" _hover={{ color: 'yellow.300' }}>
                  Dashboard
                </Button>
                <Button variant="ghost" _hover={{ color: 'yellow.300' }}>
                  Reports
                </Button>
                <Button variant="ghost" _hover={{ color: 'yellow.300' }}>
                  Goals
                </Button>
              </HStack>
            </HStack>

            {/* Botão Filters (desktop) */}
            {user && (
              <Box
                flex="2"
                maxW="400px"
                display={{ base: 'none', md: 'flex' }}
                justifyContent="center"
              >
                <Button
                  onClick={onSearchOpen}
                  leftIcon={<SearchIcon />}
                  px={6}
                  py={5}
                  fontWeight="600"
                  fontSize={{ base: 'sm', md: 'md' }}
                  borderRadius="full"
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  color="white"
                  boxShadow="0 4px 10px rgba(0,0,0,0.2)"
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 14px rgba(0,0,0,0.25)',
                    bgGradient: 'linear(to-r, blue.500, purple.600)',
                  }}
                  _active={{ transform: 'scale(0.98)' }}
                >
                  Filters
                </Button>
              </Box>
            )}

            {/* Right Controls */}
            <HStack spacing={{ base: 2, md: 4 }} flexShrink={0}>
              {/* Lupa (mobile) */}
              {user && (
                <IconButton
                  display={{ base: 'flex', md: 'none' }}
                  aria-label="Search"
                  icon={<SearchIcon />}
                  variant="ghost"
                  color="white"
                  onClick={onSearchOpen}
                />
              )}

              {/* Theme Toggle */}
              <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton
                  aria-label="toggle theme"
                  icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size={{ base: 'sm', sm: 'md' }}
                  fontSize={{ base: '18px', md: '22px', lg: '26px' }}
                  color={useColorModeValue('gray.800', 'white')}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                  }}
                />
              </Tooltip>

              {/* User menu */}
              {user ? (
                <Menu placement="bottom-end">
                  <MenuButton
                    as={IconButton}
                    aria-label="User menu"
                    icon={<Avatar size={{ base: 'sm', md: 'md' }} name={user?.name} />}
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem icon={<InfoIcon />}>Profile</MenuItem>
                    <MenuItem icon={<SettingsIcon />} onClick={onOpenSettings}>
                      Settings
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<ExternalLinkIcon />} onClick={logout} color="red.500">
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button
                  colorScheme="brand"
                  variant="solid"
                  onClick={onLogin}
                  size={{ base: 'sm', sm: 'md' }}
                  fontWeight="600"
                  px={{ base: 3, sm: 6 }}
                >
                  Login
                </Button>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Modal de busca */}
      {user && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={onSearchClose}
          onSearch={(filters: any) => {
            setFilters({
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
