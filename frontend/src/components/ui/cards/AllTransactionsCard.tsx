import { Box, HStack, Heading, Text, Switch, FormControl, FormLabel, VStack, Divider } from '@chakra-ui/react'
import { ReactNode, useState } from 'react'

interface AllTransactionsCardProps {
  title: string
  count: number
  children: ReactNode
  filtered?: boolean
  groupByMonth?: boolean
  onGroupByMonthChange?: (grouped: boolean) => void
}

export default function AllTransactionsCard({
  title,
  count,
  children,
  filtered = false,
  groupByMonth = false,
  onGroupByMonthChange,
}: AllTransactionsCardProps) {
  const [isGrouped, setIsGrouped] = useState(groupByMonth)

  const handleToggle = () => {
    const newValue = !isGrouped
    setIsGrouped(newValue)
    onGroupByMonthChange?.(newValue)
  }

  return (
    <Box
      p={4}
      rounded="2xl"
      borderWidth="1px"
      shadow="lg"
      bg="linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)"
      _dark={{ bg: '#111111' }}
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">
            {filtered ? `Filtered ${title}` : title}
          </Heading>
          <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
            {count} transactions
          </Text>
        </HStack>

        <HStack justify="space-between" align="center">
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="group-by-month" mb="0" fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              Group by month
            </FormLabel>
            <Switch
              id="group-by-month"
              isChecked={isGrouped}
              onChange={handleToggle}
              colorScheme="blue"
              size="sm"
            />
          </FormControl>
        </HStack>

        <Divider />

        {children}
      </VStack>
    </Box>
  )
}
