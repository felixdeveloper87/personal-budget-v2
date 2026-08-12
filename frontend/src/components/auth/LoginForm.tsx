import { useRef, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from '../ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import AuthField from './AuthField'
import GoogleSignInSection from './GoogleSignInSection'
import { EMAIL_REGEX } from './auth.constants'
import { ToastService, getApiErrorMessage } from '../../services/toast'
import { AUTH_COLORS as C, AUTH_FONTS as F } from './authTheme'
import { useI18n } from '../../i18n'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

interface LoginErrors {
  email?: string
  password?: string
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [submitError, setSubmitError] = useState<string>()

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const { login } = useAuth()

  const validate = (): boolean => {
    const next: LoginErrors = {}
    if (!email.trim()) {
      next.email = t('auth.validation.emailRequired')
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = t('auth.validation.emailInvalid')
    }
    if (!password) {
      next.password = t('auth.validation.passwordRequired')
    }
    setErrors(next)

    if (next.email) emailRef.current?.focus()
    else if (next.password) passwordRef.current?.focus()

    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setSubmitError(undefined)
    if (!validate()) return

    setLoading(true)
    try {
      await login({ email: email.trim(), password })
      ToastService.success({
        title: t('auth.login.welcome'),
        duration: 1000,
        dedupeKey: 'login-success',
      })
    } catch (error: unknown) {
      const apiMessage = getApiErrorMessage(error)
      const message = apiMessage.dedupeKey === 'http-401'
        ? t('auth.validation.invalidCredentials')
        : apiMessage.description
      setSubmitError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <VStack spacing={5} align="stretch">
      <GoogleSignInSection />
      <Box as="form" onSubmit={handleSubmit} noValidate>
        <VStack spacing={4} align="stretch">
          <AuthField
            ref={emailRef}
            label={t('auth.email')}
            icon={Mail}
            type="email"
            name="email"
            value={email}
            onChange={(v) => {
              setEmail(v)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              if (submitError) setSubmitError(undefined)
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
            onChange={(v) => {
              setPassword(v)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              if (submitError) setSubmitError(undefined)
            }}
            placeholder={t('auth.yourPassword')}
            autoComplete="current-password"
            error={errors.password}
            isDisabled={loading}
            rightElement={
              <IconButton
                aria-label={t(
                  showPassword ? 'auth.password.hide' : 'auth.password.show',
                  { field: t('auth.password.field') },
                )}
                icon={<Icon as={showPassword ? EyeOff : Eye} boxSize={4} />}
                type="button"
                variant="ghost"
                size="sm"
                color={C.muted}
                borderRadius="full"
                _hover={{ color: C.jade, bg: C.jadeSoft }}
                _focusVisible={{ boxShadow: `0 0 0 3px ${C.jade}28` }}
                onClick={() => setShowPassword((s) => !s)}
              />
            }
          />

          {submitError && (
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
                {submitError}
              </Text>
            </HStack>
          )}

          <Button
            type="submit"
            isLoading={loading}
            loadingText={t('auth.login.loading')}
            rightIcon={!loading ? <Icon as={ArrowRight} boxSize={4} /> : undefined}
            h="50px"
            w="full"
            mt={1}
            fontSize="sm"
            fontFamily={F.body}
            fontWeight={700}
            color={C.bg}
            borderRadius="999px"
            bg={C.jade}
            border="1px solid"
            borderColor={C.jade}
            boxShadow="0 12px 28px -16px rgba(127, 230, 179, 0.72)"
            transition="transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease"
            _hover={{
              bg: C.jadeStrong,
              borderColor: C.jadeStrong,
              transform: 'translateY(-1px)',
              boxShadow: '0 16px 34px -16px rgba(127, 230, 179, 0.82)',
            }}
            _active={{ transform: 'translateY(0)', bg: C.jadeStrong }}
            _focusVisible={{ boxShadow: `0 0 0 4px ${C.jade}28` }}
            _loading={{ opacity: 0.7 }}
          >
            {t('auth.login.submit')}
          </Button>

          <HStack justify="center" spacing={2} color={C.mutedDim}>
            <Icon as={ShieldCheck} boxSize="14px" />
            <Text fontFamily={F.mono} fontSize="9px" letterSpacing="0.08em" textTransform="uppercase">
              {t('auth.login.secure')}
            </Text>
          </HStack>

          <Text textAlign="center" color={C.muted} fontFamily={F.body} fontSize="sm" pt={1}>
            {t('auth.login.noAccount')}{' '}
            <Button
              type="button"
              variant="link"
              color={C.jade}
              fontFamily={F.body}
              fontWeight={600}
              fontSize="sm"
              onClick={onSwitchToRegister}
              _hover={{ color: C.jadeStrong, textDecoration: 'none' }}
              _focusVisible={{ boxShadow: `0 0 0 3px ${C.jade}28` }}
            >
              {t('auth.login.create')}
            </Button>
          </Text>
        </VStack>
      </Box>
    </VStack>
  )
}
