import { Box, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { formatCurrency } from './format'
import type { ReportResponse } from '../../types'

function CommitmentTile({
  label,
  value,
  caption,
  accent,
}: {
  label: string
  value: string
  caption: string
  accent: string
}) {
  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={4}>
      <Text fontSize="11px" fontWeight={700} letterSpacing="0.08em" textTransform="uppercase" color="gray.500">
        {label}
      </Text>
      <Text fontSize="xl" fontWeight={800} color={accent} mt={1.5} noOfLines={1}>
        {value}
      </Text>
      <Text fontSize="xs" color="gray.500" mt={1}>
        {caption}
      </Text>
    </Box>
  )
}

export default function ReportCommitments({ report }: { report: ReportResponse }) {
  return (
    <Box
      className="avoid-break"
      h="full"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="2xl"
      p={6}
    >
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontSize="sm" fontWeight={800} color="gray.900">
            Commitments
          </Text>
          <Text fontSize="xs" color="gray.500" mt={0.5}>
            Installments and fixed payments
          </Text>
        </Box>
        <SimpleGrid columns={2} spacing={3}>
          <CommitmentTile
            label="Installments"
            value={formatCurrency(report.installmentExpenseTotal)}
            caption="Expense from installments"
            accent="purple.600"
          />
          <CommitmentTile
            label="Recurring"
            value={formatCurrency(report.recurringExpenseTotal)}
            caption="Expense from fixed payments"
            accent="blue.600"
          />
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
