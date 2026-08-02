import {
  Avatar,
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  useColorMode,
  VStack,
} from '@chakra-ui/react'
import { ChevronDown, ChevronRight, LogOut, Settings, User } from '../../ui/icons'
import { editorialPalette, useEd } from '../../../editorial'
import type { UserPlan } from '../../../types'

interface UserMenuProps {
  user: any
  onOpenProfile?: () => void
  onOpenSettings?: () => void
  onLogout: () => void
  placement?: 'bottom-end' | 'right-end'
  /** Hide the account name and chevron when space is limited. */
  compact?: boolean
  /** Adapt the trigger to the sidebar's account area. */
  sidebar?: boolean
}

const PLAN_LABEL: Record<UserPlan, string> = {
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
}

export default function UserMenu({
  user,
  onOpenProfile,
  onOpenSettings,
  onLogout,
  placement = 'bottom-end',
  compact = false,
  sidebar = false,
}: UserMenuProps) {
  const { colorMode } = useColorMode()
  const ed = useEd() ?? editorialPalette(colorMode)
  const plan: UserPlan = user?.plan ?? 'STANDARD'
  const displayName = user?.name || 'Budget User'
  const displayEmail = user?.email || ''

  const {
    solid: surface,
    panelRaised: raised,
    cream: text,
    muted,
    line,
    lineStrong,
    jade,
    gold,
    red,
  } = ed

  const avatarGradient = `linear-gradient(135deg, ${jade}, ${gold})`
  const planColor = plan === 'PREMIUM' ? gold : muted
  const planBg = plan === 'PREMIUM' ? `${gold}18` : raised

  const menuItem = {
    bg: 'transparent',
    color: text,
    textStyle: 'body',
    fontWeight: 600,
    fontSize: 'sm',
    h: '54px',
    px: 2,
    borderRadius: '10px',
    transition: 'background 0.18s ease, color 0.18s ease, transform 0.18s ease',
  } as const

  return (
    <Menu placement={placement} autoSelect={false}>
      <MenuButton
        as={Box}
        role="button"
        aria-label="Open user menu"
        cursor="pointer"
        h="40px"
        px={1.5}
        borderRadius="full"
        bg={ed.controlBg}
        border="1px solid"
        borderColor={line}
        backdropFilter="blur(14px)"
        display="inline-flex"
        alignItems="center"
        transition="background 0.2s ease, border-color 0.2s ease, transform 0.2s ease"
        _hover={{
          bg: ed.controlHoverBg,
          borderColor: jade,
          transform: 'translateY(-1px)',
        }}
        _focusVisible={{
          outline: 'none',
          boxShadow: `0 0 0 3px ${jade}38`,
        }}
      >
        <HStack spacing={1.5}>
          <Box position="relative" p="1.5px" borderRadius="full" background={avatarGradient}>
            <Avatar
              size="xs"
              name={displayName}
              bg={surface}
              color={jade}
              fontWeight={700}
            />
            <Box
              aria-hidden
              position="absolute"
              bottom="-1px"
              right="-1px"
              w="9px"
              h="9px"
              borderRadius="full"
              bg={jade}
              border="2px solid"
              borderColor={surface}
            />
          </Box>
          {!compact && (sidebar ? (
            <Text
              textStyle="display"
              fontSize="sm"
              color={text}
              maxW="86px"
              isTruncated
            >
              {displayName.split(' ')[0]}
            </Text>
          ) : (
            <Text
              display={{ base: 'none', md: 'block' }}
              textStyle="display"
              fontSize="md"
              color={text}
              maxW="100px"
              isTruncated
            >
              {displayName.split(' ')[0]}
            </Text>
          ))}
          {!compact && <Icon as={ChevronDown} boxSize={3.5} color={muted} flexShrink={0} />}
        </HStack>
      </MenuButton>

      <Portal>
        <MenuList
          zIndex={9999}
          minW="292px"
          bg={surface}
          color={text}
          textStyle="body"
          border="1px solid"
          borderColor={lineStrong}
          borderRadius="16px"
          boxShadow="0 28px 70px -24px rgba(0,0,0,0.72)"
          overflow="hidden"
          p={0}
        >
        <Box h="3px" bg={`linear-gradient(90deg, ${jade}, ${gold})`} />

        <Box
          px={4}
          py={3.5}
          bg={raised}
          borderBottom="1px solid"
          borderColor={line}
          backgroundImage={`linear-gradient(135deg, ${jade}0D 0%, transparent 56%, ${gold}0D 100%)`}
        >
          <Text
            mb={2.5}
            textStyle="mono"
            fontSize="2xs"
            fontWeight={700}
            color={muted}
            letterSpacing="0.14em"
            textTransform="uppercase"
          >
            Your account
          </Text>
          <HStack spacing={3}>
            <Box p="2px" borderRadius="full" background={avatarGradient} flexShrink={0}>
              <Avatar size="md" name={displayName} bg={surface} color={jade} fontWeight={700} />
            </Box>
            <VStack spacing={1} align="start" flex={1} minW={0}>
              <HStack spacing={2} w="full">
                <Text
                  textStyle="display"
                  fontSize="lg"
                  lineHeight="1"
                  color={text}
                  noOfLines={1}
                >
                  {displayName}
                </Text>
                <Badge
                  flexShrink={0}
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  bg={planBg}
                  color={planColor}
                  border="1px solid"
                  borderColor={line}
                  textStyle="mono"
                  fontSize="2xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  letterSpacing="0.06em"
                >
                  {PLAN_LABEL[plan]}
                </Badge>
              </HStack>
              {displayEmail && (
                <Text
                  w="full"
                  textStyle="mono"
                  fontSize="2xs"
                  color={muted}
                  letterSpacing="0.025em"
                  noOfLines={1}
                >
                  {displayEmail}
                </Text>
              )}
            </VStack>
          </HStack>
        </Box>

        <Box p={1.5}>
          <Text
            px={3}
            pt={1.5}
            pb={1}
            textStyle="mono"
            fontSize="2xs"
            fontWeight={600}
            color={muted}
            letterSpacing="0.1em"
            textTransform="uppercase"
          >
            Account
          </Text>
          <MenuItem
            {...menuItem}
            onClick={onOpenProfile}
            _hover={{ bg: ed.jadeSoft, color: jade, transform: 'translateX(2px)' }}
            _focus={{ bg: ed.jadeSoft, color: jade }}
          >
            <Flex align="center" gap={3} w="full">
              <Flex
                align="center"
                justify="center"
                boxSize="32px"
                borderRadius="9px"
                bg={`${jade}16`}
                color={jade}
                flexShrink={0}
              >
                <Icon as={User} boxSize={4} />
              </Flex>
              <Box flex={1} minW={0}>
                <Text lineHeight={1.15}>Profile</Text>
                <Text mt={0.5} fontSize="xs" fontWeight={400} color={muted} lineHeight={1.1}>
                  Personal details
                </Text>
              </Box>
              <Icon as={ChevronRight} boxSize={3.5} color={muted} flexShrink={0} />
            </Flex>
          </MenuItem>
          <MenuItem
            {...menuItem}
            onClick={onOpenSettings}
            _hover={{ bg: ed.jadeSoft, color: jade, transform: 'translateX(2px)' }}
            _focus={{ bg: ed.jadeSoft, color: jade }}
          >
            <Flex align="center" gap={3} w="full">
              <Flex
                align="center"
                justify="center"
                boxSize="32px"
                borderRadius="9px"
                bg={`${gold}16`}
                color={gold}
                flexShrink={0}
              >
                <Icon as={Settings} boxSize={4} />
              </Flex>
              <Box flex={1} minW={0}>
                <Text lineHeight={1.15}>Settings</Text>
                <Text mt={0.5} fontSize="xs" fontWeight={400} color={muted} lineHeight={1.1}>
                  Preferences and security
                </Text>
              </Box>
              <Icon as={ChevronRight} boxSize={3.5} color={muted} flexShrink={0} />
            </Flex>
          </MenuItem>
        </Box>

        <Box h="1px" bg={line} mx={3} />

        <Box p={1.5}>
          <MenuItem
            {...menuItem}
            h="46px"
            onClick={onLogout}
            color={red}
            _hover={{ bg: `${red}12`, color: red, transform: 'translateX(2px)' }}
            _focus={{ bg: `${red}12`, color: red }}
          >
            <Flex align="center" gap={3} w="full">
              <Flex
                align="center"
                justify="center"
                boxSize="30px"
                borderRadius="9px"
                bg={`${red}12`}
                flexShrink={0}
              >
                <Icon as={LogOut} boxSize={4} />
              </Flex>
              <Text flex={1}>Sign out</Text>
              <Icon as={ChevronRight} boxSize={3.5} color={red} />
            </Flex>
          </MenuItem>
        </Box>
        </MenuList>
      </Portal>
    </Menu>
  )
}
