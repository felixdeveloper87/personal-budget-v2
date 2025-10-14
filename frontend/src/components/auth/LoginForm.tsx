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

interface LoginFormProps {
  onSwitchToRegister: () => void
}

/**
 * 🔐 LoginForm Component
 * - Handles user login with email and password
 * - Includes password visibility toggle
 * - Integrates with AuthContext for authentication
 */
export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const toast = useToast()
  const colors = useThemeColors()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      toast({
        title: 'Success',
        description: 'Logged in successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
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
          Welcome Back
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

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          w="full"
          isLoading={loading}
          loadingText="Signing in..."
          fontWeight="bold"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          transition="all 0.2s"
        >
          Sign In
        </Button>

        <Text textAlign="center" color={colors.text.secondary}>
          Don't have an account?{' '}
          <Button
            variant="link"
            color={colors.accent}
            onClick={onSwitchToRegister}
            fontWeight="bold"
            _hover={{ textDecoration: 'underline' }}
          >
            Sign up
          </Button>
        </Text>
      </VStack>
    </Box>
  )
}

