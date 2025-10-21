import { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { animations, getGradients, safeAreaStyles, safariStyles, getResponsiveStyles, getShimmerStyles } from '../ui'
import { useThemeColors } from '../../hooks/useThemeColors'

// --- Motion Components ---
const MotionBox = motion.create(Box)
const MotionVStack = motion.create(VStack)

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLanding?: () => void
}

export default function AuthModal({ isOpen, onClose, onBackToLanding }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const colors = useThemeColors()
  const gradients = getGradients()
  const responsiveStyles = getResponsiveStyles()

  // --- Theme-dependent colors ---
  const cardBg = useColorModeValue(
    'rgba(255, 255, 255, 0.95)',
    'rgba(17, 17, 17, 0.95)'
  )
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const labelColor = useColorModeValue('gray.700', 'gray.200')

  const backBtnGradient = useColorModeValue(
    'linear(to-r, blue.500, purple.500)',
    'linear(to-r, blue.400, purple.400)'
  )

  const backBtnShadow = useColorModeValue(
    '0 0 20px rgba(59,130,246,0.4)',
    '0 0 25px rgba(147,51,234,0.5)'
  )

  const headerGradient = useColorModeValue(
    'linear-gradient(135deg, #0ea5e9, #3b82f6, #8b5cf6)',
    'linear-gradient(135deg, #1e40af, #7c3aed, #c026d3)'
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl' }}
      isCentered={false}
      scrollBehavior="inside"
      closeOnOverlayClick={false}
      closeOnEsc={true}
      blockScrollOnMount={true}
    >
      <ModalOverlay 
        bg="blackAlpha.700" 
        backdropFilter="blur(12px)"
      />
      <ModalContent 
        borderRadius={{ base: 'none', sm: '2xl', md: '3xl' }}
        overflow="hidden"
        m={{ base: 0, sm: 4, md: 4 }}
        mt={{ base: 0, sm: 8, md: 4 }}
        mb={{ base: 0, sm: 4, md: 4 }}
        mx={{ base: 0, sm: 4, md: 4 }}
        display="flex"
        flexDirection="column"
        bg={cardBg}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={useColorModeValue(
          'rgba(255, 255, 255, 0.2)',
          'rgba(255, 255, 255, 0.1)'
        )}
        shadow="2xl"
        position="relative"
        maxH={{ base: '100vh', sm: '90vh', md: '90vh' }}
        h={{ base: '100vh', sm: 'auto', md: 'auto' }}
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal,
          animation: animations.slideIn,
          '@keyframes slideIn': {
            from: { 
              opacity: 0, 
              transform: 'translateY(100%) scale(0.95)' 
            },
            to: { 
              opacity: 1, 
              transform: 'translateY(0) scale(1)' 
            }
          }
        }}
      >        
        {/* Decorative background */}
        <Box
          position="absolute"
          top="-50px"
          left="-50px"
          right="-50px"
          height="200px"
          background={gradients.decorative}
          borderRadius="3xl"
          filter="blur(40px)"
          opacity={0.6}
          zIndex={0}
        />
        
        <VStack spacing={0} align="stretch" h="full" overflow="hidden">
          {/* Header */}
          <Box
            textAlign="center"
            borderBottom="1px"
            borderColor={colors.border}
            py={{ base: 6, sm: 5, md: 6 }}
            px={{ base: 4, sm: 6, md: 8 }}
            bg={headerGradient}
            color="white"
            fontWeight="800"
            letterSpacing="wide"
            position="relative"
            sx={{ animation: animations.shimmer }}
            minH={{ base: '140px', sm: '120px', md: '140px' }}
          >
            {/* Animated top bar */}
            <Box
              height="4px"
              sx={getShimmerStyles()}
            />


            {/* Close button - Mobile optimized */}
            <Button
              position="absolute"
              top={{ base: 3, sm: 4, md: 6 }}
              right={{ base: 3, sm: 4, md: 6 }}
              size={{ base: 'md', sm: 'lg', md: 'lg' }}
              variant="ghost"
              onClick={onClose}
              borderRadius="full"
              p={{ base: 2, sm: 3, md: 3 }}
              bg="rgba(255, 255, 255, 0.2)"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.3)"
              _hover={{
                bg: 'rgba(255, 255, 255, 0.3)',
                transform: 'scale(1.1)',
                boxShadow: 'lg',
              }}
              _active={{
                transform: 'scale(0.95)',
              }}
              transition="all 0.2s ease"
              zIndex={10}
              boxShadow="md"
              aria-label="Close modal"
              minH={{ base: '32px', sm: '40px', md: '40px' }}
              minW={{ base: '32px', sm: '40px', md: '40px' }}
            >
              <Icon as={X} boxSize={{ base: 4, sm: 5, md: 5 }} color="white" />
            </Button>

            {/* Brand Section - Mobile optimized */}
            <MotionBox
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              textAlign="center"
              position="relative"
              w="full"
            >
              <VStack spacing={{ base: 4, sm: 5, md: 6 }}>
                <HStack spacing={{ base: 3, sm: 4, md: 4 }} justify="center">
                  {/* Logo Icon - Mobile optimized */}
                  <Box
                    w={{ base: 16, sm: 18, md: 20 }}
                    h={{ base: 16, sm: 18, md: 20 }}
                    bg="rgba(255, 255, 255, 0.2)"
                    borderRadius="3xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 0 30px rgba(255, 255, 255, 0.3)"
                    _hover={{
                      transform: 'scale(1.1) rotate(5deg)',
                      boxShadow: '0 0 40px rgba(255, 255, 255, 0.5)',
                    }}
                    transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    <Text
                      fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
                      fontWeight="extrabold"
                      color="white"
                    >
                      £
                    </Text>
                  </Box>

                  {/* Brand Text - Mobile optimized */}
                  <VStack spacing={{ base: 1, sm: 2, md: 2 }} align="start">
                    <Text
                      fontSize={{ base: 'xl', sm: '2xl', md: '3xl' }}
                      fontWeight="bold"
                      color="white"
                      lineHeight="shorter"
                    >
                      Personal Budget
                    </Text>
                    <Text
                      fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                      color="rgba(255, 255, 255, 0.8)"
                      fontWeight="500"
                      letterSpacing="wide"
                      display={{ base: 'none', sm: 'block' }}
                    >
                      Smart Financial Management
                    </Text>
                  </VStack>
                </HStack>

                {/* Welcome / Join message - Mobile optimized */}
                <VStack spacing={{ base: 3, sm: 4, md: 4 }}>
                  <Text
                    fontSize={{ base: 'lg', sm: 'xl', md: 'xl' }}
                    fontWeight="700"
                    color="white"
                    textAlign="center"
                  >
                    {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
                  </Text>
                  <Text
                    fontSize={{ base: 'sm', sm: 'md', md: 'md' }}
                    color="rgba(255, 255, 255, 0.9)"
                    textAlign="center"
                    maxW={{ base: '280px', sm: 'md', md: 'md' }}
                    lineHeight={{ base: 1.5, sm: 1.6, md: 1.6 }}
                    px={{ base: 2, sm: 0, md: 0 }}
                  >
                    {isLogin
                      ? 'Sign in to access your financial dashboard and take control of your budget.'
                      : 'Create your account and start managing your finances with confidence.'}
                  </Text>
                  
                  {/* Back to Home Button - Inside VStack */}
                  {onBackToLanding && (
                    <MotionBox
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                      mt={{ base: 2, sm: 3, md: 4 }}
                    >
                      <Button
                        leftIcon={<ArrowBackIcon boxSize={{ base: 3, sm: 4, md: 5 }} />}
                        onClick={onBackToLanding}
                        color="white"
                        bg="rgba(255, 255, 255, 0.2)"
                        border="2px solid"
                        borderColor="rgba(255, 255, 255, 0.3)"
                        backdropFilter="blur(10px)"
                        _hover={{
                          transform: 'translateX(-4px) scale(1.05)',
                          bg: 'rgba(255, 255, 255, 0.3)',
                          filter: 'brightness(1.1)',
                        }}
                        size={{ base: 'xs', sm: 'sm', md: 'md' }}
                        fontWeight="600"
                        fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                        px={{ base: 4, sm: 5, md: 6 }}
                        py={{ base: 2, sm: 2, md: 3 }}
                        borderRadius="full"
                        transition="all 0.25s ease-in-out"
                        minH={{ base: '32px', sm: '36px', md: '40px' }}
                      >
                        <Text display={{ base: 'none', sm: 'inline' }}>Back to Home</Text>
                        <Text display={{ base: 'inline', sm: 'none' }}>Back</Text>
                      </Button>
                    </MotionBox>
                  )}
                </VStack>
              </VStack>
            </MotionBox>
          </Box>

          {/* Modal content - Mobile optimized */}
          <Box 
            flex="1" 
            p={{ base: 4, sm: 6, md: 8 }}
            overflowY="auto"
            {...responsiveStyles.content}
            sx={{
              ...safeAreaStyles.content,
              ...safariStyles.scrollable,
            }}
          >
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              w="full"
              maxW={{ base: '100%', sm: 'md', md: 'lg' }}
              mx="auto"
            >
              <Box
                bg={useColorModeValue('white', '#111111')}
                shadow="2xl"
                borderRadius={{ base: '2xl', sm: '3xl', md: '3xl' }}
                border="1px"
                borderColor={borderColor}
                p={{ base: 6, sm: 8, md: 10 }}
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background:
                    'linear-gradient(90deg, #0ea5e9, #3b82f6, #8b5cf6, #ec4899)',
                  borderRadius: { base: '2xl 2xl 0 0', sm: '3xl 3xl 0 0', md: '3xl 3xl 0 0' }
                }}
              >
                {/* Form Switch */}
                <Box position="relative" zIndex={1}>
                  {isLogin ? (
                    <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
                  ) : (
                    <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
                  )}
                </Box>
              </Box>
            </MotionBox>
          </Box>
        </VStack>
      </ModalContent>
    </Modal>
  )
}
