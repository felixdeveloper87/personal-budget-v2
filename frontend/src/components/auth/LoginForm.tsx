import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Icon,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from '../ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import AuthField from './AuthField'
import GoogleSignInSection from './GoogleSignInSection'
import { EMAIL_REGEX } from './auth.constants'

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
  const toast = useToast()

  // Resolved once — no per-render color computation
  const subtleText = useColorModeValue('gray.500', 'gray.400')
  const linkColor = useColorModeValue('blue.600', 'blue.300')
  const linkHover = useColorModeValue('blue.700', 'blue.200')
  const eyeIconColor = useColorModeValue('gray.500', 'gray.400')

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
      toast({
        title: 'Welcome back',
        status: 'success',
        duration: 1800,
        isClosable: true,
        position: 'top',
        variant: 'subtle',
      })
    } catch (error: unknown) {
      let message = 'Invalid email or password'
      if (axios.isAxiosError(error)) {
        const body = error.response?.data as { error?: string } | undefined
        if (body?.error) message = body.error
      }
      setErrors({ password: message })
      toast({
        title: 'Sign in failed',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        variant: 'subtle',
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
              color={eyeIconColor}
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
          color="white"
          borderRadius="lg"
          bg="linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)"
          bgSize="200% 100%"
          bgPosition="0% 50%"
          boxShadow="0 8px 24px -10px rgba(79, 70, 229, 0.55)"
          transition="background-position 0.3s ease, transform 0.15s ease, box-shadow 0.2s ease"
          _hover={{
            bgPosition: '100% 50%',
            transform: 'translateY(-1px)',
            boxShadow: '0 12px 30px -10px rgba(79, 70, 229, 0.65)',
          }}
          _active={{ transform: 'translateY(0)' }}
        >
          Sign in
        </Button>

        <Text textAlign="center" color={subtleText} fontSize="sm" pt={1}>
          Don't have an account?{' '}
          <Button
            variant="link"
            color={linkColor}
            fontWeight={600}
            fontSize="sm"
            onClick={onSwitchToRegister}
            _hover={{ color: linkHover, textDecoration: 'underline' }}
          >
            Create one
          </Button>
        </Text>
        </VStack>
      </Box>
    </VStack>
  )
}
