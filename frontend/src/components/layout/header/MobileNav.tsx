import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  useDisclosure,
  usePrefersReducedMotion,
} from '@chakra-ui/react'
import { useMemo, useRef } from 'react'
import { useI18n } from '../../../i18n'
import { DotsThreeOutline } from '../../ui/icons'
import NuModalHeader from '../../ui/NuModalHeader'
import { ON_BRAND } from './onBrand'
import {
  localizeNavigationItems,
  navItemIdFor,
  type AppPage,
  type NavItem,
} from './navigation.config'

interface MobileNavProps {
  currentPage: AppPage
  onPageChange?: (page: AppPage) => void
  items: ReadonlyArray<NavItem>
}

const PRIMARY_IDS: ReadonlyArray<AppPage> = [
  'dashboard',
  'household',
  'earnings',
  'behaviour',
]

function tapFeedback() {
  try {
    navigator.vibrate?.(8)
  } catch {
    // Haptics are an enhancement and may be unavailable or disabled.
  }
}

export default function MobileNav({ currentPage, onPageChange, items }: MobileNavProps) {
  const { t } = useI18n()
  const menu = useDisclosure()
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  const localizedItems = useMemo(
    () => localizeNavigationItems(items, (key, fallback) => t(key, undefined, fallback)),
    [items, t],
  )

  const primaryItems = useMemo(() => {
    if (localizedItems.length <= 5) return localizedItems

    const preferred = PRIMARY_IDS
      .map((id) => localizedItems.find((item) => item.id === id))
      .filter((item): item is NavItem => Boolean(item))

    const fallback = localizedItems.filter((item) => !preferred.some(({ id }) => id === item.id))
    return [...preferred, ...fallback].slice(0, 4)
  }, [localizedItems])

  const primaryIds = useMemo(() => new Set(primaryItems.map(({ id }) => id)), [primaryItems])
  const overflowItems = useMemo(
    () => localizedItems.filter(({ id }) => !primaryIds.has(id)),
    [localizedItems, primaryIds],
  )
  const activeId = navItemIdFor(currentPage)
  const menuIsActive = overflowItems.some(({ id }) => id === activeId)

  const selectPage = (page: AppPage, closeMenu = false) => {
    tapFeedback()
    if (closeMenu) menu.onClose()
    onPageChange?.(page)
  }

  const openMenu = () => {
    tapFeedback()
    menu.onOpen()
  }

  return (
    <>
      <HStack
        as="nav"
        aria-label={t('header.nav.primary')}
        spacing={1}
        justify="space-around"
        w="full"
        maxW="560px"
        mx="auto"
      >
        {primaryItems.map((item) => (
          <MobileNavButton
            key={item.id}
            item={item}
            active={activeId === item.id}
            reducedMotion={Boolean(reducedMotion)}
            onClick={() => selectPage(item.id)}
          />
        ))}

        {overflowItems.length > 0 && (
          <Box
            ref={menuButtonRef}
            as="button"
            type="button"
            aria-label={t('mobileNav.openMenu')}
            aria-haspopup="dialog"
            aria-expanded={menu.isOpen}
            onClick={openMenu}
            flex="1 1 0"
            minW={0}
            maxW="92px"
            h="64px"
            borderRadius="18px"
            color={ON_BRAND.ink}
            position="relative"
            transition={reducedMotion ? 'none' : 'transform 140ms ease, background 180ms ease'}
            _hover={{ bg: ON_BRAND.controlBg }}
            _active={{ transform: reducedMotion ? 'none' : 'scale(0.94)', bg: ON_BRAND.controlHoverBg }}
            _focusVisible={{ outline: 'none', boxShadow: ON_BRAND.focus }}
          >
            <MobileNavContent
              icon={DotsThreeOutline}
              label={t('mobileNav.menu')}
              active={menuIsActive || menu.isOpen}
              reducedMotion={Boolean(reducedMotion)}
            />
          </Box>
        )}
      </HStack>

      <Drawer
        isOpen={menu.isOpen}
        placement="bottom"
        onClose={menu.onClose}
        finalFocusRef={menuButtonRef}
        returnFocusOnClose
      >
        <DrawerOverlay bg="var(--pb-overlay, rgba(20, 0, 32, 0.54))" backdropFilter="blur(8px)" />
        <DrawerContent
          className="nu-dashboard"
          borderTopRadius="22px"
          bg="var(--nu-page, #ffffff)"
          color="var(--pb-ink)"
          maxH="min(82dvh, 720px)"
          boxShadow="0 -20px 50px -20px rgba(20, 35, 32, 0.35)"
          overflow="hidden"
          sx={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <NuModalHeader title={t('mobileNav.title')} caption={t('mobileNav.description')} onClose={menu.onClose} />
          <DrawerBody p={3} overflowY="auto">
            <SimpleGrid columns={2} spacing={2.5}>
              {localizedItems.map((item, index) => {
                const active = activeId === navItemIdFor(item.id)
                const spanLast = localizedItems.length % 2 === 1 && index === localizedItems.length - 1
                return (
                  <Box
                    key={item.id}
                    as="button"
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => selectPage(item.id, true)}
                    gridColumn={spanLast ? 'span 2' : undefined}
                    textAlign="left"
                    minH="104px"
                    px={{ base: 3, sm: 4 }}
                    py={3}
                    borderRadius="2xl"
                    border="2px solid"
                    borderColor={active ? '#820ad1' : 'var(--pb-hair)'}
                    bg={active ? 'var(--pb-surface-2)' : 'var(--pb-control, var(--pb-surface))'}
                    color="var(--pb-ink)"
                    transition={reducedMotion ? 'none' : 'transform 140ms ease, border-color 0.3s ease, box-shadow 0.3s ease'}
                    _hover={{ borderColor: '#820ad1' }}
                    _active={{ transform: reducedMotion ? 'none' : 'scale(0.97)' }}
                    _focusVisible={{ outline: 'none', boxShadow: '0 0 0 3px #820ad120', borderColor: '#820ad1' }}
                  >
                    <Flex w={8} h={8} align="center" justify="center" borderRadius="xl" bg="var(--pb-surface-2)" color="#820ad1">
                      <Icon as={item.icon} boxSize={4} weight={active ? 'fill' : 'regular'} />
                    </Flex>
                    <Text mt={2} fontSize="sm" fontWeight={600} lineHeight="shorter" noOfLines={1}>
                      {item.label}
                    </Text>
                    <Text mt={1} color="var(--pb-ink-soft)" fontSize="xs" fontWeight={500} lineHeight="short" noOfLines={2}>
                      {item.description}
                    </Text>
                  </Box>
                )
              })}
            </SimpleGrid>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

interface MobileNavButtonProps {
  item: NavItem
  active: boolean
  reducedMotion: boolean
  onClick: () => void
}

function MobileNavButton({ item, active, reducedMotion, onClick }: MobileNavButtonProps) {
  return (
    <Box
      as="button"
      type="button"
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      flex="1 1 0"
      minW={0}
      maxW="92px"
      h="64px"
      borderRadius="18px"
      color={ON_BRAND.ink}
      position="relative"
      transition={reducedMotion ? 'none' : 'transform 140ms ease, background 180ms ease'}
      _hover={{ bg: ON_BRAND.controlBg }}
      _active={{ transform: reducedMotion ? 'none' : 'scale(0.94)', bg: ON_BRAND.controlHoverBg }}
      _focusVisible={{ outline: 'none', boxShadow: ON_BRAND.focus }}
    >
      <MobileNavContent
        icon={item.icon}
        label={item.shortLabel}
        active={active}
        reducedMotion={reducedMotion}
      />
    </Box>
  )
}

interface MobileNavContentProps {
  icon: NavItem['icon']
  label: string
  active: boolean
  reducedMotion: boolean
}

function MobileNavContent({ icon, label, active, reducedMotion }: MobileNavContentProps) {
  return (
    <Flex direction="column" align="center" justify="center" h="full" gap="3px">
      <Flex
        align="center"
        justify="center"
        w={active ? '46px' : '40px'}
        h="36px"
        borderRadius="full"
        bg={active ? 'rgba(255,255,255,0.20)' : 'transparent'}
        boxShadow={active ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : 'none'}
        transition={reducedMotion ? 'none' : 'width 220ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms ease'}
      >
        <Icon
          as={icon}
          boxSize={active ? '28px' : '27px'}
          weight={active ? 'fill' : 'regular'}
          opacity={active ? 1 : 0.74}
          transition={reducedMotion ? 'none' : 'transform 180ms ease, opacity 180ms ease'}
          transform={active ? 'translateY(-1px)' : 'none'}
        />
      </Flex>
      <Text
        maxW="100%"
        px={1}
        fontSize="10px"
        lineHeight="12px"
        fontWeight={active ? 800 : 600}
        letterSpacing={active ? '0' : '0.01em'}
        opacity={active ? 1 : 0.72}
        noOfLines={1}
      >
        {label}
      </Text>
      <Box
        aria-hidden
        position="absolute"
        bottom="1px"
        w={active ? '18px' : 0}
        h="3px"
        borderRadius="full"
        bg="white"
        opacity={active ? 0.95 : 0}
        transition={reducedMotion ? 'none' : 'width 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 160ms ease'}
      />
    </Flex>
  )
}
