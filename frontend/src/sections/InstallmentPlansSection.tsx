import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  Skeleton,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { ChevronRight, CreditCard } from '../components/ui/icons'
import { InstallmentPlan } from '../types'
import { listInstallmentPlans } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { InstallmentPlansModal } from '../components/installments'
import { isInstallmentPlanCompleted } from '../components/installments/InstallmentPlanCard'
import { SectionCard, SectionHeader } from '../components/ui'
import { ToastService } from '../services/toast'

/**
 * 💳 InstallmentPlansSection
 * Compact dashboard card showing the count of active vs past plans and a
 * shortcut to the full plans modal.
 */
export default function InstallmentPlansSection() {
  const { user, loading: authLoading } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlans = useCallback(async () => {
    if (!user?.token) return
    try {
      setLoading(true)
      const data = await listInstallmentPlans()
      setPlans(data)
    } catch (err) {
      console.error('Error fetching installment plans:', err)
      ToastService.apiError(err, {
        title: 'Could not load installment plans',
        dedupeKey: 'installment-plans-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [user?.token])

  useEffect(() => {
    if (authLoading || !user?.token) {
      setLoading(false)
      return
    }
    void fetchPlans()
  }, [authLoading, user?.token, fetchPlans])

  const handlePlanDeleted = () => {
    fetchPlans()
  }

  const { activeCount, pastCount } = useMemo(() => {
    let active = 0
    let past = 0
    for (const plan of plans) {
      if (isInstallmentPlanCompleted(plan)) past++
      else active++
    }
    return { activeCount: active, pastCount: past }
  }, [plans])

  const captionMutedColor = useColorModeValue('gray.500', 'gray.400')
  const ctaBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const ctaBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const ctaColor = useColorModeValue('gray.700', 'gray.200')
  const ctaHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const ctaHoverBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const emptyBadgeBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const emptyBadgeColor = useColorModeValue('gray.600', 'gray.300')

  const caption =
    activeCount === 0
      ? pastCount === 0
        ? 'No plans yet — split a purchase into installments.'
        : 'No active plans · open history to review past ones.'
      : `${activeCount} active${
          pastCount > 0 ? ` · ${pastCount} past` : ''
        }`

  return (
    <>
      <SectionCard h="full">
        <Box p={{ base: 4, sm: 5 }}>
          {loading ? (
            <VStack align="stretch" spacing={3}>
              <Skeleton height="20px" width="48%" borderRadius="md" />
              <Skeleton height="14px" width="70%" borderRadius="md" />
              <Skeleton height="40px" width="100%" borderRadius="lg" />
            </VStack>
          ) : (
            <VStack align="stretch" spacing={4}>
              <SectionHeader
                icon={CreditCard}
                title="Installments"
                caption={caption}
                accent="blue"
                rightSlot={
                  activeCount > 0 ? (
                    <Badge
                      variant="subtle"
                      colorScheme="teal"
                      borderRadius="full"
                      px={2.5}
                      py={1}
                      fontSize="xs"
                      fontWeight={700}
                    >
                      {activeCount}
                    </Badge>
                  ) : pastCount > 0 ? (
                    <Box
                      px={2.5}
                      py={1}
                      borderRadius="full"
                      bg={emptyBadgeBg}
                      color={emptyBadgeColor}
                      fontSize="xs"
                      fontWeight={700}
                    >
                      {pastCount} done
                    </Box>
                  ) : null
                }
              />

              <Button
                onClick={onOpen}
                variant="unstyled"
                w="full"
                h="44px"
                px={4}
                borderRadius="xl"
                bg={ctaBg}
                border="1px solid"
                borderColor={ctaBorder}
                color={ctaColor}
                fontWeight={600}
                fontSize="sm"
                transition="background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease"
                _hover={{
                  bg: ctaHoverBg,
                  borderColor: ctaHoverBorder,
                  transform: 'translateX(1px)',
                }}
                _active={{ transform: 'scale(0.99)' }}
                _focusVisible={{
                  outline: '2px solid',
                  outlineColor: 'teal.300',
                  outlineOffset: '2px',
                }}
              >
                <HStack justify="space-between" align="center" w="full" px={1}>
                  <Text noOfLines={1} color={ctaColor}>
                    {plans.length === 0
                      ? 'View installment plans'
                      : 'Manage plans'}
                  </Text>
                  <Icon
                    as={ChevronRight}
                    boxSize={4}
                    color={captionMutedColor}
                  />
                </HStack>
              </Button>
            </VStack>
          )}
        </Box>
      </SectionCard>

      <InstallmentPlansModal
        isOpen={isOpen}
        onClose={onClose}
        plans={plans}
        onPlanDeleted={handlePlanDeleted}
      />
    </>
  )
}
