import { Box, Flex, VStack } from '@chakra-ui/react'
import { LineChart } from 'lucide-react'
import PeriodNavigator from './PeriodNavigator'
import { PeriodType } from '../../types'
import { SectionCard, SectionHeader } from '../ui'

interface SummaryHeaderProps {
  selectedPeriod: PeriodType
  selectedDate?: Date
  onPeriodChange: (period: PeriodType) => void
  onNavigatePeriod: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
  formatLabel: () => string
}

export default function SummaryHeader({
  selectedPeriod,
  selectedDate,
  onPeriodChange,
  onNavigatePeriod,
  onGoToToday,
  formatLabel,
}: SummaryHeaderProps) {
  return (
    <SectionCard>
      <Flex
        direction={{ base: 'column', xl: 'row' }}
        align={{ base: 'stretch', xl: 'center' }}
        justify="space-between"
        gap={{ base: 3, md: 4 }}
        p={{ base: 4, sm: 5 }}
        w="full"
      >
        <Box flexShrink={0} maxW={{ xl: '320px' }} w={{ base: 'full', xl: 'auto' }}>
          <SectionHeader
            icon={LineChart}
            title="Overview"
            caption="Your financial pulse for the selected period"
            accent="blue"
          />
        </Box>

        <VStack spacing={3} align="stretch" flex={1} w="full">
          <PeriodNavigator
            selectedPeriod={selectedPeriod}
            selectedDate={selectedDate}
            onPeriodChange={onPeriodChange}
            onNavigatePeriod={onNavigatePeriod}
            onGoToToday={onGoToToday}
            formatLabel={formatLabel}
            isEmbedded
          />
        </VStack>
      </Flex>
    </SectionCard>
  )
}
