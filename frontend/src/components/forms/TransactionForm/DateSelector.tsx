import { Box, Text, Input, Button, Wrap, WrapItem } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface DateSelectorProps {
  date: string
  onChange: (d: string) => void
}

/**
 * 📅 DateSelector Component
 * - Displays a date input field and a set of quick-select buttons (Today, Yesterday, etc.)
 * - Helps users quickly choose or manually adjust a transaction date
 */
export default function DateSelector({ date, onChange }: DateSelectorProps) {
  const colors = useThemeColors()

  // 🔹 Predefined quick date shortcuts relative to today
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
      {/* Field label */}
      <Text fontWeight="600" mb={3} color={colors.text.label}>
        Date
      </Text>

      {/* Date input field */}
      <Input
        type="date"
        value={date}
        onChange={(e) => onChange(e.target.value)}
        size={{ base: 'xl', sm: 'lg' }}
        h={{ base: '60px', sm: '48px' }}
        borderRadius="xl"
        border="2px"
        borderColor={colors.border}
        _focus={{ borderColor: colors.accent }}
        fontSize={{ base: 'lg', sm: 'md' }}
        aria-label="Select date" // ♿ Accessibility: describes input purpose
      />

      {/* Quick date buttons */}
      <Wrap mt={{ base: 4, sm: 3 }} spacing={{ base: 3, sm: 2 }}>
        {quickDates.map((qd) => (
          <WrapItem key={qd.label}>
            <Button
              aria-label={`Select ${qd.label.toLowerCase()} date`} // ♿ Accessibility
              size={{ base: 'md', sm: 'sm' }}
              h={{ base: '45px', sm: '36px' }}
              variant={
                date === qd.date.toISOString().slice(0, 10) ? 'solid' : 'outline'
              }
              colorScheme="blue"
              borderRadius="full"
              onClick={() =>
                onChange(qd.date.toISOString().slice(0, 10))
              }
              fontSize={{ base: 'md', sm: 'sm' }}
              fontWeight="bold"
              px={{ base: 6, sm: 4 }}
            >
              {qd.label}
            </Button>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}
