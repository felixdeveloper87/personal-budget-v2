import {
  Box,
  Skeleton,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'

interface SkeletonShellProps {
  height: string | number
}

function SkeletonShell({ height }: SkeletonShellProps) {
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  return (
    <Box
      w="full"
      h={height}
      bg={surfaceBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      p={5}
    >
      <VStack align="stretch" spacing={3} h="full">
        <Skeleton height="20px" width="35%" borderRadius="md" />
        <Skeleton height="14px" width="55%" borderRadius="md" />
        <Box flex={1} mt={2}>
          <Skeleton height="100%" borderRadius="lg" />
        </Box>
      </VStack>
    </Box>
  )
}

/**
 * Calm skeleton displayed while charts load. Replaces the centred spinner
 * that used to flash on every refresh.
 */
export default function ChartsPageSkeleton() {
  return (
    <VStack spacing={{ base: 3, md: 4 }} align="stretch" w="full">
      <SkeletonShell height="120px" />
      <SkeletonShell height="320px" />
      <SkeletonShell height="320px" />
      <SkeletonShell height="320px" />
      <SkeletonShell height="320px" />
    </VStack>
  )
}
