import {
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'

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

export default function SummaryCard({ stat, onCardClick }: SummaryCardProps) {
  const IconComponent = stat.icon

  const cardBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const hoverBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const valueColor = useColorModeValue('gray.900', 'gray.50')
  const helpColor = useColorModeValue('gray.500', 'gray.500')

  const iconBoxBg = useColorModeValue(stat.bgColor, stat.darkBgColor)
  const baseShadow = useColorModeValue(
    '0 1px 2px rgba(15,23,42,0.04)',
    '0 1px 0 rgba(255,255,255,0.04)',
  )
  const hoverShadow = useColorModeValue(
    '0 8px 24px -8px rgba(15,23,42,0.12), 0 2px 4px rgba(15,23,42,0.04)',
    '0 8px 24px -8px rgba(0,0,0,0.6)',
  )
  const arrowIdleColor = useColorModeValue('gray.400', 'gray.500')

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
      transition="border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease"
      _hover={{
        borderColor: hoverBorder,
        boxShadow: hoverShadow,
        transform: 'translateY(-2px)',
      }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: stat.color,
        outlineOffset: '2px',
      }}
      aria-label={`${stat.label}: ${stat.displayValue}`}
      sx={{
        '&:hover .summary-card-arrow': {
          color: stat.color,
          transform: 'translate(2px, -2px)',
        },
      }}
    >
      <Box p={5}>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="flex-start">
            <Flex
              w={10}
              h={10}
              align="center"
              justify="center"
              borderRadius="xl"
              bg={iconBoxBg}
              color={stat.color}
              flexShrink={0}
            >
              <Icon as={IconComponent} boxSize={5} strokeWidth={2.25} />
            </Flex>
            <Icon
              as={ArrowUpRight}
              className="summary-card-arrow"
              boxSize={4}
              color={arrowIdleColor}
              transition="color 0.18s ease, transform 0.18s ease"
            />
          </HStack>

          <VStack align="flex-start" spacing={1}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color={labelColor}
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {stat.label}
            </Text>
            <Text
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight={800}
              color={valueColor}
              lineHeight="1.1"
              letterSpacing="-0.02em"
              noOfLines={1}
            >
              {stat.displayValue}
            </Text>
            {stat.helpText && (
              <Text fontSize="xs" color={helpColor} fontWeight={500} noOfLines={1}>
                {stat.helpText}
              </Text>
            )}
          </VStack>
        </VStack>
      </Box>
    </Box>
  )
}
