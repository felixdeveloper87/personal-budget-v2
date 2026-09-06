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

function AuthSeal({ size = 52 }: { size?: number }) {
  return (
    <BrandMark
      size={size}
      colorMode="dark"
      style={{ flexShrink: 0, filter: 'drop-shadow(0 8px 14px rgba(0, 0, 0, 0.24))' }}
    />
  )
}

function BrandLockup({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()
  return (
    <HStack spacing={3} minW={0}>
      <AuthSeal size={compact ? 38 : 52} />
      <VStack align="flex-start" spacing={0} minW={0}>
        <Text
          color={C.cream}
          fontFamily={F.display}
          fontSize={compact ? 'lg' : 'xl'}
          fontWeight={400}
          letterSpacing="-0.02em"
          lineHeight={1}
          noOfLines={1}
        >
          Personal <Text as="em" color={C.jade}>Budget</Text>
        </Text>
        <Text
          mt={1}
          color={C.muted}
          fontFamily={F.mono}
          fontSize={compact ? '7px' : '8px'}
          letterSpacing="0.22em"
          textTransform="uppercase"
          noOfLines={1}
        >
          {t('brand.tagline', undefined, BRAND.tagline)}
        </Text>
      </VStack>
    </HStack>
  )
}

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
      borderRight="1px solid"
      borderColor={C.line}
      bg={C.bgRaised}
    >
      <Box
        position="absolute"
        inset={0}
        bgImage={`
          linear-gradient(180deg, rgba(8,13,10,0.36), rgba(8,13,10,0.88) 72%, #0b0b0c),
          linear-gradient(90deg, rgba(11,11,12,0.26), rgba(11,11,12,0.08)),
          url('/personal-budget-ledger-hero.webp')
        `}
        bgSize="cover"
        bgPosition="63% center"
        opacity={0.72}
        transform="scale(1.03)"
      />
      <Box
        position="absolute"
        inset="-25% -60% auto auto"
        w="420px"
        h="420px"
        borderRadius="full"
        border="1px solid"
        borderColor="rgba(127,230,179,0.12)"
        boxShadow="0 0 0 28px rgba(127,230,179,0.025), 0 0 0 58px rgba(232,196,119,0.018)"
      />

      <Box position="relative" zIndex={1}>
        <BrandLockup />
      </Box>

      <VStack
        position="relative"
        zIndex={1}
        align="stretch"
        spacing={5}
        mt="auto"
        mb={8}
      >
        <Text
          maxW="330px"
          color={C.cream}
          fontFamily={F.display}
          fontSize={{ md: '3xl', lg: '4xl' }}
          fontWeight={400}
          letterSpacing="-0.035em"
          lineHeight={0.98}
        >
          {tab.asideTitle}
        </Text>
        <Text
          maxW="330px"
          color="rgba(226,234,228,0.72)"
          fontFamily={F.body}
          fontSize="sm"
          lineHeight={1.7}
        >
          {tab.asideDescription}
        </Text>

        <VStack
          align="stretch"
          spacing={0}
          overflow="hidden"
          border="1px solid"
          borderColor={C.line}
          borderRadius="16px"
          bg="rgba(11,11,12,0.54)"
          backdropFilter="blur(13px)"
        >
          {details.map(({ icon: DetailIcon, label }, index) => (
            <HStack
              key={label}
              spacing={3}
              px={4}
              py={3.5}
              borderTop={index ? '1px solid' : '0'}
              borderColor={C.line}
            >
              <Flex
                w={7}
                h={7}
                flexShrink={0}
                align="center"
                justify="center"
                borderRadius="full"
                bg={index === 1 && isSignUp ? C.goldSoft : C.jadeSoft}
                color={index === 1 && isSignUp ? C.gold : C.jade}
              >
                <DetailIcon size={14} weight="bold" aria-hidden />
              </Flex>
              <Text color="rgba(232,237,233,0.82)" fontFamily={F.body} fontSize="xs">
                {label}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>

      <Text
        position="relative"
        zIndex={1}
        color={C.mutedDim}
        fontFamily={F.mono}
        fontSize="8px"
        letterSpacing="0.15em"
        textTransform="uppercase"
      >
        {t('auth.privateLedger')}
      </Text>
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
        bg: C.bg,
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
        borderColor: C.lineStrong,
        boxShadow: '0 48px 120px -34px rgba(0,0,0,0.92), 0 0 0 1px rgba(127,230,179,0.025)',
      }}
    >
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: 'minmax(320px, 0.82fr) minmax(450px, 1.18fr)' }}
        w="full"
        h="full"
        minH={0}
        bg={C.bg}
      >
        <AuthAside tab={activeTab} />

        <Flex minW={0} minH={0} flexDirection="column" bg={C.bg}>
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
              color={C.mutedDim}
              fontFamily={F.mono}
              fontSize="8px"
              letterSpacing="0.16em"
              textTransform="uppercase"
            >
              {t('auth.secureAccess')}
            </Text>
            <AppCloseButton
              onClick={onClose}
              bg={C.panelSoft}
              borderColor={C.line}
              color={C.muted}
              _hover={{ bg: C.jadeSoft, borderColor: C.jade, color: C.jade }}
              _active={{ bg: 'rgba(127,230,179,0.17)' }}
              _focusVisible={{ boxShadow: `0 0 0 3px ${C.jade}38` }}
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
              border="1px solid"
              borderColor={C.line}
              borderRadius="999px"
              bg="rgba(244,246,242,0.035)"
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
                    h="38px"
                    borderRadius="999px"
                    bg={isActive ? C.panel : 'transparent'}
                    color={isActive ? C.cream : C.muted}
                    boxShadow={isActive ? `inset 0 0 0 1px ${C.lineStrong}, 0 8px 20px -16px rgba(0,0,0,0.8)` : 'none'}
                    fontFamily={F.body}
                    fontSize="sm"
                    fontWeight={isActive ? 650 : 500}
                    transition="background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease"
                    _hover={{ color: C.cream }}
                    _focusVisible={{ boxShadow: `0 0 0 3px ${C.jade}30` }}
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
                color={C.jade}
                fontFamily={F.mono}
                fontSize="9px"
                fontWeight={500}
                letterSpacing="0.17em"
                textTransform="uppercase"
              >
                {activeTab.kicker}
              </Text>
              <Text
                id="auth-dialog-title"
                mt={2.5}
                color={C.cream}
                fontFamily={F.display}
                fontSize={{ base: '3xl', sm: '4xl' }}
                fontWeight={400}
                letterSpacing="-0.035em"
                lineHeight={1}
              >
                {activeTab.title}
              </Text>
              <Text
                mt={3}
                mb={7}
                maxW="48ch"
                color={C.muted}
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
      <Skeleton h="48px" borderRadius="xl" startColor={C.panelSoft} endColor={C.line} />
      <Skeleton h="68px" borderRadius="xl" startColor={C.panelSoft} endColor={C.line} />
      <Skeleton h="68px" borderRadius="xl" startColor={C.panelSoft} endColor={C.line} />
      <Skeleton h="68px" borderRadius="xl" startColor={C.panelSoft} endColor={C.line} />
      <Skeleton h="68px" borderRadius="xl" startColor={C.panelSoft} endColor={C.line} />
      <Skeleton h="50px" borderRadius="full" startColor={C.jadeSoft} endColor={C.lineStrong} />
    </VStack>
  )
}
