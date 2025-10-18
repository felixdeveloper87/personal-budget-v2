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
import { GRADIENTS } from '../theme'
import { InstallmentPlan } from '../types'
import { listInstallmentPlans } from '../api'
import { InstallmentPlansModal } from '../components/installments'
import { getResponsiveStyles, sectionTitleStyles, sectionHeaderStyles } from '../components/ui'

/**
 * 💳 InstallmentPlansSection
 * Displays a compact header card showing active installment plans
 * and opens a modal to view or manage all plans.
 */
export default function InstallmentPlansSection() {
  // === Hooks must always appear in the same order ===
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Local state
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)

  // === Color mode values (declared at top to avoid hook order issues) ===
  const cardBg = useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark)
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600')
  const iconContainerBg = useColorModeValue('#fecaca', '#2d1b1b')
  const iconColor = useColorModeValue('red.600', 'red.300')
  const titleColor = useColorModeValue('gray.800', 'gray.100')
  const subtitleColor = useColorModeValue('gray.600', 'gray.300')
  const badgeBg = useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark)
  const badgeColor = useColorModeValue('red.600', 'red.300')
  const badgeBorderColor = useColorModeValue('red.200', 'red.500')
  const hoverBorderColor = useColorModeValue('red.200', 'red.500')
  const hoverBorderColor2 = useColorModeValue('red.300', 'red.400')
  const topBorderColor = useColorModeValue('red.200', 'red.500')
  const badgeHoverBg = useColorModeValue('red.50', 'red.900')

  // === Data fetching ===
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

  // === Render ===
  return (
    <>
      <Box
        w="full"
        px={{ base: 2, sm: 3, md: 4, lg: 6 }}
        sx={{
          paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
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
          <Card
            position="relative"
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={cardBorderColor}
            borderRadius={responsiveStyles.installmentPlansSection.card.borderRadius}
            shadow="sm"
            overflow="hidden"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              borderColor: hoverBorderColor,
            }}
            transition="all 0.2s ease"
          >
            {/* Decorative top border */}
            <Box height="2px" bg={topBorderColor} />

            <CardBody p={{ base: 3, sm: 4, md: 5, lg: 6 }}>
              <Flex
                direction={sectionHeaderStyles.container.direction}
                align={sectionHeaderStyles.container.align}
                justify={sectionHeaderStyles.container.justify}
                gap={sectionHeaderStyles.container.gap}
                w={sectionHeaderStyles.container.w}
              >
                {/* Left side - Icon + Title */}
                <HStack 
                  direction={sectionHeaderStyles.iconAndTitle.direction}
                  align={sectionHeaderStyles.iconAndTitle.align}
                  spacing={sectionHeaderStyles.iconAndTitle.spacing}
                  flex={sectionHeaderStyles.iconAndTitle.flex}
                  justify={sectionHeaderStyles.iconAndTitle.justify}
                >
                  <Box
                    p={sectionHeaderStyles.icon.padding}
                    borderRadius={sectionHeaderStyles.icon.borderRadius}
                    bg={iconContainerBg}
                    border="1px solid"
                    borderColor={hoverBorderColor}
                    boxShadow={sectionHeaderStyles.icon.boxShadow}
                    _hover={{
                      transform: sectionHeaderStyles.icon.hover.transform,
                      boxShadow: sectionHeaderStyles.icon.hover.boxShadow,
                      borderColor: hoverBorderColor2,
                    }}
                    transition={sectionHeaderStyles.icon.transition}
                  >
                    <Icon
                      as={CreditCard}
                      boxSize={sectionHeaderStyles.icon.size}
                      color={iconColor}
                    />
                  </Box>

                  <VStack 
                    align={sectionHeaderStyles.titleContainer.align}
                    spacing={sectionHeaderStyles.titleContainer.spacing}
                    flex={sectionHeaderStyles.titleContainer.flex}
                  >
                    <Heading
                      size={sectionTitleStyles.size}
                      color={titleColor}
                      fontWeight={sectionTitleStyles.fontWeight}
                      textAlign={{ base: 'center', sm: 'left' }}
                      fontFamily={sectionTitleStyles.fontFamily}
                      letterSpacing={sectionTitleStyles.letterSpacing}
                      lineHeight={sectionTitleStyles.lineHeight}
                    >
                      Active Installments
                    </Heading>
                    <Text
                      fontSize={
                        responsiveStyles.installmentPlansSection.header.title.fontSize
                      }
                      color={subtitleColor}
                      fontWeight="500"
                      textAlign={{ base: 'center', sm: 'left' }}
                      display={{ base: 'none', sm: 'block' }}
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      Track your ongoing payment plans
                    </Text>
                  </VStack>
                </HStack>

                {/* Right side - Interactive Badge */}
                <Badge
                  borderRadius="xl"
                  px={4}
                  py={2}
                  fontSize="sm"
                  fontWeight="500"
                  bg={badgeBg}
                  color={badgeColor}
                  border="1px solid"
                  borderColor={badgeBorderColor}
                  boxShadow="sm"
                  cursor="pointer"
                  onClick={onOpen}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  backdropFilter="blur(10px)"
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: hoverBorderColor2,
                    bg: badgeHoverBg,
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s ease"
                  flex="0 0 auto"
                  w="auto"
                  h="auto"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <HStack spacing={2}>
                    <Icon as={Sparkles} boxSize={3} color={badgeColor} />
                    <Text
                      fontSize="sm"
                      lineHeight="1"
                      fontWeight="500"
                      color={badgeColor}
                    >
                      {plans.length}
                    </Text>
                  </HStack>
                </Badge>
              </Flex>
            </CardBody>
          </Card>
        )}
      </Box>

      {/* Modal always mounted to preserve hook order */}
      <InstallmentPlansModal
        isOpen={isOpen}
        onClose={onClose}
        plans={plans}
        onPlanDeleted={handlePlanDeleted}
      />
    </>
  )
}
