import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { Transaction } from '../../types'
import { formatDateBR } from '../../utils/dateTime'
import { formatTransactionAccount } from '../../utils/transactionAccount'
import {
  getCounterpartDateHint,
  getTransactionDate,
  type TransactionDateBasis,
} from '../../utils/transactionDates'
import {
  Briefcase,
  Car,
  Clock,
  Coffee,
  CreditCard,
  Film,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from '../ui/icons'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  salary: Briefcase,
  freelance: Laptop,
  investments: TrendingUp,
  rental: Home,
  bonus: Sparkles,
  gifts: Gift,
  groceries: ShoppingCart,
  rent: Home,
  housing: Home,
  utilities: Zap,
  transport: Car,
  health: Heart,
  'dining out': Coffee,
  shopping: ShoppingBag,
  subscriptions: CreditCard,
  entertainment: Film,
  insurance: ShieldCheck,
  education: GraduationCap,
}

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

function getCategoryIcon(category?: string): LucideIcon {
  return CATEGORY_ICONS[category?.trim().toLowerCase() ?? ''] ?? Wallet
}

export interface TransactionLedgerRowProps {
  transaction: Transaction
  dateBasis?: TransactionDateBasis
  showDate?: boolean
  showCategory?: boolean
  withTopBorder?: boolean
}

export default function TransactionLedgerRow({
  transaction,
  dateBasis = 'activity',
  showDate = true,
  showCategory = true,
  withTopBorder = false,
}: TransactionLedgerRowProps) {
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const rowBorder = useColorModeValue('blackAlpha.50', 'whiteAlpha.50')
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const incomeAmount = useColorModeValue('green.600', 'green.300')
  const scheduledColor = useColorModeValue('orange.500', 'orange.300')
  const accountColor = useColorModeValue('gray.400', 'gray.500')
  const tileAlpha = useColorModeValue('1A', '2E')

  const isIncome = transaction.type === 'INCOME'
  const CategoryIcon = getCategoryIcon(transaction.category)
  const tint = isIncome ? '#10b981' : '#ef4444'
  const accountLabel = formatTransactionAccount(transaction)
  const isScheduled =
    transaction.isFutureInstallment ||
    transaction.status === 'PLANNED' ||
    transaction.status === 'PENDING'
  const dateHint = getCounterpartDateHint(transaction, dateBasis)

  return (
    <HStack
      role="group"
      position="relative"
      spacing={3}
      px={{ base: 3, sm: 4 }}
      py={{ base: 3, sm: 3.5 }}
      borderTop={withTopBorder ? '1px solid' : undefined}
      borderColor={rowBorder}
      _hover={{ bg: rowHoverBg }}
      transition="background 0.15s ease"
      align="center"
    >
      <Box
        position="absolute"
        left={0}
        top="18%"
        bottom="18%"
        w="3px"
        borderRightRadius="full"
        bg={isIncome ? 'green.400' : 'red.400'}
        opacity={0}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.15s ease"
      />

      <Flex
        w={10}
        h={10}
        borderRadius="xl"
        align="center"
        justify="center"
        bg={`${tint}${tileAlpha}`}
        color={tint}
        flexShrink={0}
        transition="transform 0.15s ease"
        _groupHover={{ transform: 'scale(1.06)' }}
      >
        <CategoryIcon size={18} weight="duotone" aria-hidden />
      </Flex>

      <VStack spacing={0.5} align="stretch" flex="1" minW={0}>
        <HStack spacing={1.5} minW={0}>
          <Text fontSize="sm" fontWeight={700} color={textColor} noOfLines={1}>
            {transaction.description || transaction.category || 'Transaction'}
          </Text>
          {transaction.isInstallment && (
            <Badge colorScheme="purple" variant="subtle" fontSize="9px" borderRadius="md">
              {transaction.installmentNumber
                ? `Inst. ${transaction.installmentNumber}`
                : 'Installment'}
            </Badge>
          )}
          {transaction.isRecurring && (
            <Badge colorScheme="blue" variant="subtle" fontSize="9px" borderRadius="md">
              Recurring
            </Badge>
          )}
        </HStack>

        <HStack spacing={1.5} color={mutedColor} fontSize="xs" minW={0}>
          {showCategory && (
            <Text noOfLines={1}>{transaction.category || 'Uncategorized'}</Text>
          )}
          {showCategory && showDate && <Text opacity={0.45}>·</Text>}
          {showDate && (
            <Text flexShrink={0}>
              {getTransactionDate(transaction, dateBasis).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          )}
          {transaction.paymentMethodName && (
            <>
              {(showCategory || showDate) && <Text opacity={0.45}>·</Text>}
              <Text noOfLines={1}>{transaction.paymentMethodName}</Text>
            </>
          )}
        </HStack>

        {accountLabel && (
          <Text
            fontSize="2xs"
            color={accountColor}
            noOfLines={1}
          >
            {accountLabel}
          </Text>
        )}
      </VStack>

      <VStack spacing={0.5} align="flex-end" flexShrink={0}>
        <Text
          color={isIncome ? incomeAmount : textColor}
          fontSize="sm"
          fontWeight={800}
          whiteSpace="nowrap"
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {isIncome ? '+' : '-'}
          {moneyFormatter.format(transaction.amount)}
        </Text>
        {isScheduled ? (
          <HStack spacing={1} color={scheduledColor}>
            <Icon as={Clock} boxSize={2.5} />
            <Text fontSize="2xs" fontWeight={600}>
              Scheduled
            </Text>
          </HStack>
        ) : dateHint ? (
          <Text fontSize="2xs" color={mutedColor}>
            {dateHint.prefix} {formatDateBR(dateHint.date)}
          </Text>
        ) : null}
      </VStack>
    </HStack>
  )
}
