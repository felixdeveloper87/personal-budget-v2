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
import { useThemeColors } from '../../../hooks/useThemeColors'
import { useI18n } from '../../../i18n'
import type { UserPlan } from '../../../types'
import { ON_BRAND, useOnBrand } from './onBrand'

interface UserMenuProps {
  user: any
  onOpenProfile?: () => void
  onOpenSettings?: () => void
  onLogout: () => void
  placement?: 'bottom-start' | 'bottom-end' | 'right-end'
  /** Hide the account name and chevron when space is limited. */
  compact?: boolean
  /** Adapt the trigger to the sidebar's account area. */
  sidebar?: boolean
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
  const { t } = useI18n()
  const { colorMode } = useColorMode()
  const ed = useEd() ?? editorialPalette(colorMode)
  const onBrand = useOnBrand()
  const colors = useThemeColors()
  const plan: UserPlan = user?.plan ?? 'STANDARD'
  const displayName = user?.name || t('user.defaultName')
  const displayEmail = user?.email || ''
  const planLabel = t(plan === 'PREMIUM' ? 'plan.premium' : 'plan.standard')

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
        aria-label={t('userMenu.open')}
        cursor="pointer"
        h="40px"
        px={1.5}
        borderRadius="full"
        bg={onBrand ? ON_BRAND.controlBg : ed.controlBg}
        border="1px solid"
        borderColor={onBrand ? ON_BRAND.line : line}
        backdropFilter="blur(14px)"
        display="inline-flex"
        alignItems="center"
        transition="background 0.2s ease, border-color 0.2s ease, transform 0.2s ease"
        _hover={{
          bg: onBrand ? ON_BRAND.controlHoverBg : ed.controlHoverBg,
          borderColor: onBrand ? ON_BRAND.lineStrong : jade,
          transform: 'translateY(-1px)',
        }}
        _focusVisible={{
          outline: 'none',
          boxShadow: onBrand ? ON_BRAND.focus : `0 0 0 3px ${jade}38`,
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
              color={onBrand ? ON_BRAND.ink : text}
              maxW="100px"
              isTruncated
            >
              {displayName.split(' ')[0]}
            </Text>
          ))}
          {!compact && <Icon as={ChevronDown} boxSize={3.5} color={onBrand ? ON_BRAND.inkSoft : muted} flexShrink={0} />}
        </HStack>
      </MenuButton>

      <Portal>
        <MenuList
          zIndex={9999}
          minW="292px"
          bg={colors.cardBg}
          color={colors.text.primary}
          border="2px solid"
          borderColor={colors.border}
          borderRadius="2xl"
          boxShadow="0 28px 70px -24px rgba(40, 0, 70, 0.45)"
          overflow="hidden"
          p={0}
        >
          <Box bg={NU_PURPLE} px={4} py={4} position="relative" overflow="hidden">
            <Box
              aria-hidden="true"
              position="absolute"
              top="-90px"
              right="-70px"
              w="220px"
              h="220px"
              borderRadius="full"
              border="1px solid rgba(255,255,255,0.14)"
              boxShadow="0 0 0 36px rgba(255,255,255,0.03), 0 0 0 37px rgba(255,255,255,0.1)"
              pointerEvents="none"
            />
            <Text position="relative" mb={2.5} fontSize="xs" color="rgba(255,255,255,0.84)">
              {t('userMenu.yourAccount')}
            </Text>
            <HStack spacing={3} position="relative">
              <Box p="2px" borderRadius="full" bg="rgba(255,255,255,0.32)" flexShrink={0}>
                <Avatar size="md" name={displayName} bg="white" color={NU_PURPLE} fontWeight={700} />
              </Box>
              <VStack spacing={1} align="start" flex={1} minW={0}>
                <HStack spacing={2} w="full">
                  <Text fontSize="lg" fontWeight={700} letterSpacing="-0.02em" lineHeight="1.1" color="white" noOfLines={1}>
                    {displayName}
                  </Text>
                  <Badge
                    flexShrink={0}
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    bg="rgba(255,255,255,0.18)"
                    color="white"
                    border="1px solid rgba(255,255,255,0.28)"
                    fontSize="2xs"
                    fontWeight={700}
                    textTransform="none"
                  >
                    {planLabel}
                  </Badge>
                </HStack>
                {displayEmail && (
                  <Text w="full" fontSize="xs" color="rgba(255,255,255,0.84)" noOfLines={1}>
                    {displayEmail}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Box>

          <Box p={2} bg="var(--nu-page, transparent)">
            <VStack align="stretch" spacing={2}>
              <NuMenuRow icon={User} title={t('userMenu.profile')} caption={t('userMenu.profileDescription')} onClick={onOpenProfile} />
              <NuMenuRow icon={Settings} title={t('userMenu.settings')} caption={t('userMenu.settingsDescription')} onClick={onOpenSettings} />
              <NuMenuRow icon={LogOut} title={t('userMenu.signOut')} danger onClick={onLogout} />
            </VStack>
          </Box>
        </MenuList>
      </Portal>
    </Menu>
  )
}

const NU_PURPLE = '#820ad1'

interface NuMenuRowProps {
  icon: typeof User
  title: string
  caption?: string
  danger?: boolean
  onClick?: () => void
}

function NuMenuRow({ icon, title, caption, danger, onClick }: NuMenuRowProps) {
  const colors = useThemeColors()
  const accent = danger ? '#d6336c' : NU_PURPLE
  return (
    <MenuItem
      onClick={onClick}
      bg={colors.inputBg}
      border="2px solid"
      borderColor={colors.border}
      borderRadius="2xl"
      px={{ base: 3, sm: 4 }}
      py={3}
      h="auto"
      color={danger ? accent : colors.text.primary}
      _hover={{ bg: colors.bgSecondary, borderColor: accent }}
      _focus={{ bg: colors.bgSecondary, borderColor: accent }}
      transition="border-color 0.3s ease, background 0.2s ease"
    >
      <Flex align="center" gap={2.5} w="full">
        <Flex w={{ base: 8, sm: 10 }} h={{ base: 8, sm: 10 }} borderRadius="xl" bg={colors.bgSecondary} color={accent}
          align="center" justify="center" flexShrink={0} aria-hidden>
          <Icon as={icon} boxSize={{ base: 4, sm: 5 }} />
        </Flex>
        <Box flex={1} minW={0}>
          <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight={600} lineHeight="1.1">{title}</Text>
          {caption && <Text mt={1} fontSize="xs" fontWeight={500} color={colors.text.secondary} lineHeight="1.2">{caption}</Text>}
        </Box>
        <Icon as={ChevronRight} boxSize={3.5} color={colors.text.secondary} flexShrink={0} />
      </Flex>
    </MenuItem>
  )
}
