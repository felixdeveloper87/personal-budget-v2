import { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { Home } from 'lucide-react'
import { X } from 'lucide-react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { getShimmerStyles, getModalHeaderStyles } from '../ui'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLanding?: () => void
}

export default function AuthModal({ isOpen, onClose, onBackToLanding }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const headerStyles = getModalHeaderStyles(useColorModeValue)
  const cardBg = useColorModeValue('white', '#111111')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

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
          animation: 'slideIn 0.3s ease-out',
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
          background="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)"
          borderRadius="3xl"
          filter="blur(40px)"
          opacity={0.6}
          zIndex={0}
        />
        
        <VStack spacing={0} align="stretch" h="full" overflow="hidden">
          {/* Animated top bar */}
          <Box height="4px" sx={getShimmerStyles()} />
          
          {/* Header */}
          <Box {...headerStyles.container}>
            {/* Fixed close button in top right corner */}
            <Button
              onClick={onClose}
              {...headerStyles.closeButton}
            >
              <Icon as={X} boxSize={headerStyles.closeButton.iconSize} color={headerStyles.closeButton.iconColor} />
            </Button>

            <Flex 
              direction={{ base: 'column', sm: 'row' }}
              align={{ base: 'flex-start', sm: 'center' }}
              justify={{ base: 'flex-start', sm: 'space-between' }}
              gap={{ base: 3, sm: 4 }}
              w="full"
              pr={{ base: 16, sm: 16, md: 20 }} // Space for close button on all sizes
            >
              {/* Mobile: Icon, Title and Subtitle stacked */}
              <VStack 
                align="flex-start" 
                spacing={2}
                display={{ base: 'flex', sm: 'none' }}
                w="full"
              >
                {/* Icon and Title row */}
                <HStack 
                  spacing={2} 
                  align="center"
                >
                  <Box {...headerStyles.iconContainer}>
                    <Text
                      fontSize="xl"
                      fontWeight="extrabold"
                      color="white"
                    >
                      £
                    </Text>
                  </Box>
                  <Text 
                    {...headerStyles.title}
                    textAlign="left"
                    fontSize="lg"
                    fontWeight="800"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #ffffff, #f8fafc)',
                      'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
                    )}
                    bgClip="text"
                    textShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                    _hover={{
                      transform: 'scale(1.02)',
                      transition: 'all 0.2s ease'
                    }}
                    letterSpacing="wide"
                    lineHeight="shorter"
                  >
                    Personal Budget
                  </Text>
                </HStack>
                
                {/* Subtitle with Back Button row */}
                <HStack 
                  spacing={2} 
                  align="center" 
                  justify="flex-start"
                  flexWrap="nowrap"
                  w="full"
                >
                  <Text 
                    {...headerStyles.subtitle}
                    textAlign="left"
                    fontSize="sm"
                    fontWeight="600"
                    color="rgba(255, 255, 255, 0.9)"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      'linear-gradient(135deg, #60a5fa, #a78bfa)'
                    )}
                    bgClip="text"
                    px={3}
                    py={1}
                    borderRadius="full"
                    bgGradient={useColorModeValue(
                      'linear(to-r, blue.400, purple.400)',
                      'linear(to-r, blue.300, purple.300)'
                    )}
                    _hover={{
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease'
                    }}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxW="200px"
                  >
                    {isLogin ? '✨ Welcome Back!' : '🚀 Join Us Today!'}
                  </Text>
                  
                  {/* Back Button - Next to subtitle on mobile */}
                  {onBackToLanding && (
                    <Button
                      onClick={onBackToLanding}
                      {...headerStyles.backButton}
                      size="xs"
                      px={2}
                      py={1}
                      minW="auto"
                      borderRadius="full"
                    >
                      <HStack spacing={1}>
                        <ArrowBackIcon boxSize={3} />
                        <Icon as={Home} boxSize={3} />
                      </HStack>
                    </Button>
                  )}
                </HStack>
              </VStack>

              {/* Desktop: Logo and Brand Section */}
              <HStack 
                spacing={4} 
                align="center" 
                justify="center"
                display={{ base: 'none', sm: 'flex' }}
              >
                <Box {...headerStyles.iconContainer}>
                  <Text
                    fontSize="2xl"
                    fontWeight="extrabold"
                    color="white"
                  >
                    £
                  </Text>
                </Box>
                <VStack align="start" spacing={1}>
                  <Text 
                    {...headerStyles.title}
                    textAlign="left"
                    fontSize={{ sm: 'xl', md: '2xl' }}
                    fontWeight="800"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #ffffff, #f8fafc)',
                      'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
                    )}
                    bgClip="text"
                    textShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                    _hover={{
                      transform: 'scale(1.02)',
                      transition: 'all 0.2s ease'
                    }}
                    letterSpacing="wide"
                    lineHeight="shorter"
                  >
                    Personal Budget
                  </Text>
                  <Text 
                    {...headerStyles.subtitle}
                    textAlign="left"
                    fontSize="sm"
                    fontWeight="600"
                    color="rgba(255, 255, 255, 0.9)"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      'linear-gradient(135deg, #60a5fa, #a78bfa)'
                    )}
                    bgClip="text"
                    _hover={{
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isLogin ? '✨ Welcome Back!' : '🚀 Join Us Today!'}
                  </Text>
                </VStack>
              </HStack>

              {/* Desktop: Back to Home Button - Positioned correctly */}
              {onBackToLanding && (
                <Button
                  onClick={onBackToLanding}
                  {...headerStyles.backButton}
                  size="sm"
                  px={3}
                  py={2}
                  display={{ base: 'none', sm: 'flex' }}
                  borderRadius="full"
                >
                  <HStack spacing={1}>
                    <ArrowBackIcon boxSize={4} />
                    <Icon as={Home} boxSize={4} />
                  </HStack>
                </Button>
              )}
            </Flex>
          </Box>

          {/* Modal content */}
          <Box flex="1" p={{ base: 4, sm: 6, md: 8 }} overflowY="auto">
            <Box
              w="full"
              maxW={{ base: '100%', sm: 'md', md: 'lg' }}
              mx="auto"
              bg={cardBg}
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
                background: 'linear-gradient(90deg, #0ea5e9, #3b82f6, #8b5cf6, #ec4899)',
                borderRadius: { base: '2xl 2xl 0 0', sm: '3xl 3xl 0 0', md: '3xl 3xl 0 0' }
              }}
            >
              <Box position="relative" zIndex={1}>
                {isLogin ? (
                  <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
                ) : (
                  <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
                )}
              </Box>
            </Box>
          </Box>
        </VStack>
      </ModalContent>
    </Modal>
  )
}
