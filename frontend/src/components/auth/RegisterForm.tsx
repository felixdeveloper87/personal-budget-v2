import { useRef, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import AuthField from './AuthField'
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from './auth.constants'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

interface RegisterErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
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

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const { register } = useAuth()
  const toast = useToast()

  const subtleText = useColorModeValue('gray.500', 'gray.400')
  const linkColor = useColorModeValue('blue.600', 'blue.300')
  const linkHover = useColorModeValue('blue.700', 'blue.200')
  const eyeIconColor = useColorModeValue('gray.500', 'gray.400')
  const trustText = useColorModeValue('gray.500', 'gray.500')

  const clearError = (field: keyof RegisterErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!validate()) return

    setLoading(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
      toast({
        title: 'Account created',
        description: "You're all set — welcome aboard.",
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
        variant: 'subtle',
      })
    } catch (error: any) {
      const message = error?.message || 'Could not create your account'
      setErrors({ email: message })
      toast({
        title: 'Sign up failed',
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
    <Box as="form" onSubmit={handleSubmit} noValidate>
      <VStack spacing={4} align="stretch">
        <AuthField
          ref={nameRef}
          label="Name"
          icon={User}
          name="name"
          value={name}
          onChange={(v) => {
            setName(v)
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
          onChange={(v) => {
            setEmail(v)
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
          name="new-password"
          value={password}
          onChange={(v) => {
            setPassword(v)
            clearError('password')
          }}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          autoComplete="new-password"
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

        <AuthField
          ref={confirmRef}
          label="Confirm password"
          icon={Lock}
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirm-password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v)
            clearError('confirmPassword')
          }}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          isDisabled={loading}
          rightElement={
            <IconButton
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              icon={<Icon as={showConfirmPassword ? EyeOff : Eye} boxSize={4} />}
              variant="ghost"
              size="sm"
              color={eyeIconColor}
              onClick={() => setShowConfirmPassword((s) => !s)}
              tabIndex={-1}
            />
          }
        />

        <Button
          type="submit"
          isLoading={loading}
          loadingText="Creating account"
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
          Create account
        </Button>

        <HStack spacing={2} justify="center" pt={1}>
          <Icon as={ShieldCheck} boxSize={3.5} color={trustText} />
          <Text fontSize="xs" color={trustText}>
            No credit card. Cancel anytime.
          </Text>
        </HStack>

        <Text textAlign="center" color={subtleText} fontSize="sm">
          Already have an account?{' '}
          <Button
            variant="link"
            color={linkColor}
            fontWeight={600}
            fontSize="sm"
            onClick={onSwitchToLogin}
            _hover={{ color: linkHover, textDecoration: 'underline' }}
          >
            Sign in
          </Button>
        </Text>
      </VStack>
    </Box>
  )
}
