import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Collapse,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEd } from '../editorial'
import { listInstallmentPlans } from '../api'
import type { InstallmentPlan } from '../types'
import type { AppPage } from '../components/layout/header/navigation.config'
import InstallmentPlanCard, {
  isInstallmentPlanCompleted,
} from '../components/installments/InstallmentPlanCard'
import { PageHeader, SectionHeader } from '../components/ui'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
  const [activeOpen, setActiveOpen] = useState(true)
  const [completedOpen, setCompletedOpen] = useState(true)

  const ed = useEd()

  const borderColorBase = useColorModeValue('gray.200', 'gray.800')
  const borderColor = ed ? ed.line : borderColorBase
  const mutedBase = useColorModeValue('gray.600', 'gray.400')
  const muted = ed ? ed.muted : mutedBase
  const softBgBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  const softBg = ed ? ed.panelRaised : softBgBase
  const panelBg = ed ? ed.panel : undefined

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
      maxW="appContent"
      mx="auto"
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 4, md: 7 }}
    >
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <PageHeader
          icon={CreditCard}
          title="Installments"
          subtitle="Track active purchase plans, remaining payments and completed history."
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
                panelBg={panelBg}
              />
              <MetricCard
                icon={Wallet}
                label="Remaining"
                value={money(summary.remaining)}
                borderColor={borderColor}
                bg={softBg}
                panelBg={panelBg}
              />
              <MetricCard
                icon={CheckCircle2}
                label="Already paid"
                value={money(summary.paid)}
                borderColor={borderColor}
                bg={softBg}
                panelBg={panelBg}
              />
            </SimpleGrid>

            <Card bg={panelBg} border="1px solid" borderColor={borderColor} boxShadow="sm">
              <CardBody p={{ base: 4, md: 6 }}>
                <VStack align="stretch" spacing={4}>
                  <Box
                    as="button"
                    type="button"
                    onClick={() => setActiveOpen((open) => !open)}
                    w="full"
                    textAlign="left"
                    borderRadius="lg"
                    aria-expanded={activeOpen}
                  >
                    <SectionHeader
                      icon={CreditCard}
                      title="Active plans"
                      caption={`${summary.active.length} installment plan${summary.active.length !== 1 ? 's' : ''} in progress`}
                      accent="blue"
                      rightSlot={
                        <Icon
                          as={activeOpen ? ChevronUp : ChevronDown}
                          boxSize={5}
                          color={muted}
                        />
                      }
                    />
                  </Box>
                  <Collapse in={activeOpen} animateOpacity>
                    {summary.active.length === 0 ? (
                      <EmptyState text="No active installment plans." />
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={3}>
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
                  </Collapse>
                </VStack>
              </CardBody>
            </Card>

            {summary.completed.length > 0 && (
              <Card bg={panelBg} border="1px solid" borderColor={borderColor} boxShadow="sm">
                <CardBody p={{ base: 4, md: 6 }}>
                  <VStack align="stretch" spacing={4}>
                    <Box
                      as="button"
                      type="button"
                      onClick={() => setCompletedOpen((open) => !open)}
                      w="full"
                      textAlign="left"
                      borderRadius="lg"
                      aria-expanded={completedOpen}
                    >
                      <SectionHeader
                        icon={CheckCircle2}
                        title="Completed"
                        caption={`${summary.completed.length} completed plan${summary.completed.length !== 1 ? 's' : ''}`}
                        accent="neutral"
                        rightSlot={
                          <HStack spacing={2}>
                            <Badge colorScheme="gray" borderRadius="full">
                              History
                            </Badge>
                            <Icon
                              as={completedOpen ? ChevronUp : ChevronDown}
                              boxSize={5}
                              color={muted}
                            />
                          </HStack>
                        }
                      />
                    </Box>
                    <Collapse in={completedOpen} animateOpacity>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={3}>
                        {summary.completed.map((plan) => (
                          <InstallmentPlanCard
                            key={plan.id}
                            plan={plan}
                            onDeleted={load}
                            variant="past"
                          />
                        ))}
                      </SimpleGrid>
                    </Collapse>
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
  panelBg?: string
}

function MetricCard({
  icon,
  label,
  value,
  borderColor,
  bg,
  panelBg,
}: MetricCardProps) {
  const ed = useEd()
  return (
    <Card bg={panelBg} border="1px solid" borderColor={borderColor} boxShadow="sm">
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
  const ed = useEd()
  const mutedBase = useColorModeValue('gray.500', 'gray.400')
  const muted = ed ? ed.muted : mutedBase
  const borderBase = useColorModeValue('gray.200', 'gray.700')
  const border = ed ? ed.line : borderBase
  return (
    <Box py={10} textAlign="center" border="1px dashed" borderColor={border} borderRadius="xl">
      <Text fontSize="sm" color={muted}>
        {text}
      </Text>
    </Box>
  )
}
