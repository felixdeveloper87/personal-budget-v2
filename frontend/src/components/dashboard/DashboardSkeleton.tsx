import {
  Box,
  Skeleton,
  SimpleGrid,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEd } from '../../editorial'

interface SkeletonShellProps {
  height: string | number
}

function SkeletonShell({ height }: SkeletonShellProps) {
  const ed = useEd()
  const surfaceBgBase = useColorModeValue('#ffffff', '#0a0a0a')
  const surfaceBg = ed ? ed.panel : surfaceBgBase
  const borderColorBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const borderColor = ed ? ed.line : borderColorBase

  return (
    <Box
      w="full"
      h={height}
      bg={surfaceBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      p={5}
      sx={
        ed
          ? {
              '--skeleton-start-color': ed.controlBg,
              '--skeleton-end-color': ed.lineStrong,
            }
          : undefined
      }
    >
      <VStack align="stretch" spacing={3} h="full" justify="space-between">
        <Skeleton height="20px" width="40%" borderRadius="md" />
        <Skeleton height="14px" width="65%" borderRadius="md" />
        <Skeleton height="32px" width="100%" borderRadius="lg" mt="auto" />
      </VStack>
    </Box>
  )
}

/**
 * Calm skeleton state for the dashboard. Replaces the giant centred spinner
 * that used to flash every time data refreshed.
 */
export default function DashboardSkeleton() {
  return (
    <VStack spacing={2} align="stretch" w="full">
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={2}>
        <SkeletonShell height="140px" />
        <SkeletonShell height="140px" />
      </SimpleGrid>

      <SkeletonShell height="120px" />

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={2}>
        <SkeletonShell height="170px" />
        <SkeletonShell height="170px" />
        <SkeletonShell height="170px" />
        <SkeletonShell height="170px" />
      </SimpleGrid>

      <SkeletonShell height="320px" />
    </VStack>
  )
}
