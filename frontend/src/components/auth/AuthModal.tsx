import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Check, Download, Lock, ShieldCheck } from '../ui/icons'
import { AppCloseButton, PremiumModal } from '../ui'
import { BRAND } from '../layout/header/brand.config'
import BrandMark from '../brand/BrandMark'
import LoginForm from './LoginForm'
import PasswordResetForm from './PasswordResetForm'
import { AUTH_COLORS as C, AUTH_FONTS as F } from './authTheme'
import { useI18n } from '../../i18n'

const RegisterForm = lazy(() => import('./RegisterForm'))

export type AuthTab = 'signIn' | 'signUp'
type AuthView = AuthTab | 'forgotPassword'

interface AuthTabConfig {
  id: AuthView
  label: string
  kicker: string
  title: string
  description: string
  asideTitle: string
  asideDescription: string
}

const TABS: ReadonlyArray<AuthTab> = ['signIn', 'signUp']

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: AuthTab
}

function BrandLockup({ onBrand = false, compact = false }: { onBrand?: boolean; compact?: boolean }) {
  const { t } = useI18n()
  return (
    <HStack spacing={3} minW={0}>
      <BrandMark size={compact ? 34 : 44} colorMode={onBrand ? 'dark' : 'light'} />
      <VStack align="flex-start" spacing={0.5} minW={0}>
        <Text
          color={onBrand ? C.onBrand : C.ink}
          fontFamily={F.body}
          fontSize={compact ? 'md' : 'lg'}
          fontWeight={700}
          letterSpacing="-0.02em"
          lineHeight={1.1}
          noOfLines={1}
        >
          Personal Budget
        </Text>
        <Text
          color={onBrand ? 'rgba(255,255,255,0.78)' : C.inkSoft}
          fontFamily={F.body}
          fontSize="xs"
          noOfLines={1}
        >
          {t('brand.tagline', undefined, BRAND.tagline)}
        </Text>
      </VStack>
    </HStack>
  )
}

/** Purple brand panel — the same band + line-art language as the app's NuHero. */
function AuthAside({ tab }: { tab: AuthTabConfig }) {
  const { t } = useI18n()
  const isSignUp = tab.id === 'signUp'
  const details = isSignUp
    ? [
        { icon: Check, label: t('auth.aside.freeAccess') },
        { icon: ShieldCheck, label: t('auth.aside.review') },
        { icon: Download, label: t('auth.aside.exports') },
      ]
    : [
        { icon: Lock, label: t('auth.aside.privateWorkspace') },
        { icon: Check, label: t('auth.aside.connectedPlans') },
        { icon: Download, label: t('auth.aside.portableData') },
      ]

  return (
    <Flex
      as="aside"
      position="relative"
      display={{ base: 'none', md: 'flex' }}
      minW={0}
      flexDirection="column"
      overflow="hidden"
      p={{ md: 8, lg: 10 }}
      bg={C.brandBand}
      color={C.onBrand}
    >
      <Box
        aria-hidden="true"
        position="absolute"
        top="-140px"
        right="-180px"
        w="440px"
        h="440px"
        borderRadius="full"
        border="1px solid rgba(255,255,255,0.14)"
        boxShadow="0 0 0 56px rgba(255,255,255,0.03), 0 0 0 57px rgba(255,255,255,0.10), 0 0 0 128px rgba(255,255,255,0.02), 0 0 0 129px rgba(255,255,255,0.08)"
        pointerEvents="none"
      />

      <Box position="relative" zIndex={1}>
        <BrandLockup onBrand />
      </Box>

      <VStack position="relative" zIndex={1} align="stretch" spacing={5} mt="auto">
        <Text
          maxW="340px"
          fontFamily={F.body}
          fontSize={{ md: '2xl', lg: '3xl' }}
          fontWeight={700}
          letterSpacing="-0.03em"
          lineHeight={1.1}
        >
          {tab.asideTitle}
        </Text>
        <Text maxW="340px" color="rgba(255,255,255,0.84)" fontFamily={F.body} fontSize="sm" lineHeight={1.65}>
          {tab.asideDescription}
        </Text>

        <VStack align="stretch" spacing={2.5} pt={2}>
          {details.map(({ icon: DetailIcon, label }) => (
            <HStack key={label} spacing={3}>
              <Flex
                w={8}
                h={8}
                flexShrink={0}
                align="center"
                justify="center"
                borderRadius="full"
                bg="rgba(255,255,255,0.16)"
              >
                <DetailIcon size={15} weight="bold" aria-hidden />
              </Flex>
              <Text fontFamily={F.body} fontSize="sm" fontWeight={500}>
                {label}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Flex>
  )
}

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = 'signIn',
}: AuthModalProps) {
  const { t } = useI18n()
  const [view, setView] = useState<AuthView>(initialTab)

  const tabs = useMemo(
    () => TABS.map((id): AuthTabConfig => ({
      id,
      label: t(`auth.tab.${id}.label`),
      kicker: t(`auth.tab.${id}.kicker`),
      title: t(`auth.tab.${id}.title`),
      description: t(`auth.tab.${id}.description`),
      asideTitle: t(`auth.tab.${id}.asideTitle`),
      asideDescription: t(`auth.tab.${id}.asideDescription`),
    })),
    [t],
  )

  useEffect(() => {
    if (isOpen) setView(initialTab)
  }, [initialTab, isOpen])

  const recoveryView = useMemo<AuthTabConfig | null>(() => {
    if (view === 'forgotPassword') {
      return {
        id: view,
        label: '',
        kicker: t('auth.forgot.kicker'),
        title: t('auth.forgot.title'),
        description: t('auth.forgot.description'),
        asideTitle: t('auth.forgot.asideTitle'),
        asideDescription: t('auth.forgot.asideDescription'),
      }
    }
    return null
  }, [t, view])

  const activeTab = recoveryView ?? tabs.find((item) => item.id === view) ?? tabs[0]
  const isAuthTab = view === 'signIn' || view === 'signUp'

  const moveTabFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isAuthTab) return
    const currentIndex = tabs.findIndex((item) => item.id === view)
    let nextIndex = currentIndex
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = tabs.length - 1
    else return

    event.preventDefault()
    const nextTab = tabs[nextIndex].id
    setView(nextTab)
    window.requestAnimationFrame(() => document.getElementById(`auth-tab-${nextTab}`)?.focus())
  }

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      aria-label={activeTab.title}
      contentProps={{
        bg: C.page,
        // The shared modal styles pad the content; the purple panel runs edge to edge.
        sx: { padding: '0 !important' },
        w: { base: '100vw', sm: 'calc(100vw - 32px)', md: '920px' },
        maxW: { base: '100vw', sm: 'calc(100vw - 32px)', md: '920px' },
        h: {
          base: '100dvh',
          sm: view === 'signUp'
            ? 'min(840px, calc(100dvh - 32px))'
            : 'min(720px, calc(100dvh - 32px))',
        },
        maxH: { base: '100dvh', sm: view === 'signUp' ? '840px' : '720px' },
        borderRadius: { base: 0, sm: '24px' },
        borderColor: 'transparent',
        boxShadow: '0 40px 100px -40px rgba(40, 0, 70, 0.55)',
      }}
    >
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: 'minmax(320px, 0.82fr) minmax(450px, 1.18fr)' }}
        w="full"
        h="full"
        minH={0}
        bg={C.page}
      >
        <AuthAside tab={activeTab} />

        <Flex minW={0} minH={0} flexDirection="column" bg={C.page}>
          <Flex
            align="center"
            justify="space-between"
            gap={4}
            px={{ base: 5, sm: 7, md: 8 }}
            pt={{
              base: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.55rem))',
              md: 6,
            }}
          >
            <Box display={{ base: 'block', md: 'none' }} minW={0}>
              <BrandLockup compact />
            </Box>
            <Text
              display={{ base: 'none', md: 'block' }}
              color={C.inkFaint}
              fontFamily={F.body}
              fontSize="sm"
            >
              {t('auth.secureAccess')}
            </Text>
            <AppCloseButton
              onClick={onClose}
              bg={C.surface}
              borderColor="transparent"
              color={C.ink}
              _hover={{ bg: C.brandSoft, color: C.brand }}
              _active={{ bg: C.brandSoft }}
              _focusVisible={{ boxShadow: `0 0 0 3px ${C.brand}38` }}
            />
          </Flex>

          <Box px={{ base: 5, sm: 7, md: 8 }} pt={{ base: 5, md: 6 }}>
            <HStack
              display={isAuthTab ? 'flex' : 'none'}
              role="tablist"
              aria-label={t('auth.authentication')}
              onKeyDown={moveTabFocus}
              spacing={1}
              p={1}
              borderRadius="999px"
              bg={C.surface}
            >
              {tabs.map((item) => {
                const isActive = item.id === view
                return (
                  <Button
                    key={item.id}
                    id={`auth-tab-${item.id}`}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls="auth-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setView(item.id)}
                    variant="unstyled"
                    flex={1}
                    h="42px"
                    borderRadius="999px"
                    bg={isActive ? C.brand : 'transparent'}
                    color={isActive ? C.onBrand : C.inkSoft}
                    fontFamily={F.body}
                    fontSize="sm"
                    fontWeight={isActive ? 700 : 600}
                    transition="background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease"
                    _hover={{ color: isActive ? C.onBrand : C.brand }}
                    _focusVisible={{ boxShadow: `0 0 0 3px ${C.brand}30` }}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </HStack>
          </Box>

          <Box
            flex={1}
            minH={0}
            overflowY="auto"
            px={{ base: 5, sm: 7, md: 8 }}
            pt={{ base: 7, md: 8 }}
            pb={{
              base: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
              md: 8,
            }}
            sx={{
              scrollbarWidth: 'thin',
              scrollbarColor: `${C.lineStrong} transparent`,
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { bg: C.lineStrong, borderRadius: '999px' },
            }}
          >
            <Box
              key={view}
              role="tabpanel"
              id="auth-panel"
              aria-labelledby={isAuthTab ? `auth-tab-${view}` : undefined}
              aria-label={!isAuthTab ? activeTab.title : undefined}
              sx={{
                animation: 'authPanelIn 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                '@keyframes authPanelIn': {
                  from: { opacity: 0, transform: 'translateY(8px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            >
              <Text
                color={C.brand}
                fontFamily={F.body}
                fontSize="sm"
                fontWeight={600}
              >
                {activeTab.kicker}
              </Text>
              <Text
                id="auth-dialog-title"
                mt={2.5}
                color={C.ink}
                fontFamily={F.body}
                fontSize={{ base: '2xl', sm: '3xl' }}
                fontWeight={700}
                letterSpacing="-0.03em"
                lineHeight={1.1}
              >
                {activeTab.title}
              </Text>
              <Text
                mt={3}
                mb={7}
                maxW="48ch"
                color={C.inkSoft}
                fontFamily={F.body}
                fontSize="sm"
                lineHeight={1.65}
              >
                {activeTab.description}
              </Text>

              {view === 'signIn' && (
                <LoginForm
                  onSwitchToRegister={() => setView('signUp')}
                  onForgotPassword={() => setView('forgotPassword')}
                />
              )}
              {view === 'signUp' && (
                <Suspense fallback={<RegisterFormFallback />}>
                  <RegisterForm onSwitchToLogin={() => setView('signIn')} />
                </Suspense>
              )}
              {view === 'forgotPassword' && (
                <PasswordResetForm onBackToLogin={() => setView('signIn')} />
              )}
            </Box>
          </Box>
        </Flex>
      </Box>
    </PremiumModal>
  )
}

function RegisterFormFallback() {
  return (
    <VStack spacing={4} align="stretch">
      <Skeleton h="48px" borderRadius="xl" startColor={C.surface} endColor={C.line} />
      <Skeleton h="68px" borderRadius="xl" startColor={C.surface} endColor={C.line} />
      <Skeleton h="68px" borderRadius="xl" startColor={C.surface} endColor={C.line} />
      <Skeleton h="68px" borderRadius="xl" startColor={C.surface} endColor={C.line} />
      <Skeleton h="68px" borderRadius="xl" startColor={C.surface} endColor={C.line} />
      <Skeleton h="50px" borderRadius="full" startColor={C.brandSoft} endColor={C.lineStrong} />
    </VStack>
  )
}
