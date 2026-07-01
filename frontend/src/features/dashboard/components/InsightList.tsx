import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { AlertTriangle, Calendar, Gauge, Receipt, Store, TrendingDown } from 'lucide-react'
import Panel from './Panel'
import type { AppPage } from '../../../components/layout/header/navigation.config'

export interface InsightItem {
  id: string
  severity: 'attention' | 'info'
  tag: string
  title: string
  valueLabel?: string
  description: string
  href: AppPage | null
  icon: 'warn' | 'calendar' | 'trend-down' | 'store' | 'gauge' | 'receipt'
}

interface InsightListProps {
  insights: InsightItem[]
  onPageChange?: (page: AppPage) => void
}

const ICONS = {
  warn: AlertTriangle,
  calendar: Calendar,
  'trend-down': TrendingDown,
  store: Store,
  gauge: Gauge,
  receipt: Receipt,
}

const ICON_COLORS = {
  attention: 'var(--pb-coral)',
  info: 'var(--pb-gold)',
}

export default function InsightList({ insights, onPageChange }: InsightListProps) {
  return (
    <Panel h="full">
      <VStack align="stretch" spacing={4}>
        {/* Header */}
        <HStack justify="space-between">
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            For you
          </Text>
          {insights.length > 0 && (
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10px"
              letterSpacing="0.12em"
              color="var(--pb-ink-faint)"
            >
              {insights.length} insight{insights.length !== 1 ? 's' : ''}
            </Text>
          )}
        </HStack>

        {/* Editorial list */}
        <VStack align="stretch" spacing={0} divider={<Box borderBottom="1px solid var(--pb-hair)" />}>
          {insights.length === 0 ? (
            <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={3}>
              No insights for this period.
            </Text>
          ) : (
            insights.map((item) => (
              <InsightRow key={item.id} item={item} onPageChange={onPageChange} />
            ))
          )}
        </VStack>
      </VStack>
    </Panel>
  )
}

interface InsightRowProps {
  item: InsightItem
  onPageChange?: (page: AppPage) => void
}

function InsightRow({ item, onPageChange }: InsightRowProps) {
  const Icon = ICONS[item.icon]
  const iconColor = ICON_COLORS[item.severity]
  const isClickable = !!item.href && !!onPageChange

  return (
    <Box
      as={isClickable ? 'button' : 'div'}
      w="full"
      textAlign="left"
      cursor={isClickable ? 'pointer' : 'default'}
      borderRadius="8px"
      px={2}
      mx={-2}
      transition="background 0.15s"
      _hover={isClickable ? { bg: 'var(--pb-tint-green)' } : undefined}
      onClick={
        isClickable && item.href
          ? () => onPageChange?.(item.href as AppPage)
          : undefined
      }
    >
    <HStack
      align="flex-start"
      spacing={3}
      py={4}
      w="full"
      justify="space-between"
    >
      <HStack align="flex-start" spacing={3} flex={1}>
        {/* Icon tile */}
        <Box
          w={8}
          h={8}
          borderRadius="10px"
          bg={item.severity === 'attention' ? 'var(--pb-tint-coral)' : 'var(--pb-tint-gold)'}
          border="1px solid var(--pb-hair)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          mt="2px"
        >
          <Icon size={14} color={iconColor} />
        </Box>

        {/* Body */}
        <VStack align="stretch" spacing={0.5} flex={1}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            letterSpacing="0.16em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            {item.tag}
          </Text>
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink)" fontWeight={500} lineHeight={1.35}>
            {item.title}
            {item.valueLabel && (
              <Text
                as="span"
                fontFamily="var(--pb-mono)"
                fontSize="12px"
                color="var(--pb-coral)"
                ml={2}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {item.valueLabel}
              </Text>
            )}
          </Text>
          <Text fontFamily="var(--pb-serif)" fontSize="xs" color="var(--pb-ink-soft)" lineHeight={1.5}>
            {item.description}
          </Text>
        </VStack>
      </HStack>

      {/* Arrow affordance */}
      {isClickable && (
        <Box
          w={7}
          h={7}
          borderRadius="999px"
          border="1px solid var(--pb-hair)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          color="var(--pb-ink-faint)"
          fontSize="14px"
          transition="transform 0.15s"
          _groupHover={{ transform: 'translateX(2px)' }}
          mt="6px"
        >
          →
        </Box>
      )}
    </HStack>
    </Box>
  )
}
