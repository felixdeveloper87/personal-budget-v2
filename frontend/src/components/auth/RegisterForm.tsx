import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from '../ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import AuthField from './AuthField'
import GoogleSignInSection from './GoogleSignInSection'
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from './auth.constants'
import { ToastService, getApiErrorMessage } from '../../services/toast'
import { AUTH_COLORS as C, AUTH_FONTS as F } from './authTheme'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

interface RegisterErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

interface PendingApproval {
  email: string
  message: string
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [pendingApproval, setPendingApproval] = useState<PendingApproval>()

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const { register } = useAuth()

  const clearError = (field: keyof RegisterErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    if (submitError) setSubmitError(undefined)
  }

  const validate = (): boolean => {
    const next: RegisterErrors = {}

    if (!name.trim()) next.name = 'Name is required'
    if (!email.trim()) next.email = 'Email is required'
    else if (!EMAIL_REGEX.test(email)) next.email = 'Enter a valid email address'
    if (!password) next.password = 'Password is required'
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password'
    else if (confirmPassword !== password)
      next.confirmPassword = "Passwords don't match"

    setErrors(next)

    if (next.name) nameRef.current?.focus()
    else if (next.email) emailRef.current?.focus()
    else if (next.password) passwordRef.current?.focus()
    else if (next.confirmPassword) confirmRef.current?.focus()

    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return
    setSubmitError(undefined)
    if (!validate()) return

    setLoading(true)
    try {
      const cleanEmail = email.trim()
      const outcome = await register({ name: name.trim(), email: cleanEmail, password })
      if (outcome.status === 'pending') {
        setPendingApproval({
          email: cleanEmail,
          message:
            outcome.message ??
            'An administrator must approve your account before you can sign in.',
        })
      } else {
        ToastService.success({
          title: 'Account created',
          description: "You're all set. Welcome aboard.",
          duration: 2000,
          dedupeKey: 'registration-success',
        })
      }
    } catch (error: unknown) {
      setSubmitError(getApiErrorMessage(error).description)
    } finally {
      setLoading(false)
    }
  }

  if (pendingApproval) {
    return (
      <PendingApprovalPanel
        email={pendingApproval.email}
        message={pendingApproval.message}
        onSwitchToLogin={onSwitchToLogin}
      />
    )
  }

  const longEnough = password.length >= MIN_PASSWORD_LENGTH
  const matches = confirmPassword.length > 0 && confirmPassword === password

  return (
    <VStack spacing={5} align="stretch">
      <GoogleSignInSection />

      <Box as="form" onSubmit={handleSubmit} noValidate>
        <VStack spacing={4} align="stretch">
          <AuthField
            ref={nameRef}
            label="Name"
            icon={User}
            name="name"
            value={name}
            onChange={(value) => {
              setName(value)
              clearError('name')
            }}
            placeholder="Your name"
            autoComplete="name"
            error={errors.name}
            isDisabled={loading}
          />

          <AuthField
            ref={emailRef}
            label="Email"
            icon={Mail}
            type="email"
            name="email"
            value={email}
            onChange={(value) => {
              setEmail(value)
              clearError('email')
            }}
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email}
            isDisabled={loading}
          />

          <AuthField
            ref={passwordRef}
            label="Password"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(value) => {
              setPassword(value)
              clearError('password')
            }}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            autoComplete="new-password"
            error={errors.password}
            isDisabled={loading}
            rightElement={
              <PasswordToggle
                visible={showPassword}
                label="password"
                onClick={() => setShowPassword((current) => !current)}
              />
            }
          />

          <AuthField
            ref={confirmRef}
            label="Confirm password"
            icon={Lock}
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirm-password"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value)
              clearError('confirmPassword')
            }}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            isDisabled={loading}
            rightElement={
              <PasswordToggle
                visible={showConfirmPassword}
                label="password confirmation"
                onClick={() => setShowConfirmPassword((current) => !current)}
              />
            }
          />

          {(password || confirmPassword) && (
            <HStack spacing={2} flexWrap="wrap" aria-label="Password requirements">
              <Requirement met={longEnough}>
                {MIN_PASSWORD_LENGTH}+ characters
              </Requirement>
              <Requirement met={matches}>Passwords match</Requirement>
            </HStack>
          )}

          {submitError && <FormAlert message={submitError} />}

          <HStack
            align="flex-start"
            spacing={3}
            p={3.5}
            border="1px solid"
            borderColor="rgba(232, 196, 119, 0.18)"
            borderRadius="12px"
            bg={C.goldSoft}
          >
            <Icon as={Clock} boxSize="16px" mt="1px" flexShrink={0} color={C.gold} />
            <Text color={C.muted} fontFamily={F.body} fontSize="xs" lineHeight={1.55}>
              New accounts are reviewed before activation. We will let you know when yours is ready.
            </Text>
          </HStack>

          <Button
            type="submit"
            isLoading={loading}
            loadingText="Sending request"
            rightIcon={!loading ? <Icon as={ArrowRight} boxSize={4} /> : undefined}
            h="50px"
            w="full"
            mt={1}
            border="1px solid"
            borderColor={C.jade}
            borderRadius="999px"
            bg={C.jade}
            color={C.bg}
            boxShadow="0 12px 28px -16px rgba(127, 230, 179, 0.72)"
            fontFamily={F.body}
            fontSize="sm"
            fontWeight={700}
            transition="transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease"
            _hover={{
              bg: C.jadeStrong,
              borderColor: C.jadeStrong,
              transform: 'translateY(-1px)',
              boxShadow: '0 16px 34px -16px rgba(127, 230, 179, 0.82)',
            }}
            _active={{ transform: 'translateY(0)', bg: C.jadeStrong }}
            _focusVisible={{ boxShadow: `0 0 0 4px ${C.jade}28` }}
            _loading={{ opacity: 0.72 }}
          >
            Request free access
          </Button>

          <Text textAlign="center" color={C.muted} fontFamily={F.body} fontSize="sm">
            Already have an account?{' '}
            <Button
              type="button"
              variant="link"
              color={C.jade}
              fontFamily={F.body}
              fontSize="sm"
              fontWeight={600}
              onClick={onSwitchToLogin}
              _hover={{ color: C.jadeStrong, textDecoration: 'none' }}
              _focusVisible={{ boxShadow: `0 0 0 3px ${C.jade}28` }}
            >
              Sign in
            </Button>
          </Text>
        </VStack>
      </Box>
    </VStack>
  )
}

function PasswordToggle({
  visible,
  label,
  onClick,
}: {
  visible: boolean
  label: string
  onClick: () => void
}) {
  return (
    <IconButton
      type="button"
      aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}
      icon={<Icon as={visible ? EyeOff : Eye} boxSize={4} />}
      variant="ghost"
      size="sm"
      borderRadius="full"
      color={C.muted}
      onClick={onClick}
      _hover={{ color: C.jade, bg: C.jadeSoft }}
      _focusVisible={{ boxShadow: `0 0 0 3px ${C.jade}28` }}
    />
  )
}

function Requirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <HStack
      spacing={1.5}
      px={2.5}
      py={1.5}
      border="1px solid"
      borderColor={met ? 'rgba(127, 230, 179, 0.2)' : C.line}
      borderRadius="999px"
      bg={met ? C.jadeSoft : 'transparent'}
      color={met ? C.jade : C.mutedDim}
    >
      <Icon as={Check} boxSize="12px" />
      <Text fontFamily={F.mono} fontSize="8px" letterSpacing="0.04em">
        {children}
      </Text>
    </HStack>
  )
}

function FormAlert({ message }: { message: string }) {
  return (
    <HStack
      role="alert"
      align="flex-start"
      spacing={2.5}
      p={3.5}
      border="1px solid"
      borderColor="rgba(255, 154, 144, 0.22)"
      borderRadius="12px"
      bg={C.coralSoft}
      color={C.coral}
    >
      <Icon as={AlertCircle} boxSize="16px" mt="1px" flexShrink={0} />
      <Text fontFamily={F.body} fontSize="xs" lineHeight={1.5}>
        {message}
      </Text>
    </HStack>
  )
}

function PendingApprovalPanel({
  email,
  message,
  onSwitchToLogin,
}: PendingApproval & { onSwitchToLogin: () => void }) {
  return (
    <VStack align="stretch" spacing={6}>
      <Flex
        position="relative"
        h="118px"
        align="center"
        justify="center"
        overflow="hidden"
        border="1px solid"
        borderColor="rgba(232, 196, 119, 0.2)"
        borderRadius="18px"
        bg={C.goldSoft}
      >
        <Box
          position="absolute"
          w="150px"
          h="150px"
          border="1px solid"
          borderColor="rgba(232, 196, 119, 0.12)"
          borderRadius="full"
          boxShadow="0 0 0 18px rgba(232,196,119,0.025), 0 0 0 38px rgba(127,230,179,0.018)"
        />
        <Flex
          position="relative"
          w={14}
          h={14}
          align="center"
          justify="center"
          borderRadius="full"
          bg={C.gold}
          color={C.bg}
          boxShadow="0 16px 30px -16px rgba(232,196,119,0.7)"
        >
          <Clock size={25} weight="bold" aria-hidden />
        </Flex>
      </Flex>

      <Box>
        <Text color={C.cream} fontFamily={F.display} fontSize="3xl" lineHeight={1}>
          Request received.
        </Text>
        <Text mt={3} color={C.muted} fontFamily={F.body} fontSize="sm" lineHeight={1.65}>
          {message}
        </Text>
      </Box>

      <Box
        px={4}
        py={3.5}
        border="1px solid"
        borderColor={C.line}
        borderRadius="12px"
        bg={C.panelSoft}
      >
        <Text color={C.mutedDim} fontFamily={F.mono} fontSize="8px" letterSpacing="0.13em" textTransform="uppercase">
          Account email
        </Text>
        <Text mt={1} color={C.cream} fontFamily={F.body} fontSize="sm" wordBreak="break-word">
          {email}
        </Text>
      </Box>

      <Button
        type="button"
        h="48px"
        border="1px solid"
        borderColor={C.lineStrong}
        borderRadius="999px"
        bg={C.panelSoft}
        color={C.cream}
        fontFamily={F.body}
        fontSize="sm"
        fontWeight={650}
        onClick={onSwitchToLogin}
        _hover={{ bg: C.jadeSoft, borderColor: C.jade, color: C.jade }}
        _focusVisible={{ boxShadow: `0 0 0 3px ${C.jade}28` }}
      >
        Return to sign in
      </Button>
    </VStack>
  )
}
