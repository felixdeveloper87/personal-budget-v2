import {
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { LucideIcon } from '../ui/icons'
import { ArrowUpRight } from '../ui/icons'

interface SummaryCardProps {
  stat: {
    id: string
    label: string
    icon: LucideIcon
    color: string
    bgColor: string
    darkBgColor: string
    displayValue: string
    helpText: string
    description?: string
  }
  periodMeta: {
    label: string
    detail: string
    accentColor: string
    icon: LucideIcon
  }
  onCardClick: (cardId: string) => void
}

const glowColors: Record<string, string> = {
  transactions: '#3b82f6', // blue
  income: '#10b981', // green
  expenses: '#ef4444', // red
  balance: '#8b5cf6', // purple
}

export default function SummaryCard({ stat, onCardClick }: SummaryCardProps) {
  const IconComponent = stat.icon
  const glowColor = glowColors[stat.id] || '#94a3b8'

  const cardBg = useColorModeValue(
    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    'linear-gradient(135deg, rgba(20, 20, 25, 0.7) 0%, rgba(10, 10, 12, 0.85) 100%)'
  )
  const borderColor = useColorModeValue('rgba(0, 0, 0, 0.06)', 'rgba(255, 255, 255, 0.04)')
  const hoverBorder = useColorModeValue('rgba(0, 0, 0, 0.12)', `${glowColor}40`)
  
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const valueColor = useColorModeValue('gray.900', 'gray.50')
  const helpColor = useColorModeValue('gray.400', 'gray.500')

  const iconBoxBg = useColorModeValue(`${glowColor}12`, `${glowColor}20`)
  const iconColor = useColorModeValue(stat.color, glowColor)

  const baseShadow = useColorModeValue(
    '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
    '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
  )
  const hoverShadow = useColorModeValue(
    '0 16px 36px -12px rgba(15, 23, 42, 0.12)',
    `0 16px 36px -12px ${glowColor}25`
  )

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onCardClick(stat.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onCardClick(stat.id)
        }
      }}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      cursor="pointer"
      position="relative"
      overflow="hidden"
      boxShadow={baseShadow}
      backdropFilter="blur(20px)"
      transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={{
        borderColor: hoverBorder,
        boxShadow: hoverShadow,
        transform: 'translateY(-3px)',
        '& .summary-card-bottom-line': {
          height: '3px',
          opacity: 0.8,
        },
        '& .summary-card-glow': {
          opacity: useColorModeValue(0.08, 0.12),
          transform: 'scale(1.2) translate(5px, 5px)',
        },
        '& .summary-card-arrow': {
          color: glowColor,
          transform: 'translate(2px, -2px)',
        }
      }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: glowColor,
        outlineOffset: '2px',
      }}
      aria-label={`${stat.label}: ${stat.displayValue}`}
    >
      {/* Glow effect in the background */}
      <Box
        className="summary-card-glow"
        position="absolute"
        top="-40px"
        right="-40px"
        w="120px"
        h="120px"
        borderRadius="full"
        bg={glowColor}
        opacity={useColorModeValue(0.03, 0.06)}
        filter="blur(28px)"
        pointerEvents="none"
        transition="opacity 0.4s ease, transform 0.4s ease"
      />

      {/* Main card body with responsive padding */}
      <Box p={{ base: 3, sm: 4, md: 5 }}>
        <VStack align="stretch" spacing={{ base: 2, sm: 3, md: 4 }}>
          {/* Top Row: Icon + Label + Arrow */}
          <HStack justify="space-between" align="center" w="full">
            <HStack spacing={2} align="center" minW={0}>
              <Flex
                w={{ base: 7, sm: 8, md: 9 }}
                h={{ base: 7, sm: 8, md: 9 }}
                align="center"
                justify="center"
                borderRadius="lg"
                bg={iconBoxBg}
                color={iconColor}
                flexShrink={0}
                p={{ base: 1.5, md: 2 }}
              >
                <IconComponent
                  size="100%"
                  weight="duotone"
                />
              </Flex>
              <Text
                fontSize={{ base: '2xs', md: 'xs' }}
                fontWeight={700}
                color={labelColor}
                textTransform="uppercase"
                letterSpacing="0.08em"
                noOfLines={1}
              >
                {stat.label}
              </Text>
            </HStack>

            <Box
              className="summary-card-arrow"
              color="gray.500"
              opacity={0.6}
              transition="all 0.25s ease"
              flexShrink={0}
            >
              <ArrowUpRight size="14px" />
            </Box>
          </HStack>

          {/* Value and details */}
          <VStack align="flex-start" spacing={0.5} w="full">
            <Text
              fontSize={{ base: 'md', sm: 'xl', md: '2xl', lg: '3xl' }}
              fontWeight={800}
              color={valueColor}
              lineHeight="1.1"
              letterSpacing="-0.03em"
              noOfLines={1}
            >
              {stat.displayValue}
            </Text>
            {stat.helpText && (
              <Text
                fontSize={{ base: '10px', md: 'xs' }}
                color={helpColor}
                fontWeight={500}
                noOfLines={1}
                opacity={0.8}
              >
                {stat.helpText}
              </Text>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* Decorative interactive bottom glow bar */}
      <Box
        className="summary-card-bottom-line"
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="2px"
        bg={glowColor}
        opacity={0.3}
        transition="all 0.25s ease"
      />
    </Box>
  )
}
