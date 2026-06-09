import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
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
import { SectionHeader } from '../components/ui'
import {
  CalendarClock,
  Plus,
  TrendingDown,
  TrendingUp,
} from '../components/ui/icons'
import { ToastService } from '../services/toast'

interface FixedPaymentsPageProps {
  onPageChange?: (page: AppPage) => void
}

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value)

export default function FixedPaymentsPage({
  onPageChange,
}: FixedPaymentsPageProps) {
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const muted = useColorModeValue('gray.600', 'gray.400')
  const softBg = useColorModeValue('gray.50', 'whiteAlpha.50')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await listRecurringTransactions())
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not load fixed payments',
        dedupeKey: 'fixed-payments-page-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

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

  return (
    <Box
      w="full"
      maxW="1400px"
      mx="auto"
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 4, md: 7 }}
    >
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <HStack
          justify="space-between"
          align={{ base: 'flex-start', sm: 'center' }}
          flexWrap="wrap"
          gap={3}
        >
          <Box>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={800}>
              Fixed payments & incomes
            </Text>
            <Text color={muted} mt={1} fontSize="sm">
              Manage predictable monthly bills, subscriptions and income.
            </Text>
          </Box>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={Plus} boxSize={4} />}
            onClick={() => onPageChange?.('dashboard')}
          >
            Add from Home
          </Button>
        </HStack>

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
                borderColor={borderColor}
                bg={softBg}
              />
              <MetricCard
                icon={TrendingDown}
                label="Fixed expenses"
                value={money(summary.expenses)}
                color="red.500"
                borderColor={borderColor}
                bg={softBg}
              />
              <MetricCard
                icon={CalendarClock}
                label="Monthly net"
                value={money(summary.net)}
                color={summary.net < 0 ? 'red.500' : 'blue.500'}
                borderColor={borderColor}
                bg={softBg}
              />
            </SimpleGrid>

            <Card border="1px solid" borderColor={borderColor} boxShadow="sm">
              <CardBody p={{ base: 4, md: 6 }}>
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
                    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
                      {summary.active.map((item) => (
                        <RecurringTransactionCard
                          key={item.id}
                          recurringTransaction={item}
                          onChanged={load}
                        />
                      ))}
                    </SimpleGrid>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {summary.cancelled.length > 0 && (
              <Card border="1px solid" borderColor={borderColor} boxShadow="sm">
                <CardBody p={{ base: 4, md: 6 }}>
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
                    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
                      {summary.cancelled.map((item) => (
                        <RecurringTransactionCard
                          key={item.id}
                          recurringTransaction={item}
                          onChanged={load}
                        />
                      ))}
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </VStack>
    </Box>
  )
}

interface MetricCardProps {
  icon: typeof CalendarClock
  label: string
  value: string
  color: string
  borderColor: string
  bg: string
}

function MetricCard({
  icon,
  label,
  value,
  color,
  borderColor,
  bg,
}: MetricCardProps) {
  return (
    <Card border="1px solid" borderColor={borderColor} boxShadow="sm">
      <CardBody p={4}>
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
      </CardBody>
    </Card>
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
