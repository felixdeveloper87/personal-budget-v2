import { Box } from '@chakra-ui/react'
import { PeriodNavigator, PeriodType } from '../components'

// 🎨 Animações personalizadas
const shimmer = 'shimmer 3s ease-in-out infinite'

interface PeriodNavigatorSectionProps {
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
  label: string
}

/**
 * 🗓️ PeriodNavigatorSection
 * - Wrapper section for the PeriodNavigator component
 * - Maintains consistent section structure with AddTransactionSection
 * - Handles period selection and navigation logic
 */
export default function PeriodNavigatorSection({
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
  label,
}: PeriodNavigatorSectionProps) {
  return (
    <Box position="relative">
      {/* Barra colorida animada no topo */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="3px"
        background="linear-gradient(90deg, #22c55e, #3b82f6, #ef4444, #8b5cf6)"
        backgroundSize="200% 100%"
        borderRadius="2xl 2xl 0 0"
        zIndex={1}
        sx={{
          animation: `${shimmer} 3s ease-in-out infinite`,
        }}
      />
      <PeriodNavigator
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        onPeriodChange={onPeriodChange}
        periodLabel={label}
      />
    </Box>
  )
}
