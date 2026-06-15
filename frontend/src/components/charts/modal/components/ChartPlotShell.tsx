import type { ReactNode } from 'react'
import {
  Badge,
  Box,
  HStack,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEd } from '../../../../editorial'

export interface ChartPlotShellProps {
  /** Short label above the plot (subsection under the page shell). */
  title: string
  caption?: string
  selectedPeriod?: string
  /** When false, the period pill is omitted (parent already shows it). */
  showPeriodBadge?: boolean
  badgeBg?: string
  badgeColor?: string
  compact?: boolean
  children: ReactNode
}

/**
 * Inset “plot” surface: subtle fill + border so charts feel anchored, not
 * floating in whitespace.
 */
export default function ChartPlotShell({
  title,
  caption,
  selectedPeriod,
  showPeriodBadge = true,
  badgeBg,
  badgeColor,
  compact = false,
  children,
}: ChartPlotShellProps) {
  const ed = useEd()
  const surfaceBgBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  // Superfície inset translúcida (ed.panelRaised) — card aninhado, consistente.
  const surfaceBg = ed ? ed.panelRaised : surfaceBgBase
  const surfaceBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.800', 'gray.100')
  const captionColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <Box
      borderRadius="xl"
      border="1px solid"
      borderColor={surfaceBorder}
      bg={surfaceBg}
      p={compact ? { base: 3, sm: 4 } : { base: 4, sm: 5 }}
    >
      <HStack
        justify="space-between"
        align="flex-start"
        spacing={3}
        mb={compact ? 2 : 4}
      >
        <Stack
          align="flex-start"
          spacing={compact ? 0 : 0.5}
          minW={0}
          direction={compact ? 'row' : 'column'}
        >
          <Text
            fontSize="sm"
            fontWeight={700}
            color={titleColor}
            letterSpacing="0.05em"
            textTransform="uppercase"
            noOfLines={2}
          >
            {title}
          </Text>
          {caption && (
            <Text
              fontSize="xs"
              color={captionColor}
              fontWeight={500}
              noOfLines={compact ? 1 : 2}
              ml={compact ? 2 : 0}
              _before={compact ? { content: '"·"', mr: 2 } : undefined}
            >
              {caption}
            </Text>
          )}
        </Stack>
        {showPeriodBadge && selectedPeriod && badgeBg && badgeColor && (
          <Badge
            flexShrink={0}
            px={2.5}
            py={1}
            borderRadius="full"
            bg={badgeBg}
            color={badgeColor}
            fontSize="xs"
            fontWeight={700}
            textTransform="uppercase"
            letterSpacing="0.04em"
          >
            {selectedPeriod}
          </Badge>
        )}
      </HStack>
      {children}
    </Box>
  )
}
