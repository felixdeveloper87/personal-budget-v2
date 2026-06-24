import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { listRecurringTransactions } from '../api'
import type { RecurringTransaction } from '../types'
import type { AppPage } from '../components/layout/header/navigation.config'
import RecurringTransactionCard from '../components/recurring/RecurringTransactionCard'
import RecurringTransactionDrawer from '../components/recurring/RecurringTransactionDrawer'
import { PageHeader, SectionCard, SectionHeader } from '../components/ui'
import {
  CalendarClock,
  Plus,
  TrendingDown,
  TrendingUp,
} from '../components/ui/icons'
import { ToastService } from '../services/toast'
import { useEd } from '../editorial'

interface FixedPaymentsPageProps {
  onPageChange?: (page: AppPage) => void
  /** When hosted inside the Commitments page: drop the page chrome. */
  embedded?: boolean
  /** Notify the host so a shared summary can refresh after a reload/edit. */
  onDataChange?: () => void
}

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value)

export default function FixedPaymentsPage({
  onPageChange,
  embedded = false,
  onDataChange,
}: FixedPaymentsPageProps) {
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<RecurringTransaction | null>(null)

  const ed = useEd()
  const softBgBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  const softBg = ed ? ed.panelRaised : softBgBase

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await listRecurringTransactions())
      onDataChange?.()
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not load fixed payments',
        dedupeKey: 'fixed-payments-page-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [onDataChange])

  useEffect(() => {
    void load()
  }, [load])

  // Keep the open drawer pointed at the freshest rule data after a reload.
  useEffect(() => {
    setSelectedItem((current) => (current ? items.find((item) => item.id === current.id) ?? null : null))
  }, [items])

  const summary = useMemo(() => {
    const active: RecurringTransaction[] = []
    const cancelled: RecurringTransaction[] = []
    let income = 0
    let expenses = 0

    for (const item of items) {
      if (item.active) {
        active.push(item)
        if (item.type === 'INCOME') income += item.amount
        else expenses += item.amount
      } else {
        cancelled.push(item)
      }
    }

    active.sort((a, b) => b.amount - a.amount)
    cancelled.sort((a, b) => a.description.localeCompare(b.description))
    return { active, cancelled, income, expenses, net: income - expenses }
  }, [items])

  const body = (
    <>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        {!embedded && (
          <PageHeader
            icon={CalendarClock}
            title="Fixed payments & incomes"
            subtitle="Manage predictable monthly bills, subscriptions and income."
            rightSlot={
              <Button
                colorScheme="blue"
                leftIcon={<Icon as={Plus} boxSize={4} />}
                onClick={() => onPageChange?.('dashboard')}
                w={{ base: 'full', sm: 'auto' }}
              >
                Add from Home
              </Button>
            }
          />
        )}

        {loading ? (
          <HStack justify="center" py={20}>
            <Spinner color="blue.500" />
          </HStack>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
              <MetricCard
                icon={TrendingUp}
                label="Fixed income"
                value={money(summary.income)}
                color="green.500"
                bg={softBg}
              />
              <MetricCard
                icon={TrendingDown}
                label="Fixed expenses"
                value={money(summary.expenses)}
                color="red.500"
                bg={softBg}
              />
              <MetricCard
                icon={CalendarClock}
                label="Monthly net"
                value={money(summary.net)}
                color={summary.net < 0 ? 'red.500' : 'blue.500'}
                bg={softBg}
              />
            </SimpleGrid>

            <SectionCard bare>
              <Box p={{ base: 4, md: 6 }}>
                <VStack align="stretch" spacing={5}>
                  <SectionHeader
                    icon={CalendarClock}
                    title="Active fixed payments"
                    caption={`${summary.active.length} active monthly rule${summary.active.length !== 1 ? 's' : ''}`}
                    accent="blue"
                  />
                  {summary.active.length === 0 ? (
                    <EmptyState text="No active fixed payments or incomes." />
                  ) : (
                    <VStack align="stretch" spacing="0.6rem">
                      {summary.active.map((item) => (
                        <RecurringTransactionCard
                          key={item.id}
                          recurringTransaction={item}
                          onOpen={setSelectedItem}
                        />
                      ))}
                    </VStack>
                  )}
                </VStack>
              </Box>
            </SectionCard>

            {summary.cancelled.length > 0 && (
              <SectionCard bare>
                <Box p={{ base: 4, md: 6 }}>
                  <VStack align="stretch" spacing={5}>
                    <SectionHeader
                      icon={CalendarClock}
                      title="Cancelled"
                      caption={`${summary.cancelled.length} stopped rule${summary.cancelled.length !== 1 ? 's' : ''}`}
                      accent="neutral"
                      rightSlot={
                        <Badge colorScheme="gray" borderRadius="full">
                          History
                        </Badge>
                      }
                    />
                    <VStack align="stretch" spacing="0.6rem">
                      {summary.cancelled.map((item) => (
                        <RecurringTransactionCard
                          key={item.id}
                          recurringTransaction={item}
                          onOpen={setSelectedItem}
                        />
                      ))}
                    </VStack>
                  </VStack>
                </Box>
              </SectionCard>
            )}
          </>
        )}
      </VStack>

      <RecurringTransactionDrawer
        recurringTransaction={selectedItem}
        onClose={() => setSelectedItem(null)}
        onChanged={load}
      />
    </>
  )

  if (embedded) return body

  return (
    <Box
      w="full"
      maxW="appContent"
      mx="auto"
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 4, md: 7 }}
    >
      {body}
    </Box>
  )
}

interface MetricCardProps {
  icon: typeof CalendarClock
  label: string
  value: string
  color: string
  bg: string
}

function MetricCard({
  icon,
  label,
  value,
  color,
  bg,
}: MetricCardProps) {
  return (
    <SectionCard>
      <Box p={4}>
        <HStack spacing={3}>
          <Box
            w={9}
            h={9}
            borderRadius="lg"
            bg={bg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={color}
          >
            <Icon as={icon} boxSize={4} />
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500">
              {label}
            </Text>
            <Text fontSize="lg" fontWeight={800} color={color}>
              {value}
            </Text>
          </Box>
        </HStack>
      </Box>
    </SectionCard>
  )
}

function EmptyState({ text }: { text: string }) {
  const muted = useColorModeValue('gray.500', 'gray.400')
  const border = useColorModeValue('gray.200', 'gray.700')
  return (
    <Box py={10} textAlign="center" border="1px dashed" borderColor={border} borderRadius="xl">
      <Text fontSize="sm" color={muted}>
        {text}
      </Text>
    </Box>
  )
}
