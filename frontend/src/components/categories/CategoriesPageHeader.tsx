import {
  Box,
  Button,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { RotateCcw } from '../ui/icons'

interface CategoriesPageHeaderProps {
  /** Pretty period label, e.g. `APR 2026`. */
  periodLabel: string
  /** Called when the user hits "Today". */
  onGoToToday: () => void
}

/**
 * Page header for the Categories page. Mirrors the visual contract of
 * `DashboardHeader` so navigating between them feels seamless.
 */
export default function CategoriesPageHeader({
  periodLabel,
  onGoToToday,
}: CategoriesPageHeaderProps) {
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const pillBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const pillBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const pillColor = useColorModeValue('gray.600', 'gray.300')
  const dotColor = useColorModeValue('purple.500', 'purple.300')

  const ctaBg = useColorModeValue('white', 'whiteAlpha.50')
  const ctaBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const ctaColor = useColorModeValue('purple.600', 'purple.300')
  const ctaHoverBg = useColorModeValue('purple.50', 'whiteAlpha.100')
  const ctaHoverBorder = useColorModeValue(
    'purple.200',
    'rgba(139,92,246,0.35)',
  )

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
          Categories
        </Text>
        <Text
          fontSize={{ base: 'xs', md: 'sm' }}
          color={captionColor}
          fontWeight={500}
          noOfLines={1}
        >
          See where every pound is going, broken down by category.
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
            outlineColor: 'purple.300',
            outlineOffset: '2px',
          }}
        >
          Today
        </Button>
      </HStack>
    </HStack>
  )
}
