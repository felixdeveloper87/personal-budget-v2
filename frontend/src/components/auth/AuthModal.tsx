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
import { guilloche } from '../../features/dashboard/components/guilloche'
import LoginForm from './LoginForm'
import { AUTH_COLORS as C, AUTH_FONTS as F } from './authTheme'

const RegisterForm = lazy(() => import('./RegisterForm'))

export type AuthTab = 'signIn' | 'signUp'

interface AuthTabConfig {
  id: AuthTab
  label: string
  kicker: string
  title: string
  description: string
  asideTitle: string
  asideDescription: string
}

const TABS: ReadonlyArray<AuthTabConfig> = [
  {
    id: 'signIn',
    label: 'Sign in',
    kicker: 'Welcome back',
    title: 'Your clear picture is waiting.',
    description: 'Sign in to continue from exactly where you left your money.',
    asideTitle: 'Clarity builds over time.',
    asideDescription:
      'Every transaction, plan and commitment stays connected in one calm financial record.',
  },
  {
    id: 'signUp',
    label: 'Create account',
    kicker: 'Request free access',
    title: 'Start with a place for every decision.',
    description:
      'Create your account now. New accounts are reviewed before they can be activated.',
    asideTitle: 'A quieter way to know your money.',
    asideDescription:
      'Bring personal finances and shared household costs into a view you can actually read.',
  },
]

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: AuthTab
}

function AuthSeal({ size = 52 }: { size?: number }) {
  const ringA = useMemo(() => guilloche(58, 19, 62), [])
  const ringB = useMemo(() => guilloche(58, 27, 44), [])

  return (
    <Box
      as="svg"
      viewBox="-108 -108 216 216"
      w={`${size}px`}
      h={`${size}px`}
      flexShrink={0}
      aria-hidden
      sx={{
        '.auth-seal-jade': {
          transformBox: 'fill-box',
          transformOrigin: 'center',
          animation: 'authSealSpin 52s linear infinite',
        },
        '.auth-seal-gold': {
          transformBox: 'fill-box',
          transformOrigin: 'center',
          animation: 'authSealSpin 68s linear infinite reverse',
        },
        '@keyframes authSealSpin': {
          to: { transform: 'rotate(360deg)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.auth-seal-jade, .auth-seal-gold': { animation: 'none' },
        },
      }}
    >
      <circle r="102" fill="rgba(11,11,12,0.62)" stroke={C.lineStrong} strokeWidth="4" />
      <path
        className="auth-seal-jade"
        d={ringA}
        fill="none"
        stroke={C.jade}
        strokeWidth="1.6"
        strokeOpacity="0.74"
      />
      <path
        className="auth-seal-gold"
        d={ringB}
        fill="none"
        stroke={C.gold}
        strokeWidth="1.6"
        strokeOpacity="0.64"
      />
      <circle r="6" fill={C.gold} />
    </Box>
  )
}

function BrandLockup({ compact = false }: { compact?: boolean }) {
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
          {BRAND.tagline}
        </Text>
      </VStack>
    </HStack>
  )
}

function AuthAside({ tab }: { tab: AuthTabConfig }) {
  const isSignUp = tab.id === 'signUp'
  const details = isSignUp
    ? [
        { icon: Check, label: 'Free access, no card required' },
        { icon: ShieldCheck, label: 'Account review before activation' },
        { icon: Download, label: 'CSV and PDF exports' },
      ]
    : [
        { icon: Lock, label: 'A private financial workspace' },
        { icon: Check, label: 'Your plans stay connected' },
        { icon: Download, label: 'Your data stays portable' },
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
        Personal Budget · Private ledger
      </Text>
    </Flex>
  )
}

export default function AuthModal({ isOpen, onClose, initialTab = 'signIn' }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab)

  useEffect(() => {
    if (isOpen) setTab(initialTab)
  }, [initialTab, isOpen])

  const activeTab = TABS.find((item) => item.id === tab) ?? TABS[0]

  const moveTabFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = TABS.findIndex((item) => item.id === tab)
    let nextIndex = currentIndex
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % TABS.length
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + TABS.length) % TABS.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = TABS.length - 1
    else return

    event.preventDefault()
    const nextTab = TABS[nextIndex].id
    setTab(nextTab)
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
          sm: tab === 'signUp'
            ? 'min(840px, calc(100dvh - 32px))'
            : 'min(720px, calc(100dvh - 32px))',
        },
        maxH: { base: '100dvh', sm: tab === 'signUp' ? '840px' : '720px' },
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
              Secure account access
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
              role="tablist"
              aria-label="Authentication"
              onKeyDown={moveTabFocus}
              spacing={1}
              p={1}
              border="1px solid"
              borderColor={C.line}
              borderRadius="999px"
              bg="rgba(244,246,242,0.035)"
            >
              {TABS.map((item) => {
                const isActive = item.id === tab
                return (
                  <Button
                    key={item.id}
                    id={`auth-tab-${item.id}`}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls="auth-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setTab(item.id)}
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
              key={tab}
              role="tabpanel"
              id="auth-panel"
              aria-labelledby={`auth-tab-${tab}`}
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

              {tab === 'signIn' ? (
                <LoginForm onSwitchToRegister={() => setTab('signUp')} />
              ) : (
                <Suspense fallback={<RegisterFormFallback />}>
                  <RegisterForm onSwitchToLogin={() => setTab('signIn')} />
                </Suspense>
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
