import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  Link,
  HStack,
  Divider,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  Checkbox,
  FormErrorMessage
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon, EmailIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

const MotionBox = motion.create(Box)
const MotionButton = motion.create(Button)

interface LoginFormProps {
  onToggleMode: () => void
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  // --- State ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  // --- Hooks ---
  const { login } = useAuth()
  const toast = useToast()

  // --- Colors ---
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const labelColor = useColorModeValue('gray.700', 'gray.200')
  const linkColor = useColorModeValue('blue.500', 'blue.400')
  const hoverColor = useColorModeValue('blue.600', 'blue.300')

  // --- Form validation ---
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Please enter a valid email'

    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // --- Submit handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await login({ email, password }) // triggers backend call
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description:
          error?.response?.data?.message ||
          'Invalid email or password. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack spacing={2} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color={labelColor}>
            Sign In
          </Text>
          <Text fontSize="sm" color={textColor}>
            Enter your credentials to access your account
          </Text>
        </VStack>

        <Divider />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">

            {/* Email Field */}
            <FormControl isInvalid={!!errors.email}>
              <FormLabel fontSize="sm" fontWeight="600" color={labelColor}>
                Email Address
              </FormLabel>
              <InputGroup>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={errors.email ? 'red.300' : 'gray.200'}
                  _hover={{ borderColor: errors.email ? 'red.400' : 'blue.300' }}
                  _focus={{
                    borderColor: errors.email ? 'red.400' : 'blue.500',
                    boxShadow: errors.email
                      ? '0 0 0 1px red.400'
                      : '0 0 0 1px blue.500'
                  }}
                  _dark={{
                    borderColor: errors.email ? 'red.500' : 'gray.600',
                    _hover: { borderColor: errors.email ? 'red.400' : 'blue.400' },
                    _focus: {
                      borderColor: errors.email ? 'red.400' : 'blue.400',
                      boxShadow: errors.email
                        ? '0 0 0 1px red.400'
                        : '0 0 0 1px blue.400'
                    }
                  }}
                />
                <InputRightElement>
                  <EmailIcon color="gray.400" />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            {/* Password Field */}
            <FormControl isInvalid={!!errors.password}>
              <FormLabel fontSize="sm" fontWeight="600" color={labelColor}>
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={errors.password ? 'red.300' : 'gray.200'}
                  _hover={{
                    borderColor: errors.password ? 'red.400' : 'blue.300'
                  }}
                  _focus={{
                    borderColor: errors.password ? 'red.400' : 'blue.500',
                    boxShadow: errors.password
                      ? '0 0 0 1px red.400'
                      : '0 0 0 1px blue.500'
                  }}
                  _dark={{
                    borderColor: errors.password ? 'red.500' : 'gray.600',
                    _hover: { borderColor: errors.password ? 'red.400' : 'blue.400' },
                    _focus: {
                      borderColor: errors.password ? 'red.400' : 'blue.400',
                      boxShadow: errors.password
                        ? '0 0 0 1px red.400'
                        : '0 0 0 1px blue.400'
                    }
                  }}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    color="gray.400"
                    _hover={{ color: 'blue.500' }}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            {/* Remember Me + Forgot Password */}
            <HStack justify="space-between" align="center">
              <Checkbox
                isChecked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                colorScheme="blue"
                size="sm"
              >
                <Text fontSize="sm" color={textColor}>
                  Remember me
                </Text>
              </Checkbox>

              <Link
                fontSize="sm"
                color={linkColor}
                _hover={{ color: hoverColor }}
                onClick={() =>
                  toast({
                    title: 'Feature coming soon',
                    description:
                      'Password reset functionality will be available soon.',
                    status: 'info',
                    duration: 3000,
                    isClosable: true
                  })
                }
              >
                Forgot password?
              </Link>
            </HStack>

            {/* Submit */}
            <MotionButton
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              isLoading={loading}
              loadingText="Signing in..."
              borderRadius="xl"
              fontWeight="600"
              py={6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              _hover={{
                bg: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
                shadow: 'lg'
              }}
              _active={{
                transform: 'translateY(0)',
                shadow: 'md'
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              Sign In
            </MotionButton>
          </VStack>
        </form>

        {/* Sign Up link */}
        <VStack spacing={3}>
          <Divider />
          <HStack spacing={1} fontSize="sm">
            <Text color={textColor}>Don't have an account?</Text>
            <Link
              color={linkColor}
              fontWeight="600"
              _hover={{
                color: hoverColor,
                textDecoration: 'underline'
              }}
              onClick={onToggleMode}
            >
              Sign up here
            </Link>
          </HStack>
        </VStack>
      </VStack>
    </MotionBox>
  )
}
