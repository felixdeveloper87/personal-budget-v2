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
          bg: useColorModeValue('gray.100', 'gray.700'),
          transform: 'translateY(-1px)',
        }}
        transition="all 0.2s ease"
      >
        <HStack spacing={{ base: 2, lg: 3 }}>
          <Avatar 
            size="md"
            name={user?.name}
            bg={useColorModeValue(
              'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              'linear-gradient(135deg, #60a5fa, #3b82f6)'
            )}
            boxShadow="md"
          />
        </HStack>
      </MenuButton>
      <MenuList 
        zIndex={9999}
        shadow="xl"
        borderRadius="2xl"
        overflow="hidden"
        bg={useColorModeValue(
          'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
          'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))'
        )}
        backdropFilter="blur(24px)"
        border="2px solid"
        borderColor={borderColor}
        boxShadow={useColorModeValue(
          '0 20px 50px rgba(59, 130, 246, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)',
          '0 20px 50px rgba(96, 165, 250, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4)'
        )}
        sx={{
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
          bg={useColorModeValue(
            'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.03))',
            'linear-gradient(135deg, rgba(96, 165, 250, 0.08), rgba(52, 211, 153, 0.05))'
          )}
          borderBottom="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
          <HStack spacing={4} align="center">
            <Avatar 
              size="lg"
              name={user?.name}
              bg={useColorModeValue(
                'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                'linear-gradient(135deg, #60a5fa, #3b82f6)'
              )}
              boxShadow="lg"
            />
            <VStack spacing={1} align="start" flex="1">
              <Text 
                fontSize="lg" 
                fontWeight="800" 
                color={textColor}
                bg={useColorModeValue(
                  'linear-gradient(135deg, #1e293b, #475569)',
                  'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                )}
                bgClip="text"
                letterSpacing="wide"
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
                colorScheme="green"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="full"
                fontWeight="700"
                bg="linear-gradient(135deg, #22c55e, #16a34a)"
                color="white"
                boxShadow="sm"
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
          color={currentPage === 'dashboard' ? 'blue.500' : textColor}
          fontWeight={currentPage === 'dashboard' ? '700' : '500'}
          display={{ base: 'flex', md: 'none' }}
          bg={currentPage === 'dashboard' ? 
            useColorModeValue('blue.50', 'blue.900') : 
            'transparent'
          }
          _hover={{ 
            bg: useColorModeValue('blue.50', 'blue.900'),
            color: 'blue.500'
          }}
          px={6}
          py={3}
          borderRadius="none"
        >
          Dashboard
        </MenuItem>
        <MenuItem 
          icon={<SearchIcon />}
          onClick={() => onPageChange?.('transactions')}
          color={currentPage === 'transactions' ? 'blue.500' : textColor}
          fontWeight={currentPage === 'transactions' ? '700' : '500'}
          display={{ base: 'flex', md: 'none' }}
          bg={currentPage === 'transactions' ? 
            useColorModeValue('blue.50', 'blue.900') : 
            'transparent'
          }
          _hover={{ 
            bg: useColorModeValue('blue.50', 'blue.900'),
            color: 'blue.500'
          }}
          px={6}
          py={3}
          borderRadius="none"
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
