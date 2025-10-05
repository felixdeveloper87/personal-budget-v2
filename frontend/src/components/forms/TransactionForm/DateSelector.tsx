import { Box, Text, Input, Button, Wrap, WrapItem } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface DateSelectorProps {
  date: string
  onChange: (d: string) => void
}

export default function DateSelector({ date, onChange }: DateSelectorProps) {
  const colors = useThemeColors()

  const quickDates = (() => {
    const today = new Date()
    const d = (offset: number) => {
      const nd = new Date(today)
      nd.setDate(today.getDate() + offset)
      return nd
    }
    return [
      { label: 'Today', date: today },
      { label: 'Yesterday', date: d(-1) },
      { label: 'Tomorrow', date: d(1) },
      { label: 'Week ago', date: d(-7) },
    ]
  })()

  return (
    <Box>
      <Text fontWeight="600" mb={3} color={colors.text.label}>
        Date
      </Text>
      <Input
        type="date"
        value={date}
        onChange={(e) => onChange(e.target.value)}
        size="lg"
        borderRadius="xl"
        border="2px"
        borderColor={colors.border}
        _focus={{ borderColor: colors.accent }}
      />
      <Wrap mt={3} spacing={2}>
        {quickDates.map((qd) => (
          <WrapItem key={qd.label}>
            <Button
              size="sm"
              variant={date === qd.date.toISOString().slice(0, 10) ? 'solid' : 'outline'}
              colorScheme="blue"
              borderRadius="full"
              onClick={() => onChange(qd.date.toISOString().slice(0, 10))}
            >
              {qd.label}
            </Button>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}
