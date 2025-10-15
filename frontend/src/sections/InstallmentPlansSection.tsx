import React, { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  Icon,
  Spinner,
  Center,
  Card,
  CardBody,
  Flex,
  Badge,
  HStack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { CreditCard, Sparkles } from 'lucide-react'
import { useThemeColors } from '../hooks/useThemeColors'
import { InstallmentPlan } from '../types'
import { listInstallmentPlans } from '../api'
import { InstallmentPlansModal } from '../components/installments'
import { getResponsiveStyles, getGradients, animations, shimmerGradients, shimmerAnimations, shimmerStylesStatic } from '../utils/ui'

/**
 * 💳 InstallmentPlansSection
 * Displays a compact header with button to open installment plans modal.
 */
export default function InstallmentPlansSection() {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const gradients = getGradients()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Move useColorModeValue to top (always safe)
  const cardBg = useColorModeValue('linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 50%, rgba(226, 232, 240, 0.9) 100%)', 'rgba(17, 17, 17, 0.9)')
  const cardBorderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)')
  const iconBg = useColorModeValue(
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #a78bfa, #8b5cf6)'
  )
  const titleBg = useColorModeValue(
    'linear-gradient(135deg, #1e293b, #475569)',
    'linear-gradient(135deg, #f8fafc, #e2e8f0)'
  )
  const badgeBg = useColorModeValue(
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #a78bfa, #8b5cf6)'
  )
  
  // Shimmer styles
  const shimmerBackground = useColorModeValue(shimmerGradients.light, shimmerGradients.dark)
  const shimmerAnimation = useColorModeValue(shimmerAnimations.light, shimmerAnimations.dark)
  const badgeHoverBg = useColorModeValue(
    'linear-gradient(135deg, #7c3aed, #6d28d9)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)'
  )

  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const data = await listInstallmentPlans()
      setPlans(data)
    } catch (err) {
      console.error('Error fetching installment plans:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handlePlanDeleted = () => {
    fetchPlans()
  }

  return (
    <>
      <Box
        w="full"
        px={responsiveStyles.installmentPlansSection.container.padding}
        sx={{
          paddingLeft: responsiveStyles.installmentPlansSection.container.safeArea.paddingLeft,
          paddingRight: responsiveStyles.installmentPlansSection.container.safeArea.paddingRight,
        }}
      >
        {loading ? (
          // 🌀 Loading State
          <Center py={{ base: 6, md: 8 }}>
            <VStack spacing={4}>
              <Spinner size="lg" color={colors.accent} />
              <Text color={colors.text.secondary} fontSize={{ base: 'xs', sm: 'sm' }}>
                Loading installment plans...
              </Text>
            </VStack>
          </Center>
        ) : (
          // 💳 Main Card
          <Box position="relative">
            {/* Decorative gradient background */}
            <Box
              position="absolute"
              top={responsiveStyles.installmentPlansSection.background.top}
              left={responsiveStyles.installmentPlansSection.background.left}
              right={responsiveStyles.installmentPlansSection.background.right}
              height={responsiveStyles.installmentPlansSection.background.height}
              background={gradients.decorative}
              borderRadius={responsiveStyles.installmentPlansSection.background.borderRadius}
              filter={responsiveStyles.installmentPlansSection.background.filter}
              opacity={responsiveStyles.installmentPlansSection.background.opacity}
              zIndex={0}
            />

            <Card
              position="relative"
              bg={cardBg}
              backdropFilter="blur(20px)"
              border="1px solid"
              borderColor={cardBorderColor}
              borderRadius={responsiveStyles.installmentPlansSection.card.borderRadius}
              shadow="2xl"
              overflow="hidden"
              sx={{
                animation: animations.slideIn,
                '@keyframes slideIn': {
                  from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
                  to: { opacity: 1, transform: 'translateY(0) scale(1)' },
                },
              }}
            >
              {/* Animated top border */}
              <Box
                height="4px"
                background={shimmerBackground}
                sx={{
                  ...shimmerStylesStatic,
                  animation: shimmerAnimation
                }}
              />

              <CardBody p={responsiveStyles.installmentPlansSection.card.padding}>
                <Flex
                  direction={responsiveStyles.installmentPlansSection.header.direction}
                  align={{ base: 'stretch', sm: 'center' }}
                  justify="space-between"
                  gap={responsiveStyles.installmentPlansSection.header.gap}
                >
                  {/* Left side */}
                  <HStack spacing={{ base: 2, sm: 3, md: 4 }} align="center" flex="1">
                    {/* Icon Container with Advanced Effects */}
                    <Box
                      position="relative"
                      p={responsiveStyles.installmentPlansSection.header.icon.padding}
                      borderRadius={responsiveStyles.installmentPlansSection.header.icon.borderRadius}
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)',
                        'linear-gradient(135deg, #a78bfa, #8b5cf6, #7c3aed)'
                      )}
                      boxShadow="xl"
                      opacity={0.9}
                      sx={{
                        animation: 'installmentGlow 3s ease-in-out infinite, iconFloat 4s ease-in-out infinite',
                        '@keyframes installmentGlow': {
                          '0%,100%': { 
                            boxShadow: '0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1), 0 0 60px rgba(139,92,246,0.05)',
                            transform: 'scale(1)'
                          },
                          '50%': {
                            boxShadow: '0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2), 0 0 90px rgba(139,92,246,0.1)',
                            transform: 'scale(1.05)'
                          },
                        },
                        '@keyframes iconFloat': {
                          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
                          '25%': { transform: 'translateY(-2px) rotate(1deg)' },
                          '50%': { transform: 'translateY(-4px) rotate(0deg)' },
                          '75%': { transform: 'translateY(-1px) rotate(-1deg)' }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '-2px',
                          left: '-2px',
                          right: '-2px',
                          bottom: '-2px',
                          background: 'linear-gradient(45deg, rgba(139,92,246,0.3), rgba(167,139,250,0.3), rgba(139,92,246,0.3))',
                          borderRadius: 'inherit',
                          zIndex: -1,
                          filter: 'blur(8px)',
                          opacity: 0.6,
                          animation: 'shimmer 3s ease-in-out infinite'
                        }
                      }}
                    >
                      <Icon
                        as={CreditCard}
                        boxSize={responsiveStyles.installmentPlansSection.header.icon.size}
                        color="white"
                        sx={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                          animation: 'cardPulse 2s ease-in-out infinite',
                          '@keyframes cardPulse': {
                            '0%,100%': { transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' },
                            '25%': { transform: 'scale(1.1) rotate(2deg)', filter: 'brightness(1.2)' },
                            '50%': { transform: 'scale(1.05) rotate(0deg)', filter: 'brightness(1.1)' },
                            '75%': { transform: 'scale(1.1) rotate(-2deg)', filter: 'brightness(1.2)' }
                          }
                        }}
                      />
                    </Box>

                    <VStack align={{ base: 'center', sm: 'start' }} spacing={1} flex="1">
                      <Heading
                        size={responsiveStyles.installmentPlansSection.header.title.size}
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #1e293b, #475569, #64748b, #334155)',
                          'linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1, #94a3b8)'
                        )}
                        bgClip="text"
                        fontWeight="900"
                        textAlign={{ base: 'center', sm: 'left' }}
                        sx={{
                          animation: 'titleShimmer 4s ease-in-out infinite',
                          '@keyframes titleShimmer': {
                            '0%,100%': { backgroundPosition: '0% 50%' },
                            '50%': { backgroundPosition: '100% 50%' }
                          },
                          backgroundSize: '200% 200%',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                      >
                        Active Installment Plans
                      </Heading>
                      <Text
                        fontSize={responsiveStyles.installmentPlansSection.header.title.fontSize}
                        color={colors.text.secondary}
                        fontWeight="500"
                        opacity={0.9}
                        textAlign={{ base: 'center', sm: 'left' }}
                        display={{ base: 'none', sm: 'block' }}
                        sx={{
                          animation: 'fadeInUp 0.8s ease-out 0.2s both',
                          '@keyframes fadeInUp': {
                            '0%': { opacity: 0, transform: 'translateY(10px)' },
                            '100%': { opacity: 0.9, transform: 'translateY(0)' }
                          }
                        }}
                      >
                        Track your ongoing payment plans
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Right side - Premium Badge */}
                  <Badge
                    colorScheme="purple"
                    variant="solid"
                    borderRadius="full"
                    px={4}
                    py={2}
                    fontSize="sm"
                    fontWeight="700"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)',
                      'linear-gradient(135deg, #a78bfa, #8b5cf6, #7c3aed)'
                    )}
                    boxShadow="xl"
                    cursor="pointer"
                    onClick={onOpen}
                    position="relative"
                    overflow="hidden"
                    opacity={0.9}
                    sx={{
                      animation: 'badgeGlow 3s ease-in-out infinite',
                      '@keyframes badgeGlow': {
                        '0%,100%': { 
                          boxShadow: '0 0 15px rgba(139,92,246,0.4), 0 0 30px rgba(139,92,246,0.2)',
                          transform: 'scale(1)'
                        },
                        '50%': {
                          boxShadow: '0 0 25px rgba(139,92,246,0.6), 0 0 50px rgba(139,92,246,0.3)',
                          transform: 'scale(1.02)'
                        },
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 3s ease-in-out infinite'
                      }
                    }}
                    _hover={{
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: '0 20px 40px rgba(139,92,246,0.4)',
                    }}
                    _active={{
                      transform: 'translateY(0) scale(1.02)',
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    flex="0 0 auto"
                    minW="auto"
                    w="auto"
                    h="auto"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <HStack spacing={2}>
                      <Icon
                        as={Sparkles}
                        boxSize={3}
                        sx={{
                          animation: 'sparkle 2s ease-in-out infinite',
                          '@keyframes sparkle': {
                            '0%,100%': { transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' },
                            '25%': { transform: 'scale(1.2) rotate(10deg)', filter: 'brightness(1.3)' },
                            '50%': { transform: 'scale(1.1) rotate(0deg)', filter: 'brightness(1.2)' },
                            '75%': { transform: 'scale(1.2) rotate(-10deg)', filter: 'brightness(1.3)' }
                          }
                        }}
                      />
                      <Text 
                        fontSize="sm" 
                        lineHeight="1" 
                        fontWeight="700"
                        sx={{
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                        }}
                      >
                        {plans.length}
                      </Text>
                    </HStack>
                  </Badge>
                </Flex>
              </CardBody>
            </Card>
          </Box>
        )}
      </Box>

      {/* Modal sempre renderizado */}
      <InstallmentPlansModal
        isOpen={isOpen}
        onClose={onClose}
        plans={plans}
        onPlanDeleted={handlePlanDeleted}
      />
    </>
  )
}
