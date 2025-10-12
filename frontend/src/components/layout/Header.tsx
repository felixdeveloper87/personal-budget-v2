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
    'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
    'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))'
  )

  const borderColor = useColorModeValue(
    'rgba(59, 130, 246, 0.2)',
    'rgba(96, 165, 250, 0.3)'
  )
  const textColor = useColorModeValue('gray.800', 'white')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300')

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
        overflow="hidden"
        sx={{
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: useColorModeValue(
              'linear-gradient(90deg, #3b82f6, #10b981, #ef4444, #8b5cf6, #f59e0b, #06b6d4, #84cc16)',
              'linear-gradient(90deg, #60a5fa, #34d399, #f87171, #a78bfa, #fbbf24, #22d3ee, #a3e635)'
            ),
            backgroundSize: '400% 100%',
            animation: 'shimmer 6s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-300% 0' },
              '50%': { backgroundPosition: '300% 0' },
              '100%': { backgroundPosition: '-300% 0' }
            }
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
          maxW={{ base: "100%", xl: "1400px", "2xl": "1600px" }} 
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
            <HStack spacing={{ base: 3, md: 4, lg: 5 }} flex="1" minW={0}>
              <Box
                as="button"
                position="relative"
                w={{ base: 12, md: 16, lg: 20, xl: 24 }}
                h={{ base: 12, md: 16, lg: 20, xl: 24 }}
                flexShrink={0}
                bg={useColorModeValue(
                  'linear-gradient(135deg, #3b82f6, #1d4ed8, #7c3aed, #10b981)',
                  'linear-gradient(135deg, #60a5fa, #3b82f6, #a78bfa, #34d399)'
                )}
                borderRadius="3xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                boxShadow={useColorModeValue(
                  '0 20px 50px rgba(59, 130, 246, 0.6), 0 8px 25px rgba(124, 58, 237, 0.4), 0 0 40px rgba(16, 185, 129, 0.3)',
                  '0 20px 50px rgba(96, 165, 250, 0.7), 0 8px 25px rgba(167, 139, 250, 0.5), 0 0 40px rgba(52, 211, 153, 0.4)'
                )}
                overflow="visible"
                sx={{
                  animation: 'glow 3s ease-in-out infinite, float 4s ease-in-out infinite, pulse 2s ease-in-out infinite',
                  '@keyframes glow': {
                    '0%, 100%': { 
                      boxShadow: useColorModeValue(
                        '0 20px 50px rgba(59, 130, 246, 0.6), 0 8px 25px rgba(124, 58, 237, 0.4), 0 0 40px rgba(16, 185, 129, 0.3)',
                        '0 20px 50px rgba(96, 165, 250, 0.7), 0 8px 25px rgba(167, 139, 250, 0.5), 0 0 40px rgba(52, 211, 153, 0.4)'
                      )
                    },
                    '50%': { 
                      boxShadow: useColorModeValue(
                        '0 25px 60px rgba(59, 130, 246, 0.8), 0 12px 35px rgba(124, 58, 237, 0.6), 0 0 50px rgba(16, 185, 129, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)',
                        '0 25px 60px rgba(96, 165, 250, 0.9), 0 12px 35px rgba(167, 139, 250, 0.7), 0 0 50px rgba(52, 211, 153, 0.6), 0 0 80px rgba(96, 165, 250, 0.4)'
                      )
                    }
                  },
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '25%': { transform: 'translateY(-3px) rotate(1deg)' },
                    '50%': { transform: 'translateY(-5px) rotate(0deg)' },
                    '75%': { transform: 'translateY(-3px) rotate(-1deg)' }
                  },
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' }
                  }
                }}
                _hover={{ 
                  transform: 'translateY(-6px) scale(1.12)',
                  boxShadow: useColorModeValue(
                    '0 30px 70px rgba(59, 130, 246, 0.7), 0 12px 35px rgba(124, 58, 237, 0.5), 0 0 60px rgba(16, 185, 129, 0.4)',
                    '0 30px 70px rgba(96, 165, 250, 0.8), 0 12px 35px rgba(167, 139, 250, 0.6), 0 0 60px rgba(52, 211, 153, 0.5)'
                  ),
                  cursor: 'pointer',
                  '& > *': {
                    transform: 'scale(1.1)',
                    filter: 'brightness(1.2)'
                  }
                }}
                _active={{ 
                  transform: 'translateY(-3px) scale(1.08)',
                }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Text
                  fontSize={{ base: '2xl', md: '4xl', lg: '5xl', xl: '6xl' }}
                  fontWeight="black"
                  color="white"
                  textShadow="0 6px 12px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.3)"
                  filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))"
                  lineHeight="1"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minH="100%"
                  minW="100%"
                  sx={{
                    background: 'linear-gradient(45deg, #ffffff, #f0f9ff, #ffffff, #e0f2fe)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'shimmer 3s ease-in-out infinite',
                    '@keyframes shimmer': {
                      '0%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' },
                      '100%': { backgroundPosition: '0% 50%' }
                    }
                  }}
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
                    fontSize={{ base: 'lg', md: 'xl', lg: '2xl', xl: '3xl' }}
                    fontWeight="900"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #1e293b, #475569, #64748b, #334155)',
                      'linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1, #94a3b8)'
                    )}
                    bgClip="text"
                    noOfLines={1}
                    letterSpacing="wide"
                    textShadow={useColorModeValue(
                      '0 2px 4px rgba(0, 0, 0, 0.1)',
                      '0 2px 4px rgba(255, 255, 255, 0.1)'
                    )}
                    sx={{
                      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                    }}
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
                    size={{ md: "md", lg: "lg", xl: "lg" }}
                    fontWeight="800"
                    fontSize={{ md: "md", lg: "lg", xl: "xl" }}
                    color={currentPage === 'dashboard' ? 'white' : textColor}
                    bg={currentPage === 'dashboard' ? 
                      useColorModeValue(
                        'linear-gradient(135deg, #3b82f6, #1d4ed8, #7c3aed)',
                        'linear-gradient(135deg, #60a5fa, #3b82f6, #a78bfa)'
                      ) : 
                      'transparent'
                    }
                    _hover={{ 
                      bg: currentPage === 'dashboard' ? 
                        useColorModeValue(
                          'linear-gradient(135deg, #2563eb, #1e40af, #6d28d9)',
                          'linear-gradient(135deg, #3b82f6, #2563eb, #8b5cf6)'
                        ) :
                        useColorModeValue(
                          'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                          'linear-gradient(135deg, #334155, #475569)'
                        ),
                      color: currentPage === 'dashboard' ? 'white' : 'blue.500',
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: currentPage === 'dashboard' ? 
                        useColorModeValue(
                          '0 12px 35px rgba(59, 130, 246, 0.4)',
                          '0 12px 35px rgba(96, 165, 250, 0.5)'
                        ) : 
                        useColorModeValue(
                          '0 8px 25px rgba(0, 0, 0, 0.1)',
                          '0 8px 25px rgba(0, 0, 0, 0.3)'
                        )
                    }}
                    onClick={() => onPageChange?.('dashboard')}
                    borderRadius="2xl"
                    px={{ md: 6, lg: 8, xl: 10 }}
                    py={{ md: 3, lg: 4, xl: 5 }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    boxShadow={currentPage === 'dashboard' ? 
                      useColorModeValue(
                        '0 8px 25px rgba(59, 130, 246, 0.3)',
                        '0 8px 25px rgba(96, 165, 250, 0.4)'
                      ) : 
                      'none'
                    }
                    letterSpacing="wide"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost"
                    size={{ md: "md", lg: "lg", xl: "lg" }}
                    fontWeight="800"
                    fontSize={{ md: "md", lg: "lg", xl: "xl" }}
                    color={currentPage === 'transactions' ? 'white' : textColor}
                    bg={currentPage === 'transactions' ? 
                      useColorModeValue(
                        'linear-gradient(135deg, #3b82f6, #1d4ed8, #7c3aed)',
                        'linear-gradient(135deg, #60a5fa, #3b82f6, #a78bfa)'
                      ) : 
                      'transparent'
                    }
                    _hover={{ 
                      bg: currentPage === 'transactions' ? 
                        useColorModeValue(
                          'linear-gradient(135deg, #2563eb, #1e40af, #6d28d9)',
                          'linear-gradient(135deg, #3b82f6, #2563eb, #8b5cf6)'
                        ) :
                        useColorModeValue(
                          'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                          'linear-gradient(135deg, #334155, #475569)'
                        ),
                      color: currentPage === 'transactions' ? 'white' : 'blue.500',
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: currentPage === 'transactions' ? 
                        useColorModeValue(
                          '0 12px 35px rgba(59, 130, 246, 0.4)',
                          '0 12px 35px rgba(96, 165, 250, 0.5)'
                        ) : 
                        useColorModeValue(
                          '0 8px 25px rgba(0, 0, 0, 0.1)',
                          '0 8px 25px rgba(0, 0, 0, 0.3)'
                        )
                    }}
                    onClick={() => onPageChange?.('transactions')}
                    borderRadius="2xl"
                    px={{ md: 6, lg: 8, xl: 10 }}
                    py={{ md: 3, lg: 4, xl: 5 }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    boxShadow={currentPage === 'transactions' ? 
                      useColorModeValue(
                        '0 8px 25px rgba(59, 130, 246, 0.3)',
                        '0 8px 25px rgba(96, 165, 250, 0.4)'
                      ) : 
                      'none'
                    }
                    letterSpacing="wide"
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
                  size={{ base: "md", lg: "lg", xl: "lg" }}
                  fontWeight="900"
                  fontSize={{ base: "md", lg: "lg", xl: "xl" }}
                  px={{ base: 6, md: 8, lg: 10, xl: 12 }}
                  py={{ base: 3, md: 4, lg: 5, xl: 6 }}
                  borderRadius="3xl"
                  bg={useColorModeValue(
                    'linear-gradient(135deg, #3b82f6, #1d4ed8, #7c3aed, #10b981)',
                    'linear-gradient(135deg, #60a5fa, #3b82f6, #a78bfa, #34d399)'
                  )}
                  color="white"
                  boxShadow={useColorModeValue(
                    '0 12px 35px rgba(59, 130, 246, 0.4), 0 4px 15px rgba(124, 58, 237, 0.2)',
                    '0 12px 35px rgba(96, 165, 250, 0.5), 0 4px 15px rgba(167, 139, 250, 0.3)'
                  )}
                  _hover={{
                    transform: 'translateY(-4px) scale(1.08)',
                    boxShadow: useColorModeValue(
                      '0 20px 50px rgba(59, 130, 246, 0.5), 0 8px 25px rgba(124, 58, 237, 0.3)',
                      '0 20px 50px rgba(96, 165, 250, 0.6), 0 8px 25px rgba(167, 139, 250, 0.4)'
                    ),
                    bg: useColorModeValue(
                      'linear-gradient(135deg, #2563eb, #1e40af, #6d28d9, #059669)',
                      'linear-gradient(135deg, #3b82f6, #2563eb, #8b5cf6, #10b981)'
                    )
                  }}
                  _active={{
                    transform: 'translateY(-2px) scale(1.04)',
                  }}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  letterSpacing="wide"
                  sx={{
                    animation: 'pulse 3s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { 
                        boxShadow: useColorModeValue(
                          '0 12px 35px rgba(59, 130, 246, 0.4), 0 4px 15px rgba(124, 58, 237, 0.2)',
                          '0 12px 35px rgba(96, 165, 250, 0.5), 0 4px 15px rgba(167, 139, 250, 0.3)'
                        )
                      },
                      '50%': { 
                        boxShadow: useColorModeValue(
                          '0 16px 45px rgba(59, 130, 246, 0.6), 0 8px 25px rgba(124, 58, 237, 0.4)',
                          '0 16px 45px rgba(96, 165, 250, 0.7), 0 8px 25px rgba(167, 139, 250, 0.5)'
                        )
                      }
                    }
                  }}
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
