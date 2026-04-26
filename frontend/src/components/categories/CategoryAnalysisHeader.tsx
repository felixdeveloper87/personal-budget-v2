import {
  Button,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { Layers, TrendingDown, TrendingUp } from 'lucide-react'
import { SectionHeader } from '../ui'

interface CategoryAnalysisHeaderProps {
  activeTab: 'expenses' | 'incomes'
  onTabChange: (tab: 'expenses' | 'incomes') => void
}

interface TabPaletteTokens {
  bg: string
  color: string
  border: string
}

interface TabPalette {
  active: TabPaletteTokens
  inactive: TabPaletteTokens
}

export default function CategoryAnalysisHeader({
  activeTab,
  onTabChange,
}: CategoryAnalysisHeaderProps) {
  // Pre-resolve every color token at the top — no hooks inside loops or
  // helper functions, no surprises with the Rules of Hooks.
  const trackBg = useColorModeValue('gray.100', 'whiteAlpha.50')
  const trackBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  const inactiveColor = useColorModeValue('gray.500', 'gray.400')
  const inactiveHoverColor = useColorModeValue('gray.700', 'gray.200')

  const expensePalette: TabPalette = {
    active: {
      bg: useColorModeValue('white', 'whiteAlpha.200'),
      color: useColorModeValue('red.600', 'red.300'),
      border: useColorModeValue('red.200', 'rgba(239,68,68,0.35)'),
    },
    inactive: {
      bg: 'transparent',
      color: inactiveColor,
      border: 'transparent',
    },
  }

  const incomePalette: TabPalette = {
    active: {
      bg: useColorModeValue('white', 'whiteAlpha.200'),
      color: useColorModeValue('green.600', 'green.300'),
      border: useColorModeValue('green.200', 'rgba(34,197,94,0.35)'),
    },
    inactive: {
      bg: 'transparent',
      color: inactiveColor,
      border: 'transparent',
    },
  }

  const tabs: Array<{
    key: 'expenses' | 'incomes'
    label: string
    icon: typeof TrendingDown
    palette: TabPalette
  }> = [
    {
      key: 'expenses',
      label: 'Expenses',
      icon: TrendingDown,
      palette: expensePalette,
    },
    {
      key: 'incomes',
      label: 'Incomes',
      icon: TrendingUp,
      palette: incomePalette,
    },
  ]

  return (
    <Flex
      direction={{ base: 'column', sm: 'row' }}
      align={{ base: 'stretch', sm: 'center' }}
      justify="space-between"
      gap={3}
      w="full"
    >
      <SectionHeader
        icon={Layers}
        title="Categories"
        caption="Breakdown by category for the selected period"
        accent="violet"
      />

      <HStack
        spacing={1}
        p={1}
        bg={trackBg}
        borderRadius="xl"
        border="1px solid"
        borderColor={trackBorder}
        w={{ base: 'full', sm: 'auto' }}
        flexShrink={0}
      >
        {tabs.map(({ key, label, icon, palette }) => {
          const isActive = activeTab === key
          const tokens = isActive ? palette.active : palette.inactive
          return (
            <Button
              key={key}
              size="sm"
              h="32px"
              px={3.5}
              flex={{ base: 1, sm: 'none' }}
              borderRadius="lg"
              fontSize="xs"
              fontWeight={600}
              leftIcon={<Icon as={icon} boxSize={3.5} />}
              bg={tokens.bg}
              color={tokens.color}
              borderWidth="1px"
              borderStyle="solid"
              borderColor={tokens.border}
              boxShadow={
                isActive ? '0 1px 2px rgba(15,23,42,0.06)' : 'none'
              }
              transition="background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease"
              _hover={
                isActive
                  ? undefined
                  : { color: inactiveHoverColor }
              }
              _focusVisible={{
                outline: '2px solid',
                outlineColor: 'blue.300',
                outlineOffset: '2px',
              }}
              onClick={() => onTabChange(key)}
            >
              {label}
            </Button>
          )
        })}
      </HStack>
    </Flex>
  )
}
