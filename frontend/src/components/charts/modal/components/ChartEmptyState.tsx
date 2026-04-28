import {
  Box,
  Center,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { LucideIcon } from '../../../ui/icons'
import { BarChart3 } from '../../../ui/icons'

export interface ChartEmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
}

/**
 * Shown when there is nothing to plot. Replaces the old spinner + “Loading…”
 * copy that was misleading for empty datasets.
 */
export default function ChartEmptyState({
  title = 'No data for this period',
  description = 'Try another date range or add a transaction.',
  icon: IconComponent = BarChart3,
}: ChartEmptyStateProps) {
  const surfaceBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const surfaceBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const iconBg = useColorModeValue('white', 'whiteAlpha.100')
  const iconColor = useColorModeValue('gray.400', 'gray.500')
  const titleColor = useColorModeValue('gray.800', 'gray.100')
  const descColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <Center
      py={{ base: 10, md: 14 }}
      px={4}
      borderRadius="xl"
      border="1px dashed"
      borderColor={surfaceBorder}
      bg={surfaceBg}
    >
      <VStack spacing={3} maxW="sm" textAlign="center">
        <Box
          w={12}
          h={12}
          borderRadius="xl"
          bg={iconBg}
          border="1px solid"
          borderColor={surfaceBorder}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={IconComponent} boxSize={6} color={iconColor} strokeWidth={1.75} />
        </Box>
        <Text fontSize="sm" fontWeight={700} color={titleColor}>
          {title}
        </Text>
        <Text fontSize="xs" color={descColor} lineHeight="1.5">
          {description}
        </Text>
      </VStack>
    </Center>
  )
}
