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
    Badge,
    Container,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
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
import { useThemeColors } from '../hooks/useThemeColors'
  import {
    SunIcon,
    MoonIcon,
    HamburgerIcon,
    SettingsIcon,
    BellIcon,
    ChevronDownIcon,
    CalendarIcon,
    ViewIcon,
    InfoIcon,
    ExternalLinkIcon,
    AddIcon,
    StarIcon,
    TimeIcon,
  } from '@chakra-ui/icons'
  import { useAuth } from '../contexts/AuthContext'
  import { useState } from 'react'
  
interface HeaderProps {
  onOpenSettings?: () => void
  onLogin?: () => void
}
  
  export default function Header({ onOpenSettings, onLogin }: HeaderProps) {
    const { colorMode, toggleColorMode } = useColorMode()
    const { user, logout } = useAuth()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {
      isOpen: isProfileOpen,
      onOpen: onProfileOpen,
      onClose: onProfileClose,
    } = useDisclosure()
    const [notifications] = useState(3)
  
    const colors = useThemeColors()
    
    const bg = useColorModeValue(
      'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%)',
      'linear-gradient(135deg, #000000 0%, #111111 50%, #1a1a1a 100%)'
    )
    const textColor = 'white'
    const secondaryTextColor = 'rgba(255,255,255,0.8)'
    const glassBg = 'rgba(255,255,255,0.1)'
  
    return (
      <>
        {/* Main Header */}
        <Box as="header" bg={bg} position="sticky" top={0} zIndex={1000}>
          <Container 
            maxW={{
              base: "100%",
              md: "4xl",
              lg: "6xl",
              xl: "7xl",
              "2xl": "8xl",
              "3xl": "container.3xl",
            }}
            px={{ base: 4, md: 6 }}
          >
            <Flex h={20} align="center" justify="space-between">
              {/* Logo */}
              <HStack spacing={{ base: 3, md: 4, lg: 6 }}>
                <Box
                  as="button"
                  w={{ base: 12, md: 14, lg: 16 }}
                  h={{ base: 12, md: 14, lg: 16 }}
                  bg={useColorModeValue(
                    'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%)',
                    'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)'
                  )}
                  borderRadius="2xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                  boxShadow={useColorModeValue(
                    '0 0 20px rgba(14, 165, 233, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
                    '0 0 20px rgba(30, 64, 175, 0.6), 0 0 40px rgba(55, 48, 163, 0.4)'
                  )}
                  _hover={{
                    transform: 'scale(1.08) rotate(3deg)',
                    boxShadow: useColorModeValue(
                      '0 0 30px rgba(14, 165, 233, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',
                      '0 0 30px rgba(30, 64, 175, 0.8), 0 0 60px rgba(55, 48, 163, 0.6)'
                    ),
                    cursor: 'pointer',
                  }}
                  _active={{
                    transform: 'scale(1.05) rotate(2deg)',
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  animation="pulseGlow 4s infinite"
                  border="2px solid rgba(255,255,255,0.3)"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  sx={{
                    '@keyframes pulseGlow': {
                      '0%, 100%': {
                        transform: 'scale(1)',
                        boxShadow: useColorModeValue(
                          '0 0 20px rgba(14, 165, 233, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
                          '0 0 20px rgba(30, 64, 175, 0.6), 0 0 40px rgba(55, 48, 163, 0.4)'
                        ),
                      },
                      '50%': {
                        transform: 'scale(1.05)',
                        boxShadow: useColorModeValue(
                          '0 0 30px rgba(14, 165, 233, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',
                          '0 0 30px rgba(30, 64, 175, 0.8), 0 0 60px rgba(55, 48, 163, 0.6)'
                        ),
                      },
                    },
                    '@keyframes ringPulse': {
                      '0%': { transform: 'scale(1)', opacity: 0.6 },
                      '70%': { transform: 'scale(1.4)', opacity: 0 },
                      '100%': { opacity: 0 },
                    },
                  }}
                >
                  <Text
                    fontSize="3xl"
                    fontWeight="extrabold"
                    color={useColorModeValue('white', 'black')}
                    textShadow={useColorModeValue(
                      '0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3)',
                      '0 0 8px rgba(0,0,0,0.3), 0 0 16px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)'
                    )}
                  >
                    £
                  </Text>

                  {/* Pulse ring effect */}
                  <Box
                    position="absolute"
                    w="full"
                    h="full"
                    borderRadius="2xl"
                    border="2px solid rgba(255,255,255,0.3)"
                    animation="ringPulse 4s infinite"
                  />
                </Box>
  
                <VStack 
                  spacing={1} 
                  align="start"
                  as="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  _hover={{
                    cursor: 'pointer',
                  }}
                >
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Personal Budget
                  </Text>
                  <Text fontSize="sm" color={secondaryTextColor}>
                    Smart Financial Management
                  </Text>
                </VStack>
              </HStack>
  
  
              {/* Right Controls */}
              <HStack spacing={3}>
                {/* Theme Toggle */}
                <Tooltip
                  label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
                >
                  <IconButton
                    aria-label="toggle theme"
                    icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                    onClick={toggleColorMode}
                    variant="ghost"
                    size="md"
                    color="white"
                  />
                </Tooltip>

                {/* User Menu or Login Button */}
                {user ? (
                  <Menu placement="bottom-end" closeOnSelect={false}>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      rightIcon={<ChevronDownIcon />}
                      leftIcon={<Avatar size="sm" name={user?.name} />}
                      color="white"
                    >
                      <VStack spacing={0} align="start">
                        <Text fontSize="sm" fontWeight="semibold">
                          {user?.name}
                        </Text>
                        <Text fontSize="xs" color={secondaryTextColor}>
                          {user?.email}
                        </Text>
                      </VStack>
                    </MenuButton>
                    <MenuList>
                      <MenuItem icon={<InfoIcon />} onClick={onProfileOpen}>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">Profile</Text>
                          <Text fontSize="xs" color="gray.500">
                            Manage your account
                          </Text>
                        </VStack>
                      </MenuItem>
                      <MenuItem icon={<SettingsIcon />} onClick={onOpenSettings}>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">Settings</Text>
                          <Text fontSize="xs" color="gray.500">
                            Preferences & privacy
                          </Text>
                        </VStack>
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem
                        icon={<ExternalLinkIcon />}
                        onClick={logout}
                        color="red.500"
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">Sign Out</Text>
                          <Text fontSize="xs" color="red.400">
                            End your session
                          </Text>
                        </VStack>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                ) : (
                  <Button
                    colorScheme="brand"
                    variant="solid"
                    onClick={onLogin}
                    size="md"
                    fontWeight="600"
                    px={6}
                    py={2}
                    borderRadius="xl"
                    bg="rgba(255,255,255,0.2)"
                    color="white"
                    border="1px solid rgba(255,255,255,0.3)"
                    backdropFilter="blur(10px)"
                    _hover={{
                      transform: 'translateY(-2px)',
                      bg: 'rgba(255,255,255,0.3)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                      borderColor: 'rgba(255,255,255,0.5)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
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
  