import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  Progress,
  Select,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Wallet,
} from '../ui/icons'
import { ModalHeader, PremiumModal } from '../ui'
import { FinancialAccount } from '../../types'
import {
  assignInstallmentPlanAccount,
  assignRecurringTransactionAccount,
  listAccounts,
} from '../../api'
import { ToastService } from '../../services/toast'

export interface AssignableItem {
  id: number
  title: string
  subtitle?: string
  amountLabel: string
  metaLabel?: string
}

interface AccountAssignmentWizardProps {
  isOpen: boolean
  onClose: () => void
  kind: 'installment' | 'recurring'
  /** Unassigned active items, captured when the wizard opens. */
  items: AssignableItem[]
  /** Called after each successful association so the parent list/banner refreshes. */
  onAssigned: () => void | Promise<void>
}

const money = (value: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value)

/**
 * Guided, one-card-at-a-time flow to associate each active installment plan or fixed
 * payment with a current account. Items are processed individually (never in bulk),
 * with a progress indicator and a completion state once nothing is left to review.
 */
export default function AccountAssignmentWizard({
  isOpen,
  onClose,
  kind,
  items,
  onAssigned,
}: AccountAssignmentWizardProps) {
  const [queue, setQueue] = useState<AssignableItem[]>([])
  const [index, setIndex] = useState(0)
  const [assignedCount, setAssignedCount] = useState(0)
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [accountId, setAccountId] = useState<number | null>(null)
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [saving, setSaving] = useState(false)

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')
  const cardBg = useColorModeValue('#ffffff', 'whiteAlpha.50')
  const cardBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const muted = useColorModeValue('gray.500', 'gray.400')
  const iconBg = useColorModeValue('teal.50', 'rgba(20,184,166,0.14)')
  const iconFg = useColorModeValue('teal.700', 'teal.300')
  const amountPanelBg = useColorModeValue(
    'linear-gradient(135deg, rgba(20,184,166,0.10), rgba(37,99,235,0.08))',
    'linear-gradient(135deg, rgba(45,212,191,0.16), rgba(96,165,250,0.10))',
  )

  const kindLabel = kind === 'installment' ? 'installment plan' : 'fixed payment'
  const kindIcon = kind === 'installment' ? CreditCard : CalendarClock

  const currentAccounts = useMemo(
    () => accounts.filter((account) => account.active && account.type === 'CURRENT'),
    [accounts],
  )

  // Freeze the queue and reset state whenever the wizard opens.
  useEffect(() => {
    if (!isOpen) return
    setQueue(items)
    setIndex(0)
    setAssignedCount(0)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return
    setLoadingAccounts(true)
    listAccounts()
      .then((data) => {
        setAccounts(data)
        const firstCurrent = data.find((account) => account.active && account.type === 'CURRENT')
        setAccountId((current) => current ?? firstCurrent?.id ?? null)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: 'Could not load accounts',
          dedupeKey: 'assignment-wizard-accounts-failed',
        })
      })
      .finally(() => setLoadingAccounts(false))
  }, [isOpen])

  const current = queue[index]
  const isComplete = !current
  const total = queue.length

  const advance = useCallback(() => setIndex((value) => value + 1), [])

  const handleAssign = async () => {
    if (!current || !accountId) return
    setSaving(true)
    try {
      if (kind === 'installment') {
        await assignInstallmentPlanAccount(current.id, accountId)
      } else {
        await assignRecurringTransactionAccount(current.id, accountId)
      }
      setAssignedCount((value) => value + 1)
      advance()
      await Promise.resolve(onAssigned())
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not associate the account',
        dedupeKey: `assignment-wizard-failed:${kind}:${current.id}`,
      })
    } finally {
      setSaving(false)
    }
  }

  const noCurrentAccounts = !loadingAccounts && currentAccounts.length === 0

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl' }}
      header={
        <ModalHeader
          icon={kindIcon}
          title={`Associate ${kind === 'installment' ? 'installments' : 'fixed payments'}`}
          caption="Pick a current account for each one, one at a time"
          onClose={onClose}
          accent="blue"
          rightSlot={
            total > 0 && !isComplete ? (
              <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="full">
                {index + 1} / {total}
              </Badge>
            ) : undefined
          }
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} p={{ base: 4, sm: 6 }} overflowY="auto">
        {noCurrentAccounts ? (
          <Alert status="warning" borderRadius="xl" alignItems="flex-start">
            <AlertIcon mt={1} />
            <Box>
              <Text fontWeight={700} color={titleColor}>No current account yet</Text>
              <AlertDescription fontSize="sm" color={muted}>
                Create a current account on the Accounts page first, then come back to
                associate your {kindLabel}s here.
              </AlertDescription>
            </Box>
          </Alert>
        ) : isComplete ? (
          <VStack spacing={4} py={{ base: 8, md: 12 }} textAlign="center">
            <Box
              w={16}
              h={16}
              borderRadius="2xl"
              bg={iconBg}
              color={iconFg}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={CheckCircle2} boxSize={8} weight="duotone" />
            </Box>
            <VStack spacing={1}>
              <Text fontWeight={800} fontSize="lg" color={titleColor}>
                {assignedCount > 0 ? "You're all set" : 'Nothing left to associate'}
              </Text>
              <Text fontSize="sm" color={muted} maxW="420px">
                {assignedCount > 0
                  ? `${assignedCount} ${kindLabel}${assignedCount === 1 ? '' : 's'} associated. Each payment will move the balance of its account on the payment date.`
                  : `Every active ${kindLabel} already has an account.`}
              </Text>
            </VStack>
            <Button colorScheme="teal" onClick={onClose}>Done</Button>
          </VStack>
        ) : (
          <VStack align="stretch" spacing={5}>
            <Progress
              value={total > 0 ? (index / total) * 100 : 0}
              size="sm"
              colorScheme="teal"
              borderRadius="full"
            />

            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="xl"
              p={{ base: 4, md: 5 }}
            >
              <HStack spacing={3} align="flex-start">
                <Box
                  w={10}
                  h={10}
                  borderRadius="lg"
                  bg={iconBg}
                  color={iconFg}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon as={kindIcon} boxSize={5} weight="duotone" />
                </Box>
                <VStack align="flex-start" spacing={0} minW={0}>
                  <Text fontWeight={800} color={titleColor} noOfLines={1}>
                    {current.title}
                  </Text>
                  {current.subtitle && (
                    <Text fontSize="sm" color={muted} noOfLines={1}>{current.subtitle}</Text>
                  )}
                </VStack>
              </HStack>

              <Box bg={amountPanelBg} borderRadius="lg" p={3} mt={4} border="1px solid" borderColor={cardBorder}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color={muted}>{current.amountLabel}</Text>
                  {current.metaLabel && (
                    <Text fontSize="sm" fontWeight={700} color={titleColor}>{current.metaLabel}</Text>
                  )}
                </HStack>
              </Box>
            </Box>

            <Box>
              <HStack mb={2} spacing={2}>
                <Icon as={Wallet} boxSize={4} color={muted} />
                <Text fontSize="sm" fontWeight={700} color={titleColor}>Debit from current account</Text>
              </HStack>
              <Select
                value={accountId ?? ''}
                onChange={(event) => setAccountId(event.target.value ? Number(event.target.value) : null)}
                placeholder={loadingAccounts ? 'Loading accounts...' : 'Select a current account'}
                isDisabled={loadingAccounts}
              >
                {currentAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} · {money(account.currentBalance, account.currency)}
                  </option>
                ))}
              </Select>
              <Text fontSize="xs" color={muted} mt={2}>
                The whole {kindLabel} is linked to this account. Existing values and dates stay unchanged.
              </Text>
            </Box>

            <HStack justify="space-between" pt={1}>
              <Button variant="ghost" color={muted} onClick={advance} isDisabled={saving}>
                Skip for now
              </Button>
              <Button
                colorScheme="teal"
                rightIcon={<Icon as={index + 1 < total ? ArrowRight : CheckCircle2} boxSize={4} />}
                onClick={handleAssign}
                isLoading={saving}
                isDisabled={!accountId}
              >
                {index + 1 < total ? 'Associate & next' : 'Associate & finish'}
              </Button>
            </HStack>
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
}
