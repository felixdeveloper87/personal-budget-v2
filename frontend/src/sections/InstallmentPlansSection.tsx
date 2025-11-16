import React, { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
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
import { useThemeColors } from '../hooks/useThemeColors'
import { InstallmentPlan } from '../types'
import { listInstallmentPlans } from '../api'
import { InstallmentPlansModal } from '../components/installments'

/**
 * 💳 InstallmentPlansSection
 * Displays a compact header card showing active installment plans
 * and opens a modal to view or manage all plans.
 */
export default function InstallmentPlansSection() {
  const colors = useThemeColors()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Local state
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)

  // Color mode values
  const cardBg = useColorModeValue('gray.100', 'black')

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
        px={{ base: 1, sm: 2, md: 3, lg: 4 }}
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
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.800')}
            borderRadius="2xl"
            shadow={useColorModeValue('0 1px 3px rgba(0,0,0,0.05)', '0 1px 3px rgba(0,0,0,0.2)')}
            overflow="hidden"
            position="relative"
            _hover={{
              shadow: useColorModeValue('0 4px 12px rgba(0,0,0,0.08)', '0 4px 12px rgba(0,0,0,0.3)')
            }}
            transition="all 0.2s ease"
          >
            <CardBody p={{ base: 4, sm: 5, md: 6, lg: 6 }} position="relative" zIndex={2}>
              <Flex justify="space-between" align="center" w="full">
                {/* Left side - Title */}
                <HStack spacing={2} align="baseline" flex="1">
                  <Heading
                    size="md"
                    fontWeight="600"
                    textAlign="left"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="-0.015em"
                    fontSize={{ base: 'md', sm: 'xl' }}
                    color={useColorModeValue('gray.800', 'white')}
                  >
                    Active Installments
                  </Heading>
                  <Text
                    fontSize={{ base: 'sm', sm: 'sm' }}
                    color={useColorModeValue('gray.600', 'gray.400')}
                    fontWeight="400"
                    textAlign="left"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    • {plans.length} plan{plans.length !== 1 ? 's' : ''}
                  </Text>
                </HStack>

                {/* Right side - Interactive Badge */}
                <Badge
                  borderRadius="lg"
                  px={3}
                  py={2}
                  fontSize="xs"
                  fontWeight="600"
                  bg="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  color="white"
                  border="none"
                  boxShadow="0 2px 8px rgba(239, 68, 68, 0.2)"
                  cursor="pointer"
                  onClick={onOpen}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  }}
                  _active={{
                    transform: 'translateY(0) scale(0.98)',
                  }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  flex="0 0 auto"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minW="60px"
                >
                  <Text
                    fontSize="xs"
                    lineHeight="1"
                    fontWeight="600"
                    color="white"
                  >
                    View
                  </Text>
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
