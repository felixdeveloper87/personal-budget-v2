import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  HStack,
  VStack,
  Text,
  Box,
  Badge,
  Icon,
  useColorModeValue
} from '@chakra-ui/react'
import { SettingsIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { GRADIENTS } from '../../../theme'
import { Home, FileText, User, LogOut, BarChart3 } from 'lucide-react'

interface UserMenuProps {
  user: any
  currentPage?: 'dashboard' | 'transactions' | 'charts'
  onPageChange?: (page: 'dashboard' | 'transactions' | 'charts') => void
  onOpenSettings?: () => void
  onLogout: () => void
}

export default function UserMenu({ user, currentPage, onPageChange, onOpenSettings, onLogout }: UserMenuProps) {
  const textColor = useColorModeValue('gray.800', 'white')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300')
  const cardBg = useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark)
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBorderColor = useColorModeValue('blue.200', 'blue.500')
  const triggerBg = useColorModeValue('white', 'whiteAlpha.100')
  const triggerBorder = useColorModeValue('gray.200', 'whiteAlpha.300')
  const avatarBg = useColorModeValue('blue.500', 'blue.400')
  const menuAccentGradient = useColorModeValue('linear(to-r, blue.300, purple.300)', 'linear(to-r, blue.200, purple.200)')
  const menuItemHoverBg = useColorModeValue('gray.50', 'gray.700')
  const mobileNavHoverBg = useColorModeValue('blue.50', 'blue.900')
  const logoutHoverBg = useColorModeValue('red.50', 'red.900')

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        variant="ghost"
        size={{ base: 'xs', sm: 'sm', md: 'md' }}
        p={{ base: 1, sm: 1.5, md: 2 }}
        borderRadius="xl"
        flexShrink={0}
        minW="auto"
        bg={triggerBg}
        border="1px solid"
        borderColor={triggerBorder}
        rightIcon={<ChevronDownIcon />}
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
          borderColor: hoverBorderColor,
        }}
        _focus={{
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)',
          outline: 'none'
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 0.2s ease"
      >
        <HStack spacing={{ base: 1, sm: 1.5, lg: 3 }}>
          <Avatar 
            size={{ base: 'sm', sm: 'sm', md: 'md' }}
            name={user?.name}
            bg={avatarBg}
            color="white"
            fontWeight="600"
            _hover={{
              transform: 'scale(1.05)',
            }}
            transition="transform 0.2s ease"
          />
        </HStack>
      </MenuButton>
      <MenuList 
        zIndex={9999}
        bg={cardBg}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        shadow="xl"
        overflow="hidden"
        _hover={{
          borderColor: hoverBorderColor
        }}
        transition="all 0.2s ease"
      >
        {/* Accent top border */}
        <Box
          height="2px"
          bgGradient={menuAccentGradient}
        />

        {/* Header do Menu */}
        <Box px={6} py={4}>
          <HStack spacing={3} align="center">
            <Avatar 
              size="md"
              name={user?.name}
              bg={avatarBg}
              color="white"
              fontWeight="600"
            />
            <VStack spacing={0.5} align="start" flex="1">
              <Text 
                fontSize="md" 
                fontWeight="700"
                color={textColor}
                letterSpacing="-0.01em"
                noOfLines={1}
              >
                {user?.name || 'Budget User'}
              </Text>
              <HStack spacing={2} align="center">
                <Text 
                  fontSize="xs" 
                  color={secondaryTextColor}
                  noOfLines={1}
                  maxW="150px"
                >
                  {user?.email}
                </Text>
                <Badge
                  fontSize="2xs"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontWeight="600"
                  bg={useColorModeValue('green.100', 'green.900')}
                  color={useColorModeValue('green.700', 'green.300')}
                  border="1px solid"
                  borderColor={useColorModeValue('green.200', 'green.700')}
                >
                  Active
                </Badge>
              </HStack>
            </VStack>
          </HStack>
        </Box>
        <MenuDivider m={0} />
        
        {/* Navegação mobile */}
        {currentPage !== 'dashboard' && (
          <MenuItem 
            icon={<Icon as={Home} boxSize={4} />}
            onClick={() => onPageChange?.('dashboard')}
            color={textColor}
            fontWeight="500"
            display={{ base: 'flex', md: 'none' }}
            bg="transparent"
            px={6}
            py={3}
            _hover={{ 
              bg: mobileNavHoverBg,
              color: 'blue.500'
            }}
          >
            Dashboard
          </MenuItem>
        )}
        {currentPage !== 'transactions' && (
          <MenuItem 
            icon={<Icon as={FileText} boxSize={4} />}
            onClick={() => onPageChange?.('transactions')}
            color={textColor}
            fontWeight="500"
            display={{ base: 'flex', md: 'none' }}
            bg="transparent"
            px={6}
            py={3}
            _hover={{ 
              bg: mobileNavHoverBg,
              color: 'blue.500'
            }}
          >
            All Transactions
          </MenuItem>
        )}
        {currentPage !== 'charts' && (
          <MenuItem 
            icon={<Icon as={BarChart3} boxSize={4} />}
            onClick={() => onPageChange?.('charts')}
            color={textColor}
            fontWeight="500"
            display={{ base: 'flex', md: 'none' }}
            bg="transparent"
            px={6}
            py={3}
            _hover={{ 
              bg: mobileNavHoverBg,
              color: 'blue.500'
            }}
          >
            Charts
          </MenuItem>
        )}
        <MenuDivider display={{ base: 'block', md: 'none' }} m={0} />
        
        <MenuItem 
          icon={<Icon as={User} boxSize={4} />}
          color={textColor}
          fontWeight="500"
          px={6}
          py={3}
          _hover={{ 
            bg: menuItemHoverBg,
            color: 'blue.500'
          }}
        >
          Profile
        </MenuItem>
        <MenuItem 
          icon={<SettingsIcon />} 
          onClick={onOpenSettings}
          color={textColor}
          fontWeight="500"
          px={6}
          py={3}
          _hover={{ 
            bg: menuItemHoverBg,
            color: 'blue.500'
          }}
        >
          Settings
        </MenuItem>
        <MenuDivider m={0} />
        <MenuItem 
          icon={<Icon as={LogOut} boxSize={4} />} 
          onClick={onLogout} 
          color="red.500"
          fontWeight="600"
          px={6}
          py={3}
          _hover={{ 
            bg: logoutHoverBg,
            color: 'red.600'
          }}
        >
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
