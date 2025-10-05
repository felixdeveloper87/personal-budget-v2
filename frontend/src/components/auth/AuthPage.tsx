import { useState } from 'react'
import { 
  Box, 
  Container, 
  useColorMode, 
  Button, 
  HStack, 
  Icon,
  VStack,
  Text,
  Flex,
  useColorModeValue,
  Badge,
  Divider
} from '@chakra-ui/react'
import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import LoginForm from '../forms/LoginForm'
import RegisterForm from '../forms/RegisterForm'
import Header from '../layout/Header'

const MotionBox = motion.create(Box)
const MotionVStack = motion.create(VStack)

interface AuthPageProps {
  onBackToLanding?: () => void
}

export default function AuthPage({ onBackToLanding }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const { colorMode } = useColorMode()
  
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, black, gray.900, gray.800)'
  )
  const cardBg = useColorModeValue('white', '#111111')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const labelColor = useColorModeValue('gray.700', 'gray.200')

  return (
    <Box minH="100vh" bgGradient={bgGradient} display="flex" flexDirection="column">
      {/* Header */}
      <Header onLogin={() => {}} />

      <Container
        maxW={{
          base: "100%",
          md: "4xl",
          lg: "6xl",
          xl: "7xl",
          "2xl": "8xl",
          "3xl": "container.3xl",
        }}
        py={{ base: 8, md: 12 }}
        px={{ base: 4, md: 6 }}
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <MotionVStack
          spacing={8}
          w="full"
          maxW="md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Brand Section */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            textAlign="center"
          >
            <VStack spacing={4}>
              <HStack spacing={3}>
                <Box
                  w={16}
                  h={16}
                  bg={useColorModeValue(
                    'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%)',
                    'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)'
                  )}
                  borderRadius="2xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow={useColorModeValue(
                    '0 0 20px rgba(14, 165, 233, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
                    '0 0 20px rgba(30, 64, 175, 0.6), 0 0 40px rgba(55, 48, 163, 0.4)'
                  )}
                  _hover={{
                    transform: 'scale(1.05) rotate(3deg)',
                    boxShadow: useColorModeValue(
                      '0 0 30px rgba(14, 165, 233, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',
                      '0 0 30px rgba(30, 64, 175, 0.8), 0 0 60px rgba(55, 48, 163, 0.6)'
                    ),
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  <Text
                    fontSize="3xl"
                    fontWeight="extrabold"
                    color={useColorModeValue('white', 'black')}
                    textShadow={useColorModeValue(
                      '0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.4)',
                      '0 0 8px rgba(0,0,0,0.3), 0 0 16px rgba(0,0,0,0.2)'
                    )}
                  >
                    £
                  </Text>
                </Box>
                <VStack spacing={1} align="start">
                  <Text fontSize="2xl" fontWeight="bold" color={labelColor}>
                    Personal Budget
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Smart Financial Management
                  </Text>
                </VStack>
              </HStack>
              
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="600" color={labelColor}>
                  {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
                </Text>
                <Text fontSize="sm" color={textColor} textAlign="center">
                  {isLogin 
                    ? 'Sign in to access your financial dashboard and take control of your budget.'
                    : 'Create your account and start managing your finances with confidence.'
                  }
                </Text>
              </VStack>
            </VStack>
          </MotionBox>

          {/* Auth Form Card */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            w="full"
          >
            <Box
              bg={cardBg}
              shadow="2xl"
              borderRadius="2xl"
              border="1px"
              borderColor={borderColor}
              p={{ base: 6, md: 8 }}
              position="relative"
              overflow="hidden"
            >
              {/* Decorative elements */}
              <Box
                position="absolute"
                top={-50}
                right={-50}
                w={100}
                h={100}
                bg="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
                borderRadius="full"
                filter="blur(40px)"
              />
              <Box
                position="absolute"
                bottom={-30}
                left={-30}
                w={80}
                h={80}
                bg="linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)"
                borderRadius="full"
                filter="blur(40px)"
              />

              {/* Form Content */}
              <Box position="relative" zIndex={1}>
                {isLogin ? (
                  <LoginForm onToggleMode={() => setIsLogin(false)} />
                ) : (
                  <RegisterForm onToggleMode={() => setIsLogin(true)} />
                )}
              </Box>
            </Box>
          </MotionBox>

          {/* Back to Landing */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            <Button
              variant="ghost"
              leftIcon={<ArrowBackIcon />}
              onClick={onBackToLanding}
              color={textColor}
              _hover={{
                color: labelColor,
                transform: 'translateX(-4px)'
              }}
              transition="all 0.2s"
            >
              Back to Home
            </Button>
          </MotionBox>
        </MotionVStack>
      </Container>
    </Box>
  )
}
