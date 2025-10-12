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
  Badge,
  Icon,
} from '@chakra-ui/react'
import { SunIcon, MoonIcon, SearchIcon } from '@chakra-ui/icons'
import { SettingsIcon, InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { Sparkles, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSearch } from '../../contexts/SearchContext'
import SearchModal from '../ui/SearchModal'

interface HeaderProps {
  onOpenSettings?: () => void
  onLogin?: () => void
  currentPage?: 'dashboard' | 'transactions'
  onPageChange?: (page: 'dashboard' | 'transactions') => void
}

export default function Header({ onOpenSettings, onLogin, currentPage = 'dashboard', onPageChange }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const { user, logout } = useAuth()
  const { filters, setFilters, runSearch } = useSearch()

  const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure()

  const bg = useColorModeValue(
    'rgba(255, 255, 255, 0.9)',
    'rgba(17, 17, 17, 0.9)'
  )

  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400')

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
        borderColor={useColorModeValue(
          'rgba(255, 255, 255, 0.2)',
          'rgba(255, 255, 255, 0.1)'
        )}
        boxShadow={useColorModeValue(
          '0 8px 32px rgba(0, 0, 0, 0.1)',
          '0 8px 32px rgba(0, 0, 0, 0.3)'
        )}
        w="100%"
        overflow="hidden"
        sx={{
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #3b82f6, #10b981, #ef4444, #8b5cf6, #f59e0b)',
            backgroundSize: '300% 100%',
            animation: 'shimmer 4s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-200% 0' },
              '100%': { backgroundPosition: '200% 0' }
            }
          }
        }}
      >
        <Container 
          maxW={{ base: "100%", xl: "1400px", "2xl": "1600px" }} 
          px={{ base: 4, md: 8, lg: 12 }}
          sx={{
            // Safe area support para iPhone 14 Pro
            paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
          }}
        >
          <Flex
            h={{ base: 16, md: 20, lg: 24 }}
            align="center"
            justify="space-between"
            gap={4}
          >
            {/* Logo + Title */}
            <HStack spacing={{ base: 3, md: 4, lg: 5 }} flex="1" minW={0}>
              <Box
                as="button"
                position="relative"
                w={{ base: 10, md: 12, lg: 14 }}
                h={{ base: 10, md: 12, lg: 14 }}
                flexShrink={0}
                bg={useColorModeValue(
                  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  'linear-gradient(135deg, #60a5fa, #3b82f6)'
                )}
                borderRadius="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                boxShadow="0 8px 25px rgba(59, 130, 246, 0.3)"
                overflow="hidden"
                sx={{
                  animation: 'glow 3s ease-in-out infinite',
                  '@keyframes glow': {
                    '0%, 100%': { 
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)' 
                    },
                    '50%': { 
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)' 
                    }
                  }
                }}
                _hover={{ 
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4)',
                  cursor: 'pointer' 
                }}
                _active={{ 
                  transform: 'translateY(-1px) scale(1.02)',
                }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Text
                  fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                  fontWeight="extrabold"
                  color="white"
                >
                  £
                </Text>
                {user && (
                  <Box
                    position="absolute"
                    top="-2px"
                    right="-2px"
                    w="8px"
                    h="8px"
                    bg="green.400"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={bg}
                  />
                )}
              </Box>

              <VStack
                spacing={0}
                align="start"
                minW={0}
                display={{ base: 'none', sm: 'flex' }}
              >
                <HStack spacing={2}>
                  <Text
                    fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
                    fontWeight="800"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #1e293b, #475569)',
                      'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                    )}
                    bgClip="text"
                    noOfLines={1}
                    letterSpacing="wide"
                  >
                    Personal Budget
                  </Text>
                  {!user && (
                    <Badge
                      colorScheme="green"
                      fontSize={{ base: "2xs", lg: "xs" }}
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      fontWeight="600"
                    >
                      Free
                    </Badge>
                  )}
                </HStack>
                <Text
                  fontSize={{ base: "xs", lg: "sm" }}
                  color={secondaryTextColor}
                  noOfLines={1}
                >
                  Financial Management
                </Text>
              </VStack>

              {/* Navegação - só desktop */}
              {user && (
                <HStack
                  spacing={{ md: 2, lg: 3 }}
                  ml={{ md: 6, lg: 10, xl: 14 }}
                  display={{ base: 'none', md: 'flex' }}
                >
                  <Button 
                    variant="ghost" 
                    size={{ md: "sm", lg: "md" }}
                    fontWeight="700"
                    fontSize={{ md: "sm", lg: "md" }}
                    color={currentPage === 'dashboard' ? 'white' : textColor}
                    bg={currentPage === 'dashboard' ? 
                      useColorModeValue(
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        'linear-gradient(135deg, #60a5fa, #3b82f6)'
                      ) : 
                      'transparent'
                    }
                    _hover={{ 
                      bg: currentPage === 'dashboard' ? 
                        useColorModeValue(
                          'linear-gradient(135deg, #2563eb, #1e40af)',
                          'linear-gradient(135deg, #3b82f6, #2563eb)'
                        ) :
                        useColorModeValue('gray.100', 'gray.700'),
                      color: currentPage === 'dashboard' ? 'white' : 'blue.500',
                      transform: 'translateY(-1px)',
                      boxShadow: currentPage === 'dashboard' ? 'lg' : 'sm'
                    }}
                    onClick={() => onPageChange?.('dashboard')}
                    borderRadius="xl"
                    px={{ md: 4, lg: 6 }}
                    transition="all 0.2s ease"
                    boxShadow={currentPage === 'dashboard' ? 'md' : 'none'}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost"
                    size={{ md: "sm", lg: "md" }}
                    fontWeight="700"
                    fontSize={{ md: "sm", lg: "md" }}
                    color={currentPage === 'transactions' ? 'white' : textColor}
                    bg={currentPage === 'transactions' ? 
                      useColorModeValue(
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        'linear-gradient(135deg, #60a5fa, #3b82f6)'
                      ) : 
                      'transparent'
                    }
                    _hover={{ 
                      bg: currentPage === 'transactions' ? 
                        useColorModeValue(
                          'linear-gradient(135deg, #2563eb, #1e40af)',
                          'linear-gradient(135deg, #3b82f6, #2563eb)'
                        ) :
                        useColorModeValue('gray.100', 'gray.700'),
                      color: currentPage === 'transactions' ? 'white' : 'blue.500',
                      transform: 'translateY(-1px)',
                      boxShadow: currentPage === 'transactions' ? 'lg' : 'sm'
                    }}
                    onClick={() => onPageChange?.('transactions')}
                    borderRadius="xl"
                    px={{ md: 4, lg: 6 }}
                    transition="all 0.2s ease"
                    boxShadow={currentPage === 'transactions' ? 'md' : 'none'}
                  >
                    Transactions
                  </Button>
                </HStack>
              )}
            </HStack>

            {/* Botão Search/Filters (desktop) */}
            {user && (
              <Box
                flex="1"
                maxW={{ lg: "300px", xl: "400px" }}
                display={{ base: 'none', lg: 'flex' }}
                justifyContent="center"
              >
                <Button
                  onClick={onSearchOpen}
                  leftIcon={<SearchIcon />}
                  size={{ lg: "sm", xl: "md" }}
                  px={{ lg: 6, xl: 8 }}
                  fontWeight="700"
                  fontSize={{ lg: "sm", xl: "md" }}
                  borderRadius="2xl"
                  variant="outline"
                  borderColor={useColorModeValue('gray.300', 'gray.600')}
                  color={textColor}
                  bg={useColorModeValue(
                    'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    'linear-gradient(135deg, #1e293b, #334155)'
                  )}
                  _hover={{
                    bg: useColorModeValue(
                      'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                      'linear-gradient(135deg, #334155, #475569)'
                    ),
                    borderColor: 'blue.500',
                    color: 'blue.500',
                    transform: 'translateY(-1px)',
                    boxShadow: 'md'
                  }}
                  transition="all 0.2s ease"
                  boxShadow="sm"
                >
                  Search & Filters
                </Button>
              </Box>
            )}

            {/* Right Controls */}
            <HStack spacing={{ base: 2, md: 3, lg: 4 }} flexShrink={0}>
              {/* Search (mobile/tablet only) */}
              {user && (
                <IconButton
                  display={{ base: 'flex', lg: 'none' }}
                  aria-label="Search"
                  icon={<SearchIcon />}
                  variant="ghost"
                  size="sm"
                  color={textColor}
                  onClick={onSearchOpen}
                  borderRadius="lg"
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                    color: 'blue.500'
                  }}
                />
              )}

              {/* Theme Toggle */}
              <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton
                  aria-label="toggle theme"
                  icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size={{ base: "sm", lg: "md" }}
                  fontSize={{ base: "md", lg: "lg" }}
                  color={textColor}
                  borderRadius="lg"
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                    color: 'blue.500'
                  }}
                />
              </Tooltip>

              {/* User menu or Login */}
              {user ? (
                <Menu placement="bottom-end">
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size={{ base: "sm", lg: "md" }}
                    p={{ base: 1, lg: 2 }}
                    borderRadius="lg"
                    _hover={{
                      bg: useColorModeValue('gray.100', 'gray.700'),
                    }}
                  >
                    <HStack spacing={{ base: 2, lg: 3 }}>
                      <Avatar 
                        size={{ base: "sm", lg: "md" }}
                        name={user?.name}
                        bg="blue.500"
                      />
                      <Text 
                        fontSize={{ base: "sm", lg: "md" }}
                        fontWeight="600"
                        color={textColor}
                        display={{ base: 'none', md: 'block' }}
                      >
                        {user?.name.split(' ')[0]}
                      </Text>
                    </HStack>
                  </MenuButton>
                  <MenuList 
                    zIndex={9999}
                    borderColor={borderColor}
                    shadow="lg"
                  >
                    <Box px={4} py={3}>
                      <Text fontSize="sm" fontWeight="600" color={textColor}>
                        {user?.name}
                      </Text>
                      <Text fontSize="xs" color={secondaryTextColor}>
                        {user?.email}
                      </Text>
                    </Box>
                    <MenuDivider />
                    
                    {/* Navegação mobile */}
                    <MenuItem 
                      icon={<Icon as={Zap} boxSize={4} />}
                      onClick={() => onPageChange?.('dashboard')}
                      color={currentPage === 'dashboard' ? 'blue.500' : undefined}
                      fontWeight={currentPage === 'dashboard' ? '600' : 'normal'}
                      display={{ base: 'flex', md: 'none' }}
                    >
                      Dashboard
                    </MenuItem>
                    <MenuItem 
                      icon={<SearchIcon />}
                      onClick={() => onPageChange?.('transactions')}
                      color={currentPage === 'transactions' ? 'blue.500' : undefined}
                      fontWeight={currentPage === 'transactions' ? '600' : 'normal'}
                      display={{ base: 'flex', md: 'none' }}
                    >
                      Transactions
                    </MenuItem>
                    <MenuDivider display={{ base: 'block', md: 'none' }} />
                    
                    <MenuItem icon={<InfoIcon />}>Profile</MenuItem>
                    <MenuItem icon={<SettingsIcon />} onClick={onOpenSettings}>
                      Settings
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem 
                      icon={<ExternalLinkIcon />} 
                      onClick={logout} 
                      color="red.500"
                      fontWeight="600"
                    >
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button
                  onClick={onLogin}
                  size={{ base: "sm", lg: "md" }}
                  fontWeight="800"
                  fontSize={{ base: "sm", lg: "md" }}
                  px={{ base: 4, md: 6, lg: 8 }}
                  borderRadius="2xl"
                  bg={useColorModeValue(
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    'linear-gradient(135deg, #60a5fa, #3b82f6)'
                  )}
                  color="white"
                  boxShadow="0 8px 25px rgba(59, 130, 246, 0.3)"
                  _hover={{
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4)',
                  }}
                  _active={{
                    transform: 'translateY(-1px) scale(1.02)',
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  letterSpacing="wide"
                >
                  Get Started
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
