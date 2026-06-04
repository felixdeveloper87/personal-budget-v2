import { Box, Flex, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { formatCurrency, pluralize } from './format'
import type { ReportPaymentMethodBreakdown } from '../../types'

export default function ReportPaymentMethodList({
  items,
}: {
  items: ReportPaymentMethodBreakdown[]
}) {
  return (
    <Box
      className="avoid-break"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="2xl"
      p={6}
    >
      <Text fontSize="sm" fontWeight={800} color="gray.900" mb={4}>
        Payment breakdown
      </Text>

      {items.length === 0 ? (
        <Text fontSize="sm" color="gray.500">
          No expense payment methods in this period.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={8} spacingY={4}>
          {items.slice(0, 8).map((item) => (
            <Box key={item.name}>
              <HStack justify="space-between" align="baseline" spacing={3} mb={1.5}>
                <Text fontSize="sm" fontWeight={700} color="gray.800" noOfLines={1}>
                  {item.name}
                </Text>
                <Text fontSize="sm" fontWeight={700} color="gray.900" flexShrink={0}>
                  {item.percentage}%
                </Text>
              </HStack>
              <Box h="7px" bg="gray.100" borderRadius="full" overflow="hidden">
                <Box h="full" w={`${Math.min(item.percentage, 100)}%`} bg="blue.400" borderRadius="full" />
              </Box>
              <Flex justify="space-between" mt={1.5}>
                <Text fontSize="xs" color="gray.500">
                  {formatCurrency(item.amount)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {pluralize(item.transactionCount, 'payment')}
                </Text>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  )
}
