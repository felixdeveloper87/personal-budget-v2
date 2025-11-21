import { useState } from 'react'
import {
  Box, Button, HStack, VStack, Text,
  useColorModeValue, Icon
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { Home, X } from 'lucide-react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { getShimmerStyles, getModalHeaderStyles, safeAreaStyles, safariStyles, getResponsiveStyles, getGradients, PremiumModal } from '../ui'

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
    title: useColorModeValue('black', 'linear-gradient(135deg,#f1f5f9,#e2e8f0)'),
    subtitle: useColorModeValue('linear-gradient(135deg,#3b82f6,#8b5cf6)', 'linear-gradient(135deg,#60a5fa,#a78bfa)'),
    logo: useColorModeValue('linear-gradient(135deg,#3b82f6,#1d4ed8)', 'linear-gradient(135deg,#60a5fa,#3b82f6)')
  }

  const ModalHeader = (
    <>
      {/* Animated top bar */}
      <Box
        height="2px"
        sx={getShimmerStyles()}
      />
      <Box
        {...headerStyles.container}
        sx={{
          ...headerStyles.container.sx,
          paddingTop: 'max(56px, env(safe-area-inset-top, 56px))',
        }}
      >
        <HStack
          spacing={{ base: 2, sm: 3 }}
          align="center"
          justify="space-between"
          flexWrap="nowrap"
          pr={{ base: 2, sm: 4 }}
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
                color={themeGradients.title}
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
          </HStack>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            bg={useColorModeValue(headerStyles.closeButton.bg.light, headerStyles.closeButton.bg.dark)}
            border="1px solid"
            borderColor={useColorModeValue(headerStyles.closeButton.borderColor.light, headerStyles.closeButton.borderColor.dark)}
            borderRadius={headerStyles.closeButton.borderRadius}
            p={headerStyles.closeButton.p}
            _hover={headerStyles.closeButton._hover}
            transition={headerStyles.closeButton.transition}
            flexShrink={0}
          >
            <Icon as={X} boxSize={headerStyles.closeButton.iconSize} color={useColorModeValue(headerStyles.closeButton.iconColor.light, headerStyles.closeButton.iconColor.dark)} />
          </Button>
        </HStack>
      </Box>
    </>
  )

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl' }}
      header={ModalHeader}
      contentProps={{
        bg: useColorModeValue(
          'rgba(255, 255, 255, 0.95)',
          'rgba(17, 17, 17, 0.95)'
        ),
        backdropFilter: "blur(20px)",
        border: "1px solid",
        borderColor: useColorModeValue(
          'rgba(255, 255, 255, 0.2)',
          'rgba(255, 255, 255, 0.1)'
        )
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
        pointerEvents="none"
      />

      {/* Modal content - Scrollable */}
      <Box
        flex="1"
        p={responsiveStyles.spacing.container}
        overflowY="auto"
        {...responsiveStyles.content}
        sx={{
          ...safeAreaStyles.content,
          ...safariStyles.scrollable,
          position: 'relative',
          zIndex: 1
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
        >
          {isLogin
            ? <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
            : <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          }
        </Box>
      </Box>
    </PremiumModal>
  )
}
