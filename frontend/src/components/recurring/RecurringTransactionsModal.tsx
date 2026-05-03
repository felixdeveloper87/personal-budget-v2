import { useMemo } from 'react'
import {
  Badge,
  Box,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { CalendarClock, Repeat, Wallet } from '../ui/icons'
import { ModalHeader, PremiumModal } from '../ui'
import { RecurringTransaction } from '../../types'
import RecurringTransactionCard from './RecurringTransactionCard'

interface RecurringTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
  recurringTransactions: RecurringTransaction[]
  onChanged: () => void | Promise<void>
}

function formatCurrency(value: number) {
  return value < 0 ? `-£${Math.abs(value).toFixed(2)}` : `£${value.toFixed(2)}`
}

export default function RecurringTransactionsModal({
  isOpen,
  onClose,
  recurringTransactions,
  onChanged,
}: RecurringTransactionsModalProps) {
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')
  const panelBg = useColorModeValue('#ffffff', 'whiteAlpha.50')
  const panelBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const statBg = useColorModeValue('white', 'whiteAlpha.50')
  const statBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const iconBg = useColorModeValue('teal.50', 'rgba(20,184,166,0.14)')
  const iconFg = useColorModeValue('teal.700', 'teal.300')
  const heroBg = useColorModeValue(
    'linear-gradient(135deg, #071a2c 0%, #0f766e 48%, #22c55e 100%)',
    'linear-gradient(135deg, #07111f 0%, #0f766e 52%, #16a34a 100%)',
  )

  const { activeItems, cancelledItems, activeNet, activeIncome, activeExpense } = useMemo(() => {
    const active: RecurringTransaction[] = []
    const cancelled: RecurringTransaction[] = []
    let income = 0
    let expense = 0

    for (const item of recurringTransactions) {
      if (item.active) {
        active.push(item)
        if (item.type === 'INCOME') income += item.amount
        else expense += item.amount
      } else {
        cancelled.push(item)
      }
    }

    active.sort((a, b) => b.amount - a.amount)
    cancelled.sort((a, b) => a.description.localeCompare(b.description))

    return {
      activeItems: active,
      cancelledItems: cancelled,
      activeNet: income - expense,
      activeIncome: income,
      activeExpense: expense,
    }
  }, [recurringTransactions])

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '5xl' }}
      header={
        <ModalHeader
          icon={CalendarClock}
          title="Fixed payments"
          caption="Salary, rent, bills, subscriptions"
          onClose={onClose}
          accent="blue"
          rightSlot={
            activeItems.length > 0 ? (
              <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="full">
                {activeItems.length} active
              </Badge>
            ) : undefined
          }
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} p={{ base: 4, sm: 5, md: 6 }} overflowY="auto">
        {recurringTransactions.length === 0 ? (
          <Box
            bg={panelBg}
            border="1px solid"
            borderColor={panelBorder}
            borderRadius="xl"
            p={{ base: 8, md: 12 }}
          >
            <VStack spacing={4} textAlign="center">
              <Box
                w={14}
                h={14}
                borderRadius="2xl"
                bg={iconBg}
                color={iconFg}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={Repeat} boxSize={7} weight="duotone" />
              </Box>
              <VStack spacing={1}>
                <Text fontWeight={800} color={titleColor} fontSize="lg">
                  No fixed expenses yet
                </Text>
                <Text fontSize="sm" color={captionColor} maxW="420px">
                  Create one from the Expense modal by enabling Repeat every month.
                </Text>
              </VStack>
            </VStack>
          </Box>
        ) : (
          <VStack align="stretch" spacing={6}>
            <Box
              bg={heroBg}
              color="white"
              borderRadius="xl"
              p={{ base: 5, md: 6 }}
              boxShadow="0 18px 42px -24px rgba(15, 118, 110, 0.85)"
              overflow="hidden"
            >
              <HStack justify="space-between" align={{ base: 'flex-start', sm: 'center' }} spacing={4}>
                <VStack align="flex-start" spacing={1} minW={0}>
                  <HStack spacing={2}>
                    <Box
                      w={8}
                      h={8}
                      borderRadius="lg"
                      bg="whiteAlpha.200"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={Wallet} boxSize={4} weight="duotone" />
                    </Box>
                    <Text fontSize="xs" fontWeight={800} textTransform="uppercase" color="whiteAlpha.800">
                      Fixed monthly commitments
                    </Text>
                  </HStack>
                  <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight={900} lineHeight="1">
                    {formatCurrency(activeNet)}
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    Your predictable monthly money movement.
                  </Text>
                </VStack>
                <VStack align="flex-end" spacing={2} flexShrink={0}>
                  <Badge bg="whiteAlpha.200" color="white" borderRadius="full" px={3} py={1}>
                    {activeItems.length} active
                  </Badge>
                  {cancelledItems.length > 0 && (
                    <Badge bg="blackAlpha.200" color="whiteAlpha.900" borderRadius="full" px={3} py={1}>
                      {cancelledItems.length} cancelled
                    </Badge>
                  )}
                </VStack>
              </HStack>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
              <SummaryStat
                icon={Wallet}
                label="Monthly fixed net"
                value={formatCurrency(activeNet)}
                bg={statBg}
                borderColor={statBorder}
                titleColor={titleColor}
                captionColor={captionColor}
              />
              <SummaryStat
                icon={Repeat}
                label="Fixed income"
                value={formatCurrency(activeIncome)}
                bg={statBg}
                borderColor={statBorder}
                titleColor={titleColor}
                captionColor={captionColor}
              />
              <SummaryStat
                icon={CalendarClock}
                label="Fixed expenses"
                value={formatCurrency(activeExpense)}
                bg={statBg}
                borderColor={statBorder}
                titleColor={titleColor}
                captionColor={captionColor}
              />
            </SimpleGrid>

            <RecurringGroup
              title="Active"
              caption={`${activeItems.length} fixed payments sorted by amount`}
              items={activeItems}
              onChanged={onChanged}
              emptyMessage="No active fixed expenses right now."
            />

            {cancelledItems.length > 0 && (
              <RecurringGroup
                title="Cancelled"
                caption={`${cancelledItems.length} stopped payments kept for reference`}
                items={cancelledItems}
                onChanged={onChanged}
                muted
              />
            )}
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
}

interface SummaryStatProps {
  icon: typeof Wallet
  label: string
  value: string
  bg: string
  borderColor: string
  titleColor: string
  captionColor: string
}

function SummaryStat({
  icon,
  label,
  value,
  bg,
  borderColor,
  titleColor,
  captionColor,
}: SummaryStatProps) {
  const chipBg = useColorModeValue('teal.50', 'rgba(20,184,166,0.14)')
  const chipFg = useColorModeValue('teal.700', 'teal.300')

  return (
    <Box bg={bg} border="1px solid" borderColor={borderColor} borderRadius="xl" p={4}>
      <HStack spacing={3} align="center">
        <Box
          w={9}
          h={9}
          borderRadius="lg"
          bg={chipBg}
          color={chipFg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={4} weight="duotone" />
        </Box>
        <VStack align="flex-start" spacing={0} minW={0}>
          <Text fontSize="xs" color={captionColor} noOfLines={1}>
            {label}
          </Text>
          <Text fontSize="lg" fontWeight={800} color={titleColor} lineHeight="1.15" noOfLines={1}>
            {value}
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}

interface RecurringGroupProps {
  title: string
  caption: string
  items: RecurringTransaction[]
  onChanged: () => void | Promise<void>
  emptyMessage?: string
  muted?: boolean
}

function RecurringGroup({
  title,
  caption,
  items,
  onChanged,
  emptyMessage,
  muted,
}: RecurringGroupProps) {
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const emptyBg = useColorModeValue('white', 'whiteAlpha.50')

  return (
    <Box opacity={muted ? 0.82 : 1}>
      <HStack
        justify="space-between"
        mb={3}
        pb={2}
        borderBottom="1px solid"
        borderColor={dividerColor}
      >
        <VStack align="flex-start" spacing={0}>
          <Text fontSize="xs" fontWeight={800} color={titleColor} textTransform="uppercase">
            {title}
          </Text>
          <Text fontSize="xs" color={captionColor}>
            {caption}
          </Text>
        </VStack>
        <Badge borderRadius="full" px={2.5} py={1} colorScheme={muted ? 'gray' : 'teal'}>
          {items.length}
        </Badge>
      </HStack>

      {items.length === 0 ? (
        emptyMessage && (
          <Box bg={emptyBg} borderRadius="xl" p={4}>
            <Text fontSize="sm" color={captionColor}>
              {emptyMessage}
            </Text>
          </Box>
        )
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 5 }}>
          {items.map((item) => (
            <RecurringTransactionCard
              key={item.id}
              recurringTransaction={item}
              onChanged={onChanged}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  )
}
