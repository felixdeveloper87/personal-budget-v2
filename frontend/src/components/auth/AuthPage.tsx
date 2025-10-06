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
    <Box minH="100vh" bgGradient={bgGradient} display="flex" flexDirection="column" position="relative">
      {/* Header */}
      <Header onLogin={() => { }} />


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
          {/* Back to Home Button */}
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            alignSelf="center"
            mb={4}
          >
            <Button
              leftIcon={<ArrowBackIcon boxSize={{ base: 4, md: 5 }} />}
              onClick={onBackToLanding}
              color="white"
              bgGradient={useColorModeValue(
                'linear(to-r, blue.500, purple.500)',
                'linear(to-r, blue.400, purple.400)'
              )}
              border="2px solid"
              borderColor={useColorModeValue('blue.300', 'purple.500')}
              boxShadow={useColorModeValue(
                '0 0 20px rgba(59,130,246,0.4)',
                '0 0 25px rgba(147,51,234,0.5)'
              )}
              _hover={{
                transform: 'translateX(-4px) scale(1.05)',
                boxShadow: useColorModeValue(
                  '0 0 30px rgba(59,130,246,0.6)',
                  '0 0 35px rgba(147,51,234,0.6)'
                ),
                filter: 'brightness(1.1)',
              }}
              size={{ base: 'sm', md: 'md' }}
              fontWeight="600"
              fontSize={{ base: 'sm', md: 'md' }}
              px={{ base: 4, md: 6 }}
              py={{ base: 2, md: 3 }}
              borderRadius="full"
              transition="all 0.25s ease-in-out"
            >
              Back to Home
            </Button>
          </MotionBox>

          {/* Enhanced Brand Section */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            textAlign="center"
            position="relative"
          >
            <VStack spacing={6}>
              <HStack spacing={4}>
                <Box
                  w={20}
                  h={20}
                  bg={useColorModeValue(
                    'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%)',
                    'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)'
                  )}
                  borderRadius="3xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow={useColorModeValue(
                    '0 0 30px rgba(14, 165, 233, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)',
                    '0 0 30px rgba(30, 64, 175, 0.7), 0 0 60px rgba(55, 48, 163, 0.5)'
                  )}
                  _hover={{
                    transform: 'scale(1.1) rotate(5deg)',
                    boxShadow: useColorModeValue(
                      '0 0 40px rgba(14, 165, 233, 0.7), 0 0 80px rgba(59, 130, 246, 0.5)',
                      '0 0 40px rgba(30, 64, 175, 0.9), 0 0 80px rgba(55, 48, 163, 0.7)'
                    ),
                  }}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  position="relative"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    inset: '-2px',
                    background: 'linear-gradient(45deg, #0ea5e9, #3b82f6, #8b5cf6, #ec4899)',
                    borderRadius: '3xl',
                    zIndex: -1,
                    opacity: 0.3,
                    filter: 'blur(8px)'
                  }}
                >
                  <Text
                    fontSize="4xl"
                    fontWeight="extrabold"
                    color={useColorModeValue('white', 'black')}
                    textShadow={useColorModeValue(
                      '0 0 12px rgba(255,255,255,0.9), 0 0 24px rgba(255,255,255,0.5)',
                      '0 0 12px rgba(0,0,0,0.4), 0 0 24px rgba(0,0,0,0.3)'
                    )}
                    animation="logoGlow 3s ease-in-out infinite"
                    sx={{
                      '@keyframes logoGlow': {
                        '0%, 100%': {
                          textShadow: useColorModeValue(
                            '0 0 12px rgba(255,255,255,0.9), 0 0 24px rgba(255,255,255,0.5)',
                            '0 0 12px rgba(0,0,0,0.4), 0 0 24px rgba(0,0,0,0.3)'
                          )
                        },
                        '50%': {
                          textShadow: useColorModeValue(
                            '0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.8)',
                            '0 0 20px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.5)'
                          )
                        }
                      }
                    }}
                  >
                    £
                  </Text>
                </Box>
                <VStack spacing={2} align="start">
                  <Text
                    fontSize="3xl"
                    fontWeight="bold"
                    color={labelColor}
                    bgGradient={useColorModeValue(
                      'linear(to-r, gray.800, gray.600)',
                      'linear(to-r, white, gray.200)'
                    )}
                    bgClip="text"
                  >
                    Personal Budget
                  </Text>
                  <Text
                    fontSize="md"
                    color={textColor}
                    fontWeight="500"
                    letterSpacing="wide"
                  >
                    Smart Financial Management
                  </Text>
                </VStack>
              </HStack>

              <VStack spacing={3}>
                <Text
                  fontSize="xl"
                  fontWeight="700"
                  color={labelColor}
                  bgGradient={useColorModeValue(
                    'linear(to-r, blue.600, purple.600)',
                    'linear(to-r, blue.400, purple.400)'
                  )}
                  bgClip="text"
                >
                  {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
                </Text>
                <Text
                  fontSize="md"
                  color={textColor}
                  textAlign="center"
                  maxW="md"
                  lineHeight="1.6"
                >
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
              borderRadius="3xl"
              border="1px"
              borderColor={borderColor}
              p={{ base: 8, md: 10 }}
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #0ea5e9, #3b82f6, #8b5cf6, #ec4899)',
                borderRadius: '3xl 3xl 0 0'
              }}
            >
              {/* Enhanced Decorative elements */}
              <Box
                position="absolute"
                top={-60}
                right={-60}
                w={120}
                h={120}
                bg="linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)"
                borderRadius="full"
                filter="blur(50px)"
                animation="float 6s ease-in-out infinite"
                sx={{
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(180deg)' }
                  }
                }}
              />
              <Box
                position="absolute"
                bottom={-40}
                left={-40}
                w={100}
                h={100}
                bg="linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)"
                borderRadius="full"
                filter="blur(50px)"
                animation="float 8s ease-in-out infinite reverse"
                sx={{
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(180deg)' }
                  }
                }}
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w={200}
                h={200}
                bg="linear-gradient(45deg, rgba(14, 165, 233, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(139, 92, 246, 0.05) 100%)"
                borderRadius="full"
                filter="blur(60px)"
                animation="pulse 4s ease-in-out infinite"
                sx={{
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.3, transform: 'translate(-50%, -50%) scale(1)' },
                    '50%': { opacity: 0.6, transform: 'translate(-50%, -50%) scale(1.1)' }
                  }
                }}
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

        </MotionVStack>
      </Container>
    </Box>
  )
}
