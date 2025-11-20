import React, { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Center,
  HStack,
  useColorModeValue,
  useDisclosure,
  Button,
  Image,
  Icon
} from '@chakra-ui/react'
import { CreditCard, ChevronRight } from 'lucide-react'
import installmentsImage from '../../assets/installments.png'
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
        h="full"
        px={{ base: 1, sm: 2, md: 3, lg: 4 }}
        sx={{
          paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Box
          bg={useColorModeValue('rgba(255, 255, 255, 0.6)', 'rgba(0, 0, 0, 0.4)')}
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={useColorModeValue('whiteAlpha.400', 'whiteAlpha.100')}
          borderRadius="2xl"
          boxShadow={useColorModeValue(
            '0 8px 32px rgba(31, 38, 135, 0.07)',
            '0 8px 32px rgba(0, 0, 0, 0.3)'
          )}
          overflow="hidden"
          position="relative"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            boxShadow: useColorModeValue(
              '0 12px 40px rgba(31, 38, 135, 0.12)',
              '0 12px 40px rgba(0, 0, 0, 0.5)'
            ),
            transform: 'translateY(-2px)'
          }}
        >
          {/* Decorative gradient blob */}
          <Box
            position="absolute"
            top="-50%"
            left="-10%"
            width="300px"
            height="300px"
            bg="radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)"
            filter="blur(40px)"
            zIndex={0}
            pointerEvents="none"
          />

          <Box p={{ base: 5, sm: 6 }} position="relative" zIndex={1} w="full">
            {loading ? (
              <Center py={2}>
                <HStack spacing={3}>
                  <Spinner size="sm" color="pink.500" thickness="3px" />
                  <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm" fontWeight="500">
                    Loading plans...
                  </Text>
                </HStack>
              </Center>
            ) : (
              <HStack justify="space-between" align="center" w="full" spacing={4}>
                {/* Left side - Title & Count */}
                <HStack spacing={4}>
                  <Box
                    p={2}
                    bg="transparent"
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      src={installmentsImage}
                      alt="Installments"
                      boxSize={{ base: 8, sm: 10, md: 12 }}
                      objectFit="contain"
                    />
                  </Box>
                  <VStack align="start" spacing={0.5}>
                    <Heading
                      size="md"
                      fontWeight="700"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      letterSpacing="-0.02em"
                      fontSize={{ base: 'lg', sm: 'xl' }}
                      bgGradient={useColorModeValue(
                        'linear(to-r, gray.800, gray.600)',
                        'linear(to-r, white, gray.300)'
                      )}
                      bgClip="text"
                    >
                      Installments
                    </Heading>
                    <Text
                      fontSize={{ base: 'xs', sm: 'xl' }}
                      color={useColorModeValue('gray.500', 'gray.400')}
                      fontWeight="600"
                    >
                      {plans.length} Active Plan{plans.length !== 1 ? 's' : ''}
                    </Text>
                  </VStack>
                </HStack>

                {/* Right side - View Button */}
                <Button
                  onClick={onOpen}
                  variant="ghost"
                  size="lg"
                  height="50px"
                  px={6}
                  borderRadius="xl"
                  bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.100')}
                  color={useColorModeValue('pink.600', 'pink.300')}
                  fontSize={{ base: 'md', sm: 'xl' }}
                  border="1px solid"
                  borderColor={useColorModeValue('pink.100', 'whiteAlpha.200')}
                  _hover={{
                    bg: useColorModeValue('pink.50', 'whiteAlpha.200'),
                    transform: 'translateX(2px)',
                    borderColor: useColorModeValue('pink.200', 'whiteAlpha.300'),
                  }}
                  rightIcon={<Icon as={ChevronRight} boxSize={5} />}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="600"
                >
                  View All
                </Button>
              </HStack>
            )}
          </Box>
        </Box>
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
