import { useMemo } from 'react'
import { Badge, Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../../i18n'
import { useReportFormat } from './useReportFormat'
import type { ReportResponse, ReportTransactionItem } from '../../types'

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
  const { t } = useI18n()
  const { accountMovement, categoryLabel, currency, date } = useReportFormat()
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
          {t('reports.topMovements')}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {t('reports.topMovementsCaption')}
        </Text>
      </HStack>

      {movements.length === 0 ? (
        <Text fontSize="sm" color="gray.500">
          {t('reports.noMovements')}
        </Text>
      ) : (
        <VStack align="stretch" spacing={0}>
          {movements.map((transaction, index) => {
            const isIncome = transaction.type === 'INCOME'
            const movementLabel = accountMovement(transaction)
            return (
              <Flex
                key={transaction.id}
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
                        {transaction.description?.trim() || categoryLabel(transaction.category)}
                      </Text>
                      {transaction.installment ? (
                        <Badge colorScheme="purple" variant="subtle" fontSize="9px" borderRadius="md">
                          {t('reports.installment')}
                        </Badge>
                      ) : null}
                      {transaction.recurring ? (
                        <Badge colorScheme="blue" variant="subtle" fontSize="9px" borderRadius="md">
                          {t('reports.recurring')}
                        </Badge>
                      ) : null}
                    </HStack>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {date(transaction.paymentDate)} — {categoryLabel(transaction.category)}
                    </Text>
                    {movementLabel ? (
                      <Text fontSize="xs" color="blue.600" noOfLines={1}>
                        {movementLabel}
                      </Text>
                    ) : null}
                  </VStack>
                </HStack>
                <Text
                  fontSize="sm"
                  fontWeight={800}
                  flexShrink={0}
                  color={isIncome ? 'green.600' : 'red.600'}
                >
                  {isIncome ? '+' : '-'}
                  {currency(transaction.amount)}
                </Text>
              </Flex>
            )
          })}
        </VStack>
      )}
    </Box>
  )
}
