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
    'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
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
        backdropFilter="blur(10px)"
        position="sticky" 
        top={0} 
        zIndex={1000}
        borderBottom="1px solid"
        borderColor={borderColor}
        boxShadow={useColorModeValue(
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        )}
        w="100%"
      >
        <Container maxW={{ base: "100%", xl: "1400px", "2xl": "1600px" }} px={{ base: 4, md: 8, lg: 12, xl: 16 }}>
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
                  'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                  'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
                )}
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.3s ease"
                boxShadow="0 4px 12px rgba(59, 130, 246, 0.3)"
                _hover={{ 
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                  cursor: 'pointer' 
                }}
                _active={{ transform: 'translateY(0)' }}
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
                    fontWeight="bold"
                    color={textColor}
                    noOfLines={1}
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
                    fontWeight="600"
                    fontSize={{ md: "sm", lg: "md" }}
                    color={currentPage === 'dashboard' ? 'blue.500' : textColor}
                    bg={currentPage === 'dashboard' ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
                    _hover={{ 
                      bg: useColorModeValue('gray.100', 'gray.700'),
                      color: 'blue.500'
                    }}
                    onClick={() => onPageChange?.('dashboard')}
                    borderRadius="lg"
                    px={{ md: 4, lg: 6 }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost"
                    size={{ md: "sm", lg: "md" }}
                    fontWeight="600"
                    fontSize={{ md: "sm", lg: "md" }}
                    color={currentPage === 'transactions' ? 'blue.500' : textColor}
                    bg={currentPage === 'transactions' ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
                    _hover={{ 
                      bg: useColorModeValue('gray.100', 'gray.700'),
                      color: 'blue.500'
                    }}
                    onClick={() => onPageChange?.('transactions')}
                    borderRadius="lg"
                    px={{ md: 4, lg: 6 }}
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
                  fontWeight="600"
                  fontSize={{ lg: "sm", xl: "md" }}
                  borderRadius="full"
                  variant="outline"
                  borderColor={useColorModeValue('gray.300', 'gray.600')}
                  color={textColor}
                  bg={useColorModeValue('white', 'gray.800')}
                  _hover={{
                    bg: useColorModeValue('gray.50', 'gray.700'),
                    borderColor: 'blue.500',
                    color: 'blue.500',
                  }}
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
                  fontWeight="600"
                  fontSize={{ base: "sm", lg: "md" }}
                  px={{ base: 4, md: 6, lg: 8 }}
                  borderRadius="lg"
                  bg={useColorModeValue(
                    'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                    'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
                  )}
                  color="white"
                  boxShadow="0 4px 12px rgba(59, 130, 246, 0.3)"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                  }}
                  _active={{
                    transform: 'translateY(0)',
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
