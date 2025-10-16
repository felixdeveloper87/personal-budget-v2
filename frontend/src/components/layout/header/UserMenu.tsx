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
import { SearchIcon, SettingsIcon, InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { getShimmerStyles } from '../../../utils/ui'
import { 
  getUserMenuStyles, 
  getUserMenuSxStyles,
  getUserMenuHeaderStyles, 
  getUserMenuHeaderSxStyles,
  getUserMenuAvatarStyles, 
  getUserMenuAvatarSxStyles,
  getUserMenuTitleStyles, 
  getUserMenuTitleSxStyles,
  getUserMenuBadgeStyles,
  getUserMenuBadgeSxStyles,
  getMobileNavButtonStyles
} from '../../ui/headerStyles'
import { Zap } from 'lucide-react'

interface UserMenuProps {
  user: any
  currentPage?: 'dashboard' | 'transactions'
  onPageChange?: (page: 'dashboard' | 'transactions') => void
  onOpenSettings?: () => void
  onLogout: () => void
}

export default function UserMenu({ user, currentPage, onPageChange, onOpenSettings, onLogout }: UserMenuProps) {
  const textColor = useColorModeValue('gray.800', 'white')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue(
    'rgba(59, 130, 246, 0.2)',
    'rgba(96, 165, 250, 0.3)'
  )

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        variant="ghost"
        size="md"
        p={2}
        borderRadius="lg"
        _hover={{
          transform: 'scale(1.02)',
        }}
        _focus={{
          boxShadow: 'none',
          outline: 'none'
        }}
        _active={{
          boxShadow: 'none',
          transform: 'scale(1.02)'
        }}
        transition="all 0.2s ease"
        sx={{
          '&:hover .chakra-avatar__initials': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease'
          }
        }}
      >
        <HStack spacing={{ base: 2, lg: 3 }}>
          <Avatar 
            size="md"
            name={user?.name}
            {...getUserMenuAvatarStyles()}
            sx={getUserMenuAvatarSxStyles()}
          />
        </HStack>
      </MenuButton>
      <MenuList 
        zIndex={9999}
        {...getUserMenuStyles()}
        border="2px solid"
        sx={{
          ...getUserMenuSxStyles(),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            ...getShimmerStyles()
          }
        }}
      >
        {/* Header do Menu */}
        <Box 
          px={6} 
          py={5}
          {...getUserMenuHeaderStyles()}
          sx={getUserMenuHeaderSxStyles()}
        >
          <HStack spacing={4} align="center">
            <Avatar 
              size="lg"
              name={user?.name}
              {...getUserMenuAvatarStyles()}
              sx={getUserMenuAvatarSxStyles()}
            />
            <VStack spacing={1} align="start" flex="1">
              <Text 
                fontSize="lg" 
                {...getUserMenuTitleStyles()}
                sx={getUserMenuTitleSxStyles()}
              >
                Budget
              </Text>
              <Text 
                fontSize="sm" 
                color={secondaryTextColor}
                noOfLines={1}
                maxW="200px"
              >
                {user?.email}
              </Text>
              <Badge
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="full"
                fontWeight="700"
                {...getUserMenuBadgeStyles()}
                sx={getUserMenuBadgeSxStyles()}
              >
                Active
              </Badge>
            </VStack>
          </HStack>
        </Box>
        <MenuDivider m={0} />
        
        {/* Navegação mobile */}
        <MenuItem 
          icon={<Icon as={Zap} boxSize={4} />}
          onClick={() => onPageChange?.('dashboard')}
          {...getMobileNavButtonStyles(currentPage === 'dashboard')}
        >
          Dashboard
        </MenuItem>
        <MenuItem 
          icon={<SearchIcon />}
          onClick={() => onPageChange?.('transactions')}
          {...getMobileNavButtonStyles(currentPage === 'transactions')}
        >
          Transactions
        </MenuItem>
        <MenuDivider display={{ base: 'block', md: 'none' }} m={0} />
        
        <MenuItem 
          icon={<InfoIcon />}
          color={textColor}
          fontWeight="500"
          px={6}
          py={3}
          _hover={{ 
            bg: useColorModeValue('gray.50', 'gray.700'),
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
            bg: useColorModeValue('gray.50', 'gray.700'),
            color: 'blue.500'
          }}
        >
          Settings
        </MenuItem>
        <MenuDivider m={0} />
        <MenuItem 
          icon={<ExternalLinkIcon />} 
          onClick={onLogout} 
          color="red.500"
          fontWeight="700"
          px={6}
          py={3}
          _hover={{ 
            bg: useColorModeValue('red.50', 'red.900'),
            color: 'red.600'
          }}
        >
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
