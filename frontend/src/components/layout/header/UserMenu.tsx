import {
  Avatar,
  Badge,
  Box,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { ChevronDown, LogOut, Settings, User } from '../../ui/icons'
import { GRADIENTS } from '../../../theme'

interface UserMenuProps {
  user: any
  onOpenSettings?: () => void
  onLogout: () => void
}

export default function UserMenu({ user, onOpenSettings, onLogout }: UserMenuProps) {
  const triggerBg = useColorModeValue('white', 'whiteAlpha.100')
  const triggerBorder = useColorModeValue('gray.200', 'whiteAlpha.300')
  const triggerHoverBorder = useColorModeValue('blue.300', 'blue.400')
  const textColor = useColorModeValue('gray.800', 'white')
  const subTextColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark)
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const itemHoverBg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const logoutHoverBg = useColorModeValue('red.50', 'red.900')
  const accentBar = useColorModeValue(
    'linear-gradient(90deg, #3b82f6, #8b5cf6)',
    'linear-gradient(90deg, #60a5fa, #a78bfa)',
  )
  const avatarRing = useColorModeValue(
    'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    'linear-gradient(135deg, #60a5fa, #a78bfa)',
  )
  const statusDotBg = useColorModeValue('green.400', 'green.300')
  const statusDotRing = useColorModeValue('white', 'gray.900')
  const badgeBg = useColorModeValue('green.100', 'green.900')
  const badgeColor = useColorModeValue('green.700', 'green.300')
  const badgeBorder = useColorModeValue('green.200', 'green.700')

  const displayName = user?.name || 'Budget User'
  const displayEmail = user?.email || ''

  return (
    <Menu placement="bottom-end" autoSelect={false}>
      <MenuButton
        as={Box}
        role="button"
        aria-label="Open user menu"
        cursor="pointer"
        h="40px"
        px={1.5}
        borderRadius="xl"
        bg={triggerBg}
        border="1px solid"
        borderColor={triggerBorder}
        boxShadow="0 1px 2px rgba(15, 23, 42, 0.04)"
        display="inline-flex"
        alignItems="center"
        transition="all 0.2s ease"
        _hover={{
          borderColor: triggerHoverBorder,
          transform: 'translateY(-1px)',
          boxShadow: '0 6px 16px rgba(37, 99, 235, 0.18)',
        }}
        _focusVisible={{
          outline: 'none',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.4)',
        }}
      >
        <HStack spacing={1.5}>
          <Box
            position="relative"
            p="2px"
            borderRadius="full"
            background={avatarRing}
            boxShadow="0 0 0 2px rgba(255,255,255,0.6) inset"
          >
            <Avatar
              size="xs"
              name={displayName}
              bg="blue.500"
              color="white"
              fontWeight={700}
            />
            <Box
              aria-hidden
              position="absolute"
              bottom="-1px"
              right="-1px"
              w="10px"
              h="10px"
              borderRadius="full"
              bg={statusDotBg}
              border="2px solid"
              borderColor={statusDotRing}
            />
          </Box>
          <Text
            display={{ base: 'none', md: 'block' }}
            fontSize="sm"
            fontWeight={600}
            color={textColor}
            maxW="120px"
            isTruncated
            pr={1}
          >
            {displayName.split(' ')[0]}
          </Text>
          <Icon as={ChevronDown} boxSize={3.5} color={subTextColor} />
        </HStack>
      </MenuButton>

      <MenuList
        zIndex={9999}
        minW="280px"
        bg={cardBg}
        backdropFilter="blur(14px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        shadow="2xl"
        overflow="hidden"
        p={0}
      >
        <Box height="3px" background={accentBar} />

        <Box px={4} py={3.5}>
          <HStack spacing={3} align="center">
            <Box
              position="relative"
              p="2px"
              borderRadius="full"
              background={avatarRing}
            >
              <Avatar size="md" name={displayName} bg="blue.500" color="white" fontWeight={700} />
              <Box
                aria-hidden
                position="absolute"
                bottom="2px"
                right="2px"
                w="12px"
                h="12px"
                borderRadius="full"
                bg={statusDotBg}
                border="2px solid"
                borderColor={statusDotRing}
              />
            </Box>
            <VStack spacing={0.5} align="start" flex={1} minW={0}>
              <Text
                fontSize="sm"
                fontWeight={700}
                color={textColor}
                letterSpacing="-0.01em"
                noOfLines={1}
                w="full"
              >
                {displayName}
              </Text>
              {displayEmail && (
                <Text fontSize="xs" color={subTextColor} noOfLines={1} w="full">
                  {displayEmail}
                </Text>
              )}
              <Badge
                mt={1}
                fontSize="2xs"
                fontWeight={700}
                px={2}
                py={0.5}
                borderRadius="full"
                bg={badgeBg}
                color={badgeColor}
                border="1px solid"
                borderColor={badgeBorder}
                textTransform="none"
              >
                Active
              </Badge>
            </VStack>
          </HStack>
        </Box>

        <MenuDivider m={0} borderColor={borderColor} />

        <MenuItem
          icon={<Icon as={User} boxSize={4} />}
          color={textColor}
          fontWeight={500}
          fontSize="sm"
          px={4}
          py={3}
          _hover={{ bg: itemHoverBg, color: 'blue.500' }}
          _focus={{ bg: itemHoverBg, color: 'blue.500' }}
        >
          Profile
        </MenuItem>
        <MenuItem
          icon={<Icon as={Settings} weight="bold" boxSize={4} />}
          onClick={onOpenSettings}
          color={textColor}
          fontWeight={500}
          fontSize="sm"
          px={4}
          py={3}
          _hover={{ bg: itemHoverBg, color: 'blue.500' }}
          _focus={{ bg: itemHoverBg, color: 'blue.500' }}
        >
          Settings
        </MenuItem>

        <MenuDivider m={0} borderColor={borderColor} />

        <MenuItem
          icon={<Icon as={LogOut} boxSize={4} />}
          onClick={onLogout}
          color="red.500"
          fontWeight={600}
          fontSize="sm"
          px={4}
          py={3}
          _hover={{ bg: logoutHoverBg, color: 'red.600' }}
          _focus={{ bg: logoutHoverBg, color: 'red.600' }}
        >
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
