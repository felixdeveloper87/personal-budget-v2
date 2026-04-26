import { lazy, Suspense, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Skeleton,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Wallet, X } from 'lucide-react'
import { PremiumModal } from '../ui'
import { BRAND } from '../layout/header/brand.config'
import LoginForm from './LoginForm'

/**
 * RegisterForm is only loaded when the user actually switches to the
 * "Create account" tab. Keeps the initial bundle for first-paint small —
 * the modal opens with Sign in by default, which is what 95% of returning
 * users want. Saves a few KB and a parse pass on the hot path.
 */
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
  /** kept for backwards compatibility — close acts as "back to landing" */
  onBackToLanding?: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>('signIn')

  // Theme tokens — resolved once at the top, not inside the JSX tree.
  // Avoids re-running useColorModeValue inside .map() and prevents a
  // recompute storm on tab change.
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const headerBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const tabIdleColor = useColorModeValue('gray.500', 'gray.400')
  const tabActiveColor = useColorModeValue('gray.900', 'gray.50')
  const tabIndicator = useColorModeValue(
    'linear-gradient(90deg, #3b82f6, #8b5cf6)',
    'linear-gradient(90deg, #60a5fa, #a78bfa)',
  )
  const closeIdleColor = useColorModeValue('gray.500', 'gray.400')
  const closeHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const logoBg = useColorModeValue(
    'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
  )

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0]

  const Header = (
    <Box
      bg={surfaceBg}
      borderBottom="1px solid"
      borderColor={headerBorder}
      px={{ base: 4, sm: 6 }}
      pt={{ base: 'max(1rem, env(safe-area-inset-top, 0px))', sm: 5 }}
      pb={3}
    >
      <HStack justify="space-between" align="center" mb={4} spacing={3}>
        <HStack spacing={3} minW={0}>
          <Box
            w={9}
            h={9}
            borderRadius="lg"
            bg={logoBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            flexShrink={0}
            boxShadow="0 4px 12px -4px rgba(79, 70, 229, 0.5)"
          >
            <Icon as={Wallet} boxSize={4} strokeWidth={2.25} />
          </Box>
          <VStack align="flex-start" spacing={0} minW={0}>
            <Text
              fontWeight={700}
              fontSize="md"
              color={titleColor}
              lineHeight="1.2"
              noOfLines={1}
            >
              {BRAND.nameFull}
            </Text>
            <Text fontSize="xs" color={captionColor} noOfLines={1}>
              {activeTab.caption}
            </Text>
          </VStack>
        </HStack>

        <IconButton
          aria-label="Close"
          icon={<Icon as={X} boxSize={4} />}
          onClick={onClose}
          size="sm"
          variant="ghost"
          color={closeIdleColor}
          _hover={{ bg: closeHoverBg, color: titleColor }}
          transition="background-color 0.15s ease, color 0.15s ease"
        />
      </HStack>

      <Box role="tablist" aria-label="Authentication">
        <HStack
          spacing={0}
          position="relative"
          borderBottom="1px solid"
          borderColor={headerBorder}
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
                color={isActive ? tabActiveColor : tabIdleColor}
                position="relative"
                borderRadius={0}
                transition="color 0.18s ease"
                _hover={{ color: tabActiveColor }}
                _focusVisible={{
                  boxShadow: 'inset 0 0 0 2px var(--chakra-colors-blue-500)',
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
                          background: tabIndicator,
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
      contentProps={{ bg: surfaceBg }}
    >
      <Box
        flex="1"
        bg={surfaceBg}
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
      <Skeleton h="68px" borderRadius="md" />
      <Skeleton h="68px" borderRadius="md" />
      <Skeleton h="68px" borderRadius="md" />
      <Skeleton h="68px" borderRadius="md" />
      <Skeleton h="48px" borderRadius="md" />
    </VStack>
  )
}
