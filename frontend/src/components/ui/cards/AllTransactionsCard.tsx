import { Box, HStack, Heading, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface AllTransactionsCardProps {
  title: string
  count: number
  children: ReactNode
  filtered?: boolean
}

export default function AllTransactionsCard({
  title,
  count,
  children,
  filtered = false,
}: AllTransactionsCardProps) {
  return (
    <Box
      p={4}
      rounded="2xl"
      borderWidth="1px"
      shadow="lg"
      bg="white"
      _dark={{ bg: '#111111' }}
    >
      <HStack justify="space-between" mb={6}>
        <Heading size="md">
          {filtered ? `Filtered ${title}` : title}
        </Heading>
        <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
          {count} transactions
        </Text>
      </HStack>
      {children}
    </Box>
  )
}
