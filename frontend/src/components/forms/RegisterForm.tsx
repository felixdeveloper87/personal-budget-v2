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
  FormErrorMessage,
  Progress
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon, EmailIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

const MotionBox = motion.create(Box)
const MotionButton = motion.create(Button)

interface RegisterFormProps {
  onToggleMode: () => void
}

export default function RegisterForm({ onToggleMode }: RegisterFormProps) {
  // --- Form state ---
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})

  const { register } = useAuth()
  const toast = useToast()

  // --- Colors depending on theme ---
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const labelColor = useColorModeValue('gray.700', 'gray.200')
  const linkColor = useColorModeValue('blue.500', 'blue.400')
  const hoverColor = useColorModeValue('blue.600', 'blue.300')

  // --- Password strength indicator ---
  const getPasswordStrength = (value: string) => {
    let strength = 0
    if (value.length >= 6) strength += 20
    if (value.length >= 8) strength += 20
    if (/[A-Z]/.test(value)) strength += 20
    if (/[0-9]/.test(value)) strength += 20
    if (/[^A-Za-z0-9]/.test(value)) strength += 20
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const getStrengthColor = (s: number) => (s < 40 ? 'red' : s < 80 ? 'yellow' : 'green')

  // --- Client-side form validation ---
  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!name.trim()) newErrors.name = 'Name is required'
    else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters'

    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email'

    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    if (!acceptTerms) newErrors.terms = 'You must accept the terms and conditions'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // --- Form submit handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      await register({ name: name.trim(), email, password })
      toast({
        title: 'Welcome to Personal Budget!',
        description: 'Your account has been created successfully.',
        status: 'success',
        duration: 4000,
        isClosable: true
      })
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description:
          error?.response?.data?.message || 'Unable to create account. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  // --- Render ---
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
            Create Account
          </Text>
          <Text fontSize="sm" color={textColor}>
            Join Personal Budget and start managing your finances today
          </Text>
        </VStack>

        <Divider />

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            {/* Name */}
            <FormControl isInvalid={!!errors.name}>
              <FormLabel color={labelColor}>Full Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            {/* Email */}
            <FormControl isInvalid={!!errors.email}>
              <FormLabel color={labelColor}>Email Address</FormLabel>
              <InputGroup>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                <InputRightElement>
                  <EmailIcon color="gray.400" />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            {/* Password */}
            <FormControl isInvalid={!!errors.password}>
              <FormLabel color={labelColor}>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
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

              {/* Strength indicator */}
              {password && (
                <VStack spacing={2} mt={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="xs" color={textColor}>
                      Password strength
                    </Text>

                    {/* Dynamic color + label */}
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      color={
                        passwordStrength < 40
                          ? 'red.400'
                          : passwordStrength < 80
                            ? 'yellow.400'
                            : 'green.400'
                      }
                    >
                      {passwordStrength < 40
                        ? 'Weak'
                        : passwordStrength < 80
                          ? 'Medium'
                          : 'Strong'}
                    </Text>
                  </HStack>

                  {/* Smooth animated progress bar */}
                  <Box
                    position="relative"
                    h="6px"
                    borderRadius="full"
                    overflow="hidden"
                    bg={useColorModeValue('gray.200', 'gray.700')}
                  >
                    <Box
                      h="full"
                      w={`${passwordStrength}%`}
                      borderRadius="full"
                      transition="all 0.3s ease"
                      bg={
                        passwordStrength < 40
                          ? 'red.400'
                          : passwordStrength < 80
                            ? 'yellow.400'
                            : 'green.400'
                      }
                    />
                  </Box>
                </VStack>
              )}
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            {/* Confirm Password */}
            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel color={labelColor}>Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    color="gray.400"
                    _hover={{ color: 'blue.500' }}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>

            {/* Terms */}
            <FormControl isInvalid={!!errors.terms}>
              <Checkbox
                isChecked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                colorScheme="blue"
                size="sm"
              >
                <Text fontSize="sm" color={textColor}>
                  I agree to the{' '}
                  <Link color={linkColor} _hover={{ color: hoverColor }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link color={linkColor} _hover={{ color: hoverColor }}>
                    Privacy Policy
                  </Link>
                </Text>
              </Checkbox>
              <FormErrorMessage>{errors.terms}</FormErrorMessage>
            </FormControl>

            {/* Submit button */}
            <MotionButton
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              isLoading={loading}
              loadingText="Creating account..."
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
              _active={{ transform: 'translateY(0)', shadow: 'md' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              Create Account
            </MotionButton>
          </VStack>
        </form>

        {/* Switch to Login */}
        <VStack spacing={3}>
          <Divider />
          <HStack spacing={1} fontSize="sm">
            <Text color={textColor}>Already have an account?</Text>
            <Link
              color={linkColor}
              fontWeight="600"
              _hover={{ color: hoverColor, textDecoration: 'underline' }}
              onClick={onToggleMode}
            >
              Sign in here
            </Link>
          </HStack>
        </VStack>
      </VStack>
    </MotionBox>
  )
}
