import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Icon,
  Skeleton,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronRight, CreditCard } from '../components/ui/icons'
import { InstallmentPlan } from '../types'
import { listInstallmentPlans } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { isInstallmentPlanCompleted } from '../components/installments/InstallmentPlanCard'
import { SectionCard, SectionHeader } from '../components/ui'
import { useEd } from '../editorial'
import { ToastService } from '../services/toast'
import type { AppPage } from '../components/layout/header/navigation.config'

interface InstallmentPlansSectionProps {
  onPageChange?: (page: AppPage) => void
}

/**
 * 💳 InstallmentPlansSection
 * Compact dashboard card showing the count of active vs past plans and a
 * shortcut to the full plans modal.
 */
export default function InstallmentPlansSection({ onPageChange }: InstallmentPlansSectionProps) {
  const { user, loading: authLoading } = useAuth()

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

  const { activeCount, pastCount } = useMemo(() => {
    let active = 0
    let past = 0
    for (const plan of plans) {
      if (isInstallmentPlanCompleted(plan)) past++
      else active++
    }
    return { activeCount: active, pastCount: past }
  }, [plans])

  const totalMonthly = useMemo(() => {
    let monthly = 0
    for (const plan of plans) {
      if (!isInstallmentPlanCompleted(plan)) {
        monthly += plan.installmentValue
      }
    }
    return monthly
  }, [plans])

  const currencyFmt = useMemo(() => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }), [])

  const ed = useEd()
  const captionMutedColorBase = useColorModeValue('gray.500', 'gray.400')
  const captionMutedColor = ed ? ed.muted : captionMutedColorBase
  const ctaBgBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  const ctaBg = ed ? ed.panelRaised : ctaBgBase
  const ctaBorderBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const ctaBorder = ed ? ed.line : ctaBorderBase
  const ctaColorBase = useColorModeValue('gray.700', 'gray.200')
  const ctaColor = ed ? ed.cream : ctaColorBase
  const ctaHoverBgBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const ctaHoverBg = ed ? ed.controlHoverBg : ctaHoverBgBase
  const ctaHoverBorderBase = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const ctaHoverBorder = ed ? ed.lineStrong : ctaHoverBorderBase
  const statsBgBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  const statsBg = ed ? ed.panelRaised : statsBgBase
  const statsBorderBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const statsBorder = ed ? ed.line : statsBorderBase
  const statsAmountColorBase = useColorModeValue('red.600', 'red.300')
  const statsAmountColor = ed ? ed.red : statsAmountColorBase
  const statsLabelColorBase = useColorModeValue('gray.500', 'gray.400')
  const statsLabelColor = ed ? ed.muted : statsLabelColorBase

  const caption =
    activeCount === 0
      ? pastCount === 0
        ? 'No plans yet — split a purchase into installments.'
        : 'No active plans · open history to review past ones.'
      : `${activeCount} active${pastCount > 0 ? ` · ${pastCount} past` : ''
      }`

  return (
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
              accent="neutral"
              rightSlot={
                <HStack spacing={2}>
                  <Button
                    onClick={() => onPageChange?.('installments')}
                    variant="unstyled"
                    h="30px"
                    px={2.5}
                    borderRadius="lg"
                    bg={ctaBg}
                    border="1px solid"
                    borderColor={ctaBorder}
                    color={ctaColor}
                    fontWeight={600}
                    fontSize="xs"
                    flexShrink={0}
                    transition="background-color 0.15s ease, border-color 0.15s ease"
                    _hover={{ bg: ctaHoverBg, borderColor: ctaHoverBorder }}
                    _active={{ transform: 'scale(0.97)' }}
                  >
                    <HStack spacing={1}>
                      <Text>{plans.length === 0 ? 'View' : 'Manage'}</Text>
                      <Icon as={ChevronRight} boxSize={3} color={captionMutedColor} />
                    </HStack>
                  </Button>
                </HStack>
              }
            />

            {activeCount > 0 && totalMonthly > 0 && (
              <HStack
                spacing={3}
                bg={statsBg}
                border="1px solid"
                borderColor={statsBorder}
                borderRadius="xl"
                px={3.5}
                py={2.5}
                justify="space-between"
              >
                <Text
                  fontFamily={ed ? ed.fontDisplay : undefined}
                  fontSize={ed ? 'xl' : 'lg'}
                  fontWeight={ed ? 400 : 700}
                  color={statsAmountColor}
                >
                  {currencyFmt.format(totalMonthly)}
                  <Text as="span" fontFamily={ed ? ed.fontMono : undefined} fontSize="xs" fontWeight={500} color={statsLabelColor}>/mo</Text>
                </Text>
                <Text fontSize="sm" fontWeight={600} color={statsLabelColor}>
                  {activeCount} active
                </Text>
              </HStack>
            )}
          </VStack>
        )}
      </Box>
    </SectionCard>
  )
}
