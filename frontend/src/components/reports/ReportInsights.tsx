import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { Sparkle } from 'lucide-react'

export default function ReportInsights({ insights }: { insights: string[] }) {
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
        Executive summary
      </Text>

      {insights.length === 0 ? (
        <Text fontSize="sm" color="gray.500">
          No insights are available for this period yet.
        </Text>
      ) : (
        <VStack align="stretch" spacing={3.5}>
          {insights.map((insight) => (
            <HStack key={insight} align="flex-start" spacing={3}>
              <Flex
                w={6}
                h={6}
                mt="1px"
                flexShrink={0}
                borderRadius="lg"
                align="center"
                justify="center"
                bg="purple.50"
                color="purple.500"
              >
                <Sparkle size={13} />
              </Flex>
              <Text fontSize="sm" color="gray.700" lineHeight={1.55}>
                {insight}
              </Text>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  )
}
