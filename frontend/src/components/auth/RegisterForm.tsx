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
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from './auth.constants'
import { ToastService, getApiErrorMessage } from '../../services/toast'
import { AUTH_COLORS as C, AUTH_FONTS as F } from './authTheme'
import { useI18n } from '../../i18n'

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
  const { locale, t } = useI18n()
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

    if (!name.trim()) next.name = t('auth.validation.nameRequired')
    if (!email.trim()) next.email = t('auth.validation.emailRequired')
    else if (!EMAIL_REGEX.test(email)) next.email = t('auth.validation.emailInvalid')
    if (!password) next.password = t('auth.validation.passwordRequired')
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = t('auth.validation.passwordLength', { count: MIN_PASSWORD_LENGTH })
    if (!confirmPassword) next.confirmPassword = t('auth.validation.confirmPassword')
    else if (confirmPassword !== password)
      next.confirmPassword = t('auth.validation.passwordMismatch')

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
            (locale === 'en-GB' ? outcome.message : undefined) ??
            t('auth.register.pendingFallback'),
        })
      } else {
        ToastService.success({
          title: t('auth.register.created'),
          description: t('auth.register.createdDescription'),
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
      <Box as="form" onSubmit={handleSubmit} noValidate>
        <VStack spacing={4} align="stretch">
          <AuthField
            ref={nameRef}
            label={t('auth.name')}
            icon={User}
            name="name"
            value={name}
            onChange={(value) => {
              setName(value)
              clearError('name')
            }}
            placeholder={t('auth.yourName')}
            autoComplete="name"
            error={errors.name}
            isDisabled={loading}
          />

          <AuthField
            ref={emailRef}
            label={t('auth.email')}
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
            label={t('auth.password')}
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(value) => {
              setPassword(value)
              clearError('password')
            }}
            placeholder={t('auth.atLeastCharacters', { count: MIN_PASSWORD_LENGTH })}
            autoComplete="new-password"
            error={errors.password}
            isDisabled={loading}
            rightElement={
              <PasswordToggle
                visible={showPassword}
                label={t('auth.password.field')}
                onClick={() => setShowPassword((current) => !current)}
              />
            }
          />

          <AuthField
            ref={confirmRef}
            label={t('auth.confirmPassword')}
            icon={Lock}
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirm-password"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value)
              clearError('confirmPassword')
            }}
            placeholder={t('auth.reenterPassword')}
            autoComplete="new-password"
            error={errors.confirmPassword}
            isDisabled={loading}
            rightElement={
              <PasswordToggle
                visible={showConfirmPassword}
                label={t('auth.password.confirmationField')}
                onClick={() => setShowConfirmPassword((current) => !current)}
              />
            }
          />

          {(password || confirmPassword) && (
            <HStack spacing={2} flexWrap="wrap" aria-label={t('auth.password.requirements')}>
              <Requirement met={longEnough}>
                {t('auth.password.characters', { count: MIN_PASSWORD_LENGTH })}
              </Requirement>
              <Requirement met={matches}>{t('auth.password.matches')}</Requirement>
            </HStack>
          )}

          {submitError && <FormAlert message={submitError} />}

          <HStack
            align="flex-start"
            spacing={3}
            p={3.5}
            borderRadius="14px"
            bg={C.surface}
          >
            <Icon as={Clock} boxSize="16px" mt="1px" flexShrink={0} color={C.brand} />
            <Text color={C.inkSoft} fontFamily={F.body} fontSize="xs" lineHeight={1.55}>
              {t('auth.register.reviewNotice')}
            </Text>
          </HStack>

          <Button
            type="submit"
            isLoading={loading}
            loadingText={t('auth.register.loading')}
            rightIcon={!loading ? <Icon as={ArrowRight} boxSize={4} /> : undefined}
            h="52px"
            w="full"
            mt={1}
            border="1px solid"
            borderColor={C.brand}
            borderRadius="999px"
            bg={C.onBrand}
            color={C.brand}
            fontFamily={F.body}
            fontSize="sm"
            fontWeight={700}
            transition="transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease"
            _hover={{
              bg: C.brandDeep,
              borderColor: C.brandDeep,
              transform: 'none',
              boxShadow: 'none',
            }}
            _active={{ bg: C.brandDeep }}
            _focusVisible={{ boxShadow: `0 0 0 4px ${C.brand}28` }}
            _loading={{ opacity: 0.72 }}
          >
            {t('auth.register.submit')}
          </Button>

          <Text textAlign="center" color={C.inkSoft} fontFamily={F.body} fontSize="sm">
            {t('auth.register.hasAccount')}{' '}
            <Button
              type="button"
              variant="link"
              color={C.brand}
              fontFamily={F.body}
              fontSize="sm"
              fontWeight={600}
              onClick={onSwitchToLogin}
              _hover={{ color: C.brandDeep, textDecoration: 'none' }}
              _focusVisible={{ boxShadow: `0 0 0 3px ${C.brand}28` }}
            >
              {t('auth.register.signIn')}
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
  const { t } = useI18n()
  return (
    <IconButton
      type="button"
      aria-label={t(visible ? 'auth.password.hide' : 'auth.password.show', { field: label })}
      icon={<Icon as={visible ? EyeOff : Eye} boxSize={4} />}
      variant="ghost"
      size="sm"
      borderRadius="full"
      color={C.inkSoft}
      onClick={onClick}
      _hover={{ color: C.brand, bg: C.brandSoft }}
      _focusVisible={{ boxShadow: `0 0 0 3px ${C.brand}28` }}
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
      borderColor={met ? 'rgba(130, 10, 209, 0.2)' : C.line}
      borderRadius="999px"
      bg={met ? C.brandSoft : 'transparent'}
      color={met ? C.brand : C.inkFaint}
    >
      <Icon as={Check} boxSize="12px" />
      <Text fontFamily={F.body} fontSize="xs">
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
      borderColor="rgba(194, 65, 45, 0.22)"
      borderRadius="12px"
      bg={C.dangerSoft}
      color={C.danger}
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
  const { t } = useI18n()
  return (
    <VStack align="stretch" spacing={6}>
      <Flex
        position="relative"
        h="118px"
        align="center"
        justify="center"
        overflow="hidden"
        border="1px solid"
        borderColor="transparent"
        borderRadius="20px"
        bg={C.brandBand}
      >
        <Box
          position="absolute"
          w="150px"
          h="150px"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.16)"
          borderRadius="full"
          boxShadow="0 0 0 18px rgba(255, 255, 255, 0.04), 0 0 0 38px rgba(255, 255, 255, 0.03)"
        />
        <Flex
          position="relative"
          w={14}
          h={14}
          align="center"
          justify="center"
          borderRadius="full"
          bg={C.onBrand}
          color={C.brand}
        >
          <Clock size={25} weight="bold" aria-hidden />
        </Flex>
      </Flex>

      <Box>
        <Text color={C.ink} fontFamily={F.body} fontSize="2xl" fontWeight={700} letterSpacing="-0.02em" lineHeight={1.1}>
          {t('auth.register.requestReceived')}
        </Text>
        <Text mt={3} color={C.inkSoft} fontFamily={F.body} fontSize="sm" lineHeight={1.65}>
          {message}
        </Text>
      </Box>

      <Box
        px={4}
        py={3.5}
        border="1px solid"
        borderColor={C.line}
        borderRadius="12px"
        bg={C.surface}
      >
        <Text color={C.inkFaint} fontFamily={F.body} fontSize="xs">
          {t('auth.register.accountEmail')}
        </Text>
        <Text mt={1} color={C.ink} fontFamily={F.body} fontSize="sm" wordBreak="break-word">
          {email}
        </Text>
      </Box>

      <Button
        type="button"
        h="48px"
        border="1px solid"
        borderColor={C.brand}
        borderRadius="999px"
        bg="transparent"
        color={C.brand}
        fontFamily={F.body}
        fontSize="sm"
        fontWeight={650}
        onClick={onSwitchToLogin}
        _hover={{ bg: C.brandSoft }}
        _focusVisible={{ boxShadow: `0 0 0 3px ${C.brand}28` }}
      >
        {t('auth.register.returnToSignIn')}
      </Button>
    </VStack>
  )
}
