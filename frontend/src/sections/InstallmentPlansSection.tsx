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
import { InstallmentPlansModal } from '../components/ui'
import { getResponsiveStyles, getGradients, animations } from '../utils/ui'

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
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(17, 17, 17, 0.9)')
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
                background="linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ef4444)"
                backgroundSize="300% 100%"
                sx={{
                  animation: animations.shimmer,
                  '@keyframes shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                  },
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
                    <Box
                      p={responsiveStyles.installmentPlansSection.header.icon.padding}
                      borderRadius={responsiveStyles.installmentPlansSection.header.icon.borderRadius}
                      bg={iconBg}
                      boxShadow="lg"
                      sx={{
                        animation: animations.glow,
                        '@keyframes glow': {
                          '0%, 100%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.3)' },
                          '50%': {
                            boxShadow:
                              '0 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)',
                          },
                        },
                      }}
                    >
                      <Icon
                        as={CreditCard}
                        boxSize={responsiveStyles.installmentPlansSection.header.icon.size}
                        color="white"
                      />
                    </Box>

                    <VStack align="start" spacing={1} flex="1">
                      <Heading
                        size={responsiveStyles.installmentPlansSection.header.title.size}
                        bg={titleBg}
                        bgClip="text"
                        fontWeight="800"
                        textAlign="left"
                      >
                        Active Installment Plans
                      </Heading>
                      <Text
                        fontSize={responsiveStyles.installmentPlansSection.header.title.fontSize}
                        color={colors.text.secondary}
                        fontWeight="400"
                        opacity={0.8}
                        textAlign="left"
                        display={{ base: 'none', sm: 'block' }}
                      >
                        Track your ongoing payment plans
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Right side - Badge */}
                  <Badge
                    colorScheme="purple"
                    variant="solid"
                    borderRadius="full"
                    px={3}
                    py={1.5}
                    fontSize="xs"
                    fontWeight="600"
                    bg={badgeBg}
                    boxShadow="md"
                    cursor="pointer"
                    onClick={onOpen}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                      bg: badgeHoverBg,
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.2s ease"
                    flex="0 0 auto"
                    minW="auto"
                    w="auto"
                    h="auto"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <HStack spacing={0}>
                      <Icon
                        as={Sparkles}
                        boxSize={3}
                        display="none"
                      />
                      <Text fontSize="xs" lineHeight="1">
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
