import { Box, Text } from '@chakra-ui/react'

export type KpiTone = 'income' | 'expense' | 'positive' | 'negative' | 'neutral'

const TONE: Record<KpiTone, { value: string; bar: string }> = {
  income: { value: 'green.600', bar: 'green.400' },
  expense: { value: 'red.600', bar: 'red.400' },
  positive: { value: 'green.600', bar: 'green.400' },
  negative: { value: 'red.600', bar: 'red.400' },
  neutral: { value: 'gray.900', bar: 'blue.400' },
}

interface ReportKpiCardProps {
  label: string
  value: string
  detail: string
  tone: KpiTone
}

export default function ReportKpiCard({ label, value, detail, tone }: ReportKpiCardProps) {
  const palette = TONE[tone]
  return (
    <Box
      className="avoid-break"
      position="relative"
      overflow="hidden"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="2xl"
      px={5}
      py={4}
      minH="112px"
    >
      <Box position="absolute" top={0} left={0} w="3px" h="full" bg={palette.bar} />
      <Text
        fontSize="11px"
        letterSpacing="0.08em"
        fontWeight={700}
        textTransform="uppercase"
        color="gray.500"
      >
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight={800} color={palette.value} mt={1.5} lineHeight={1.1} noOfLines={1}>
        {value}
      </Text>
      <Text fontSize="xs" color="gray.500" mt={1.5} noOfLines={1}>
        {detail}
      </Text>
    </Box>
  )
}
