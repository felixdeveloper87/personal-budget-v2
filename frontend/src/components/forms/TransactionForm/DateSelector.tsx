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
        size="lg"
        h={{ base: '56px', sm: '48px' }}
        borderRadius="xl"
        border="2px"
        borderColor={colors.border}
        _focus={{ borderColor: colors.accent, shadow: 'md' }}
        _hover={{ borderColor: colors.accent }}
        fontSize={{ base: 'lg', sm: 'md' }}
        fontWeight="600"
        aria-label="Select date" // ♿ Accessibility: describes input purpose
        transition="all 0.2s"
      />

      {/* Quick date buttons */}
      <Wrap mt={{ base: 4, sm: 3 }} spacing={{ base: 2, sm: 2 }} justify="center">
        {quickDates.map((qd) => (
          <WrapItem key={qd.label}>
            <Button
              aria-label={`Select ${qd.label.toLowerCase()} date`} // ♿ Accessibility
              size={{ base: 'lg', sm: 'md' }}
              h={{ base: '48px', sm: '40px' }}
              variant={
                date === qd.date.toISOString().slice(0, 10) ? 'solid' : 'outline'
              }
              colorScheme="blue"
              borderRadius="xl"
              borderWidth="2px"
              onClick={() =>
                onChange(qd.date.toISOString().slice(0, 10))
              }
              fontSize={{ base: 'md', sm: 'sm' }}
              fontWeight="bold"
              px={{ base: 6, sm: 5 }}
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'md',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              {qd.label}
            </Button>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}
