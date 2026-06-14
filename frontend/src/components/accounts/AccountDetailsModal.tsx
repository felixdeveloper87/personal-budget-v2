import { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Divider,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { getAccountDetails } from '../../api'
import type {
  AccountActivityItem,
  AccountDetails,
  FinancialAccount,
} from '../../types'
import { ToastService } from '../../services/toast'
import { ModalHeader, PremiumModal } from '../ui'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Repeat,
  Wallet,
} from '../ui/icons'
import { useEd } from '../../editorial'

const money = (value: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value)

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const isIncoming = (item: AccountActivityItem) =>
  item.kind === 'INCOME' || item.kind === 'TRANSFER_IN'

function ActivityList({
  title,
  emptyText,
  items,
  currency,
  hideBalances,
}: {
  title: string
  emptyText: string
  items: AccountActivityItem[]
  currency: string
  hideBalances: boolean
}) {
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const muted = useColorModeValue('gray.500', 'gray.400')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const incomingBg = useColorModeValue('green.50', 'rgba(34,197,94,0.14)')
  const outgoingBg = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')

  return (
    <VStack align="stretch" spacing={3}>
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight={800} color={titleColor}>{title}</Text>
        <Badge variant="subtle" colorScheme="blue" borderRadius="full">
          {items.length}
        </Badge>
      </HStack>
      {items.length === 0 ? (
        <Text fontSize="sm" color={muted} py={3}>{emptyText}</Text>
      ) : (
        <VStack align="stretch" spacing={0} border="1px solid" borderColor={borderColor} borderRadius="xl">
          {items.map((item, index) => {
            const incoming = isIncoming(item)
            const transfer = item.kind === 'TRANSFER_IN' || item.kind === 'TRANSFER_OUT'
            return (
              <Box key={`${item.kind}-${item.id}-${item.date}`}>
                <Flex align="center" justify="space-between" gap={3} px={3} py={3}>
                  <HStack spacing={3} minW={0}>
                    <Box
                      w={8}
                      h={8}
                      borderRadius="lg"
                      bg={incoming ? incomingBg : outgoingBg}
                      color={incoming ? 'green.500' : 'red.500'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Icon
                        as={transfer ? Repeat : incoming ? ArrowDownRight : ArrowUpRight}
                        boxSize={4}
                      />
                    </Box>
                    <VStack align="flex-start" spacing={0} minW={0}>
                      <Text fontSize="sm" fontWeight={700} noOfLines={1}>
                        {item.description?.trim() || item.category || 'Account activity'}
                      </Text>
                      <Text fontSize="xs" color={muted} noOfLines={1}>
                        {formatDate(item.date)}
                        {item.category ? ` - ${item.category}` : ''}
                        {item.paymentMethodName ? ` - paid with ${item.paymentMethodName}` : ''}
                      </Text>
                      {item.status && item.status !== 'CLEARED' ? (
                        <Badge mt={1} variant="subtle" colorScheme="orange">
                          {item.status.toLowerCase()}
                        </Badge>
                      ) : null}
                    </VStack>
                  </HStack>
                  <Text
                    fontSize="sm"
                    fontWeight={800}
                    color={incoming ? 'green.500' : 'red.500'}
                    flexShrink={0}
                  >
                    {hideBalances ? '******' : `${incoming ? '+' : '-'}${money(item.amount, currency)}`}
                  </Text>
                </Flex>
                {index < items.length - 1 ? <Divider borderColor={borderColor} /> : null}
              </Box>
            )
          })}
        </VStack>
      )}
    </VStack>
  )
}

interface AccountDetailsModalProps {
  account: FinancialAccount | null
  isOpen: boolean
  onClose: () => void
  hideBalances: boolean
}

export default function AccountDetailsModal({
  account,
  isOpen,
  onClose,
  hideBalances,
}: AccountDetailsModalProps) {
  const ed = useEd()
  const [details, setDetails] = useState<AccountDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const fallbackBodyBg = useColorModeValue('gray.50', '#080808')
  const fallbackPanelBg = useColorModeValue('white', 'whiteAlpha.50')
  const bodyBg = ed?.bg ?? fallbackBodyBg
  const panelBg = ed?.panelRaised ?? fallbackPanelBg
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const muted = useColorModeValue('gray.500', 'gray.400')

  useEffect(() => {
    if (!isOpen || !account) return
    let active = true
    setLoading(true)
    setDetails(null)
    getAccountDetails(account.id)
      .then((data) => {
        if (active) setDetails(data)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: 'Could not load account activity',
          dedupeKey: `account-details-load-failed:${account.id}`,
        })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [account, isOpen])

  const displayedAccount = details?.account ?? account

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <ModalHeader
          icon={Wallet}
          title={displayedAccount?.name ?? 'Account details'}
          caption={displayedAccount?.institution || 'Balance account activity'}
          onClose={onClose}
          accent="blue"
        />
      }
    >
      <Box bg={bodyBg} p={{ base: 4, md: 6 }} overflowY="auto">
        {loading || !details ? (
          <Flex minH="280px" align="center" justify="center">
            <Spinner color="blue.500" />
          </Flex>
        ) : (
          <VStack align="stretch" spacing={6}>
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
              <Stat p={4} bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
                <StatLabel color={muted} fontSize="xs">Current balance</StatLabel>
                <StatNumber fontSize="xl">
                  {hideBalances ? '******' : money(details.account.currentBalance, details.account.currency)}
                </StatNumber>
              </Stat>
              <Stat p={4} bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
                <StatLabel color={muted} fontSize="xs">
                  {details.account.type === 'CURRENT' ? 'Overdraft available' : 'Opening balance'}
                </StatLabel>
                <StatNumber fontSize="xl">
                  {hideBalances
                    ? '******'
                    : money(
                        details.account.type === 'CURRENT'
                          ? details.account.overdraftAvailable
                          : details.account.openingBalance,
                        details.account.currency,
                      )}
                </StatNumber>
              </Stat>
              <Stat p={4} bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
                <StatLabel color={muted} fontSize="xs">Account type</StatLabel>
                <StatNumber fontSize="md" mt={1} textTransform="capitalize">
                  {details.account.type.replace('_', ' ').toLowerCase()}
                </StatNumber>
              </Stat>
            </SimpleGrid>

            <ActivityList
              title="Recent activity"
              emptyText="No recent transactions for this account."
              items={details.recentActivity}
              currency={details.account.currency}
              hideBalances={hideBalances}
            />

            <ActivityList
              title="Upcoming payments"
              emptyText="No upcoming payments scheduled for this account."
              items={details.upcomingActivity}
              currency={details.account.currency}
              hideBalances={hideBalances}
            />

            <HStack color={muted} fontSize="xs" align="flex-start">
              <Icon as={CalendarClock} boxSize={4} mt="1px" />
              <Text>
                Cleared activity affects the current balance. Planned and pending items appear under upcoming payments.
              </Text>
            </HStack>
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
}
