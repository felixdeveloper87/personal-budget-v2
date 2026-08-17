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
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from '../ui/icons'
import { resetPassword } from '../../api'
import { getApiErrorMessage } from '../../services/toast'
import { useI18n } from '../../i18n'
import AuthField from './AuthField'
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from './auth.constants'
import { AUTH_COLORS as C, AUTH_FONTS as F } from './authTheme'

interface PasswordResetFormProps {
  onBackToLogin: () => void
}

interface ResetErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

export default function PasswordResetForm({ onBackToLogin }: PasswordResetFormProps) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<ResetErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const clearError = (field: keyof ResetErrors) => {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
    if (submitError) setSubmitError(undefined)
  }

  const validate = (): boolean => {
    const next: ResetErrors = {}
    const cleanEmail = email.trim()

    if (!cleanEmail) next.email = t('auth.validation.emailRequired')
    else if (!EMAIL_REGEX.test(cleanEmail)) next.email = t('auth.validation.emailInvalid')

    if (!password) next.password = t('auth.validation.passwordRequired')
    else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = t('auth.validation.passwordLength', { count: MIN_PASSWORD_LENGTH })
    }

    if (!confirmPassword) next.confirmPassword = t('auth.validation.confirmPassword')
    else if (confirmPassword !== password) {
      next.confirmPassword = t('auth.validation.passwordMismatch')
    }

    setErrors(next)
    if (next.email) emailRef.current?.focus()
    else if (next.password) passwordRef.current?.focus()
    else if (next.confirmPassword) confirmRef.current?.focus()

    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading || !validate()) return

    setLoading(true)
    setSubmitError(undefined)
    try {
      await resetPassword({ email: email.trim(), password })
      setComplete(true)
    } catch (error: unknown) {
      const apiError = getApiErrorMessage(error)
      setSubmitError(
        apiError.dedupeKey.startsWith('http-400')
          ? t('auth.forgot.accountNotFound')
          : apiError.description,
      )
    } finally {
      setLoading(false)
    }
  }

  if (complete) {
    return (
      <VStack align="stretch" spacing={6}>
        <Flex
          h="110px"
          align="center"
          justify="center"
          border="1px solid"
          borderColor="rgba(127, 230, 179, 0.2)"
          borderRadius="18px"
          bg={C.jadeSoft}
        >
          <Flex
            w={14}
            h={14}
            align="center"
            justify="center"
            borderRadius="full"
            bg={C.jade}
            color={C.bg}
            boxShadow="0 16px 30px -16px rgba(127,230,179,0.7)"
          >
            <CheckCircle2 size={27} weight="bold" aria-hidden />
          </Flex>
        </Flex>

        <Box>
          <Text color={C.cream} fontFamily={F.display} fontSize="3xl" lineHeight={1}>
            {t('auth.forgot.completeTitle')}
          </Text>
          <Text mt={3} color={C.muted} fontFamily={F.body} fontSize="sm" lineHeight={1.65}>
            {t('auth.forgot.completeDescription')}
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
          onClick={onBackToLogin}
          _hover={{ bg: C.jadeSoft, borderColor: C.jade, color: C.jade }}
          _focusVisible={{ boxShadow: `0 0 0 3px ${C.jade}28` }}
        >
          {t('auth.forgot.backToLogin')}
        </Button>
      </VStack>
    )
  }

  return (
    <Box as="form" onSubmit={handleSubmit} noValidate>
      <VStack spacing={4} align="stretch">
        <AuthField
          ref={emailRef}
          label={t('auth.email')}
          icon={Mail}
          type="email"
          name="reset-email"
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
          label={t('auth.forgot.newPassword')}
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          name="reset-password"
          value={password}
          onChange={(value) => {
            setPassword(value)
            clearError('password')
          }}
          placeholder={t('auth.atLeastCharacters', { count: MIN_PASSWORD_LENGTH })}
          autoComplete="new-password"
          error={errors.password}
          isDisabled={loading}
          rightElement={(
            <PasswordToggle
              visible={showPassword}
              label={t('auth.password.field')}
              onClick={() => setShowPassword((current) => !current)}
            />
          )}
        />

        <AuthField
          ref={confirmRef}
          label={t('auth.confirmPassword')}
          icon={Lock}
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirm-reset-password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value)
            clearError('confirmPassword')
          }}
          placeholder={t('auth.reenterPassword')}
          autoComplete="new-password"
          error={errors.confirmPassword}
          isDisabled={loading}
          rightElement={(
            <PasswordToggle
              visible={showConfirmPassword}
              label={t('auth.password.confirmationField')}
              onClick={() => setShowConfirmPassword((current) => !current)}
            />
          )}
        />

        {submitError && <FormAlert message={submitError} />}

        <Button
          type="submit"
          isLoading={loading}
          loadingText={t('auth.forgot.saving')}
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
          _hover={{ bg: C.jadeStrong, borderColor: C.jadeStrong, transform: 'translateY(-1px)' }}
          _active={{ transform: 'translateY(0)', bg: C.jadeStrong }}
          _focusVisible={{ boxShadow: `0 0 0 4px ${C.jade}28` }}
          _loading={{ opacity: 0.72 }}
        >
          {t('auth.forgot.submit')}
        </Button>

        <Button
          type="button"
          variant="ghost"
          leftIcon={<Icon as={ArrowLeft} boxSize={4} />}
          color={C.muted}
          fontFamily={F.body}
          fontSize="sm"
          onClick={onBackToLogin}
          _hover={{ color: C.jade, bg: C.jadeSoft }}
          _focusVisible={{ boxShadow: `0 0 0 3px ${C.jade}28` }}
        >
          {t('auth.forgot.backToLogin')}
        </Button>
      </VStack>
    </Box>
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
      color={C.muted}
      onClick={onClick}
      _hover={{ color: C.jade, bg: C.jadeSoft }}
      _focusVisible={{ boxShadow: `0 0 0 3px ${C.jade}28` }}
    />
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
