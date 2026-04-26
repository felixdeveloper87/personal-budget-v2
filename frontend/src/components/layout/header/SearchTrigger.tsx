import {
  Box,
  Button,
  HStack,
  IconButton,
  Kbd,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

interface SearchTriggerProps {
  onOpen: () => void
  /**
   * `compact` — square icon button. Mobile/tablet.
   * `expanded` — full pill with hint and shortcut. Desktop (lg+).
   */
  variant: 'compact' | 'expanded'
}

export default function SearchTrigger({ onOpen, variant }: SearchTriggerProps) {
  const bg = useColorModeValue('white', 'whiteAlpha.100')
  const border = useColorModeValue('gray.200', 'whiteAlpha.300')
  const color = useColorModeValue('gray.600', 'gray.200')
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.200')
  const hoverBorder = useColorModeValue('blue.300', 'blue.400')
  const hoverColor = useColorModeValue('gray.900', 'white')
  const hintBg = useColorModeValue('gray.100', 'whiteAlpha.200')
  const hintBorder = useColorModeValue('gray.300', 'whiteAlpha.300')
  const hintColor = useColorModeValue('gray.600', 'gray.300')

  if (variant === 'compact') {
    return (
      <Tooltip label="Search (Ctrl+K)" hasArrow openDelay={300}>
        <IconButton
          aria-label="Open search"
          icon={<SearchIcon boxSize={4} />}
          onClick={onOpen}
          variant="ghost"
          h="40px"
          w="40px"
          minW="40px"
          borderRadius="xl"
          border="1px solid"
          borderColor={border}
          bg={bg}
          color={color}
          boxShadow="0 1px 2px rgba(15, 23, 42, 0.04)"
          transition="all 0.2s ease"
          _hover={{
            bg: hoverBg,
            borderColor: hoverBorder,
            color: hoverColor,
            transform: 'translateY(-1px)',
          }}
          _active={{ transform: 'translateY(0)' }}
          _focusVisible={{
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)',
          }}
        />
      </Tooltip>
    )
  }

  return (
    <Box flexShrink={1} minW={0}>
      <Button
        onClick={onOpen}
        leftIcon={<SearchIcon boxSize={4} />}
        variant="ghost"
        h="40px"
        px={3.5}
        bg={bg}
        border="1px solid"
        borderColor={border}
        borderRadius="xl"
        color={color}
        fontWeight={500}
        w={{ lg: '220px', xl: '260px' }}
        justifyContent="flex-start"
        transition="all 0.2s ease"
        _hover={{
          bg: hoverBg,
          borderColor: hoverBorder,
          color: hoverColor,
          transform: 'translateY(-1px)',
        }}
        _active={{ transform: 'translateY(0)' }}
        _focusVisible={{
          outline: 'none',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)',
        }}
      >
        <HStack w="full" justify="space-between" spacing={3}>
          <Text fontSize="sm">Search transactions</Text>
          <Kbd
            fontSize="2xs"
            fontWeight={700}
            px={1.5}
            py={0.5}
            borderRadius="md"
            bg={hintBg}
            borderColor={hintBorder}
            color={hintColor}
          >
            Ctrl K
          </Kbd>
        </HStack>
      </Button>
    </Box>
  )
}
