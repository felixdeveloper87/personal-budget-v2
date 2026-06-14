import {
  Avatar,
  Badge,
  Box,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { ChevronDown, LogOut, Settings, User } from '../../ui/icons'
import { useEd } from '../../../editorial'
import type { UserPlan } from '../../../types'

interface UserMenuProps {
  user: any
  onOpenProfile?: () => void
  onOpenSettings?: () => void
  onLogout: () => void
}

const PLAN_LABEL: Record<UserPlan, string> = {
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
}

export default function UserMenu({ user, onOpenProfile, onOpenSettings, onLogout }: UserMenuProps) {
  const plan: UserPlan = user?.plan ?? 'STANDARD'
  const ed = useEd()

  const triggerBgBase = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.04)')
  const triggerBg = ed ? ed.controlBg : triggerBgBase
  const triggerBorderBase = useColorModeValue('rgba(226,232,240,0.8)', 'rgba(255,255,255,0.08)')
  const triggerBorder = ed ? ed.line : triggerBorderBase
  const triggerShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 4px rgba(15,23,42,0.04)',
    'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 4px rgba(0,0,0,0.2)',
  )
  const triggerHoverBgBase = useColorModeValue('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.08)')
  const triggerHoverBg = ed ? ed.controlHoverBg : triggerHoverBgBase
  const triggerHoverBorderBase = useColorModeValue('blue.300', 'blue.400')
  const triggerHoverBorder = ed ? ed.jade : triggerHoverBorderBase

  // NOTE: textColor/subTextColor style the dropdown popover (a light surface),
  // so they must keep their normal light/dark values even in editorial mode.
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const subTextColor = useColorModeValue('gray.500', 'gray.400')
  const triggerNameColorBase = useColorModeValue('gray.700', 'gray.200')
  const triggerNameColor = ed ? ed.cream : triggerNameColorBase
  const triggerChevronColor = ed ? ed.muted : subTextColor
  const menuListBg = useColorModeValue(
    'rgba(255, 255, 255, 0.85)',
    'rgba(15, 15, 17, 0.85)'
  )
  const borderColor = useColorModeValue('rgba(226, 232, 240, 0.8)', 'rgba(255, 255, 255, 0.08)')
  const itemHoverBg = useColorModeValue('rgba(59, 130, 246, 0.05)', 'rgba(255, 255, 255, 0.05)')
  const itemHoverColor = useColorModeValue('blue.600', 'blue.300')
  const logoutHoverBg = useColorModeValue('rgba(239, 68, 68, 0.06)', 'rgba(248, 113, 113, 0.08)')
  const sectionLabelColor = useColorModeValue('gray.400', 'gray.500')
  
  const headerBg = useColorModeValue(
    'rgba(248, 250, 252, 0.65)',
    'rgba(255, 255, 255, 0.015)'
  )
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

  const planBadgeBg = useColorModeValue(
    plan === 'PREMIUM' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(100, 116, 139, 0.06)',
    plan === 'PREMIUM' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(255, 255, 255, 0.06)'
  )
  const planBadgeColor = useColorModeValue(
    plan === 'PREMIUM' ? 'orange.600' : 'gray.600',
    plan === 'PREMIUM' ? 'yellow.300' : 'gray.400'
  )
  const planBadgeBorder = useColorModeValue(
    plan === 'PREMIUM' ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(100, 116, 139, 0.12)',
    plan === 'PREMIUM' ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)'
  )

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
        backdropFilter="blur(10px)"
        boxShadow={triggerShadow}
        display="inline-flex"
        alignItems="center"
        transition="all 0.2s ease"
        _hover={{
          bg: triggerHoverBg,
          borderColor: triggerHoverBorder,
          transform: 'translateY(-1px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 16px rgba(37, 99, 235, 0.18)',
        }}
        _focusVisible={{
          outline: 'none',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.4)',
        }}
      >
        <HStack spacing={1.5}>
          <Box
            position="relative"
            p="1.5px"
            borderRadius="full"
            background={avatarRing}
            boxShadow="0 0 0 2px rgba(255,255,255,0.6) inset"
          >
            <Avatar size="xs" name={displayName} bg="blue.500" color="white" fontWeight={700} />
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
            color={triggerNameColor}
            maxW="100px"
            isTruncated
          >
            {displayName.split(' ')[0]}
          </Text>
          <Icon as={ChevronDown} boxSize={3.5} color={triggerChevronColor} transition="transform 0.2s ease"
            sx={{ '[aria-expanded=true] &': { transform: 'rotate(180deg)' } }}
          />
        </HStack>
      </MenuButton>

      <MenuList
        zIndex={9999}
        minW="260px"
        bg={menuListBg}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        shadow="0 20px 48px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)"
        overflow="hidden"
        p={0}
      >
        {/* Accent top bar */}
        <Box h="2.5px" background={accentBar} />

        {/* User card header */}
        <Box px={4} py={3.5} background={headerBg}>
          <HStack spacing={3} align="center">
            <Box
              position="relative"
              p="1.5px"
              borderRadius="full"
              background={avatarRing}
              flexShrink={0}
            >
              <Avatar size="md" name={displayName} bg="blue.500" color="white" fontWeight={700} />
              <Box
                aria-hidden
                position="absolute"
                bottom="1px"
                right="1px"
                w="12px"
                h="12px"
                borderRadius="full"
                bg={statusDotBg}
                border="2px solid"
                borderColor={statusDotRing}
              />
            </Box>
            <VStack spacing={0.5} align="start" flex={1} minW={0}>
              <HStack spacing={1.5} flexWrap="nowrap">
                <Text
                  fontSize="sm"
                  fontWeight={700}
                  color={textColor}
                  letterSpacing="-0.01em"
                  noOfLines={1}
                >
                  {displayName}
                </Text>
                <Badge
                  fontSize="2xs"
                  fontWeight={700}
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  bg={planBadgeBg}
                  color={planBadgeColor}
                  border={planBadgeBorder}
                  textTransform="none"
                  letterSpacing="0.02em"
                  flexShrink={0}
                >
                  {PLAN_LABEL[plan]}
                </Badge>
              </HStack>
              {displayEmail && (
                <Text fontSize="xs" color={subTextColor} noOfLines={1} w="full">
                  {displayEmail}
                </Text>
              )}
            </VStack>
          </HStack>
        </Box>

        <Box h="1px" bg={borderColor} />

        {/* Account section */}
        <Box p={1.5}>
          <Text
            fontSize="2xs"
            fontWeight={700}
            color={sectionLabelColor}
            letterSpacing="0.08em"
            textTransform="uppercase"
            px={3}
            pt={2}
            pb={1.5}
          >
            Account
          </Text>
          <MenuItem
            onClick={onOpenProfile}
            bg="transparent"
            color={textColor}
            fontWeight={500}
            fontSize="sm"
            px={3}
            py={2.5}
            borderRadius="xl"
            _hover={{
              bg: itemHoverBg,
              color: itemHoverColor,
            }}
            _focus={{
              bg: itemHoverBg,
              color: itemHoverColor,
            }}
            _active={{ bg: 'transparent' }}
            transition="all 0.15s cubic-bezier(0.16, 1, 0.3, 1)"
            sx={{
              '&:hover .menu-icon': {
                transform: 'translateX(2px)',
                color: itemHoverColor,
              },
            }}
          >
            <HStack spacing={3} w="full">
              <Icon
                as={User}
                boxSize={4}
                color={subTextColor}
                className="menu-icon"
                transition="all 0.15s ease"
              />
              <Text>Profile</Text>
            </HStack>
          </MenuItem>
          <MenuItem
            onClick={onOpenSettings}
            bg="transparent"
            color={textColor}
            fontWeight={500}
            fontSize="sm"
            px={3}
            py={2.5}
            borderRadius="xl"
            _hover={{
              bg: itemHoverBg,
              color: itemHoverColor,
            }}
            _focus={{
              bg: itemHoverBg,
              color: itemHoverColor,
            }}
            _active={{ bg: 'transparent' }}
            transition="all 0.15s cubic-bezier(0.16, 1, 0.3, 1)"
            sx={{
              '&:hover .menu-icon': {
                transform: 'translateX(2px)',
                color: itemHoverColor,
              },
            }}
          >
            <HStack spacing={3} w="full">
              <Icon
                as={Settings}
                boxSize={4}
                color={subTextColor}
                className="menu-icon"
                transition="all 0.15s ease"
              />
              <Text>Settings</Text>
            </HStack>
          </MenuItem>
        </Box>

        <Box h="1px" bg={borderColor} mx={3} />

        {/* Session section */}
        <Box p={1.5}>
          <MenuItem
            onClick={onLogout}
            bg="transparent"
            color={useColorModeValue('red.500', 'red.400')}
            fontWeight={600}
            fontSize="sm"
            px={3}
            py={2.5}
            borderRadius="xl"
            _hover={{
              bg: logoutHoverBg,
              color: useColorModeValue('red.600', 'red.300'),
            }}
            _focus={{
              bg: logoutHoverBg,
              color: useColorModeValue('red.600', 'red.300'),
            }}
            _active={{ bg: 'transparent' }}
            transition="all 0.15s cubic-bezier(0.16, 1, 0.3, 1)"
            sx={{
              '&:hover .menu-icon': {
                transform: 'translateX(2px)',
                color: useColorModeValue('red.600', 'red.300'),
              },
            }}
          >
            <HStack spacing={3} w="full">
              <Icon
                as={LogOut}
                boxSize={4}
                color={useColorModeValue('red.500', 'red.400')}
                className="menu-icon"
                transition="all 0.15s ease"
              />
              <Text>Sign Out</Text>
            </HStack>
          </MenuItem>
        </Box>
      </MenuList>
    </Menu>
  )
}
