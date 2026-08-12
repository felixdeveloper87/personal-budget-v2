import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import type { ReportCategoryBreakdown } from '../../types'
import { useI18n } from '../../i18n'
import { useReportFormat } from './useReportFormat'

interface ReportCategoryListProps {
  title: string
  items: ReportCategoryBreakdown[]
  tone: 'income' | 'expense'
}

export default function ReportCategoryList({ title, items, tone }: ReportCategoryListProps) {
  const { t } = useI18n()
  const { categoryLabel, count, currency } = useReportFormat()
  const fill = tone === 'income' ? 'green.400' : 'red.400'

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
      <Text fontSize="sm" fontWeight={800} color="gray.900" mb={4}>
        {title}
      </Text>

      {items.length === 0 ? (
        <Text fontSize="sm" color="gray.500">
          {t('reports.noPeriodData')}
        </Text>
      ) : (
        <VStack align="stretch" spacing={4}>
          {items.slice(0, 6).map((item) => (
            <Box key={item.category}>
              <HStack justify="space-between" align="baseline" spacing={3} mb={1.5}>
                <Text fontSize="sm" fontWeight={700} color="gray.800" noOfLines={1}>
                  {categoryLabel(item.category)}
                </Text>
                <Text fontSize="sm" fontWeight={700} color="gray.900" flexShrink={0}>
                  {item.percentage}%
                </Text>
              </HStack>
              <Box h="7px" bg="gray.100" borderRadius="full" overflow="hidden">
                <Box h="full" w={`${Math.min(item.percentage, 100)}%`} bg={fill} borderRadius="full" />
              </Box>
              <Flex justify="space-between" mt={1.5}>
                <Text fontSize="xs" color="gray.500">
                  {currency(item.amount)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {count(item.transactionCount, 'record')}
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  )
}
