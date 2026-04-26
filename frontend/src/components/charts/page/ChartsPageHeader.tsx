import {
  Box,
  Button,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { RotateCcw } from 'lucide-react'

interface ChartsPageHeaderProps {
  /** Pretty period label, e.g. `APR 2026`. */
  periodLabel: string
  /** Called when the user hits "Today". */
  onGoToToday: () => void
}

/**
 * Page header for the Charts & analytics page. Mirrors the visual contract
 * of `DashboardHeader` so navigating between the two feels seamless.
 */
export default function ChartsPageHeader({
  periodLabel,
  onGoToToday,
}: ChartsPageHeaderProps) {
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const pillBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const pillBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const pillColor = useColorModeValue('gray.600', 'gray.300')
  const dotColor = useColorModeValue('blue.500', 'blue.300')

  const ctaBg = useColorModeValue('white', 'whiteAlpha.50')
  const ctaBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const ctaColor = useColorModeValue('blue.600', 'blue.300')
  const ctaHoverBg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const ctaHoverBorder = useColorModeValue('blue.200', 'rgba(59,130,246,0.35)')

  return (
    <HStack
      w="full"
      align="center"
      justify="space-between"
      spacing={4}
      px={{ base: 1, sm: 2, md: 3 }}
      py={{ base: 1, md: 2 }}
    >
      <VStack align="flex-start" spacing={0.5} minW={0}>
        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight={700}
          color={titleColor}
          letterSpacing="-0.01em"
          noOfLines={1}
        >
          Charts &amp; analytics
        </Text>
        <Text
          fontSize={{ base: 'xs', md: 'sm' }}
          color={captionColor}
          fontWeight={500}
          noOfLines={1}
        >
          Visualise how money moves across your accounts.
        </Text>
      </VStack>

      <HStack spacing={2} flexShrink={0}>
        <HStack
          spacing={2}
          bg={pillBg}
          border="1px solid"
          borderColor={pillBorder}
          borderRadius="full"
          px={3}
          py={1.5}
          display={{ base: 'none', md: 'flex' }}
        >
          <Box w="6px" h="6px" borderRadius="full" bg={dotColor} />
          <Text fontSize="xs" fontWeight={600} color={pillColor} noOfLines={1}>
            {periodLabel}
          </Text>
        </HStack>

        <Button
          size="sm"
          h="36px"
          px={3.5}
          borderRadius="lg"
          bg={ctaBg}
          color={ctaColor}
          border="1px solid"
          borderColor={ctaBorder}
          fontWeight={600}
          fontSize="sm"
          leftIcon={<Icon as={RotateCcw} boxSize={3.5} strokeWidth={2.25} />}
          onClick={onGoToToday}
          transition="background-color 0.15s ease, border-color 0.15s ease"
          _hover={{ bg: ctaHoverBg, borderColor: ctaHoverBorder }}
          _focusVisible={{
            outline: '2px solid',
            outlineColor: 'blue.300',
            outlineOffset: '2px',
          }}
        >
          Today
        </Button>
      </HStack>
    </HStack>
  )
}
