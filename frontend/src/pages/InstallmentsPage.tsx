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
import { listInstallmentPlans } from '../api'
import type { InstallmentPlan } from '../types'
import type { AppPage } from '../components/layout/header/navigation.config'
import InstallmentPlanCard, {
  isInstallmentPlanCompleted,
} from '../components/installments/InstallmentPlanCard'
import { SectionHeader } from '../components/ui'
import {
  CheckCircle2,
  CreditCard,
  Plus,
  Wallet,
} from '../components/ui/icons'
import { ToastService } from '../services/toast'

interface InstallmentsPageProps {
  onPageChange?: (page: AppPage) => void
}

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value)

export default function InstallmentsPage({
  onPageChange,
}: InstallmentsPageProps) {
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)

  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const muted = useColorModeValue('gray.600', 'gray.400')
  const softBg = useColorModeValue('gray.50', 'whiteAlpha.50')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setPlans(await listInstallmentPlans())
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not load installment plans',
        dedupeKey: 'installments-page-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const summary = useMemo(() => {
    const active: InstallmentPlan[] = []
    const completed: InstallmentPlan[] = []
    let remaining = 0
    let paid = 0
    const now = Date.now()

    for (const plan of plans) {
      if (isInstallmentPlanCompleted(plan)) completed.push(plan)
      else active.push(plan)

      for (const transaction of plan.transactions) {
        if (new Date(transaction.date).getTime() < now) paid += transaction.amount
        else remaining += transaction.amount
      }
    }

    return { active, completed, remaining, paid }
  }, [plans])

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
              Installments
            </Text>
            <Text color={muted} mt={1} fontSize="sm">
              Track active purchase plans, remaining payments and completed history.
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
                icon={CreditCard}
                label="Active plans"
                value={String(summary.active.length)}
                borderColor={borderColor}
                bg={softBg}
              />
              <MetricCard
                icon={Wallet}
                label="Remaining"
                value={money(summary.remaining)}
                borderColor={borderColor}
                bg={softBg}
              />
              <MetricCard
                icon={CheckCircle2}
                label="Already paid"
                value={money(summary.paid)}
                borderColor={borderColor}
                bg={softBg}
              />
            </SimpleGrid>

            <Card border="1px solid" borderColor={borderColor} boxShadow="sm">
              <CardBody p={{ base: 4, md: 6 }}>
                <VStack align="stretch" spacing={5}>
                  <SectionHeader
                    icon={CreditCard}
                    title="Active plans"
                    caption={`${summary.active.length} installment plan${summary.active.length !== 1 ? 's' : ''} in progress`}
                    accent="blue"
                  />
                  {summary.active.length === 0 ? (
                    <EmptyState text="No active installment plans." />
                  ) : (
                    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
                      {summary.active.map((plan) => (
                        <InstallmentPlanCard
                          key={plan.id}
                          plan={plan}
                          onDeleted={load}
                          variant="active"
                        />
                      ))}
                    </SimpleGrid>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {summary.completed.length > 0 && (
              <Card border="1px solid" borderColor={borderColor} boxShadow="sm">
                <CardBody p={{ base: 4, md: 6 }}>
                  <VStack align="stretch" spacing={5}>
                    <SectionHeader
                      icon={CheckCircle2}
                      title="Completed"
                      caption={`${summary.completed.length} completed plan${summary.completed.length !== 1 ? 's' : ''}`}
                      accent="neutral"
                      rightSlot={
                        <Badge colorScheme="gray" borderRadius="full">
                          History
                        </Badge>
                      }
                    />
                    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
                      {summary.completed.map((plan) => (
                        <InstallmentPlanCard
                          key={plan.id}
                          plan={plan}
                          onDeleted={load}
                          variant="past"
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
  icon: typeof Wallet
  label: string
  value: string
  borderColor: string
  bg: string
}

function MetricCard({
  icon,
  label,
  value,
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
            color="blue.500"
          >
            <Icon as={icon} boxSize={4} />
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500">
              {label}
            </Text>
            <Text fontSize="lg" fontWeight={800}>
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
