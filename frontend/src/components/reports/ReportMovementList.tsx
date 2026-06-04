import { useMemo } from 'react'
import { Badge, Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { formatCurrency, formatDate } from './format'
import type { ReportResponse, ReportTransactionItem } from '../../types'

/**
 * The report JSON exposes only the top income/expense movements (not the full
 * period ledger), so this list merges and date-sorts those two arrays.
 */
function useTopMovements(report: ReportResponse): ReportTransactionItem[] {
  return useMemo(
    () =>
      [...report.topIncome, ...report.topExpenses].sort((a, b) =>
        b.paymentDate.localeCompare(a.paymentDate),
      ),
    [report.topIncome, report.topExpenses],
  )
}

export default function ReportMovementList({ report }: { report: ReportResponse }) {
  const movements = useTopMovements(report)

  return (
    <Box
      className="avoid-break"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="2xl"
      p={6}
    >
      <HStack justify="space-between" align="baseline" mb={4}>
        <Text fontSize="sm" fontWeight={800} color="gray.900">
          Top movements
        </Text>
        <Text fontSize="xs" color="gray.500">
          Largest income and expenses
        </Text>
      </HStack>

      {movements.length === 0 ? (
        <Text fontSize="sm" color="gray.500">
          No income or expense movement in this period.
        </Text>
      ) : (
        <VStack align="stretch" spacing={0}>
          {movements.map((tx, index) => {
            const isIncome = tx.type === 'INCOME'
            return (
              <Flex
                key={tx.id}
                align="center"
                justify="space-between"
                gap={4}
                py={3}
                borderTop={index === 0 ? undefined : '1px solid'}
                borderColor="gray.100"
              >
                <HStack spacing={3} minW={0} align="center">
                  <Box
                    w={2}
                    h={2}
                    borderRadius="full"
                    flexShrink={0}
                    bg={isIncome ? 'green.400' : 'red.400'}
                  />
                  <VStack align="flex-start" spacing={0.5} minW={0}>
                    <HStack spacing={2} minW={0}>
                      <Text fontSize="sm" fontWeight={700} color="gray.800" noOfLines={1}>
                        {tx.description?.trim() || tx.category}
                      </Text>
                      {tx.installment ? (
                        <Badge colorScheme="purple" variant="subtle" fontSize="9px" borderRadius="md">
                          Installment
                        </Badge>
                      ) : null}
                      {tx.recurring ? (
                        <Badge colorScheme="blue" variant="subtle" fontSize="9px" borderRadius="md">
                          Recurring
                        </Badge>
                      ) : null}
                    </HStack>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {formatDate(tx.paymentDate)} · {tx.category}
                      {tx.paymentMethodName ? ` · ${tx.paymentMethodName}` : ''}
                    </Text>
                  </VStack>
                </HStack>
                <Text
                  fontSize="sm"
                  fontWeight={800}
                  flexShrink={0}
                  color={isIncome ? 'green.600' : 'red.600'}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </Text>
              </Flex>
            )
          })}
        </VStack>
      )}
    </Box>
  )
}
