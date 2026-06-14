import { lazy, Suspense, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AppCloseButton, PremiumModal } from '../ui'
import { BRAND } from '../layout/header/brand.config'
import { LogoIconWallet } from '../layout/header/Logo'
import LoginForm from './LoginForm'

const RegisterForm = lazy(() => import('./RegisterForm'))

type AuthTab = 'signIn' | 'signUp'

interface AuthTabConfig {
  id: AuthTab
  label: string
  caption: string
}

const TABS: ReadonlyArray<AuthTabConfig> = [
  { id: 'signIn', label: 'Sign in', caption: 'Welcome back' },
  { id: 'signUp', label: 'Create account', caption: 'Free, no credit card' },
]

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

/* Landing v3 palette — always dark */
const C = {
  bg: '#070a08',
  bg2: '#0b100d',
  panel: 'rgba(18, 26, 21, 0.95)',
  jade: '#7fe6b3',
  gold: '#d9b36a',
  cream: '#efeae0',
  muted: '#94a398',
  line: 'rgba(239, 234, 224, 0.1)',
  lineStrong: 'rgba(239, 234, 224, 0.18)',
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>('signIn')

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0]

  const Header = (
    <Box
      bg={C.bg}
      borderBottom="1px solid"
      borderColor={C.line}
      px={{ base: 4, sm: 6 }}
      pt={{
        base: 'max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
        sm: 5,
      }}
      pb={3}
    >
      <HStack justify="space-between" align="center" mb={4} spacing={3}>
        <HStack spacing={3} minW={0}>
          <Box
            flexShrink={0}
            position="relative"
            p={1.5}
            bg="rgba(18, 26, 21, 0.8)"
            border="1px solid"
            borderColor={C.lineStrong}
            borderRadius="xl"
            boxShadow={`0 4px 16px -4px rgba(127, 230, 179, 0.2)`}
            overflow="hidden"
          >
            <LogoIconWallet />
          </Box>
          <VStack align="flex-start" spacing={0} minW={0}>
            <Text
              fontWeight={700}
              fontSize="md"
              color={C.cream}
              lineHeight="1.2"
              noOfLines={1}
              fontFamily="'Instrument Serif', Georgia, serif"
              fontStyle="italic"
            >
              {BRAND.nameFull}
            </Text>
            <Text fontSize="xs" color={C.muted} noOfLines={1} fontFamily="'Spline Sans Mono', monospace" letterSpacing="0.08em">
              {activeTab.caption}
            </Text>
          </VStack>
        </HStack>

        <AppCloseButton onClick={onClose} />
      </HStack>

      <Box role="tablist" aria-label="Authentication">
        <HStack
          spacing={0}
          position="relative"
          borderBottom="1px solid"
          borderColor={C.line}
        >
          {TABS.map((t) => {
            const isActive = t.id === tab
            return (
              <Button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`auth-panel-${t.id}`}
                onClick={() => setTab(t.id)}
                variant="unstyled"
                flex="1"
                h={10}
                fontSize="sm"
                fontWeight={600}
                color={isActive ? C.cream : C.muted}
                position="relative"
                borderRadius={0}
                transition="color 0.18s ease"
                _hover={{ color: C.cream }}
                _focusVisible={{
                  boxShadow: `inset 0 0 0 2px ${C.jade}`,
                  outline: 'none',
                }}
                sx={
                  isActive
                    ? {
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: '18%',
                          right: '18%',
                          bottom: '-1px',
                          height: '2px',
                          background: C.jade,
                          borderRadius: '2px',
                        },
                      }
                    : undefined
                }
              >
                {t.label}
              </Button>
            )
          })}
        </HStack>
      </Box>
    </Box>
  )

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'md', md: 'md' }}
      header={Header}
      contentProps={{ bg: C.bg }}
    >
      <Box
        flex="1"
        bg={C.bg}
        px={{ base: 5, sm: 8 }}
        py={{ base: 6, sm: 8 }}
        overflowY="auto"
        role="tabpanel"
        id={`auth-panel-${tab}`}
      >
        {tab === 'signIn' ? (
          <LoginForm onSwitchToRegister={() => setTab('signUp')} />
        ) : (
          <Suspense fallback={<RegisterFormFallback />}>
            <RegisterForm onSwitchToLogin={() => setTab('signIn')} />
          </Suspense>
        )}
      </Box>
    </PremiumModal>
  )
}

function RegisterFormFallback() {
  return (
    <VStack spacing={4} align="stretch">
      <Skeleton h="68px" borderRadius="md" startColor="rgba(239,234,224,0.05)" endColor="rgba(239,234,224,0.12)" />
      <Skeleton h="68px" borderRadius="md" startColor="rgba(239,234,224,0.05)" endColor="rgba(239,234,224,0.12)" />
      <Skeleton h="68px" borderRadius="md" startColor="rgba(239,234,224,0.05)" endColor="rgba(239,234,224,0.12)" />
      <Skeleton h="68px" borderRadius="md" startColor="rgba(239,234,224,0.05)" endColor="rgba(239,234,224,0.12)" />
      <Skeleton h="48px" borderRadius="md" startColor="rgba(239,234,224,0.05)" endColor="rgba(239,234,224,0.12)" />
    </VStack>
  )
}
