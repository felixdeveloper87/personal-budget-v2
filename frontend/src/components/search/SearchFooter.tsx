import { Button, HStack, Icon, useColorModeValue } from '@chakra-ui/react'
import { ArrowRight, RotateCcw } from 'lucide-react'

interface SearchFooterProps {
  onClearAll: () => void
  onSearch: () => void
  /** Whether the user has any active filter — drives the Reset disabled state. */
  hasFilters?: boolean
}

export default function SearchFooter({
  onClearAll,
  onSearch,
  hasFilters = true,
}: SearchFooterProps) {
  const resetBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const resetColor = useColorModeValue('gray.700', 'gray.300')
  const resetHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')

  return (
    <HStack spacing={3} justify="space-between" w="full">
      <Button
        variant="outline"
        h="44px"
        px={4}
        fontSize="sm"
        fontWeight={600}
        borderRadius="lg"
        borderColor={resetBorder}
        color={resetColor}
        leftIcon={<Icon as={RotateCcw} boxSize={3.5} />}
        isDisabled={!hasFilters}
        onClick={onClearAll}
        _hover={{ bg: resetHoverBg }}
        _disabled={{ opacity: 0.5, cursor: 'not-allowed', _hover: { bg: 'transparent' } }}
        transition="background-color 0.15s ease, border-color 0.15s ease"
      >
        Reset
      </Button>

      <Button
        h="44px"
        px={6}
        fontSize="sm"
        fontWeight={700}
        color="white"
        borderRadius="lg"
        bg="linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)"
        bgSize="200% 100%"
        bgPosition="0% 50%"
        boxShadow="0 8px 24px -10px rgba(79, 70, 229, 0.55)"
        rightIcon={<Icon as={ArrowRight} boxSize={4} />}
        onClick={onSearch}
        _hover={{
          bgPosition: '100% 50%',
          transform: 'translateY(-1px)',
          boxShadow: '0 12px 30px -10px rgba(79, 70, 229, 0.65)',
        }}
        _active={{ transform: 'translateY(0)' }}
        transition="background-position 0.3s ease, transform 0.15s ease, box-shadow 0.2s ease"
      >
        Show results
      </Button>
    </HStack>
  )
}
