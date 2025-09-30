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
  Divider,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import { SunIcon, MoonIcon, ChevronDownIcon, SettingsIcon, InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext'

interface HeaderProps {
  onOpenSettings?: () => void
  onLogin?: () => void
}

export default function Header({ onOpenSettings, onLogin }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const { user, logout } = useAuth()
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure()

  const bg = useColorModeValue(
    'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%)',
    'linear-gradient(135deg, #000000 0%, #111111 50%, #1a1a1a 100%)'
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
            <HStack spacing={{ base: 4, sm: 6, md: 8 }} flex="1" minW={0}>
              {/* Logo */}
              <Box
                as="button"
                w={{ base: 12, sm: 14, md: 18 }}
                h={{ base: 12, sm: 14, md: 18 }}
                flexShrink={0}
                borderRadius="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                transition="all 0.3s ease"
                _hover={{
                  transform: 'scale(1.1) rotate(2deg)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
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
                      '0%, 100%': { transform: 'scale(1)', textShadow: '0 0 10px rgba(255,255,255,0.5)' },
                      '50%': { transform: 'scale(1.08)', textShadow: '0 0 20px rgba(255,255,255,0.9)' },
                    },
                  }}
                >
                  £
                </Text>
              </Box>

              {/* Title */}
              <VStack spacing={0} align="start" minW={0} display={{ base: 'none', sm: 'flex' }}>
                <Text
                  fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }}
                  fontWeight="bold"
                  color={textColor}
                  noOfLines={1}
                >
                  Personal Budget
                </Text>
                <Text fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} color={secondaryTextColor} noOfLines={1}>
                  Smart Financial Management
                </Text>
              </VStack>
            </HStack>

            {/* Right Controls */}
            <HStack spacing={{ base: 2, md: 4 }} flexShrink={0}>
              {/* Theme Toggle */}
              <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton
                  aria-label="toggle theme"
                  icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size={{ base: 'sm', sm: 'md' }}
                  color="white"
                />
              </Tooltip>

              {/* User Menu or Login */}
              {user ? (
                <Menu placement="bottom-end">
                  <MenuButton
                    as={IconButton}
                    aria-label="User menu"
                    icon={<Avatar size={{ base: 'sm', md: 'md' }} name={user?.name} />}
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem icon={<InfoIcon />} onClick={onProfileOpen}>
                      Profile
                    </MenuItem>
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

      {/* Profile Modal */}
      <Modal isOpen={isProfileOpen} onClose={onProfileClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={3}>
              <HStack>
                <Avatar name={user?.name} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{user?.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {user?.email}
                  </Text>
                </VStack>
              </HStack>
              <Divider />
              <Text fontSize="sm" color="gray.600">
                Aqui você pode futuramente colocar opções de edição de perfil.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onProfileClose}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
