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
import { CalendarClock, ChevronRight } from '../components/ui/icons'
import { listRecurringTransactions } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { RecurringTransaction } from '../types'
import { SectionCard, SectionHeader } from '../components/ui'
import { useEd } from '../editorial'
import { ToastService } from '../services/toast'
import type { AppPage } from '../components/layout/header/navigation.config'

interface RecurringTransactionsSectionProps {
  onPageChange?: (page: AppPage) => void
}

export default function RecurringTransactionsSection({
  onPageChange,
}: RecurringTransactionsSectionProps) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    if (!user?.token) return
    try {
      setLoading(true)
      const data = await listRecurringTransactions()
      setItems(data)
    } catch (err) {
      console.error('Error fetching recurring transactions:', err)
      ToastService.apiError(err, {
        title: 'Could not load fixed payments',
        dedupeKey: 'recurring-load-failed',
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
    void fetchItems()
  }, [authLoading, user?.token, fetchItems])

  const { activeCount, cancelledCount } = useMemo(() => {
    let active = 0
    let cancelled = 0
    for (const item of items) {
      if (item.active) active++
      else cancelled++
    }
    return { activeCount: active, cancelledCount: cancelled }
  }, [items])

  const { monthlyExpense, monthlyIncome } = useMemo(() => {
    let expense = 0
    let income = 0
    for (const item of items) {
      if (!item.active) continue
      if (item.type === 'EXPENSE') expense += item.amount
      else income += item.amount
    }
    return { monthlyExpense: expense, monthlyIncome: income }
  }, [items])

  const currencyFmt = useMemo(() => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }), [])

  const ed = useEd()
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
  const mutedColorBase = useColorModeValue('gray.500', 'gray.400')
  const mutedColor = ed ? ed.muted : mutedColorBase
  const statsBgBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  const statsBg = ed ? ed.panelRaised : statsBgBase
  const statsBorderBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const statsBorder = ed ? ed.line : statsBorderBase
  const statsAmountColorBase = useColorModeValue('red.600', 'red.300')
  const statsAmountColor = ed ? ed.red : statsAmountColorBase
  const statsLabelColorBase = useColorModeValue('gray.500', 'gray.400')
  const statsLabelColor = ed ? ed.muted : statsLabelColorBase
  const statsIncomeColorBase = useColorModeValue('green.600', 'green.300')
  const statsIncomeColor = ed ? ed.jade : statsIncomeColorBase

  const caption =
    activeCount === 0
      ? cancelledCount === 0
        ? 'No fixed expenses yet.'
        : 'No active rules right now.'
      : `${activeCount} active${cancelledCount > 0 ? ` · ${cancelledCount} cancelled` : ''}`

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
              icon={CalendarClock}
              title="Fixed payments"
              caption={caption}
              accent="neutral"
              rightSlot={
                <HStack spacing={2}>
                  <Button
                    onClick={() => onPageChange?.('fixed-payments')}
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
                      <Text>{items.length === 0 ? 'View' : 'Manage'}</Text>
                      <Icon as={ChevronRight} boxSize={3} color={mutedColor} />
                    </HStack>
                  </Button>
                </HStack>
              }
            />

            {activeCount > 0 && (monthlyExpense > 0 || monthlyIncome > 0) && (
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
                  textStyle={ed ? 'display' : undefined}
                  fontSize={ed ? 'xl' : 'lg'}
                  fontWeight={ed ? 400 : 700}
                  color={monthlyExpense > 0 ? statsAmountColor : statsIncomeColor}
                >
                  {currencyFmt.format(monthlyExpense > 0 ? monthlyExpense : monthlyIncome)}
                  <Text as="span" textStyle={ed ? 'mono' : undefined} fontSize="xs" fontWeight={500} color={statsLabelColor}>
                    /mo
                  </Text>
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
