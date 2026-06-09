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
} from '@chakra-ui/react'
import { CalendarClock, ChevronRight } from '../components/ui/icons'
import { listRecurringTransactions } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { RecurringTransaction } from '../types'
import { SectionCard, SectionHeader } from '../components/ui'
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

  const ctaBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const ctaBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const ctaColor = useColorModeValue('gray.700', 'gray.200')
  const ctaHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const ctaHoverBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const emptyBadgeBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const emptyBadgeColor = useColorModeValue('gray.600', 'gray.300')
  const statsBg = useColorModeValue('orange.50', 'rgba(249,115,22,0.10)')
  const statsBorder = useColorModeValue('orange.100', 'rgba(249,115,22,0.22)')
  const statsAmountColor = useColorModeValue('orange.700', 'orange.200')
  const statsLabelColor = useColorModeValue('orange.600', 'orange.300')
  const statsDivider = useColorModeValue('orange.100', 'rgba(249,115,22,0.2)')
  const statsIncomeColor = useColorModeValue('green.600', 'green.300')

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
                accent="amber"
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
                  ) : cancelledCount > 0 ? (
                    <Box
                      px={2.5}
                      py={1}
                      borderRadius="full"
                      bg={emptyBadgeBg}
                      color={emptyBadgeColor}
                      fontSize="xs"
                      fontWeight={700}
                    >
                      {cancelledCount} off
                    </Box>
                  ) : null
                }
              />

              {activeCount > 0 && (monthlyExpense > 0 || monthlyIncome > 0) && (
                <HStack
                  spacing={0}
                  bg={statsBg}
                  border="1px solid"
                  borderColor={statsBorder}
                  borderRadius="xl"
                  overflow="hidden"
                >
                  {monthlyExpense > 0 && (
                    <VStack spacing={0} align="flex-start" flex={1} px={3.5} py={2.5}>
                      <Text fontSize="xs" fontWeight={600} color={statsLabelColor} textTransform="uppercase" letterSpacing="0.05em">
                        Expenses
                      </Text>
                      <Text fontSize="lg" fontWeight={700} color={statsAmountColor} lineHeight="1.2">
                        {currencyFmt.format(monthlyExpense)}
                        <Text as="span" fontSize="xs" fontWeight={500} color={statsLabelColor}>/mo</Text>
                      </Text>
                    </VStack>
                  )}
                  {monthlyExpense > 0 && monthlyIncome > 0 && (
                    <Box w="1px" h="full" bg={statsDivider} alignSelf="stretch" />
                  )}
                  {monthlyIncome > 0 && (
                    <VStack spacing={0} align="flex-start" flex={1} px={3.5} py={2.5}>
                      <Text fontSize="xs" fontWeight={600} color={statsIncomeColor} textTransform="uppercase" letterSpacing="0.05em">
                        Income
                      </Text>
                      <Text fontSize="lg" fontWeight={700} color={statsIncomeColor} lineHeight="1.2">
                        {currencyFmt.format(monthlyIncome)}
                        <Text as="span" fontSize="xs" fontWeight={500}>/mo</Text>
                      </Text>
                    </VStack>
                  )}
                </HStack>
              )}

              <Button
                onClick={() => onPageChange?.('fixed-payments')}
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
                    {items.length === 0 ? 'View fixed payments' : 'Manage payments'}
                  </Text>
                  <Icon as={ChevronRight} boxSize={4} color={mutedColor} />
                </HStack>
              </Button>
            </VStack>
          )}
        </Box>
      </SectionCard>
  )
}
