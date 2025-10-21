import { useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, Card, CardBody,
  Box, Button, HStack, VStack, Text,
  useColorModeValue, Icon, Flex
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { Home, X } from 'lucide-react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { getShimmerStyles, getModalHeaderStyles, safeAreaStyles, safariStyles, getResponsiveStyles, animations, getGradients } from '../ui'

export default function AuthModal({ isOpen, onClose, onBackToLanding }: {
  isOpen: boolean
  onClose: () => void
  onBackToLanding?: () => void
}) {
  const [isLogin, setIsLogin] = useState(true)
  const headerStyles = getModalHeaderStyles(useColorModeValue)
  const responsiveStyles = getResponsiveStyles()
  const gradients = getGradients()
  const cardBg = useColorModeValue('white', '#111')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // 🎨 Theme shortcuts
  const themeGradients = {
    title: useColorModeValue('linear-gradient(135deg,#fff,#f8fafc)','linear-gradient(135deg,#f1f5f9,#e2e8f0)'),
    subtitle: useColorModeValue('linear-gradient(135deg,#3b82f6,#8b5cf6)','linear-gradient(135deg,#60a5fa,#a78bfa)'),
    logo: useColorModeValue('linear-gradient(135deg,#3b82f6,#1d4ed8)','linear-gradient(135deg,#60a5fa,#3b82f6)')
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl' }}
      isCentered
      scrollBehavior="inside" 
      closeOnOverlayClick={false}
      closeOnEsc={true}
      blockScrollOnMount={true}
    >
      <ModalOverlay 
        bg="blackAlpha.600" 
        backdropFilter="blur(10px)"
      />
      <ModalContent 
        borderRadius={{ base: 'none', md: '3xl' }}
        overflow="hidden"
        m={{ base: 0, md: 4 }}
        display="flex"
        flexDirection="column"
        {...responsiveStyles.modal}
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal
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
        
        {/* Main card with glassmorphism */}
        <Card
          position="relative"
          bg={useColorModeValue(
            'rgba(255, 255, 255, 0.95)',
            'rgba(17, 17, 17, 0.95)'
          )}
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={useColorModeValue(
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.1)'
          )}
          borderRadius={{ base: 'none', sm: '3xl' }}
          shadow="2xl"
          overflow="hidden"
          w="full"
          h="full"
          sx={{
            animation: animations.slideIn,
            '@keyframes slideIn': {
              from: { 
                opacity: 0, 
                transform: 'translateY(20px) scale(0.95)' 
              },
              to: { 
                opacity: 1, 
                transform: 'translateY(0) scale(1)' 
              }
            }
          }}
        >
          {/* Animated top bar */}
          <Box
            height="4px"
            sx={getShimmerStyles()}
          />
          
          <CardBody p={0} display="flex" flexDirection="column" h="full">
            <VStack spacing={0} align="stretch" h="full">

          {/* Header */}
          <Box {...headerStyles.container}>
            <Button 
              onClick={onClose} 
              {...headerStyles.closeButton}
            >
              <Icon as={X} boxSize={headerStyles.closeButton.iconSize} />
            </Button>

            <Flex
              direction={{ base: 'column', sm: 'row' }}
              align={{ base: 'flex-start', sm: 'center' }}
              justify="space-between" 
              pr={{ base: 16, sm: 20 }}
              gap={3}
              pt={{ base: 2, sm: 0 }}
            >
              {/* Logo + Text */}
              <HStack 
                spacing={{ base: 2, sm: 3 }} 
                align="center"
                flex="1"
                minW={0}
              >
                <Box 
                  p={{ base: 2, sm: 3 }} 
                  borderRadius="2xl" 
                  bg={themeGradients.logo} 
                  boxShadow="lg"
                  flexShrink={0}
                >
                  <Text 
                    fontWeight="extrabold" 
                    color="white"
                    fontSize={{ base: 'lg', sm: 'xl' }}
                  >
                    £
                  </Text>
                </Box>
                <VStack 
                  align="start" 
                  spacing={0}
                  flex="1"
                  minW={0}
                >
                  <Text
                    bg={themeGradients.title} 
                    bgClip="text"
                    fontWeight="800" 
                    fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                    lineHeight="shorter"
                    noOfLines={1}
                  >
                    Personal Budget
                  </Text>
                  <Text
                    bg={themeGradients.subtitle} 
                    bgClip="text"
                    fontWeight="600" 
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    noOfLines={1}
                  >
                    {isLogin ? '✨ Welcome Back!' : '🚀 Join Us Today!'}
                  </Text>
                </VStack>
              </HStack>

              {onBackToLanding && (
                <Button
                  onClick={onBackToLanding}
                  size={{ base: 'xs', sm: 'sm' }} 
                  borderRadius="full" 
                  px={{ base: 2, sm: 3 }} 
                  py={{ base: 1, sm: 2 }}
                  flexShrink={0}
                >
                  <HStack spacing={1}>
                    <ArrowBackIcon boxSize={{ base: 3, sm: 4 }} />
                    <Icon as={Home} boxSize={{ base: 3, sm: 4 }} />
                  </HStack>
                </Button>
              )}
            </Flex>
          </Box>

              {/* Modal content - Scrollable */}
              <Box 
                flex="1" 
                p={responsiveStyles.spacing.container}
                overflowY="auto"
                {...responsiveStyles.content}
                sx={{
                  ...safeAreaStyles.content,
                  ...safariStyles.scrollable
                }}
              >
            <Box
              bg={cardBg} 
              shadow="2xl" 
              borderRadius={{ base: '2xl', sm: '3xl' }}
              border="1px" 
              borderColor={borderColor}
              maxW={{ base: '100%', sm: 'lg' }} 
              mx="auto" 
              p={{ base: 4, sm: 8 }}
              pos="relative" 
              _before={{
                content: '""',
                pos: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                h: '4px',
                bg: 'linear-gradient(90deg,#0ea5e9,#3b82f6,#8b5cf6,#ec4899)',
                borderTopRadius: { base: '2xl', sm: '3xl' }
              }}
            >
              {isLogin
                ? <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
                : <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
              }
            </Box>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </ModalContent>
    </Modal>
  )
}
