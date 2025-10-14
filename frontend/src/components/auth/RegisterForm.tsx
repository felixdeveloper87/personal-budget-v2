import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
  useToast,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import { useThemeColors } from '../../hooks/useThemeColors'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

/**
 * 📝 RegisterForm Component
 * - Handles user registration with email, password, and confirm password
 * - Includes password visibility toggle
 * - Integrates with AuthContext for authentication
 */
export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const toast = useToast()
  const colors = useThemeColors()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    try {
      await register(email, password)
      toast({
        title: 'Success',
        description: 'Account created successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create account',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box w="full" maxW="md" mx="auto">
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        <Text fontSize="2xl" fontWeight="bold" color={colors.text.primary} textAlign="center">
          Create Account
        </Text>
        
        <FormControl isRequired>
          <FormLabel color={colors.text.label}>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            bg={colors.inputBg}
            borderColor={colors.border}
            _focus={{
              borderColor: colors.accent,
              boxShadow: `0 0 0 1px ${colors.accent}`,
            }}
            _hover={{
              borderColor: colors.accent,
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel color={colors.text.label}>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              bg={colors.inputBg}
              borderColor={colors.border}
              _focus={{
                borderColor: colors.accent,
                boxShadow: `0 0 0 1px ${colors.accent}`,
              }}
              _hover={{
                borderColor: colors.accent,
              }}
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl isRequired>
          <FormLabel color={colors.text.label}>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              bg={colors.inputBg}
              borderColor={colors.border}
              _focus={{
                borderColor: colors.accent,
                boxShadow: `0 0 0 1px ${colors.accent}`,
              }}
              _hover={{
                borderColor: colors.accent,
              }}
            />
            <InputRightElement>
              <IconButton
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button
          type="submit"
          colorScheme="green"
          size="lg"
          w="full"
          isLoading={loading}
          loadingText="Creating account..."
          fontWeight="bold"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          transition="all 0.2s"
        >
          Create Account
        </Button>

        <Text textAlign="center" color={colors.text.secondary}>
          Already have an account?{' '}
          <Button
            variant="link"
            color={colors.accent}
            onClick={onSwitchToLogin}
            fontWeight="bold"
            _hover={{ textDecoration: 'underline' }}
          >
            Sign in
          </Button>
        </Text>
      </VStack>
    </Box>
  )
}

