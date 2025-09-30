import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Progress, 
  Badge, 
  Divider, 
  useColorModeValue 
} from '@chakra-ui/react'

interface SummaryChartProps {
  income: number
  expense: number
  balance: number
  selectedPeriod: string
}

export default function SummaryChart({ income, expense, balance, selectedPeriod }: SummaryChartProps) {
  const total = income + expense
  const incomePercentage = total > 0 ? (income / total) * 100 : 0
  const expensePercentage = total > 0 ? (expense / total) * 100 : 0

  const textPrimary = useColorModeValue("gray.700", "gray.300")
  const textSecondary = useColorModeValue("gray.500", "gray.400")

  return (
    <VStack spacing={{ base: 4, md: 6 }} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
        <Text 
          fontSize={{ base: "md", md: "lg" }} 
          fontWeight="semibold" 
          color={useColorModeValue("gray.800", "gray.100")}
        >
          Financial Overview ({selectedPeriod})
        </Text>
        <Badge 
          colorScheme={balance >= 0 ? "green" : "red"} 
          fontSize="sm" 
          px={2} 
          py={1}
        >
          {balance >= 0 ? "Positive" : "Negative"} Balance
        </Badge>
      </HStack>

      {/* Income vs Expense Bars */}
      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
        {/* Income */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <HStack spacing={2}>
              <Box w={3} h={3} bg="green.500" borderRadius="sm" />
              <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                Income
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="semibold" color="green.600">
              £{income.toFixed(2)}
            </Text>
          </HStack>
          <Progress
            value={incomePercentage}
            colorScheme="green"
            size="md"
            borderRadius="md"
            bg={useColorModeValue("gray.100", "gray.700")}
          />
          <Text fontSize="xs" color={textSecondary} mt={1}>
            {incomePercentage.toFixed(1)}% of total
          </Text>
        </Box>

        {/* Expenses */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <HStack spacing={2}>
              <Box w={3} h={3} bg="red.500" borderRadius="sm" />
              <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                Expenses
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="semibold" color="red.600">
              £{expense.toFixed(2)}
            </Text>
          </HStack>
          <Progress
            value={expensePercentage}
            colorScheme="red"
            size="md"
            borderRadius="md"
            bg={useColorModeValue("gray.100", "gray.700")}
          />
          <Text fontSize="xs" color={textSecondary} mt={1}>
            {expensePercentage.toFixed(1)}% of total
          </Text>
        </Box>
      </VStack>

      <Divider />

      {/* Balance Summary */}
      <Box 
        p={{ base: 3, md: 4 }}
        bg={balance >= 0 
          ? useColorModeValue("green.50", "green.900") 
          : useColorModeValue("red.50", "red.900")}
        borderRadius="md"
        border="1px solid"
        borderColor={balance >= 0 
          ? useColorModeValue("green.200", "green.700") 
          : useColorModeValue("red.200", "red.700")}
      >
        <VStack spacing={2}>
          <Text fontSize="sm" fontWeight="semibold" color={textPrimary}>
            Net Balance
          </Text>
          <Text 
            fontSize={{ base: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color={balance >= 0 ? "green.600" : "red.600"}
          >
            £{balance.toFixed(2)}
          </Text>
          <Text fontSize="xs" color={textSecondary} textAlign="center">
            {balance >= 0 
              ? `You have £${balance.toFixed(2)} more income than expenses`
              : `You have £${Math.abs(balance).toFixed(2)} more expenses than income`}
          </Text>
        </VStack>
      </Box>
    </VStack>
  )
}
