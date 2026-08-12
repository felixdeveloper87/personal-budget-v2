import { Box, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import type { ReportResponse } from '../../types'
import { useI18n } from '../../i18n'
import { useReportFormat } from './useReportFormat'

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
  const { t } = useI18n()
  const { currency } = useReportFormat()
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
            {t('reports.commitments')}
          </Text>
          <Text fontSize="xs" color="gray.500" mt={0.5}>
            {t('reports.installmentsAndFixed')}
          </Text>
        </Box>
        <SimpleGrid columns={2} spacing={3}>
          <CommitmentTile
            label={t('reports.installments')}
            value={currency(report.installmentExpenseTotal)}
            caption={t('reports.expenseFromInstallments')}
            accent="purple.600"
          />
          <CommitmentTile
            label={t('reports.recurring')}
            value={currency(report.recurringExpenseTotal)}
            caption={t('reports.expenseFromFixed')}
            accent="blue.600"
          />
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
