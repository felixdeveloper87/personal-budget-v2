import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Icon,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from '../ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import AuthField from './AuthField'
import GoogleSignInSection from './GoogleSignInSection'
import { EMAIL_REGEX } from './auth.constants'
import { ToastService, getApiErrorMessage } from '../../services/toast'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

interface LoginErrors {
  email?: string
  password?: string
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const { login } = useAuth()

  const validate = (): boolean => {
    const next: LoginErrors = {}
    if (!email.trim()) {
      next.email = 'Email is required'
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = 'Enter a valid email address'
    }
    if (!password) {
      next.password = 'Password is required'
    }
    setErrors(next)

    if (next.email) emailRef.current?.focus()
    else if (next.password) passwordRef.current?.focus()

    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!validate()) return

    setLoading(true)
    try {
      await login({ email: email.trim(), password })
      ToastService.success({
        title: 'Welcome back',
        duration: 1000,
        dedupeKey: 'login-success',
      })
    } catch (error: unknown) {
      const apiMessage = getApiErrorMessage(error)
      const message = apiMessage.dedupeKey === 'http-401'
        ? 'Invalid email or password'
        : apiMessage.description
      setErrors({ password: message })
      ToastService.error({
        title: 'Sign in failed',
        description: message,
        duration: 3000,
        dedupeKey: 'login-failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <GoogleSignInSection />
      <Box as="form" onSubmit={handleSubmit} noValidate>
        <VStack spacing={4} align="stretch">
          <AuthField
            ref={emailRef}
            label="Email"
            icon={Mail}
            type="email"
            name="email"
            value={email}
            onChange={(v) => {
              setEmail(v)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
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
            name="current-password"
            value={password}
            onChange={(v) => {
              setPassword(v)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            placeholder="Your password"
            autoComplete="current-password"
            error={errors.password}
            isDisabled={loading}
            rightElement={
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={<Icon as={showPassword ? EyeOff : Eye} boxSize={4} />}
                variant="ghost"
                size="sm"
                color="#94a398"
                _hover={{ color: '#efeae0', bg: 'rgba(239,234,224,0.06)' }}
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
              />
            }
          />

          <Button
            type="submit"
            isLoading={loading}
            loadingText="Signing in"
            rightIcon={!loading ? <Icon as={ArrowRight} boxSize={4} /> : undefined}
            h="48px"
            w="full"
            mt={2}
            fontSize="sm"
            fontWeight={700}
            color="#070a08"
            borderRadius="999px"
            bg="#7fe6b3"
            border="1px solid #7fe6b3"
            boxShadow="0 8px 24px -10px rgba(127, 230, 179, 0.4)"
            transition="transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease"
            _hover={{
              bg: '#a5edca',
              transform: 'translateY(-1px)',
              boxShadow: '0 12px 30px -10px rgba(127, 230, 179, 0.55)',
            }}
            _active={{ transform: 'translateY(0)', bg: '#6dd9a3' }}
            _loading={{ opacity: 0.7 }}
          >
            Sign in
          </Button>

          <Text textAlign="center" color="#94a398" fontSize="sm" pt={1}>
            Don't have an account?{' '}
            <Button
              variant="link"
              color="#7fe6b3"
              fontWeight={600}
              fontSize="sm"
              onClick={onSwitchToRegister}
              _hover={{ color: '#a5edca', textDecoration: 'none' }}
            >
              Create one
            </Button>
          </Text>
        </VStack>
      </Box>
    </VStack>
  )
}
