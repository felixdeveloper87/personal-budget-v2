import {
  Box,
  Button,
  HStack,
  IconButton,
  Icon,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEd } from '../../../editorial'
import { Search } from '../../ui/icons'

interface SearchTriggerProps {
  onOpen: () => void
  /**
   * `compact` — square icon button. Mobile/tablet.
   * `expanded` — full pill with hint and shortcut. Desktop (lg+).
   */
  variant: 'compact' | 'expanded'
}

export default function SearchTrigger({ onOpen, variant }: SearchTriggerProps) {
  const ed = useEd()
  const bgBase = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.04)')
  const bg = ed ? ed.controlBg : bgBase
  const borderBase = useColorModeValue('rgba(226,232,240,0.8)', 'rgba(255,255,255,0.08)')
  const border = ed ? ed.line : borderBase
  const colorBase = useColorModeValue('gray.500', 'gray.400')
  const color = ed ? ed.muted : colorBase
  const shadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 4px rgba(15,23,42,0.04)',
    'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 4px rgba(0,0,0,0.2)',
  )
  const hoverBgBase = useColorModeValue('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.08)')
  const hoverBg = ed ? ed.controlHoverBg : hoverBgBase
  const hoverBorderBase = useColorModeValue('blue.300', 'blue.400')
  const hoverBorder = ed ? ed.jade : hoverBorderBase
  const hoverColorBase = useColorModeValue('gray.900', 'white')
  const hoverColor = ed ? ed.cream : hoverColorBase
  const hoverShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px rgba(37,99,235,0.12)',
    'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.3)',
  )
  const kbdBgBase = useColorModeValue('rgba(226,232,240,0.7)', 'rgba(255,255,255,0.06)')
  const kbdBg = ed ? ed.controlBg : kbdBgBase
  const kbdBorderBase = useColorModeValue('rgba(203,213,225,0.8)', 'rgba(255,255,255,0.10)')
  const kbdBorder = ed ? ed.line : kbdBorderBase
  const kbdColorBase = useColorModeValue('gray.500', 'gray.500')
  const kbdColor = ed ? ed.muted : kbdColorBase

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
  const shortcut = isMac ? '⌘K' : 'Ctrl K'

  const glassProps = {
    bg,
    border: '1px solid' as const,
    borderColor: border,
    backdropFilter: 'blur(10px)',
    boxShadow: shadow,
    color,
    transition: 'all 0.2s ease',
    _hover: { bg: hoverBg, borderColor: hoverBorder, color: hoverColor, transform: 'translateY(-1px)', boxShadow: hoverShadow },
    _active: { transform: 'translateY(0)' },
    _focusVisible: { outline: 'none', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)' },
  }

  if (variant === 'compact') {
    return (
      <Tooltip label="Search (Ctrl+K)" hasArrow openDelay={300}>
        <IconButton
          aria-label="Open search"
          icon={<Icon as={Search} boxSize={4} weight="bold" />}
          onClick={onOpen}
          variant="ghost"
          h="40px"
          w="40px"
          minW="40px"
          borderRadius="xl"
          {...glassProps}
        />
      </Tooltip>
    )
  }

  return (
    <Box flexShrink={1} minW={0}>
      <Button
        onClick={onOpen}
        leftIcon={<Icon as={Search} boxSize={3.5} weight="bold" />}
        variant="ghost"
        h="40px"
        px={3.5}
        borderRadius="xl"
        fontWeight={500}
        fontSize="sm"
        w={{ lg: '220px', xl: '260px' }}
        justifyContent="flex-start"
        {...glassProps}
      >
        <HStack w="full" justify="space-between" spacing={3}>
          <Text fontSize="sm" color={color}>Search transactions</Text>
          <Box
            display="inline-flex"
            alignItems="center"
            px={1.5}
            py={0.5}
            borderRadius="md"
            bg={kbdBg}
            border="1px solid"
            borderColor={kbdBorder}
            flexShrink={0}
          >
            <Text fontSize="2xs" fontWeight={600} color={kbdColor} letterSpacing="0.03em">
              {shortcut}
            </Text>
          </Box>
        </HStack>
      </Button>
    </Box>
  )
}
